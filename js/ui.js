// ============================================================
// COSMIC DRIFT WEB — INTERFAZ GRÁFICA, HUD Y PANTALLAS (ui.js)
// Reproduce fielmente cada tarjeta, tipografía Fraktur, leyenda, menú y Game Over
// ============================================================

import {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    LEFT_PANEL_WIDTH,
    GAME_X,
    GAME_Y,
    GAME_WIDTH,
    GAME_HEIGHT,
    CAMERA_PANEL_Y,
    CAMERA_CARD_BOTTOM_MARGIN,
    CAMERA_DISPLAY_WIDTH,
    CAMERA_DISPLAY_HEIGHT,
    TITLE_TEXT,
    FONT_FAMILY,
    COLORS,
    BUTTONS,
    toFraktur
} from "./config.js";
import { getGestureName } from "./gestures.js";
import { drawOrb } from "./orbs.js";
import { drawObstacle, drawRedEnemy } from "./enemies.js";

/**
 * Dibuja un rectángulo con esquinas redondeadas (fondo y borde)
 * idéntico a draw_rounded_card en Pygame
 */
export function drawRoundedCard(
    ctx,
    rect,
    bgColor,
    borderColor,
    radius = 16,
    border = 2
) {
    const { x, y, w, h } = rect;
    const r = Math.min(radius, w / 2, h / 2);

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fill();
    }

    if (border > 0 && borderColor) {
        ctx.lineWidth = border;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    }
}

/**
 * Dibuja un botón redondeado con texto centrado (idéntico a draw_button en Pygame)
 */
export function drawButton(
    ctx,
    rect,
    text,
    fontSize,
    bgColor,
    borderColor,
    textColor,
    isHovered = false
) {
    const activeBg = isHovered ? "rgb(58, 42, 92)" : bgColor;
    const activeBorder = isHovered ? COLORS.WHITE : borderColor;

    drawRoundedCard(ctx, rect, activeBg, activeBorder, 18, 2);

    ctx.save();
    ctx.font = `${fontSize}px ${FONT_FAMILY}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
    ctx.restore();
}

/**
 * Dibuja texto convertido a Fraktur en la posición (x, y)
 */
export function drawFrakturText(
    ctx,
    text,
    x,
    y,
    fontSize,
    color,
    align = "left",
    baseline = "top"
) {
    ctx.save();
    ctx.font = `${fontSize}px ${FONT_FAMILY}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(toFraktur(text), x, y);
    ctx.restore();
}

/**
 * Dibuja texto normal (sin conversión Fraktur) en la posición (x, y)
 */
