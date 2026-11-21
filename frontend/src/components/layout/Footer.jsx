import { Link } from 'react-router-dom';
import { Activity, GitFork, MessageCircle, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="p-1.5 rounded-lg"
                style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)' }}
              >
                <Activity className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <span className="font-bold text-lg" style={{ color: '#0F172A' }}>
                Deep<span style={{ color: '#059669' }}>ECG</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: '#64748B', maxWidth: '260px' }}>
              Deep Learning &amp; Transfer Learning for ECG Image Classification. Open-source academic research platform.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
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
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
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
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#94A3B8' }}>Platform</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Home',          href: '/' },
                { label: 'Analyze ECG',  href: '/analyze' },
                { label: 'Dashboard',    href: '/dashboard' },
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'Model',        href: '/model' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: '#64748B' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#059669')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#94A3B8' }}>Resources</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Open Source',    href: '/open-source' },
                { label: 'Documentation', href: '/docs' },
                { label: 'Privacy',       href: '#' },
                { label: 'Disclaimer',    href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-sm inline-flex items-center gap-1 transition-colors duration-200"
                    style={{ color: '#64748B' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#059669')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
                  >
                    {label}
                    {href !== '#' && <ExternalLink className="w-3 h-3 opacity-50" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="stream-divider mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: '#94A3B8' }}>
          <p>© 2026 DeepECG. Open-source academic project.</p>
          <p
            className="mono px-2 py-1 rounded"
            style={{
              color: '#F59E0B',
              background: '#FFFBEB',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            ⚠ Not a medical diagnostic device
          </p>
        </div>
      </div>
    </footer>
  );
}
