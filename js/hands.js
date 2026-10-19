// ============================================================
// COSMIC DRIFT WEB — MEDIAPIPE HANDS WEB (hands.js)
// Seguimiento de 1 mano, 21 landmarks, imagen espejo, centro de palma y proximidad
// ============================================================

import {
    PALM_POINTS,
    HAND_ALPHA,
    GAME_X,
    GAME_WIDTH,
    GAME_HEIGHT,
    SCREEN_WIDTH,
    CAMERA_DISPLAY_WIDTH,
    CAMERA_DISPLAY_HEIGHT,
    ema,
    clamp
} from "./config.js";
import {
    detectGesture,
    updateStableGesture,
    resetGesture
} from "./gestures.js";

// Conexiones estándar de los 21 landmarks de MediaPipe Hands
export const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],           // Pulgar
    [0, 5], [5, 6], [6, 7], [7, 8],           // Índice
    [5, 9], [9, 10], [10, 11], [11, 12],      // Medio
    [9, 13], [13, 14], [14, 15], [15, 16],    // Anular
    [13, 17], [17, 18], [18, 19], [19, 20],   // Meñique
    [0, 17]                                   // Base de palma
];

function distance2DLandmarks(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Calcula el centro aproximado de la palma promediando los puntos [0, 5, 9, 13, 17]
 */
export function getPalmCenter(mirroredLandmarks) {
    let sumX = 0;
    let sumY = 0;
    for (const idx of PALM_POINTS) {
        sumX += mirroredLandmarks[idx].x;
        sumY += mirroredLandmarks[idx].y;
    }
    return {
        x: sumX / PALM_POINTS.length,
        y: sumY / PALM_POINTS.length
    };
}

/**
 * Calcula el tamaño aparente de la palma como aproximación de proximidad:
 * promedio entre largo vertical (0 -> 9) y ancho horizontal (5 -> 17)
 */
export function getPalmSize(mirroredLandmarks) {
    const vertical = distance2DLandmarks(mirroredLandmarks[0], mirroredLandmarks[9]);
    const horizontal = distance2DLandmarks(mirroredLandmarks[5], mirroredLandmarks[17]);
    return (vertical + horizontal) / 2;
}

class HandTracker {
    constructor() {
        this.handLandmarker = null;
        this.isReady = false;
        this.lastVideoTime = -1;

        // Estado suavizado idéntico a fase2_cosmic_drift.py
        this.smoothX = null;
        this.smoothY = null;
        this.smoothProximity = null;
        this.handDetected = false;
        this.mirroredLandmarks = null;

        this.targetX = GAME_X + Math.floor(GAME_WIDTH / 2);
        this.targetY = Math.floor(GAME_HEIGHT / 2);

        // Canvas auxiliar para renderizar la minicámara con espejo + landmarks
        this.handCanvas = null;
        this.handCtx = null;
    }

    /**
     * Inicializa MediaPipe Tasks Vision (HandLandmarker) para Web
     */
    async init(handCanvasElement) {
        this.handCanvas = handCanvasElement;
        if (this.handCanvas) {
            this.handCanvas.width = CAMERA_DISPLAY_WIDTH;
            this.handCanvas.height = CAMERA_DISPLAY_HEIGHT;
            this.handCtx = this.handCanvas.getContext("2d");
        }

        try {
            const visionModule = await import(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs"
            );
            const { FilesetResolver, HandLandmarker } = visionModule;

            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
            );

            try {
                this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1,
                    minHandDetectionConfidence: 0.6,
                    minHandPresenceConfidence: 0.6,
                    minTrackingConfidence: 0.6
                });
            } catch (gpuErr) {
                // Fallback a CPU si WebGL/GPU no está disponible
                this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                        delegate: "CPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1,
                    minHandDetectionConfidence: 0.6,
                    minHandPresenceConfidence: 0.6,
                    minTrackingConfidence: 0.6
                });
            }

            this.isReady = true;
            return true;
        } catch (err) {
            console.error("Error cargando MediaPipe Tasks Vision:", err);
            this.isReady = false;
            return false;
        }
    }

    /**
     * Reinicia las variables de seguimiento (al iniciar o reiniciar partida)
     */
    reset() {
        this.smoothX = null;
        this.smoothY = null;
        this.smoothProximity = null;
        this.handDetected = false;
        this.mirroredLandmarks = null;
        this.targetX = GAME_X + Math.floor(GAME_WIDTH / 2);
        this.targetY = Math.floor(GAME_HEIGHT / 2);
        resetGesture();
    }

    /**
     * Procesa el frame actual de la cámara con MediaPipe y actualiza posición, proximidad y gestos
     */
    processVideoFrame(videoElement, timestampMs) {
        if (!this.isReady || !this.handLandmarker || !videoElement) {
            return;
        }

        if (videoElement.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = videoElement.currentTime;

            let results = null;
            try {
                results = this.handLandmarker.detectForVideo(videoElement, timestampMs);
            } catch (err) {
                return;
            }

            this.handDetected = false;
            this.mirroredLandmarks = null;

            if (results && results.landmarks && results.landmarks.length > 0) {
                const rawLandmarks = results.landmarks[0];

                // Invertimos X (1 - handX) para que coincida con la imagen espejo (cv2.flip(frame, 1))
                const mirrored = rawLandmarks.map((lm) => ({
                    x: 1.0 - lm.x,
                    y: lm.y,
                    z: lm.z
                }));

                this.mirroredLandmarks = mirrored;

                // Detectar y estabilizar gesto
                const detectedGesture = detectGesture(mirrored);
                updateStableGesture(detectedGesture);

                // Centro de la palma y tamaño aparente (proximidad)
                const rawCenter = getPalmCenter(mirrored);
                const rawProximity = getPalmSize(mirrored);

                this.smoothX = ema(rawCenter.x, this.smoothX, HAND_ALPHA);
                this.smoothY = ema(rawCenter.y, this.smoothY, HAND_ALPHA);
                this.smoothProximity = ema(rawProximity, this.smoothProximity, HAND_ALPHA);

                // Convertir coordenadas normalizadas a dimensiones del área de juego
                const rawTargetX = GAME_X + this.smoothX * GAME_WIDTH;
                const rawTargetY = this.smoothY * GAME_HEIGHT;

                this.targetX = clamp(rawTargetX, GAME_X + 45, SCREEN_WIDTH - 45);
                this.targetY = clamp(rawTargetY, 45, GAME_HEIGHT - 45);

                this.handDetected = true;
            } else {
                resetGesture();
            }
        }
    }

    /**
     * Dibuja el video en espejo y los 21 landmarks sobre el canvas de cámara
     * con los mismos colores de HAND_LANDMARK_STYLE y HAND_CONNECTION_STYLE en Python.
     */
    renderCameraSurface(videoElement) {
        if (!this.handCtx || !this.handCanvas) return null;

        const ctx = this.handCtx;
        const w = this.handCanvas.width;
        const h = this.handCanvas.height;

        ctx.clearRect(0, 0, w, h);

        if (videoElement && videoElement.readyState >= 2) {
            // Dibujar video en espejo horizontal
            ctx.save();
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoElement, 0, 0, w, h);
            ctx.restore();
        } else {
            ctx.fillStyle = "rgb(12, 12, 18)";
            ctx.fillRect(0, 0, w, h);
        }

        // Dibujar conexiones y los 21 puntos de referencia si hay mano detectada
        if (this.handDetected && this.mirroredLandmarks) {
            // En Python: HAND_CONNECTION_STYLE color=(80, 220, 255) en BGR -> RGB(255, 220, 80)
            ctx.strokeStyle = "rgb(255, 220, 80)";
            ctx.lineWidth = 2;

            for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
                const p1 = this.mirroredLandmarks[startIdx];
                const p2 = this.mirroredLandmarks[endIdx];
                ctx.beginPath();
                ctx.moveTo(p1.x * w, p1.y * h);
                ctx.lineTo(p2.x * w, p2.y * h);
                ctx.stroke();
            }

            // En Python: HAND_LANDMARK_STYLE color=(255, 180, 220) en BGR -> RGB(220, 180, 255)
            for (const lm of this.mirroredLandmarks) {
                const px = lm.x * w;
                const py = lm.y * h;

                ctx.beginPath();
                ctx.arc(px, py, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = "rgb(220, 180, 255)";
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = "rgb(255, 245, 255)";
                ctx.stroke();
            }
        }

        return this.handCanvas;
    }
}

export const handTracker = new HandTracker();
