import React, { useState } from 'react';
import { Mic, MicOff, Zap, X, Minimize2, Maximize2, Radio } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';
import { sounds } from '../services/soundEffects';

export function VSCodeCompanionOverlay({
  isListening,
  onToggleMic,
  rawTranscript,
  activeFile,
  highlightRange,
  onOpenStudio
}) {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <div 
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          background: 'rgba(13, 20, 36, 0.95)',
          border: '1px solid #00f2fe',
          borderRadius: '9999px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)'
        }}
      >
        <Radio size={14} color="#00f2fe" />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>Flow Companion Dock</span>
      </div>
    );
  }

  return (
    <div className="vscode-dock-pill">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onToggleMic}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: 'none',
            background: isListening ? '#f43f5e' : 'linear-gradient(135deg, #00f2fe, #4facfe)',
            color: isListening ? '#ffffff' : '#07090e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isListening ? '0 0 15px rgba(244, 63, 94, 0.6)' : '0 0 15px rgba(0, 242, 254, 0.4)'
          }}
          title={isListening ? 'Stop listening' : 'Start voice-to-diff'}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
              Flow VS Code Companion
            </span>
            <span style={{ fontSize: '0.65rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 5px', borderRadius: '4px' }}>
              IPC Live
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            Tracking cursor: {activeFile} (L{highlightRange[0]}–L{highlightRange[1]})
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
        <button
          onClick={onOpenStudio}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            color: '#00f2fe',
            padding: '3px 8px',
            fontSize: '0.7rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Open Studio
        </button>
        <button
          onClick={() => setMinimized(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer'
          }}
          title="Minimize dock"
        >
          <Minimize2 size={13} />
        </button>
      </div>
    </div>
  );
}
