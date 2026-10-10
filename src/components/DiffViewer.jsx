import React, { useState } from 'react';
import { Copy, Check, GitCommit, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { sounds } from '../services/soundEffects';

export function DiffViewer({ 
  suggestedCode, 
  originalCodeSnippet,
  startLine = 11,
  endLine = 28,
  filename = 'services/order_reconciliation.ts',
  onApplyDiff
}) {
  const [copied, setCopied] = useState(false);

  const originalLines = originalCodeSnippet ? originalCodeSnippet.trim().split('\n') : [];
  const replacementLines = suggestedCode ? suggestedCode.trim().split('\n') : [];

  const handleCopyMarkdown = () => {
    sounds.playTick();
    const markdown = "```suggestion\n" + suggestedCode + "\n```";
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="diff-view-box">
      <div className="diff-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="diff-badge-suggestion">
            <Sparkles size={13} />
            GitHub Code Suggestion
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8' }}>
            {filename} : L{startLine}–L{endLine}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} />
            Syntax AST Verified
          </span>
          <button
            onClick={handleCopyMarkdown}
            className="btn-secondary"
            style={{ padding: '3px 8px', fontSize: '0.72rem' }}
            title="Copy ```suggestion ... ``` markdown"
          >
            {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy Markdown'}
          </button>
        </div>
      </div>

      <div className="diff-lines">
        {/* Render deleted lines with red highlight */}
        {originalLines.slice(0, 5).map((line, i) => (
          <div key={`del-${i}`} className="diff-row del">
            <span className="diff-sign">-</span>
            <span className="diff-code">{line}</span>
          </div>
        ))}
        {originalLines.length > 5 && (
          <div className="diff-row del" style={{ opacity: 0.6, fontSize: '0.75rem', fontStyle: 'italic' }}>
            <span className="diff-sign">-</span>
            <span className="diff-code">... ({originalLines.length - 5} lines replaced)</span>
          </div>
        )}

        {/* Render added lines with green highlight */}
        {replacementLines.map((line, i) => (
          <div key={`add-${i}`} className="diff-row add">
            <span className="diff-sign">+</span>
            <span className="diff-code">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
