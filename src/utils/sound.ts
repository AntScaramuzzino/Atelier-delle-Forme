import { ELVES, type ElfId } from '../data/elves';

let audioCtx: AudioContext | null = null;
let currentSpeakingId: string | null = null;
let pendingSpeakTimer: number | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
const speechListeners = new Set<(speakingId: string | null) => void>();

function refreshVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const list = window.speechSynthesis.getVoices();
    if (list.length > 0) {
      cachedVoices = list;
    }
  } catch {
    // Ignore restricted speech API
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
}

function notifySpeechListeners(id: string | null): void {
  currentSpeakingId = id;
  speechListeners.forEach((cb) => cb(id));
}

export function subscribeSpeechState(
  listener: (speakingId: string | null) => void,
): () => void {
  speechListeners.add(listener);
  listener(currentSpeakingId);
  return () => {
    speechListeners.delete(listener);
  };
}

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  durationSec: number,
  startOffsetSec = 0,
  volume = 0.14,
  type: OscillatorType = 'triangle',
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + startOffsetSec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationSec + 0.02);
}

export function playTapSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(460, 0.075, 0, 0.08, 'sine');
}

export function playSuccessChime(enabled: boolean): void {
  if (!enabled) return;
  playTone(523.25, 0.16, 0, 0.14, 'triangle');
  playTone(659.25, 0.16, 0.08, 0.14, 'triangle');
  playTone(783.99, 0.28, 0.16, 0.15, 'triangle');
}

export function playSoftRetrySound(enabled: boolean): void {
  if (!enabled) return;
  playTone(250, 0.13, 0, 0.09, 'sine');
  playTone(215, 0.16, 0.09, 0.08, 'sine');
}

export function playCelebrationFanfare(enabled: boolean): void {
  if (!enabled) return;
  playTone(523.25, 0.16, 0, 0.14, 'triangle');
  playTone(659.25, 0.16, 0.09, 0.14, 'triangle');
  playTone(783.99, 0.16, 0.18, 0.14, 'triangle');
  playTone(1046.5, 0.42, 0.27, 0.16, 'triangle');
}

export function stopSpeaking(): void {
  if (pendingSpeakTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(pendingSpeakTimer);
    pendingSpeakTimer = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore speech synthesis errors in restricted sandboxes
    }
  }
  notifySpeechListeners(null);
}

const FEMALE_HINTS = [
  'isabella',
  'elsa',
  'alice',
  'federica',
  'silvia',
  'paola',
  'chiara',
  'giulia',
  'lucia',
  'bianca',
  'sofia',
  'fabiola',
  'elena',
  'female',
  'woman',
  'donna',
  'google italiano',
];

const MALE_HINTS = [
  'diego',
  'giuseppe',
  'benigno',
  'calimero',
  'cataldo',
  'cosimo',
  'luca',
  'marco',
  'matteo',
  'giorgio',
  'roberto',
  'paolo',
  'andrea',
  'vittorio',
  'male',
  'man',
  'uomo',
];

function scoreNaturalVoice(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  let score = 0;
  if (v.lang.toLowerCase() === 'it-it') score += 20;
  if (n.includes('natural') || n.includes('neural') || n.includes('online')) score += 45;
  if (n.includes('google') || n.includes('enhanced') || n.includes('premium')) score += 30;
  if (n.includes('siri') || n.includes('microsoft')) score += 15;
  if (n.includes('espeak') || n.includes('compact')) score -= 40;
  return score;
}

