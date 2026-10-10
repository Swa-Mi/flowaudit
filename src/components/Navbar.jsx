import React from 'react';
import { 
  GitPullRequest, 
  Code2, 
  Volume2, 
  VolumeX, 
  Play, 
  Layers, 
  Terminal, 
  Radio,
  Sparkles
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

export function Navbar({ 
  currentTab, 
  onChangeTab, 
  soundEnabled, 
  onToggleSound, 
  onTriggerWowDemo,
  isSimulating
}) {
  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="nav-brand" onClick={() => onChangeTab('studio')}>
        <div className="brand-icon-box">
          <Terminal size={22} />
        </div>
        <div className="brand-titles">
          <div className="brand-name">
            Flow Audit
            <span className="badge-version">Companion v1.4</span>
          </div>
          <span className="brand-tagline">Voice-to-Diff &bull; Tone Harmonizer</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="nav-actions">
        <div className="nav-tabs">
          <button
            onClick={() => onChangeTab('studio')}
            className={`nav-tab-btn ${currentTab === 'studio' ? 'active' : ''}`}
          >
            <Code2 size={15} />
            <span>Interactive Studio</span>
          </button>

          <button
            onClick={() => onChangeTab('placement')}
            className={`nav-tab-btn ${currentTab === 'placement' ? 'active' : ''}`}
          >
            <Layers size={15} />
            <span>Placement Board</span>
          </button>

          <button
            onClick={() => onChangeTab('github')}
            className={`nav-tab-btn ${currentTab === 'github' ? 'active' : ''}`}
          >
            <GitPullRequest size={15} />
            <span>GitHub PR #418</span>
          </button>
        </div>

        {/* Live Status Indicators */}
        <div className="status-pill">
          <span className="pulse-dot"></span>
          <span>VS Code &amp; GitHub Sync</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="btn-secondary"
          style={{ padding: '0.45rem', borderRadius: '50%' }}
          title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} color="#64748b" />}
        </button>

        {/* The 8-Second Wow Moment Action Button */}
        <button
          onClick={onTriggerWowDemo}
          className="btn-wow-quick"
          disabled={isSimulating}
          title="Highlight 20-line function, speak 8 seconds, and generate instant PR suggestion"
        >
          <Sparkles size={15} />
          <span>{isSimulating ? 'Speaking (8s)...' : '8s Voice Demo'}</span>
        </button>
      </div>
    </nav>
  );
}
