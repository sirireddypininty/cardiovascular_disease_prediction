"""
inference.py
============
Inference Engine for DeepECG — Model 3 Only (CLEAN RETRAIN).

Model 3: Feature Fusion (EfficientNetV2-B0 CNN + Conv Autoencoder)
         + SVM / Random Forest Classifiers.

Artifact paths (all Model 3-specific, fresh training):
  models/model3/model3_cnn.keras         ← fresh EfficientNetV2-B0 (NO leakage)
  models/model3/model3_encoder.keras     ← fresh AE encoder (NO leakage)
  outputs/model3/model3_svm_pipeline.joblib
  outputs/model3/model3_rf_pipeline.joblib

Classes:
  0 = Normal Person
  1 = abnormal heartbeat
  2 = Myocardial Infarction
"""

import sys
import joblib
import numpy as np
import tensorflow as tf
from pathlib import Path
from sklearn.preprocessing import Normalizer

APP_DIR      = Path(__file__).resolve().parent
PROJECT_ROOT = APP_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.preprocessing import preprocess_for_inference, CLASS_NAMES

# ── Artifact Paths ─────────────────────────────────────────────────────────────
MODEL3_DIR       = PROJECT_ROOT / "models" / "model3"
MODEL3_CNN_PATH  = MODEL3_DIR / "model3_cnn.keras"
MODEL3_ENC_PATH  = MODEL3_DIR / "model3_encoder.keras"
MODEL3_SVM_PATH  = PROJECT_ROOT / "outputs" / "model3" / "model3_svm_pipeline.joblib"
MODEL3_RF_PATH   = PROJECT_ROOT / "outputs" / "model3" / "model3_rf_pipeline.joblib"


class ModelRegistry:
    """Lazy loader — keeps models in memory after first load."""

    def __init__(self):
        self._cnn_extractor = None
        self._ae_encoder    = None
        self._m3_svm        = None
        self._m3_rf         = None

    # ── Feature Extractors ────────────────────────────────────────────────────

    def get_cnn_extractor(self):
        if self._cnn_extractor is None:
            if not MODEL3_CNN_PATH.exists():
                raise FileNotFoundError(
                    f"Model 3 CNN not found at '{MODEL3_CNN_PATH}'. "
                    "Run: python -m models.model3_cnn_autoencoder.train_cnn"
                )
            full_model = tf.keras.models.load_model(MODEL3_CNN_PATH, compile=False)
            gap_layer = full_model.get_layer("avg_pool")
            self._cnn_extractor = tf.keras.models.Model(
                inputs=full_model.input,
                outputs=gap_layer.output,
                name="Model3_CNN_FeatureExtractor"
            )
        return self._cnn_extractor

    def get_ae_encoder(self):
        if self._ae_encoder is None:
            if not MODEL3_ENC_PATH.exists():
                raise FileNotFoundError(
                    f"Model 3 Encoder not found at '{MODEL3_ENC_PATH}'. "
                    "Run: python -m models.model3_cnn_autoencoder.train_autoencoder"
                )
            self._ae_encoder = tf.keras.models.load_model(MODEL3_ENC_PATH, compile=False)
        return self._ae_encoder

    # ── Model 3 Classifiers ───────────────────────────────────────────────────

    def get_model3_svm(self):
        if self._m3_svm is None:
            if not MODEL3_SVM_PATH.exists():
                raise FileNotFoundError(
                    f"Model 3 SVM not found at '{MODEL3_SVM_PATH}'. "
                    "Run: python -m models.model3_cnn_autoencoder.train_svm_model3"
                )
            self._m3_svm = joblib.load(MODEL3_SVM_PATH)
        return self._m3_svm

    def get_model3_rf(self):
        if self._m3_rf is None:
            if not MODEL3_RF_PATH.exists():
                raise FileNotFoundError(
                    f"Model 3 RF not found at '{MODEL3_RF_PATH}'. "
                    "Run: python -m models.model3_cnn_autoencoder.train_rf_model3"
                )
            self._m3_rf = joblib.load(MODEL3_RF_PATH)
        return self._m3_rf

    def check_status(self):
        """Returns artifact availability status for Model 3."""
        def safe_exists(path):
            return path.exists()

        cnn_ok = safe_exists(MODEL3_CNN_PATH)
        enc_ok = safe_exists(MODEL3_ENC_PATH)
        svm_ok = safe_exists(MODEL3_SVM_PATH)
        rf_ok  = safe_exists(MODEL3_RF_PATH)

        return {
            "model3": {
                "cnn":          cnn_ok,
                "autoencoder":  enc_ok,
                "svm":          svm_ok and cnn_ok and enc_ok,
                "random_forest": rf_ok and cnn_ok and enc_ok,
                "artifact_paths": {
                    "cnn":     str(MODEL3_CNN_PATH),
                    "encoder": str(MODEL3_ENC_PATH),
                    "svm":     str(MODEL3_SVM_PATH),
                    "rf":      str(MODEL3_RF_PATH),
                }
            }
        }


