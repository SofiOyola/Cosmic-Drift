// ============================================================
// COSMIC DRIFT WEB — DETECCIÓN DE GESTOS (gestures.js)
// Puño (disparo), Dos dedos (escudo), Mano abierta y Proximidad
// ============================================================

import {
    GESTURE_OPEN,
    GESTURE_FIST,
    GESTURE_PEACE,
    GESTURE_UNKNOWN,
    GESTURE_CONFIRM_FRAMES,
    PROX_TURBO_ON,
    PROX_TURBO_OFF
} from "./config.js";

let currentGesture = GESTURE_UNKNOWN;
let gestureCandidate = GESTURE_UNKNOWN;
let gestureCandidateFrames = 0;

/**
 * Determina si un dedo está extendido comparando la coordenada Y
 * de la punta (tipId) frente a la articulación PIP (pipId).
 */
export function fingerExtended(landmarks, tipId, pipId) {
    if (!landmarks || !landmarks[tipId] || !landmarks[pipId]) {
        return false;
    }
    return landmarks[tipId].y < landmarks[pipId].y;
}

/**
 * Detecta si la mano está en gesto de Puño cerrado (disparo).
 */
export function detectarPuno(landmarks) {
    if (!landmarks) return false;
    const indexOpen = fingerExtended(landmarks, 8, 6);
    const middleOpen = fingerExtended(landmarks, 12, 10);
    const ringOpen = fingerExtended(landmarks, 16, 14);
    const pinkyOpen = fingerExtended(landmarks, 20, 18);

    return !indexOpen && !middleOpen && !ringOpen && !pinkyOpen;
}

/**
 * Detecta si la mano tiene dos dedos levantados (índice y medio) para el Escudo Astral.
 */
export function detectarGestoEscudo(landmarks) {
    if (!landmarks) return false;
    const indexOpen = fingerExtended(landmarks, 8, 6);
    const middleOpen = fingerExtended(landmarks, 12, 10);
    const ringOpen = fingerExtended(landmarks, 16, 14);
    const pinkyOpen = fingerExtended(landmarks, 20, 18);

    return indexOpen && middleOpen && !ringOpen && !pinkyOpen;
}

/**
 * Detecta si la mano está completamente abierta.
 */
export function detectarManoAbierta(landmarks) {
    if (!landmarks) return false;
    const indexOpen = fingerExtended(landmarks, 8, 6);
    const middleOpen = fingerExtended(landmarks, 12, 10);
    const ringOpen = fingerExtended(landmarks, 16, 14);
    const pinkyOpen = fingerExtended(landmarks, 20, 18);

    return indexOpen && middleOpen && ringOpen && pinkyOpen;
}

/**
 * Clasifica el gesto instantáneo de la mano (idéntico a detect_gesture en Python).
 */
export function detectGesture(landmarks) {
    if (!landmarks) return GESTURE_UNKNOWN;

    if (detectarPuno(landmarks)) {
        return GESTURE_FIST;
    }

    if (detectarGestoEscudo(landmarks)) {
        return GESTURE_PEACE;
    }

    if (detectarManoAbierta(landmarks)) {
        return GESTURE_OPEN;
    }

    return GESTURE_UNKNOWN;
}

/**
 * Estabiliza el gesto exigiendo GESTURE_CONFIRM_FRAMES frames consecutivos.
 */
export function updateStableGesture(detectedGesture) {
    if (detectedGesture === gestureCandidate) {
        gestureCandidateFrames += 1;
    } else {
        gestureCandidate = detectedGesture;
        gestureCandidateFrames = 1;
    }

    if (gestureCandidateFrames >= GESTURE_CONFIRM_FRAMES) {
        currentGesture = gestureCandidate;
    }

    return currentGesture;
}

/**
 * Reinicia el estado de gestos cuando no se detecta mano o al reiniciar partida.
 */
export function resetGesture() {
    currentGesture = GESTURE_UNKNOWN;
    gestureCandidate = GESTURE_UNKNOWN;
    gestureCandidateFrames = 0;
}

/**
 * Obtiene el gesto estabilizado actual.
 */
export function getCurrentGesture() {
    return currentGesture;
}

/**
 * Traduce el identificador del gesto al texto en español del HUD.
 */
export function getGestureName(gesture) {
    if (gesture === GESTURE_OPEN) return "Mano abierta";
    if (gesture === GESTURE_FIST) return "Puño";
    if (gesture === GESTURE_PEACE) return "Dos dedos";
    return "Sin gesto";
}

/**
 * Evalúa el Impulso Cósmico (Turbo) por proximidad con histéresis
 * (ON >= 0.30, OFF <= 0.26) igual que en fase2_cosmic_drift.py
 */
export function evaluarImpulsoCosmico(handDetected, smoothProximity, currentTurboState) {
    if (!handDetected || smoothProximity === null || smoothProximity === undefined) {
        return false;
    }

    if (!currentTurboState && smoothProximity >= PROX_TURBO_ON) {
        return true;
    }

    if (currentTurboState && smoothProximity <= PROX_TURBO_OFF) {
        return false;
    }

    return currentTurboState;
}
