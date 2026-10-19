// ============================================================
// COSMIC DRIFT WEB — INICIALIZACIÓN GENERAL (main.js)
// Precarga recursos (imágenes, audio, historial, cámara y MediaPipe) e inicia el juego
// ============================================================

import { audioManager } from "./audio.js";
import { initStorage, getHistorySummary } from "./storage.js";
import { cameraManager } from "./camera.js";
import { handTracker } from "./hands.js";
import { CosmicDriftGame } from "./game.js";

async function bootstrapCosmicDrift() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    const loadingStatus = document.getElementById("loadingStatus");
    const gameCanvas = document.getElementById("gameCanvas");
    const cameraVideo = document.getElementById("camera");
    const handCanvas = document.getElementById("handCanvas");
    const startButton = document.getElementById("startGame");
    const fullscreenButton = document.getElementById("fullscreenBtn");

    const setStatus = (msg) => {
        if (loadingStatus) {
            loadingStatus.textContent = msg;
        }
    };

    const game = new CosmicDriftGame(gameCanvas, cameraVideo, handCanvas);

    // 1. Inicializar historial (localStorage + semilla CSV)
    setStatus("Cargando historial cósmico...");
    await initStorage();
    game.historySummary = getHistorySummary();

    // 2. Precargar imágenes y efectos de audio en paralelo
    setStatus("Cargando gráficos y audio de Cosmic Drift...");
    await Promise.all([
        game.preloadImages(),
        audioManager.preloadAll()
    ]);

    // 3. Inicializar modelo MediaPipe HandLandmarker y cámara
    setStatus("Inicializando MediaPipe Hands y cámara...");
    await Promise.all([
        handTracker.init(handCanvas),
        cameraManager.initCamera(cameraVideo)
    ]);

    // 4. Vincular botones DOM opcionales
    if (startButton) {
        startButton.addEventListener("click", () => {
            game.iniciarPartida();
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener("click", () => {
            game.toggleFullscreen();
        });
    }

    // 5. Ocultar pantalla de precarga e iniciar el ciclo principal (requestAnimationFrame)
    if (loadingOverlay) {
        loadingOverlay.classList.add("loaded");
        setTimeout(() => {
            loadingOverlay.style.display = "none";
        }, 350);
    }

    game.syncStartButtonDOM();
    game.startLoop();

    // Exponer instancia globalmente para depuración o pruebas
    window.cosmicDriftGame = game;
}

window.addEventListener("DOMContentLoaded", bootstrapCosmicDrift);
