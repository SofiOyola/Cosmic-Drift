# Cosmic Drift

<div align="center">

### Videojuego interactivo controlado mediante gestos de la mano

**HTML5 | CSS3 | JavaScript ES6 | MediaPipe | Canvas API | Web Audio API**

Cosmic Drift transforma los movimientos y gestos de una mano frente a la cámara en controles para una nave espacial.

</div>

---

## Descripción

**Cosmic Drift** es un videojuego interactivo controlado mediante visión por computador. El jugador utiliza una mano frente a la cámara para mover una nave espacial, disparar, activar un escudo y utilizar un impulso especial mientras recolecta orbes y evita diferentes tipos de enemigos.

El proyecto fue desarrollado originalmente como una aplicación de escritorio en **Python**, utilizando Pygame, OpenCV y MediaPipe. Posteriormente fue adaptado completamente a tecnologías web para permitir su ejecución directamente desde un navegador moderno, sin necesidad de instalar Python ni las librerías originales.

La versión web conserva la resolución lógica de **1280 × 720**, la estética, los recursos gráficos, los sonidos, los niveles, los enemigos y las principales mecánicas de la versión original.

---

# Objetivo del proyecto

El objetivo de Cosmic Drift es desarrollar una experiencia de videojuego basada en **interacción natural**, donde los movimientos y gestos de la mano sustituyen controles tradicionales como el teclado, el ratón o un gamepad.

El proyecto busca integrar:

- Visión por computador.
- Seguimiento de manos.
- Reconocimiento de gestos.
- Desarrollo de videojuegos.
- Interacción humano-computador.
- Procesamiento multimedia en tiempo real.
- Tecnologías web.

La versión web permite que todo el procesamiento principal del videojuego se realice directamente en el navegador del jugador.

---

# Características principales

Cosmic Drift incluye:

- Control de la nave mediante el movimiento de una mano.
- Seguimiento de una mano con 21 puntos de referencia.
- Cámara en modo espejo.
- Movimiento suavizado de la nave.
- Disparo mediante un puño cerrado.
- Escudo Astral mediante dos dedos levantados.
- Impulso Cósmico al acercar la mano a la cámara.
- Sistema de orbes.
- Enemigos morados.
- Enemigos rojos de mayor velocidad desde el nivel 5.
- Sistema de energía y daño.
- Sistema progresivo de niveles.
- Incremento de dificultad.
- Música de fondo.
- Efectos de sonido.
- Historial de partidas.
- Pantalla de Game Over.
- Modo de pantalla completa.
- Interfaz adaptable manteniendo una resolución lógica de 1280 × 720.

---

# Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| HTML5 | Estructura principal de la aplicación |
| CSS3 | Diseño y adaptación visual |
| JavaScript ES6 | Lógica completa del videojuego |
| HTML5 Canvas | Renderizado del juego |
| MediaPipe Tasks Vision | Seguimiento y landmarks de la mano |
| MediaDevices API | Acceso a la cámara |
| Web Audio / HTML5 Audio | Música y efectos |
| LocalStorage | Historial de partidas |
| requestAnimationFrame | Ciclo principal del videojuego |

---

# De Python a Web

Cosmic Drift nació originalmente como una aplicación de escritorio.

La arquitectura anterior utilizaba:

```text
Python
│
├── Pygame
├── OpenCV
├── MediaPipe
└── CSV
```

La versión actual utiliza:

```text
Navegador
│
├── HTML
├── CSS
├── JavaScript
├── HTML5 Canvas
├── MediaPipe Web
├── Web Audio
├── getUserMedia
└── localStorage
```

La equivalencia principal entre ambas versiones es:

| Versión original | Versión web |
|---|---|
| Python | JavaScript ES6 |
| Pygame | HTML5 Canvas |
| `pygame.display` | `<canvas>` |
| `pygame.image` | `Image()` |
| `pygame.mixer` | `Audio()` |
| OpenCV `VideoCapture(0)` | `getUserMedia()` |
| MediaPipe Python | MediaPipe Tasks Vision Web |
| `while running` | `requestAnimationFrame()` |
| `pygame.time.get_ticks()` | `performance.now()` |
| CSV | localStorage |
| Aplicación de escritorio | Aplicación web |

