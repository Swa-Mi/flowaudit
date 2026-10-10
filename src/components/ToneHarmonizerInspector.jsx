import React from 'react';
import { 
  HeartHandshake, 
  Zap, 
  Building2, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

export function ToneHarmonizerInspector({
  rawTranscript,
  selectedTone,
  onSelectTone,
  harmonizedData,
  toneMetrics
}) {
  const tones = [
    { key: 'diplomatic', label: 'Diplomatic & Mentoring', icon: HeartHandshake, color: '#10b981' },
    { key: 'direct', label: 'Direct & Concise', icon: Zap, color: '#00f2fe' },
    { key: 'architect', label: 'Senior Staff Architect', icon: Building2, color: '#8b5cf6' },
    { key: 'socratic', label: 'Socratic Inquiry', icon: HelpCircle, color: '#f59e0b' }
  ];

  const handleToneChange = (key) => {
    sounds.playTick();
    onSelectTone(key);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Tone Mode Selector Bar */}
      <div className="tone-controls-bar">
        <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginRight: '0.5rem' }}>
          Harmonizer Tone:
        </span>
        {tones.map(({ key, label, icon: Icon, color }) => {
          const isActive = selectedTone === key;
          return (
            <button
              key={key}
              onClick={() => handleToneChange(key)}
              className={`tone-pill-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={14} color={isActive ? color : '#94a3b8'} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tone Sentiment & Politeness Metrics */}
      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-label">Politeness Score</span>
          <div className="metric-value-box">
            <span className="metric-number" style={{ color: '#10b981' }}>
              {harmonizedData?.metrics?.politeness || 98}%
            </span>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
              (was {toneMetrics?.rawPoliteness || 35}%)
            </span>
          </div>
          <div className="metric-bar-wrap">
            <div 
              className="metric-bar-fill" 
              style={{ width: `${harmonizedData?.metrics?.politeness || 98}%` }} 
            />
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Clarity & Signal</span>
          <div className="metric-value-box">
            <span className="metric-number" style={{ color: '#00f2fe' }}>
              {harmonizedData?.metrics?.clarity || 96}%
            </span>
          </div>
          <div className="metric-bar-wrap">
            <div 
              className="metric-bar-fill" 
              style={{ width: `${harmonizedData?.metrics?.clarity || 96}%`, background: 'linear-gradient(90deg, #00f2fe, #38bdf8)' }} 
            />
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Actionability</span>
          <div className="metric-value-box">
            <span className="metric-number" style={{ color: '#a855f7' }}>
              100%
            </span>
            <span style={{ fontSize: '0.68rem', color: '#10b981', display: 'flex', alignItems: 'center' }}>
              <TrendingUp size={11} /> Ready
            </span>
          </div>
          <div className="metric-bar-wrap">
            <div 
              className="metric-bar-fill" 
              style={{ width: '100%', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }} 
            />
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Bluntness Filter</span>
          <div className="metric-value-box">
            <span className="metric-number" style={{ color: '#f59e0b', fontSize: '0.95rem' }}>
              Normalized
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            Zero toxic or rushed idioms
          </span>
        </div>
      </div>

      {/* Harmonized Review Text Preview */}
      <div className="suggestion-card">
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={13} />
              Harmonized Peer Review Commentary
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Mode: {harmonizedData?.title}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#e2e8f0', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {harmonizedData?.comment}
          </div>
        </div>
      </div>
    </div>
  );
}
