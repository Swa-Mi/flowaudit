import React, { useState, useEffect, useRef } from 'react';
import { SCENARIOS } from './data/mockScenarios';
import { voiceService } from './services/speechService';
import { 
  analyzeToneMetrics, 
  generateHarmonizedComment, 
  formatGitHubSuggestionMarkdown 
} from './services/toneHarmonizer';
import { sounds } from './services/soundEffects';

import { Navbar } from './components/Navbar';
import { AudioWaveform } from './components/AudioWaveform';
import { CodeViewer } from './components/CodeViewer';
import { DiffViewer } from './components/DiffViewer';
import { ToneHarmonizerInspector } from './components/ToneHarmonizerInspector';
import { PlacementBoard } from './components/PlacementBoard';
import { GitHubPRMode } from './components/GitHubPRMode';
import { VSCodeCompanionOverlay } from './components/VSCodeCompanionOverlay';

import { 
  Mic, 
  MicOff, 
  Play, 
  Sparkles, 
  Check, 
  Copy, 
  Layers, 
  Send, 
  RotateCcw, 
  ArrowRight,
  Code2,
  GitPullRequest,
  CheckCircle2,
  Terminal,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const scenario = SCENARIOS[scenarioIndex];

  const [currentTab, setCurrentTab] = useState('studio'); // 'studio' | 'placement' | 'github'
  const [highlightRange, setHighlightRange] = useState(scenario.highlightRange);
  const [selectedTone, setSelectedTone] = useState('diplomatic');
  const [activeCode, setActiveCode] = useState(scenario.code);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [rawTranscript, setRawTranscript] = useState(scenario.defaultVoiceTranscript);
  const [audioData, setAudioData] = useState(null);
  const [activeVoicePreset, setActiveVoicePreset] = useState('default');

  // UI Telemetry
  const [notification, setNotification] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasGenerated, setHasGenerated] = useState(true);

  const audioLoopRef = useRef(null);
  const stopSimRef = useRef(null);

  // Sync highlight range and code when scenario changes
  useEffect(() => {
    setHighlightRange(scenario.highlightRange);
    setRawTranscript(scenario.defaultVoiceTranscript);
    setActiveCode(scenario.code);
    setActiveVoicePreset('default');
    setHasGenerated(true);
  }, [scenarioIndex]);

  // Derived harmonized comment & diff data
  const toneMetrics = analyzeToneMetrics(rawTranscript);
  const harmonizedData = generateHarmonizedComment(rawTranscript, selectedTone, scenario);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3200);
  };

  // Toggle Live Microphone
  const handleToggleMic = async () => {
    if (isRecording) {
      voiceService.stopNativeListening();
      setIsRecording(false);
      sounds.playMicStop();
      if (audioLoopRef.current) cancelAnimationFrame(audioLoopRef.current);
      setHasGenerated(true);
      sounds.playDiffGenerated();
      showNotification('Voice processed & code suggestion generated!');
    } else {
      sounds.playMicStart();
      setRawTranscript('');
      setIsRecording(true);
      setHasGenerated(false);

      const hasMic = await voiceService.startMicAudioAnalysis();
      if (hasMic) {
        const loop = () => {
          const freqs = voiceService.getAudioFrequencies();
          if (freqs) setAudioData(freqs);
          audioLoopRef.current = requestAnimationFrame(loop);
        };
        loop();
      }

      voiceService.startNativeListening(
        (transcript, isFinal) => {
          setRawTranscript(transcript);
          if (isFinal) {
            sounds.playTick();
          }
        },
        (error) => {
          console.warn('Speech error:', error);
          showNotification('Switched to simulated voice capture stream.');
        }
      );
    }
  };

  // The 8-Second "Wow Moment" Voice Simulation
  const triggerEightSecondWowDemo = (presetType = 'default') => {
    if (isSimulating || isRecording) return;

    sounds.playMicStart();
    setIsSimulating(true);
    setSimProgress(0);
    setHasGenerated(false);
    setActiveVoicePreset(presetType);

    const targetScript = presetType === 'blunt' 
      ? scenario.bluntVoiceTranscript 
      : scenario.defaultVoiceTranscript;

    setRawTranscript('');

    const cancel = voiceService.startSimulatedVoice(
      targetScript,
      (currentText) => {
        setRawTranscript(currentText);
        sounds.playTick();
      },
      (fullText) => {
        setIsSimulating(false);
        setSimProgress(100);
        setHasGenerated(true);
        sounds.playDiffGenerated();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#00f2fe', '#10b981', '#38bdf8']
        });
        showNotification('8-Second Voice Captured: Generated Syntactically Correct Diff & Harmonized Tone!');
      },
      (prog) => {
        setSimProgress(prog);
      }
    );

    stopSimRef.current = cancel;
  };

  const handleCopySuggestionMarkdown = () => {
    sounds.playTick();
    const md = formatGitHubSuggestionMarkdown(
      harmonizedData.comment,
      scenario.suggestedReplacement,
      highlightRange[0],
      highlightRange[1],
      scenario.filename
    );
    navigator.clipboard.writeText(md);
    showNotification('Copied full GitHub Review Suggestion Markdown!');
  };

  const handleDirectPostToPR = () => {
    sounds.playDiffGenerated();
    confetti({
      particleCount: 60,
      spread: 75,
      origin: { y: 0.75 },
      colors: ['#238636', '#10b981', '#00f2fe']
    });
    showNotification(`Suggestion posted to PR #${scenario.prNumber}! Opening GitHub view...`);
    setTimeout(() => {
      setCurrentTab('github');
    }, 600);
  };

  const handleToggleSound = () => {
    const next = sounds.toggle();
    setSoundEnabled(next);
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div className="toast-msg">
          <Sparkles size={16} color="#10b981" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onTriggerWowDemo={() => triggerEightSecondWowDemo('default')}
        isSimulating={isSimulating}
      />

      {/* Main Container */}
      <main className="main-content">
        {/* Scenario and Target PR Context Bar */}
        <div className="studio-hero">
          <div className="hero-left">
            <h1 className="hero-title">
              Flow Audit Desktop Companion
              <span className="badge-version">PR #{scenario.prNumber}</span>
            </h1>
            <p className="hero-sub">
              Talk naturally while your eyes and cursor follow the code &bull; Instant Voice-to-Diff with Tone Harmonizer
            </p>
          </div>

          <div className="hero-scenario-selector">
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Scenario:</span>
            <select
              value={scenarioIndex}
              onChange={(e) => setScenarioIndex(Number(e.target.value))}
              className="scenario-select"
            >
              {SCENARIOS.map((sc, idx) => (
                <option key={sc.id} value={idx}>
                  {sc.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab 1: Interactive Studio */}
        {currentTab === 'studio' && (
          <div className="studio-grid">
            {/* Left Column: Target Code Canvas with Cursor & Voice HUD */}
            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title-area">
                  <Terminal size={16} color="#00f2fe" />
                  <span className="panel-title">Active VS Code Editor</span>
                  <span className="panel-badge">{scenario.filename}</span>
                </div>
                <div className="panel-actions">
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Language: <strong style={{ color: '#94a3b8' }}>{scenario.language}</strong>
                  </span>
                </div>
              </div>

              {/* Code Canvas with Line Highlights */}
              <CodeViewer
                code={activeCode}
                filename={scenario.filename}
                language={scenario.language}
                highlightRange={highlightRange}
                onSelectRange={setHighlightRange}
                onUpdateCode={(newCode) => {
                  setActiveCode(newCode);
                  showNotification('Updated active code buffer!');
                }}
              />

              {/* Spoken Voice HUD */}
              <div className="voice-hud">
                <div className="voice-hud-top">
                  <div className="mic-controls">
                    <button
                      onClick={handleToggleMic}
                      className={`mic-btn-main ${isRecording ? 'recording' : ''}`}
                      title={isRecording ? 'Stop recording' : 'Click to talk (Live mic)'}
                    >
                      {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                          {isRecording ? 'Listening (Live Mic)...' : isSimulating ? 'Simulating 8s Spoken Input...' : 'Voice-to-Diff Engine'}
                        </span>
                        <span className="badge-version">Web Audio</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {isRecording || isSimulating 
                          ? 'Streaming words to AST refactor pipeline...' 
                          : 'Highlight code & speak your review thoughts'}
                      </span>
                    </div>
                  </div>

                  {/* 8s Demo Quick Chips */}
                  <div className="audio-preset-tray">
                    <button
                      onClick={() => triggerEightSecondWowDemo('default')}
                      className={`preset-chip ${activeVoicePreset === 'default' ? 'active' : ''}`}
                      title="Run the 8-second spoken voice demo from the problem statement"
                    >
                      <Play size={11} />
                      8s Speech Sample (Prompt Quote)
                    </button>

                    <button
                      onClick={() => triggerEightSecondWowDemo('blunt')}
                      className={`preset-chip ${activeVoicePreset === 'blunt' ? 'active' : ''}`}
                      title="Run the blunt, frustrated dev review to see the tone harmonizer normalize it"
                    >
                      <Sparkles size={11} />
                      Rushed / Blunt Voice Input
                    </button>
                  </div>
                </div>

                {/* Animated Waveform Canvas */}
                <AudioWaveform
                  isRecording={isRecording}
                  isSimulating={isSimulating}
                  progress={simProgress}
                  audioData={audioData}
                />

                {/* Live Spoken Transcript Stream Box */}
                <div className="transcript-box">
                  <div className="transcript-header">
                    <span>Captured Raw Voice Stream</span>
                    {isSimulating && (
                      <span style={{ color: '#00f2fe' }}>Streaming: {simProgress}%</span>
                    )}
                  </div>
                  <div className={`transcript-body ${!rawTranscript ? 'empty' : ''}`}>
                    {rawTranscript ? `"${rawTranscript}"` : 'Listening... speak to suggest code change'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Tone Harmonizer Inspector & GitHub Suggestion Diff */}
            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title-area">
                  <Sparkles size={16} color="#10b981" />
                  <span className="panel-title">Tone Harmonizer &amp; Voice-to-Diff</span>
                </div>
                <div className="panel-actions">
                  <span className="panel-badge">
                    AST: Valid
                  </span>
                </div>
              </div>

              {/* Tone Harmonizer Inspector */}
              <ToneHarmonizerInspector
                rawTranscript={rawTranscript}
                selectedTone={selectedTone}
                onSelectTone={setSelectedTone}
                harmonizedData={harmonizedData}
                toneMetrics={toneMetrics}
              />

              {/* GitHub Code Suggestion Diff View */}
              <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
                <DiffViewer
                  suggestedCode={scenario.suggestedReplacement}
                  originalCodeSnippet={activeCode.split('\n').slice(highlightRange[0] - 1, highlightRange[1]).join('\n')}
                  startLine={highlightRange[0]}
                  endLine={highlightRange[1]}
                  filename={scenario.filename}
                />

                {/* Action Toolbar */}
                <div className="card-actions-bar" style={{ marginTop: '1rem' }}>
                  <button
                    onClick={handleDirectPostToPR}
                    className="btn-primary"
                  >
                    <Send size={14} />
                    Post to GitHub PR #{scenario.prNumber}
                  </button>

                  <button
                    onClick={() => setCurrentTab('placement')}
                    className="btn-secondary"
                  >
                    <Layers size={14} />
                    Open Placement Board
                  </button>

                  <button
                    onClick={handleCopySuggestionMarkdown}
                    className="btn-secondary"
                  >
                    <Copy size={14} />
                    Copy Suggestion Markdown
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Placement Board */}
        {currentTab === 'placement' && (
          <PlacementBoard
            scenario={scenario}
            harmonizedData={harmonizedData}
            highlightRange={highlightRange}
            onOpenPRTab={() => setCurrentTab('github')}
            onNotify={showNotification}
          />
        )}

        {/* Tab 3: GitHub PR Mode */}
        {currentTab === 'github' && (
          <GitHubPRMode
            scenario={scenario}
            harmonizedData={harmonizedData}
            onNotify={showNotification}
          />
        )}
      </main>

      {/* Floating VS Code Companion Overlay Dock */}
      <VSCodeCompanionOverlay
        isListening={isRecording || isSimulating}
        onToggleMic={handleToggleMic}
        rawTranscript={rawTranscript}
        activeFile={scenario.filename}
        highlightRange={highlightRange}
        onOpenStudio={() => setCurrentTab('studio')}
      />
    </div>
  );
}

export default App;
