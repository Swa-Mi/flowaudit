// Speech recognition and simulated voice streaming service
export class VoiceService {
  constructor() {
    this.recognition = null;
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.isListening = false;
    this.simulatedTimer = null;
    this.initNativeRecognition();
  }

  initNativeRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }
  }

  hasNativeSpeech() {
    return !!this.recognition;
  }

  async startMicAudioAnalysis(onData) {
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices) return false;
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);
      return true;
    } catch (e) {
      console.warn('Microphone permission or audio context error:', e);
      return false;
    }
  }

  getAudioFrequencies() {
    if (!this.analyser) return null;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  stopMic() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
  }

  startNativeListening(onTranscript, onError) {
    if (!this.recognition) return false;
    this.isListening = true;

    this.recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      onTranscript(final || interim, !interim);
    };

    this.recognition.onerror = (event) => {
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      return true;
    } catch {
      return false;
    }
  }

  stopNativeListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
    this.stopMic();
  }

  /**
   * High-fidelity 8-Second Voice Simulation:
   * Streams words incrementally over ~6 to 8 seconds to deliver the exact "wow moment"
   * requested by the user even if mic permissions are blocked or user is in a quiet room.
   */
  startSimulatedVoice(targetText, onWord, onComplete, onProgress) {
    if (this.simulatedTimer) clearInterval(this.simulatedTimer);

    const words = targetText.split(' ');
    let currentIndex = 0;
    const totalWords = words.length;
    const intervalMs = Math.max(120, Math.floor(6500 / totalWords));
    const startTime = Date.now();

    this.simulatedTimer = setInterval(() => {
      currentIndex++;
      const currentWords = words.slice(0, currentIndex).join(' ');
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(100, Math.round((currentIndex / totalWords) * 100));

      onWord(currentWords);
      onProgress?.(progress, elapsed);

      if (currentIndex >= totalWords) {
        clearInterval(this.simulatedTimer);
        this.simulatedTimer = null;
        setTimeout(() => {
          onComplete(targetText);
        }, 300);
      }
    }, intervalMs);

    return () => {
      if (this.simulatedTimer) {
        clearInterval(this.simulatedTimer);
        this.simulatedTimer = null;
      }
    };
  }
}

export const voiceService = new VoiceService();
