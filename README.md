# Cosmic Drift

<div align="center">

### Videojuego interactivo controlado mediante seguimiento de manos

**Python | OpenCV | MediaPipe | Pygame**

</div>

---

## Descripción

**Cosmic Drift** es un videojuego interactivo desarrollado en Python que utiliza visión por computadora para permitir que el jugador controle una nave espacial mediante los movimientos y gestos de su mano frente a una cámara.

El sistema emplea **MediaPipe Hands** para detectar la mano y sus puntos de referencia, **OpenCV** para capturar y procesar la imagen de la cámara y **Pygame** para desarrollar la interfaz, las mecánicas del juego, las animaciones y los efectos de sonido.

La propuesta busca integrar interacción natural, visión artificial y desarrollo de videojuegos dentro de una experiencia en la que el jugador puede moverse, defenderse, atacar y avanzar de nivel sin depender de controles tradicionales.

---

## Objetivo del proyecto

El objetivo de **Cosmic Drift** es desarrollar un videojuego controlado mediante movimientos y gestos de la mano, utilizando técnicas de visión por computadora para transformar la posición y las acciones del usuario en controles dentro del juego.

El jugador debe controlar una nave espacial, recolectar orbes positivos, evitar o destruir enemigos y avanzar progresivamente a través de diferentes niveles.

Entre las principales mecánicas se encuentran:

- Movimiento de la nave mediante la posición de la mano.
- Activación de un impulso cósmico mediante la proximidad de la mano a la cámara.
- Disparo mediante el gesto de puño cerrado.
- Activación de un escudo mediante el gesto de dos dedos.
- Recolección de orbes para aumentar el puntaje.
- Aparición de enemigos morados.
- Aparición de enemigos rojos más rápidos a partir del nivel 5.
- Sistema de daño progresivo según el nivel.
- Música y efectos de sonido.
- Registro del historial de partidas.
- Sistema de niveles y puntaje.
- Pantalla de Game Over.

---

## Requisitos

Para ejecutar el proyecto se recomienda contar con:

| Requisito | Especificación |
|---|---|
| Python | 3.11 recomendado |
| Versiones compatibles recomendadas | Python 3.11 o 3.12 |
| Cámara | Webcam o cámara reconocida por OpenCV |
| Resolución recomendada | 1280 × 720 o superior |
| Sistema operativo | Windows, Linux o macOS |
| Git | Recomendado para clonar el repositorio |
| pip | Necesario para instalar las dependencias |

### Versión de Python

El proyecto actualmente no contiene un archivo específico como `.python-version` o `pyproject.toml` que obligue a utilizar una única versión de Python.

Sin embargo, debido a las versiones definidas dentro de `requirements.txt`, se recomienda utilizar:

```text
Python 3.11
```

También puede utilizarse:

```text
Python 3.12
```

Por compatibilidad entre las dependencias actuales, se recomienda mantenerse dentro del rango:

```text
Python >= 3.11 y <= 3.12
```

No se recomienda utilizar Python 3.13 o versiones superiores sin comprobar previamente la compatibilidad de MediaPipe y las demás dependencias.

---

## Librerías principales

Aunque `requirements.txt` contiene el entorno completo utilizado durante el desarrollo, las librerías principales utilizadas directamente por el videojuego son las siguientes:

| Librería | Versión actual | Función |
|---|---:|---|
| `pygame` | 2.6.1 | Interfaz del videojuego, gráficos, eventos, audio y mecánicas |
| `mediapipe` | 0.10.21 | Detección y seguimiento de la mano |
| `opencv-python` | 4.11.0.86 | Captura y procesamiento de la cámara |
| `opencv-contrib-python` | 4.11.0.86 | Funcionalidades adicionales de OpenCV |

El proyecto también utiliza módulos incluidos directamente en Python, por lo que no necesitan instalarse de manera independiente:

```python
math
random
sys
os
csv
datetime
```

Para reproducir el entorno completo utilizado en el proyecto se recomienda instalar directamente el archivo:

```bash
pip install -r requirements.txt
```

---

## Instalación

### 1. Clonar el repositorio

Desde una terminal, PowerShell, CMD o la terminal integrada de Visual Studio Code:

```bash
git clone https://github.com/SofiOyola/Cosmic-Drift.git
```

Luego ingrese a la carpeta:

```bash
cd Cosmic-Drift
```

---

### 2. Crear un entorno virtual

Es recomendable trabajar con un entorno virtual para evitar conflictos con otras instalaciones de Python.

Ejecute:

```bash
python -m venv .venv
```

#### Windows

Active el entorno con:

```bash
.venv\Scripts\activate
```

#### Linux o macOS

```bash
source .venv/bin/activate
```

Cuando el entorno esté activo debería aparecer algo similar a:

```text
(.venv)
```

al comienzo de la terminal.

---

### 3. Actualizar pip

```bash
python -m pip install --upgrade pip
```

---

### 4. Instalar las dependencias

Ejecute:

```bash
pip install -r requirements.txt
```

