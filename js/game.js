// ============================================================
// COSMIC DRIFT WEB — LÓGICA PRINCIPAL Y CICLO DE JUEGO (game.js)
// Coordina estados, cámara, MediaPipe, gestos, entidades, audio y renderizado
// ============================================================

import {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    GAME_X,
    GAME_Y,
    GAME_WIDTH,
    GAME_HEIGHT,
    GameState,
    MEDIAPIPE_EVERY_N_FRAMES,
    GESTURE_FIST,
    GESTURE_PEACE,
    SHOT_COOLDOWN_MS,
    RED_ENEMY_START_LEVEL,
    ASSETS,
    BUTTONS,
    getLevel,
    getDamageForLevel,
    getDifficultyConfig,
    clamp
} from "./config.js";
import { pointInRect } from "./collisions.js";
import { audioManager } from "./audio.js";
import {
    saveGameHistory,
    getHistorySummary
} from "./storage.js";
import { cameraManager } from "./camera.js";
import { handTracker } from "./hands.js";
import {
    getCurrentGesture,
    evaluarImpulsoCosmico
} from "./gestures.js";
import { player, drawShip } from "./player.js";
import {
    createProjectile,
    updateProjectiles,
    drawProjectile
} from "./projectiles.js";
import {
    createOrbsPool,
    updateOrbs,
    drawOrb
} from "./orbs.js";
import {
    createObstaclesPool,
    createRedEnemy,
    updatePurpleObstacles,
    updateRedEnemy,
    drawObstacle,
    drawRedEnemy
} from "./enemies.js";
import {
    drawLeftPanelBackground,
    drawInfoCards,
    drawCameraCard,
    drawLegend,
    drawMenuScreen,
    drawCountdown,
    drawGameOver,
    drawHistoryCard,
    drawAstronautCatCard
} from "./ui.js";

export class CosmicDriftGame {
    constructor(canvas, videoElement, handCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.videoElement = videoElement;
        this.handCanvasElement = handCanvasElement;

        // Resolución lógica fija 1280 x 720
        this.canvas.width = SCREEN_WIDTH;
        this.canvas.height = SCREEN_HEIGHT;

        // Imágenes precargadas
        this.images = {
            background: null,
            ship: null,
            flower: null,
            astronautCat: null
        };

        // Estado de partida
        this.gameState = GameState.MENU;
        this.score = 0;
        this.level = 1;

        this.orbs = createOrbsPool();
        this.obstacles = createObstaclesPool();
        this.redEnemy = createRedEnemy();
        this.projectiles = [];

        this.lastShotTime = 0;
        this.countdownStartTime = null;
        this.countdownSeconds = 3;
        this.countdownValue = null;

        this.playStartTime = null;
        this.finalDuration = 0.0;
        this.gameOverSaved = false;

        this.historySummary = getHistorySummary();
        this.cameraSurface = null;
        this.frameCounter = 0;
        this.lastFrameTime = null;

        // Estado de ratón para hover/clics en botones del Canvas
        this.mousePos = { x: -1, y: -1 };
        this.hoverStart = false;
        this.hoverRetry = false;
        this.hoverQuit = false;

        this.bindEvents();
    }

