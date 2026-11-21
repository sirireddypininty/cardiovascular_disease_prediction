"""
extract_features.py — Model 3 Feature Extraction & Fusion
===========================================================
Extracts 1280-d CNN features and 256-d Autoencoder latent features, fuses them,
and saves separate NPZ feature matrices for Train, Val, and Test splits.

Artifacts Created:
  Backend/outputs/model3/model3_train_features.npz
  Backend/outputs/model3/model3_val_features.npz
  Backend/outputs/model3/model3_test_features.npz
  Backend/outputs/model3/model3_fused_features.npz
"""

import sys
import numpy as np
import tensorflow as tf
from pathlib import Path
from sklearn.preprocessing import Normalizer

SCRIPT_DIR   = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.preprocessing import preprocess_ecg_image, IMG_SIZE

MODEL3_DIR          = PROJECT_ROOT / "models" / "model3"
CNN_PATH            = MODEL3_DIR / "model3_cnn.keras"
ENCODER_PATH        = MODEL3_DIR / "model3_encoder.keras"

CLEANED_DATASET_DIR = PROJECT_ROOT / "data" / "cleaned_dataset"
OUTPUT_MODEL3_DIR   = PROJECT_ROOT / "outputs" / "model3"
OUTPUT_MODEL3_DIR.mkdir(parents=True, exist_ok=True)

TRAIN_NPZ_PATH = OUTPUT_MODEL3_DIR / "model3_train_features.npz"
VAL_NPZ_PATH   = OUTPUT_MODEL3_DIR / "model3_val_features.npz"
TEST_NPZ_PATH  = OUTPUT_MODEL3_DIR / "model3_test_features.npz"
FUSED_NPZ_PATH = OUTPUT_MODEL3_DIR / "model3_fused_features.npz"

CLASS_NAMES  = ["Normal Person", "abnormal heartbeat", "Myocardial Infarction"]
CLASS_TO_IDX = {name: idx for idx, name in enumerate(CLASS_NAMES)}


def load_split(split_name):
    """Loads images for CNN [0, 255] and AE [0, 1]."""
    split_dir = CLEANED_DATASET_DIR / split_name
    if not split_dir.exists():
        raise FileNotFoundError(f"Split directory not found: {split_dir}")

    cnn_list, ae_list, lbl_list, path_list = [], [], [], []
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
                cnn_list.append(arr)
                ae_list.append(arr / 255.0)
                lbl_list.append(cidx)
                path_list.append(str(fp.resolve()))
            except Exception as e:
                print(f"  [WARN] Skipping {fp.name}: {e}")

    imgs_cnn = np.array(cnn_list, dtype=np.float32)
    imgs_ae  = np.array(ae_list,  dtype=np.float32)
    labels   = np.array(lbl_list, dtype=np.int64)
    print(f"  {split_name}: {len(labels)} images")
    return imgs_cnn, imgs_ae, labels, path_list


def build_cnn_extractor():
    if not CNN_PATH.exists():
        raise FileNotFoundError(f"Model 3 CNN missing at {CNN_PATH}. Run train_cnn.py first.")
    full_model = tf.keras.models.load_model(CNN_PATH, compile=False)
    gap_layer = full_model.get_layer("avg_pool")
    return tf.keras.models.Model(inputs=full_model.input, outputs=gap_layer.output)


def build_ae_encoder():
    if not ENCODER_PATH.exists():
        raise FileNotFoundError(f"Model 3 Encoder missing at {ENCODER_PATH}. Run train_autoencoder.py first.")
    return tf.keras.models.load_model(ENCODER_PATH, compile=False)


def normalize_parts(F, cnn_dim):
    cnn_part = F[:, :cnn_dim]
    ae_part  = F[:, cnn_dim:]
    norm_cnn = Normalizer(norm="l2").fit_transform(cnn_part)
    norm_ae  = Normalizer(norm="l2").fit_transform(ae_part)
    return np.hstack([norm_cnn, norm_ae])


def extract_features(force_reextract=False):
    if (
        not force_reextract
        and TRAIN_NPZ_PATH.exists()
        and VAL_NPZ_PATH.exists()
        and TEST_NPZ_PATH.exists()
    ):
        print("[INFO] Loading cached per-split features...")
        tr = np.load(TRAIN_NPZ_PATH, allow_pickle=True)
        va = np.load(VAL_NPZ_PATH, allow_pickle=True)
        te = np.load(TEST_NPZ_PATH, allow_pickle=True)
        return tr["features"], tr["labels"], va["features"], va["labels"], te["features"], te["labels"]

    print("=" * 65)
    print("  MODEL 3 — FEATURE EXTRACTION & FUSION")
    print("=" * 65)

    X_tr_cnn, X_tr_ae, y_tr, p_tr = load_split("Train")
    X_va_cnn, X_va_ae, y_va, p_va = load_split("Val")
    X_te_cnn, X_te_ae, y_te, p_te = load_split("Test")

    cnn_extractor = build_cnn_extractor()
    ae_encoder    = build_ae_encoder()

    cnn_dim = cnn_extractor.output_shape[-1]
    ae_dim  = ae_encoder.output_shape[-1]

    tr_cnn = cnn_extractor.predict(X_tr_cnn, batch_size=16, verbose=1)
    tr_ae  = ae_encoder.predict(X_tr_ae,  batch_size=16, verbose=1)

    va_cnn = cnn_extractor.predict(X_va_cnn, batch_size=16, verbose=1)
    va_ae  = ae_encoder.predict(X_va_ae,  batch_size=16, verbose=1)

    te_cnn = cnn_extractor.predict(X_te_cnn, batch_size=16, verbose=1)
    te_ae  = ae_encoder.predict(X_te_ae,  batch_size=16, verbose=1)

    F_tr_raw = np.hstack([tr_cnn, tr_ae])
    F_va_raw = np.hstack([va_cnn, va_ae])
    F_te_raw = np.hstack([te_cnn, te_ae])

    F_tr = normalize_parts(F_tr_raw, cnn_dim)
    F_va = normalize_parts(F_va_raw, cnn_dim)
    F_te = normalize_parts(F_te_raw, cnn_dim)

    np.savez_compressed(TRAIN_NPZ_PATH, features=F_tr, labels=y_tr, paths=np.array(p_tr), cnn_dim=cnn_dim, ae_dim=ae_dim)
    np.savez_compressed(VAL_NPZ_PATH,   features=F_va, labels=y_va, paths=np.array(p_va), cnn_dim=cnn_dim, ae_dim=ae_dim)
    np.savez_compressed(TEST_NPZ_PATH,  features=F_te, labels=y_te, paths=np.array(p_te), cnn_dim=cnn_dim, ae_dim=ae_dim)

    np.savez_compressed(
        FUSED_NPZ_PATH,
        F_train=F_tr, y_train=y_tr, paths_train=np.array(p_tr),
        F_val=F_va,   y_val=y_va,   paths_val=np.array(p_va),
        F_test=F_te,  y_test=y_te,  paths_test=np.array(p_te),
        class_names=np.array(CLASS_NAMES),
        cnn_dim=cnn_dim, ae_dim=ae_dim
    )

    print(f"\n[INFO] Saved Train features: {TRAIN_NPZ_PATH}")
    print(f"[INFO] Saved Val features  : {VAL_NPZ_PATH}")
    print(f"[INFO] Saved Test features : {TEST_NPZ_PATH}")

    return F_tr, y_tr, F_va, y_va, F_te, y_te


if __name__ == "__main__":
    extract_features(force_reextract=True)