---

# Requisitos

Para ejecutar la versión web se necesita:

| Requisito | Recomendación |
|---|---|
| Navegador | Google Chrome, Microsoft Edge o Firefox reciente |
| Cámara | Webcam integrada o externa |
| JavaScript | Habilitado |
| Conexión a Internet | Necesaria para cargar MediaPipe y su modelo |
| Protocolo | HTTPS o localhost |
| Resolución recomendada | 1280 × 720 o superior |

La cámara requiere permiso del usuario.

Al abrir Cosmic Drift, el navegador solicitará autorización para utilizar la webcam.

---

# ¿Necesita Python?

## Versión web

**No.**

La versión actual de Cosmic Drift no necesita Python para ejecutarse.

Tampoco requiere instalar:

```text
pygame
opencv-python
mediapipe
numpy
```

El videojuego se ejecuta directamente mediante tecnologías del navegador.

Por tanto, la versión web **no tiene una restricción de versión de Python**.

---

## Versión original

La versión desarrollada originalmente en Python se conserva dentro de:

```text
original-python/
```

Para esa versión se utilizó principalmente:

```text
Python 3.11
```

junto con Pygame, OpenCV, MediaPipe y NumPy.

Esta implementación se mantiene únicamente como referencia de la versión original del proyecto.

---

# MediaPipe

El seguimiento de la mano utiliza:

```text
@mediapipe/tasks-vision 0.10.14
```

MediaPipe se carga mediante CDN desde JavaScript.

El sistema está configurado para detectar:

```text
1 mano
```

y obtener sus:

```text
21 landmarks
```

Los principales puntos utilizados corresponden a:

```text
0  → Muñeca

4  → Pulgar
8  → Índice
12 → Dedo medio
16 → Anular
20 → Meñique

5, 9, 13 y 17
→ Palma
```

El centro de la palma se calcula utilizando los puntos:

```text
0, 5, 9, 13 y 17
```

---

# Controles

Cosmic Drift está diseñado principalmente para jugarse utilizando gestos.

| Acción | Control |
|---|---|
| Mover nave | Mover la mano |
| Disparar | Cerrar la mano formando un puño |
| Escudo Astral | Levantar índice y dedo medio |
| Impulso Cósmico | Acercar la mano a la cámara |
| Pantalla completa | `F` |
| Regresar al menú | `Esc` |

---

# Movimiento de la nave

La posición de la nave corresponde al centro detectado de la palma.

```text
Mover mano a la izquierda
        ↓
Nave hacia la izquierda

Mover mano a la derecha
        ↓
Nave hacia la derecha

Mover mano hacia arriba
        ↓
Nave hacia arriba

Mover mano hacia abajo
        ↓
Nave hacia abajo
```

El movimiento utiliza suavizado para evitar desplazamientos bruscos producidos por pequeñas variaciones en la detección de MediaPipe.

---

# Disparo

Para disparar:

```text
Cierra la mano
      ↓
    Puño
      ↓
   Disparo
```

El reconocimiento requiere que el gesto permanezca estable durante varios fotogramas para reducir activaciones accidentales.

Los disparos tienen un tiempo de espera aproximado de:

```text
350 ms
```

entre cada lanzamiento.

Destruir un enemigo mediante un disparo otorga puntos adicionales.

---

# Escudo Astral

Para activar el escudo:

```text
Índice levantado
        +
Dedo medio levantado
        ↓
Escudo Astral
```

El escudo protege a la nave mientras el gesto se mantiene correctamente detectado.

---

# Impulso Cósmico

El Impulso Cósmico se controla mediante la proximidad de la mano.

```text
Acercar mano a la cámara
           ↓
Aumenta tamaño aparente de la palma
           ↓
     Impulso Cósmico
```

El sistema calcula la proximidad utilizando el tamaño aparente de la palma detectada por MediaPipe.

---

# Orbes

Durante la partida aparecen orbes que pueden ser recolectados por la nave.

