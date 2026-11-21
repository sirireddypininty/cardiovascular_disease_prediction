"""
train_svm.py — Model 3 SVM Training
====================================
Trains a StandardScaler + RBF SVM pipeline on fused Model 3 features.
Tunes hyperparameters exclusively on Validation set.

Output Artifacts:
  Backend/outputs/model3/model3_svm_pipeline.joblib
  Backend/outputs/model3/model3_svm_best_params.json
"""

import sys
import json
import joblib
import numpy as np
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

SCRIPT_DIR   = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.model3.extract_features import extract_features

OUTPUT_MODEL3_DIR = PROJECT_ROOT / "outputs" / "model3"
OUTPUT_MODEL3_DIR.mkdir(parents=True, exist_ok=True)

SVM_PIPELINE_PATH = OUTPUT_MODEL3_DIR / "model3_svm_pipeline.joblib"
SVM_PARAMS_PATH   = OUTPUT_MODEL3_DIR / "model3_svm_best_params.json"


def train_svm():
    print("=" * 65)
    print("  MODEL 3 — SVM TRAINING (Val-based Hyperparameter Tuning)")
    print("=" * 65)

    F_tr, y_tr, F_va, y_va, F_te, y_te = extract_features(force_reextract=False)

    C_vals     = [0.1, 0.5, 1.0, 5.0, 10.0, 20.0, 50.0, 100.0]
    gamma_vals = ["scale", "auto", 0.0001, 0.001, 0.01, 0.1]

    best_val_acc = -1.0
    best_params  = None

    for C in C_vals:
        for gamma in gamma_vals:
            pipe = Pipeline([
                ("scaler", StandardScaler()),
                ("svm", SVC(C=C, gamma=gamma, kernel="rbf", class_weight="balanced", probability=True, random_state=42))
            ])
            pipe.fit(F_tr, y_tr)
            val_acc = accuracy_score(y_va, pipe.predict(F_va))

            if val_acc > best_val_acc:
                best_val_acc = val_acc
                best_params  = {"C": C, "gamma": gamma}

            print(f"    C={C:6} gamma={str(gamma):8} | Val Acc: {val_acc * 100:.2f}%")

    print(f"\n  ► Best Params: {best_params} | Val Acc: {best_val_acc * 100:.2f}%")

    final_svm = Pipeline([
        ("scaler", StandardScaler()),
        ("svm", SVC(C=best_params["C"], gamma=best_params["gamma"], kernel="rbf", class_weight="balanced", probability=True, random_state=42))
    ])
    final_svm.fit(F_tr, y_tr)

    joblib.dump(final_svm, SVM_PIPELINE_PATH)
    params_to_save = {
        "C": best_params["C"],
        "gamma": str(best_params["gamma"]),
        "val_accuracy": round(best_val_acc, 6),
        "note": "Hyperparameters tuned exclusively on validation set."
    }
    with open(SVM_PARAMS_PATH, "w") as f:
        json.dump(params_to_save, f, indent=2)

    print(f"\n[INFO] SVM pipeline saved to: {SVM_PIPELINE_PATH}")


if __name__ == "__main__":
    train_svm()