Este proceso instalará las librerías y versiones utilizadas por el proyecto.

---

## Cómo ejecutar el proyecto

El repositorio contiene dos archivos Python principales.

### Prueba del seguimiento de mano

Antes de ejecutar el videojuego completo puede comprobar que la cámara y MediaPipe detecten correctamente la mano utilizando:

```bash
python fase1_mano.py
```

Este archivo corresponde a una etapa de prueba del sistema de visión por computadora y permite verificar:

- Captura de la cámara.
- Detección de la mano.
- Puntos de referencia de MediaPipe.
- Posición horizontal de la mano.
- Posición vertical de la mano.
- Proximidad de la mano a la cámara.
- Seguimiento de los movimientos.

Si esta fase funciona correctamente, puede continuar con el juego principal.

---

### Ejecutar Cosmic Drift

Para iniciar el videojuego completo ejecute:

```bash
python fase2_cosmic_drift.py
```

Se abrirá la ventana principal de:

```text
Cosmic Drift
```

La aplicación utiliza la cámara configurada como:

```python
CAMERA_INDEX = 0
```

Por lo tanto, normalmente utilizará la cámara principal del computador.

---

## Instrucciones de uso

Para jugar es necesario mantener una mano visible frente a la cámara.

### Movimiento

Mueva la mano hacia:

```text
Izquierda
Derecha
Arriba
Abajo
```

La nave seguirá progresivamente la posición detectada de la mano.

No es necesario utilizar teclado para controlar el movimiento principal de la nave.

---

### Impulso Cósmico

Acerque la mano hacia la cámara.

Cuando el sistema detecta que la mano se encuentra suficientemente cerca, activa el modo de impulso o turbo.

Este mecanismo utiliza el tamaño aparente de la palma para calcular la proximidad del jugador a la cámara.

---

### Disparo

Realice el gesto de:

```text
Puño cerrado
```

El juego reconocerá el gesto y la nave disparará un proyectil.

Los disparos pueden utilizarse para destruir obstáculos o enemigos y obtener puntos.

---

### Escudo

Realice el gesto de:

```text
Dos dedos levantados
```

El sistema reconoce este gesto como una señal para activar el escudo de la nave.

El escudo permite protegerse temporalmente frente a determinados peligros.

---

## Mecánicas del juego

### Orbes

Durante la partida aparecen orbes que el jugador debe recolectar.

Recolectarlos permite aumentar el puntaje y continuar progresando dentro del juego.

---

### Enemigos morados

Los enemigos morados representan uno de los principales peligros.

El jugador debe evitar entrar en contacto con ellos o utilizar sus habilidades para enfrentarlos.

---

### Enemigos rojos

A partir del:

```text
Nivel 5
```

aparecen enemigos rojos.

Estos enemigos tienen una velocidad superior a la de los enemigos normales y aumentan la dificultad de la partida.

---

### Sistema de niveles

El nivel aumenta progresivamente según el puntaje conseguido por el jugador.

Actualmente, el juego utiliza:

```text
40 puntos por nivel
```

A medida que aumenta el nivel también incrementa la dificultad y el daño causado por determinados obstáculos.

---

### Sistema de daño

El juego utiliza un sistema de daño progresivo.

El daño base aumenta conforme el jugador alcanza niveles superiores, haciendo que las partidas sean progresivamente más exigentes.

---

## Registro de partidas

Cosmic Drift guarda automáticamente información de las partidas en:

```text
data/historial_partidas.csv
```

El archivo almacena:

```text
fecha
hora
puntaje
nivel
duracion_segundos
```

Esto permite conservar información sobre el desempeño del jugador entre diferentes ejecuciones del programa.

El juego también puede utilizar este historial para obtener información como:

- Cantidad total de partidas.
- Mejor puntaje.
- Mejor nivel alcanzado.
- Partidas recientes.

---

## Estructura del proyecto

```text
Cosmic-Drift/
│
├── assets/
│   │
│   ├── audio/
│   │   ├── musica_fondo.ogg
│   │   ├── golpe.wav
│   │   ├── escudo.wav
│   │   ├── disparo.wav
│   │   └── recolectar.wav
│   │
│   ├── backgrounds/
│   │   └── fondo_cosmico.png
│   │
│   ├── ship/
│   │   └── nave.png
│   │
│   └── ui/
│       ├── flor_game_over.png
│       └── gato_astronauta.png
│
├── data/
│   └── historial_partidas.csv
│
├── fase1_mano.py
├── fase2_cosmic_drift.py
├── requirements.txt
└── .gitignore
```

### `assets/`

Contiene los recursos visuales y de sonido necesarios para ejecutar el videojuego.

No se recomienda cambiar la ubicación de estos archivos sin modificar también las rutas correspondientes dentro del código.

### `assets/audio/`

Contiene:

- Música de fondo.
- Sonido de daño.
- Sonido del escudo.
- Sonido de disparo.
- Sonido de recolección.

### `assets/backgrounds/`

Contiene el fondo principal utilizado durante la partida.

