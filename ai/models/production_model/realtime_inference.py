import cv2
import joblib
import numpy as np
import mediapipe as mp
from collections import deque, Counter
import tensorflow as tf


# =========================================================
# CUSTOM OBJECTS — wajib ada agar model v3 bisa diload
# =========================================================

class AttentionLayer(tf.keras.layers.Layer):
    def __init__(self, units=32, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.W = tf.keras.layers.Dense(units, activation="tanh")
        self.V = tf.keras.layers.Dense(1)

    def call(self, encoder_output, training=None):
        score   = self.V(self.W(encoder_output))
        weights = tf.nn.softmax(score, axis=1)
        context = tf.reduce_sum(weights * encoder_output, axis=1)
        return context

    def get_config(self):
        config = super().get_config()
        config.update({"units": self.units})
        return config


class FocalLoss(tf.keras.losses.Loss):
    def __init__(self, gamma=2.0, alpha=0.25, **kwargs):
        super().__init__(**kwargs)
        self.gamma = gamma
        self.alpha = alpha

    def call(self, y_true, y_pred):
        y_pred = tf.clip_by_value(y_pred, 1e-7, 1.0 - 1e-7)
        ce     = -y_true * tf.math.log(y_pred)
        weight = self.alpha * tf.pow(1.0 - y_pred, self.gamma)
        return tf.reduce_mean(tf.reduce_sum(weight * ce, axis=-1))

    def get_config(self):
        config = super().get_config()
        config.update({"gamma": self.gamma, "alpha": self.alpha})
        return config


# =========================================================
# CONFIG
# =========================================================

MODEL_PATH   = "production_model/signbank_model.h5"
ENCODER_PATH = "models/label_encoder.pkl"

SEQUENCE_LENGTH  = 40
TOTAL_FEATURES   = 126

MIN_CONFIDENCE    = 0.85
MIN_STABLE_FRAMES = 15
SMOOTHING_WINDOW  = 12
COOLDOWN_FRAMES   = 25

WEAK_CLASSES = {
    "M": 0.90, "N": 0.90,
    "100": 0.88, "1000": 0.88,
    "RIBU": 0.88, "MILYAR": 0.88,
}


# =========================================================
# LOAD MODEL
# =========================================================

print("[INFO] Loading model V3...")
model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={
        "AttentionLayer": AttentionLayer,
        "FocalLoss"     : FocalLoss
    },
    compile=False
)

# Warmup — hilangkan delay prediksi pertama
print("[INFO] Warming up...")
_ = model(np.zeros((1, SEQUENCE_LENGTH, TOTAL_FEATURES), dtype=np.float32),
          training=False)

print("[INFO] Loading encoder...")
encoder = joblib.load(ENCODER_PATH)
print(f"[INFO] Siap. Kelas: {len(encoder.classes_)}")


# =========================================================
# MEDIAPIPE
# =========================================================

mp_hands = mp.solutions.hands
mp_draw  = mp.solutions.drawing_utils
mp_style = mp.solutions.drawing_styles

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)


# =========================================================
# BUFFER
# =========================================================

sequence_buffer   = deque(maxlen=SEQUENCE_LENGTH)
prediction_buffer = deque(maxlen=SMOOTHING_WINDOW)

sentence        = []
last_prediction = ""
current_stable  = ""
stable_count    = 0
cooldown        = 0


# =========================================================
# FUNGSI NORMALISASI — SAMA PERSIS dengan landmark_extraction_2hand.py
# =========================================================

