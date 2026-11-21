const fs = require('fs');
const path = require('path');

const dirs = [
  'src/components/layout',
  'src/components/ui',
  'src/pages',
  'src/utils',
];

dirs.forEach(d => {
  const fullPath = path.join(__dirname, d);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const files = {
  'src/utils/cn.ts': `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
  'src/App.tsx': `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import History from './pages/History';
import Reports from './pages/Reports';
import Model from './pages/Model';
import HowItWorks from './pages/HowItWorks';
import OpenSource from './pages/OpenSource';
import Docs from './pages/Docs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/model" element={<Model />} />
          <Route path="/open-source" element={<OpenSource />} />
          <Route path="/docs" element={<Docs />} />
        </Route>
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/history" element={<History />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`,
  'src/components/layout/MainLayout.tsx': `import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
`,
  'src/components/layout/DashboardLayout.tsx': `import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Activity, BarChart2, Clock, FileText, Lightbulb, BookOpen, Settings, Github } from 'lucide-react';
import { cn } from '../../utils/cn';

const sidebarLinks = [
  { name: 'Overview', href: '/dashboard', icon: BarChart2 },
  { name: 'Analyze ECG', href: '/analyze', icon: Activity },
  { name: 'History', href: '/history', icon: Clock },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Model Insights', href: '/model', icon: Lightbulb },
  { name: 'Documentation', href: '/docs', icon: BookOpen },
];

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 gap-8">
        
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sticky top-24 h-[calc(100vh-8rem)]">
          <div className="mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">Menu</div>
          <nav className="flex-1 space-y-1">
            {sidebarLinks.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-slate-200 pt-4 space-y-1">
            <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <Settings className="w-5 h-5 text-slate-400" />
              Settings
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <Github className="w-5 h-5 text-slate-400" />
              GitHub
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
`,
  'src/components/layout/Navbar.tsx': `import { Link } from 'react-router-dom';
import { Activity, Menu, Github } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 border-b border-slate-200 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">DeepECG</span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/analyze" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Analyze ECG</Link>
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link to="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">How It Works</Link>
            <Link to="/model" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Model</Link>
            <Link to="/open-source" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Open Source</Link>
            <Link to="/docs" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Documentation</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <Link to="/analyze" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
              Analyze ECG
            </Link>
          </div>

          <button className="md:hidden p-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
`,
  'src/components/layout/Footer.tsx': `import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <Activity className="h-6 w-6 text-blue-500" />
          <span className="font-bold text-xl tracking-tight text-white">DeepECG</span>
        </Link>
        <p className="text-sm max-w-md mb-8">
          Deep Learning & Transfer Learning for ECG Image Classification
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 text-sm">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/analyze" className="hover:text-white transition-colors">Analyze ECG</Link>
          <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link to="/model" className="hover:text-white transition-colors">Model</Link>
          <Link to="/open-source" className="hover:text-white transition-colors">Open Source</Link>
          <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Disclaimer</a>
        </div>
        <div className="w-full border-t border-slate-800 pt-8 flex flex-col items-center">
          <p className="mb-2">© 2026 DeepECG. Open-source academic project.</p>
          <p className="text-xs text-amber-500/80 font-medium">Not a medical diagnostic device.</p>
        </div>
      </div>
    </footer>
  );
}
`,
  'src/pages/Home.tsx': `import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, ScanLine, BrainCircuit, FileSearch } from 'lucide-react';

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32">
        <div className="absolute inset-0 bg-blue-50/50 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Open Source</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Deep Learning</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">ECG Image Classification</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              AI-Powered ECG <span className="text-blue-600 block">Image Analysis</span> for Cardiovascular Disease Prediction
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Analyze ECG images using deep learning and transfer learning. Verify image quality before analysis, classify ECG patterns into four categories, and generate a detailed prediction report through an accessible open-source platform.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/analyze" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-transparent rounded-xl text-base font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                Analyze ECG
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
              </Link>
              <Link to="/model" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-slate-300 rounded-xl text-base font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all hover:-translate-y-0.5">
                Explore the Research
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-lg lg:max-w-none relative"
          >
            <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-200 overflow-hidden">
              <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              </div>
              <div className="p-8 flex flex-col items-center justify-center min-h-[300px] relative">
                {/* Simulated interface */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 opacity-50"></div>
                <div className="relative w-full z-10 flex flex-col items-center space-y-6">
                  
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="w-full max-w-[280px] p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-between"
                  >
                     <div className="flex items-center gap-3">
                       <div className="bg-blue-50 p-2 rounded-lg"><Activity className="w-5 h-5 text-blue-600" /></div>
                       <div>
                         <div className="text-xs text-slate-500 font-medium">Input</div>
                         <div className="text-sm font-semibold text-slate-800">ECG Image</div>
                       </div>
                     </div>
                     <ScanLine className="w-5 h-5 text-slate-300" />
                  </motion.div>

                  <div className="h-4 w-px border-l-2 border-dashed border-slate-200"></div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="w-full max-w-[280px] p-4 bg-white rounded-xl shadow-sm border border-emerald-100 flex items-center justify-between"
                  >
                     <div className="flex items-center gap-3">
                       <div className="bg-emerald-50 p-2 rounded-lg"><ScanLine className="w-5 h-5 text-emerald-600" /></div>
                       <div>
                         <div className="text-xs text-slate-500 font-medium">Quality Check</div>
                         <div className="text-sm font-semibold text-emerald-700">Passed</div>
                       </div>
                     </div>
                  </motion.div>

                  <div className="h-4 w-px border-l-2 border-dashed border-slate-200"></div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="w-full max-w-[280px] p-4 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-between"
                  >
                     <div className="flex items-center gap-3">
                       <div className="bg-red-50 p-2 rounded-lg"><BrainCircuit className="w-5 h-5 text-red-600" /></div>
                       <div>
                         <div className="text-xs text-slate-500 font-medium">Prediction</div>
                         <div className="text-sm font-semibold text-red-600">Myocardial Infarction</div>
                       </div>
                     </div>
                     <span className="text-xs font-bold text-slate-400">MI</span>
                  </motion.div>

                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Platform Features</h2>
             <p className="text-slate-600 max-w-2xl mx-auto">An open-source deep-learning ecosystem designed for simplicity and accuracy.</p>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Activity, title: 'ECG Classification', desc: 'Classify ECG images into four cardiac categories.' },
                { icon: ScanLine, title: 'Quality Checker', desc: 'Validate ECG image quality before prediction.' },
                { icon: BrainCircuit, title: 'Deep Learning', desc: 'Uses CNN/deep-learning based image classification.' },
                { icon: FileSearch, title: 'PDF Reports', desc: 'Generate downloadable comprehensive analysis reports.' }
              ].map((f, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-blue-100 hover:-translate-y-1 transition-all"
                >
                  <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm mb-6 border border-slate-100 text-blue-600">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-600 text-sm">{f.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>
      
      {/* 13. CLASSIFICATION SECTION */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Four ECG Classification Categories</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">The deep learning model places valid ECG images into one of four possible classes.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* NP */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
                <div className="absolute top-0 right-0 p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">NP</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">Normal Person</h3>
                <p className="text-slate-600 text-sm">ECG image classified by the model as Normal Person.</p>
              </div>

               {/* AH */}
               <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute top-0 right-0 p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">AH</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">Abnormal Heartbeat</h3>
                <p className="text-slate-600 text-sm">ECG image classified by the model as Abnormal Heartbeat.</p>
              </div>

              {/* MI */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-red-200 transition-colors">
                <div className="absolute top-0 right-0 p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">MI</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4 text-red-600">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-red-700 transition-colors">Myocardial Infarction</h3>
                <p className="text-slate-600 text-sm">ECG image classified by the model as Myocardial Infarction.</p>
              </div>

              {/* H.MI */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
                <div className="absolute top-0 right-0 p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">H.MI</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4 text-amber-500">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">History of Myocardial Infarction</h3>
                <p className="text-slate-600 text-sm">ECG image classified by the model as History of Myocardial Infarction.</p>
              </div>
            </div>
        </div>
      </section>

    </div>
  );
}
`,
  'src/pages/Dashboard.tsx': `import { Activity, Clock, AlertTriangle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">ECG Analysis Dashboard</h1>
        <p className="text-slate-500 mt-2">Monitor ECG analysis activity and prediction results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'ECGs Analyzed', value: '--', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Quality Pass Rate', value: '--%', icon: ScanLine, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Quality Issues', value: '--', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Reports Generated', value: '--', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={\`p-3 rounded-xl \${stat.bg}\`}>
                <stat.icon className={\`w-6 h-6 \${stat.color}\`} />
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center">
        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">No analyses yet</h3>
        <p className="text-slate-500 mt-2">Upload your first ECG to populate this dashboard.</p>
        <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          Analyze ECG
        </button>
      </div>
    </div>
  );
}
// just to make it compile with the icon
import { ScanLine } from 'lucide-react';
`,
  'src/pages/Analyze.tsx': `import { useState } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, FileImage, Loader2, Download, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

type SetupStep = 'upload' | 'quality' | 'analyze' | 'result';

export default function Analyze() {
  const [step, setStep] = useState<SetupStep>('upload');
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    setStep('quality');
    // simulated process
    setTimeout(() => {
      setStep('analyze');
      setTimeout(() => {
        setStep('result');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
         <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analyze ECG</h1>
         <p className="text-slate-500 mt-2">Upload an ECG image and let DeepECG evaluate its quality before classification.</p>
      </div>

      <div className="flex items-center justify-between relative mb-12">
        <div className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-slate-200 -z-10" />
        
        {['Upload ECG', 'Quality Check', 'AI Analysis', 'Results', 'Report'].map((label, idx) => {
          const stepMatch = 
            idx === 0 ? true : 
            idx === 1 ? step !== 'upload' : 
            idx === 2 ? step === 'analyze' || step === 'result' : 
            step === 'result';
            
          const isCurrent = 
            (idx === 0 && step === 'upload') ||
            (idx === 1 && step === 'quality') ||
            (idx === 2 && step === 'analyze') ||
            (idx >= 3 && step === 'result');

          return (
            <div key={label} className="flex flex-col items-center gap-3 relative z-10">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors",
                stepMatch 
                  ? "bg-blue-600 border-blue-600 text-white" 
                  : "bg-white border-slate-300 text-slate-400",
                isCurrent && "ring-4 ring-blue-100"
              )}>
                {stepMatch && !isCurrent ? <CheckCircle className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={cn(
                "text-xs font-semibold uppercase tracking-wider absolute top-12 whitespace-nowrap",
                isCurrent ? "text-blue-600" : "text-slate-400"
              )}>{label}</span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="border-2 border-dashed border-slate-300 rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-white hover:border-blue-400 transition-colors group cursor-pointer"
            onClick={handleUpload}
          >
            <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Upload ECG Image</h3>
            <p className="text-slate-500 mb-6">Drag and drop your ECG image here or <span className="text-blue-600 font-medium">Browse Files</span></p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Supported: PNG, JPG, JPEG • Max 10MB</p>
          </motion.div>
        )}

        {step === 'quality' && (
          <motion.div 
            key="quality"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center flex flex-col items-center"
          >
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Checking ECG Image Quality...</h3>
            <p className="text-slate-500">The system is analysing whether the image meets quality preconditions.</p>
          </motion.div>
        )}

        {step === 'analyze' && (
          <motion.div 
            key="analyze"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center flex flex-col items-center"
          >
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing ECG</h3>
            <p className="text-slate-500">The deep-learning pipeline is processing your ECG image.</p>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
             <div className="bg-red-500 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-8 justify-between shadow-lg shadow-red-200">
               <div>
                 <div className="text-red-100 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-300 animate-pulse" />
                   Model Prediction
                 </div>
                 <h2 className="text-4xl font-extrabold mb-4">Myocardial Infarction</h2>
                 <div className="flex items-center gap-6 text-sm">
                   <span className="bg-black/20 px-3 py-1.5 rounded-lg font-bold font-mono tracking-widest text-[#FFF]">CLASS: MI</span>
                   <span>Model Confidence: <strong>94.2%</strong></span>
                 </div>
               </div>
               <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm self-stretch flex items-center whitespace-nowrap border border-white/20">
                 <span className="text-xs uppercase font-bold text-white/80 tracking-widest bg-black/20 px-2 py-1 rounded">Demo Result</span>
               </div>
             </div>
             
             <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-slate-800 font-bold mb-6">Probability Distribution</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Normal Person', p: 2.4, color: 'bg-emerald-500' },
                      { name: 'Abnormal Heartbeat', p: 1.8, color: 'bg-blue-500' },
                      { name: 'Myocardial Infarction', p: 94.2, color: 'bg-red-500' },
                      { name: 'History of M.I.', p: 1.6, color: 'bg-amber-500' },
                    ].map(item => (
                      <div key={item.name} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-slate-700">{item.name}</span>
                          <span className="text-slate-900">{item.p}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <motion.div initial={{ width: 0 }} animate={{ width: \`\${item.p}%\` }} transition={{ duration: 1, ease: 'easeOut' }} className={\`h-2 rounded-full \${item.color}\`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
                  <h3 className="text-slate-800 font-bold mb-6">Action & Report</h3>
                  <div className="flex-1 flex flex-col justify-center gap-4">
                     <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-transform hover:-translate-y-0.5">
                       <Download className="w-5 h-5" />
                       Download PDF Report
                     </button>
                     <button onClick={() => setStep('upload')} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
                       Analyze Another ECG
                     </button>
                  </div>
                </div>
             </div>

             <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 flex items-start gap-3">
               <AlertTriangle className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
               <p><strong>Important:</strong> This system is an academic/research prototype for ECG image classification. Model predictions should not be considered a medical diagnosis or a substitute for evaluation by a qualified healthcare professional.</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
`,
  'src/pages/History.tsx': 'export default function History() { return <div className="p-8 text-slate-500">History page placeholder</div>; }',
  'src/pages/Reports.tsx': 'export default function Reports() { return <div className="p-8 text-slate-500">Reports page placeholder</div>; }',
  'src/pages/Model.tsx': 'export default function Model() { return <div className="p-8 text-slate-500">Model Insights placeholder</div>; }',
  'src/pages/HowItWorks.tsx': 'export default function HowItWorks() { return <div className="p-8 max-w-3xl mx-auto"><h1 className="text-3xl font-bold text-slate-900">How It Works</h1></div>; }',
  'src/pages/OpenSource.tsx': 'export default function OpenSource() { return <div className="p-8 max-w-3xl mx-auto"><h1 className="text-3xl font-bold text-slate-900">Open Source</h1></div>; }',
  'src/pages/Docs.tsx': 'export default function Docs() { return <div className="p-8 max-w-3xl mx-auto"><h1 className="text-3xl font-bold text-slate-900">Documentation</h1></div>; }',
};

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(__dirname, file), content);
});

console.log('Scaffolding complete.');
