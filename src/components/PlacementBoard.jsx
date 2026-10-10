import React, { useState } from 'react';
import { 
  GitPullRequest, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Send, 
  Code2, 
  Copy, 
  Check, 
  FileCode, 
  Sparkles, 
  ShieldAlert, 
  ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundEffects';

export function PlacementBoard({
  scenario,
  harmonizedData,
  highlightRange = [11, 28],
  onOpenPRTab,
  onNotify
}) {
  const [placedItems, setPlacedItems] = useState([
    {
      id: 'primary-suggestion',
      title: 'O(n²) Bottleneck & Dictionary Lookup Refactor',
      file: scenario.filename,
      range: `${highlightRange[0]}–${highlightRange[1]}`,
      type: 'Performance & Safety',
      status: 'pending', // pending | placed | applied
      hunk: `@@ -${highlightRange[0]},${highlightRange[1] - highlightRange[0] + 1} +${highlightRange[0]},16 @@`
    },
    {
      id: 'secondary-check',
      title: 'Defensive Null Check Guard',
      file: scenario.filename,
      range: `${highlightRange[0]}`,
      type: 'Defensive Invariant',
      status: 'merged',
      hunk: `@@ -${highlightRange[0]},3 +${highlightRange[0]},3 @@`
    }
  ]);

  const [copiedId, setCopiedId] = useState(null);

  const handlePostToPR = (item) => {
    sounds.playDiffGenerated();
    setPlacedItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'placed' } : p));
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00f2fe', '#10b981', '#38bdf8']
    });
    onNotify?.(`Posted inline suggestion to PR #${scenario.prNumber} at lines ${item.range}!`);
  };

  const handleApplyToVSCode = (item) => {
    sounds.playCommitCelebration();
    setPlacedItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'applied' } : p));
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.7 },
      colors: ['#10b981', '#00f2fe', '#8b5cf6']
    });
    onNotify?.(`Successfully applied refactor diff directly to local VS Code workspace!`);
  };

  const handleCopy = (item) => {
    sounds.playTick();
    const markdown = `${harmonizedData.comment}\n\n\`\`\`suggestion\n${scenario.suggestedReplacement}\n\`\`\``;
    navigator.clipboard.writeText(markdown);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
    onNotify?.('Copied GitHub suggestion markdown to clipboard!');
  };

  return (
    <div className="placement-container">
      {/* Top Banner with PR Context */}
      <div className="placement-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(0, 242, 254, 0.1)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00f2fe'
          }}>
            <GitPullRequest size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                PR #{scenario.prNumber}: Review Placement Board
              </h2>
              <span className="badge-version">Active Anchor</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
              Branch: <code style={{ color: '#00f2fe' }}>{scenario.branch}</code> &rarr; <code style={{ color: '#10b981' }}>main</code> • Target File: <code style={{ color: '#e2e8f0' }}>{scenario.filename}</code>
            </p>
          </div>
        </div>

        <button 
          onClick={onOpenPRTab}
          className="btn-secondary"
          style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
        >
          <ExternalLink size={14} />
          Open Full GitHub PR View
        </button>
      </div>

      {/* Main Placement Cards Grid */}
      <div className="placement-grid">
        {/* Left column: Selected placement hunk card */}
        <div className="placement-hunk-card">
          <div className="hunk-target-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={16} color="#00f2fe" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
                Anchor Hunk: Lines {highlightRange[0]}–{highlightRange[1]}
              </span>
              <span className="panel-badge">{scenario.filename}</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Live Diff Ready
            </span>
          </div>

          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Tone review prose */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                Harmonized Review Output
              </div>
              <div style={{ fontSize: '0.88rem', color: '#f1f5f9', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {harmonizedData?.comment}
              </div>
            </div>

            {/* GitHub Suggestion Box */}
            <div className="diff-view-box">
              <div className="diff-header">
                <span className="diff-badge-suggestion">
                  <Sparkles size={12} />
                  ```suggestion
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Target: Lines {highlightRange[0]}–{highlightRange[1]}
                </span>
              </div>
              <div className="diff-lines">
                {scenario.suggestedReplacement.split('\n').map((line, idx) => (
                  <div key={idx} className="diff-row add">
                    <span className="diff-sign">+</span>
                    <span className="diff-code">{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="card-actions-bar">
              <button 
                onClick={() => handlePostToPR(placedItems[0])}
                className="btn-primary"
              >
                <Send size={14} />
                Post Suggestion to GitHub PR #{scenario.prNumber}
              </button>

              <button 
                onClick={() => handleApplyToVSCode(placedItems[0])}
                className="btn-secondary"
                style={{ borderColor: 'rgba(0, 242, 254, 0.3)', color: '#00f2fe' }}
              >
                <Code2 size={14} />
                Direct Apply in Local VS Code
              </button>

              <button 
                onClick={() => handleCopy(placedItems[0])}
                className="btn-secondary"
              >
                {copiedId === placedItems[0].id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copiedId === placedItems[0].id ? 'Copied' : 'Copy Markdown'}
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Placement Queue & Status Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCode size={16} color="#00f2fe" />
              Review Suggestions Ledger
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Suggestions staged for this review session:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {placedItems.map(item => (
                <div 
                  key={item.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
                      {item.title}
                    </span>
                    {item.status === 'placed' && (
                      <span style={{ fontSize: '0.68rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={12} /> Placed on PR
                      </span>
                    )}
                    {item.status === 'applied' && (
                      <span style={{ fontSize: '0.68rem', color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={12} /> Applied to File
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span style={{ fontSize: '0.68rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={12} /> Ready to Place
                      </span>
                    )}
                    {item.status === 'merged' && (
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Sparkles size={12} /> Bundled
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', gap: '0.5rem' }}>
                    <span>Lines {item.range}</span>
                    <span>•</span>
                    <code>{item.hunk}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Companion Sync Stats */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Flow Engine Telemetry
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Voice Latency:</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>180ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Diff AST Integrity:</span>
                <span style={{ color: '#00f2fe', fontWeight: 600 }}>100% Valid</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tone Normalization:</span>
                <span style={{ color: '#a855f7', fontWeight: 600 }}>+63% Politeness</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
