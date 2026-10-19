// ============================================================
// COSMIC DRIFT WEB — ENEMIGOS MORADOS Y ROJO RÁPIDO (enemies.js)
// Creación, movimiento, colisiones con nave/escudo/disparos y renderizado
// ============================================================

import {
    MAX_OBSTACLES,
    GAME_HEIGHT,
    RED_ENEMY_MIN_SPEED,
    RED_ENEMY_MAX_SPEED,
    POINTS_PER_DESTROYED_OBSTACLE,
    COLORS,
    randomGameX,
    randomInt,
    randomUniform
} from "./config.js";
import {
    checkShipEnemyCollision,
    checkProjectileEnemyCollision
} from "./collisions.js";

/**
 * Crea un enemigo morado (obstáculo) idéntico a create_obstacle() en Python
 */
export function createObstacle() {
    const speed = randomUniform(125, 190);
    return {
        x: randomGameX(),
        y: randomInt(-700, -100),
        speed,
        velocidad: speed,
        radius: 27,
        radio: 27,
        activo: true
    };
}

/**
 * Crea el pool de enemigos morados (MAX_OBSTACLES = 6)
 */
export function createObstaclesPool() {
    const obstacles = [];
    for (let i = 0; i < MAX_OBSTACLES; i++) {
        obstacles.push(createObstacle());
    }
    return obstacles;
}

/**
 * Crea el enemigo rojo rápido (aparece desde Nivel 5) idéntico a create_red_enemy() en Python
 */
export function createRedEnemy() {
    const speed = randomUniform(RED_ENEMY_MIN_SPEED, RED_ENEMY_MAX_SPEED);
    return {
        x: randomGameX(),
        y: randomInt(-900, -150),
        speed,
        velocidad: speed,
        radius: 27,
        radio: 27,
        activo: true
    };
}

/**
 * Reposiciona un enemigo en el rango vertical indicado
 */
export function resetEnemy(enemy, minY, maxY) {
    enemy.x = randomGameX();
    enemy.y = randomInt(minY, maxY);
}

/**
 * Actualiza los enemigos morados activos y gestiona colisiones con nave y proyectiles
 */
export function updatePurpleObstacles(
    obstacles,
    activeObstaclesCount,
    speedFactor,
    dt,
    ship,
    shieldActive,
    projectiles,
    onShipHit,
    onEnemyDestroyed
) {
    const limit = Math.min(activeObstaclesCount, obstacles.length);

    for (let i = 0; i < limit; i++) {
        const obstacle = obstacles[i];

        obstacle.y += obstacle.speed * speedFactor * dt;

        if (obstacle.y > GAME_HEIGHT + 70) {
            resetEnemy(obstacle, -700, -100);
        }

        // Colisión Nave <-> Enemigo morado
        if (checkShipEnemyCollision(ship, obstacle)) {
            if (shieldActive) {
                resetEnemy(obstacle, -700, -100);
            } else {
                resetEnemy(obstacle, -700, -100);
                if (onShipHit) onShipHit();
            }
        }

        // Colisión Disparo <-> Enemigo morado
        let hitIndex = -1;
        for (let p = 0; p < projectiles.length; p++) {
            if (checkProjectileEnemyCollision(projectiles[p], obstacle)) {
                hitIndex = p;
                resetEnemy(obstacle, -700, -100);
                if (onEnemyDestroyed) {
                    onEnemyDestroyed(POINTS_PER_DESTROYED_OBSTACLE);
                }
                break;
            }
        }

        if (hitIndex !== -1) {
            projectiles.splice(hitIndex, 1);
        }
    }
}

/**
 * Actualiza el enemigo rojo rápido (activo desde nivel 5) y gestiona colisiones
 */
export function updateRedEnemy(
    redEnemy,
    redEnemyActive,
    speedFactor,
    dt,
    ship,
    shieldActive,
    projectiles,
    onShipHit,
    onEnemyDestroyed
) {
    if (!redEnemyActive || !redEnemy) return;

    redEnemy.y += redEnemy.speed * speedFactor * dt;

    if (redEnemy.y > GAME_HEIGHT + 70) {
        resetEnemy(redEnemy, -900, -150);
    }

    // Colisión Nave <-> Enemigo rojo
    if (checkShipEnemyCollision(ship, redEnemy)) {
        if (shieldActive) {
            resetEnemy(redEnemy, -900, -150);
        } else {
            resetEnemy(redEnemy, -900, -150);
            if (onShipHit) onShipHit();
        }
    }

    // Colisión Disparo <-> Enemigo rojo
    let hitIndex = -1;
    for (let p = 0; p < projectiles.length; p++) {
        if (checkProjectileEnemyCollision(projectiles[p], redEnemy)) {
            hitIndex = p;
            resetEnemy(redEnemy, -900, -150);
            if (onEnemyDestroyed) {
                onEnemyDestroyed(POINTS_PER_DESTROYED_OBSTACLE);
            }
            break;
        }
    }

    if (hitIndex !== -1) {
        projectiles.splice(hitIndex, 1);
    }
}

/**
 * Dibuja un enemigo morado idéntico a draw_obstacle() en Python
 */
export function drawObstacle(ctx, obstacle, center = null) {
    const x = center ? Math.trunc(center.x) : Math.trunc(obstacle.x);
    const y = center ? Math.trunc(center.y) : Math.trunc(obstacle.y);

    // Borde oscuro (r=30)
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.DARK_PURPLE;
    ctx.fill();

    // Cuerpo principal (r=24)
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.OBSTACLE_PURPLE;
    ctx.fill();

    // Mancha clara superior izquierda (r=7)
    ctx.beginPath();
    ctx.arc(x - 7, y - 5, 7, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.PURPLE_HIGHLIGHT;
    ctx.fill();

    // Mancha oscura inferior derecha (r=6)
    ctx.beginPath();
    ctx.arc(x + 8, y + 7, 6, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.PURPLE_SHADOW;
    ctx.fill();
}

/**
 * Dibuja el enemigo rojo rápido idéntico a draw_red_enemy() en Python
 */
export function drawRedEnemy(ctx, enemy, center = null) {
    const x = center ? Math.trunc(center.x) : Math.trunc(enemy.x);
    const y = center ? Math.trunc(center.y) : Math.trunc(enemy.y);

    // Borde rojo oscuro (r=30)
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.DARK_RED;
    ctx.fill();

    // Cuerpo rojo principal (r=24)
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.ENEMY_RED;
    ctx.fill();

    // Mancha clara superior izquierda (r=7)
    ctx.beginPath();
    ctx.arc(x - 7, y - 5, 7, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.LIGHT_RED;
    ctx.fill();

    // Mancha oscura inferior derecha (r=6)
    ctx.beginPath();
    ctx.arc(x + 8, y + 7, 6, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.DEEP_RED;
    ctx.fill();
}
