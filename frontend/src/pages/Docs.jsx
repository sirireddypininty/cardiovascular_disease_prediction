import { BookOpen, ShieldAlert, CheckCircle2, Code2 } from 'lucide-react';

export default function Docs() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-2">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mono mb-2 text-emerald-600">
          System Documentation &amp; Abstract
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          DeepECG / Cardio Documentation
        </h1>
        <p className="mt-2 text-slate-600">
          Comprehensive project specification aligned with the project abstract: <em>Deep Learning and Transfer Learning in Cardiology: A Review of Cardiovascular Disease Prediction Models</em>.
        </p>
      </div>

      {/* Abstract Overview Box */}
      <div className="rounded-2xl p-6 bg-white border border-emerald-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b pb-3 border-slate-100">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-lg">Project Abstract Summary</h3>
        </div>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            Cardiovascular diseases (CVDs) remain a leading cause of global mortality. The <strong>DeepECG / Cardio</strong> project establishes a web-based AI-powered ECG image analysis platform to process 12-lead ECG report scans, validate image quality, execute robust image preprocessing, and perform deep-learning-based classification into four distinct target cardiac classes:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block text-xs">1. NP — Normal Person</span>
              <span className="text-[0.75rem] text-slate-500">Normal sinus rhythm and healthy wave morphologies.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block text-xs">2. AH — Abnormal Heartbeat</span>
              <span className="text-[0.75rem] text-slate-500">Arrhythmias and non-ischemic electrical conduction abnormalities.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block text-xs">3. MI — Myocardial Infarction</span>
              <span className="text-[0.75rem] text-slate-500">Acute or subacute ischemic ST-segment elevation &amp; T-wave changes.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block text-xs">4. H.MI — History of Myocardial Infarction</span>
              <span className="text-[0.75rem] text-slate-500">Pathological Q-waves and post-infarction myocardial scarring.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ECG Quality Checker Specification */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b pb-3 border-slate-100">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          ECG Image Quality Checker Module
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The Quality Checker acts as a mandatory validation gateway before model inference. If an uploaded ECG scan fails quality parameters, the analysis is blocked to prevent false inferences.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Resolution Check</span>
            <span className="text-slate-500">Minimum 150×150 px required to resolve grid lines and waveform peaks.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Blurriness Metric</span>
            <span className="text-slate-500">Laplacian variance threshold (≥15.0) flags out-of-focus camera captures.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Contrast Variance</span>
            <span className="text-slate-500">Grayscale intensity standard deviation (≥10.0) detects blank scans.</span>
          </div>
        </div>
      </div>

      {/* Preprocessing Specification */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b pb-3 border-slate-100">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          6-Stage Preprocessing Pipeline
        </div>
        <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed">
          <li><strong>ROI Crop Detection:</strong> Strips patient header (top 16.3%) and machine footer (bottom 11.3%) to eliminate data leakage.</li>
          <li><strong>Waveform Extraction:</strong> Isolates the 12-lead grid box area.</li>
          <li><strong>Grayscale Conversion:</strong> BGR to single-channel 8-bit gray [0-255].</li>
          <li><strong>Gaussian Denoising:</strong> 3×3 kernel smooths high-frequency scanner noise.</li>
          <li><strong>CLAHE Enhancement:</strong> Contrast Limited Adaptive Histogram Equalization (clipLimit=2.0, grid=8x8).</li>
          <li><strong>Tensor Normalization:</strong> Resizes image to 224×224×3 RGB, normalized to [0.0, 1.0].</li>
        </ol>
      </div>

      {/* Backend API Endpoints */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b pb-3 border-slate-100">
          <Code2 className="w-5 h-5 text-emerald-600" />
          FastAPI Backend Endpoints
        </div>
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-emerald-700 font-bold">GET /health</span>
            <p className="text-slate-500 font-sans mt-0.5">Returns API status, active service name, and supported target classes.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-emerald-700 font-bold">POST /check-quality</span>
            <p className="text-slate-500 font-sans mt-0.5">Evaluates uploaded image for resolution, blur, and contrast issues.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-emerald-700 font-bold">POST /preprocess</span>
            <p className="text-slate-500 font-sans mt-0.5">Executes 6-stage preprocessing and returns base64 image steps and tensor shapes.</p>
          </div>
        </div>
      </div>

      {/* Research Disclaimer */}
      <div className="rounded-2xl p-6 bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
        <h4 className="font-bold text-amber-800 text-sm">Research &amp; Educational Use Disclaimer</h4>
        <p className="text-xs text-amber-700 leading-relaxed">
          DeepECG / Cardio is developed strictly for research, academic evaluation, and educational benchmarking.
          It does not provide definitive medical diagnoses and must not be used as a standalone diagnostic tool in clinical settings.
        </p>
      </div>
    </div>
  );
}
