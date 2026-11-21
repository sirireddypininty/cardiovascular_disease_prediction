import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { Activity, BarChart2, Clock, FileText, Lightbulb, BookOpen, GitFork } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const sidebarLinks = [
  { name: 'Overview',       href: '/dashboard', icon: BarChart2 },
  { name: 'Analyze ECG',   href: '/analyze',   icon: Activity },
  { name: 'History',        href: '/history',   icon: Clock },
  { name: 'Reports',        href: '/reports',   icon: FileText },
  { name: 'Model Insights', href: '/model',     icon: Lightbulb },
  { name: 'Documentation',  href: '/docs',      icon: BookOpen },
];

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F8FAFC', color: '#0F172A' }}>
      <Navbar />

      <div className="flex flex-1 overflow-hidden max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 gap-6">

        {/* Sidebar */}
        <aside
          className="hidden md:flex flex-col w-60 sticky top-24 h-[calc(100vh-8rem)] p-3 rounded-2xl shrink-0"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: '#94A3B8' }}>
            Navigation
          </p>

          <nav className="flex-1 space-y-0.5">
            {sidebarLinks.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn('nav-item', isActive && 'active')}
                >
                  <item.icon
                    className="w-4 h-4 shrink-0"
                    style={{ color: isActive ? '#059669' : '#94A3B8' }}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-3 space-y-0.5" style={{ borderTop: '1px solid #E2E8F0' }}>
            <Link to="/docs" className="nav-item">
              <BookOpen className="w-4 h-4 shrink-0" style={{ color: '#94A3B8' }} />
              Documentation
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-item"
            >
              <GitFork className="w-4 h-4 shrink-0" style={{ color: '#94A3B8' }} />
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
