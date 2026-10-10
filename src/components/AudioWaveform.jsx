import React, { useEffect, useRef } from 'react';

export function AudioWaveform({ isRecording, isSimulating, progress = 0, audioData = null }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background subtle grid/meter lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const bars = 48;
      const barWidth = width / bars - 2;

      phaseRef.current += isRecording || isSimulating ? 0.15 : 0.03;

      for (let i = 0; i < bars; i++) {
        let barHeight = 4; // Idle height

        if (isRecording && audioData && audioData.length > 0) {
          // Real microphone frequency data
          const dataIdx = Math.floor((i / bars) * audioData.length);
          const rawVal = audioData[dataIdx] || 0;
          barHeight = Math.max(4, (rawVal / 255) * (height - 8));
        } else if (isRecording || isSimulating) {
          // Dynamic simulated voice harmonics with 8s voice pacing
          const harmonic1 = Math.sin(phaseRef.current + i * 0.3) * 0.5 + 0.5;
          const harmonic2 = Math.cos(phaseRef.current * 1.5 + i * 0.15) * 0.5 + 0.5;
          const speechBurst = Math.sin(i * 0.2 + phaseRef.current * 0.8) * 0.4 + 0.6;
          barHeight = Math.max(6, (harmonic1 * 0.6 + harmonic2 * 0.4) * speechBurst * (height - 10));
        } else {
          // Idle resting breath wave
          barHeight = 4 + Math.sin(phaseRef.current + i * 0.2) * 3;
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        // Gradient coloring: cyan to emerald, or rose when recording
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isRecording) {
          gradient.addColorStop(0, '#f43f5e');
          gradient.addColorStop(0.5, '#fb7185');
          gradient.addColorStop(1, '#e11d48');
        } else if (isSimulating) {
          gradient.addColorStop(0, '#00f2fe');
          gradient.addColorStop(0.5, '#4facfe');
          gradient.addColorStop(1, '#10b981');
        } else {
          gradient.addColorStop(0, 'rgba(0, 242, 254, 0.4)');
          gradient.addColorStop(1, 'rgba(79, 172, 254, 0.15)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Rounded bar
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();

        // Top glow dot for active peaks
        if ((isRecording || isSimulating) && barHeight > height * 0.6) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRecording, isSimulating, audioData]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={50}
        className="waveform-canvas"
      />
    </div>
  );
}