    /**
     * Precarga todas las imágenes del juego
     */
    async preloadImages() {
        const loadImage = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => {
                    console.warn(`ADVERTENCIA: no se pudo cargar la imagen ${src}`);
                    resolve(null);
                };
                img.src = src;
            });
        };

        const [background, ship, flower, astronautCat] = await Promise.all([
            loadImage(ASSETS.background),
            loadImage(ASSETS.ship),
            loadImage(ASSETS.flower),
            loadImage(ASSETS.astronautCat)
        ]);

        this.images.background = background;
        this.images.ship = ship;
        this.images.flower = flower;
        this.images.astronautCat = astronautCat;
    }

    /**
     * Convierte coordenadas de evento de ratón/touch a coordenadas lógicas (1280x720)
     */
    getCanvasCoords(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = SCREEN_WIDTH / rect.width;
        const scaleY = SCREEN_HEIGHT / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    /**
     * Registra eventos de ratón, toque y teclado
     */
    bindEvents() {
        this.canvas.addEventListener("mousemove", (e) => {
            this.mousePos = this.getCanvasCoords(e.clientX, e.clientY);
            this.updateHoverStates();
        });

        this.canvas.addEventListener("mouseleave", () => {
            this.mousePos = { x: -1, y: -1 };
            this.updateHoverStates();
        });

        this.canvas.addEventListener("click", (e) => {
            const pos = this.getCanvasCoords(e.clientX, e.clientY);
            this.handlePointerClick(pos.x, pos.y);
        });

        this.canvas.addEventListener(
            "touchstart",
            (e) => {
                if (e.touches && e.touches.length > 0) {
                    const pos = this.getCanvasCoords(
                        e.touches[0].clientX,
                        e.touches[0].clientY
                    );
                    this.handlePointerClick(pos.x, pos.y);
                }
            },
            { passive: true }
        );

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                if (this.gameState === GameState.PLAYING || this.gameState === GameState.COUNTDOWN) {
                    audioManager.stopBackgroundMusic();
                    this.gameState = GameState.MENU;
                    this.syncStartButtonDOM();
                }
            } else if (e.key === "f" || e.key === "F") {
                this.toggleFullscreen();
            }
        });
    }

    /**
     * Actualiza el cursor y el estado hover de los botones según la pantalla activa
     */
    updateHoverStates() {
        const { x, y } = this.mousePos;
        this.hoverStart =
            this.gameState === GameState.MENU && pointInRect(x, y, BUTTONS.start);
        this.hoverRetry =
            this.gameState === GameState.GAME_OVER && pointInRect(x, y, BUTTONS.retry);
        this.hoverQuit =
            this.gameState === GameState.GAME_OVER && pointInRect(x, y, BUTTONS.quit);

        const anyHover = this.hoverStart || this.hoverRetry || this.hoverQuit;
        this.canvas.style.cursor = anyHover ? "pointer" : "default";
    }

    /**
     * Gestiona clics en los botones del menú y de Game Over
     */
    handlePointerClick(x, y) {
        if (this.gameState === GameState.MENU) {
            if (pointInRect(x, y, BUTTONS.start)) {
                this.iniciarPartida();
            }
        } else if (this.gameState === GameState.GAME_OVER) {
            if (pointInRect(x, y, BUTTONS.retry)) {
                this.reiniciarPartida();
            } else if (pointInRect(x, y, BUTTONS.quit)) {
                audioManager.stopBackgroundMusic();
                this.resetGame();
                this.gameState = GameState.MENU;
                this.syncStartButtonDOM();
                this.updateHoverStates();
            }
        }
    }

    /**
     * Sincroniza la visibilidad del botón accesible #startGame si existe en el DOM
     */
    syncStartButtonDOM() {
        const startBtn = document.getElementById("startGame");
        if (!startBtn) return;
        if (this.gameState === GameState.MENU) {
            startBtn.classList.remove("hidden");
        } else {
            startBtn.classList.add("hidden");
        }
    }

    /**
     * Restablece todas las variables del juego (equivalente a reset_game() en Python)
     */
    resetGame() {
        player.reset();
        this.score = 0;
        this.level = 1;

        this.orbs = createOrbsPool();
        this.obstacles = createObstaclesPool();
        this.redEnemy = createRedEnemy();
        this.projectiles = [];

        this.lastShotTime = 0;
        this.gameOverSaved = false;
        this.playStartTime = null;
        this.finalDuration = 0.0;

        this.historySummary = getHistorySummary();
        handTracker.reset();
    }

    /**
     * Inicia una nueva partida desde el menú (con cuenta regresiva de 3, 2, 1)
     */
    iniciarPartida() {
        // Si la cámara aún no estaba lista (p.ej. el usuario esperó a hacer clic en START), intentar abrirla
        if (!cameraManager.isReady && this.videoElement) {
            cameraManager.initCamera(this.videoElement);
        }

        this.resetGame();
        this.gameState = GameState.COUNTDOWN;
        this.countdownStartTime = performance.now();
        this.syncStartButtonDOM();
        this.updateHoverStates();
    }

    /**
     * Reinicia la partida después de Game Over
     */
    reiniciarPartida() {
        this.iniciarPartida();
    }

    /**
     * Dispara un proyectil desde la posición actual de la nave y reproduce disparo.wav
     */
    disparar(currentTimeMs) {
        if (currentTimeMs - this.lastShotTime >= SHOT_COOLDOWN_MS) {
            this.projectiles.push(createProjectile(player.x, player.y));
            audioManager.playShot();
            this.lastShotTime = currentTimeMs;
        }
    }

    /**
     * Activa o actualiza el Escudo Astral y reproduce escudo.wav al activarse
     */
    activarEscudo(shouldActivate) {
        player.shield = shouldActivate;
        if (player.shield && !player.previousShield) {
            audioManager.playShield();
        }
        player.previousShield = player.shield;
    }

    /**
     * Alterna pantalla completa (requestFullscreen)
     */
    toggleFullscreen() {
        const container = document.getElementById("gameContainer") || this.canvas;
        if (!document.fullscreenElement) {
            if (container.requestFullscreen) {
                container.requestFullscreen().catch(() => {});
            }
        } else if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
    }

    /**
     * Actualiza toda la lógica de un frame (cámara, MediaPipe, gestos, física, colisiones y estados)
     */
    actualizar(timestampMs, dt) {
        this.frameCounter += 1;

        // 1. Procesar MediaPipe cada N frames igual que MEDIAPIPE_EVERY_N_FRAMES = 2 en Python
        if (
            cameraManager.hasFrame() &&
            this.frameCounter % MEDIAPIPE_EVERY_N_FRAMES === 0
        ) {
            handTracker.processVideoFrame(this.videoElement, timestampMs);
        }

        const handDetected = handTracker.handDetected;
        const smoothProximity = handTracker.smoothProximity;
        const currentGesture = getCurrentGesture();

        // 2. Impulso Cósmico (Turbo) por proximidad de la palma
        player.boost = evaluarImpulsoCosmico(
            handDetected,
            smoothProximity,
            player.boost
        );

        // 3. Escudo Astral (Dos dedos levantados durante STATE_PLAYING)
        const shieldShouldBeActive =
            this.gameState === GameState.PLAYING &&
            handDetected &&
            currentGesture === GESTURE_PEACE;
        this.activarEscudo(shieldShouldBeActive);

        // 4. Lógica de partida activa (STATE_PLAYING)
        if (this.gameState === GameState.PLAYING) {
            // Disparo con puño cerrado + cooldown
            if (handDetected && currentGesture === GESTURE_FIST) {
                this.disparar(timestampMs);
            }

            // Movimiento suavizado de la nave
            player.updatePosition(
                handDetected,
                handTracker.targetX,
                handTracker.targetY
            );

            // Nivel y dificultad antes de mover objetos
            this.level = getLevel(this.score);
            const { activeOrbs, activeObstacles, speedMultiplier } =
                getDifficultyConfig(this.level);

            const speedFactor =
                speedMultiplier * (player.boost ? 1.15 : 1.0);

            // Actualizar proyectiles
            updateProjectiles(this.projectiles, dt);

            // Actualizar orbes positivos
            updateOrbs(
                this.orbs,
                activeOrbs,
                speedFactor,
                dt,
                player,
                () => {
                    this.score += 10;
                    audioManager.playCollect();
                }
            );

            // Recalcular nivel, daño y enemigo rojo tras recoger orbes
            this.level = getLevel(this.score);
            const damageAmount = getDamageForLevel(this.level);
            const redEnemyActive = this.level >= RED_ENEMY_START_LEVEL;

            // Actualizar enemigos morados
            updatePurpleObstacles(
                this.obstacles,
                activeObstacles,
                speedFactor,
                dt,
                player,
                player.shield,
                this.projectiles,
                () => {
                    player.applyDamage(damageAmount);
                    audioManager.playDamage();
                },
                (points) => {
                    this.score += points;
                }
            );

            // Actualizar enemigo rojo rápido (desde Nivel 5)
            updateRedEnemy(
                this.redEnemy,
                redEnemyActive,
                speedFactor,
                dt,
                player,
                player.shield,
                this.projectiles,
                () => {
                    player.applyDamage(damageAmount);
                    audioManager.playDamage();
                },
                (points) => {
                    this.score += points;
                }
            );

            // Asegurar rango de energía [0, 100]
            player.energy = Math.trunc(clamp(player.energy, 0, 100));

            // Comprobar fin de partida (Game Over)
            if (player.energy <= 0) {
                player.energy = 0;
                const finalLevel = getLevel(this.score);
                this.level = finalLevel;

                if (!this.gameOverSaved) {
                    if (this.playStartTime !== null) {
                        this.finalDuration =
                            (timestampMs - this.playStartTime) / 1000.0;
                    } else {
                        this.finalDuration = 0.0;
                    }

                    saveGameHistory(
                        this.score,
                        finalLevel,
                        this.finalDuration
                    );
                    this.historySummary = getHistorySummary();
                    this.gameOverSaved = true;
                }

                this.gameState = GameState.GAME_OVER;
                player.shield = false;
                player.previousShield = false;
                audioManager.stopBackgroundMusic();
                this.syncStartButtonDOM();
                this.updateHoverStates();
            }
        } else {
            this.level = getLevel(this.score);
        }

        // 5. Lógica de Cuenta Regresiva (STATE_COUNTDOWN)
        this.countdownValue = null;
        if (this.gameState === GameState.COUNTDOWN) {
            const elapsedMs = timestampMs - this.countdownStartTime;
            const secondsPassed = Math.floor(elapsedMs / 1000);

            if (secondsPassed >= this.countdownSeconds) {
                this.gameState = GameState.PLAYING;
                this.playStartTime = timestampMs;
                audioManager.startBackgroundMusic();
            } else {
                this.countdownValue = this.countdownSeconds - secondsPassed;
            }
        }

        // 6. Actualizar superficie de minicámara cada 2 frames
        if (this.frameCounter % 2 === 0) {
            this.cameraSurface = handTracker.renderCameraSurface(
                this.videoElement
            );
        }
    }

    /**
     * Dibuja todos los elementos en el Canvas 1280x720
     */
    dibujar(timestampMs) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        // 1. Fondo del panel izquierdo
        drawLeftPanelBackground(ctx);

        // 2. Fondo cósmico del área de juego
        if (
            this.images.background &&
            this.images.background.complete &&
            this.images.background.naturalWidth > 0
        ) {
            ctx.drawImage(
                this.images.background,
                GAME_X,
                GAME_Y,
                GAME_WIDTH,
                GAME_HEIGHT
            );
        } else {
            ctx.fillStyle = "rgb(10, 10, 20)";
            ctx.fillRect(GAME_X, GAME_Y, GAME_WIDTH, GAME_HEIGHT);
        }

        const { activeOrbs, activeObstacles } = getDifficultyConfig(this.level);
        const redEnemyActive = this.level >= RED_ENEMY_START_LEVEL;

        // 3. Objetos de juego (durante COUNTDOWN, PLAYING y GAME_OVER)
        if (
            this.gameState === GameState.COUNTDOWN ||
            this.gameState === GameState.PLAYING ||
            this.gameState === GameState.GAME_OVER
        ) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(GAME_X, GAME_Y, GAME_WIDTH, GAME_HEIGHT);
            ctx.clip();

            // Orbes positivos
            for (let i = 0; i < activeOrbs; i++) {
                drawOrb(ctx, this.orbs[i]);
            }

            // Enemigos morados
            for (let i = 0; i < activeObstacles; i++) {
                drawObstacle(ctx, this.obstacles[i]);
            }

            // Enemigo rojo desde nivel 5
            if (redEnemyActive) {
                drawRedEnemy(ctx, this.redEnemy);
            }

            // Disparos
            if (this.gameState === GameState.PLAYING) {
                for (const projectile of this.projectiles) {
                    drawProjectile(ctx, projectile);
                }
            }

            // Nave del jugador
            drawShip(
                ctx,
                this.images.ship,
                player.x,
                player.y,
                player.boost,
                player.shield,
                timestampMs
            );

            // Leyenda de advertencia de enemigos y orbes
            drawLegend(ctx);

            ctx.restore();
        }

        // 4. Tarjetas del HUD en el panel izquierdo
        drawInfoCards(
            ctx,
            this.score,
            player.energy,
            handTracker.smoothProximity,
            player.boost,
            player.shield,
            handTracker.handDetected,
            this.level,
            getCurrentGesture()
        );

        // 5. Tarjeta de cámara en el panel izquierdo
        drawCameraCard(
            ctx,
            this.cameraSurface,
            cameraManager.isReady ? null : cameraManager.errorMessage
        );

        // 6. Superposiciones de estado: Menú, Cuenta Regresiva o Game Over
        if (this.gameState === GameState.MENU) {
            drawMenuScreen(ctx, this.hoverStart);
        } else if (
            this.gameState === GameState.COUNTDOWN &&
            this.countdownValue !== null
        ) {
            drawCountdown(ctx, this.countdownValue);
        } else if (this.gameState === GameState.GAME_OVER) {
            drawGameOver(
                ctx,
                this.score,
                this.images.flower,
                this.hoverRetry,
                this.hoverQuit
            );
            drawHistoryCard(ctx, this.historySummary);
            drawAstronautCatCard(ctx, this.images.astronautCat);
        }
    }

    /**
     * Inicia el ciclo principal con requestAnimationFrame (~60 FPS)
     */
    startLoop() {
        const gameLoop = (timestampMs) => {
            if (this.lastFrameTime === null) {
                this.lastFrameTime = timestampMs;
            }

            // Limitamos dt máximo a 0.05s para evitar saltos bruscos al cambiar de pestaña
            const rawDt = (timestampMs - this.lastFrameTime) / 1000.0;
            const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
            this.lastFrameTime = timestampMs;

            this.actualizar(timestampMs, dt);
            this.dibujar(timestampMs);

            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    }
}
