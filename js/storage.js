// ============================================================
// COSMIC DRIFT WEB — HISTORIAL DE PARTIDAS (storage.js)
// Usa localStorage y precarga los registros iniciales de data/historial_partidas.csv
// ============================================================

import { ASSETS, HISTORY_DISPLAY_LIMIT, STORAGE_KEY } from "./config.js";

/**
 * Formatea fecha (YYYY-MM-DD) y hora (HH:MM:SS) igual que datetime.strftime en Python
 */
function formatDateTime(date = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    const fecha = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const hora = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    return { fecha, hora };
}

/**
 * Parsea el contenido de data/historial_partidas.csv
 */
function parseCsvHistory(csvText) {
    if (!csvText) return [];
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) return [];

    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(",");
        if (parts.length < 5) continue;

        const puntaje = parseInt(parts[2], 10);
        const nivel = parseInt(parts[3], 10);
        const duracionSegundos = parseFloat(parts[4]);

        if (Number.isNaN(puntaje) || Number.isNaN(nivel) || Number.isNaN(duracionSegundos)) {
            continue;
        }

        records.push({
            fecha: parts[0].trim(),
            hora: parts[1].trim(),
            puntaje,
            nivel,
            duracionSegundos,
            duracion: duracionSegundos
        });
    }
    return records;
}

/**
 * Inicializa el historial en localStorage cargando data/historial_partidas.csv
 * si aún no existe historial guardado en el navegador.
 */
export async function initStorage() {
    try {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (existing) {
            const parsed = JSON.parse(existing);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (err) {
        console.warn("No se pudo leer localStorage:", err);
    }

    // Intentar sembrar el historial inicial desde data/historial_partidas.csv
    try {
        const response = await fetch(ASSETS.historyCsv, { cache: "no-store" });
        if (response.ok) {
            const csvText = await response.text();
            const csvRecords = parseCsvHistory(csvText);
            if (csvRecords.length > 0) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(csvRecords));
                return csvRecords;
            }
        }
    } catch (err) {
        // Puede fallar si se abre con file:// o si no existe el archivo; no es crítico
    }

    return [];
}

/**
 * Carga la lista completa de partidas desde localStorage.
 */
export function loadGameHistory() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .map((row) => ({
                fecha: String(row.fecha || ""),
                hora: String(row.hora || ""),
                puntaje: parseInt(row.puntaje, 10) || 0,
                nivel: parseInt(row.nivel, 10) || 1,
                duracionSegundos: parseFloat(
                    row.duracionSegundos !== undefined ? row.duracionSegundos : row.duracion
                ) || 0,
                duracion: parseFloat(
                    row.duracion !== undefined ? row.duracion : row.duracionSegundos
                ) || 0
            }))
            .filter((r) => !Number.isNaN(r.puntaje) && !Number.isNaN(r.nivel));
    } catch (err) {
        console.warn("Error leyendo historial en localStorage:", err);
        return [];
    }
}

/**
 * Guarda una nueva partida en localStorage conservando la estructura:
 * { fecha, hora, puntaje, nivel, duracionSegundos }
 */
export function saveGameHistory(score, level, durationSeconds) {
    const history = loadGameHistory();
    const { fecha, hora } = formatDateTime(new Date());
    const roundedDuration = Number(Number(durationSeconds || 0).toFixed(1));

    const record = {
        fecha,
        hora,
        puntaje: Math.floor(score),
        nivel: Math.floor(level),
        duracionSegundos: roundedDuration,
        duracion: roundedDuration
    };

    history.push(record);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
        console.warn("Error guardando historial en localStorage:", err);
    }

    return record;
}

/**
 * Devuelve el resumen estadístico idéntico a get_history_summary() de Python:
 * { total_games, best_score, best_level, latest }
 */
export function getHistorySummary() {
    const history = loadGameHistory();

    if (!history || history.length === 0) {
        return {
            total_games: 0,
            best_score: 0,
            best_level: 0,
            latest: []
        };
    }

    let bestScore = 0;
    let bestLevel = 0;

    for (const game of history) {
        if (game.puntaje > bestScore) bestScore = game.puntaje;
        if (game.nivel > bestLevel) bestLevel = game.nivel;
    }

    const latest = history
        .slice(-HISTORY_DISPLAY_LIMIT)
        .reverse();

    return {
        total_games: history.length,
        best_score: bestScore,
        best_level: bestLevel,
        latest
    };
}
