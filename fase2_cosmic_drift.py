import cv2
import mediapipe as mp
import math
import random
import pygame
import sys
import os
import csv

from datetime import datetime


# ============================================================
# COSMIC DRIFT
#
# - MediaPipe Hands
# - Movimiento con mano
# - Proximidad / Impulso Cósmico
# - Puño = disparo
# - Dos dedos = escudo
# - Orbes positivos
# - Enemigos morados
# - Enemigo rojo rápido desde nivel 5
# - Daño progresivo
# - Música y efectos
# - Historial CSV
# - Game Over
# ============================================================


# ============================================================
# VENTANA
# ============================================================

SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720

FPS = 60

WINDOW_NAME = "Cosmic Drift"


# ============================================================
# ESTADOS
# ============================================================

STATE_MENU = "menu"
STATE_COUNTDOWN = "countdown"
STATE_PLAYING = "playing"
STATE_GAME_OVER = "game_over"


# ============================================================
# DISTRIBUCIÓN
# ============================================================

LEFT_PANEL_WIDTH = 380

INFO_PANEL_HEIGHT = 370


GAME_X = LEFT_PANEL_WIDTH
GAME_Y = 0

GAME_WIDTH = (
    SCREEN_WIDTH
    -
    LEFT_PANEL_WIDTH
)

GAME_HEIGHT = SCREEN_HEIGHT


CAMERA_PANEL_Y = INFO_PANEL_HEIGHT

CAMERA_CARD_BOTTOM_MARGIN = 24


# ============================================================
# CÁMARA
# ============================================================

CAMERA_INDEX = 0

CAMERA_WIDTH = 640
CAMERA_HEIGHT = 360


# ============================================================
# SEGUIMIENTO
# ============================================================

HAND_ALPHA = 0.25

SHIP_FOLLOW_SPEED = 0.18

MEDIAPIPE_EVERY_N_FRAMES = 2


PROX_TURBO_ON = 0.30

PROX_TURBO_OFF = 0.26


# ============================================================
# GESTOS
# ============================================================

GESTURE_OPEN = "OPEN"
GESTURE_FIST = "FIST"
GESTURE_PEACE = "PEACE"
GESTURE_UNKNOWN = "UNKNOWN"

GESTURE_CONFIRM_FRAMES = 4


# ============================================================
# DISPARO
# ============================================================

SHOT_SPEED = 650

SHOT_RADIUS = 7

SHOT_COOLDOWN_MS = 350

POINTS_PER_DESTROYED_OBSTACLE = 5


# ============================================================
# DAÑO
# ============================================================

BASE_DAMAGE = 10

DAMAGE_PER_LEVEL = 2


# ============================================================
# DIFICULTAD
# ============================================================

POINTS_PER_LEVEL = 40

MAX_ORBS = 4

MAX_OBSTACLES = 6


# ============================================================
# ENEMIGO ROJO RÁPIDO
# ============================================================

RED_ENEMY_START_LEVEL = 5

RED_ENEMY_MIN_SPEED = 240

RED_ENEMY_MAX_SPEED = 320


# ============================================================
# RUTAS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


ASSETS_DIR = os.path.join(
    BASE_DIR,
    "assets"
)


BACKGROUND_PATH = os.path.join(
    ASSETS_DIR,
    "backgrounds",
    "fondo_cosmico.png"
)


SHIP_PATH = os.path.join(
    ASSETS_DIR,
    "ship",
    "nave.png"
)


FLOWER_PATH = os.path.join(
    ASSETS_DIR,
    "ui",
    "flor_game_over.png"
)


ASTRONAUT_CAT_PATH = os.path.join(
    ASSETS_DIR,
    "ui",
    "gato_astronauta.png"
)


# ============================================================
# AUDIO
# ============================================================

AUDIO_DIR = os.path.join(
    ASSETS_DIR,
    "audio"
)


MUSIC_PATH = os.path.join(
    AUDIO_DIR,
    "musica_fondo.ogg"
)


DAMAGE_SOUND_PATH = os.path.join(
    AUDIO_DIR,
    "golpe.wav"
)


SHIELD_SOUND_PATH = os.path.join(
    AUDIO_DIR,
    "escudo.wav"
)


SHOT_SOUND_PATH = os.path.join(
    AUDIO_DIR,
    "disparo.wav"
)


COLLECT_SOUND_PATH = os.path.join(
    AUDIO_DIR,
    "recolectar.wav"
)


# ============================================================
# VOLÚMENES
# ============================================================

MUSIC_VOLUME = 0.28

DAMAGE_VOLUME = 0.55

SHIELD_VOLUME = 0.45

SHOT_VOLUME = 0.35

COLLECT_VOLUME = 0.45


# ============================================================
# HISTORIAL
# ============================================================

DATA_DIR = os.path.join(
    BASE_DIR,
    "data"
)


HISTORY_PATH = os.path.join(
    DATA_DIR,
    "historial_partidas.csv"
)


HISTORY_DISPLAY_LIMIT = 5


# ============================================================
# COLORES
# ============================================================

WHITE = (
    245,
    245,
    255
)


SOFT_WHITE = (
    220,
    220,
    235
)


PINK = (
    255,
    145,
    220
)


LAVENDER = (
    190,
    160,
    255
)


CYAN = (
    115,
    220,
    255
)


MINT = (
    145,
    255,
    220
)


GOLD = (
    255,
    225,
    130
)


RED = (
    255,
    75,
    90
)


GREEN = (
    80,
    235,
    145
)


PANEL_BG = (
    5,
    5,
    8
)


CARD_BG = (
    18,
    18,
    28
)


CARD_BG_2 = (
    12,
    12,
    18
)


CARD_BORDER = (
    110,
    95,
    160
)


# Morado
DARK_PURPLE = (
    60,
    35,
    90
)


OBSTACLE_PURPLE = (
    135,
    85,
    165
)


# Rojo
DARK_RED = (
    95,
    20,
    35
)


ENEMY_RED = (
    190,
    55,
    75
)


LIGHT_RED = (
    255,
    105,
    120
)


DEEP_RED = (
    105,
    25,
    45
)


# ============================================================
# TIPOGRAFÍA
# ============================================================

TITLE_TEXT = "ℂ𝕠𝕤𝕞𝕚𝕔 𝔻𝕣𝕚𝕗𝕥"


ASCII_UPPER = (
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
)


FRAKTUR_UPPER = (
    "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸"
    "𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅"
)


ASCII_LOWER = (
    "abcdefghijklmnopqrstuvwxyz"
)


FRAKTUR_LOWER = (
    "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒"
    "𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟"
)


FRAKTUR_MAP = {}


for normal, gothic in zip(
    ASCII_UPPER,
    FRAKTUR_UPPER
):

    FRAKTUR_MAP[
        normal
    ] = gothic


for normal, gothic in zip(
    ASCII_LOWER,
    FRAKTUR_LOWER
):

    FRAKTUR_MAP[
        normal
    ] = gothic


def to_fraktur(text):

    return "".join(
        FRAKTUR_MAP.get(
            char,
            char
        )
        for char in text
    )


def get_math_font(size):

    font_path = pygame.font.match_font(
        "cambria math"
    )


    if font_path is None:

        font_path = pygame.font.match_font(
            "segoe ui symbol"
        )


    if font_path:

        return pygame.font.Font(
            font_path,
            size
        )


    return pygame.font.SysFont(
        "segoeui",
        size
    )


def render_fraktur(
    font,
    text,
    color
):

    return font.render(
        to_fraktur(text),
        True,
        color
    )


# ============================================================
# HISTORIAL
# ============================================================

def ensure_history_file():

    os.makedirs(
        DATA_DIR,
        exist_ok=True
    )


    if (
        not os.path.exists(
            HISTORY_PATH
        )
        or
        os.path.getsize(
            HISTORY_PATH
        )
        ==
        0
    ):

        with open(
            HISTORY_PATH,
            "w",
            newline="",
            encoding="utf-8"
        ) as file:

            writer = csv.writer(
                file
            )


            writer.writerow(
                [
                    "fecha",
                    "hora",
                    "puntaje",
                    "nivel",
                    "duracion_segundos"
                ]
            )


