import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, ScanLine, BrainCircuit, FileSearch, Zap, Shield } from 'lucide-react';

/* ── Feature card data ── */
const features = [
  {
    icon: Activity,
    title: 'ECG Classification',
    desc: 'Classify ECG images into four cardiac categories with deep CNN models.',
    color: '#059669',
    bg: 'rgba(5,150,105,0.06)',
    border: 'rgba(5,150,105,0.15)',
  },
  {
    icon: ScanLine,
    title: 'Quality Checker',
    desc: 'Automatic image quality validation before prediction pipeline.',
    color: '#047857',
    bg: 'rgba(4,120,87,0.06)',
    border: 'rgba(4,120,87,0.15)',
  },
  {
    icon: BrainCircuit,
    title: 'Deep Learning',
    desc: 'CNN & Transfer Learning-based classification pipeline.',
    color: '#065F46',
    bg: 'rgba(6,95,70,0.06)',
    border: 'rgba(6,95,70,0.15)',
  },
  {
    icon: FileSearch,
    title: 'ECG Reports',
    desc: 'View detailed analysis reports for research and review.',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: 'rgba(245,158,11,0.2)',
  },
];

/* ── ECG classes ── */
const classes = [
  { label: 'NP',   name: 'Normal Person',                    color: '#059669', bg: 'rgba(5,150,105,0.06)',  border: 'rgba(5,150,105,0.15)' },
  { label: 'AH',   name: 'Abnormal Heartbeat',               color: '#047857', bg: 'rgba(4,120,87,0.06)',   border: 'rgba(4,120,87,0.15)' },
  { label: 'MI',   name: 'Myocardial Infarction',            color: '#DC2626', bg: '#FEF2F2',              border: 'rgba(220,38,38,0.2)' },
  { label: 'H.MI', name: 'History of Myocardial Infarction', color: '#F59E0B', bg: '#FFFBEB',              border: 'rgba(245,158,11,0.2)' },
];

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  return (
    <div className="overflow-hidden">

      {/* ══ HERO SECTION ══ */}
      <section className="relative pt-24 pb-36 overflow-hidden">
        <div className="absolute inset-0 stream-grid opacity-40" />

        <div
          className="absolute"
          style={{
            top: '-10%', left: '50%', transform: 'translateX(-50%)',
            width: 800, height: 500,
            background: 'radial-gradient(ellipse at center, rgba(5,150,105,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '30%', right: '-5%',
            width: 400, height: 400,
            background: 'radial-gradient(ellipse at center, rgba(6,95,70,0.04) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">

            {/* Hero Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl text-center"
            >
              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {[
                  { label: 'Open Source',       color: '#059669', bg: 'rgba(5,150,105,0.08)',  border: 'rgba(5,150,105,0.2)' },
                  { label: 'Deep Learning',     color: '#047857', bg: 'rgba(4,120,87,0.08)',   border: 'rgba(4,120,87,0.2)' },
                  { label: 'ECG Classification',color: '#065F46', bg: 'rgba(6,95,70,0.08)',    border: 'rgba(6,95,70,0.2)' },
                ].map(b => (
                  <span
                    key={b.label}
                    className="badge-stream mono"
                    style={{ color: b.color, background: b.bg, borderColor: b.border }}
                  >
                    {b.label}
                  </span>
                ))}
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
                <span style={{ color: '#0F172A' }}>AI-Powered</span>
                <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #065F46 60%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  ECG Analysis
                </span>
              </h1>

              <p className="text-lg leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0" style={{ color: '#64748B' }}>
                Advanced ECG image classification using deep learning and transfer learning.
                Validate quality, classify cardiac patterns, and generate detailed prediction reports.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/analyze" className="btn-stream w-full sm:w-auto inline-flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Analyze ECG
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/model" className="btn-ghost w-full sm:w-auto inline-flex items-center justify-center">
                  Explore the Research
                </Link>
              </div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center gap-8 mt-12 justify-center"
              >
                {[
                  { val: '4',       label: 'ECG Classes' },
                  { val: 'Passed',  label: 'Quality Gate' },
                  { val: 'Open',    label: 'Source' },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center">
                    <span className="text-2xl font-black mono" style={{ color: '#059669' }}>{s.val}</span>
                    <span className="text-xs font-medium uppercase tracking-wider mt-0.5" style={{ color: '#94A3B8' }}>{s.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>


          </div>
        </div>
      </section>

      {/* ══ FEATURES SECTION ══ */}
      <section className="py-24" style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3 mono" style={{ color: '#059669' }}>
              Platform Features
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#0F172A' }}>
              Core Platform Features
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: '#64748B' }}>
              An open-source deep-learning ecosystem designed for simplicity and accuracy.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="stream-card p-6 group">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}
                >
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#0F172A' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ CLASSIFICATION SECTION ══ */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#F0FDF4' }}>
        <div className="absolute inset-0 stream-grid opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3 mono" style={{ color: '#059669' }}>
              Classification
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#0F172A' }}>
              Four ECG Classification Categories
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: '#64748B' }}>
              The deep learning model places valid ECG images into one of four possible classes.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {classes.map((c, i) => (
              <motion.div key={i} variants={fadeUp} className="stream-card p-6 relative group">
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }}
                />
                <div className="absolute top-4 right-4">
                  <span
                    className="badge-stream mono text-[0.65rem]"
                    style={{ color: c.color, background: c.bg, borderColor: c.border }}
                  >
                    {c.label}
                  </span>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}
                >
                  <Activity className="w-6 h-6" style={{ color: c.color }} />
                </div>
                <h3 className="text-base font-bold mb-2 transition-colors" style={{ color: '#0F172A' }}>{c.name}</h3>
                <p className="text-sm" style={{ color: '#64748B' }}>ECG image classified by the model as {c.name}.</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ CTA SECTION ══ */}
      <section className="py-20 relative overflow-hidden" style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(5,150,105,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Shield className="w-12 h-12 mx-auto mb-6" style={{ color: '#059669', opacity: 0.4 }} />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#0F172A' }}>
              Start Analyzing ECGs Today
            </h2>
            <p className="mb-10" style={{ color: '#64748B' }}>
              Open-source, free to use, and built for researchers and educators. No account required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/analyze" className="btn-stream inline-flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Analyze an ECG
              </Link>
              <Link to="/docs" className="btn-ghost inline-flex items-center justify-center gap-2">
                Read the Docs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
