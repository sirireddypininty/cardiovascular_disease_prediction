import { useState } from 'react';
import { Layers, Crop, Eye, Sliders, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function PreprocessingInspector({ previewUrl, fileName }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: '1. Crop ROI Detection',
      icon: Crop,
      badge: 'ROI Cropping',
      desc: 'Strips patient header metadata (top 16.3%) and machine footer details (bottom 11.3%) to prevent model data leakage.',
      params: [
        { label: 'Start X Ratio', val: '2.8% (45px)' },
        { label: 'End X Ratio', val: '90.6% (1450px)' },
        { label: 'Top Header Crop', val: '16.3%' },
        { label: 'Bottom Footer Crop', val: '11.3%' },
      ],
      filter: 'none',
      overlay: 'crop-box'
    },
    {
      id: 2,
      title: '2. Waveform Region Extraction',
      icon: Layers,
      badge: 'Waveform Region',
      desc: 'Trims extraneous margins around the 12-lead grid area for focused feature extraction.',
      params: [
        { label: 'Patient Info Stripped', val: 'YES' },
        { label: '12-Lead Grid Area', val: 'Intact' },
        { label: 'Orientation Check', val: 'Landscape' },
        { label: 'Margin Padding', val: 'Trimmed' },
      ],
      filter: 'contrast(1.05)',
    },
    {
      id: 3,
      title: '3. Grayscale Conversion',
      icon: Eye,
      badge: 'Grayscale',
      desc: 'Converts RGB color space into 8-bit grayscale intensity values [0-255].',
      params: [
        { label: 'Color Conversion', val: 'BGR to Gray' },
        { label: 'Intensity Scale', val: '8-bit (0-255)' },
        { label: 'Color Channels', val: '1 Channel' },
        { label: 'Signal Contrast', val: 'Isolated' },
      ],
      filter: 'grayscale(100%)',
    },
    {
      id: 4,
      title: '4. Gaussian Denoising',
      icon: Sliders,
      badge: 'Noise Reduction',
      desc: 'Applies a 3×3 Gaussian Blur kernel to suppress high-frequency scanner noise without blunting R-peaks.',
      params: [
        { label: 'Kernel Size', val: '3 × 3' },
        { label: 'Sigma X', val: '0 (Auto)' },
        { label: 'Scanner Artifacts', val: 'Suppressed' },
        { label: 'Wave Morphologies', val: 'Preserved' },
      ],
      filter: 'grayscale(100%) blur(1px)',
    },
    {
      id: 5,
      title: '5. CLAHE Enhancement',
      icon: Sparkles,
      badge: 'Contrast Boost',
      desc: 'Contrast Limited Adaptive Histogram Equalization amplifies faint ECG waveform trace lines.',
      params: [
        { label: 'Clip Limit', val: '2.0' },
        { label: 'Tile Grid Size', val: '8 × 8' },
        { label: 'Local Equalization', val: 'Active' },
        { label: 'Trace Line Clarity', val: 'Enhanced' },
      ],
      filter: 'grayscale(100%) contrast(1.4) brightness(0.95)',
    },
    {
      id: 6,
      title: '6. Model Input Formatting',
      icon: ShieldCheck,
      badge: '224×224 Tensor',
      desc: 'Resizes image tensor to 224x224 pixels and normalizes pixel values to [0.0, 1.0].',
      params: [
        { label: 'Target Shape', val: '224 × 224 px' },
        { label: 'Channels', val: '3 (RGB Dup)' },
        { label: 'Pixel Normalization', val: '[0.00, 1.00]' },
        { label: 'Tensor Status', val: 'Input Ready' },
      ],
      filter: 'grayscale(100%) contrast(1.3) brightness(0.9)',
    },
  ];

  const current = steps[activeStep];

  return (
    <div
      className="rounded-2xl p-6 border space-y-6 bg-white border-emerald-200 shadow-sm"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">
              ECG Image Preprocessing Inspector
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            6-stage Python preprocessing pipeline matching preprocess.py
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold mono bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4" />
          Model Input: 224 × 224 × 3 Tensor
        </div>
      </div>

      {/* Step Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = idx === activeStep;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200"
              style={{
                background: isActive ? '#ECFDF5' : '#F8FAFC',
                borderColor: isActive ? '#059669' : '#E2E8F0',
                color: isActive ? '#059669' : '#64748B',
                boxShadow: isActive ? '0 2px 8px rgba(5,150,105,0.15)' : 'none',
              }}
            >
              <Icon className="w-5 h-5 mb-1.5" style={{ color: isActive ? '#059669' : '#94A3B8' }} />
              <span className="text-[0.7rem] font-bold tracking-tight line-clamp-1">{s.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Visual Showcase */}
      <div className="grid md:grid-cols-2 gap-6 items-center pt-2">
        
        {/* Left: Image Box */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center bg-slate-950 p-3 min-h-[240px]">
          {previewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt={current.title}
                className="max-h-[220px] object-contain rounded-lg transition-all duration-500"
                style={{ filter: current.filter }}
              />
              
              {/* ROI Crop Box Overlay */}
              {current.overlay === 'crop-box' && (
                <div
                  className="absolute border-2 border-red-500 rounded pointer-events-none transition-all duration-300"
                  style={{
                    top: '16.3%',
                    bottom: '11.3%',
                    left: '2.8%',
                    right: '9.4%',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  <span className="absolute top-1 left-2 text-[0.65rem] font-bold bg-red-600 text-white px-2 py-0.5 rounded mono shadow">
                    Waveform ROI Crop Region
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 text-slate-400 text-sm">
              Upload an ECG report image to inspect live step-by-step preprocessing
            </div>
          )}
          <span className="absolute bottom-2 right-2 text-[0.65rem] mono bg-black/80 text-emerald-400 px-2 py-1 rounded">
            Step {current.id} of 6
          </span>
        </div>

        {/* Right: Parameter Details */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest mono text-emerald-600">
              {current.badge}
            </span>
            <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">{current.title}</h4>
            <p className="text-xs text-slate-600 mt-1">{current.desc}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {current.params.map(p => (
              <div key={p.label} className="p-2.5 rounded-lg border bg-slate-50 border-slate-200">
                <p className="text-[0.65rem] font-semibold text-slate-500 uppercase tracking-wider">{p.label}</p>
                <p className="text-xs font-bold text-slate-800 mono mt-0.5">{p.val}</p>
              </div>
            ))}
          </div>

          {fileName && (
            <div className="text-[0.7rem] text-slate-500 mono pt-1">
              Active File: <span className="text-slate-800 font-semibold">{fileName}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
