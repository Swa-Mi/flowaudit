import React from 'react';
import { Eye, MousePointerClick, Zap } from 'lucide-react';

export function CodeViewer({ 
  code, 
  filename, 
  language, 
  highlightRange = [11, 28], 
  onSelectRange,
  isAnalyzing = false,
  onUpdateCode
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editBuffer, setEditBuffer] = React.useState(code);

  React.useEffect(() => {
    setEditBuffer(code);
  }, [code]);

  const lines = code.split('\n');

  // Syntax highlighting tokenizer helper for presentation
  const highlightSyntax = (text) => {
    // Comments
    if (text.trim().startsWith('//') || text.trim().startsWith('/*') || text.trim().startsWith('*')) {
      return <span style={{ color: '#64748b', fontStyle: 'italic' }}>{text}</span>;
    }
    
    // Quick keyword coloring
    const parts = text.split(/(\b(?:import|export|class|const|let|var|function|return|for|if|else|break|continue|new|type|interface|public|private|async|await|package)\b|'.*?'|".*?"|`.*?`|\b(?:Transaction|UserAccount|ReconciliationResult|Map|Set|Array|Promise|Error)\b)/g);

    return parts.map((part, idx) => {
      if (/^(import|export|class|const|let|var|function|return|for|if|else|break|continue|new|type|interface|public|private|async|await|package)$/.test(part)) {
        return <span key={idx} style={{ color: '#c084fc', fontWeight: 600 }}>{part}</span>;
      }
      if (/^('.*?'|".*?"|`.*?`)$/.test(part)) {
        return <span key={idx} style={{ color: '#a7f3d0' }}>{part}</span>;
      }
      if (/^(Transaction|UserAccount|ReconciliationResult|Map|Set|Array|Promise|Error)$/.test(part)) {
        return <span key={idx} style={{ color: '#38bdf8' }}>{part}</span>;
      }
      if (/^\b\d+\b$/.test(part)) {
        return <span key={idx} style={{ color: '#fb923c' }}>{part}</span>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const handleLineClick = (lineNum) => {
    if (!onSelectRange) return;
    if (Math.abs(lineNum - highlightRange[0]) < Math.abs(lineNum - highlightRange[1])) {
      onSelectRange([lineNum, highlightRange[1]]);
    } else {
      onSelectRange([highlightRange[0], lineNum]);
    }
  };

  const handleSaveBuffer = () => {
    if (onUpdateCode) onUpdateCode(editBuffer);
    setIsEditing(false);
  };

  return (
    <div className="code-container">
      {/* Floating Action Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        right: '1rem',
        float: 'right',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => {
            if (isEditing) handleSaveBuffer();
            else setIsEditing(true);
          }}
          style={{
            padding: '3px 10px',
            borderRadius: '9999px',
            background: isEditing ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: isEditing ? '#07090e' : '#f8fafc',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)'
          }}
        >
          {isEditing ? 'Save Buffer' : 'Paste from VS Code'}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '4px 12px',
          borderRadius: '9999px',
          background: 'rgba(0, 242, 254, 0.15)',
          border: '1px solid rgba(0, 242, 254, 0.4)',
          backdropFilter: 'blur(8px)',
          fontSize: '0.72rem',
          color: '#00f2fe',
          fontWeight: 600,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
        }}>
          <Zap size={13} />
          Target Span: L{highlightRange[0]}–L{highlightRange[1]} ({highlightRange[1] - highlightRange[0] + 1} lines)
        </div>
      </div>

      {isEditing ? (
        <div style={{ padding: '1rem' }}>
          <textarea
            value={editBuffer}
            onChange={(e) => setEditBuffer(e.target.value)}
            style={{
              width: '100%',
              minHeight: '400px',
              background: '#07090e',
              border: '1px solid #00f2fe',
              borderRadius: '8px',
              color: '#f8fafc',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              padding: '1rem',
              lineHeight: 1.6,
              outline: 'none',
              resize: 'vertical'
            }}
            placeholder="Paste code snippet from your VS Code editor..."
          />
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSaveBuffer}
              className="btn-primary"
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            >
              Apply to Viewer
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        lines.map((line, index) => {
          const lineNum = index + 1;
          const isSelected = lineNum >= highlightRange[0] && lineNum <= highlightRange[1];
          const isBottleneckLine = line.includes('this.userCatalog.entries()') || line.includes('await client.capturePayment') || line.includes('activeRoles.length');

          return (
            <div
              key={index}
              className={`code-line ${isSelected ? 'highlighted' : ''} ${isBottleneckLine ? 'bottleneck-highlight' : ''}`}
              onClick={() => handleLineClick(lineNum)}
              title="Click to adjust highlight range"
            >
              <div className="line-num">{lineNum}</div>
              <div className="line-text">{highlightSyntax(line)}</div>

              {lineNum === highlightRange[0] && (
                <span style={{
                  fontSize: '0.68rem',
                  color: '#00f2fe',
                  fontWeight: 600,
                  background: 'rgba(0, 242, 254, 0.1)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  marginLeft: 'auto',
                  alignSelf: 'center',
                  userSelect: 'none'
                }}>
                  Cursor Anchor
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
