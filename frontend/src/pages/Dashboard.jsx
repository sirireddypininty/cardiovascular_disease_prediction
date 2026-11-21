import { useState } from 'react';
import { Activity, FileText, AlertTriangle, ScanLine, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getAnalysisHistory } from '../utils/historyStore.js';
import { generatePdfReport } from '../utils/pdfGenerator.js';

export default function Dashboard() {
  const [history] = useState(() => getAnalysisHistory());

  const totalAnalyzed = history.length;
  const qualityPassedCount = history.filter(h => h.qualityPassed).length;
  const qualityIssuesCount = history.filter(h => !h.qualityPassed).length;
  const qualityPassRate = totalAnalyzed > 0 ? Math.round((qualityPassedCount / totalAnalyzed) * 100) : 0;
  const reportsGeneratedCount = history.length;

  const stats = [
    { label: 'ECGs Analyzed',     value: totalAnalyzed > 0 ? totalAnalyzed.toString() : '0',  icon: Activity,      color: '#059669', bg: 'rgba(5,150,105,0.06)',  border: 'rgba(5,150,105,0.15)' },
    { label: 'Quality Pass Rate', value: totalAnalyzed > 0 ? `${qualityPassRate}%` : '0%',     icon: ScanLine,      color: '#047857', bg: 'rgba(4,120,87,0.06)',   border: 'rgba(4,120,87,0.15)' },
    { label: 'Quality Issues',    value: totalAnalyzed > 0 ? qualityIssuesCount.toString() : '0', icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB',              border: 'rgba(245,158,11,0.2)' },
    { label: 'Reports Generated', value: totalAnalyzed > 0 ? reportsGeneratedCount.toString() : '0', icon: FileText,   color: '#065F46', bg: 'rgba(6,95,70,0.06)',   border: 'rgba(6,95,70,0.15)' },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mono mb-2 text-emerald-600">
          Overview
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          ECG Analysis Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Monitor ECG image quality validations and classification records across the target categories (NP, AH, MI, H.MI).
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl p-6 relative overflow-hidden bg-white border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl" style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-3xl font-black mono text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Real History or Clean Empty State */}
      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-16 text-center bg-white border border-slate-200 shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-emerald-50 border border-emerald-200">
            <Activity className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-slate-900">No analysis data available yet.</h3>
          <p className="mb-8 text-slate-500">Upload your first ECG image to run quality check and classification.</p>
          <Link to="/analyze" className="btn-stream inline-flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4" />
            Analyze ECG
          </Link>
        </motion.div>
      ) : (
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-4 border-slate-100">
            <h3 className="font-bold text-slate-900 text-lg">Recent Analysis Activity</h3>
            <Link to="/history" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All Records →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase mono">
                  <th className="py-3 px-2">ID</th>
                  <th className="py-3 px-2">Date &amp; Time</th>
                  <th className="py-3 px-2">File</th>
                  <th className="py-3 px-2">Quality</th>
                  <th className="py-3 px-2">Prediction</th>
                  <th className="py-3 px-2">Confidence</th>
                  <th className="py-3 px-2 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, 5).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-3 px-2 mono font-bold text-slate-700">{rec.id}</td>
                    <td className="py-3 px-2 text-slate-500 text-xs">{rec.timestamp}</td>
                    <td className="py-3 px-2 text-slate-800 font-medium truncate max-w-[150px]">{rec.fileName}</td>
                    <td className="py-3 px-2">
                      <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded mono ${rec.qualityPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {rec.qualityPassed ? 'PASSED' : 'ISSUE'}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-900">{rec.predictionName} ({rec.predictionCode})</td>
                    <td className="py-3 px-2 mono font-bold text-emerald-700">{rec.confidence.toFixed(1)}%</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => generatePdfReport(rec)}
                        className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
