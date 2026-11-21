"""
train_cnn.py — Fresh Model 3 EfficientNetV2-B0 Training
========================================================
Trains a FRESH EfficientNetV2-B0 CNN feature extractor using ONLY the cleaned
training split (data/cleaned_dataset/Train).

Output Artifact:
  Backend/models/model3/model3_cnn.keras
"""

import sys
import random
import numpy as np
import tensorflow as tf
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path

# Path setup
SCRIPT_DIR   = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.preprocessing import preprocess_ecg_image, IMG_SIZE

# Random Seeds
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)

CLEANED_DATASET_DIR = PROJECT_ROOT / "data" / "cleaned_dataset"
MODEL3_DIR          = PROJECT_ROOT / "models" / "model3"
MODEL3_DIR.mkdir(parents=True, exist_ok=True)

CNN_SAVE_PATH  = MODEL3_DIR / "model3_cnn.keras"
LOSS_PLOT_PATH = MODEL3_DIR / "model3_cnn_training_loss.png"

CLASS_NAMES  = ["Normal Person", "abnormal heartbeat", "Myocardial Infarction"]
CLASS_TO_IDX = {name: idx for idx, name in enumerate(CLASS_NAMES)}
IMG_SHAPE    = (224, 224, 3)


def load_split(split_name):
    """Loads image arrays [0, 255] and integer labels for a split."""
    split_dir = CLEANED_DATASET_DIR / split_name
    if not split_dir.exists():
        raise FileNotFoundError(f"Split directory not found: {split_dir}")

    imgs, lbls = [], []
    for cname in sorted(CLASS_NAMES):
        cdir = split_dir / cname
        if not cdir.exists():
            continue
        cidx = CLASS_TO_IDX[cname]
        files = sorted(
            list(cdir.glob("*.jpg")) + list(cdir.glob("*.jpeg")) +
            list(cdir.glob("*.png")) + list(cdir.glob("*.bmp"))
        )
        for fp in files:
            try:
                arr = preprocess_ecg_image(fp, target_size=IMG_SIZE)
                imgs.append(arr)
                lbls.append(cidx)
            except Exception as e:
                print(f"  [WARN] Skipping {fp.name}: {e}")

    images = np.array(imgs, dtype=np.float32)
    labels = np.array(lbls, dtype=np.int64)
    print(f"  {split_name}: {len(labels)} images | class counts: {np.bincount(labels)}")
    return images, labels


def build_efficientnet_model(num_classes=3):
    """Builds EfficientNetV2-B0 with GlobalAveragePooling2D head."""
    inputs = tf.keras.Input(shape=IMG_SHAPE, name="ecg_input")

    backbone = tf.keras.applications.EfficientNetV2B0(
        include_top=False,
        weights="imagenet",
        input_tensor=inputs,
        pooling=None,
    )
    backbone.trainable = False

    x = backbone.output
    x = tf.keras.layers.GlobalAveragePooling2D(name="avg_pool")(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="Model3_EfficientNetV2B0")
    return model, backbone


def main():
    print("=" * 65)
    print("  MODEL 3 — FRESH EfficientNetV2-B0 CNN TRAINING")
    print("=" * 65)

    print("\n[STEP 1] Loading cleaned dataset splits...")
    X_tr, y_tr = load_split("Train")
    X_va, y_va = load_split("Val")
    X_te, y_te = load_split("Test")

    print("\n[STEP 2] Building EfficientNetV2-B0 model...")
    model, backbone = build_efficientnet_model(num_classes=len(CLASS_NAMES))

    print("\n[STEP 3] Phase 1 — Head Training (Backbone Frozen)...")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    cb_p1 = [
        tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=8, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=4),
        tf.keras.callbacks.ModelCheckpoint(filepath=str(CNN_SAVE_PATH), monitor="val_accuracy", save_best_only=True)
    ]

    hist_p1 = model.fit(X_tr, y_tr, validation_data=(X_va, y_va), epochs=25, batch_size=16, callbacks=cb_p1, verbose=1)

    print("\n[STEP 4] Phase 2 — Fine-tuning Top Layers...")
    backbone.trainable = True
    for layer in backbone.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-5),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    cb_p2 = [
        tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=10, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=5),
        tf.keras.callbacks.ModelCheckpoint(filepath=str(CNN_SAVE_PATH), monitor="val_accuracy", save_best_only=True)
    ]

    hist_p2 = model.fit(X_tr, y_tr, validation_data=(X_va, y_va), epochs=40, batch_size=16, callbacks=cb_p2, verbose=1)

    all_acc = hist_p1.history["accuracy"] + hist_p2.history["accuracy"]
    all_val = hist_p1.history["val_accuracy"] + hist_p2.history["val_accuracy"]
    plt.figure(figsize=(9, 4))
    plt.plot(all_acc, label="Train Accuracy")
    plt.plot(all_val, label="Val Accuracy", linestyle="--")
    plt.title("Model 3 CNN Training Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(LOSS_PLOT_PATH, dpi=150)
    plt.close()

    print(f"\n[INFO] Saved Model 3 CNN to: {CNN_SAVE_PATH}")


if __name__ == "__main__":
    main()
