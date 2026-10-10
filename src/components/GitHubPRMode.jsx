import React, { useState } from 'react';
import { 
  GitPullRequest, 
  GitCommit, 
  CheckCircle, 
  MessageSquare, 
  Check, 
  Sparkles, 
  Send, 
  CornerDownRight, 
  FileCode,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundEffects';

export function GitHubPRMode({ scenario, harmonizedData, onNotify }) {
  const [activeTab, setActiveTab] = useState('files');
  const [isCommitted, setIsCommitted] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');

  const handleCommitSuggestion = () => {
    sounds.playCommitCelebration();
    setIsCommitted(true);
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#238636', '#2ea043', '#00f2fe']
    });
    onNotify?.(`Committed suggestion to ${scenario.branch}! Commit SHA: 4f89b2c`);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sounds.playTick();
    setReplies(prev => [...prev, {
      author: 'you (author)',
      time: 'Just now',
      text: replyText
    }]);
    setReplyText('');
    onNotify?.('Reply posted to PR review thread!');
  };

  return (
    <div className="github-pr-wrapper">
      {/* GitHub PR Header */}
      <div className="gh-header">
        <div className="gh-title-row">
          <h1 className="gh-pr-title">
            Optimize transaction reconciliation engine &amp; eliminate quadratic lookup
          </h1>
          <span className="gh-pr-number">#{scenario.prNumber}</span>
        </div>
        <div className="gh-status-row">
          <span className="gh-badge-open">
            <GitPullRequest size={14} />
            Open
          </span>
          <span>
            <strong>flow-reviewer</strong> wants to merge into <code style={{ color: '#58a6ff' }}>main</code> from <code style={{ color: '#58a6ff' }}>{scenario.branch}</code>
          </span>
        </div>

        {/* GitHub Navigation Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', borderBottom: '1px solid #30363d', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('conversation')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'conversation' ? '#f0f6fc' : '#8b949e',
              borderBottom: activeTab === 'conversation' ? '2px solid #f78166' : 'none',
              padding: '0.4rem 0.6rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MessageSquare size={14} />
            Conversation <span style={{ background: '#30363d', padding: '1px 6px', borderRadius: '10px', fontSize: '0.72rem' }}>{1 + replies.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'files' ? '#f0f6fc' : '#8b949e',
              borderBottom: activeTab === 'files' ? '2px solid #f78166' : 'none',
              padding: '0.4rem 0.6rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileCode size={14} />
            Files changed <span style={{ background: '#30363d', padding: '1px 6px', borderRadius: '10px', fontSize: '0.72rem' }}>1</span>
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#3fb950' }}>
            <CheckCircle size={14} /> All CI checks passing
          </div>
        </div>
      </div>

      {/* Main File Diff & Inline Comment Body */}
      <div style={{ padding: '1.5rem' }}>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ padding: '0.5rem 1rem', background: '#161b22', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#f0f6fc' }}>
              {scenario.filename}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
              Diff hunk @@ -11,18 +11,18 @@
            </span>
          </div>

          {/* GitHub Inline Review Comment */}
          <div className="gh-inline-comment">
            <div className="gh-comment-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  color: '#07090e',
                  fontWeight: 800
                }}>
                  FA
                </span>
                <strong style={{ color: '#f0f6fc' }}>flow-audit-bot</strong>
                <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>reviewed via Voice-to-Diff</span>
              </div>
              <span style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                Harmonized Tone: {harmonizedData.title}
              </span>
            </div>

            <div className="gh-comment-body">
              <div style={{ color: '#e6edf3', fontSize: '0.88rem', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {harmonizedData.comment}
              </div>

              {/* Authentic GitHub Suggested Change Card */}
              <div className="gh-suggestion-box">
                <div className="gh-suggestion-top">
                  <span>Suggested change</span>
                  {!isCommitted ? (
                    <button
                      onClick={handleCommitSuggestion}
                      className="gh-btn-commit"
                    >
                      <GitCommit size={13} />
                      Commit suggestion
                    </button>
                  ) : (
                    <span style={{ color: '#3fb950', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                      <Check size={14} />
                      Committed in 4f89b2c
                    </span>
                  )}
                </div>

                <div className="diff-lines" style={{ background: '#0d1117', padding: '0.5rem 0' }}>
                  {scenario.suggestedReplacement.split('\n').map((line, idx) => (
                    <div key={idx} className="diff-row add" style={{ padding: '0 1rem' }}>
                      <span className="diff-sign" style={{ color: '#3fb950' }}>+</span>
                      <span className="diff-code" style={{ color: '#e6edf3' }}>{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thread replies */}
              {replies.length > 0 && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #30363d', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {replies.map((rep, idx) => (
                    <div key={idx} style={{ background: '#0d1117', padding: '0.6rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b949e', fontSize: '0.72rem', marginBottom: '4px' }}>
                        <strong>{rep.author}</strong>
                        <span>{rep.time}</span>
                      </div>
                      <div style={{ color: '#c9d1d9' }}>{rep.text}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add reply form */}
              <form onSubmit={handleSendReply} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '0.45rem 0.8rem',
                    color: '#f0f6fc',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#238636',
                    color: 'white',
                    border: 'none',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Send size={13} /> Reply
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
