# Cardiovascular Disease Prediction – ECG Classification

## Project Overview

This project implements a multi-model AI system for classifying ECG (Electrocardiogram) report images into three categories. It combines deep learning feature extraction and machine learning classifiers with a full-stack web application for image-based prediction.

The project evaluates three different model architectures and provides a web interface for uploading ECG images and obtaining classification results.

### Classification Categories
1. Normal Person
2. Abnormal Heartbeat
3. Myocardial Infarction

## Three Model Architectures

### Model 1: EfficientNetV2-B0 CNN + SVM / Random Forest
- Uses EfficientNetV2-B0 as a CNN feature extractor.
- Extracts 1280-dimensional Global Average Pooling (GAP) feature vectors.
- Evaluates classification using SVM and Random Forest classifiers.
- Includes Softmax, RBF-kernel SVM, and Random Forest classification approaches.

### Model 2: Convolutional Autoencoder + SVM / Random Forest
- Uses a Convolutional Autoencoder to learn image representations.
- Extracts a 256-dimensional latent feature representation.
- Uses SVM and Random Forest classifiers for classification.
- Serves as a clean baseline using an exact-hash deduplicated dataset.

### Model 3: Dual Feature Fusion (CNN + Autoencoder) + SVM / Random Forest
- Combines CNN and Autoencoder feature representations.
- Extracts 1280-dimensional CNN features and 256-dimensional Autoencoder latent features.
- Combines both representations into a 1536-dimensional feature vector.
- Evaluates the fused features using RBF-kernel SVM and Random Forest classifiers.

## Project Structure

text
cardiovascular_disease_prediction/
│
├── Backend/
│   ├── app/
│   ├── models/
│   │   └── model3/
│   ├── outputs/
│   ├── utilities/
│   ├── README.md
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── scaffold.cjs
│   └── vite.config.js
│
└── README.md


## Technologies Used

### Backend
- Python
- FastAPI
- TensorFlow
- NumPy
- Pandas
- Scikit-learn
- Pillow
- Matplotlib
- Seaborn

### Frontend
- React
- TypeScript
- Vite

## Execution and Training Guide

### Model 3 Training

#### 1. Extract and Fuse Features
bash
python models/model3_cnn_autoencoder/extract_fused_features.py


#### 2. Train SVM Classifier
bash
python models/model3_cnn_autoencoder/train_svm.py


#### 3. Train Random Forest Classifier
bash
python models/model3_cnn_autoencoder/train_rf.py


## Running the Application

### 1. Start the Backend API Server

Navigate to the Backend directory:

bash
cd Backend


Start the API server:

bash
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload


Backend Base URL:

text
http://localhost:8000


### API Endpoints

- Health Check: GET /health
- Model Status: GET /models/status
- Prediction API: POST /predict

The prediction endpoint accepts an ECG image along with model and classifier selections.

### 2. Start the Frontend Web Application

Navigate to the frontend directory:

bash
cd frontend


Install dependencies:

bash
npm install


Start the frontend application:

bash
npm run dev


Access the application at:

text
http://localhost:5173


## Data Leakage and Evaluation Assessment

- *Model 1:* Reported 100.00% test accuracy. Data leakage was identified due to dataset splitting before exact-hash deduplication.
- *Model 2:* Clean baseline on an exact-hash deduplicated dataset. Reported 72.13% (SVM) and 78.69% (Random Forest) test accuracy with zero data leakage.
- *Model 3:* Dual feature fusion on exact-hash deduplicated features. Reported 93.44% (SVM) and 91.80% (Random Forest) test accuracy.

## Class Mapping Standards

The system uses the following three class labels:

- 0 – Normal Person
- 1 – Abnormal Heartbeat
- 2 – Myocardial Infarction
