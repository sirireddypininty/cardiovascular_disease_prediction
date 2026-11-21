import { BrainCircuit, Cpu, AlertCircle, Layers, CheckCircle, Database } from 'lucide-react';

export default function Model() {
  const specs = [
    { label: 'Model Architecture 1', value: 'EfficientNetV2-B0 CNN (1280-d GAP Features)' },
    { label: 'Model Architecture 2', value: 'Convolutional Autoencoder (256-d Bottleneck Latent)' },
    { label: 'Model Architecture 3', value: 'Dual Feature Fusion (1536-d Concatenated Vector)' },
    { label: 'Target Cardiac Classes (3)', value: 'Normal Person (NP), abnormal heartbeat (AH), Myocardial Infarction (MI)' },
    { label: 'Input Resolution', value: '224 × 224 × 3 RGB Tensor' },
    { label: 'Preprocessing Pipeline', value: '15% Header Crop + Sharpening + 1.1x Contrast' },
    { label: 'Classification Heads', value: 'Support Vector Machine (RBF) / Random Forest' },
    { label: 'System Status', value: 'All 3 Models Fully Trained & Active' },
  ];

  const targetCategories = [
    { code: 'NP', name: 'Normal Person', desc: 'Baseline normal sinus rhythm ECG pattern.' },
    { code: 'AH', name: 'abnormal heartbeat', desc: 'Arrhythmias and non-ischemic electrical conduction abnormalities.' },
    { code: 'MI', name: 'Myocardial Infarction', desc: 'Acute or subacute ischemic ST-segment elevation / T-wave changes.' },
  ];

  const benchmarkResults = [
    {
      name: 'Model 1 (EfficientNetV2-B0)',
      feats: '1280-d GAP',
      svmAcc: '100.00%',
      rfAcc: '100.00%',
      leakage: 'Confirmed Leakage (Split before exact duplicate hash removal)',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    {
      name: 'Model 2 (Conv Autoencoder)',
      feats: '256-d Latent',
      svmAcc: '72.13%',
      rfAcc: '78.69%',
      leakage: 'Reported Leakage-Free Clean Baseline (Exact Hash Deduplicated)',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    {
      name: 'Model 3 (Dual Feature Fusion)',
      feats: '1536-d Fused',
      svmAcc: '93.44%',
      rfAcc: '91.80%',
      leakage: 'Reported Indirect Leakage (Feature Fusion Combination)',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-300'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-2">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mono mb-2 text-emerald-600">
          Deep Learning &amp; Feature Fusion Pipeline
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Model Architectures &amp; Pipeline Specifications
        </h1>
        <p className="mt-2 text-slate-600">
          Technical specifications, feature representations, and evaluation comparison across all 3 trained ECG classification models.
        </p>
      </div>

      {/* Dataset & Evaluation Benchmark Table */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b pb-3 border-slate-100">
          <Database className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-lg">Evaluation Comparison &amp; Benchmark Report</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                <th className="p-3">Model Architecture</th>
                <th className="p-3">Feature Dim</th>
                <th className="p-3">SVM Accuracy</th>
                <th className="p-3">RF Accuracy</th>
                <th className="p-3">Data Leakage Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarkResults.map((m) => (
                <tr key={m.name} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">{m.name}</td>
                  <td className="p-3 mono font-semibold text-slate-600">{m.feats}</td>
                  <td className="p-3 mono font-bold text-emerald-700">{m.svmAcc}</td>
                  <td className="p-3 mono font-bold text-emerald-700">{m.rfAcc}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-[0.65rem] font-semibold border ${m.statusColor}`}>
                      {m.leakage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Model Flow Card */}
      <div className="rounded-2xl p-8 bg-white border border-emerald-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">3-Stage Feature Extraction &amp; Inference Flow</h3>
              <p className="text-xs text-slate-500">Unified workflow from raw ECG scan to 3 target cardiac classes</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold mono bg-emerald-100 text-emerald-700">
            3 Target Classes
          </span>
        </div>

        {/* Visual Layer Flow */}
        <div className="grid sm:grid-cols-5 gap-3 text-center">
          <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 space-y-1">
            <div className="text-[0.6rem] font-bold uppercase tracking-wider text-slate-400">Step 01</div>
            <div className="font-bold text-slate-800 text-xs">ECG Upload</div>
            <div className="text-[0.65rem] font-mono text-slate-500">Raw Report Image</div>
          </div>

          <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 space-y-1">
            <div className="text-[0.6rem] font-bold uppercase tracking-wider text-slate-400">Step 02</div>
            <div className="font-bold text-slate-800 text-xs">Preprocessing</div>
            <div className="text-[0.65rem] font-mono text-emerald-600">Crop / Sharpen / 224×224</div>
          </div>

          <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 space-y-1">
            <div className="text-[0.6rem] font-bold uppercase tracking-wider text-slate-400">Step 03</div>
            <div className="font-bold text-slate-800 text-xs">Feature Vector</div>
            <div className="text-[0.65rem] font-mono text-slate-500">1280-d / 256-d / 1536-d</div>
          </div>

          <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 space-y-1">
            <div className="text-[0.6rem] font-bold uppercase tracking-wider text-slate-400">Step 04</div>
            <div className="font-bold text-slate-800 text-xs">Classifier Head</div>
            <div className="text-[0.65rem] font-mono text-emerald-600">SVM or Random Forest</div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 space-y-1">
            <div className="text-[0.6rem] font-bold uppercase tracking-wider text-emerald-700">Step 05</div>
            <div className="font-bold text-slate-900 text-xs">Output Class</div>
            <div className="text-[0.65rem] font-mono text-emerald-700">NP / AH / MI</div>
          </div>
        </div>
      </div>

      {/* Target Classes Matrix & Specifications */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* 3 Target Classes */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b pb-3 border-slate-100">
            <Layers className="w-5 h-5 text-emerald-600" />
            Target Cardiac Classes
          </div>
          <div className="space-y-3">
            {targetCategories.map((c) => (
              <div key={c.code} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900">{c.name}</span>
                  <span className="mono font-bold text-[0.7rem] px-2 py-0.5 rounded bg-white border border-slate-200 text-emerald-700">
                    {c.code}
                  </span>
                </div>
                <p className="text-[0.75rem] text-slate-600 leading-normal">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Specs */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b pb-3 border-slate-100">
            <Cpu className="w-5 h-5 text-emerald-600" />
            Pipeline Configurations
          </div>
          <div className="space-y-3">
            {specs.map((s) => (
              <div key={s.label} className="flex justify-between items-center text-xs border-b pb-2 border-slate-100">
                <span className="text-slate-500 font-medium">{s.label}</span>
                <span className="font-semibold text-slate-800 mono text-right max-w-[200px] truncate">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
