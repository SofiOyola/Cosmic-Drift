// ============================================================
// COSMIC DRIFT WEB — SISTEMA DE ORBES (orbs.js)
// Generación, movimiento, recolección (+10 puntos) y renderizado
// ============================================================

import {
    MAX_ORBS,
    GAME_HEIGHT,
    COLORS,
    randomGameX,
    randomInt,
    randomUniform
} from "./config.js";
import { checkShipOrbCollision } from "./collisions.js";

/**
 * Crea un orbe positivo con valores iniciales idénticos a create_orb() en Python
 */
export function createOrb() {
    const speed = randomUniform(110, 170);
    return {
        x: randomGameX(),
        y: randomInt(-500, -50),
        speed,
        velocidad: speed,
        radius: 15,
        radio: 15,
        activo: true
    };
}

/**
 * Crea la lista completa de MAX_ORBS orbes
 */
export function createOrbsPool() {
    const orbs = [];
    for (let i = 0; i < MAX_ORBS; i++) {
        orbs.push(createOrb());
    }
    return orbs;
}

/**
 * Reposiciona un orbe arriba de la pantalla
 */
export function resetOrb(orb) {
    orb.x = randomGameX();
    orb.y = randomInt(-500, -50);
}

/**
 * Actualiza los orbes activos según el nivel y comprueba su recolección por la nave
 */
export function updateOrbs(orbs, activeOrbsCount, speedFactor, dt, ship, onCollect) {
    const limit = Math.min(activeOrbsCount, orbs.length);

    for (let i = 0; i < limit; i++) {
        const orb = orbs[i];
        orb.y += orb.speed * speedFactor * dt;

        if (orb.y > GAME_HEIGHT + 50) {
            resetOrb(orb);
        }

        if (checkShipOrbCollision(ship, orb)) {
            resetOrb(orb);
            if (onCollect) {
                onCollect();
            }
        }
    }
}

/**
 * Dibuja un orbe positivo con sus 4 círculos concéntricos idénticos a draw_orb() en Python
 */
export function drawOrb(ctx, orb, center = null) {
    const x = center ? Math.trunc(center.x) : Math.trunc(orb.x);
    const y = center ? Math.trunc(center.y) : Math.trunc(orb.y);

    // Halo exterior (r=24)
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.ORB_OUTER;
    ctx.fill();

    // Anillo rosa (r=16)
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.PINK;
    ctx.fill();

    // Anillo cian (r=10)
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.CYAN;
    ctx.fill();

    // Núcleo blanco (r=4)
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.WHITE;
    ctx.fill();
}