def normalize_hand(hand_data: list) -> list:
    """
    Normalisasi koordinat tangan relatif terhadap wrist (landmark ke-0).

    KENAPA INI WAJIB:
    Dataset dilatih menggunakan landmark_extraction_2hand.py yang
    menerapkan normalisasi wrist-centered. Koordinat setiap landmark
    dikurangi posisi wrist sehingga wrist selalu di (0,0,0).

    Kalau realtime tidak melakukan ini → distribusi data berbeda total
    dari training → model tidak bisa mengenali gesture apapun dengan benar.

    Contoh:
        Raw MediaPipe: wrist = (0.5, 0.6, 0), telunjuk = (0.6, 0.5, -0.05)
        Setelah norm : wrist = (0.0, 0.0, 0), telunjuk = (0.1, -0.1, -0.05)

    Args:
        hand_data: list 63 nilai [x0,y0,z0, x1,y1,z1, ..., x20,y20,z20]

    Returns:
        list 63 nilai setelah dikurangi posisi wrist
    """
    wrist_x = hand_data[0]
    wrist_y = hand_data[1]
    wrist_z = hand_data[2]

    normalized = []
    for i in range(0, len(hand_data), 3):
        normalized.extend([
            hand_data[i]   - wrist_x,
            hand_data[i+1] - wrist_y,
            hand_data[i+2] - wrist_z,
        ])
    return normalized


def extract_landmarks(results) -> np.ndarray | None:
    """
    Ekstrak dan normalisasi landmark tangan dari hasil MediaPipe.

    Proses:
    1. Ambil koordinat raw lm.x, lm.y, lm.z per landmark
    2. Normalisasi wrist-centered (WAJIB, sama dengan training)
    3. Pisahkan tangan kiri [0:63] dan kanan [63:126]
    4. Return array (126,)

    Returns:
        np.ndarray (126,) atau None jika tangan tidak terdeteksi
    """
    if not results.multi_hand_landmarks or not results.multi_handedness:
        return None

    left_hand  = [0.0] * 63
    right_hand = [0.0] * 63

    for hand_landmarks, handedness in zip(
        results.multi_hand_landmarks,
        results.multi_handedness
    ):
        label = handedness.classification[0].label

        # Ambil raw koordinat
        hand_data = []
        for lm in hand_landmarks.landmark:
            hand_data.extend([lm.x, lm.y, lm.z])

        # Normalisasi wrist-centered — SAMA dengan training
        hand_data = normalize_hand(hand_data)

        if label == "Left":
            left_hand = hand_data
        else:
            right_hand = hand_data

    return np.array(left_hand + right_hand, dtype=np.float32)


# =========================================================
# PREDICT
# =========================================================

def predict(sequence_buf) -> tuple:
    """
    Prediksi dari buffer sequence.

    Returns:
        (label, confidence) atau ('', 0.0) jika belum siap
    """
    if len(sequence_buf) < SEQUENCE_LENGTH:
        return '', 0.0

    inp   = np.expand_dims(
        np.array(sequence_buf, dtype=np.float32), axis=0
    )
    proba = model(inp, training=False).numpy()[0]

    confidence = float(np.max(proba))
    idx        = int(np.argmax(proba))
    label      = encoder.inverse_transform([idx])[0]

    return label, confidence


# =========================================================
# RESET
# =========================================================

def reset_all():
    global sentence, last_prediction, current_stable, stable_count, cooldown
    sentence        = []
    last_prediction = ""
    current_stable  = ""
    stable_count    = 0
    cooldown        = 0
    sequence_buffer.clear()
    prediction_buffer.clear()
    print("[INFO] Reset.")


# =========================================================
# UI HELPER
# =========================================================

def put_text(frame, text, pos, scale=0.8,
             color=(255, 255, 255), thickness=2):
    """Teks dengan outline hitam agar terbaca di background apapun."""
    cv2.putText(frame, text, pos, cv2.FONT_HERSHEY_SIMPLEX,
                scale, (0, 0, 0), thickness + 2, cv2.LINE_AA)
    cv2.putText(frame, text, pos, cv2.FONT_HERSHEY_SIMPLEX,
                scale, color, thickness, cv2.LINE_AA)


# =========================================================
# MAIN LOOP
# =========================================================

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("[ERROR] Kamera tidak bisa dibuka.")
    exit()

