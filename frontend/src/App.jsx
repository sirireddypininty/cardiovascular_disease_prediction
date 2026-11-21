import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Analyze from './pages/Analyze.jsx';
import History from './pages/History.jsx';
import Reports from './pages/Reports.jsx';
import Model from './pages/Model.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import OpenSource from './pages/OpenSource.jsx';
import Docs from './pages/Docs.jsx';

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
          <Route path="*" element={<Home />} />
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