Cada orbe recolectado proporciona:

```text
+10 puntos
```

Además, reproduce el efecto:

```text
assets/audio/recolectar.wav
```

La cantidad de orbes activos puede aumentar progresivamente con el nivel.

---

# Enemigos

## Enemigo morado

Es el enemigo principal desde los primeros niveles.

Puede:

- Colisionar con la nave.
- Reducir la energía.
- Ser destruido mediante disparos.
- Ser bloqueado mediante el escudo.

Destruir un enemigo mediante un proyectil otorga:

```text
+5 puntos
```

---

## Enemigo rojo

El enemigo rojo aparece a partir del:

```text
Nivel 5
```

Tiene una velocidad superior a la del enemigo morado.

Su velocidad está configurada aproximadamente entre:

```text
240 - 320 px/s
```

Esto aumenta considerablemente la dificultad durante los niveles superiores.

---

# Sistema de niveles

El nivel se calcula a partir del puntaje.

Actualmente se utiliza:

```text
40 puntos = 1 nivel
```

De forma equivalente:

```javascript
nivel = Math.floor(puntaje / 40) + 1;
```

Conforme aumenta el nivel también incrementan:

- La cantidad de enemigos.
- La velocidad.
- El daño.
- La dificultad general.

La velocidad puede incrementar progresivamente hasta aproximadamente:

```text
1.8x
```

respecto a la velocidad base.

---

# Sistema de daño

El daño base es:

```text
10
```

y aumenta según el nivel.

La lógica utilizada es:

```text
Daño = 10 + ((nivel - 1) × 2)
```

Esto hace que los enemigos sean progresivamente más peligrosos.

---

# Audio

El proyecto reutiliza los archivos de sonido originales.

```text
assets/audio/
│
├── musica_fondo.ogg
├── golpe.wav
├── escudo.wav
├── disparo.wav
└── recolectar.wav
```

Cada archivo tiene una función específica:

| Archivo | Función |
|---|---|
| `musica_fondo.ogg` | Música durante la partida |
| `golpe.wav` | Daño recibido |
| `escudo.wav` | Activación del escudo |
| `disparo.wav` | Lanzamiento de proyectil |
| `recolectar.wav` | Recolección de orbe |

---

# Historial de partidas

La versión original almacenaba el historial en:

```text
data/historial_partidas.csv
```

La versión web utiliza:

```text
localStorage
```

para conservar los resultados directamente en el navegador.

Cada partida almacena:

```text
Fecha
Hora
Puntaje
Nivel
Duración
```

La clave utilizada es:

```text
cosmic_drift_historial_v1
```

Cuando el jugador abre Cosmic Drift por primera vez, el sistema también puede utilizar:

```text
data/historial_partidas.csv
```

como historial inicial.

Después, las nuevas partidas se almacenan localmente en el navegador.

Esto significa que el historial no se comparte automáticamente entre diferentes computadores o navegadores.

---

# Estructura del proyecto

