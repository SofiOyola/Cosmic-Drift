// ============================================================
// COSMIC DRIFT WEB — CONFIGURACIÓN Y CONSTANTES
// Equivalente exacto de las constantes de fase2_cosmic_drift.py
// ============================================================

export const SCREEN_WIDTH = 1280;
export const SCREEN_HEIGHT = 720;
export const FPS = 60;
export const WINDOW_NAME = "Cosmic Drift";

// ============================================================
// ESTADOS DEL JUEGO
// ============================================================

export const GameState = {
    MENU: "menu",
    COUNTDOWN: "countdown",
    PLAYING: "playing",
    GAME_OVER: "game_over"
};

// ============================================================
// DISTRIBUCIÓN DE PANTALLA
// ============================================================

export const LEFT_PANEL_WIDTH = 380;
export const INFO_PANEL_HEIGHT = 370;

export const GAME_X = LEFT_PANEL_WIDTH;
export const GAME_Y = 0;
export const GAME_WIDTH = SCREEN_WIDTH - LEFT_PANEL_WIDTH; // 900
export const GAME_HEIGHT = SCREEN_HEIGHT; // 720

export const CAMERA_PANEL_Y = INFO_PANEL_HEIGHT;
export const CAMERA_CARD_BOTTOM_MARGIN = 24;

// Dimensiones de la vista de cámara dentro del panel izquierdo
export const CAMERA_CAPTURE_WIDTH = 640;
export const CAMERA_CAPTURE_HEIGHT = 360;
export const CAMERA_DISPLAY_WIDTH = LEFT_PANEL_WIDTH - 40; // 340
export const CAMERA_DISPLAY_HEIGHT = Math.floor((CAMERA_DISPLAY_WIDTH * 9) / 16); // 191

// ============================================================
// SEGUIMIENTO Y MOVIMIENTO
// ============================================================

export const HAND_ALPHA = 0.25;
export const SHIP_FOLLOW_SPEED = 0.18;
export const MEDIAPIPE_EVERY_N_FRAMES = 2;

export const PROX_TURBO_ON = 0.30;
export const PROX_TURBO_OFF = 0.26;

export const PALM_POINTS = [0, 5, 9, 13, 17];

// ============================================================
// GESTOS
// ============================================================

export const GESTURE_OPEN = "OPEN";
export const GESTURE_FIST = "FIST";
export const GESTURE_PEACE = "PEACE";
export const GESTURE_UNKNOWN = "UNKNOWN";

export const GESTURE_CONFIRM_FRAMES = 4;

// ============================================================
// DISPARO
// ============================================================

export const SHOT_SPEED = 650;
export const SHOT_RADIUS = 7;
export const SHOT_COOLDOWN_MS = 350;
export const POINTS_PER_DESTROYED_OBSTACLE = 5;

// ============================================================
// DAÑO Y DIFICULTAD
// ============================================================

export const BASE_DAMAGE = 10;
export const DAMAGE_PER_LEVEL = 2;

export const POINTS_PER_LEVEL = 40;
export const MAX_ORBS = 4;
export const MAX_OBSTACLES = 6;

// ============================================================
// ENEMIGO ROJO RÁPIDO
// ============================================================

export const RED_ENEMY_START_LEVEL = 5;
export const RED_ENEMY_MIN_SPEED = 240;
export const RED_ENEMY_MAX_SPEED = 320;

// ============================================================
// RUTAS DE ASSETS
// ============================================================

export const ASSETS = {
    background: "assets/backgrounds/fondo_cosmico.png",
    ship: "assets/ship/nave.png",
    flower: "assets/ui/flor_game_over.png",
    astronautCat: "assets/ui/gato_astronauta.png",
    audio: {
        music: "assets/audio/musica_fondo.ogg",
        damage: "assets/audio/golpe.wav",
        shield: "assets/audio/escudo.wav",
        shot: "assets/audio/disparo.wav",
        collect: "assets/audio/recolectar.wav"
    },
    historyCsv: "data/historial_partidas.csv"
};

// ============================================================
// VOLÚMENES
// ============================================================

export const VOLUMES = {
    music: 0.28,
    damage: 0.55,
    shield: 0.45,
    shot: 0.35,
    collect: 0.45
};

// ============================================================
// HISTORIAL
// ============================================================

export const HISTORY_DISPLAY_LIMIT = 5;
export const STORAGE_KEY = "cosmic_drift_historial_v1";

// ============================================================
// COLORES (RGB / RGBA exactos de Pygame)
// ============================================================

