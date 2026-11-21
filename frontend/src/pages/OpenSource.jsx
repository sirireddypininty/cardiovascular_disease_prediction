import { GitFork, Star, GitBranch, ExternalLink } from 'lucide-react';

export default function OpenSource() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest mono mb-3" style={{ color: '#059669' }}>Open Source</p>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4" style={{ color: '#0F172A' }}>Open Source</h1>
        <p className="max-w-xl mx-auto" style={{ color: '#64748B' }}>
          DeepECG is fully open-source and built for the research community. Contribute, fork, or build on top of it.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        {[
          { icon: GitFork,   label: 'MIT License',  desc: 'Free to use for research and education.', color: '#059669' },
          { icon: Star,      label: 'Open Weights',  desc: 'Model weights and training code available.', color: '#F59E0B' },
          { icon: GitBranch, label: 'Contributions', desc: 'PRs, issues, and discussions welcome.', color: '#047857' },
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${item.color}0a`, border: `1px solid ${item.color}30` }}
            >
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <h3 className="font-bold mb-1.5" style={{ color: '#0F172A' }}>{item.label}</h3>
            <p className="text-sm" style={{ color: '#64748B' }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-stream inline-flex items-center gap-2"
        >
          <GitFork className="w-4 h-4" />
          View on GitHub
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
