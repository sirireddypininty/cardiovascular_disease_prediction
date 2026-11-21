"""
train_autoencoder.py — Fresh Model 3 Convolutional Autoencoder Training
========================================================================
Trains a FRESH Convolutional Autoencoder exclusively for Model 3.
Fitted ONLY on cleaned training images (data/cleaned_dataset/Train).

Output Artifacts:
  Backend/models/model3/model3_autoencoder.keras
  Backend/models/model3/model3_encoder.keras
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

AE_SAVE_PATH  = MODEL3_DIR / "model3_autoencoder.keras"
ENC_SAVE_PATH = MODEL3_DIR / "model3_encoder.keras"
LOSS_PLOT_PATH= MODEL3_DIR / "model3_ae_training_loss.png"

CLASS_NAMES  = ["Normal Person", "abnormal heartbeat", "Myocardial Infarction"]
CLASS_TO_IDX = {name: idx for idx, name in enumerate(CLASS_NAMES)}
LATENT_DIM   = 256
IMG_SHAPE    = (224, 224, 3)


def load_split(split_name):
    """Loads images normalised [0, 1] for autoencoder training."""
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
                imgs.append(arr / 255.0)
                lbls.append(cidx)
            except Exception as e:
                print(f"  [WARN] Skipping {fp.name}: {e}")

    images = np.array(imgs, dtype=np.float32)
    labels = np.array(lbls, dtype=np.int64)
    print(f"  {split_name}: {len(labels)} images")
    return images, labels


def build_conv_autoencoder(input_shape=IMG_SHAPE, latent_dim=LATENT_DIM):
    """Convolutional Autoencoder with 256-d latent representation."""
    inputs = tf.keras.layers.Input(shape=input_shape, name="ecg_input")

    x = tf.keras.layers.Conv2D(32, (3, 3), activation="relu", padding="same")(inputs)
    x = tf.keras.layers.MaxPooling2D((2, 2), padding="same")(x)

    x = tf.keras.layers.Conv2D(64, (3, 3), activation="relu", padding="same")(x)
    x = tf.keras.layers.MaxPooling2D((2, 2), padding="same")(x)

    x = tf.keras.layers.Conv2D(128, (3, 3), activation="relu", padding="same")(x)
    x = tf.keras.layers.MaxPooling2D((2, 2), padding="same")(x)

    x = tf.keras.layers.Conv2D(256, (3, 3), activation="relu", padding="same")(x)
    x = tf.keras.layers.MaxPooling2D((2, 2), padding="same")(x)

    x = tf.keras.layers.Flatten()(x)
    latent = tf.keras.layers.Dense(latent_dim, activation="relu", name="latent_features")(x)

    encoder = tf.keras.models.Model(inputs=inputs, outputs=latent, name="Model3_Encoder")

    dec_in = tf.keras.layers.Input(shape=(latent_dim,), name="latent_input")
    d = tf.keras.layers.Dense(14 * 14 * 256, activation="relu")(dec_in)
    d = tf.keras.layers.Reshape((14, 14, 256))(d)

    d = tf.keras.layers.Conv2DTranspose(128, (3, 3), strides=2, activation="relu", padding="same")(d)
    d = tf.keras.layers.Conv2DTranspose(64, (3, 3), strides=2, activation="relu", padding="same")(d)
    d = tf.keras.layers.Conv2DTranspose(32, (3, 3), strides=2, activation="relu", padding="same")(d)
    reconstructed = tf.keras.layers.Conv2DTranspose(3, (3, 3), strides=2, activation="sigmoid", padding="same")(d)

    decoder = tf.keras.models.Model(inputs=dec_in, outputs=reconstructed, name="Model3_Decoder")
    autoencoder = tf.keras.models.Model(inputs=inputs, outputs=decoder(encoder(inputs)), name="Model3_Autoencoder")

    return autoencoder, encoder, decoder


def main():
    print("=" * 65)
    print("  MODEL 3 — FRESH CONVOLUTIONAL AUTOENCODER TRAINING")
    print("=" * 65)

    print("\n[STEP 1] Loading cleaned dataset splits...")
    X_tr, y_tr = load_split("Train")
    X_va, y_va = load_split("Val")
    X_te, y_te = load_split("Test")

    print("\n[STEP 2] Building Convolutional Autoencoder...")
    autoencoder, encoder, decoder = build_conv_autoencoder(input_shape=IMG_SHAPE, latent_dim=LATENT_DIM)
    autoencoder.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss="mean_squared_error")

    print("\n[STEP 3] Training Autoencoder on Training images ONLY...")
    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=5),
        tf.keras.callbacks.ModelCheckpoint(filepath=str(AE_SAVE_PATH), monitor="val_loss", save_best_only=True)
    ]

    history = autoencoder.fit(X_tr, X_tr, validation_data=(X_va, X_va), epochs=60, batch_size=16, callbacks=callbacks, verbose=1)

    print("\n[STEP 4] Saving Encoder...")
    encoder.save(str(ENC_SAVE_PATH))

    plt.figure(figsize=(9, 4))
    plt.plot(history.history["loss"], label="Train Loss (MSE)")
    plt.plot(history.history["val_loss"], label="Val Loss (MSE)", linestyle="--")
    plt.title("Model 3 Autoencoder Reconstruction Loss")
    plt.xlabel("Epoch")
    plt.ylabel("MSE")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(LOSS_PLOT_PATH, dpi=150)
    plt.close()

    print(f"\n[INFO] Autoencoder saved: {AE_SAVE_PATH}")
    print(f"[INFO] Encoder saved:     {ENC_SAVE_PATH}")


if __name__ == "__main__":
    main()
