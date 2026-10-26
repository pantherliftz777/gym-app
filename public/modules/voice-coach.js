/* FitFuel Voice Coach & Synthesized Audio Engine */
(function() {
  'use strict';

  let audioCtx = null;
  let voiceEnabled = localStorage.getItem('ff_voice_coach_enabled') !== 'false';
  let speechQueue = [];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // Synthesized Audio Tones via Web Audio API
  function playTone(frequency = 440, duration = 0.15, type = 'sine', volume = 0.25) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('[FitFuel Audio] Tone error:', e);
    }
  }

  // Chime on rep or timer finish (C5 -> E5 -> G5 arpeggio)
  function playSuccessChime() {
    playTone(523.25, 0.12, 'sine', 0.2);
    setTimeout(() => playTone(659.25, 0.12, 'sine', 0.2), 100);
    setTimeout(() => playTone(783.99, 0.25, 'sine', 0.25), 200);
  }

  // Short warning beep
  function playWarningBeep() {
    playTone(220, 0.18, 'sawtooth', 0.15);
  }

  // Metronome tick
  function playMetronomeClick(accent = false) {
    playTone(accent ? 880 : 440, 0.05, 'triangle', accent ? 0.3 : 0.15);
  }

  // Voice Announcement via Speech Synthesis
  function speak(text, priority = false) {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    if (priority) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    // Pick English natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Aaron'))));
    if (naturalVoice) utterance.voice = naturalVoice;

    window.speechSynthesis.speak(utterance);
  }

  // Rest Timer Audio Triggers
  function onRestStart(seconds, exerciseName = '') {
    playTone(660, 0.1, 'sine', 0.2);
    const label = exerciseName ? `for ${exerciseName}` : '';
    speak(`Rest started: ${seconds} seconds ${label}. Focus on breathing.`);
  }

  function onRestTick(secondsRemaining, totalSeconds) {
    // 30 seconds mark
    if (secondsRemaining === 30 && totalSeconds >= 45) {
      speak('30 seconds remaining.');
    }
    // 10 seconds mark
    else if (secondsRemaining === 10) {
      speak('10 seconds. Get ready.');
    }
    // 3, 2, 1 countdown beeps
    else if (secondsRemaining === 3) {
      playTone(523.25, 0.1, 'sine', 0.2);
    } else if (secondsRemaining === 2) {
      playTone(523.25, 0.1, 'sine', 0.2);
    } else if (secondsRemaining === 1) {
      playTone(659.25, 0.12, 'sine', 0.25);
    }
  }

  function onRestComplete(nextSetInfo = '') {
    playSuccessChime();
    const msg = nextSetInfo ? `Rest complete. Time for ${nextSetInfo}. Let's get it!` : "Rest complete! Time for your next set!";
    speak(msg, true);
  }

  function setVoiceEnabled(state) {
    voiceEnabled = !!state;
    localStorage.setItem('ff_voice_coach_enabled', voiceEnabled ? 'true' : 'false');
    if (!voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  if (typeof window !== 'undefined') {
    window.FitFuelVoice = {
      speak,
      playTone,
      playSuccessChime,
      playWarningBeep,
      playMetronomeClick,
      onRestStart,
      onRestTick,
      onRestComplete,
      isVoiceEnabled: () => voiceEnabled,
      setVoiceEnabled
    };
  }
})();
