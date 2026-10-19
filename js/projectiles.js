// ============================================================
// COSMIC DRIFT WEB — SISTEMA DE PROYECTILES (projectiles.js)
// Creación, movimiento vertical, colisiones y renderizado de disparos
// ============================================================

import { SHOT_SPEED, SHOT_RADIUS, COLORS } from "./config.js";

/**
 * Crea un nuevo proyectil en la punta de la nave (y - 35)
 */
export function createProjectile(x, y) {
    return {
        x,
        y: y - 35,
        speed: SHOT_SPEED,
        velocidad: SHOT_SPEED,
        radius: SHOT_RADIUS,
        activo: true
    };
}

/**
 * Actualiza todos los proyectiles activos y filtra los que salieron por arriba (y <= -30)
 */
export function updateProjectiles(projectiles, dt) {
    for (const projectile of projectiles) {
        projectile.y -= projectile.speed * dt;
        if (projectile.y <= -30) {
            projectile.activo = false;
        }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
        if (!projectiles[i].activo || projectiles[i].y <= -30) {
            projectiles.splice(i, 1);
        }
    }
}

/**
 * Dibuja un proyectil con sus 4 círculos concéntricos idénticos a draw_projectile en Pygame
 */
export function drawProjectile(ctx, projectile) {
    const x = Math.trunc(projectile.x);
    const y = Math.trunc(projectile.y);

    // Círculo exterior morado (r=14)
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.SHOT_OUTER;
    ctx.fill();

    // Círculo lavanda (r=10)
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.LAVENDER;
    ctx.fill();

    // Círculo cian (r=6)
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.CYAN;
    ctx.fill();

    // Núcleo blanco (r=3)
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.WHITE;
    ctx.fill();
}
