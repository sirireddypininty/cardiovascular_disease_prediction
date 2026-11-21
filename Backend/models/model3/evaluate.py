"""
evaluate.py — Model 3 Final Evaluation on Untouched Test Set
=============================================================
Evaluates SVM and Random Forest pipelines ONCE on the untouched test set.

Output Artifacts:
  Backend/outputs/model3/model3_svm_classification_report.txt
  Backend/outputs/model3/model3_rf_classification_report.txt
  Backend/outputs/model3/model3_svm_confusion_matrix.png
  Backend/outputs/model3/model3_rf_confusion_matrix.png
  Backend/outputs/model3/model3_final_results.txt
  Backend/outputs/model3/model3_predictions.csv
"""

import sys
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from datetime import datetime
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support
)

SCRIPT_DIR   = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.model3.extract_features import extract_features

OUTPUT_MODEL3_DIR = PROJECT_ROOT / "outputs" / "model3"
OUTPUT_MODEL3_DIR.mkdir(parents=True, exist_ok=True)

SVM_PIPELINE_PATH  = OUTPUT_MODEL3_DIR / "model3_svm_pipeline.joblib"
RF_PIPELINE_PATH   = OUTPUT_MODEL3_DIR / "model3_rf_pipeline.joblib"
SVM_PARAMS_PATH    = OUTPUT_MODEL3_DIR / "model3_svm_best_params.json"
RF_PARAMS_PATH     = OUTPUT_MODEL3_DIR / "model3_rf_best_params.json"

SVM_REPORT_PATH    = OUTPUT_MODEL3_DIR / "model3_svm_classification_report.txt"
RF_REPORT_PATH     = OUTPUT_MODEL3_DIR / "model3_rf_classification_report.txt"
SVM_CM_PATH        = OUTPUT_MODEL3_DIR / "model3_svm_confusion_matrix.png"
RF_CM_PATH         = OUTPUT_MODEL3_DIR / "model3_rf_confusion_matrix.png"
FINAL_RESULTS_PATH = OUTPUT_MODEL3_DIR / "model3_final_results.txt"
PREDICTIONS_CSV    = OUTPUT_MODEL3_DIR / "model3_predictions.csv"

CLASS_NAMES = ["Normal Person", "abnormal heartbeat", "Myocardial Infarction"]


def plot_cm(cm, title, output_path, cmap="Blues"):
    plt.figure(figsize=(7, 5))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap=cmap,
        xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES,
        linewidths=0.5, linecolor="white"
    )
    plt.title(title, fontsize=13, pad=12)
    plt.ylabel("True Label", fontsize=11)
    plt.xlabel("Predicted Label", fontsize=11)
    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close()


def format_report(clf_name, preds, y_te, params_path=None):
    acc = accuracy_score(y_te, preds)
    pr, rc, f1, _   = precision_recall_fscore_support(y_te, preds, average="macro", zero_division=0)
    pr_w, rc_w, f1_w, _ = precision_recall_fscore_support(y_te, preds, average="weighted", zero_division=0)
    cr = classification_report(y_te, preds, target_names=CLASS_NAMES, zero_division=0)

    params_str = ""
    if params_path and params_path.exists():
        with open(params_path) as fp:
            p = json.load(fp)
        params_str = "\n".join(f"  {k}: {v}" for k, v in p.items())

    lines = [
        f"Model 3 (CNN + Autoencoder + {clf_name}) — Final Test Evaluation",
        "=" * 70,
        f"Evaluated : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"Dataset   : data/cleaned_dataset/ (deduped splits)",
        "",
        "Best Parameters (Validation Selected):",
        params_str or "  (see pipeline joblib)",
        "",
        f"Test Samples    : {len(y_te)}",
        f"Test Accuracy   : {acc * 100:.2f}%",
        f"Macro Precision : {pr  * 100:.2f}%",
        f"Macro Recall    : {rc  * 100:.2f}%",
        f"Macro F1-Score  : {f1  * 100:.2f}%",
        f"Weighted F1     : {f1_w* 100:.2f}%",
        "",
        "Per-Class Breakdown:",
        "-" * 70,
        cr
    ]
    return "\n".join(lines), acc, pr, rc, f1, f1_w