def save_game_history(
    score,
    level,
    duration_seconds
):

    ensure_history_file()


    now = datetime.now()


    with open(
        HISTORY_PATH,
        "a",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(
            file
        )


        writer.writerow(
            [
                now.strftime(
                    "%Y-%m-%d"
                ),

                now.strftime(
                    "%H:%M:%S"
                ),

                int(score),

                int(level),

                f"{duration_seconds:.1f}"
            ]
        )


def load_game_history():

    ensure_history_file()


    history = []


    try:

        with open(
            HISTORY_PATH,
            "r",
            newline="",
            encoding="utf-8"
        ) as file:

            reader = csv.DictReader(
                file
            )


            for row in reader:

                try:

                    history.append(
                        {
                            "fecha": (
                                row["fecha"]
                            ),

                            "hora": (
                                row["hora"]
                            ),

                            "puntaje": int(
                                row["puntaje"]
                            ),

                            "nivel": int(
                                row["nivel"]
                            ),

                            "duracion": float(
                                row[
                                    "duracion_segundos"
                                ]
                            )
                        }
                    )


                except (
                    ValueError,
                    TypeError,
                    KeyError
                ):

                    continue


    except OSError:

        pass


    return history


def get_history_summary():

    history = (
        load_game_history()
    )


    if not history:

        return {
            "total_games": 0,
            "best_score": 0,
            "best_level": 0,
            "latest": []
        }


    best_score = max(
        game["puntaje"]
        for game in history
    )


    best_level = max(
        game["nivel"]
        for game in history
    )


    latest = list(
        reversed(
            history[
                -HISTORY_DISPLAY_LIMIT:
            ]
        )
    )


    return {
        "total_games": len(
            history
        ),

        "best_score": (
            best_score
        ),

        "best_level": (
            best_level
        ),

        "latest": (
            latest
        )
    }


# ============================================================
# MEDIAPIPE
# ============================================================

mp_hands = (
    mp.solutions.hands
)


mp_drawing = (
    mp.solutions.drawing_utils
)


hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    model_complexity=0,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)


PALM_POINTS = [
    0,
    5,
    9,
    13,
    17
]


HAND_LANDMARK_STYLE = (
    mp_drawing.DrawingSpec(
        color=(
            255,
            180,
            220
        ),
        thickness=2,
        circle_radius=3
    )
)


HAND_CONNECTION_STYLE = (
    mp_drawing.DrawingSpec(
        color=(
            80,
            220,
            255
        ),
        thickness=2,
        circle_radius=2
    )
)


# ============================================================
# VARIABLES DE MANO
# ============================================================

smooth_x = None

smooth_y = None

smooth_proximity = None


hand_detected = False

turbo_active = False

shield_active = False

previous_shield_active = False


target_x = (
    GAME_X
    +
    GAME_WIDTH // 2
)


target_y = (
    GAME_HEIGHT // 2
)


# ============================================================
# VARIABLES DE GESTOS
# ============================================================

current_gesture = (
    GESTURE_UNKNOWN
)


gesture_candidate = (
    GESTURE_UNKNOWN
)


gesture_candidate_frames = 0


# ============================================================
# DISPAROS
# ============================================================

projectiles = []

last_shot_time = 0


# ============================================================
# FUNCIONES DE MANO
# ============================================================

def ema(
    actual,
    previous,
    alpha
):

    if previous is None:

        return actual


    return (
        alpha * actual
        +
        (1 - alpha) * previous
    )


def distance_2d(
    a,
    b
):

    return math.sqrt(
        (a.x - b.x) ** 2
        +
        (a.y - b.y) ** 2
    )


def get_palm_center(
    hand_landmarks
):

    points = [

        hand_landmarks.landmark[i]

        for i in PALM_POINTS
    ]


    x = (
        sum(
            point.x
            for point in points
        )
        /
        len(points)
    )


    y = (
        sum(
            point.y
            for point in points
        )
        /
        len(points)
    )


    return x, y


def get_palm_size(
    hand_landmarks
):

    landmarks = (
        hand_landmarks.landmark
    )


    vertical = distance_2d(
        landmarks[0],
        landmarks[9]
    )


    horizontal = distance_2d(
        landmarks[5],
        landmarks[17]
    )


    return (
        vertical
        +
        horizontal
    ) / 2


# ============================================================
# GESTOS
# ============================================================

def finger_extended(
    hand_landmarks,
    tip_id,
    pip_id
):

    tip = (
        hand_landmarks
        .landmark[tip_id]
    )


    pip = (
        hand_landmarks
        .landmark[pip_id]
    )


    return (
        tip.y
        <
        pip.y
    )


def detect_gesture(
    hand_landmarks
):

    index_open = finger_extended(
        hand_landmarks,
        8,
        6
    )


    middle_open = finger_extended(
        hand_landmarks,
        12,
        10
    )


    ring_open = finger_extended(
        hand_landmarks,
        16,
        14
    )


    pinky_open = finger_extended(
        hand_landmarks,
        20,
        18
    )


    # PUÑO

    if (
        not index_open
        and
        not middle_open
        and
        not ring_open
        and
        not pinky_open
    ):

        return GESTURE_FIST


    # DOS DEDOS

    if (
        index_open
        and
        middle_open
        and
        not ring_open
        and
        not pinky_open
    ):

        return GESTURE_PEACE


    # MANO ABIERTA

    if (
        index_open
        and
        middle_open
        and
        ring_open
        and
        pinky_open
    ):

        return GESTURE_OPEN


    return GESTURE_UNKNOWN


def update_stable_gesture(
    detected_gesture
):

    global gesture_candidate

    global gesture_candidate_frames

    global current_gesture


    if (
        detected_gesture
        ==
        gesture_candidate
    ):

        gesture_candidate_frames += 1


    else:

        gesture_candidate = (
            detected_gesture
        )

        gesture_candidate_frames = 1


    if (
        gesture_candidate_frames
        >=
        GESTURE_CONFIRM_FRAMES
    ):

        current_gesture = (
            gesture_candidate
        )


    return current_gesture


def reset_gesture():

    global current_gesture

    global gesture_candidate

    global gesture_candidate_frames


    current_gesture = (
        GESTURE_UNKNOWN
    )


    gesture_candidate = (
        GESTURE_UNKNOWN
    )


    gesture_candidate_frames = 0


def get_gesture_name(
    gesture
):

    if gesture == GESTURE_OPEN:

        return "Mano abierta"


    if gesture == GESTURE_FIST:

        return "Puño"


    if gesture == GESTURE_PEACE:

        return "Dos dedos"


    return "Sin gesto"


# ============================================================
# FUNCIONES GENERALES
# ============================================================

def clamp(
    value,
    minimum,
    maximum
):

    return max(
        minimum,
        min(
            value,
            maximum
        )
    )


def load_image(
    path,
    size
):

    if not os.path.exists(
        path
    ):

        print(
            f"ADVERTENCIA: no existe {path}"
        )

        return None


    image = pygame.image.load(
        path
    ).convert_alpha()


    image = pygame.transform.smoothscale(
        image,
        size
    )


    return image


def draw_rounded_card(
    surface,
    rect,
    bg_color,
    border_color,
    radius=16,
    border=2
):

    pygame.draw.rect(
        surface,
        bg_color,
        rect,
        border_radius=radius
    )


    pygame.draw.rect(
        surface,
        border_color,
        rect,
        border,
        border_radius=radius
    )


def draw_button(
    surface,
    rect,
    text,
    font,
    bg_color,
    border_color,
    text_color
):

    draw_rounded_card(
        surface,
        rect,
        bg_color,
        border_color,
        radius=18,
        border=2
    )


    text_surface = font.render(
        text,
        True,
        text_color
    )


    text_rect = (
        text_surface.get_rect(
            center=rect.center
        )
    )


    surface.blit(
        text_surface,
        text_rect
    )


# ============================================================
# NIVEL Y DAÑO
# ============================================================

def get_level(score):

    return (
        1
        +
        score // POINTS_PER_LEVEL
    )


def get_damage_for_level(
    level
):

    return (
        BASE_DAMAGE
        +
        (level - 1)
        *
        DAMAGE_PER_LEVEL
    )


