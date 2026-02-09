// Simple synthesized sound effects using Web Audio API
// This avoids the need for external audio files and ensures sounds work immediately

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    // @ts-ignore - Handle browser differences
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  return audioContext;
};

export const initAudio = () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
};

export const playSpinSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Create oscillator for a "tick" sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

export const playWinSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Play a major chord (C Major)
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const startTime = ctx.currentTime + (i * 0.1);
    const duration = 0.8;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  });
};

export const playRedPacketSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Play a more exciting sequence
  const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square'; // Brighter sound
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const startTime = ctx.currentTime + (i * 0.05);
    const duration = 0.3;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.05, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  });
};

export const playSynthesisSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // 1. Charging Sound (Rising pitch)
  const chargeOsc = ctx.createOscillator();
  const chargeGain = ctx.createGain();
  
  chargeOsc.type = 'sawtooth';
  chargeOsc.frequency.setValueAtTime(100, ctx.currentTime);
  chargeOsc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.5);
  
  chargeGain.gain.setValueAtTime(0, ctx.currentTime);
  chargeGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.5);
  chargeGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);

  chargeOsc.connect(chargeGain);
  chargeGain.connect(ctx.destination);
  
  chargeOsc.start();
  chargeOsc.stop(ctx.currentTime + 1.6);

  // 2. Explosion/Impact Sound (at 1.6s)
  setTimeout(() => {
    // Low boom
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(150, ctx.currentTime);
    boomOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
    
    boomGain.gain.setValueAtTime(0.3, ctx.currentTime);
    boomGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);
    boomOsc.start();
    boomOsc.stop(ctx.currentTime + 0.5);
    
    // High sparkle (Success chime)
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, i) => {
      const sparkOsc = ctx.createOscillator();
      const sparkGain = ctx.createGain();
      
      sparkOsc.type = 'triangle';
      sparkOsc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const startTime = ctx.currentTime + (i * 0.05);
      const duration = 0.6;
      
      sparkGain.gain.setValueAtTime(0, startTime);
      sparkGain.gain.linearRampToValueAtTime(0.05, startTime + 0.05);
      sparkGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      sparkOsc.connect(sparkGain);
      sparkGain.connect(ctx.destination);
      
      sparkOsc.start(startTime);
      sparkOsc.stop(startTime + duration);
    });
  }, 1600);
};
