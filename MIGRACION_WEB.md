# Cosmic Drift — Plan de migración de Python/Pygame a Web

## Objetivo

Convertir **Cosmic Drift**, originalmente desarrollado en Python con Pygame, OpenCV y MediaPipe, en una aplicación web que se ejecuta directamente desde cualquier navegador moderno conservando la misma apariencia, resolución lógica (`1280 × 720`), tipografía Fraktur, mecánicas, controles por gestos de mano, sonidos, niveles, enemigos y comportamiento de la versión original.

---

## Arquitectura Web Implementada

```text
Cosmic-Drift/
│
├── index.html
├── README.md
├── MIGRACION_WEB.md
│
├── css/
│   └── styles.css
│
├── js/
│   ├── main.js
│   ├── config.js
│   ├── game.js
│   ├── camera.js
│   ├── hands.js
│   ├── gestures.js
│   ├── player.js
│   ├── enemies.js
│   ├── orbs.js
│   ├── projectiles.js
│   ├── collisions.js
│   ├── audio.js
│   ├── storage.js
│   └── ui.js
│
├── assets/
│   ├── audio/
│   ├── backgrounds/
│   ├── ship/
│   └── ui/
│
├── data/
│   └── historial_partidas.csv
│
└── original-python/
    ├── fase1_mano.py
    └── fase2_cosmic_drift.py
```

---

## Conversión de Tecnologías

| Versión Python | Versión Web |
|---|---|
| Python | JavaScript ES6 Modular |
| Pygame (`1280 × 720`) | HTML5 `<canvas>` 2D API (`1280 × 720`) |
| `pygame.image` | `Image()` precargado |
| `pygame.mixer` | HTML5 `Audio()` con control de volumen y fade |
| OpenCV `cv2.VideoCapture(0)` | `navigator.mediaDevices.getUserMedia()` |
| MediaPipe Python (`mp.solutions.hands`) | MediaPipe Tasks Vision Web (`HandLandmarker`) |
| `while running:` (`clock.tick(60)`) | `requestAnimationFrame()` con delta time (`dt`) |
| `pygame.time.get_ticks()` | `performance.now()` |
| `data/historial_partidas.csv` | `localStorage` inicializado con semilla desde CSV |

---

## Estado de las Fases de Migración

### Fase 1 — Infraestructura
- [x] Estructura web estática lista para Nginx / Azure / GitHub Pages / Vercel / Netlify

### Fase 2 — Cámara
- [x] Abrir cámara desde navegador (`camera.js`)
- [x] Solicitar permisos con `getUserMedia`
- [x] Mostrar cámara en el panel izquierdo
- [x] Imagen espejo (`scaleX(-1)` y `1 - handX`)

### Fase 3 — MediaPipe
- [x] MediaPipe Tasks Vision Web (`hands.js`)
- [x] Detectar 1 mano
- [x] Mostrar los 21 landmarks y conexiones en la minicámara
- [x] Obtener centro de palma (`[0, 5, 9, 13, 17]`) y suavizado EMA (`alpha = 0.25`)

### Fase 4 — Pantalla original
- [x] Crear Canvas `1280 × 720`
- [x] Cargar fondo original (`assets/backgrounds/fondo_cosmico.png`)
- [x] Cargar nave original (`assets/ship/nave.png`)
- [x] Recrear interfaz original, tarjetas redondeadas y tipografía Fraktur (`ℂ𝕠𝕤𝕞𝕚𝕔 𝔻𝕣𝕚𝕗𝕥`)
- [x] Recrear HUD en panel izquierdo (`380 px`)
- [x] Posicionar cámara y leyenda de enemigos/orbes
- [x] Cargar gato astronauta (`assets/ui/gato_astronauta.png`) y flor (`assets/ui/flor_game_over.png`)

### Fase 5 — Movimiento
- [x] Convertir coordenadas normalizadas de MediaPipe al área jugable (`GAME_X = 380` a `1280`)
- [x] Mover nave con suavizado (`SHIP_FOLLOW_SPEED = 0.18`)
- [x] Limitar movimiento al área jugable (`margin = 45px`)
- [x] Coincidencia espejo izquierda/derecha con el jugador

### Fase 6 — Gestos
- [x] Detectar puño cerrado (`detectarPuno`) y estabilización de 4 frames
- [x] Disparar proyectiles con cooldown de `350 ms`
- [x] Detectar dos dedos (`detectarGestoEscudo`) y activar Escudo Astral
- [x] Detectar proximidad de palma (`evaluarImpulsoCosmico`, histéresis `0.30` / `0.26`) y activar Impulso Cósmico

### Fase 7 — Orbes
- [x] Pool de hasta 4 orbes activos según nivel
- [x] Movimiento descendente, colisiones circulares, `+10` puntos y sonido `recolectar.wav`

### Fase 8 — Enemigo morado
- [x] Pool de hasta 6 enemigos morados activos según nivel
- [x] Movimiento, colisiones con nave/escudo, daño progresivo y destrucción por disparo (`+5` puntos)

### Fase 9 — Enemigo rojo
- [x] Aparición exclusiva desde el Nivel 5 (`RED_ENEMY_START_LEVEL = 5`)
- [x] Mayor velocidad (`240 - 320 px/s`), estética roja original, colisiones, daño y destrucción

### Fase 10 — Niveles
- [x] Progresión de `40` puntos por nivel (`Math.floor(score / 40) + 1`)
- [x] Incremento de velocidad (`+10%` por nivel hasta `1.8x`, `+15%` con Impulso Cósmico)
- [x] Incremento de daño (`10 + (nivel - 1) * 2`)

### Fase 11 — Audio
- [x] Música de fondo (`musica_fondo.ogg`, volumen `0.28`) con fade-in y fade-out
- [x] Efectos de disparo (`disparo.wav`), escudo (`escudo.wav`), golpe (`golpe.wav`) y recolección (`recolectar.wav`)

### Fase 12 — Game Over
- [x] Detección de energía `<= 0`, detención de partida y música
- [x] Pantalla Game Over con `flor_game_over.png`, `Historial Cósmico` y `Gato Cósmico`
- [x] Botones `Jugar otra vez` y `Salir`

### Fase 13 — Historial
- [x] Registro de fecha, hora, puntaje, nivel y duración en `localStorage` (`storage.js`)
- [x] Carga inicial automática de `data/historial_partidas.csv`
