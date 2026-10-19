import cv2
import mediapipe as mp
import math


# ============================================================
# COSMIC DRIFT - FASE 1
# Seguimiento de mano + centro de palma + proximidad
# ============================================================


# ------------------------------------------------------------
# CONFIGURACIÓN
# ------------------------------------------------------------

CAMERA_INDEX = 0

CAMERA_WIDTH = 960
CAMERA_HEIGHT = 540

# Nombre de la ventana
WINDOW_NAME = "Cosmic Drift - Seguimiento de mano"

# Suavizado EMA
# Más bajo = más suave
# Más alto = responde más rápido
ALPHA = 0.25


# ------------------------------------------------------------
# MEDIAPIPE
# ------------------------------------------------------------

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)


# ------------------------------------------------------------
# PUNTOS DE LA PALMA
# ------------------------------------------------------------

# 0  = muñeca
# 5  = base índice
# 9  = base dedo medio
# 13 = base anular
# 17 = base meñique

PALM_POINTS = [0, 5, 9, 13, 17]


# ------------------------------------------------------------
# VARIABLES PARA SUAVIZADO
# ------------------------------------------------------------

smooth_x = None
smooth_y = None
smooth_proximity = None


# ------------------------------------------------------------
# FUNCIONES
# ------------------------------------------------------------

def ema(actual, anterior, alpha):
    """
    Suavizado Exponential Moving Average.
    Reduce el temblor natural del seguimiento.
    """

    if anterior is None:
        return actual

    return alpha * actual + (1 - alpha) * anterior


def distance_2d(a, b):
    """
    Calcula la distancia 2D entre dos landmarks.
    """

    return math.sqrt(
        (a.x - b.x) ** 2 +
        (a.y - b.y) ** 2
    )


def get_palm_center(hand_landmarks):
    """
    Calcula el centro aproximado de la palma.
    """

    points = [
        hand_landmarks.landmark[i]
        for i in PALM_POINTS
    ]

    x = sum(point.x for point in points) / len(points)
    y = sum(point.y for point in points) / len(points)

    return x, y


def get_palm_size(hand_landmarks):
    """
    Calcula el tamaño aparente de la palma.

    Lo usamos como aproximación de proximidad:

    mano cerca -> valor mayor
    mano lejos -> valor menor

    No representa distancia física real.
    """

    landmarks = hand_landmarks.landmark

    # Largo aproximado de la palma
    vertical = distance_2d(
        landmarks[0],
        landmarks[9]
    )

    # Ancho aproximado de la palma
    horizontal = distance_2d(
        landmarks[5],
        landmarks[17]
    )

    return (vertical + horizontal) / 2


# ------------------------------------------------------------
# INICIAR CÁMARA
# ------------------------------------------------------------

cap = cv2.VideoCapture(CAMERA_INDEX)

cap.set(
    cv2.CAP_PROP_FRAME_WIDTH,
    CAMERA_WIDTH
)

cap.set(
    cv2.CAP_PROP_FRAME_HEIGHT,
    CAMERA_HEIGHT
)


if not cap.isOpened():
    print("ERROR: No se pudo abrir la cámara.")
    exit()


print()
print("======================================")
print("       COSMIC DRIFT - FASE 1")
print("======================================")
print()
print("Mueve tu mano frente a la cámara.")
print("Acércala y aléjala.")
print()
print("Para salir:")
print(" - Presiona ESC")
print(" - Presiona Q")
print(" - Cierra la ventana con la X")
print()


# ------------------------------------------------------------
# BUCLE PRINCIPAL
# ------------------------------------------------------------

