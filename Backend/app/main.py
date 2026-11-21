"""
main.py
=======
FastAPI Web Application Server for DeepECG — Model 3 Classification.
Provides RESTful API endpoints for ECG image prediction using the
Model 3 (CNN + Autoencoder Feature Fusion) pipeline.
"""

import sys
import tempfile
import os
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

APP_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = APP_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.inference import run_prediction, registry

app = FastAPI(
    title="DeepECG Model 3 Classification API",
    description=(
        "Backend API for ECG image classification using Model 3 — "
        "Feature Fusion (1536-d: EfficientNetV2 CNN + Autoencoder) + SVM / Random Forest."
    ),
    version="2.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", summary="Health Check")
def health_check():
    """Returns server health status."""
    return {"status": "ok", "model": "model3"}


@app.get("/models/status", summary="Model 3 Artifact Availability")
def get_model_status():
    """Returns availability status for Model 3 SVM and RF classifiers."""
    return registry.check_status()


@app.post("/predict", summary="ECG Image Classification — Model 3")
async def predict_ecg(
    image: UploadFile = File(...),
    classifier: str = Form("svm")
):
    """
    Accepts an ECG report image and returns the predicted class using Model 3.

    Form fields:
    - **image**: Image file (PNG, JPG, JPEG, BMP)
    - **classifier**: 'svm' (default) or 'rf'

    Returns predicted class, confidence score, and per-class probabilities.
    """
    if not image.filename:
        raise HTTPException(status_code=400, detail="No file selected.")

    ext = Path(image.filename).suffix.lower()
    if ext not in [".jpg", ".jpeg", ".png", ".bmp"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: .jpg, .jpeg, .png, .bmp"
        )

    # Validate classifier choice early
    clf_key = classifier.lower().strip()
    if clf_key not in ["svm", "rf", "random_forest", "randomforest"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid classifier '{classifier}'. Allowed: 'svm', 'rf'."
        )

    temp_file_path = None
    try:
        suffix = ext if ext else ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await image.read()
            if not content:
                raise HTTPException(status_code=400, detail="Uploaded file is empty.")
            tmp.write(content)
            temp_file_path = Path(tmp.name)

        # Run Model 3 inference pipeline
        result = run_prediction(temp_file_path, classifier_name=clf_key)

        if not result["success"]:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "model": "model3",
                    "classifier": clf_key,
                    "error": result["quality"]["message"],
                    "quality": result["quality"]
                }
            )

        return result

    except FileNotFoundError as fnf_err:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "model": "model3",
                "classifier": clf_key,
                "error": f"Model artifact missing: {str(fnf_err)}"
            }
        )
    except ValueError as val_err:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "model": "model3",
                "classifier": clf_key,
                "error": str(val_err)
            }
        )
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "model": "model3",
                "classifier": clf_key,
                "error": f"Internal prediction error: {str(exc)}"
            }
        )
    finally:
        if temp_file_path and temp_file_path.exists():
            try:
                os.remove(temp_file_path)
            except Exception:
                pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