function pickDistinctVoiceForElf(
  elfId: ElfId,
): { voice?: SpeechSynthesisVoice; pitchOffset: number; rateOffset: number } {
  refreshVoices();
  const pool =
    cachedVoices.length > 0
      ? cachedVoices
      : typeof window !== 'undefined' && 'speechSynthesis' in window
        ? window.speechSynthesis.getVoices()
        : [];

  const italianVoices = pool
    .filter((v) => v.lang.toLowerCase().startsWith('it'))
    .sort((a, b) => scoreNaturalVoice(b) - scoreNaturalVoice(a));

  if (italianVoices.length === 0) {
    return { voice: undefined, pitchOffset: 0, rateOffset: 0 };
  }

  const elf = ELVES[elfId];
  const femaleVoices = italianVoices.filter((v) => {
    const n = v.name.toLowerCase();
    return (
      FEMALE_HINTS.some((h) => n.includes(h)) &&
      !MALE_HINTS.some((h) => n.includes(h))
    );
  });
  const maleVoices = italianVoices.filter((v) => {
    const n = v.name.toLowerCase();
    return MALE_HINTS.some((h) => n.includes(h));
  });

  if (elf.gender === 'female') {
    const candidates = femaleVoices.length > 0 ? femaleVoices : italianVoices;
    if (elfId === 'rossella') {
      return { voice: candidates[0], pitchOffset: 0, rateOffset: 0 };
    }
    // Stella: pick second female voice if available, else slightly brighter human inflection
    if (candidates.length > 1) {
      return { voice: candidates[1], pitchOffset: -0.02, rateOffset: 0 };
    }
    return { voice: candidates[0], pitchOffset: 0.03, rateOffset: 0.02 };
  }

  // Male Elves: Lorenzo, Antonio, Alfredo
  if (maleVoices.length > 0) {
    const idx =
      elfId === 'lorenzo' ? 0 : elfId === 'antonio' ? 1 : 2;
    const chosen = maleVoices[idx % maleVoices.length];
    const sharedFallback = maleVoices.length === 1;
    const pitchOffset = !sharedFallback
      ? 0
      : elfId === 'antonio'
        ? -0.05
        : elfId === 'lorenzo'
          ? 0.04
          : 0;
    return { voice: chosen, pitchOffset, rateOffset: 0 };
  }

  // When OS only provides a single generic Italian voice, keep pitch strictly in natural human range
  // without robotic distortion while ensuring clear distinction between Lorenzo, Antonio, and Alfredo.
  const baseVoice = italianVoices[0];
  if (elfId === 'antonio') {
    return { voice: baseVoice, pitchOffset: -0.07, rateOffset: -0.02 };
  }
  if (elfId === 'alfredo') {
    return { voice: baseVoice, pitchOffset: -0.02, rateOffset: 0.01 };
  }
  return { voice: baseVoice, pitchOffset: 0.02, rateOffset: 0.02 };
}

function makeConversationalText(raw: string): string {
  return raw
    .replace(/\s*·\s*/g, ', ')
    .replace(/:\s*/g, ', ')
    .trim();
}

export function speakAsElf(
  text: string,
  elfId: ElfId,
  enabled: boolean,
  options?: { forcePlay?: boolean; utteranceTag?: string },
): void {
  const shouldPlay = options?.forcePlay || enabled;
  if (!shouldPlay) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const elf = ELVES[elfId];
  const tag = options?.utteranceTag ?? elfId;

  if (pendingSpeakTimer !== null) {
    window.clearTimeout(pendingSpeakTimer);
    pendingSpeakTimer = null;
  }

  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore cancel errors
  }

  // Short 35ms delay prevents Chrome speechSynthesis cancel/speak race glitches
  pendingSpeakTimer = window.setTimeout(() => {
    pendingSpeakTimer = null;
    try {
      const utterance = new SpeechSynthesisUtterance(makeConversationalText(text));
      utterance.lang = 'it-IT';

      const { voice, pitchOffset, rateOffset } = pickDistinctVoiceForElf(elfId);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.pitch = Math.min(1.18, Math.max(0.78, elf.pitch + pitchOffset));
      utterance.rate = Math.min(1.06, Math.max(0.84, elf.rate + rateOffset));

      utterance.onstart = () => notifySpeechListeners(tag);
      utterance.onend = () => {
        if (currentSpeakingId === tag) notifySpeechListeners(null);
      };
      utterance.onerror = () => {
        if (currentSpeakingId === tag) notifySpeechListeners(null);
      };

      notifySpeechListeners(tag);
      window.speechSynthesis.speak(utterance);
    } catch {
      notifySpeechListeners(null);
    }
  }, 35);
}

export function speakItalian(text: string, enabled: boolean): void {
  speakAsElf(text, 'rossella', enabled);
}