export const COLORS = {
    WHITE: "rgb(245, 245, 255)",
    SOFT_WHITE: "rgb(220, 220, 235)",
    PINK: "rgb(255, 145, 220)",
    LAVENDER: "rgb(190, 160, 255)",
    CYAN: "rgb(115, 220, 255)",
    MINT: "rgb(145, 255, 220)",
    GOLD: "rgb(255, 225, 130)",
    RED: "rgb(255, 75, 90)",
    GREEN: "rgb(80, 235, 145)",

    PANEL_BG: "rgb(5, 5, 8)",
    CARD_BG: "rgb(18, 18, 28)",
    CARD_BG_2: "rgb(12, 12, 18)",
    CARD_BORDER: "rgb(110, 95, 160)",

    // Morado (Enemigo morado)
    DARK_PURPLE: "rgb(60, 35, 90)",
    OBSTACLE_PURPLE: "rgb(135, 85, 165)",
    PURPLE_HIGHLIGHT: "rgb(195, 110, 210)",
    PURPLE_SHADOW: "rgb(75, 45, 105)",

    // Rojo (Enemigo rojo)
    DARK_RED: "rgb(95, 20, 35)",
    ENEMY_RED: "rgb(190, 55, 75)",
    LIGHT_RED: "rgb(255, 105, 120)",
    DEEP_RED: "rgb(105, 25, 45)",

    // Orbe y proyectil
    ORB_OUTER: "rgb(100, 80, 145)",
    SHOT_OUTER: "rgb(90, 70, 150)",

    // Turbo
    TURBO_OUTER: "rgb(80, 110, 170)",
    TURBO_INNER: "rgb(105, 85, 155)"
};

// ============================================================
// BOTONES INTERACTIVOS (Coordenadas lógicas 1280x720)
// ============================================================

export const BUTTONS = {
    start: {
        x: GAME_X + 290,
        y: 430,
        w: 320,
        h: 62
    },
    retry: {
        x: 430,
        y: 470,
        w: 220,
        h: 58
    },
    quit: {
        x: 680,
        y: 470,
        w: 170,
        h: 58
    }
};

// ============================================================
// TIPOGRAFÍA Y CONVERSIÓN FRAKTUR
// ============================================================

export const TITLE_TEXT = "ℂ𝕠𝕤𝕞𝕚𝕔 𝔻𝕣𝕚𝕗𝕥";
export const FONT_FAMILY = '"Cambria Math", "Segoe UI Symbol", "Apple Symbols", "Noto Sans Math", "Segoe UI", sans-serif';

const ASCII_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const FRAKTUR_UPPER = Array.from("𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅");

const ASCII_LOWER = "abcdefghijklmnopqrstuvwxyz";
const FRAKTUR_LOWER = Array.from("𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟");

const FRAKTUR_MAP = {};

for (let i = 0; i < ASCII_UPPER.length; i++) {
    FRAKTUR_MAP[ASCII_UPPER[i]] = FRAKTUR_UPPER[i];
}
for (let i = 0; i < ASCII_LOWER.length; i++) {
    FRAKTUR_MAP[ASCII_LOWER[i]] = FRAKTUR_LOWER[i];
}

export function toFraktur(text) {
    let result = "";
    for (const char of String(text)) {
        result += FRAKTUR_MAP[char] !== undefined ? FRAKTUR_MAP[char] : char;
    }
    return result;
}

// ============================================================
// UTILIDADES MATEMÁTICAS Y DE NIVEL
// ============================================================

export function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(value, maximum));
}

export function ema(actual, previous, alpha) {
    if (previous === null || previous === undefined) {
        return actual;
    }
    return alpha * actual + (1 - alpha) * previous;
}

export function randomUniform(min, max) {
    return min + Math.random() * (max - min);
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomGameX(margin = 55) {
    return randomInt(GAME_X + margin, SCREEN_WIDTH - margin);
}

export function getLevel(score) {
    return Math.floor(score / POINTS_PER_LEVEL) + 1;
}

export function getDamageForLevel(level) {
    return BASE_DAMAGE + (level - 1) * DAMAGE_PER_LEVEL;
}

export function getDifficultyConfig(level) {
    const activeOrbs = Math.min(
        1 + Math.floor((level - 1) / 2),
        MAX_ORBS
    );

    const activeObstacles = Math.min(
        1 + (level - 1),
        MAX_OBSTACLES
    );

    let speedMultiplier = 1.0 + (level - 1) * 0.10;
    speedMultiplier = Math.min(speedMultiplier, 1.8);

    return {
        activeOrbs,
        activeObstacles,
        speedMultiplier
    };
}