# ============================================================
# DIFICULTAD
# ============================================================

def get_difficulty_config(
    level
):

    active_orbs = min(
        1
        +
        ((level - 1) // 2),

        MAX_ORBS
    )


    active_obstacles = min(
        1
        +
        (level - 1),

        MAX_OBSTACLES
    )


    speed_multiplier = (
        1.0
        +
        (level - 1)
        *
        0.10
    )


    speed_multiplier = min(
        speed_multiplier,
        1.8
    )


    return (
        active_orbs,
        active_obstacles,
        speed_multiplier
    )


# ============================================================
# OBJETOS
# ============================================================

def random_game_x(
    margin=55
):

    return random.randint(
        GAME_X + margin,
        SCREEN_WIDTH - margin
    )


def create_orb():

    return {
        "x": random_game_x(),

        "y": random.randint(
            -500,
            -50
        ),

        "speed": random.uniform(
            110,
            170
        ),

        "radius": 15
    }


def create_obstacle():

    return {
        "x": random_game_x(),

        "y": random.randint(
            -700,
            -100
        ),

        "speed": random.uniform(
            125,
            190
        ),

        "radius": 27
    }


# ============================================================
# NUEVO ENEMIGO ROJO
# ============================================================

def create_red_enemy():

    return {
        "x": random_game_x(),

        "y": random.randint(
            -900,
            -150
        ),

        "speed": random.uniform(
            RED_ENEMY_MIN_SPEED,
            RED_ENEMY_MAX_SPEED
        ),

        "radius": 27
    }


def reset_object(
    obj,
    min_y,
    max_y
):

    obj["x"] = (
        random_game_x()
    )


    obj["y"] = random.randint(
        min_y,
        max_y
    )


def collision(
    x1,
    y1,
    r1,
    x2,
    y2,
    r2
):

    return (
        math.dist(
            (
                x1,
                y1
            ),
            (
                x2,
                y2
            )
        )
        <=
        (
            r1
            +
            r2
        )
    )


# ============================================================
# DISPAROS
# ============================================================

def create_projectile(
    x,
    y
):

    return {
        "x": x,

        "y": y - 35,

        "speed": SHOT_SPEED,

        "radius": SHOT_RADIUS
    }


def draw_projectile(
    surface,
    projectile
):

    x = int(
        projectile["x"]
    )


    y = int(
        projectile["y"]
    )


    pygame.draw.circle(
        surface,
        (
            90,
            70,
            150
        ),
        (
            x,
            y
        ),
        14
    )


    pygame.draw.circle(
        surface,
        LAVENDER,
        (
            x,
            y
        ),
        10
    )


    pygame.draw.circle(
        surface,
        CYAN,
        (
            x,
            y
        ),
        6
    )


    pygame.draw.circle(
        surface,
        WHITE,
        (
            x,
            y
        ),
        3
    )


# ============================================================
# ORBE POSITIVO
# ============================================================

def draw_orb(
    surface,
    orb,
    center=None
):

    if center is None:

        x = int(
            orb["x"]
        )

        y = int(
            orb["y"]
        )

    else:

        x, y = center


    pygame.draw.circle(
        surface,
        (
            100,
            80,
            145
        ),
        (
            x,
            y
        ),
        24
    )


    pygame.draw.circle(
        surface,
        PINK,
        (
            x,
            y
        ),
        16
    )


    pygame.draw.circle(
        surface,
        CYAN,
        (
            x,
            y
        ),
        10
    )


    pygame.draw.circle(
        surface,
        WHITE,
        (
            x,
            y
        ),
        4
    )


# ============================================================
# ENEMIGO MORADO
# ============================================================

def draw_obstacle(
    surface,
    obstacle,
    center=None
):

    if center is None:

        x = int(
            obstacle["x"]
        )

        y = int(
            obstacle["y"]
        )

    else:

        x, y = center


    # Borde
    pygame.draw.circle(
        surface,
        DARK_PURPLE,
        (
            x,
            y
        ),
        30
    )


    # Cuerpo
    pygame.draw.circle(
        surface,
        OBSTACLE_PURPLE,
        (
            x,
            y
        ),
        24
    )


    # Mancha clara
    pygame.draw.circle(
        surface,
        (
            195,
            110,
            210
        ),
        (
            x - 7,
            y - 5
        ),
        7
    )


    # Mancha oscura
    pygame.draw.circle(
        surface,
        (
            75,
            45,
            105
        ),
        (
            x + 8,
            y + 7
        ),
        6
    )


# ============================================================
# ENEMIGO ROJO
# ============================================================

def draw_red_enemy(
    surface,
    enemy,
    center=None
):

    if center is None:

        x = int(
            enemy["x"]
        )

        y = int(
            enemy["y"]
        )

    else:

        x, y = center


    # Misma estética del morado
    # pero usando tonos rojos

    pygame.draw.circle(
        surface,
        DARK_RED,
        (
            x,
            y
        ),
        30
    )


    pygame.draw.circle(
        surface,
        ENEMY_RED,
        (
            x,
            y
        ),
        24
    )


    pygame.draw.circle(
        surface,
        LIGHT_RED,
        (
            x - 7,
            y - 5
        ),
        7
    )


    pygame.draw.circle(
        surface,
        DEEP_RED,
        (
            x + 8,
            y + 7
        ),
        6
    )


# ============================================================
# ESCUDO
# ============================================================

def draw_astral_shield(
    surface,
    x,
    y
):

    current_time = (
        pygame.time.get_ticks()
        /
        1000.0
    )


    pulse = int(
        math.sin(
            current_time
            *
            5
        )
        *
        4
    )


    radius_outer = (
        58
        +
        pulse
    )


    radius_inner = (
        50
        +
        pulse
    )


    pygame.draw.circle(
        surface,
        CYAN,
        (
            int(x),
            int(y)
        ),
        radius_outer,
        4
    )


    pygame.draw.circle(
        surface,
        LAVENDER,
        (
            int(x),
            int(y)
        ),
        radius_inner,
        2
    )


    for angle in (
        0,
        90,
        180,
        270
    ):

        radians = math.radians(
            angle
            +
            current_time
            *
            80
        )


        px = (
            x
            +
            math.cos(
                radians
            )
            *
            radius_outer
        )


        py = (
            y
            +
            math.sin(
                radians
            )
            *
            radius_outer
        )


        pygame.draw.circle(
            surface,
            WHITE,
            (
                int(px),
                int(py)
            ),
            3
        )


# ============================================================
# NAVE
# ============================================================

def draw_ship(
    surface,
    ship_image,
    x,
    y,
    turbo,
    shield
):

    x = int(x)

    y = int(y)


    if turbo:

        pygame.draw.circle(
            surface,
            (
                80,
                110,
                170
            ),
            (
                x,
                y
            ),
            52
        )


        pygame.draw.circle(
            surface,
            (
                105,
                85,
                155
            ),
            (
                x,
                y
            ),
            44
        )


    if ship_image is not None:

        rect = ship_image.get_rect(
            center=(
                x,
                y
            )
        )


        surface.blit(
            ship_image,
            rect
        )


    else:

        pygame.draw.polygon(
            surface,
            WHITE,
            [
                (
                    x,
                    y - 25
                ),
                (
                    x + 22,
                    y + 20
                ),
                (
                    x,
                    y + 10
                ),
                (
                    x - 22,
                    y + 20
                )
            ]
        )


    if shield:

        draw_astral_shield(
            surface,
            x,
            y
        )


# ============================================================
# CÁMARA
# ============================================================

def camera_to_surface(
    frame
):

    camera_width = (
        LEFT_PANEL_WIDTH
        -
        40
    )


    camera_height = int(
        camera_width
        *
        9 / 16
    )


    resized = cv2.resize(
        frame,
        (
            camera_width,
            camera_height
        ),
        interpolation=cv2.INTER_AREA
    )


    rgb = cv2.cvtColor(
        resized,
        cv2.COLOR_BGR2RGB
    )


    rgb = rgb.swapaxes(
        0,
        1
    )


    return pygame.surfarray.make_surface(
        rgb
    )


# ============================================================
# PANEL IZQUIERDO
# ============================================================

def draw_left_panel_background(
    screen
):

    pygame.draw.rect(
        screen,
        PANEL_BG,
        (
            0,
            0,
            LEFT_PANEL_WIDTH,
            SCREEN_HEIGHT
        )
    )


def draw_info_cards(
    screen,
    font_title,
    font_normal,
    score,
    energy,
    proximity,
    turbo,
    shield,
    detected,
    level,
    gesture
):

    # ========================================================
    # CARD TÍTULO
    # ========================================================

    title_card = pygame.Rect(
        16,
        16,
        LEFT_PANEL_WIDTH - 32,
        70
    )


    draw_rounded_card(
        screen,
        title_card,
        CARD_BG,
        CARD_BORDER,
        radius=18,
        border=2
    )


    title_surface = font_title.render(
        TITLE_TEXT,
        True,
        WHITE
    )


    screen.blit(
        title_surface,
        (
            28,
            28
        )
    )


    status_color = (
        MINT
        if detected
        else
        RED
    )


    pygame.draw.circle(
        screen,
        status_color,
        (
            LEFT_PANEL_WIDTH - 48,
            48
        ),
        7
    )


    # ========================================================
    # CARD ESTADÍSTICAS
    # ========================================================

    stats_card = pygame.Rect(
        16,
        100,
        LEFT_PANEL_WIDTH - 32,
        245
    )


    draw_rounded_card(
        screen,
        stats_card,
        CARD_BG_2,
        CARD_BORDER,
        radius=18,
        border=2
    )


    text1 = render_fraktur(
        font_normal,
        f"Puntos: {score}",
        GOLD
    )


    text2 = render_fraktur(
        font_normal,
        f"Nivel: {level}",
        LAVENDER
    )


    text3 = render_fraktur(
        font_normal,
        f"Energía: {energy}%",
        MINT
    )


    if proximity is None:

        prox_text = (
            "Proximidad: ---"
        )

    else:

        prox_text = (
            f"Proximidad: "
            f"{proximity:.3f}"
        )


    text4 = render_fraktur(
        font_normal,
        prox_text,
        CYAN
    )


    turbo_text = (
        "Impulso Cósmico: ACTIVO"
        if turbo
        else
        "Impulso Cósmico: inactivo"
    )


    text5 = render_fraktur(
        font_normal,
        turbo_text,
        PINK
        if turbo
        else
        SOFT_WHITE
    )


    gesture_name = (
        get_gesture_name(
            gesture
        )
    )


    text6 = render_fraktur(
        font_normal,
        f"Gesto: {gesture_name}",
        PINK
    )


    shield_text = (
        "Escudo Astral: ACTIVO"
        if shield
        else
        "Escudo Astral: inactivo"
    )


    text7 = render_fraktur(
        font_normal,
        shield_text,
        CYAN
        if shield
        else
        SOFT_WHITE
    )


    screen.blit(
        text1,
        (
            30,
            118
        )
    )


    screen.blit(
        text2,
        (
            30,
            148
        )
    )


    screen.blit(
        text3,
        (
            30,
            178
        )
    )


    screen.blit(
        text4,
        (
            30,
            208
        )
    )


    screen.blit(
        text5,
        (
            30,
            238
        )
    )


    screen.blit(
        text6,
        (
            30,
            268
        )
    )


    screen.blit(
        text7,
        (
            30,
            298
        )
    )


# ============================================================
# CARD CÁMARA
# ============================================================

def draw_camera_card(
    screen,
    camera_surface,
    font
):

    card_y = (
        CAMERA_PANEL_Y
        +
        14
    )


    card_h = (
        SCREEN_HEIGHT
        -
        card_y
        -
        CAMERA_CARD_BOTTOM_MARGIN
    )


    card = pygame.Rect(
        16,
        card_y,
        LEFT_PANEL_WIDTH - 32,
        card_h
    )


    draw_rounded_card(
        screen,
        card,
        CARD_BG,
        CARD_BORDER,
        radius=18,
        border=2
    )


    title = render_fraktur(
        font,
        "Cámara",
        SOFT_WHITE
    )


    screen.blit(
        title,
        (
            30,
            card_y + 20
        )
    )


    if camera_surface is not None:

        camera_rect = (
            camera_surface
            .get_rect()
        )


        camera_rect.centerx = (
            LEFT_PANEL_WIDTH
            //
            2
        )


        camera_rect.y = (
            card_y
            +
            60
        )


        screen.blit(
            camera_surface,
            camera_rect
        )


        pygame.draw.rect(
            screen,
            LAVENDER,
            camera_rect,
            2,
            border_radius=8
        )


# ============================================================
# LEYENDA
# ============================================================

def draw_legend(
    screen,
    font
):

    # Más ancha porque ahora
    # mostramos dos enemigos.

    legend_width = 330

    legend_height = 132


    legend = pygame.Surface(
        (
            legend_width,
            legend_height
        ),
        pygame.SRCALPHA
    )


    # Fondo
    pygame.draw.rect(
        legend,
        (
            0,
            0,
            0,
            115
        ),
        (
            0,
            0,
            legend_width,
            legend_height
        ),
        border_radius=14
    )


    # Borde
    pygame.draw.rect(
        legend,
        (
            190,
            160,
            255,
            110
        ),
        (
            0,
            0,
            legend_width,
            legend_height
        ),
        1,
        border_radius=14
    )


    # ========================================================
    # ENEMIGO MORADO
    # ========================================================

    fake_obstacle = {
        "x": 0,
        "y": 0
    }


    draw_obstacle(
        legend,
        fake_obstacle,
        center=(
            38,
            37
        )
    )


    # Raya roja

    pygame.draw.line(
        legend,
        RED,
        (
            16,
            15
        ),
        (
            60,
            59
        ),
        4
    )


    # ========================================================
    # ENEMIGO ROJO
    # ========================================================

    fake_red_enemy = {
        "x": 0,
        "y": 0
    }


    draw_red_enemy(
        legend,
        fake_red_enemy,
        center=(
            92,
            37
        )
    )


    pygame.draw.line(
        legend,
        RED,
        (
            70,
            15
        ),
        (
            114,
            59
        ),
        4
    )


    # Texto plural

    avoid_text = render_fraktur(
        font,
        "Evita estas",
        RED
    )


    legend.blit(
        avoid_text,
        (
            132,
            25
        )
    )


    # ========================================================
    # ORBE POSITIVO
    # ========================================================

    fake_orb = {
        "x": 0,
        "y": 0
    }


    draw_orb(
        legend,
        fake_orb,
        center=(
            65,
            95
        )
    )


    collect_text = render_fraktur(
        font,
        "Recoge esta",
        GREEN
    )


    legend.blit(
        collect_text,
        (
            132,
            83
        )
    )


    screen.blit(
        legend,
        (
            GAME_X + 15,
            15
        )
    )


# ============================================================
# MENÚ
# ============================================================

def draw_menu_screen(
    screen,
    title_font,
    text_font,
    button_font,
    start_button_rect
):

    overlay = pygame.Surface(
        (
            GAME_WIDTH,
            GAME_HEIGHT
        ),
        pygame.SRCALPHA
    )


    overlay.fill(
        (
            0,
            0,
            0,
            120
        )
    )


    screen.blit(
        overlay,
        (
            GAME_X,
            GAME_Y
        )
    )


    card_rect = pygame.Rect(
        GAME_X + 160,
        155,
        580,
        380
    )


    draw_rounded_card(
        screen,
        card_rect,
        (
            15,
            12,
            24
        ),
        LAVENDER,
        radius=24,
        border=2
    )


    title = title_font.render(
        TITLE_TEXT,
        True,
        WHITE
    )


    title_rect = title.get_rect(
        center=(
            card_rect.centerx,
            card_rect.y + 65
        )
    )


    screen.blit(
        title,
        title_rect
    )


    line1 = render_fraktur(
        text_font,
        "Mueve tu mano para controlar la nave",
        SOFT_WHITE
    )


    line2 = render_fraktur(
        text_font,
        "Recoge orbes y evita obstáculos",
        SOFT_WHITE
    )


    line3 = render_fraktur(
        text_font,
        "Puño: dispara   Dos dedos: escudo",
        CYAN
    )


    screen.blit(
        line1,
        line1.get_rect(
            center=(
                card_rect.centerx,
                card_rect.y + 135
            )
        )
    )


    screen.blit(
        line2,
        line2.get_rect(
            center=(
                card_rect.centerx,
                card_rect.y + 175
            )
        )
    )


    screen.blit(
        line3,
        line3.get_rect(
            center=(
                card_rect.centerx,
                card_rect.y + 220
            )
        )
    )


    draw_button(
        screen,
        start_button_rect,
        "Empezar a jugar",
        button_font,
        (
            40,
            28,
            65
        ),
        (
            200,
            170,
            255
        ),
        WHITE
    )


# ============================================================
# COUNTDOWN
# ============================================================

def draw_countdown(
    screen,
    number,
    font
):

    overlay = pygame.Surface(
        (
            GAME_WIDTH,
            GAME_HEIGHT
        ),
        pygame.SRCALPHA
    )


    overlay.fill(
        (
            0,
            0,
            0,
            70
        )
    )


    screen.blit(
        overlay,
        (
            GAME_X,
            GAME_Y
        )
    )


    text_surface = font.render(
        str(number),
        True,
        WHITE
    )


    shadow_surface = font.render(
        str(number),
        True,
        LAVENDER
    )


    shadow_rect = (
        shadow_surface.get_rect(
            center=(
                GAME_X
                +
                GAME_WIDTH // 2
                +
                4,

                GAME_HEIGHT // 2
                +
                4
            )
        )
    )


    text_rect = (
        text_surface.get_rect(
            center=(
                GAME_X
                +
                GAME_WIDTH // 2,

                GAME_HEIGHT // 2
            )
        )
    )


    screen.blit(
        shadow_surface,
        shadow_rect
    )


    screen.blit(
        text_surface,
        text_rect
    )


# ============================================================
# FLOR DE RESPALDO
# ============================================================

def draw_flower_fallback(
    surface,
    center
):

    x, y = center


    pygame.draw.line(
        surface,
        (
            80,
            110,
            60
        ),
        (
            x,
            y - 10
        ),
        (
            x,
            y + 55
        ),
        6
    )


    pygame.draw.circle(
        surface,
        (
            170,
            30,
            40
        ),
        (
            x,
            y - 16
        ),
        24
    )


# ============================================================
# GAME OVER
# ============================================================

def draw_game_over(
    screen,
    title_font,
    text_font,
    button_font,
    score,
    flower_image,
    retry_button_rect,
    quit_button_rect
):

    overlay = pygame.Surface(
        (
            SCREEN_WIDTH,
            SCREEN_HEIGHT
        ),
        pygame.SRCALPHA
    )


    overlay.fill(
        (
            0,
            0,
            0,
            170
        )
    )


    screen.blit(
        overlay,
        (
            0,
            0
        )
    )


    card_rect = pygame.Rect(
        300,
        120,
        680,
        470
    )


    draw_rounded_card(
        screen,
        card_rect,
        (
            12,
            10,
            18
        ),
        LAVENDER,
        radius=26,
        border=2
    )


    title = title_font.render(
        "GAME OVER",
        True,
        RED
    )


    title_rect = title.get_rect(
        center=(
            card_rect.centerx,
            card_rect.y + 60
        )
    )


    screen.blit(
        title,
        title_rect
    )


    if flower_image is not None:

        flower_rect = (
            flower_image.get_rect(
                center=(
                    card_rect.centerx,
                    card_rect.y + 190
                )
            )
        )


        screen.blit(
            flower_image,
            flower_rect
        )


    else:

        draw_flower_fallback(
            screen,
            (
                card_rect.centerx,
                card_rect.y + 180
            )
        )


    final_score = render_fraktur(
        text_font,
        f"Puntaje final: {score}",
        SOFT_WHITE
    )


    final_score_rect = (
        final_score.get_rect(
            center=(
                card_rect.centerx,
                card_rect.y + 300
            )
        )
    )


    screen.blit(
        final_score,
        final_score_rect
    )


    draw_button(
        screen,
        retry_button_rect,
        "Jugar otra vez",
        button_font,
        (
            40,
            28,
            65
        ),
        (
            200,
            170,
            255
        ),
        WHITE
    )


    draw_button(
        screen,
        quit_button_rect,
        "Salir",
        button_font,
        (
            35,
            18,
            24
        ),
        (
            220,
            120,
            140
        ),
        WHITE
    )


# ============================================================
# HISTORIAL
# ============================================================

def draw_history_card(
    screen,
    history_summary,
    title_font,
    normal_font
):

    card = pygame.Rect(
        20,
        120,
        255,
        470
    )


    draw_rounded_card(
        screen,
        card,
        (
            12,
            10,
            18
        ),
        LAVENDER,
        radius=22,
        border=2
    )


    title = render_fraktur(
        title_font,
        "Historial Cósmico",
        WHITE
    )


    title_rect = title.get_rect(
        center=(
            card.centerx,
            153
        )
    )


    screen.blit(
        title,
        title_rect
    )


    right_x = (
        card.x
        +
        card.w
        -
        20
    )


    best_score_text = render_fraktur(
        normal_font,
        "Mejor puntaje",
        GOLD
    )


    screen.blit(
        best_score_text,
        (
            38,
            190
        )
    )


    best_score_number = render_fraktur(
        normal_font,
        str(
            history_summary[
                "best_score"
            ]
        ),
        WHITE
    )


    screen.blit(
        best_score_number,
        best_score_number.get_rect(
            right=right_x,
            y=190
        )
    )


    best_level_text = render_fraktur(
        normal_font,
        "Mejor nivel",
        LAVENDER
    )


    screen.blit(
        best_level_text,
        (
            38,
            222
        )
    )


    best_level_number = render_fraktur(
        normal_font,
        str(
            history_summary[
                "best_level"
            ]
        ),
        WHITE
    )


    screen.blit(
        best_level_number,
        best_level_number.get_rect(
            right=right_x,
            y=222
        )
    )


    games_text = render_fraktur(
        normal_font,
        "Partidas",
        CYAN
    )


    screen.blit(
        games_text,
        (
            38,
            254
        )
    )


    games_number = render_fraktur(
        normal_font,
        str(
            history_summary[
                "total_games"
            ]
        ),
        WHITE
    )


    screen.blit(
        games_number,
        games_number.get_rect(
            right=right_x,
            y=254
        )
    )


    latest_title = render_fraktur(
        normal_font,
        "Últimos puntajes",
        PINK
    )


    latest_title_rect = (
        latest_title.get_rect(
            center=(
                card.centerx,
                311
            )
        )
    )


    screen.blit(
        latest_title,
        latest_title_rect
    )


    latest_games = (
        history_summary[
            "latest"
        ]
    )


    if not latest_games:

        empty_text = render_fraktur(
            normal_font,
            "Sin partidas",
            SOFT_WHITE
        )


        screen.blit(
            empty_text,
            empty_text.get_rect(
                center=(
                    card.centerx,
                    370
                )
            )
        )


    else:

        start_y = 342


        for index, game in enumerate(
            latest_games
        ):

            row_y = (
                start_y
                +
                index * 45
            )


            row_rect = pygame.Rect(
                34,
                row_y,
                227,
                35
            )


            draw_rounded_card(
                screen,
                row_rect,
                (
                    24,
                    21,
                    35
                ),
                (
                    65,
                    58,
                    90
                ),
                radius=10,
                border=1
            )


            score_text = render_fraktur(
                normal_font,
                (
                    f"{index + 1}. "
                    f"{game['puntaje']} pts"
                ),
                WHITE
            )


            screen.blit(
                score_text,
                (
                    45,
                    row_y + 7
                )
            )


            level_text = render_fraktur(
                normal_font,
                (
                    f"Nv. "
                    f"{game['nivel']}"
                ),
                LAVENDER
            )


            screen.blit(
                level_text,
                level_text.get_rect(
                    right=250,
                    y=row_y + 7
                )
            )


# ============================================================
# GATO ASTRONAUTA
# ============================================================

def draw_astronaut_cat_card(
    screen,
    cat_image,
    title_font,
    normal_font
):

    card = pygame.Rect(
        SCREEN_WIDTH
        -
        20
        -
        255,

        120,

        255,

        470
    )


    draw_rounded_card(
        screen,
        card,
        (
            12,
            10,
            18
        ),
        LAVENDER,
        radius=22,
        border=2
    )


    title = render_fraktur(
        title_font,
        "Gato Cósmico",
        WHITE
    )


    title_rect = title.get_rect(
        center=(
            card.centerx,
            153
        )
    )


    screen.blit(
        title,
        title_rect
    )


    if cat_image is not None:

        cat_rect = (
            cat_image.get_rect(
                center=(
                    card.centerx,
                    card.centery + 35
                )
            )
        )


        screen.blit(
            cat_image,
            cat_rect
        )


    else:

        text1 = render_fraktur(
            normal_font,
            "Agrega tu imagen en:",
            SOFT_WHITE
        )


        text2 = render_fraktur(
            normal_font,
            "assets/ui/",
            CYAN
        )


        text3 = render_fraktur(
            normal_font,
            "gato_astronauta.png",
            PINK
        )


        screen.blit(
            text1,
            text1.get_rect(
                center=(
                    card.centerx,
                    300
                )
            )
        )


        screen.blit(
            text2,
            text2.get_rect(
                center=(
                    card.centerx,
                    340
                )
            )
        )


        screen.blit(
            text3,
            text3.get_rect(
                center=(
                    card.centerx,
                    375
                )
            )
        )


# ============================================================
# AUDIO
# ============================================================

def load_sound_safe(
    path,
    volume
):

    if (
        pygame.mixer.get_init()
        is None
    ):

        return None


    if not os.path.exists(
        path
    ):

        print(
            f"ADVERTENCIA: no existe el audio {path}"
        )

        return None


    try:

        sound = pygame.mixer.Sound(
            path
        )


        sound.set_volume(
            volume
        )


        return sound


    except pygame.error as error:

        print(
            f"ERROR cargando {path}: {error}"
        )

        return None


def play_sound(
    sound
):

    # No bloquea el movimiento.

    if sound is not None:

        sound.play()


def load_background_music():

    if (
        pygame.mixer.get_init()
        is None
    ):

        return False


    if not os.path.exists(
        MUSIC_PATH
    ):

        print(
            f"ADVERTENCIA: no existe {MUSIC_PATH}"
        )

        return False


    try:

        pygame.mixer.music.load(
            MUSIC_PATH
        )


        pygame.mixer.music.set_volume(
            MUSIC_VOLUME
        )


        return True


    except pygame.error as error:

        print(
            f"ERROR cargando música: {error}"
        )

        return False


def start_background_music():

    if music_loaded:

        pygame.mixer.music.play(
            -1,
            fade_ms=600
        )


def stop_background_music():

    if (
        music_loaded
        and
        pygame.mixer.music.get_busy()
    ):

        pygame.mixer.music.fadeout(
            700
        )


# ============================================================
# RESET
# ============================================================

def reset_game():

    global ship_x
    global ship_y

    global score
    global energy

    global orbs
    global obstacles
    global red_enemy

    global turbo_active
    global shield_active
    global previous_shield_active

    global smooth_x
    global smooth_y
    global smooth_proximity

    global hand_detected

    global target_x
    global target_y

    global projectiles

    global last_shot_time

    global game_over_saved

    global play_start_time

    global final_duration

    global history_summary


    ship_x = (
        GAME_X
        +
        GAME_WIDTH / 2
    )


    ship_y = (
        GAME_HEIGHT
        -
        170
    )


    score = 0

    energy = 100


    orbs = [
        create_orb()
        for _ in range(
            MAX_ORBS
        )
    ]


    obstacles = [
        create_obstacle()
        for _ in range(
            MAX_OBSTACLES
        )
    ]


    red_enemy = (
        create_red_enemy()
    )


    projectiles = []


    last_shot_time = 0


    turbo_active = False

    shield_active = False

    previous_shield_active = False


    smooth_x = None

    smooth_y = None

    smooth_proximity = None


    hand_detected = False


    target_x = (
        GAME_X
        +
        GAME_WIDTH // 2
    )


    target_y = (
        GAME_HEIGHT // 2
    )


    game_over_saved = False


    play_start_time = None


    final_duration = 0.0


    history_summary = (
        get_history_summary()
    )


    reset_gesture()


# ============================================================
# PREPARAR HISTORIAL
# ============================================================

ensure_history_file()


history_summary = (
    get_history_summary()
)


# ============================================================
# INICIAR CÁMARA
# ============================================================

cap = cv2.VideoCapture(
    CAMERA_INDEX
)


cap.set(
    cv2.CAP_PROP_FRAME_WIDTH,
    CAMERA_WIDTH
)


cap.set(
    cv2.CAP_PROP_FRAME_HEIGHT,
    CAMERA_HEIGHT
)


cap.set(
    cv2.CAP_PROP_BUFFERSIZE,
    1
)


if not cap.isOpened():

    print(
        "ERROR: No se pudo abrir la cámara."
    )

    sys.exit()


# ============================================================
# PYGAME Y MIXER
# ============================================================

pygame.mixer.pre_init(
    44100,
    -16,
    2,
    512
)


pygame.init()


if (
    pygame.mixer.get_init()
    is None
):

    try:

        pygame.mixer.init(
            frequency=44100,
            size=-16,
            channels=2,
            buffer=512
        )


    except pygame.error as error:

        print(
            f"ADVERTENCIA: audio deshabilitado: {error}"
        )


screen = pygame.display.set_mode(
    (
        SCREEN_WIDTH,
        SCREEN_HEIGHT
    )
)


pygame.display.set_caption(
    WINDOW_NAME
)


clock = pygame.time.Clock()


# ============================================================
# AUDIO
# ============================================================

music_loaded = (
    load_background_music()
)


damage_sound = load_sound_safe(
    DAMAGE_SOUND_PATH,
    DAMAGE_VOLUME
)


shield_sound = load_sound_safe(
    SHIELD_SOUND_PATH,
    SHIELD_VOLUME
)


shot_sound = load_sound_safe(
    SHOT_SOUND_PATH,
    SHOT_VOLUME
)


collect_sound = load_sound_safe(
    COLLECT_SOUND_PATH,
    COLLECT_VOLUME
)


# ============================================================
# FUENTES
# ============================================================

font_title = get_math_font(
    31
)


font_normal = get_math_font(
    17
)


font_camera = get_math_font(
    22
)


font_legend = get_math_font(
    21
)


font_menu_title = get_math_font(
    40
)


font_menu_text = get_math_font(
    22
)


font_button = get_math_font(
    26
)


font_countdown = get_math_font(
    120
)


font_game_over = get_math_font(
    48
)


font_game_over_text = get_math_font(
    26
)


font_history_title = get_math_font(
    19
)


font_history = get_math_font(
    15
)


# ============================================================
# IMÁGENES
# ============================================================

background_image = load_image(
    BACKGROUND_PATH,
    (
        GAME_WIDTH,
        GAME_HEIGHT
    )
)


ship_image = load_image(
    SHIP_PATH,
    (
        90,
        90
    )
)


flower_image = load_image(
    FLOWER_PATH,
    (
        140,
        140
    )
)


astronaut_cat_image = load_image(
    ASTRONAUT_CAT_PATH,
    (
        210,
        260
    )
)


# ============================================================
# ESTADO INICIAL
# ============================================================

ship_x = (
    GAME_X
    +
    GAME_WIDTH / 2
)


ship_y = (
    GAME_HEIGHT
    -
    170
)


score = 0

energy = 100


orbs = [
    create_orb()
    for _ in range(
        MAX_ORBS
    )
]


obstacles = [
    create_obstacle()
    for _ in range(
        MAX_OBSTACLES
    )
]


red_enemy = (
    create_red_enemy()
)


projectiles = []


camera_surface = None

frame_counter = 0


game_state = (
    STATE_MENU
)


countdown_start_time = None

countdown_seconds = 3


last_shot_time = 0


play_start_time = None

final_duration = 0.0


game_over_saved = False


# ============================================================
# BOTONES
# ============================================================

start_button_rect = pygame.Rect(
    GAME_X + 290,
    430,
    320,
    62
)


retry_button_rect = pygame.Rect(
    430,
    470,
    220,
    58
)


quit_button_rect = pygame.Rect(
    680,
    470,
    170,
    58
)


# ============================================================
# LOOP PRINCIPAL
# ============================================================

running = True


while running:

    dt = (
        clock.tick(FPS)
        /
        1000.0
    )


    mouse_pos = (
        pygame.mouse.get_pos()
    )


    # ========================================================
    # EVENTOS
    # ========================================================

    for event in pygame.event.get():

        if event.type == pygame.QUIT:

            running = False


        elif event.type == pygame.KEYDOWN:

            if event.key == pygame.K_ESCAPE:

                running = False


        elif (
            event.type
            ==
            pygame.MOUSEBUTTONDOWN
            and
            event.button
            ==
            1
        ):

            # EMPEZAR

            if (
                game_state
                ==
                STATE_MENU
            ):

                if start_button_rect.collidepoint(
                    mouse_pos
                ):

                    reset_game()


                    game_state = (
                        STATE_COUNTDOWN
                    )


                    countdown_start_time = (
                        pygame.time.get_ticks()
                    )


            # GAME OVER

            elif (
                game_state
                ==
                STATE_GAME_OVER
            ):

                if retry_button_rect.collidepoint(
                    mouse_pos
                ):

                    reset_game()


                    game_state = (
                        STATE_COUNTDOWN
                    )


                    countdown_start_time = (
                        pygame.time.get_ticks()
                    )


                elif quit_button_rect.collidepoint(
                    mouse_pos
                ):

                    running = False


    # ========================================================
    # CÁMARA
    # ========================================================

    success, frame = (
        cap.read()
    )


    if not success:

        print(
            "ERROR leyendo cámara."
        )

        break


    frame = cv2.flip(
        frame,
        1
    )


    frame_counter += 1


    # ========================================================
    # MEDIAPIPE
    # ========================================================

    if (
        frame_counter
        %
        MEDIAPIPE_EVERY_N_FRAMES
        ==
        0
    ):

        rgb = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )


        results = (
            hands.process(
                rgb
            )
        )


        hand_detected = False


        if (
            results.multi_hand_landmarks
        ):

            hand_landmarks = (
                results
                .multi_hand_landmarks[0]
            )


            # ------------------------------------------------
            # LANDMARKS EN LA CÁMARA
            # ------------------------------------------------

            mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,
                HAND_LANDMARK_STYLE,
                HAND_CONNECTION_STYLE
            )


            # ------------------------------------------------
            # GESTO
            # ------------------------------------------------

            detected_gesture = (
                detect_gesture(
                    hand_landmarks
                )
            )


            update_stable_gesture(
                detected_gesture
            )


            # ------------------------------------------------
            # POSICIÓN
            # ------------------------------------------------

            raw_x, raw_y = (
                get_palm_center(
                    hand_landmarks
                )
            )


            raw_proximity = (
                get_palm_size(
                    hand_landmarks
                )
            )


            smooth_x = ema(
                raw_x,
                smooth_x,
                HAND_ALPHA
            )


            smooth_y = ema(
                raw_y,
                smooth_y,
                HAND_ALPHA
            )


            smooth_proximity = ema(
                raw_proximity,
                smooth_proximity,
                HAND_ALPHA
            )


            target_x = (
                GAME_X
                +
                smooth_x
                *
                GAME_WIDTH
            )


            target_y = (
                smooth_y
                *
                GAME_HEIGHT
            )


            target_x = clamp(
                target_x,
                GAME_X + 45,
                SCREEN_WIDTH - 45
            )


            target_y = clamp(
                target_y,
                45,
                GAME_HEIGHT - 45
            )


            hand_detected = True


        else:

            reset_gesture()


    # ========================================================
    # TURBO
    # ========================================================

    if (
        hand_detected
        and
        smooth_proximity is not None
    ):

        if (
            not turbo_active
            and
            smooth_proximity
            >=
            PROX_TURBO_ON
        ):

            turbo_active = True


        elif (
            turbo_active
            and
            smooth_proximity
            <=
            PROX_TURBO_OFF
        ):

            turbo_active = False


    else:

        turbo_active = False


    # ========================================================
    # ESCUDO
    # ========================================================

    shield_active = (
        game_state
        ==
        STATE_PLAYING

        and

        hand_detected

        and

        current_gesture
        ==
        GESTURE_PEACE
    )


    # Sonido solamente al activarse.

    if (
        shield_active
        and
        not previous_shield_active
    ):

        play_sound(
            shield_sound
        )


    previous_shield_active = (
        shield_active
    )


    # ========================================================
    # JUEGO ACTIVO
    # ========================================================

    if (
        game_state
        ==
        STATE_PLAYING
    ):

        current_time = (
            pygame.time.get_ticks()
        )


        # ====================================================
        # DISPARO
        # ====================================================

        if (
            hand_detected

            and

            current_gesture
            ==
            GESTURE_FIST

            and

            current_time
            -
            last_shot_time
            >=
            SHOT_COOLDOWN_MS
        ):

            projectiles.append(
                create_projectile(
                    ship_x,
                    ship_y
                )
            )


            play_sound(
                shot_sound
            )


            last_shot_time = (
                current_time
            )


        # ====================================================
        # MOVIMIENTO NAVE
        # ====================================================

        if hand_detected:

            ship_x += (
                target_x
                -
                ship_x
            ) * SHIP_FOLLOW_SPEED


            ship_y += (
                target_y
                -
                ship_y
            ) * SHIP_FOLLOW_SPEED


        ship_x = clamp(
            ship_x,
            GAME_X + 45,
            SCREEN_WIDTH - 45
        )


        ship_y = clamp(
            ship_y,
            45,
            GAME_HEIGHT - 45
        )


        # ====================================================
        # NIVEL
        # ====================================================

        level = (
            get_level(
                score
            )
        )


        (
            active_orbs,
            active_obstacles,
            base_speed_factor

        ) = get_difficulty_config(
            level
        )


        speed_factor = (
            base_speed_factor
            *
            (
                1.15
                if turbo_active
                else
                1.0
            )
        )


        # ====================================================
        # DISPAROS
        # ====================================================

        for projectile in projectiles:

            projectile["y"] -= (
                projectile["speed"]
                *
                dt
            )


        projectiles[:] = [
            projectile

            for projectile
            in projectiles

            if projectile["y"]
            >
            -30
        ]


        # ====================================================
        # ORBES
        # ====================================================

        for i in range(
            active_orbs
        ):

            orb = (
                orbs[i]
            )


            orb["y"] += (
                orb["speed"]
                *
                speed_factor
                *
                dt
            )


            if (
                orb["y"]
                >
                GAME_HEIGHT + 50
            ):

                reset_object(
                    orb,
                    -500,
                    -50
                )


            if collision(
                ship_x,
                ship_y,
                30,

                orb["x"],
                orb["y"],
                orb["radius"]
            ):

                score += 10


                play_sound(
                    collect_sound
                )


                reset_object(
                    orb,
                    -500,
                    -50
                )


        # ====================================================
        # ACTUALIZAR NIVEL DESPUÉS DE RECOGER ORBES
        # ====================================================

        level = (
            get_level(
                score
            )
        )


        damage_amount = (
            get_damage_for_level(
                level
            )
        )


        red_enemy_active = (
            level
            >=
            RED_ENEMY_START_LEVEL
        )


        # ====================================================
        # ENEMIGOS MORADOS
        # ====================================================

        for i in range(
            active_obstacles
        ):

            obstacle = (
                obstacles[i]
            )


            obstacle["y"] += (
                obstacle["speed"]
                *
                speed_factor
                *
                dt
            )


            if (
                obstacle["y"]
                >
                GAME_HEIGHT + 70
            ):

                reset_object(
                    obstacle,
                    -700,
                    -100
                )


            # -----------------------------------------------
            # NAVE CONTRA MORADO
            # -----------------------------------------------

            if collision(
                ship_x,
                ship_y,
                30,

                obstacle["x"],
                obstacle["y"],
                obstacle["radius"]
            ):

                if shield_active:

                    reset_object(
                        obstacle,
                        -700,
                        -100
                    )


                else:

                    energy -= (
                        damage_amount
                    )


                    play_sound(
                        damage_sound
                    )


                    reset_object(
                        obstacle,
                        -700,
                        -100
                    )


            # -----------------------------------------------
            # DISPARO CONTRA MORADO
            # -----------------------------------------------

            hit_projectile = None


            for projectile in projectiles[:]:

                if collision(
                    projectile["x"],
                    projectile["y"],
                    projectile["radius"],

                    obstacle["x"],
                    obstacle["y"],
                    obstacle["radius"]
                ):

                    hit_projectile = (
                        projectile
                    )


                    score += (
                        POINTS_PER_DESTROYED_OBSTACLE
                    )


                    reset_object(
                        obstacle,
                        -700,
                        -100
                    )


                    break


            if (
                hit_projectile
                is not None
                and
                hit_projectile
                in projectiles
            ):

                projectiles.remove(
                    hit_projectile
                )


        # ====================================================
        # ENEMIGO ROJO RÁPIDO
        #
        # SOLO DESDE NIVEL 5
        # ====================================================

        if red_enemy_active:

            red_enemy["y"] += (
                red_enemy["speed"]
                *
                speed_factor
                *
                dt
            )


            # -----------------------------------------------
            # SALIÓ DE PANTALLA
            # -----------------------------------------------

            if (
                red_enemy["y"]
                >
                GAME_HEIGHT + 70
            ):

                reset_object(
                    red_enemy,
                    -900,
                    -150
                )


            # -----------------------------------------------
            # NAVE CONTRA ROJO
            # -----------------------------------------------

            if collision(
                ship_x,
                ship_y,
                30,

                red_enemy["x"],
                red_enemy["y"],
                red_enemy["radius"]
            ):

                # Escudo
                if shield_active:

                    reset_object(
                        red_enemy,
                        -900,
                        -150
                    )


                # Sin escudo
                else:

                    energy -= (
                        damage_amount
                    )


                    play_sound(
                        damage_sound
                    )


                    reset_object(
                        red_enemy,
                        -900,
                        -150
                    )


            # -----------------------------------------------
            # DISPARO CONTRA ROJO
            # -----------------------------------------------

            hit_red_projectile = None


            for projectile in projectiles[:]:

                if collision(
                    projectile["x"],
                    projectile["y"],
                    projectile["radius"],

                    red_enemy["x"],
                    red_enemy["y"],
                    red_enemy["radius"]
                ):

                    hit_red_projectile = (
                        projectile
                    )


                    score += (
                        POINTS_PER_DESTROYED_OBSTACLE
                    )


                    reset_object(
                        red_enemy,
                        -900,
                        -150
                    )


                    break


            if (
                hit_red_projectile
                is not None
                and
                hit_red_projectile
                in projectiles
            ):

                projectiles.remove(
                    hit_red_projectile
                )


        # ====================================================
        # ENERGÍA
        # ====================================================

        energy = int(
            clamp(
                energy,
                0,
                100
            )
        )


        # ====================================================
        # GAME OVER
        # ====================================================

        if energy <= 0:

            energy = 0


            final_level = (
                get_level(
                    score
                )
            )


            level = (
                final_level
            )


            if not game_over_saved:

                if (
                    play_start_time
                    is not None
                ):

                    final_duration = (
                        pygame.time.get_ticks()
                        -
                        play_start_time
                    ) / 1000.0


                else:

                    final_duration = (
                        0.0
                    )


                save_game_history(
                    score,
                    final_level,
                    final_duration
                )


                history_summary = (
                    get_history_summary()
                )


                game_over_saved = True


            game_state = (
                STATE_GAME_OVER
            )


            shield_active = False

            previous_shield_active = False


            stop_background_music()


    else:

        level = (
            get_level(
                score
            )
        )


        (
            active_orbs,
            active_obstacles,
            base_speed_factor

        ) = get_difficulty_config(
            level
        )


        red_enemy_active = (
            level
            >=
            RED_ENEMY_START_LEVEL
        )


    # ========================================================
    # COUNTDOWN
    # ========================================================

    countdown_value = None


    if (
        game_state
        ==
        STATE_COUNTDOWN
    ):

        elapsed_ms = (
            pygame.time.get_ticks()
            -
            countdown_start_time
        )


        seconds_passed = (
            elapsed_ms
            //
            1000
        )


        if (
            seconds_passed
            >=
            countdown_seconds
        ):

            game_state = (
                STATE_PLAYING
            )


            play_start_time = (
                pygame.time.get_ticks()
            )


            start_background_music()


        else:

            countdown_value = (
                countdown_seconds
                -
                seconds_passed
            )


    # ========================================================
    # MINI CÁMARA
    # ========================================================

    if (
        frame_counter
        %
        2
        ==
        0
    ):

        camera_surface = (
            camera_to_surface(
                frame
            )
        )


    # ========================================================
    # DIBUJADO
    # ========================================================

    draw_left_panel_background(
        screen
    )


    # ========================================================
    # FONDO
    # ========================================================

    if background_image is not None:

        screen.blit(
            background_image,
            (
                GAME_X,
                GAME_Y
            )
        )


    else:

        pygame.draw.rect(
            screen,
            (
                10,
                10,
                20
            ),
            (
                GAME_X,
                GAME_Y,
                GAME_WIDTH,
                GAME_HEIGHT
            )
        )


    # ========================================================
    # OBJETOS
    # ========================================================

    if game_state in [
        STATE_COUNTDOWN,
        STATE_PLAYING,
        STATE_GAME_OVER
    ]:

        # ORBES

        for i in range(
            active_orbs
        ):

            draw_orb(
                screen,
                orbs[i]
            )


        # MORADOS

        for i in range(
            active_obstacles
        ):

            draw_obstacle(
                screen,
                obstacles[i]
            )


        # ROJO DESDE NIVEL 5

        if red_enemy_active:

            draw_red_enemy(
                screen,
                red_enemy
            )


        # DISPAROS

        if (
            game_state
            ==
            STATE_PLAYING
        ):

            for projectile in projectiles:

                draw_projectile(
                    screen,
                    projectile
                )


        # NAVE

        draw_ship(
            screen,
            ship_image,
            ship_x,
            ship_y,
            turbo_active,
            shield_active
        )


        # LEYENDA

        draw_legend(
            screen,
            font_legend
        )


    # ========================================================
    # PANEL IZQUIERDO
    # ========================================================

    draw_info_cards(
        screen,
        font_title,
        font_normal,
        score,
        energy,
        smooth_proximity,
        turbo_active,
        shield_active,
        hand_detected,
        level,
        current_gesture
    )


    # ========================================================
    # CÁMARA
    # ========================================================

    draw_camera_card(
        screen,
        camera_surface,
        font_camera
    )


    # ========================================================
    # MENÚ
    # ========================================================

    if (
        game_state
        ==
        STATE_MENU
    ):

        draw_menu_screen(
            screen,
            font_menu_title,
            font_menu_text,
            font_button,
            start_button_rect
        )


    # ========================================================
    # COUNTDOWN
    # ========================================================

    elif (
        game_state
        ==
        STATE_COUNTDOWN
        and
        countdown_value
        is not None
    ):

        draw_countdown(
            screen,
            countdown_value,
            font_countdown
        )


    # ========================================================
    # GAME OVER
    # ========================================================

    elif (
        game_state
        ==
        STATE_GAME_OVER
    ):

        draw_game_over(
            screen,
            font_game_over,
            font_game_over_text,
            font_button,
            score,
            flower_image,
            retry_button_rect,
            quit_button_rect
        )


        draw_history_card(
            screen,
            history_summary,
            font_history_title,
            font_history
        )


        draw_astronaut_cat_card(
            screen,
            astronaut_cat_image,
            font_history_title,
            font_history
        )


    pygame.display.flip()


# ============================================================
# CIERRE
# ============================================================

cap.release()

hands.close()


if (
    pygame.mixer.get_init()
    is not None
):

    pygame.mixer.music.stop()


pygame.quit()


print()

print(
    "Cosmic Drift cerrado correctamente."
)