export function drawPlainText(
    ctx,
    text,
    x,
    y,
    fontSize,
    color,
    align = "left",
    baseline = "top"
) {
    ctx.save();
    ctx.font = `${fontSize}px ${FONT_FAMILY}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(String(text), x, y);
    ctx.restore();
}

/**
 * Dibuja el fondo del panel izquierdo (0, 0, 380, 720)
 */
export function drawLeftPanelBackground(ctx) {
    ctx.fillStyle = COLORS.PANEL_BG;
    ctx.fillRect(0, 0, LEFT_PANEL_WIDTH, SCREEN_HEIGHT);
}

/**
 * Dibuja las tarjetas superiores del panel izquierdo (Título + Estadísticas del HUD)
 */
export function drawInfoCards(
    ctx,
    score,
    energy,
    proximity,
    turbo,
    shield,
    detected,
    level,
    gesture
) {
    // 1. Card Título
    const titleCard = {
        x: 16,
        y: 16,
        w: LEFT_PANEL_WIDTH - 32,
        h: 70
    };

    drawRoundedCard(ctx, titleCard, COLORS.CARD_BG, COLORS.CARD_BORDER, 18, 2);

    drawPlainText(ctx, TITLE_TEXT, 28, 33, 31, COLORS.WHITE, "left", "top");

    // Indicador circular de mano detectada
    const statusColor = detected ? COLORS.MINT : COLORS.RED;
    ctx.beginPath();
    ctx.arc(LEFT_PANEL_WIDTH - 48, 48, 7, 0, Math.PI * 2);
    ctx.fillStyle = statusColor;
    ctx.fill();

    // 2. Card Estadísticas (HUD)
    const statsCard = {
        x: 16,
        y: 100,
        w: LEFT_PANEL_WIDTH - 32,
        h: 245
    };

    drawRoundedCard(ctx, statsCard, COLORS.CARD_BG_2, COLORS.CARD_BORDER, 18, 2);

    const proxText =
        proximity === null || proximity === undefined
            ? "Proximidad: ---"
            : `Proximidad: ${proximity.toFixed(3)}`;

    const turboText = turbo
        ? "Impulso Cósmico: ACTIVO"
        : "Impulso Cósmico: inactivo";

    const gestureName = getGestureName(gesture);

    const shieldText = shield
        ? "Escudo Astral: ACTIVO"
        : "Escudo Astral: inactivo";

    drawFrakturText(ctx, `Puntos: ${score}`, 30, 118, 17, COLORS.GOLD);
    drawFrakturText(ctx, `Nivel: ${level}`, 30, 148, 17, COLORS.LAVENDER);
    drawFrakturText(ctx, `Energía: ${energy}%`, 30, 178, 17, COLORS.MINT);
    drawFrakturText(ctx, proxText, 30, 208, 17, COLORS.CYAN);
    drawFrakturText(
        ctx,
        turboText,
        30,
        238,
        17,
        turbo ? COLORS.PINK : COLORS.SOFT_WHITE
    );
    drawFrakturText(ctx, `Gesto: ${gestureName}`, 30, 268, 17, COLORS.PINK);
    drawFrakturText(
        ctx,
        shieldText,
        30,
        298,
        17,
        shield ? COLORS.CYAN : COLORS.SOFT_WHITE
    );
}

/**
 * Dibuja la tarjeta inferior del panel izquierdo con la vista en vivo de la cámara y los 21 landmarks
 */
export function drawCameraCard(ctx, cameraCanvas, cameraError = null) {
    const cardY = CAMERA_PANEL_Y + 14; // 384
    const cardH = SCREEN_HEIGHT - cardY - CAMERA_CARD_BOTTOM_MARGIN; // 312

    const card = {
        x: 16,
        y: cardY,
        w: LEFT_PANEL_WIDTH - 32,
        h: cardH
    };

    drawRoundedCard(ctx, card, COLORS.CARD_BG, COLORS.CARD_BORDER, 18, 2);

    drawFrakturText(ctx, "Cámara", 30, cardY + 20, 22, COLORS.SOFT_WHITE);

    const camX = Math.floor((LEFT_PANEL_WIDTH - CAMERA_DISPLAY_WIDTH) / 2); // 20
    const camY = cardY + 60; // 444

    const camRect = {
        x: camX,
        y: camY,
        w: CAMERA_DISPLAY_WIDTH,
        h: CAMERA_DISPLAY_HEIGHT
    };

    if (cameraCanvas) {
        ctx.save();
        // Recorte redondeado de 8px igual que border_radius=8 en Pygame
        const r = 8;
        ctx.beginPath();
        ctx.moveTo(camRect.x + r, camRect.y);
        ctx.lineTo(camRect.x + camRect.w - r, camRect.y);
        ctx.quadraticCurveTo(camRect.x + camRect.w, camRect.y, camRect.x + camRect.w, camRect.y + r);
        ctx.lineTo(camRect.x + camRect.w, camRect.y + camRect.h - r);
        ctx.quadraticCurveTo(
            camRect.x + camRect.w,
            camRect.y + camRect.h,
            camRect.x + camRect.w - r,
            camRect.y + camRect.h
        );
        ctx.lineTo(camRect.x + r, camRect.y + camRect.h);
        ctx.quadraticCurveTo(camRect.x, camRect.y + camRect.h, camRect.x, camRect.y + camRect.h - r);
        ctx.lineTo(camRect.x, camRect.y + r);
        ctx.quadraticCurveTo(camRect.x, camRect.y, camRect.x + r, camRect.y);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(cameraCanvas, camRect.x, camRect.y, camRect.w, camRect.h);
        ctx.restore();
    } else {
        drawRoundedCard(ctx, camRect, "rgb(10, 10, 16)", null, 8, 0);
    }

    if (cameraError) {
        drawFrakturText(
            ctx,
            cameraError,
            LEFT_PANEL_WIDTH / 2,
            camY + CAMERA_DISPLAY_HEIGHT / 2,
            14,
            COLORS.SOFT_WHITE,
            "center",
            "middle"
        );
    }

    // Borde lavanda de 2px con radio 8 alrededor de la cámara
    drawRoundedCard(ctx, camRect, null, COLORS.LAVENDER, 8, 2);
}

/**
 * Dibuja la leyenda superior izquierda del área de juego (Enemigo morado + Enemigo rojo + Orbe)
 * Idéntica a draw_legend() en fase2_cosmic_drift.py
 */
export function drawLegend(ctx) {
    const lx = GAME_X + 15; // 395
    const ly = 15;
    const legendWidth = 330;
    const legendHeight = 132;

    const legendRect = {
        x: lx,
        y: ly,
        w: legendWidth,
        h: legendHeight
    };

    drawRoundedCard(
        ctx,
        legendRect,
        "rgba(0, 0, 0, 0.45)",
        "rgba(190, 160, 255, 0.43)",
        14,
        1
    );

    // 1. Enemigo morado + raya roja diagonal
    drawObstacle(ctx, null, { x: lx + 38, y: ly + 37 });

    ctx.beginPath();
    ctx.moveTo(lx + 16, ly + 15);
    ctx.lineTo(lx + 60, ly + 59);
    ctx.strokeStyle = COLORS.RED;
    ctx.lineWidth = 4;
    ctx.stroke();

    // 2. Enemigo rojo + raya roja diagonal
    drawRedEnemy(ctx, null, { x: lx + 92, y: ly + 37 });

    ctx.beginPath();
    ctx.moveTo(lx + 70, ly + 15);
    ctx.lineTo(lx + 114, ly + 59);
    ctx.strokeStyle = COLORS.RED;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Texto en plural "Evita estas"
    drawFrakturText(ctx, "Evita estas", lx + 132, ly + 25, 21, COLORS.RED);

    // 3. Orbe positivo
    drawOrb(ctx, null, { x: lx + 65, y: ly + 95 });

    // Texto "Recoge esta"
    drawFrakturText(ctx, "Recoge esta", lx + 132, ly + 83, 21, COLORS.GREEN);
}

/**
 * Dibuja la pantalla de Menú inicial sobre el área de juego
 */
export function drawMenuScreen(ctx, hoverStart = false) {
    // Overlay semitransparente sobre el área de juego
    ctx.fillStyle = "rgba(0, 0, 0, 0.47)";
    ctx.fillRect(GAME_X, GAME_Y, GAME_WIDTH, GAME_HEIGHT);

    const cardRect = {
        x: GAME_X + 160,
        y: 155,
        w: 580,
        h: 380
    };

    drawRoundedCard(
        ctx,
        cardRect,
        "rgb(15, 12, 24)",
        COLORS.LAVENDER,
        24,
        2
    );

    const centerX = cardRect.x + cardRect.w / 2;

    drawPlainText(
        ctx,
        TITLE_TEXT,
        centerX,
        cardRect.y + 65,
        40,
        COLORS.WHITE,
        "center",
        "middle"
    );

    drawFrakturText(
        ctx,
        "Mueve tu mano para controlar la nave",
        centerX,
        cardRect.y + 135,
        22,
        COLORS.SOFT_WHITE,
        "center",
        "middle"
    );

    drawFrakturText(
        ctx,
        "Recoge orbes y evita obstáculos",
        centerX,
        cardRect.y + 175,
        22,
        COLORS.SOFT_WHITE,
        "center",
        "middle"
    );

    drawFrakturText(
        ctx,
        "Puño: dispara   Dos dedos: escudo",
        centerX,
        cardRect.y + 220,
        22,
        COLORS.CYAN,
        "center",
        "middle"
    );

    drawButton(
        ctx,
        BUTTONS.start,
        "Empezar a jugar",
        26,
        "rgb(40, 28, 65)",
        "rgb(200, 170, 255)",
        COLORS.WHITE,
        hoverStart
    );
}

/**
 * Dibuja la cuenta regresiva (3, 2, 1) antes de comenzar la partida
 */
export function drawCountdown(ctx, number) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.275)";
    ctx.fillRect(GAME_X, GAME_Y, GAME_WIDTH, GAME_HEIGHT);

    const centerX = GAME_X + GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    // Sombra lavanda (+4, +4)
    drawPlainText(
        ctx,
        String(number),
        centerX + 4,
        centerY + 4,
        120,
        COLORS.LAVENDER,
        "center",
        "middle"
    );

    // Número principal blanco
    drawPlainText(
        ctx,
        String(number),
        centerX,
        centerY,
        120,
        COLORS.WHITE,
        "center",
        "middle"
    );
}

/**
 * Dibuja la flor de respaldo si no estuviera disponible flor_game_over.png
 */
export function drawFlowerFallback(ctx, centerX, centerY) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 55);
    ctx.strokeStyle = "rgb(80, 110, 60)";
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY - 16, 24, 0, Math.PI * 2);
    ctx.fillStyle = "rgb(170, 30, 40)";
    ctx.fill();
}

/**
 * Dibuja la tarjeta central de Game Over
 */
export function drawGameOver(
    ctx,
    score,
    flowerImage,
    hoverRetry = false,
    hoverQuit = false
) {
    // Overlay sobre toda la ventana (1280x720)
    ctx.fillStyle = "rgba(0, 0, 0, 0.667)";
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    const cardRect = {
        x: 300,
        y: 120,
        w: 680,
        h: 470
    };

    drawRoundedCard(
        ctx,
        cardRect,
        "rgb(12, 10, 18)",
        COLORS.LAVENDER,
        26,
        2
    );

    const centerX = cardRect.x + cardRect.w / 2;

    // Título GAME OVER
    drawPlainText(
        ctx,
        "GAME OVER",
        centerX,
        cardRect.y + 60,
        48,
        COLORS.RED,
        "center",
        "middle"
    );

    // Imagen flor_game_over.png (140x140)
    if (flowerImage && flowerImage.complete && flowerImage.naturalWidth > 0) {
        const fw = 140;
        const fh = 140;
        ctx.drawImage(
            flowerImage,
            Math.trunc(centerX - fw / 2),
            Math.trunc(cardRect.y + 190 - fh / 2),
            fw,
            fh
        );
    } else {
        drawFlowerFallback(ctx, centerX, cardRect.y + 180);
    }

    // Puntaje final
    drawFrakturText(
        ctx,
        `Puntaje final: ${score}`,
        centerX,
        cardRect.y + 300,
        26,
        COLORS.SOFT_WHITE,
        "center",
        "middle"
    );

    // Botones "Jugar otra vez" y "Salir"
    drawButton(
        ctx,
        BUTTONS.retry,
        "Jugar otra vez",
        26,
        "rgb(40, 28, 65)",
        "rgb(200, 170, 255)",
        COLORS.WHITE,
        hoverRetry
    );

    drawButton(
        ctx,
        BUTTONS.quit,
        "Salir",
        26,
        "rgb(35, 18, 24)",
        "rgb(220, 120, 140)",
        COLORS.WHITE,
        hoverQuit
    );
}

/**
 * Dibuja la tarjeta izquierda de Historial Cósmico en la pantalla de Game Over
 */
export function drawHistoryCard(ctx, historySummary) {
    const card = {
        x: 20,
        y: 120,
        w: 255,
        h: 470
    };

    drawRoundedCard(ctx, card, "rgb(12, 10, 18)", COLORS.LAVENDER, 22, 2);

    const centerX = card.x + card.w / 2;
    const rightX = card.x + card.w - 20;

    drawFrakturText(
        ctx,
        "Historial Cósmico",
        centerX,
        153,
        19,
        COLORS.WHITE,
        "center",
        "middle"
    );

    // Mejor puntaje
    drawFrakturText(ctx, "Mejor puntaje", 38, 190, 15, COLORS.GOLD, "left", "top");
    drawFrakturText(
        ctx,
        String(historySummary.best_score),
        rightX,
        190,
        15,
        COLORS.WHITE,
        "right",
        "top"
    );

    // Mejor nivel
    drawFrakturText(ctx, "Mejor nivel", 38, 222, 15, COLORS.LAVENDER, "left", "top");
    drawFrakturText(
        ctx,
        String(historySummary.best_level),
        rightX,
        222,
        15,
        COLORS.WHITE,
        "right",
        "top"
    );

    // Total de partidas
    drawFrakturText(ctx, "Partidas", 38, 254, 15, COLORS.CYAN, "left", "top");
    drawFrakturText(
        ctx,
        String(historySummary.total_games),
        rightX,
        254,
        15,
        COLORS.WHITE,
        "right",
        "top"
    );

    // Últimos puntajes
    drawFrakturText(
        ctx,
        "Últimos puntajes",
        centerX,
        311,
        15,
        COLORS.PINK,
        "center",
        "middle"
    );

    const latestGames = historySummary.latest || [];

    if (latestGames.length === 0) {
        drawFrakturText(
            ctx,
            "Sin partidas",
            centerX,
            370,
            15,
            COLORS.SOFT_WHITE,
            "center",
            "middle"
        );
    } else {
        const startY = 342;
        for (let index = 0; index < latestGames.length; index++) {
            const game = latestGames[index];
            const rowY = startY + index * 45;

            const rowRect = {
                x: 34,
                y: rowY,
                w: 227,
                h: 35
            };

            drawRoundedCard(
                ctx,
                rowRect,
                "rgb(24, 21, 35)",
                "rgb(65, 58, 90)",
                10,
                1
            );

            drawFrakturText(
                ctx,
                `${index + 1}. ${game.puntaje} pts`,
                45,
                rowY + 9,
                15,
                COLORS.WHITE,
                "left",
                "top"
            );

            drawFrakturText(
                ctx,
                `Nv. ${game.nivel}`,
                250,
                rowY + 9,
                15,
                COLORS.LAVENDER,
                "right",
                "top"
            );
        }
    }
}

/**
 * Dibuja la tarjeta derecha del Gato Cósmico en la pantalla de Game Over
 */
export function drawAstronautCatCard(ctx, catImage) {
    const card = {
        x: SCREEN_WIDTH - 20 - 255, // 1005
        y: 120,
        w: 255,
        h: 470
    };

    drawRoundedCard(ctx, card, "rgb(12, 10, 18)", COLORS.LAVENDER, 22, 2);

    const centerX = card.x + card.w / 2;
    const centerY = card.y + card.h / 2;

    drawFrakturText(
        ctx,
        "Gato Cósmico",
        centerX,
        153,
        19,
        COLORS.WHITE,
        "center",
        "middle"
    );

    if (catImage && catImage.complete && catImage.naturalWidth > 0) {
        const cw = 210;
        const ch = 260;
        ctx.drawImage(
            catImage,
            Math.trunc(centerX - cw / 2),
            Math.trunc(centerY + 35 - ch / 2),
            cw,
            ch
        );
    } else {
        drawFrakturText(
            ctx,
            "Agrega tu imagen en:",
            centerX,
            300,
            15,
            COLORS.SOFT_WHITE,
            "center",
            "middle"
        );
        drawFrakturText(
            ctx,
            "assets/ui/",
            centerX,
            340,
            15,
            COLORS.CYAN,
            "center",
            "middle"
        );
        drawFrakturText(
            ctx,
            "gato_astronauta.png",
            centerX,
            375,
            15,
            COLORS.PINK,
            "center",
            "middle"
        );
    }
}