cap.set(cv2.CAP_PROP_FRAME_WIDTH,  1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

print("[INFO] Kamera aktif.")
print("[INFO] C = Reset | Q = Quit\n")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)

    rgb             = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    rgb.flags.writeable = False
    results         = hands.process(rgb)
    rgb.flags.writeable = True

    hand_detected = results.multi_hand_landmarks is not None

    display_label      = "-"
    display_confidence = 0.0
    status_text        = "Tangan tidak terdeteksi"

    # ── Gambar landmark ───────────────────────────────────────
    if hand_detected:
        status_text = "Tangan terdeteksi"
        for hand_lm in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(
                frame, hand_lm,
                mp_hands.HAND_CONNECTIONS,
                mp_style.get_default_hand_landmarks_style(),
                mp_style.get_default_hand_connections_style()
            )

    # ── Update buffer ─────────────────────────────────────────
    if hand_detected:
        landmarks = extract_landmarks(results)
        if landmarks is not None:
            sequence_buffer.append(landmarks)
    else:
        # Bersihkan saat tangan tidak ada
        sequence_buffer.clear()
        prediction_buffer.clear()
        current_stable = ""
        stable_count   = 0
        cooldown       = 0

    # ── Prediksi ─────────────────────────────────────────────
    if hand_detected and len(sequence_buffer) == SEQUENCE_LENGTH:
        label, confidence = predict(sequence_buffer)

        display_label      = label
        display_confidence = confidence

        # Threshold per kelas (kelas lemah butuh confidence lebih tinggi)
        threshold = WEAK_CLASSES.get(label, MIN_CONFIDENCE)

        if confidence >= threshold:
            prediction_buffer.append(label)

            counts = Counter(prediction_buffer)
            stable_pred, votes = counts.most_common(1)[0]

            if stable_pred == current_stable:
                stable_count += 1
            else:
                current_stable = stable_pred
                stable_count   = 1

            # Konfirmasi ke kalimat
            if stable_count >= MIN_STABLE_FRAMES and cooldown == 0:
                if stable_pred != last_prediction:
                    sentence.append(stable_pred)
                    last_prediction = stable_pred
                    cooldown        = COOLDOWN_FRAMES
                    stable_count    = 0
                    print(f"[KATA] {stable_pred} ({confidence:.0%})")
        else:
            status_text = f"Confidence rendah ({confidence:.0%})"

    if cooldown > 0:
        cooldown -= 1

    # ── UI ────────────────────────────────────────────────────
    h, w = frame.shape[:2]

    # Prediction (hijau = confidence ok, kuning = low)
    pred_color = (0, 255, 0) if display_confidence >= MIN_CONFIDENCE \
                 else (0, 200, 255)
    put_text(frame, f"Prediction: {display_label}",
             (10, 40), scale=1.0, color=pred_color)

    put_text(frame, f"Confidence: {display_confidence:.2f}",
             (10, 80), scale=0.9, color=(255, 255, 0))

    put_text(frame, f"Status: {status_text}",
             (10, 118), scale=0.65, color=(220, 220, 220))

    put_text(frame, f"Buffer: {len(sequence_buffer)}/{SEQUENCE_LENGTH}",
             (10, 150), scale=0.65, color=(180, 180, 180))

    # Kalimat di bawah
    sentence_text = " ".join(sentence) if sentence else "-"
    put_text(frame, f"Sentence: {sentence_text}",
             (10, h - 40), scale=0.9, color=(255, 255, 255))

    put_text(frame, "C = Reset | Q = Quit",
             (10, h - 10), scale=0.6, color=(180, 180, 180))

    cv2.imshow("SignBank AI Realtime V3", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == ord("c"):
        reset_all()
    elif key == ord("q"):
        break


cap.release()
cv2.destroyAllWindows()
print("[INFO] Selesai.")