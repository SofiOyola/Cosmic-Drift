// ============================================================
// COSMIC DRIFT WEB — SISTEMA DE AUDIO (audio.js)
// Reemplaza pygame.mixer usando HTML5 Audio / Web Audio API
// ============================================================

import { ASSETS, VOLUMES } from "./config.js";

class AudioManager {
    constructor() {
        this.music = null;
        this.sounds = {
            damage: null,
            shield: null,
            shot: null,
            collect: null
        };
        this.musicLoaded = false;
        this.muted = false;
        this.fadeInterval = null;
    }

    /**
     * Precarga todos los efectos de sonido y la música de fondo.
     */
    async preloadAll() {
        const loadAudioElement = (src, volume, loop = false) => {
            return new Promise((resolve) => {
                const audio = new Audio();
                audio.preload = "auto";
                audio.volume = volume;
                audio.loop = loop;

                let settled = false;
                const finish = (ok) => {
                    if (!settled) {
                        settled = true;
                        resolve({ audio, ok });
                    }
                };

                audio.addEventListener("canplaythrough", () => finish(true), { once: true });
                audio.addEventListener("loadeddata", () => finish(true), { once: true });
                audio.addEventListener("error", () => {
                    console.warn(`ADVERTENCIA: no se pudo cargar el audio ${src}`);
                    finish(false);
                }, { once: true });

                // Timeout de seguridad para no bloquear la carga si el navegador difiere el buffer
                setTimeout(() => finish(true), 2500);

                audio.src = src;
                audio.load();
            });
        };

        const [musicRes, damageRes, shieldRes, shotRes, collectRes] = await Promise.all([
            loadAudioElement(ASSETS.audio.music, VOLUMES.music, true),
            loadAudioElement(ASSETS.audio.damage, VOLUMES.damage, false),
            loadAudioElement(ASSETS.audio.shield, VOLUMES.shield, false),
            loadAudioElement(ASSETS.audio.shot, VOLUMES.shot, false),
            loadAudioElement(ASSETS.audio.collect, VOLUMES.collect, false)
        ]);

        if (musicRes.ok) {
            this.music = musicRes.audio;
            this.musicLoaded = true;
        }
        if (damageRes.ok) this.sounds.damage = damageRes.audio;
        if (shieldRes.ok) this.sounds.shield = shieldRes.audio;
        if (shotRes.ok) this.sounds.shot = shotRes.audio;
        if (collectRes.ok) this.sounds.collect = collectRes.audio;
    }

    /**
     * Reproduce un efecto de sonido sin bloquear ni cortar superposiciones.
     */
    playSound(name) {
        if (this.muted) return;
        const baseSound = this.sounds[name];
        if (!baseSound) return;

        try {
            // Clonamos el nodo para permitir disparos o recolecciones rápidas simultáneas
            const clone = baseSound.cloneNode();
            clone.volume = baseSound.volume;
            clone.play().catch(() => {
                // Ignorar bloqueo de autoplay si aún no hubo interacción
            });
        } catch (err) {
            // Fallback directo
            try {
                baseSound.currentTime = 0;
                baseSound.play().catch(() => {});
            } catch (_) {}
        }
    }

    playShot() {
        this.playSound("shot");
    }

    playShield() {
        this.playSound("shield");
    }

    playDamage() {
        this.playSound("damage");
    }

    playCollect() {
        this.playSound("collect");
    }

    /**
     * Inicia la música de fondo con un fade-in suave de 600ms (igual que fade_ms=600 en Pygame)
     */
    startBackgroundMusic() {
        if (!this.musicLoaded || !this.music || this.muted) return;

        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }

        try {
            this.music.currentTime = 0;
            this.music.volume = 0.01;
            const playPromise = this.music.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.warn("Reproducción de música pendiente de interacción:", err);
                });
            }

            const targetVolume = VOLUMES.music;
            const steps = 12;
            const stepTime = 600 / steps;
            let currentStep = 0;

            this.fadeInterval = setInterval(() => {
                currentStep++;
                if (currentStep >= steps || !this.music) {
                    if (this.music) this.music.volume = targetVolume;
                    clearInterval(this.fadeInterval);
                    this.fadeInterval = null;
                } else {
                    this.music.volume = Math.min(targetVolume, (targetVolume * currentStep) / steps);
                }
            }, stepTime);
        } catch (err) {
            console.warn("Error iniciando música de fondo:", err);
        }
    }

    /**
     * Detiene la música de fondo con fade-out de 700ms (igual que fadeout(700) en Pygame)
     */
    stopBackgroundMusic() {
        if (!this.musicLoaded || !this.music) return;

        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }

        const startVol = this.music.volume || VOLUMES.music;
        const steps = 14;
        const stepTime = 700 / steps;
        let currentStep = 0;

        this.fadeInterval = setInterval(() => {
            currentStep++;
            if (currentStep >= steps || !this.music) {
                if (this.music) {
                    this.music.pause();
                    this.music.currentTime = 0;
                    this.music.volume = VOLUMES.music;
                }
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
            } else {
                this.music.volume = Math.max(0, startVol * (1 - currentStep / steps));
            }
        }, stepTime);
    }
}

export const audioManager = new AudioManager();
