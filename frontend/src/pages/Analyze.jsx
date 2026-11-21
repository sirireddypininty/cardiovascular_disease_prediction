import { useState, useRef, useCallback } from 'react';
import {
  UploadCloud, CheckCircle, AlertTriangle, Loader2,
  FileText, BrainCircuit, RefreshCw, FileImage, Sliders, ArrowRight, ShieldAlert, CheckCircle2, Cpu, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PreprocessingInspector from '../components/PreprocessingInspector.jsx';
import { saveAnalysisRecord } from '../utils/historyStore.js';
import { generatePdfReport } from '../utils/pdfGenerator.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const STEPS = ['Upload ECG', 'Model & Quality', 'AI Analysis', 'Results'];

const CLASS_COLOR_MAP = {
  'Normal Person': '#059669',
  'abnormal heartbeat': '#047857',
  'Myocardial Infarction': '#DC2626'
};

const CLASS_CODE_MAP = {
  'Normal Person': 'NP',
  'abnormal heartbeat': 'AH',
  'Myocardial Infarction': 'MI'
};

export default function Analyze() {
  const [step, setStep]                       = useState('upload');
  const [selectedFile, setSelectedFile]       = useState(null);
  const [previewUrl, setPreviewUrl]           = useState(null);
  const [isDragging, setIsDragging]           = useState(false);
  const [showInspector, setShowInspector]     = useState(true);

  // Model & Classifier Selection State
  const [selectedModel, setSelectedModel]     = useState('model3');
  const [selectedClassifier, setSelectedClassifier] = useState('svm');
  
  // Quality Check & Error State
  const [qualityPassed, setQualityPassed]     = useState(true);
  const [qualityIssues, setQualityIssues]     = useState([]);
  const [errorMessage, setErrorMessage]       = useState('');
  const [qualityStatusText, setQualityStatusText] = useState('GOOD QUALITY');

  // Analysis Result State
  const [currentRecord, setCurrentRecord]     = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    // Reset quality & error states
    setStep('upload');
    setQualityPassed(true);
    setQualityIssues([]);
    setErrorMessage('');
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFileSelected(file);
  }, []);

  const runBackendInference = async () => {
    if (!selectedFile) return;

    setStep('analyze');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('model', selectedModel);
      formData.append('classifier', selectedClassifier);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setQualityPassed(false);
        const errDetail = data.error || data.detail || 'Prediction failed on backend.';
        setQualityIssues([errDetail]);
        setErrorMessage(errDetail);
        setStep('quality_result');
        return;
      }

      // Format probabilities
      const rawProbs = data.probabilities || {};
      const probsArray = Object.keys(rawProbs).map((cname) => {
        const val = rawProbs[cname];
        const pct = typeof val === 'number' ? (val <= 1 ? val * 100 : val) : 0;
        return {
          code: CLASS_CODE_MAP[cname] || 'ECG',
          name: cname,
          probability: pct,
          color: CLASS_COLOR_MAP[cname] || '#2563EB',
        };
      });

      const predName = data.prediction;
      const predCode = CLASS_CODE_MAP[predName] || 'ECG';
      const confValue = data.confidence !== null && data.confidence !== undefined
        ? (data.confidence <= 1 ? data.confidence * 100 : data.confidence)
        : null;

      const record = {
        id: `ECG-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleString(),
        fileName: selectedFile?.name || 'ecg_scan.png',
        fileSize: selectedFile?.size || 0,
        previewUrl: previewUrl || undefined,
        modelUsed: data.model || selectedModel,
        classifierUsed: data.classifier || selectedClassifier,
        qualityPassed: true,
        qualityMessage: data.quality?.message || 'ECG Image Quality Passed.',
        qualityStatus: data.quality?.status || 'GOOD QUALITY',
        predictionCode: predCode,
        predictionName: predName,
        confidence: confValue,
        probabilities: probsArray,
      };

      saveAnalysisRecord(record);
      setCurrentRecord(record);
      setQualityPassed(true);
      setQualityStatusText(data.quality?.status || 'GOOD QUALITY');
      setStep('result');

    } catch (err) {
      console.error('Backend API error:', err);
      setQualityPassed(false);
      const connErr = `Backend Connection Failed: Could not connect to API at '${API_BASE_URL}'. Please ensure the backend server is running on port 8000.`;
      setQualityIssues([connErr]);
      setErrorMessage(connErr);
      setStep('quality_result');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentRecord(null);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getStepIndex = () => {
    switch (step) {
      case 'upload': return 0;
      case 'quality_result': return 1;
      case 'analyze': return 2;
      case 'result': return 3;
      default: return 0;
    }
  };
  const currentIndex = getStepIndex();

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-2">

      {/* Page Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mono mb-2" style={{ color: '#059669' }}>
          Model 3 — Real-Time ECG Analysis
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#0F172A' }}>Analyze ECG Image</h1>
        <p className="mt-2 text-slate-600">
          Upload an ECG scan, select a classifier, and perform real-time AI classification using the Model 3 dual-feature fusion pipeline.
        </p>
      </div>

      {/* Step Tracker */}
      <div className="flex items-center relative">
        <div
          className="absolute left-0 top-5 h-0.5 w-full bg-slate-200"
          style={{ zIndex: 0 }}
        />
        <div
          className="absolute left-0 top-5 h-0.5 transition-all duration-700 bg-emerald-600"
          style={{
            width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
            zIndex: 1,
            boxShadow: '0 0 6px rgba(5,150,105,0.3)',
          }}
        />

        {STEPS.map((label, idx) => {
          const isDone   = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-3 relative" style={{ zIndex: 2 }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300"
                style={{
                  background: isDone ? '#059669' : isActive ? '#FFFFFF' : '#F1F5F9',
                  borderColor: isDone ? '#059669' : isActive ? '#059669' : '#E2E8F0',
                  color: isDone ? '#fff' : isActive ? '#059669' : '#94A3B8',
                  boxShadow: isActive ? '0 0 12px rgba(5,150,105,0.25)' : 'none',
                }}
              >
                {isDone ? <CheckCircle className="w-5 h-5" /> : idx + 1}
              </div>
              <span
                className="text-[0.65rem] font-bold uppercase tracking-wider whitespace-nowrap absolute top-12"
                style={{ color: isDone || isActive ? '#059669' : '#94A3B8' }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content Area */}
      <div className="pt-6">
        <AnimatePresence mode="wait">

          {/* STEP 1: UPLOAD & CONFIGURATION */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/bmp"
                className="hidden"
                onChange={handleInputChange}
              />

              {/* Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className="relative rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer group overflow-hidden border-2 border-dashed transition-all duration-300"
                style={{
                  background: isDragging ? '#ECFDF5' : '#FFFFFF',
                  borderColor: isDragging ? '#059669' : '#A7F3D0',
                }}
              >
                <div
                  className="p-5 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}
                >
                  <UploadCloud className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-slate-900">Upload ECG Image</h3>
                <p className="mb-3 text-slate-600 text-sm">
                  Drag &amp; drop your ECG scan or <span className="text-emerald-600 font-semibold">Browse File</span>
                </p>
                <p className="text-xs mono uppercase tracking-widest text-slate-400">
                  Supported formats: PNG, JPG, JPEG, BMP (Max 10 MB)
                </p>
              </div>

              {/* Model & Classifier Selection Panel */}
              <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b pb-3 border-slate-100 text-slate-900 font-bold">
                  <Cpu className="w-5 h-5 text-emerald-600" />
                  Pipeline: Model 3 — Select Classifier
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Model Architecture Info (Fixed = Model 3) */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Model Architecture (Fixed)
                    </label>
                    <div
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-500 bg-emerald-50/50 shadow-sm"
                    >
                      <div className="mt-1 w-4 h-4 rounded-full border-2 border-emerald-600 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-600" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Model 3: Dual Feature Fusion</div>
                        <div className="text-[0.7rem] text-slate-500">EfficientNetV2-B0 (1280-d) + Autoencoder (256-d) → 1536-d Fused vector</div>
                        <div className="mt-1 text-[0.65rem] font-semibold text-emerald-700 uppercase tracking-wider">Clean Retrain · No Data Leakage</div>
                      </div>
                    </div>
                  </div>

                  {/* Classifier Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Select Classifier Head
                    </label>
                    <div className="space-y-2">
                      <label
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedClassifier === 'svm'
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="classifier"
                          value="svm"
                          checked={selectedClassifier === 'svm'}
                          onChange={(e) => setSelectedClassifier(e.target.value)}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">SVM (Support Vector Classifier)</div>
                          <div className="text-[0.7rem] text-slate-500">RBF Kernel pipeline with StandardScaler</div>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedClassifier === 'rf'
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="classifier"
                          value="rf"
                          checked={selectedClassifier === 'rf'}
                          onChange={(e) => setSelectedClassifier(e.target.value)}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">Random Forest Classifier</div>
                          <div className="text-[0.7rem] text-slate-500">Ensemble decision trees with balanced weights</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Preview & Trigger Prediction */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-5 flex items-center gap-5 bg-white border border-emerald-200 shadow-sm"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="ECG preview"
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-200 shrink-0">
                      <FileImage className="w-8 h-8 text-emerald-600" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-slate-900">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[0.65rem] font-bold uppercase mono">
                        {selectedModel}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[0.65rem] font-bold uppercase mono">
                        {selectedClassifier.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={runBackendInference}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 btn-stream shadow-md"
                    >
                      Run AI Prediction
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex items-center justify-center gap-2 px-5 py-1.5 rounded-xl font-semibold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      Remove File
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Preprocessing Inspector Preview */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mono flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Preprocessing Pipeline Inspection
                  </span>
                  <button
                    onClick={() => setShowInspector(!showInspector)}
                    className="text-xs text-slate-500 hover:text-emerald-600 font-semibold underline"
                  >
                    {showInspector ? 'Hide Inspector' : 'Show Inspector'}
                  </button>
                </div>
                {showInspector && (
                  <PreprocessingInspector previewUrl={previewUrl} fileName={selectedFile?.name} />
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: BACKEND ERROR / QUALITY ISSUE */}
          {step === 'quality_result' && !qualityPassed && (
            <motion.div
              key="quality_result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="rounded-2xl p-10 border border-red-300 bg-red-50/60 flex flex-col items-center text-center space-y-5">
                <div className="p-4 rounded-full bg-red-100 text-red-600 border border-red-300">
                  <ShieldAlert className="w-12 h-12" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-red-600 mono">
                    Prediction Error / Quality Check Blocked
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Unable to Process ECG Image</h2>
                  <p className="text-slate-700 mt-2 max-w-md">
                    The backend API encountered an issue during image quality verification or model execution.
                  </p>
                </div>

                <div className="w-full max-w-md bg-white p-4 rounded-xl border border-red-200 text-left text-xs space-y-2">
                  <span className="font-bold text-red-700 uppercase tracking-wider">Error Details:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {qualityIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 shadow-md transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Another Image
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: DEEP LEARNING ANALYSIS IN PROGRESS */}
          {step === 'analyze' && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="rounded-2xl p-16 border border-emerald-200 bg-white flex flex-col items-center text-center shadow-sm"
            >
              <div className="p-5 rounded-full mb-6 bg-emerald-50 border border-emerald-200">
                <BrainCircuit className="w-10 h-10 animate-spin text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Executing Model 3 | {selectedClassifier.toUpperCase()} Classifier…</h3>
              <p className="text-slate-600 max-w-md">
                Running image quality check, preprocessing to 224×224 tensor, extracting feature representations, and evaluating classifier head.
              </p>
              <div className="stream-progress w-56 mt-8">
                <motion.div
                  className="stream-progress-bar"
                  initial={{ width: '0%' }}
                  animate={{ width: '90%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 4: RESULT PAGE */}
          {step === 'result' && currentRecord && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Prediction Banner */}
              <div
                className="relative rounded-2xl p-8 overflow-hidden border"
                style={{
                  background: currentRecord.predictionCode === 'NP' ? '#ECFDF5' : currentRecord.predictionCode === 'AH' ? '#F0FDF4' : '#FEF2F2',
                  borderColor: currentRecord.predictionCode === 'NP' ? '#A7F3D0' : currentRecord.predictionCode === 'AH' ? '#BBF7D0' : '#FCA5A5',
                }}
              >
                <div className="relative flex flex-col md:flex-row items-start justify-between gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-widest mono text-emerald-700">
                        Model Prediction Result
                      </span>
                    </div>
                    <h2 className="text-4xl font-black mb-4 text-slate-900">
                      {currentRecord.predictionName}
                    </h2>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="mono text-sm font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800">
                        CLASS CODE: {currentRecord.predictionCode}
                      </span>
                      {currentRecord.confidence !== null && (
                        <span className="text-slate-600 text-sm">
                          Model Confidence: <strong className="text-slate-900 font-bold">{currentRecord.confidence.toFixed(1)}%</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl px-4 py-3 bg-white/80 border border-slate-200 text-right shrink-0 space-y-1">
                    <span className="text-xs mono font-bold uppercase tracking-widest text-emerald-700 block">
                      Quality Result: {qualityStatusText}
                    </span>
                    <div className="text-[0.7rem] mono text-slate-600">
                      Model: <strong className="uppercase">{currentRecord.modelUsed}</strong> | Classifier: <strong className="uppercase">{currentRecord.classifierUsed}</strong>
                    </div>
                    <span className="text-[0.65rem] text-slate-500 block">{currentRecord.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Grid Section */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Probability Distribution Across 3 Target Classes */}
                <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b pb-3 border-slate-100">
                    <h3 className="font-bold text-slate-900">Probability Distribution (3 Target Classes)</h3>
                    <span className="text-[0.7rem] mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">Classifier Output</span>
                  </div>

                  <div className="space-y-4">
                    {currentRecord.probabilities && currentRecord.probabilities.length > 0 ? (
                      currentRecord.probabilities.map(item => (
                        <div key={item.code} className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate-700 font-semibold">{item.name} ({item.code})</span>
                            <span className="mono font-bold" style={{ color: item.color }}>
                              {item.probability.toFixed(1)}%
                            </span>
                          </div>
                          <div className="stream-progress">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.probability}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ background: item.color }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Class probability distribution is not outputted by this classifier head.
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions & Report Export */}
                <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="font-bold text-slate-900 mb-4 border-b pb-3 border-slate-100">Report &amp; Actions</h3>
                  <div className="flex-1 flex flex-col justify-center gap-4">
                    <button
                      onClick={() => generatePdfReport(currentRecord)}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm btn-stream"
                    >
                      <FileText className="w-5 h-5" />
                      View Report
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Analyze Another ECG
                    </button>
                  </div>
                </div>
              </div>

              {/* Preprocessing Inspector in Results */}
              <div className="pt-2">
                <PreprocessingInspector previewUrl={previewUrl} fileName={selectedFile?.name} />
              </div>

              {/* Medical Safety Disclaimer */}
              <div className="rounded-xl p-4 flex items-start gap-3 text-sm bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-amber-900 text-xs leading-relaxed">
                  <strong className="block text-amber-700 text-sm font-bold mb-0.5">Research &amp; Educational Use Disclaimer</strong>
                  This system provides AI-based ECG image analysis for research and educational purposes. It is not a substitute for evaluation by a qualified healthcare professional and does not provide a definitive medical diagnosis.
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