### `assets/ship/`

Contiene la imagen correspondiente a la nave controlada por el jugador.

### `assets/ui/`

Contiene elementos gráficos utilizados en la interfaz y en diferentes estados del videojuego.

### `data/`

Contiene los datos generados durante la ejecución del programa, principalmente el historial de partidas.

### `fase1_mano.py`

Archivo utilizado para desarrollar y comprobar el sistema de seguimiento de mano mediante OpenCV y MediaPipe.

Puede utilizarse para verificar que la cámara y el reconocimiento funcionen correctamente antes de ejecutar el juego.

### `fase2_cosmic_drift.py`

Archivo principal de **Cosmic Drift**.

Integra:

- Seguimiento de la mano.
- Reconocimiento de gestos.
- Movimiento de la nave.
- Cámara.
- Sistema de disparos.
- Escudo.
- Impulso.
- Orbes.
- Enemigos.
- Niveles.
- Puntaje.
- Daño.
- Música.
- Efectos de sonido.
- Historial de partidas.
- Interfaz del juego.
- Pantalla de Game Over.

### `requirements.txt`

Contiene las versiones de las dependencias utilizadas por el entorno de desarrollo.

---

## Configuración de la cámara

Por defecto se utiliza:

```python
CAMERA_INDEX = 0
```

Si el computador tiene varias cámaras y el juego utiliza una cámara incorrecta, puede ser necesario modificar este valor dentro de `fase2_cosmic_drift.py`.

Por ejemplo:

```python
CAMERA_INDEX = 1
```

o:

```python
CAMERA_INDEX = 2
```

dependiendo de cómo el sistema operativo haya registrado las cámaras.

---

## Recomendaciones para el reconocimiento de la mano

Para obtener mejores resultados:

- Mantenga la mano dentro del campo de visión de la cámara.
- Procure tener una iluminación adecuada.
- Evite fondos demasiado oscuros o con exceso de movimiento.
- Mantenga cierta distancia entre la mano y la cámara.
- Realice los gestos de forma clara.
- Evite que otras personas coloquen sus manos frente a la cámara durante la partida.
- Asegúrese de que ninguna otra aplicación esté utilizando la cámara.

El sistema está configurado para realizar el seguimiento de:

```text
1 mano
```

a la vez.

---

## Resolución y rendimiento

La ventana del juego está configurada en:

```text
1280 × 720
```

con una velocidad objetivo de:

```text
60 FPS
```

El rendimiento puede variar dependiendo del computador, debido a que el sistema debe procesar simultáneamente:

- Captura de cámara.
- Detección de la mano.
- Reconocimiento de gestos.
- Renderizado del videojuego.
- Colisiones.
- Audio.
- Animaciones.

---

## Posibles problemas

### No se detecta la cámara

Compruebe que:

1. La cámara esté conectada.
2. El sistema operativo permita que Python acceda a ella.
3. Ninguna otra aplicación esté utilizando la cámara.
4. `CAMERA_INDEX` corresponda a la cámara correcta.

---

### Aparece `ModuleNotFoundError`

Por ejemplo:

```text
ModuleNotFoundError: No module named 'mediapipe'
```

Compruebe que el entorno virtual esté activo y vuelva a ejecutar:

```bash
pip install -r requirements.txt
```

---

### MediaPipe no se instala

Compruebe primero la versión de Python:

```bash
python --version
```

Se recomienda utilizar:

```text
Python 3.11
```

También puede utilizar Python 3.12.

---

### Los recursos gráficos no aparecen

Compruebe que la carpeta `assets/` conserve su estructura original.

Los archivos gráficos y de sonido son cargados mediante rutas relativas al archivo principal del proyecto.

---

### No se escucha el audio

Compruebe:

- El volumen del sistema.
- El dispositivo de salida de audio.
- Que los archivos dentro de `assets/audio/` existan.
- Que Pygame pueda inicializar correctamente el sistema de audio.

---

## Flujo general del proyecto

```text
Cámara
   |
   v
OpenCV
   |
   v
MediaPipe Hands
   |
   v
Detección de posición y gestos
   |
   v
Control de la nave
   |
   +---- Movimiento
   |
   +---- Impulso
   |
   +---- Disparo
   |
   +---- Escudo
   |
   v
Pygame
   |
   v
Cosmic Drift
   |
   v
Puntaje + Niveles + Historial
```

---

## Ejecución rápida

Si Python y Git ya están instalados, el proceso completo puede resumirse en:

```bash
git clone https://github.com/SofiOyola/Cosmic-Drift.git

cd Cosmic-Drift

python -m venv .venv
```

En Windows:

```bash
.venv\Scripts\activate
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Probar el reconocimiento de la mano:

```bash
python fase1_mano.py
```

Ejecutar el videojuego:

```bash
python fase2_cosmic_drift.py
```

---

<div align="center">

## Cosmic Drift

**Controla la nave con tu mano. Recolecta, esquiva, dispara y avanza por el espacio.**

</div>