```text
Cosmic-Drift/
│
├── index.html
│
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

# Función de los archivos JavaScript

## `main.js`

Es el punto de entrada de la aplicación.

Se encarga de:

- Inicializar el historial.
- Precargar recursos gráficos.
- Precargar audio.
- Inicializar MediaPipe.
- Solicitar la cámara.
- Crear el juego.
- Iniciar el ciclo principal.

---

## `config.js`

Contiene las configuraciones y constantes generales.

Entre ellas:

```text
Resolución
FPS
Colores
Velocidades
Puntajes
Daño
Niveles
Rutas de assets
Configuración de cámara
Configuración de gestos
```

---

## `game.js`

Coordina la lógica general del videojuego:

```text
Estados
Ciclo principal
Puntaje
Nivel
Cámara
MediaPipe
Gestos
Entidades
Audio
Game Over
```

---

## `camera.js`

Gestiona el acceso a la cámara mediante:

```javascript
navigator.mediaDevices.getUserMedia()
```

---

## `hands.js`

Realiza:

- Seguimiento de la mano.
- MediaPipe Hand Landmarker.
- Obtención de 21 landmarks.
- Imagen espejo.
- Centro de palma.
- Proximidad.
- Suavizado de movimiento.

---

## `gestures.js`

Reconoce:

```text
Mano abierta
Puño
Dos dedos
Proximidad
```

y los convierte en acciones dentro del juego.

---

## `player.js`

Gestiona:

```text
Nave
Posición
Energía
Movimiento
Escudo
Impulso
```

---

## `enemies.js`

Gestiona:

```text
Enemigos morados
Enemigo rojo
Velocidades
Aparición
Movimiento
```

---

## `orbs.js`

Controla:

```text
Creación
Movimiento
Recolección
Puntaje
```

de los orbes.

---

## `projectiles.js`

Gestiona los disparos de la nave.

---

## `collisions.js`

Contiene las funciones utilizadas para detectar las diferentes colisiones del videojuego.

---

## `audio.js`

Administra:

```text
Música
Disparo
Escudo
Golpe
Recolección
Volumen
Fade-in
Fade-out
```

---

## `storage.js`

Administra el historial mediante:

```text
localStorage
```

y puede cargar inicialmente la información existente en:

```text
data/historial_partidas.csv
```

---

## `ui.js`

Contiene elementos relacionados con:

```text
Menú
HUD
Mensajes
Game Over
Interfaz visual
```

---

# Cómo ejecutar el proyecto

## Opción 1 — Visual Studio Code con Live Server

Esta es una de las formas más sencillas para desarrollo local.

1. Clona el repositorio:

```bash
git clone https://github.com/SofiOyola/Cosmic-Drift.git
```

2. Ingresa a la carpeta:

```bash
cd Cosmic-Drift
```

3. Abre el proyecto en Visual Studio Code.

4. Utiliza una extensión como **Live Server** para abrir `index.html`.

5. Permite el acceso a la cámara cuando el navegador lo solicite.

---

# Opción 2 — Servidor HTTP local con Python

Python **no es una dependencia del videojuego**, pero puede utilizarse simplemente para crear un servidor HTTP local.

Desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

o:

```bash
python3 -m http.server 8000
```

Después abre:

```text
http://localhost:8000
```

en el navegador.

`localhost` puede utilizar la cámara durante el desarrollo.

---

# No abrir directamente `index.html`

No se recomienda ejecutar el juego mediante:

```text
file:///...
```

debido a que el proyecto utiliza:

- Módulos ES6.
- `fetch()`.
- Cámara.
- MediaPipe.
- Recursos externos.

Utiliza siempre un servidor HTTP local o un servidor HTTPS.

---

# Despliegue web

Cosmic Drift es actualmente una aplicación web estática.

Esto significa que **no necesita un backend ni un servidor Python para funcionar**.

Puede desplegarse utilizando:

```text
Nginx
GitHub Pages
Azure
Azure Static Web Apps
Cloudflare Pages
Netlify
Vercel
```

La estructura básica del despliegue es:

```text
Usuario
   ↓
HTTPS
   ↓
Servidor web
   ↓
index.html
   ↓
JavaScript + Canvas + MediaPipe
   ↓
