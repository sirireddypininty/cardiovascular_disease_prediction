# Improved Model 2 Inference Script

"""Inference for the improved Autoencoder + classifier (Model 2).

- Uses the best encoder (latent dimension) and the best classifier pipeline
  (SVM or Random Forest) saved in `outputs/model2_improvement/`.
- Accepts a path to an ECG image, preprocesses it, extracts latent features
  with the encoder, and returns the predicted class label.
- No retraining is performed; all artifacts are loaded from the previous
  improvement run.
"""

import sys
from pathlib import Path
import numpy as np
import tensorflow as tf
import joblib

# Project root
ROOT = Path(r"c:\\Users\\HP\\OneDrive\\Desktop\\cardio_preprocess")
sys.path.insert(0, str(ROOT))

from app.preprocessing import preprocess_ecg_image, IMG_SIZE

# ---------------------------------------------------------------------------
# Configuration – choose which classifier to use ("svm" or "rf")
# ---------------------------------------------------------------------------
CLASSIFIER = "rf"  # options: "svm", "rf"

# Paths to saved artifacts
OUT_DIR = ROOT / "outputs" / "model2_improvement"
ENCODER_PATH = OUT_DIR / ("model2_improved_encoder_" + ("svm" if CLASSIFIER == "svm" else "rf") + ".keras")
PIPELINE_PATH = OUT_DIR / ("model2_improved_" + CLASSIFIER + "_pipeline.joblib")

# Load encoder and classifier pipeline
print("Loading encoder…")
encoder = tf.keras.models.load_model(str(ENCODER_PATH), compile=False)
print("Loading classifier pipeline…")
clf_pipe = joblib.load(str(PIPELINE_PATH))

# ---------------------------------------------------------------------------
# Helper: predict a single image file
# ---------------------------------------------------------------------------
def predict_image(image_path: str) -> str:
    img = preprocess_ecg_image(Path(image_path), target_size=IMG_SIZE) / 255.0
    img = np.expand_dims(img, axis=0)  # batch dim
    latent = encoder.predict(img, verbose=0)
    pred_idx = clf_pipe.predict(latent)[0]
    class_names = ["Normal Person", "abnormal heartbeat", "Myocardial Infarction"]
    return class_names[pred_idx]

# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python inference_model2_improved.py <path_to_ecg_image>")
        sys.exit(1)
    img_path = sys.argv[1]
    if not Path(img_path).exists():
        print(f"Error: file not found – {img_path}")
        sys.exit(1)
    label = predict_image(img_path)
    print(f"Predicted class: {label}")
