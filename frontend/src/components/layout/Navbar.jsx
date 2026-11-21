import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, GitFork, Menu, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const navLinks = [
  { label: 'Home',           href: '/' },
  { label: 'Analyze ECG',   href: '/analyze' },
  { label: 'Dashboard',     href: '/dashboard' },
  { label: 'How It Works',  href: '/how-it-works' },
  { label: 'Model',         href: '/model' },
  { label: 'Open Source',   href: '/open-source' },
  { label: 'Docs',          href: '/docs' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full"
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Top accent line */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #059669 40%, #065F46 70%, transparent)', opacity: 0.8 }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="relative p-1.5 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(5,150,105,0.1), rgba(6,95,70,0.1))',
                  border: '1px solid rgba(5,150,105,0.25)',
                }}
              >
                <Activity className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <span className="font-bold text-lg tracking-tight" style={{ color: '#0F172A' }}>
                Deep<span style={{ color: '#059669' }}>ECG</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, href }) => {
                const isActive = location.pathname === href;
                return (
                  <Link
                    key={href}
                    to={href}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'text-[#059669] bg-[rgba(5,150,105,0.08)]'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[rgba(0,0,0,0.03)]'
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid #E2E8F0', color: '#64748B' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#059669';
                  e.currentTarget.style.borderColor = 'rgba(5,150,105,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#64748B';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <GitFork className="w-4 h-4" />
              </a>
              <Link
                to="/analyze"
                className="btn-stream inline-flex items-center gap-1.5 text-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                Analyze ECG
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: '#64748B' }}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden sticky top-16 z-40 overflow-hidden"
            style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    location.pathname === href
                      ? 'text-[#059669] bg-[rgba(5,150,105,0.08)]'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  )}
                >
                  {label}
                </Link>
              ))}
              <div className="stream-divider my-2" />
              <Link
                to="/analyze"
                onClick={() => setMobileOpen(false)}
                className="btn-stream inline-flex items-center justify-center gap-2 text-sm"
              >
                <Zap className="w-4 h-4" />
                Analyze ECG
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