Juego ejecutándose en el navegador
```

---

# HTTPS y cámara

Para acceder a la webcam desde un sitio publicado, el juego debe ejecutarse mediante:

```text
HTTPS
```

Durante el desarrollo local también puede ejecutarse mediante:

```text
http://localhost
```

Al iniciar Cosmic Drift, el navegador solicitará permiso para utilizar la cámara.

El permiso debe ser aceptado para utilizar los controles mediante gestos.

---

# Cómo jugar

1. Abre Cosmic Drift desde un navegador compatible.
2. Permite el acceso a la cámara.
3. Espera a que los recursos y MediaPipe terminen de cargar.
4. Selecciona **Empezar a jugar**.
5. Se iniciará una cuenta regresiva.
6. Coloca una mano claramente frente a la cámara.
7. Mueve la mano para controlar la nave.
8. Cierra el puño para disparar.
9. Levanta índice y dedo medio para activar el Escudo Astral.
10. Acerca la mano a la cámara para activar el Impulso Cósmico.
11. Recolecta orbes.
12. Evita o destruye enemigos.
13. Obtén puntos para aumentar de nivel.

---

# Recomendaciones de uso

Para mejorar el reconocimiento:

- Utiliza una habitación bien iluminada.
- Mantén la mano visible.
- Evita fondos con demasiado movimiento.
- Separa claramente los dedos.
- Evita movimientos excesivamente rápidos.
- Mantén una distancia adecuada respecto a la cámara.
- Evita que varias personas coloquen sus manos simultáneamente frente a la cámara.
- Comprueba que ninguna otra aplicación esté bloqueando la webcam.

---

# Compatibilidad

La versión web está diseñada para navegadores modernos que soporten:

```text
ES Modules
Canvas 2D
getUserMedia
Web Audio
localStorage
requestAnimationFrame
WebAssembly
```

Se recomienda utilizar versiones recientes de:

```text
Google Chrome
Microsoft Edge
Mozilla Firefox
```

La disponibilidad y rendimiento del procesamiento por GPU puede depender del navegador y del dispositivo.

Si la aceleración GPU no está disponible para MediaPipe, el proyecto puede utilizar procesamiento por CPU.

---

# Limitaciones actuales

La versión web presenta algunas consideraciones:

- Necesita acceso a una cámara.
- El reconocimiento depende de las condiciones de iluminación.
- Solo procesa una mano simultáneamente.
- El rendimiento depende del computador del jugador.
- MediaPipe se carga desde recursos externos, por lo que se requiere conexión a Internet durante la carga.
- El historial se almacena localmente y no se sincroniza entre dispositivos.
- No existe actualmente una base de datos centralizada.
- Los permisos de cámara dependen del navegador.
- En producción debe utilizarse HTTPS.

---

# Resolución

Cosmic Drift utiliza una resolución lógica de:

```text
1280 × 720
```

correspondiente a una relación:

```text
16:9
```

La interfaz puede escalar visualmente según el tamaño de la pantalla manteniendo las proporciones originales.

---

# Rendimiento

El juego utiliza como referencia:

```text
60 FPS
```

mediante:

```javascript
requestAnimationFrame()
```

MediaPipe no necesariamente procesa cada fotograma del juego. El seguimiento puede distribuirse entre diferentes frames para mejorar el rendimiento general.

---

# Recursos gráficos

Los recursos originales se mantienen dentro de:

```text
assets/
```

Entre ellos:

```text
fondo_cosmico.png
nave.png
gato_astronauta.png
flor_game_over.png
```

Esto permite conservar la identidad visual de la versión original desarrollada con Pygame.

---

# Versión original en Python

La implementación original se conserva dentro de:

```text
original-python/
```

con:

```text
fase1_mano.py
fase2_cosmic_drift.py
```

Esta versión representa el desarrollo inicial del videojuego y sirve como referencia para comparar la migración desde:

```text
Python + Pygame + OpenCV + MediaPipe
```

hacia:

```text
HTML + CSS + JavaScript + Canvas + MediaPipe Web
```

---

# Flujo general

```text
Cámara del jugador
        ↓
getUserMedia
        ↓
MediaPipe Hand Landmarker
        ↓
21 puntos de la mano
        ↓
Posición + Gestos + Proximidad
        ↓
JavaScript
        ↓
┌────────────────────────────┐
│         Cosmic Drift       │
│                            │
│ Movimiento                 │
│ Disparo                    │
│ Escudo                     │
│ Impulso Cósmico            │
│ Colisiones                 │
│ Orbes                      │
│ Enemigos                   │
│ Puntaje                    │
│ Niveles                    │
│ Audio                      │
└────────────────────────────┘
        ↓
HTML5 Canvas
        ↓
Videojuego en el navegador
```

---

# Repositorio

Código fuente disponible en:

https://github.com/SofiOyola/Cosmic-Drift

---

<div align="center">

## Cosmic Drift

**Controla la nave con tu mano, recolecta orbes, esquiva enemigos y avanza a través del espacio.**

Desarrollado originalmente en Python y adaptado posteriormente para ejecutarse directamente en la web.

</div>
