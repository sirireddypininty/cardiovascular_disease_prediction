"""
ecg.py
======
Streamlit & CLI Prediction script for DeepECG 3-class classification.
Uses Model 1 baseline (EfficientNetV2-B0) and shared app.preprocessing module.

THREE APPROVED CLASSES:
  CLASS 0 = Normal Person
  CLASS 1 = abnormal heartbeat
  CLASS 2 = Myocardial Infarction
"""

import sys
from pathlib import Path
import numpy as np
import tensorflow as tf

# Resolve Project Root
APP_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = APP_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.preprocessing import preprocess_for_inference

MODEL_PATH = PROJECT_ROOT / "models" / "model1_cnn_svm_rf" / "best_model.keras"

CLASS_NAMES = [
    "Normal Person",
    "abnormal heartbeat",
    "Myocardial Infarction"
]


def main():
    if not MODEL_PATH.exists():
        print(f"Model file '{MODEL_PATH}' not found. Please train Model 1 first.")
        return

    model = tf.keras.models.load_model(MODEL_PATH)

    # Verify 3-class output
    output_classes = model.output_shape[-1]
    if output_classes != 3:
        print(f"Error: Model has {output_classes} output classes, expected 3.")
        return

    # Search for a sample image in original or cleaned dataset folders
    dataset_dirs = [
        PROJECT_ROOT / "data" / "original_dataset",
        PROJECT_ROOT / "data" / "cleaned_dataset" / "Test",
        PROJECT_ROOT / "data" / "original_dataset" / "Train"
    ]
    
    sample_path = None
    for base_dir in dataset_dirs:
        if not base_dir.exists():
            continue
        for f in base_dir.rglob("*"):
            if f.is_file() and f.suffix.lower() in [".jpg", ".png", ".jpeg", ".bmp"]:
                sample_path = f
                break
        if sample_path:
            break

    if sample_path is None:
        print("No sample image found in dataset folders.")
        return

    print(f"Loaded Model 1 from '{MODEL_PATH}'. Running prediction on sample: {sample_path}")

    is_good, status, msg, batch_tensor = preprocess_for_inference(sample_path)
    if not is_good:
        print(f"Quality Check Failed: {msg}")
        return

    predictions = model.predict(batch_tensor, verbose=0)[0]
    predicted_idx = np.argmax(predictions)

    print(f"\nImage Quality   : {status}")
    print(f"Predicted Class : {CLASS_NAMES[predicted_idx]}")
    print(f"Confidence      : {predictions[predicted_idx] * 100:.2f}%")
    print("\nAll Probabilities:")
    for cname, prob in zip(CLASS_NAMES, predictions):
        print(f"  {cname:25s}: {prob * 100:.2f}%")


if __name__ == "__main__":
    main()