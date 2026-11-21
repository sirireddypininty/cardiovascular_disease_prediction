"""
train_rf.py — Model 3 Random Forest Training
=============================================
Trains a Random Forest classifier on fused Model 3 features.
Tunes hyperparameters exclusively on Validation set.

Output Artifacts:
  Backend/outputs/model3/model3_rf_pipeline.joblib
  Backend/outputs/model3/model3_rf_best_params.json
"""

import sys
import json
import joblib
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

SCRIPT_DIR   = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.model3.extract_features import extract_features

OUTPUT_MODEL3_DIR = PROJECT_ROOT / "outputs" / "model3"
OUTPUT_MODEL3_DIR.mkdir(parents=True, exist_ok=True)

RF_PIPELINE_PATH = OUTPUT_MODEL3_DIR / "model3_rf_pipeline.joblib"
RF_PARAMS_PATH   = OUTPUT_MODEL3_DIR / "model3_rf_best_params.json"


def train_rf():
    print("=" * 65)
    print("  MODEL 3 — RANDOM FOREST TRAINING (Val-based Tuning)")
    print("=" * 65)

    F_tr, y_tr, F_va, y_va, F_te, y_te = extract_features(force_reextract=False)

    n_est_vals = [100, 200, 300, 500]
    depth_vals = [None, 8, 15, 25]
    cw_vals    = ["balanced", "balanced_subsample"]

    best_val_acc = -1.0
    best_params  = None

    for n_est in n_est_vals:
        for depth in depth_vals:
            for cw in cw_vals:
                rf = RandomForestClassifier(
                    n_estimators=n_est, max_depth=depth, class_weight=cw, random_state=42, n_jobs=-1
                )
                rf.fit(F_tr, y_tr)
                val_acc = accuracy_score(y_va, rf.predict(F_va))

                if val_acc > best_val_acc:
                    best_val_acc = val_acc
                    best_params  = {"n_estimators": n_est, "max_depth": depth, "class_weight": cw}

    print(f"\n  ► Best Params: {best_params} | Val Acc: {best_val_acc * 100:.2f}%")

    final_rf = RandomForestClassifier(
        n_estimators=best_params["n_estimators"],
        max_depth=best_params["max_depth"],
        class_weight=best_params["class_weight"],
        random_state=42,
        n_jobs=-1
    )
    final_rf.fit(F_tr, y_tr)

    joblib.dump(final_rf, RF_PIPELINE_PATH)
    params_to_save = {
        "n_estimators": best_params["n_estimators"],
        "max_depth": str(best_params["max_depth"]),
        "class_weight": best_params["class_weight"],
        "val_accuracy": round(best_val_acc, 6),
        "note": "Hyperparameters tuned exclusively on validation set."
    }
    with open(RF_PARAMS_PATH, "w") as f:
        json.dump(params_to_save, f, indent=2)

    print(f"\n[INFO] RF pipeline saved to: {RF_PIPELINE_PATH}")


if __name__ == "__main__":
    train_rf()
