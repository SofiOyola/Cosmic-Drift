// ============================================================
// COSMIC DRIFT WEB — NAVE DEL JUGADOR (player.js)
// Movimiento suavizado, Impulso Cósmico (Turbo), Escudo Astral y Energía
// ============================================================

import {
    GAME_X,
    GAME_WIDTH,
    GAME_HEIGHT,
    SCREEN_WIDTH,
    SHIP_FOLLOW_SPEED,
    COLORS,
    clamp
} from "./config.js";

export const player = {
    x: GAME_X + GAME_WIDTH / 2,
    y: GAME_HEIGHT - 170,
    width: 90,
    height: 90,
    hitRadius: 30,
    shield: false,
    previousShield: false,
    boost: false,
    energy: 100,

    get health() {
        return this.energy;
    },
    set health(val) {
        this.energy = val;
    },

    /**
     * Restablece el estado de la nave al inicio de una partida
     */
    reset() {
        this.x = GAME_X + GAME_WIDTH / 2;
        this.y = GAME_HEIGHT - 170;
        this.shield = false;
        this.previousShield = false;
        this.boost = false;
        this.energy = 100;
    },

    /**
     * Actualiza la posición de la nave con interpolación suave hacia (targetX, targetY)
     */
    updatePosition(handDetected, targetX, targetY) {
        if (handDetected) {
            this.x += (targetX - this.x) * SHIP_FOLLOW_SPEED;
            this.y += (targetY - this.y) * SHIP_FOLLOW_SPEED;
        }

        this.x = clamp(this.x, GAME_X + 45, SCREEN_WIDTH - 45);
        this.y = clamp(this.y, 45, GAME_HEIGHT - 45);
    },

    /**
     * Aplica daño a la energía de la nave
     */
    applyDamage(amount) {
        this.energy = Math.trunc(clamp(this.energy - amount, 0, 100));
        return this.energy;
    }
};

/**
 * Dibuja el Escudo Astral pulsante con sus 4 satélites orbitales (idéntico a draw_astral_shield)
 */
export function drawAstralShield(ctx, x, y, currentTimeMs) {
    const currentTime = currentTimeMs / 1000.0;
    const pulse = Math.trunc(Math.sin(currentTime * 5) * 4);

    const radiusOuter = 58 + pulse;
    const radiusInner = 50 + pulse;

    const ix = Math.trunc(x);
    const iy = Math.trunc(y);

    // Anillo exterior cian (grosor 4)
    ctx.beginPath();
    ctx.arc(ix, iy, radiusOuter, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.CYAN;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Anillo interior lavanda (grosor 2)
    ctx.beginPath();
    ctx.arc(ix, iy, radiusInner, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.LAVENDER;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4 partículas blancas orbitando
    const angles = [0, 90, 180, 270];
    for (const angle of angles) {
        const radians = ((angle + currentTime * 80) * Math.PI) / 180;
        const px = Math.trunc(x + Math.cos(radians) * radiusOuter);
        const py = Math.trunc(y + Math.sin(radians) * radiusOuter);

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.WHITE;
        ctx.fill();
    }
}

/**
 * Dibuja la nave, el aura de Impulso Cósmico (Turbo) y el Escudo Astral
 */
export function drawShip(ctx, shipImage, x, y, turbo, shield, currentTimeMs) {
    const ix = Math.trunc(x);
    const iy = Math.trunc(y);

    // Aura de Impulso Cósmico (Turbo)
    if (turbo) {
        ctx.beginPath();
        ctx.arc(ix, iy, 52, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.TURBO_OUTER;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ix, iy, 44, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.TURBO_INNER;
        ctx.fill();
    }

    // Sprite de la nave (90x90 centrado) o polígono de respaldo
    if (shipImage && shipImage.complete && shipImage.naturalWidth > 0) {
        ctx.drawImage(
            shipImage,
            Math.trunc(ix - player.width / 2),
            Math.trunc(iy - player.height / 2),
            player.width,
            player.height
        );
    } else {
        ctx.beginPath();
        ctx.moveTo(ix, iy - 25);
        ctx.lineTo(ix + 22, iy + 20);
        ctx.lineTo(ix, iy + 10);
        ctx.lineTo(ix - 22, iy + 20);
        ctx.closePath();
        ctx.fillStyle = COLORS.WHITE;
        ctx.fill();
    }

    // Escudo Astral
    if (shield) {
        drawAstralShield(ctx, ix, iy, currentTimeMs);
    }
}
