// ============================================================
// COSMIC DRIFT WEB — CÁMARA DEL USUARIO (camera.js)
// Sustituye cv2.VideoCapture(0) por navigator.mediaDevices.getUserMedia
// ============================================================

import { CAMERA_CAPTURE_WIDTH, CAMERA_CAPTURE_HEIGHT } from "./config.js";

class CameraManager {
    constructor() {
        this.videoElement = null;
        this.stream = null;
        this.isReady = false;
        this.errorMessage = null;
    }

    /**
     * Solicita permisos y abre la cámara del navegador en el elemento <video id="camera">
     */
    async initCamera(videoElement) {
        this.videoElement = videoElement;

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.errorMessage = "Tu navegador no soporta acceso a cámara (getUserMedia).";
            console.warn(this.errorMessage);
            return false;
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: CAMERA_CAPTURE_WIDTH },
                    height: { ideal: CAMERA_CAPTURE_HEIGHT },
                    facingMode: "user"
                },
                audio: false
            });

            this.videoElement.srcObject = this.stream;
            this.videoElement.setAttribute("playsinline", "true");
            this.videoElement.muted = true;

            await new Promise((resolve) => {
                const onLoaded = () => {
                    this.videoElement.removeEventListener("loadedmetadata", onLoaded);
                    resolve();
                };
                if (this.videoElement.readyState >= 1) {
                    resolve();
                } else {
                    this.videoElement.addEventListener("loadedmetadata", onLoaded);
                }
            });

            await this.videoElement.play();
            this.isReady = true;
            this.errorMessage = null;
            return true;
        } catch (err) {
            console.warn("No se pudo abrir la cámara:", err);
            this.isReady = false;
            this.errorMessage = "Permiso de cámara denegado o cámara no disponible.";
            return false;
        }
    }

    /**
     * Verifica si el video tiene un frame listo para ser procesado.
     */
    hasFrame() {
        return (
            this.isReady &&
            this.videoElement &&
            this.videoElement.readyState >= 2 &&
            this.videoElement.videoWidth > 0 &&
            this.videoElement.videoHeight > 0
        );
    }

    /**
     * Detiene la cámara si es necesario liberar recursos.
     */
    stopCamera() {
        if (this.stream) {
            for (const track of this.stream.getTracks()) {
                track.stop();
            }
            this.stream = null;
        }
        this.isReady = false;
    }
}

export const cameraManager = new CameraManager();
