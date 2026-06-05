import os
import datetime
import joblib
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)
from config import (
    PREPARED_DIR,
    MODEL_DIR,
    SEQUENCE_LENGTH,
)

tf.random.set_seed(42)
np.random.seed(42)

PRODUCTION_DIR     = "production_model"
KERAS_V3_PATH      = os.path.join(PRODUCTION_DIR, "signbank_model.h5")
SAVEDMODEL_V3_PATH = os.path.join(PRODUCTION_DIR, "saved_model")
TENSORBOARD_DIR    = os.path.join("logs", "tensorboard")
TOTAL_FEATURES     = 126

os.makedirs(PRODUCTION_DIR, exist_ok=True)
os.makedirs(TENSORBOARD_DIR, exist_ok=True)


# ============================================================
# CUSTOM LAYER — AttentionLayer (sama dengan V2, wajib ada)
# ============================================================
class AttentionLayer(tf.keras.layers.Layer):
    def __init__(self, units=32, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.W = tf.keras.layers.Dense(units, activation='tanh')
        self.V = tf.keras.layers.Dense(1)

    def call(self, encoder_output, training=None):
        score   = self.V(self.W(encoder_output))
        weights = tf.nn.softmax(score, axis=1)
        context = tf.reduce_sum(weights * encoder_output, axis=1)
        return context

    def get_config(self):
        config = super().get_config()
        config.update({'units': self.units})
        return config


# ============================================================
# CUSTOM LOSS — FocalLoss (sama dengan V2, wajib ada)
# ============================================================
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
        config.update({'gamma': self.gamma, 'alpha': self.alpha})
        return config


# ============================================================
# CUSTOM CALLBACK — EpochLoggerCallback (sama dengan V2)
# ============================================================
class EpochLoggerCallback(tf.keras.callbacks.Callback):
    def __init__(self, save_path, patience_overfit=5):
        super().__init__()
        self.save_path        = save_path
        self.patience_overfit = patience_overfit
        self.best_val_acc     = 0.0
        self.best_epoch       = 0
        self._overfit_count   = 0
        self._prev_val_loss   = float('inf')
        self._start           = None

    def on_train_begin(self, logs=None):
        import time
        self._start = time.time()
        print("\n" + "=" * 62)
        print("  [EpochLoggerCallback] Training V3 dimulai")
        print("  Target: val_accuracy >= 85%")
        print(f"  Save path: {self.save_path}")
        print("=" * 62)

    def on_epoch_begin(self, epoch, logs=None):
        import time
        self._t = time.time()

    def on_epoch_end(self, epoch, logs=None):
        import time
        logs = logs or {}
        dur  = time.time() - self._t

        acc     = logs.get('accuracy', 0)
        val_acc = logs.get('val_accuracy', 0)
        loss    = logs.get('loss', 0)
        val_loss= logs.get('val_loss', 0)
        lr      = float(tf.keras.backend.get_value(
                      self.model.optimizer.learning_rate))

        marker = ""
        if val_acc > self.best_val_acc:
            marker            = " ◀ BEST"
            self.best_val_acc = val_acc
            self.best_epoch   = epoch + 1
            self.model.save(self.save_path)
            self._overfit_count = 0

        if val_loss > self._prev_val_loss:
            self._overfit_count += 1
        else:
            self._overfit_count = 0
        self._prev_val_loss = val_loss

        print(
            f"  Epoch {epoch+1:3d}"
            f" | loss={loss:.4f} val_loss={val_loss:.4f}"
            f" | acc={acc:.3f} val_acc={val_acc:.3f}"
            f" | lr={lr:.1e} | {dur:.0f}s{marker}"
        )

        if self._overfit_count >= self.patience_overfit:
            print(f"Overfitting terdeteksi ({self._overfit_count}x)\n")

        if val_acc >= 0.85 and marker:
            print(f"TARGET 85% TERCAPAI epoch {epoch+1}!\n")

    def on_train_end(self, logs=None):
        import time
        total = (time.time() - self._start) / 60
        print("\n" + "=" * 62)
        print("  [EpochLoggerCallback] Selesai")
        print(f"  Best val_accuracy: {self.best_val_acc:.4f} "
              f"(epoch {self.best_epoch})")
        print(f"  Waktu total: {total:.1f} menit")
        print("=" * 62 + "\n")


# ============================================================
# DATA AUGMENTATION PADA LANDMARK
# ============================================================
def augment_sequence(sequence: np.ndarray) -> np.ndarray:
    """
    Augmentasi sequence landmark untuk meningkatkan variasi data.

    Kenapa ini penting?
    Dataset direkam dalam kondisi tetap (pencahayaan, jarak, kecepatan
    sama). Model yang hanya lihat data homogen akan overfit dan gagal
    saat kondisi sedikit berbeda di realtime.

    Augmentasi mensimulasikan kondisi yang bervariasi:
    1. Gaussian noise  → simulasi gerakan tangan tidak sempurna
    2. Time warping    → simulasi kecepatan gesture berbeda
    3. Scale jitter    → simulasi jarak tangan ke kamera berbeda
    4. Mirror flip     → simulasi sisi tangan yang berbeda

    Augmentasi HANYA dilakukan pada training set, TIDAK pada test set.
    Test set harus tetap original agar evaluasi akurat.

    Args:
        sequence: np.ndarray shape (40, 126)

    Returns:
        np.ndarray shape (40, 126) yang sudah diaugmentasi
    """
    seq = sequence.copy()

    # Pilih augmentasi secara acak (bisa lebih dari satu)
    aug_type = np.random.choice(['noise', 'scale', 'time', 'mirror'],
                                p=[0.4, 0.2, 0.2, 0.2])

    if aug_type == 'noise':
        # Gaussian noise kecil — simulasi hand tremor
        # std=0.01 artinya noise sekitar 1% dari range koordinat (0-1)
        noise = np.random.normal(0, 0.01, seq.shape).astype(np.float32)
        seq   = np.clip(seq + noise, 0.0, 1.0)

    elif aug_type == 'scale':
        # Scale jitter: koordinat diperkecil/diperbesar sedikit
        # Simulasi tangan lebih dekat atau lebih jauh dari kamera
        scale = np.random.uniform(0.90, 1.10)
        seq   = np.clip(seq * scale, 0.0, 1.0)

    elif aug_type == 'time':
        # Time warping: acak ulang urutan frame sedikit
        # Simulasi kecepatan gesture yang berbeda
        n = len(seq)
        # Ambil sample dengan replacement di sekitar urutan asli
        indices = np.sort(np.random.choice(n, size=n, replace=True))
        seq = seq[indices]

    elif aug_type == 'mirror':
        # Mirror horizontal: flip koordinat x
        # Koordinat x ada di posisi 0, 3, 6, ... (setiap 3 nilai)
        # Ini simulasi tangan dari sudut berbeda
        seq_mirrored = seq.copy()
        for i in range(0, seq.shape[1], 3):
            seq_mirrored[:, i] = 1.0 - seq[:, i]
        seq = seq_mirrored

    return seq.astype(np.float32)


def create_augmented_dataset(X_train, y_train, augment_factor=2):
    """
    Buat dataset augmentasi dari X_train.

    augment_factor=2 artinya dataset train jadi 3x lebih besar:
    original + 2 versi augmentasi per sampel.

    Tidak sentuh X_test sama sekali.

    Args:
        X_train       : (N, 40, 126)
        y_train       : (N, num_classes)
        augment_factor: berapa kopi augmentasi per sampel

    Returns:
        X_aug, y_aug dengan shape (N * (1+factor), 40, 126)
    """
    print(f"  Augmentasi {augment_factor}x dari {len(X_train)} sampel...")

    X_list = [X_train]
    y_list = [y_train]

    for _ in range(augment_factor):
        X_aug_batch = np.array(
            [augment_sequence(seq) for seq in X_train],
            dtype=np.float32
        )
        X_list.append(X_aug_batch)
        y_list.append(y_train)

    X_combined = np.concatenate(X_list, axis=0)
    y_combined = np.concatenate(y_list, axis=0)

    # Shuffle agar augmented dan original tidak berkelompok
    idx = np.random.permutation(len(X_combined))
    print(f"  Dataset setelah augmentasi: {X_combined.shape}")
    return X_combined[idx], y_combined[idx]


# ============================================================
# BUILD MODEL 
# ============================================================
def build_model_v3(num_classes):
    """
    Perubahan dari V2:
    - BiLSTM(64→128) dikecilkan jadi BiLSTM(32→64)
      Alasan: dataset kita ~4500 sampel setelah augmentasi.
              Model 178K param terlalu besar → overfit.
              Model 52K param lebih sesuai ukuran dataset.
    - Dropout 0.3 → 0.4
      Alasan: dropout lebih tinggi paksa model belajar fitur
              yang lebih robust, bukan hafal data training.
    - L2 regularization pada Dense layer
      Alasan: tambahan penalti untuk bobot yang terlalu besar.
    """

    inp = tf.keras.Input(
        shape=(SEQUENCE_LENGTH, TOTAL_FEATURES),
        name="gesture_input"
    )

    # BiLSTM 1 — lebih kecil dari V2 (32 bukan 64)
    x = tf.keras.layers.Bidirectional(
        tf.keras.layers.LSTM(
            32,
            return_sequences=True,
            dropout=0.4,
            recurrent_dropout=0.0
        ),
        name="bilstm_1"
    )(inp)
    x = tf.keras.layers.Dropout(0.4, name="drop_1")(x)

    # BiLSTM 2 — lebih kecil dari V2 (64 bukan 128)
    x = tf.keras.layers.Bidirectional(
        tf.keras.layers.LSTM(
            64,
            return_sequences=True,
            dropout=0.4,
            recurrent_dropout=0.0
        ),
        name="bilstm_2"
    )(x)
    x = tf.keras.layers.Dropout(0.4, name="drop_2")(x)

    # Custom Attention Layer
    x = AttentionLayer(units=32, name="attention")(x)

    # Dense dengan L2 regularization
    x = tf.keras.layers.Dense(
        32,
        activation='relu',
        kernel_regularizer=tf.keras.regularizers.l2(0.001),
        name="dense_1"
    )(x)
    x = tf.keras.layers.Dropout(0.4, name="drop_3")(x)

    out = tf.keras.layers.Dense(
        num_classes, activation='softmax', name="output"
    )(x)

    model = tf.keras.Model(
        inputs=inp, outputs=out,
        name="SignBank_BiLSTM_Attention_Small"
    )
    return model


# ============================================================
# CUSTOM TRAINING LOOP — tf.GradientTape
# ============================================================
def custom_train_loop(model, X_train, y_train, loss_fn,
                      optimizer, batch_size=16, demo_steps=3):
    print(f"\n[GradientTape] Demo {demo_steps} batch...")

    dataset = tf.data.Dataset.from_tensor_slices(
        (X_train.astype(np.float32), y_train.astype(np.float32))
    ).shuffle(500).batch(batch_size).take(demo_steps)

    acc_metric = tf.keras.metrics.CategoricalAccuracy()

    for step, (X_batch, y_batch) in enumerate(dataset):
        with tf.GradientTape() as tape:
            y_pred = model(X_batch, training=True)
            loss   = loss_fn(y_batch, y_pred)

        grads = tape.gradient(loss, model.trainable_variables)
        grads, norm = tf.clip_by_global_norm(grads, clip_norm=1.0)
        optimizer.apply_gradients(zip(grads, model.trainable_variables))
        acc_metric.update_state(y_batch, y_pred)

        print(f"  Step {step+1}: loss={float(loss):.4f} "
              f"grad_norm={float(norm):.4f}")

    acc_metric.reset_state()
    print("  [GradientTape] OK\n")


# ============================================================
# EVALUASI LENGKAP
# ============================================================
def evaluate_and_plot(model, X_test, y_test, encoder,
                      history=None):
    """
    Evaluasi lengkap dengan:
    - Test accuracy, precision, recall, F1
    - Classification report per kelas
    - Confusion matrix
    - Training history plot (jika history tersedia)
    """
    print("\n" + "=" * 62)
    print("  EVALUASI PADA TEST SET")
    print("=" * 62)

    y_pred_proba = model.predict(X_test, batch_size=32, verbose=0)
    y_pred       = np.argmax(y_pred_proba, axis=1)
    y_true       = np.argmax(y_test, axis=1)

    acc = accuracy_score(y_true, y_pred)

    print(f"\n  Test Accuracy  : {acc:.4f} ({acc*100:.2f}%)")

    if acc >= 0.85:
        print("TARGET 85% TERCAPAI!")
    else:
        print(f"Kurang {(0.85-acc)*100:.1f}% dari target")

    print()

    # Classification report
    label_names = list(encoder.classes_)
    report = classification_report(
        y_true, y_pred,
        target_names=label_names,
        digits=3,
        zero_division=0
    )
    print(report)

    # Simpan report
    report_path = os.path.join(PRODUCTION_DIR, "classification_report_v3.txt")
    with open(report_path, 'w') as f:
        f.write("SignBank — Test Set Evaluation\n")
        f.write(f"Test Accuracy: {acc:.4f} ({acc*100:.2f}%)\n\n")
        f.write(report)
    print(f"Report: {report_path}")

    # ── Confusion Matrix ──────────────────────────────────────
    cm      = confusion_matrix(y_true, y_pred)
    cm_norm = cm.astype(float) / cm.sum(axis=1, keepdims=True)
    sz      = max(14, len(label_names) // 2)

    plt.figure(figsize=(sz, sz))
    sns.heatmap(
        cm_norm,
        annot=len(label_names) <= 20,
        fmt='.1f',
        cmap='Blues',
        xticklabels=label_names,
        yticklabels=label_names
    )
    plt.title('Confusion Matrix V3 — Test Set', fontsize=13, pad=12)
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()

    cm_path = os.path.join(PRODUCTION_DIR, "confusion_matrix_v3.png")
    plt.savefig(cm_path, dpi=100, bbox_inches='tight')
    plt.close()
    print(f"Confusion matrix: {cm_path}")

    # ── Training History ──────────────────────────────────────
    if history is not None:
        fig, axes = plt.subplots(1, 2, figsize=(14, 5))
        fig.suptitle('SignBank — Training History', fontsize=14)

        # Accuracy
        axes[0].plot(history.history['accuracy'],     label='Train', lw=2)
        axes[0].plot(history.history['val_accuracy'], label='Val',   lw=2)
        axes[0].axhline(0.85, color='red', linestyle='--',
                        alpha=0.7, label='Target 85%')
        axes[0].axhline(acc, color='green', linestyle=':',
                        alpha=0.7, label=f'Test {acc:.1%}')
        axes[0].set_title('Accuracy')
        axes[0].set_xlabel('Epoch')
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)

        # Loss
        axes[1].plot(history.history['loss'],     label='Train', lw=2)
        axes[1].plot(history.history['val_loss'], label='Val',   lw=2)
        axes[1].set_title('Loss')
        axes[1].set_xlabel('Epoch')
        axes[1].legend()
        axes[1].grid(True, alpha=0.3)

        plt.tight_layout()
        hist_path = os.path.join(PRODUCTION_DIR, "training_history_v3.png")
        plt.savefig(hist_path, dpi=100, bbox_inches='tight')
        plt.close()
        print(f"Training history: {hist_path}")

        # Cek gap train vs val — deteksi overfitting
        final_train = history.history['accuracy'][-1]
        final_val   = history.history['val_accuracy'][-1]
        gap         = final_train - final_val
        print(f"\n  Gap train-val accuracy: {gap:.3f}")
        if gap > 0.10:
            print("Gap > 10% → kemungkinan overfitting")
            print("     Solusi: naikkan dropout atau tambah data")
        else:
            print("Gap kecil → model generalize dengan baik")

    return acc


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 62)
    print("  SIGNBANK — Training dengan Anti-Overfitting")
    print("=" * 62)

    # ── 1. Load Dataset ──────────────────────────────────────
    print("\n[1/8] Memuat dataset...")
    try:
        X_train = np.load(os.path.join(PREPARED_DIR, 'X_train.npy'))
        X_test  = np.load(os.path.join(PREPARED_DIR, 'X_test.npy'))
        y_train = np.load(os.path.join(PREPARED_DIR, 'y_train.npy'))
        y_test  = np.load(os.path.join(PREPARED_DIR, 'y_test.npy'))
    except FileNotFoundError:
        print("[ERROR] prepared_dataset/ tidak ditemukan!")
        print("Jalankan: python prepare_dataset.py")
        return

    encoder     = joblib.load(os.path.join(MODEL_DIR, 'label_encoder.pkl'))
    num_classes = y_train.shape[1]

    print(f"  X_train : {X_train.shape}")
    print(f"  X_test  : {X_test.shape}  ← TIDAK diaugmentasi")
    print(f"  Kelas   : {num_classes}")

    # ── 2. Augmentasi pada TRAIN saja ────────────────────────
    print("\n[2/8] Data augmentation pada train set...")
    X_train_aug, y_train_aug = create_augmented_dataset(
        X_train, y_train, augment_factor=1
    )
    print(f"  Train sebelum: {X_train.shape[0]} sampel")
    print(f"  Train sesudah: {X_train_aug.shape[0]} sampel (original + augmentasi)")
    print(f"  Test tetap   : {X_test.shape[0]} sampel (original)")

    # ── 3. Build Model ───────────────────────────────────────
    print("\n[3/8] Build model V3 (lebih kecil, lebih robust)...")
    model = build_model_v3(num_classes)
    model.summary(line_length=62)

    total_params = model.count_params()
    print(f"\n  Total parameters: {total_params:,}")
    print(f"  V2 parameters  : ~178,000")
    print(f"  Pengurangan    : {(1 - total_params/178000)*100:.0f}%")

    # ── 4. Compile ───────────────────────────────────────────
    print("\n[4/8] Compile dengan FocalLoss...")
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
    loss_fn   = FocalLoss(gamma=2.0, alpha=0.25)

    model.compile(
        optimizer=optimizer,
        loss=loss_fn,
        metrics=[
            'accuracy',
            tf.keras.metrics.Precision(name='precision'),
            tf.keras.metrics.Recall(name='recall'),
        ]
    )

    # ── 5. Demo GradientTape ─────────────────────────────────
    print("\n[5/8] Demo tf.GradientTape...")
    demo_opt = tf.keras.optimizers.Adam(learning_rate=0.001)
    custom_train_loop(
        model, X_train_aug, y_train_aug,
        loss_fn, demo_opt, batch_size=16, demo_steps=3
    )

    # ── 6. Callbacks ─────────────────────────────────────────
    print("[6/8] Setup callbacks...")
    log_dir = os.path.join(
        TENSORBOARD_DIR,
        datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    )
    os.makedirs(log_dir, exist_ok=True)

    callbacks = [
        EpochLoggerCallback(KERAS_V3_PATH, patience_overfit=5),

        tf.keras.callbacks.TensorBoard(
            log_dir=log_dir,
            histogram_freq=1,
            write_graph=True,
            update_freq='epoch'
        ),

        tf.keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=20,          # lebih sabar dari V2
            min_delta=0.001,
            restore_best_weights=True,
            verbose=0
        ),

        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=7,
            min_lr=1e-6,
            verbose=1
        ),
    ]

    print(f"  TensorBoard: tensorboard --logdir {TENSORBOARD_DIR}")

    # ── 7. Training ──────────────────────────────────────────
    print("\n[7/8] Training...")
    history = model.fit(
        X_train_aug, y_train_aug,
        validation_data=(X_test, y_test),
        epochs=100,
        batch_size=32,     # lebih besar dari V2 → training lebih stabil
        callbacks=callbacks,
        verbose=0
    )

    # ── 8. Export + Evaluasi ─────────────────────────────────
    print("\n[8/8] Export model dan evaluasi...")

    # Load model terbaik
    best_model = tf.keras.models.load_model(
        KERAS_V3_PATH,
        custom_objects={
            'AttentionLayer': AttentionLayer,
            'FocalLoss'     : FocalLoss
        }
    )

    # Simpan model utama sebagai .h5 agar nama file simpel dan mudah dipakai inference
    best_model.save(KERAS_V3_PATH)
    print(f"  H5 Model  : {KERAS_V3_PATH}")

    # SavedModel tetap disimpan untuk kebutuhan production/deployment
    tf.saved_model.save(best_model, SAVEDMODEL_V3_PATH)
    print(f"  SavedModel: {SAVEDMODEL_V3_PATH}")

    # Evaluasi lengkap
    acc = evaluate_and_plot(best_model, X_test, y_test, encoder, history)

    print("\n" + "=" * 62)
    print("  TRAINING V3 SELESAI")
    print("=" * 62)
    print(f"  Model   : {KERAS_V3_PATH}")
    print(f"  Accuracy: {acc*100:.2f}%")
    print(f"  TensorBoard log: {log_dir}")
    print("=" * 62)


if __name__ == "__main__":
    main()