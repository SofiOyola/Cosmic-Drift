// ============================================================
// COSMIC DRIFT WEB — SISTEMA DE COLISIONES (collisions.js)
// Conserva las dimensiones y tolerancias exactas de Pygame
// ============================================================

/**
 * Distancia euclidiana 2D entre dos puntos
 */
export function distance2D(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Colisión circular idéntica a collision(x1, y1, r1, x2, y2, r2) en Python
 */
export function circleCollision(x1, y1, r1, x2, y2, r2) {
    return distance2D(x1, y1, x2, y2) <= (r1 + r2);
}

/**
 * Colisión Nave <-> Orbe (radio nave = 30, radio orbe = 15)
 */
export function checkShipOrbCollision(ship, orb) {
    return circleCollision(
        ship.x,
        ship.y,
        ship.hitRadius,
        orb.x,
        orb.y,
        orb.radius
    );
}

/**
 * Colisión Nave <-> Enemigo (morado o rojo, radio nave = 30, radio enemigo = 27)
 */
export function checkShipEnemyCollision(ship, enemy) {
    return circleCollision(
        ship.x,
        ship.y,
        ship.hitRadius,
        enemy.x,
        enemy.y,
        enemy.radius
    );
}

/**
 * Colisión Disparo <-> Enemigo (radio disparo = 7, radio enemigo = 27)
 */
export function checkProjectileEnemyCollision(projectile, enemy) {
    return circleCollision(
        projectile.x,
        projectile.y,
        projectile.radius,
        enemy.x,
        enemy.y,
        enemy.radius
    );
}

/**
 * Comprueba si un punto (x, y) está dentro de un rectángulo { x, y, w, h }
 */
export function pointInRect(px, py, rect) {
    return (
        px >= rect.x &&
        px <= rect.x + rect.w &&
        py >= rect.y &&
        py <= rect.y + rect.h
    );
}