# Global registry instance — lives for the server lifetime
registry = ModelRegistry()


def _normalize_fused_vector(F: np.ndarray, cnn_dim: int = 1280) -> np.ndarray:
    """
    Applies the same per-part L2 normalisation used during training.
    CNN part (cnn_dim-d) and AE part are normalised independently.
    """
    cnn_part = F[:, :cnn_dim]
    ae_part  = F[:, cnn_dim:]
    norm_cnn = Normalizer(norm="l2").fit_transform(cnn_part)
    norm_ae  = Normalizer(norm="l2").fit_transform(ae_part)
    return np.hstack([norm_cnn, norm_ae])


def run_prediction(image_path: Path, classifier_name: str = "svm") -> dict:
    """
    Runs Model 3 ECG classification pipeline.

    Args:
        image_path     : Path to the ECG image file.
        classifier_name: 'svm' (default) or 'rf'.

    Returns:
        dict with keys: success, model, classifier, prediction, confidence,
                        probabilities, quality.
    """
    clf_key = classifier_name.lower().strip()
    if clf_key in ["random_forest", "randomforest"]:
        clf_key = "rf"
    if clf_key not in ["svm", "rf"]:
        raise ValueError(
            f"Invalid classifier '{classifier_name}'. Allowed: 'svm', 'rf'."
        )

    # ── Step 1: Preprocess & Quality Check ────────────────────────────────────
    is_good, status, msg, batch_tensor = preprocess_for_inference(image_path)
    if not is_good:
        return {
            "success":       False,
            "model":         "model3",
            "classifier":    clf_key,
            "prediction":    None,
            "confidence":    None,
            "probabilities": None,
            "quality":       {"is_good": False, "status": status, "message": msg}
        }

    # ── Step 2: CNN Feature Extraction ────────────────────────────────────────
    cnn_extractor = registry.get_cnn_extractor()
    cnn_feats = cnn_extractor.predict(batch_tensor, verbose=0)   # (1, cnn_dim)
    cnn_dim = cnn_feats.shape[-1]

    # ── Step 3: Autoencoder Feature Extraction ────────────────────────────────
    ae_encoder = registry.get_ae_encoder()
    # Autoencoder was trained on [0, 1] images
    batch_norm  = batch_tensor / 255.0
    ae_feats    = ae_encoder.predict(batch_norm, verbose=0)      # (1, ae_dim)

    # ── Step 4: Fuse & L2 Normalise ────────────────────────────────────────────
    fused   = np.hstack([cnn_feats, ae_feats])                   # (1, cnn_dim+ae_dim)
    fused_n = _normalize_fused_vector(fused, cnn_dim=cnn_dim)

    # ── Step 5: Classifier Prediction ─────────────────────────────────────────
    clf = registry.get_model3_svm() if clf_key == "svm" else registry.get_model3_rf()
    pred_idx        = int(clf.predict(fused_n)[0])
    predicted_class = CLASS_NAMES[pred_idx]

    confidence    = None
    probabilities = None
    if hasattr(clf, "predict_proba"):
        probs_array   = clf.predict_proba(fused_n)[0]
        confidence    = float(round(float(probs_array[pred_idx]), 4))
        probabilities = {
            cname: float(round(float(probs_array[idx]), 4))
            for idx, cname in enumerate(CLASS_NAMES)
        }

    return {
        "success":         True,
        "model":           "model3",
        "classifier":      clf_key,
        "prediction":      predicted_class,
        "confidence":      confidence,
        "probabilities":   probabilities,
        "quality":         {"is_good": True, "status": status, "message": msg}
    }
