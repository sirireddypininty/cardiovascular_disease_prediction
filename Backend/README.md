# ECG Classification Project — Multi-Model AI & Full-Stack System

A comprehensive research and production codebase for 3-class Electrocardiogram (ECG) report image classification.

---

## 📌 Project Overview

This project implements, evaluates, and serves 3 distinct model architectures for diagnosing ECG report images into three approved clinical classes:
1. **Normal Person**
2. **abnormal heartbeat**
3. **Myocardial Infarction**

---

## 🔬 Three Model Architectures

### 1. MODEL 1: EfficientNetV2-B0 CNN + SVM / Random Forest
* **Architecture**: EfficientNetV2-B0 backbone extracting 1280-d Global Average Pooling (GAP) feature vectors, evaluated with Softmax, RBF-kernel SVM, and Random Forest classifier heads.
* **Location**: `Backend/models/model1_cnn_svm_rf/`
* **Artifacts**: `models/model1_cnn_svm_rf/best_model.keras`, `outputs/model1/ecg_svm_pipeline.joblib`, `outputs/model1/ecg_rf_pipeline.joblib`

### 2. MODEL 2: Convolutional Autoencoder + SVM / Random Forest
* **Architecture**: Convolutional Autoencoder trained to reconstruct ECG images, extracting a 256-d bottleneck latent representation, evaluated with RBF-kernel SVM and Random Forest classifier heads.
* **Location**: `Backend/models/model2_autoencoder/`
* **Artifacts**: `outputs/model2/model2_encoder.keras`, `outputs/model2/model2_autoencoder_svm_pipeline.joblib`, `outputs/model2/model2_autoencoder_rf_pipeline.joblib`

### 3. MODEL 3: Dual Feature Fusion (CNN + Autoencoder) + SVM / Random Forest
* **Architecture**: Feature fusion combining 1280-d CNN GAP features and 256-d Autoencoder latent features into a 1536-dimensional concatenated feature vector, evaluated with RBF-kernel SVM and Random Forest classifier heads.
* **Location**: `Backend/models/model3_cnn_autoencoder/`
* **Artifacts**: `outputs/model3/model3_svm_pipeline.joblib`, `outputs/model3/model3_rf_pipeline.joblib`

---

## 🛠️ Execution & Training Guide

### A. Training Model 1
```bash
# 1. Train EfficientNetV2-B0 CNN
python models/model1_cnn_svm_rf/train.py

# 2. Extract 1280-d CNN Features
python models/model1_cnn_svm_rf/extract_features.py

# 3. Train SVM Classifier
python models/model1_cnn_svm_rf/train_svm.py

# 4. Train Random Forest Classifier
python models/model1_cnn_svm_rf/train_rf.py
```

### B. Training Model 2
```bash
# 1. Train Convolutional Autoencoder
python models/model2_autoencoder/train_autoencoder.py

# 2. Train Model 2 SVM Classifier
python models/model2_autoencoder/train_svm.py

# 3. Train Model 2 Random Forest Classifier
python models/model2_autoencoder/train_rf.py
```

### C. Training Model 3
```bash
# 1. Extract & Fuse Features (1280-d CNN + 256-d AE = 1536-d)
python models/model3_cnn_autoencoder/extract_fused_features.py

# 2. Train Model 3 SVM Classifier
python models/model3_cnn_autoencoder/train_svm.py

# 3. Train Model 3 Random Forest Classifier
python models/model3_cnn_autoencoder/train_rf.py
```

---

## 🚀 Serving & Frontend Connection

### 1. Start Backend API Server
```bash
cd Backend
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* **Base URL**: `http://localhost:8000`
* **Health Check**: `GET /health`
* **Model Status**: `GET /models/status`
* **Prediction API**: `POST /predict` (Form-data: `image`, `model`, `classifier`)

### 2. Start Frontend Web Application
```bash
cd frontend
npm run dev
```
* Access the web UI at `http://localhost:5173` (or port indicated by Vite).

---

## 📊 Data Leakage & Evaluation Assessment

* **Model 1**: Reported 100.00% test accuracy. Confirmed data leakage due to dataset splitting prior to exact hash deduplication.
* **Model 2**: Clean baseline on exact-hash deduplicated dataset. Reported 72.13% (SVM) and 78.69% (RF) test accuracy with zero data leakage. Serves as the clean baseline.
* **Model 3**: Dual feature fusion on exact-hash deduplicated features. Reported 93.44% (SVM) and 91.80% (RF) test accuracy.

---

## 🏷️ Class Mapping Standards

The backend and frontend strictly use the 3 approved clinical class labels:
0. `Normal Person`
1. `abnormal heartbeat`
2. `Myocardial Infarction`