while True:

    success, frame = cap.read()

    if not success:
        print("ERROR: No se pudo leer la cámara.")
        break


    # --------------------------------------------------------
    # EFECTO ESPEJO
    # --------------------------------------------------------

    frame = cv2.flip(frame, 1)

    height, width, _ = frame.shape


    # --------------------------------------------------------
    # OpenCV usa BGR
    # MediaPipe necesita RGB
    # --------------------------------------------------------

    rgb = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )


    # --------------------------------------------------------
    # PROCESAR MANO
    # --------------------------------------------------------

    results = hands.process(rgb)


    # --------------------------------------------------------
    # SI DETECTAMOS UNA MANO
    # --------------------------------------------------------

    if results.multi_hand_landmarks:

        hand_landmarks = results.multi_hand_landmarks[0]


        # ----------------------------------------------------
        # DIBUJAR LANDMARKS
        # ----------------------------------------------------

        mp_drawing.draw_landmarks(
            frame,
            hand_landmarks,
            mp_hands.HAND_CONNECTIONS,
            mp_drawing.DrawingSpec(
                color=(255, 180, 255),
                thickness=2,
                circle_radius=3
            ),
            mp_drawing.DrawingSpec(
                color=(255, 220, 120),
                thickness=2
            )
        )


        # ----------------------------------------------------
        # CENTRO DE LA PALMA
        # ----------------------------------------------------

        raw_x, raw_y = get_palm_center(
            hand_landmarks
        )


        # ----------------------------------------------------
        # PROXIMIDAD
        # ----------------------------------------------------

        raw_proximity = get_palm_size(
            hand_landmarks
        )


        # ----------------------------------------------------
        # SUAVIZADO
        # ----------------------------------------------------

        smooth_x = ema(
            raw_x,
            smooth_x,
            ALPHA
        )

        smooth_y = ema(
            raw_y,
            smooth_y,
            ALPHA
        )

        smooth_proximity = ema(
            raw_proximity,
            smooth_proximity,
            ALPHA
        )


        # ----------------------------------------------------
        # CONVERTIR CENTRO A PÍXELES
        # ----------------------------------------------------

        center_x = int(smooth_x * width)
        center_y = int(smooth_y * height)


        # ----------------------------------------------------
        # DIBUJAR CENTRO DE PALMA
        # ----------------------------------------------------

        cv2.circle(
            frame,
            (center_x, center_y),
            12,
            (255, 255, 255),
            -1
        )

        cv2.circle(
            frame,
            (center_x, center_y),
            22,
            (255, 100, 255),
            2
        )


        # ----------------------------------------------------
        # IDENTIFICAR MANO
        # ----------------------------------------------------

        hand_label = "Desconocida"

        if results.multi_handedness:

            hand_label = (
                results
                .multi_handedness[0]
                .classification[0]
                .label
            )


        # ----------------------------------------------------
        # MOSTRAR VALORES
        # ----------------------------------------------------

        cv2.putText(
            frame,
            f"X: {smooth_x:.3f}",
            (30, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            f"Y: {smooth_y:.3f}",
            (30, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            f"Proximidad: {smooth_proximity:.3f}",
            (30, 115),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            f"Mano: {hand_label}",
            (30, 150),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )


        # ----------------------------------------------------
        # BARRA DE PROXIMIDAD
        # ----------------------------------------------------

        bar_value = int(
            min(smooth_proximity * 1000, 300)
        )

        cv2.rectangle(
            frame,
            (30, 180),
            (330, 205),
            (100, 100, 100),
            2
        )

        cv2.rectangle(
            frame,
            (30, 180),
            (30 + bar_value, 205),
            (255, 120, 255),
            -1
        )


    # --------------------------------------------------------
    # SI NO DETECTAMOS MANO
    # --------------------------------------------------------

    else:

        cv2.putText(
            frame,
            "Buscando mano...",
            (30, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (255, 255, 255),
            2
        )


    # --------------------------------------------------------
    # MOSTRAR VENTANA
    # --------------------------------------------------------

    cv2.imshow(
        WINDOW_NAME,
        frame
    )


    # --------------------------------------------------------
    # CONTROL DE CIERRE
    # --------------------------------------------------------

    key = cv2.waitKey(1) & 0xFF


    # Salir con ESC
    if key == 27:
        break


    # Salir con Q
    if key == ord("q"):
        break


    # Salir al cerrar la ventana con la X
    if cv2.getWindowProperty(
        WINDOW_NAME,
        cv2.WND_PROP_VISIBLE
    ) < 1:
        break


# ------------------------------------------------------------
# CERRAR TODO CORRECTAMENTE
# ------------------------------------------------------------

cap.release()

hands.close()

cv2.destroyAllWindows()

print()
print("Cosmic Drift cerrado correctamente.")