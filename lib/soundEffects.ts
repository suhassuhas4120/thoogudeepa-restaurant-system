/**
 * soundEffects.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Cross-platform Audio Synthesizer & Haptic Vibration Utility.
 * Uses Web Audio API (Zero external assets required, 100% offline & instantaneous).
 * Provides distinct sound signatures for Kitchen, Customer, and Manager alerts.
 */

export type AlertNotificationSource = 'KITCHEN' | 'CUSTOMER' | 'MANAGER' | 'SUCCESS';

let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioCtx = new AudioContextClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
};

/** Unlock audio context on user interaction */
export const unlockAudio = () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
};

/**
 * 1. KITCHEN READY BELL
 * Dual-tone bright restaurant order bell: D5 (587.3 Hz) -> A5 (880.0 Hz)
 */
export const playKitchenChime = (volume = 0.3) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Tone 1: D5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Tone 2: A5 (Chime up)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(volume * 1.1, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.66);
  } catch {}
};

/**
 * 2. CUSTOMER CALL CHIME
 * Triple-tone pleasant service bell: C5 (523.25 Hz) -> E5 (659.25 Hz) -> G5 (783.99 Hz)
 */
export const playCustomerChime = (volume = 0.28) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Warmer, friendly customer bell tone
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.42);
    });
  } catch {}
};

/**
 * 3. MANAGER NOTICE CHIME
 * Authoritative double alert beep: F#5 (739.99 Hz) -> D5 (587.33 Hz)
 */
export const playManagerChime = (volume = 0.3) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square'; // Distinct, professional attention tone
    osc1.frequency.setValueAtTime(739.99, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(volume * 0.4, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.23);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(587.33, now + 0.18);
    gain2.gain.setValueAtTime(0, now + 0.18);
    gain2.gain.linearRampToValueAtTime(volume * 0.45, now + 0.195);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.46);
  } catch {}
};

/**
 * Play alert chime based on source
 */
export const playAlertChime = (source: AlertNotificationSource, volume = 0.3) => {
  switch (source) {
    case 'KITCHEN':
      playKitchenChime(volume);
      break;
    case 'CUSTOMER':
      playCustomerChime(volume);
      break;
    case 'MANAGER':
      playManagerChime(volume);
      break;
    default:
      playCustomerChime(volume);
      break;
  }
};

/**
 * Mobile Haptic Feedback (Vibration API)
 */
export const triggerHapticVibrate = (pattern: number | number[] = [180, 80, 180]) => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
};

/**
 * Web Notification API: Trigger native system notification if granted
 */
export const sendBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (typeof window === 'undefined') return;
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  } catch {}
};
