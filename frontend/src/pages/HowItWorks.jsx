import { UploadCloud, ShieldCheck, Sliders, BrainCircuit, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  const workflowSteps = [
    {
      num: '01',
      title: 'Upload ECG Image',
      icon: UploadCloud,
      desc: 'Upload a 12-lead ECG image scan (PNG, JPG, JPEG format).',
      details: [
        'Supports standard 12-lead ECG report layouts',
        'Automatic file format and resolution check',
        'Secure client-side preview buffer',
      ],
    },
    {
      num: '02',
      title: 'Check Image Quality',
      icon: ShieldCheck,
      desc: 'Mandatory quality verification phase prior to model inference.',
      details: [
        'Resolution check (minimum 150×150 px required)',
        'Blurriness detection via Laplacian variance',
        'Contrast and intensity variance validation',
        'Quality failure blocks model prediction to ensure clinical safety',
      ],
    },
    {
      num: '03',
      title: 'Preprocess ECG Image',
      icon: Sliders,
      desc: 'Standardized 6-stage Python OpenCV image processing pipeline.',
      details: [
        'ROI Cropping: Strips patient header (top 16.3%) & machine footer (bottom 11.3%)',
        'Grayscale Conversion: Color space transformation',
        'Gaussian Denoising: 3×3 kernel smoothing',
        'CLAHE Contrast Boost: Amplifies faint trace lines',
        'Tensor Formatting: Resizes to 224×224×3 RGB normalized [0.0, 1.0]',
      ],
    },
    {
      num: '04',
      title: 'AI Classification',
      icon: BrainCircuit,
      desc: 'CNN deep learning feature extraction & multi-class classification.',
      details: [
        'Deep Learning CNN backbone architecture',
        'Global Average Pooling & Dropout regularization',
        'Categorical Softmax output across 4 target classes',
        'Mild data augmentation applied during training',
      ],
    },
    {
      num: '05',
      title: 'View Prediction & Download Report',
      icon: FileText,
      desc: 'Review prediction results and export printable PDF report.',
      details: [
        'Target Classes: NP (Normal Person), AH (Abnormal Heartbeat), MI (Myocardial Infarction), H.MI (History of MI)',
        'Confidence score and categorical probability distribution',
        'Instant printable PDF report export',
        'Research and educational use disclaimer',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-2">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest mono mb-2 text-emerald-600">
          Platform Architecture
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">How It Works</h1>
        <p className="mt-3 text-slate-600">
          A step-by-step walkthrough of the DeepECG analysis workflow, from upload and quality check to deep learning classification.
        </p>
      </div>

      {/* 5-Step Workflow Cards */}
      <div className="space-y-6">
        {workflowSteps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start gap-6 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center gap-4 shrink-0">
                <span className="mono font-black text-2xl text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  {s.num}
                </span>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-600">{s.desc}</p>

                <ul className="grid sm:grid-cols-2 gap-2 pt-2">
                  {s.details.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <Link to="/analyze" className="btn-stream inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm">
          Start ECG Analysis Now
        </Link>
      </div>
    </div>
  );
}
