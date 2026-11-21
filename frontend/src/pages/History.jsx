import { useState } from 'react';
import { Clock, FileText, Trash2 } from 'lucide-react';
import { getAnalysisHistory, clearAnalysisHistory } from '../utils/historyStore.js';
import { generatePdfReport } from '../utils/pdfGenerator.js';
import { Link } from 'react-router-dom';

export default function History() {
  const [history, setHistory] = useState(() => getAnalysisHistory());

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all analysis history records?')) {
      clearAnalysisHistory();
      setHistory([]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mono mb-2 text-emerald-600">Analysis Log</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Analysis History</h1>
          <p className="mt-2 text-slate-600">View past ECG image quality assessments and model classification predictions.</p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl p-16 flex flex-col items-center text-center bg-white border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-emerald-50 border border-emerald-200">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-slate-900">No analysis history yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm">Analysis history will appear here once you run your first ECG classification.</p>
          <Link to="/analyze" className="btn-stream text-sm">
            Analyze an ECG Image
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase mono">
                <th className="py-3 px-3">Analysis ID</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Source File</th>
                <th className="py-3 px-3">Quality</th>
                <th className="py-3 px-3">Model Prediction</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 mono font-bold text-slate-700">{rec.id}</td>
                  <td className="py-3 px-3 text-slate-500 text-xs">{rec.timestamp}</td>
                  <td className="py-3 px-3 text-slate-800 font-medium">{rec.fileName}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded mono ${rec.qualityPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {rec.qualityPassed ? 'PASSED' : 'ISSUE'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{rec.predictionName} ({rec.predictionCode})</td>
                  <td className="py-3 px-3 mono font-bold text-emerald-700">{rec.confidence.toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => generatePdfReport(rec)}
                      className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 inline-flex items-center gap-1.5 text-xs font-semibold border border-emerald-200"
                    >
                      <FileText className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
