import { useState } from 'react';
import { FileText } from 'lucide-react';
import { getAnalysisHistory } from '../utils/historyStore.js';
import { generatePdfReport } from '../utils/pdfGenerator.js';
import { Link } from 'react-router-dom';

export default function Reports() {
  const [history] = useState(() => getAnalysisHistory());

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mono mb-2 text-emerald-600">Analysis Reports</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Reports</h1>
        <p className="mt-2 text-slate-600">View generated AI ECG Analysis Reports for completed image evaluations.</p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl p-16 flex flex-col items-center text-center bg-white border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-emerald-50 border border-emerald-200">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-slate-900">No reports generated yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm">Reports will appear here after you complete an ECG analysis.</p>
          <Link to="/analyze" className="btn-stream text-sm">
            Run Analysis &amp; Generate Report
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {history.map((rec) => (
            <div
              key={rec.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="mono text-xs font-bold text-emerald-600 block">{rec.id}</span>
                  <h3 className="font-bold text-slate-900 text-lg mt-0.5">{rec.predictionName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{rec.fileName} · {rec.timestamp}</p>
                </div>
                <span className="text-xs font-bold mono px-2.5 py-1 rounded bg-emerald-100 text-emerald-700">
                  {rec.predictionCode}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Quality Check Status:</span>
                  <strong className="text-emerald-700">{rec.qualityPassed ? 'PASSED' : 'ISSUE'}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Model Confidence:</span>
                  <strong className="text-slate-900">{rec.confidence.toFixed(1)}%</strong>
                </div>
              </div>

              <button
                onClick={() => generatePdfReport(rec)}
                className="w-full btn-stream flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl font-bold"
              >
                <FileText className="w-4 h-4" /> View AI ECG Analysis Report
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