def main():
    print("=" * 65)
    print("  MODEL 3 — FINAL TEST EVALUATION")
    print("=" * 65)

    F_tr, y_tr, F_va, y_va, F_te, y_te = extract_features(force_reextract=False)

    svm = joblib.load(SVM_PIPELINE_PATH)
    rf  = joblib.load(RF_PIPELINE_PATH)

    svm_preds = svm.predict(F_te)
    rf_preds  = rf.predict(F_te)

    svm_probs = svm.predict_proba(F_te) if hasattr(svm, "predict_proba") else None
    rf_probs  = rf.predict_proba(F_te)  if hasattr(rf,  "predict_proba") else None

    svm_rep, svm_acc, svm_pr, svm_rc, svm_f1, svm_f1w = format_report("SVM", svm_preds, y_te, SVM_PARAMS_PATH)
    rf_rep,  rf_acc,  rf_pr,  rf_rc,  rf_f1,  rf_f1w  = format_report("Random Forest", rf_preds, y_te, RF_PARAMS_PATH)

    with open(SVM_REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(svm_rep)
    with open(RF_REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(rf_rep)

    plot_cm(confusion_matrix(y_te, svm_preds), "Model 3 — SVM Confusion Matrix (Clean Retrain)", SVM_CM_PATH, cmap="Blues")
    plot_cm(confusion_matrix(y_te, rf_preds),  "Model 3 — RF Confusion Matrix (Clean Retrain)", RF_CM_PATH, cmap="Greens")

    summary = "\n".join([
        "MODEL 3 FINAL EVALUATION SUMMARY (CLEAN RETRAIN)",
        "=" * 70,
        f"Evaluated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "Model 3 + SVM:",
        f"  Test Accuracy   : {svm_acc * 100:.2f}%",
        f"  Macro F1-Score  : {svm_f1  * 100:.2f}%",
        f"  Weighted F1     : {svm_f1w * 100:.2f}%",
        "",
        "Model 3 + Random Forest:",
        f"  Test Accuracy   : {rf_acc  * 100:.2f}%",
        f"  Macro F1-Score  : {rf_f1   * 100:.2f}%",
        f"  Weighted F1     : {rf_f1w  * 100:.2f}%",
    ])
    with open(FINAL_RESULTS_PATH, "w", encoding="utf-8") as f:
        f.write(summary)

    rows = []
    te_npz = OUTPUT_MODEL3_DIR / "model3_test_features.npz"
    paths_data = np.load(te_npz, allow_pickle=True)["paths"] if te_npz.exists() else None

    for i in range(len(y_te)):
        r = {
            "index": i,
            "true_label": CLASS_NAMES[int(y_te[i])],
            "svm_pred": CLASS_NAMES[int(svm_preds[i])],
            "svm_correct": int(svm_preds[i]) == int(y_te[i]),
            "rf_pred": CLASS_NAMES[int(rf_preds[i])],
            "rf_correct": int(rf_preds[i]) == int(y_te[i]),
        }
        if svm_probs is not None:
            for ci, cn in enumerate(CLASS_NAMES):
                r[f"svm_prob_{cn.replace(' ', '_')}"] = round(float(svm_probs[i, ci]), 4)
        if rf_probs is not None:
            for ci, cn in enumerate(CLASS_NAMES):
                r[f"rf_prob_{cn.replace(' ', '_')}"] = round(float(rf_probs[i, ci]), 4)
        if paths_data is not None and i < len(paths_data):
            r["image_path"] = str(paths_data[i])
        rows.append(r)

    pd.DataFrame(rows).to_csv(PREDICTIONS_CSV, index=False)

    print("\n" + "=" * 65)
    print("  FINAL EVALUATION COMPLETE")
    print(f"  Model 3 + SVM Accuracy : {svm_acc * 100:.2f}%")
    print(f"  Model 3 + RF Accuracy  : {rf_acc * 100:.2f}%")
    print("=" * 65)


if __name__ == "__main__":
    main()
