import { getAudioContext, subscribeSpeechState } from './sound';

interface MusicEvent {
  /** Melody MIDI note (null = rest) */
  note: number | null;
  /** Duration in beats */
  beats: number;
  /** Optional warm chord accompaniment MIDI notes triggered at this event */
  chord?: number[];
  /** Gentle sleigh-bell sparkle accent on downbeat */
  bell?: boolean;
}

interface ChristmasSong {
  id: string;
  title: string;
  bpm: number;
  events: MusicEvent[];
}

export interface MusicPlaybackState {
  enabled: boolean;
  playing: boolean;
  awaitingGesture: boolean;
  currentSongTitle: string;
}

// MIDI note constants for clean, verifiable melodies
const N = {
  C3: 48,
  D3: 50,
  E3: 52,
  F3: 53,
  G3: 55,
  A3: 57,
  Bb3: 58,
  B3: 59,
  C4: 60,
  D4: 62,
  E4: 64,
  F4: 65,
  Fs4: 66,
  G4: 67,
  A4: 69,
  Bb4: 70,
  B4: 71,
  C5: 72,
  D5: 74,
  E5: 76,
  F5: 77,
  Fs5: 78,
  G5: 79,
  A5: 81,
  Bb5: 82,
  B5: 83,
  C6: 84,
  D6: 86,
  E6: 88,
  F6: 89,
} as const;

const CHORDS = {
  C: [N.C3, N.G3, N.E4],
  F: [N.F3, N.C4, N.A4],
  G: [N.G3, N.D4, N.B4],
  G7: [N.G3, N.D4, N.F4],
  Dm: [N.D3, N.A3, N.F4],
  Am: [N.A3, N.E4, N.C5],
  Em: [N.E3, N.B3, N.G4],
  D: [N.D3, N.A3, N.Fs4],
  Bb: [N.Bb3, N.F4, N.D5],
  C7: [N.C3, N.G3, N.Bb4],
};

const SONGS: ChristmasSong[] = [
  {
    id: 'jingle-bells',
    title: 'Din Don Dan (Jingle Bells)',
    bpm: 112,
    events: [
      // Bar 1-4
      { note: N.E5, beats: 1, chord: CHORDS.C, bell: true },
      { note: N.E5, beats: 1 },
      { note: N.E5, beats: 2 },
      { note: N.E5, beats: 1, chord: CHORDS.C, bell: true },
      { note: N.E5, beats: 1 },
      { note: N.E5, beats: 2 },
      { note: N.E5, beats: 1, chord: CHORDS.C, bell: true },
      { note: N.G5, beats: 1 },
      { note: N.C5, beats: 1.5 },
      { note: N.D5, beats: 0.5 },
      { note: N.E5, beats: 3.5, chord: CHORDS.C, bell: true },
      { note: null, beats: 0.5 },
      // Bar 5-8
      { note: N.F5, beats: 1, chord: CHORDS.F, bell: true },
      { note: N.F5, beats: 1 },
      { note: N.F5, beats: 1.5 },
      { note: N.F5, beats: 0.5 },
      { note: N.F5, beats: 1, chord: CHORDS.C, bell: true },
      { note: N.E5, beats: 1 },
      { note: N.E5, beats: 1 },
      { note: N.E5, beats: 0.5 },
      { note: N.E5, beats: 0.5 },
      { note: N.E5, beats: 1, chord: CHORDS.D, bell: true },
      { note: N.D5, beats: 1 },
      { note: N.D5, beats: 1 },
      { note: N.E5, beats: 1 },
      { note: N.D5, beats: 2, chord: CHORDS.G, bell: true },
      { note: N.G5, beats: 2 },
      // Bar 9-12
      { note: N.E5, beats: 1, chord: CHORDS.C, bell: true },
      { note: N.E5, beats: 1 },
      { note: N.E5, beats: 2 },
      { note: N.E5, beats: 1, chord: CHORDS.C, bell: true },
      { note: N.E5, beats: 1 },
      { note: N.E5, beats: 2 },
      { note: N.E5, beats: 1, chord: CHORDS.C, bell: true },
      { note: N.G5, beats: 1 },
      { note: N.C5, beats: 1.5 },
      { note: N.D5, beats: 0.5 },
      { note: N.E5, beats: 3.5, chord: CHORDS.C, bell: true },
      { note: null, beats: 0.5 },
      // Bar 13-16
      { note: N.F5, beats: 1, chord: CHORDS.F, bell: true },
      { note: N.F5, beats: 1 },
      { note: N.F5, beats: 1.5 },
      { note: N.F5, beats: 0.5 },
      { note: N.F5, beats: 1, chord: CHORDS.C, bell: true },
      { note: N.E5, beats: 1 },
      { note: N.E5, beats: 1 },
      { note: N.E5, beats: 0.5 },
      { note: N.E5, beats: 0.5 },
      { note: N.G5, beats: 1, chord: CHORDS.G7, bell: true },
      { note: N.G5, beats: 1 },
      { note: N.F5, beats: 1 },
      { note: N.D5, beats: 1 },
      { note: N.C5, beats: 3.5, chord: CHORDS.C, bell: true },
      { note: null, beats: 2.5 },
    ],
  },
  {
    id: 'we-wish-you',
    title: 'We Wish You a Merry Christmas',
    bpm: 108,
    events: [
      { note: N.D5, beats: 1 },
      { note: N.G5, beats: 1, chord: CHORDS.G, bell: true },
      { note: N.G5, beats: 0.5 },
      { note: N.A5, beats: 0.5 },
      { note: N.G5, beats: 0.5 },
      { note: N.Fs5, beats: 0.5 },
      { note: N.E5, beats: 1, chord: CHORDS.C, bell: true },
      { note: N.E5, beats: 1 },
      { note: N.E5, beats: 1 },
      { note: N.A5, beats: 1, chord: CHORDS.Am, bell: true },
      { note: N.A5, beats: 0.5 },
      { note: N.B5, beats: 0.5 },
      { note: N.A5, beats: 0.5 },
      { note: N.G5, beats: 0.5 },
      { note: N.Fs5, beats: 1, chord: CHORDS.D, bell: true },
      { note: N.D5, beats: 1 },
      { note: N.D5, beats: 1 },
      { note: N.B5, beats: 1, chord: CHORDS.G, bell: true },
      { note: N.B5, beats: 0.5 },
      { note: N.C6, beats: 0.5 },
      { note: N.B5, beats: 0.5 },
      { note: N.A5, beats: 0.5 },
      { note: N.G5, beats: 1, chord: CHORDS.Em, bell: true },
      { note: N.E5, beats: 1 },
      { note: N.D5, beats: 0.5 },
      { note: N.D5, beats: 0.5 },
      { note: N.E5, beats: 1, chord: CHORDS.C },
      { note: N.A5, beats: 1, chord: CHORDS.D },
      { note: N.Fs5, beats: 1 },
      { note: N.G5, beats: 2.5, chord: CHORDS.G, bell: true },
      { note: null, beats: 2.5 },
    ],
  },
  {
    id: 'o-albero',
    title: 'O Albero di Natale',
    bpm: 94,
    events: [
      // Phrase A1
      { note: N.C5, beats: 1 },
      { note: N.F5, beats: 0.75, chord: CHORDS.F, bell: true },
      { note: N.F5, beats: 0.25 },
      { note: N.F5, beats: 1 },
      { note: N.G5, beats: 1 },
      { note: N.A5, beats: 0.75, chord: CHORDS.F },
      { note: N.A5, beats: 0.25 },
      { note: N.A5, beats: 1.5 },
      { note: N.A5, beats: 0.5 },
      { note: N.G5, beats: 0.5, chord: CHORDS.Bb },
      { note: N.A5, beats: 0.5 },
      { note: N.Bb5, beats: 1 },
      { note: N.E5, beats: 1, chord: CHORDS.C7 },
      { note: N.G5, beats: 1 },
      { note: N.F5, beats: 1.5, chord: CHORDS.F },
      { note: null, beats: 0.5 },
      // Phrase B
      { note: N.C6, beats: 0.5, chord: CHORDS.F },
      { note: N.C6, beats: 0.5 },
      { note: N.A5, beats: 0.5 },
      { note: N.D6, beats: 1.5, chord: CHORDS.Bb, bell: true },
      { note: N.C6, beats: 0.5 },
      { note: N.C6, beats: 0.5 },
      { note: N.Bb5, beats: 0.5 },
      { note: N.Bb5, beats: 1.5, chord: CHORDS.C7 },
      { note: N.Bb5, beats: 0.5 },
      { note: N.Bb5, beats: 0.5 },
      { note: N.G5, beats: 0.5 },
      { note: N.C6, beats: 1.5, chord: CHORDS.C7, bell: true },
      { note: N.Bb5, beats: 0.5 },
      { note: N.Bb5, beats: 0.5 },
      { note: N.A5, beats: 0.5 },
      { note: N.A5, beats: 1.5, chord: CHORDS.F },
      // Phrase A2
      { note: N.C5, beats: 1 },
      { note: N.F5, beats: 0.75, chord: CHORDS.F, bell: true },
      { note: N.F5, beats: 0.25 },
      { note: N.F5, beats: 1 },
      { note: N.G5, beats: 1 },
      { note: N.A5, beats: 0.75, chord: CHORDS.F },
      { note: N.A5, beats: 0.25 },
      { note: N.A5, beats: 1.5 },
      { note: N.A5, beats: 0.5 },
      { note: N.G5, beats: 0.5, chord: CHORDS.Bb },
      { note: N.A5, beats: 0.5 },
      { note: N.Bb5, beats: 1 },
      { note: N.E5, beats: 1, chord: CHORDS.C7 },
      { note: N.G5, beats: 1 },
      { note: N.F5, beats: 2.5, chord: CHORDS.F, bell: true },
      { note: null, beats: 2.5 },
    ],
  },
  {
    id: 'silent-night',
    title: 'Astro del Ciel',
    bpm: 132, // 1 beat = eighth note in gentle 6/8 lullaby
    events: [
      { note: N.G5, beats: 1.5, chord: CHORDS.C },
      { note: N.A5, beats: 0.5 },
      { note: N.G5, beats: 1 },
      { note: N.E5, beats: 3 },
      { note: N.G5, beats: 1.5, chord: CHORDS.C },
      { note: N.A5, beats: 0.5 },
      { note: N.G5, beats: 1 },
      { note: N.E5, beats: 3 },
      { note: N.D6, beats: 2, chord: CHORDS.G },
      { note: N.D6, beats: 1 },
      { note: N.B5, beats: 3 },
      { note: N.C6, beats: 2, chord: CHORDS.C },
      { note: N.C6, beats: 1 },
      { note: N.G5, beats: 3 },
      { note: N.A5, beats: 2, chord: CHORDS.F },
      { note: N.A5, beats: 1 },
      { note: N.C6, beats: 1.5 },
      { note: N.B5, beats: 0.5 },
      { note: N.A5, beats: 1 },
      { note: N.G5, beats: 1.5, chord: CHORDS.C },
      { note: N.A5, beats: 0.5 },
      { note: N.G5, beats: 1 },
      { note: N.E5, beats: 3 },
      { note: N.D6, beats: 2, chord: CHORDS.G7 },
      { note: N.D6, beats: 1 },
      { note: N.F6, beats: 1.5 },
      { note: N.D6, beats: 0.5 },
      { note: N.B5, beats: 1 },
      { note: N.C6, beats: 3, chord: CHORDS.C },
      { note: N.E6, beats: 3 },
      { note: N.C6, beats: 1, chord: CHORDS.C },
      { note: N.G5, beats: 1 },
      { note: N.E5, beats: 1 },
      { note: N.G5, beats: 1.5, chord: CHORDS.G7 },
      { note: N.F5, beats: 0.5 },
      { note: N.D5, beats: 1 },
      { note: N.C5, beats: 5, chord: CHORDS.C },
      { note: null, beats: 3 },
    ],
  },
];

const NORMAL_VOLUME = 0.22;
const DUCKED_VOLUME = 0.06;
const LOOKAHEAD_MS = 85;
const SCHEDULE_AHEAD_SEC = 0.28;

let masterGain: GainNode | null = null;
let melodyFilter: BiquadFilterNode | null = null;
let chordFilter: BiquadFilterNode | null = null;

let enabled = false;
let isPlaying = false;
let awaitingGesture = false;
let isDucked = false;
let duckedSinceMs = 0;

let songIndex = 0;
let eventIndex = 0;
let nextNoteTime = 0;
let schedulerTimer: number | null = null;
let gestureListenerAttached = false;
let visibilityListenerAttached = false;
let speechSubscribed = false;

const listeners = new Set<(state: MusicPlaybackState) => void>();

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function getStateSnapshot(): MusicPlaybackState {
  return {
    enabled,
    playing: isPlaying,
    awaitingGesture,
    currentSongTitle: SONGS[songIndex]?.title ?? SONGS[0].title,
  };
}

function notifyListeners(): void {
  const snapshot = getStateSnapshot();
  listeners.forEach((cb) => cb(snapshot));
}

function ensureAudioGraph(ctx: AudioContext): boolean {
  if (masterGain && melodyFilter && chordFilter && masterGain.context === ctx) {
    return true;
  }
  try {
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.connect(ctx.destination);

    melodyFilter = ctx.createBiquadFilter();
    melodyFilter.type = 'lowpass';
    melodyFilter.frequency.setValueAtTime(3200, ctx.currentTime);
    melodyFilter.Q.setValueAtTime(0.7, ctx.currentTime);
    melodyFilter.connect(masterGain);

    chordFilter = ctx.createBiquadFilter();
    chordFilter.type = 'lowpass';
    chordFilter.frequency.setValueAtTime(860, ctx.currentTime);
    chordFilter.Q.setValueAtTime(0.5, ctx.currentTime);
    chordFilter.connect(masterGain);

    return true;
  } catch {
    return false;
  }
}

function applyTargetVolume(ctx: AudioContext, rampSec = 0.35): void {
  if (!masterGain) return;
  const target = !enabled || !isPlaying
    ? 0.0001
    : isDucked
      ? DUCKED_VOLUME
      : NORMAL_VOLUME;
  const now = ctx.currentTime;
  const current = Math.max(0.0001, masterGain.gain.value);
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(current, now);
  masterGain.gain.linearRampToValueAtTime(target, now + Math.max(0.08, rampSec));
}

function scheduleCelestaNote(
  ctx: AudioContext,
  midi: number,
  startTime: number,
  durationSec: number,
): void {
  if (!melodyFilter) return;
  const freq = midiToFreq(midi);
  const ringSec = Math.min(1.4, Math.max(0.45, durationSec * 1.15));

  // Fundamental warm bell tone
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, startTime);

  gain1.gain.setValueAtTime(0.0001, startTime);
  gain1.gain.linearRampToValueAtTime(0.28, startTime + 0.014);
  gain1.gain.exponentialRampToValueAtTime(0.0008, startTime + ringSec);

  osc1.connect(gain1);
  gain1.connect(melodyFilter);
  osc1.start(startTime);
  osc1.stop(startTime + ringSec + 0.03);

  // Subtle 2nd harmonic celesta shimmer
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2, startTime);

  gain2.gain.setValueAtTime(0.0001, startTime);
  gain2.gain.linearRampToValueAtTime(0.055, startTime + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.0005, startTime + ringSec * 0.55);

  osc2.connect(gain2);
  gain2.connect(melodyFilter);
  osc2.start(startTime);
  osc2.stop(startTime + ringSec * 0.58 + 0.02);
}

function scheduleWarmChord(
  ctx: AudioContext,
  notes: number[],
  startTime: number,
  durationSec: number,
): void {
  if (!chordFilter) return;
  const chordDur = Math.min(2.4, Math.max(0.9, durationSec * 2.1));

  notes.forEach((midi, idx) => {
    const arpeggioStart = startTime + idx * 0.035;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(midiToFreq(midi), arpeggioStart);

    gain.gain.setValueAtTime(0.0001, arpeggioStart);
    gain.gain.linearRampToValueAtTime(0.075, arpeggioStart + 0.045);
    gain.gain.exponentialRampToValueAtTime(0.0008, arpeggioStart + chordDur);

    osc.connect(gain);
    gain.connect(chordFilter!);
    osc.start(arpeggioStart);
    osc.stop(arpeggioStart + chordDur + 0.04);
  });
}

function scheduleSleighSparkle(ctx: AudioContext, startTime: number): void {
  if (!masterGain) return;
  const partials = [3520, 4435, 5274];
  partials.forEach((freq, i) => {
    const t = startTime + i * 0.008;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.014, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0003, t + 0.14);

    osc.connect(gain);
    gain.connect(masterGain!);
    osc.start(t);
    osc.stop(t + 0.16);
  });
}

function runScheduler(): void {
  if (!enabled || !isPlaying) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  // Watchdog: if a browser misses SpeechSynthesis onend, gently restore normal volume
  if (
    isDucked &&
    Date.now() - duckedSinceMs > 1200 &&
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    !window.speechSynthesis.speaking &&
    !window.speechSynthesis.pending
  ) {
    isDucked = false;
    applyTargetVolume(ctx, 0.75);
  }

  if (nextNoteTime < ctx.currentTime - 0.1) {
    nextNoteTime = ctx.currentTime + 0.05;
  }

  while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD_SEC) {
    const song = SONGS[songIndex];
    const ev = song.events[eventIndex];
    const secPerBeat = 60 / song.bpm;
    const durationSec = ev.beats * secPerBeat;

    if (ev.chord) {
      scheduleWarmChord(ctx, ev.chord, nextNoteTime, durationSec);
    }
    if (ev.bell) {
      scheduleSleighSparkle(ctx, nextNoteTime);
    }
    if (ev.note !== null) {
      scheduleCelestaNote(ctx, ev.note, nextNoteTime, durationSec);
    }

    nextNoteTime += durationSec;
    eventIndex += 1;

    if (eventIndex >= song.events.length) {
      eventIndex = 0;
      songIndex = (songIndex + 1) % SONGS.length;
      notifyListeners();
    }
  }
}

function stopScheduler(): void {
  if (schedulerTimer !== null && typeof window !== 'undefined') {
    window.clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
}

function attachGlobalHelpers(): void {
  if (typeof window === 'undefined') return;

  if (!speechSubscribed) {
    speechSubscribed = true;
    subscribeSpeechState((speakingTag) => {
      const shouldDuck = speakingTag !== null;
      if (shouldDuck) {
        duckedSinceMs = Date.now();
      }
      if (shouldDuck === isDucked) return;
      isDucked = shouldDuck;
      const ctx = getAudioContext();
      if (ctx && masterGain && isPlaying) {
        applyTargetVolume(ctx, isDucked ? 0.28 : 0.75);
      }
    });
  }

  if (!visibilityListenerAttached && typeof document !== 'undefined') {
    visibilityListenerAttached = true;
    document.addEventListener('visibilitychange', () => {
      const ctx = getAudioContext();
      if (!ctx || !masterGain) return;
      if (document.hidden) {
        stopScheduler();
        if (isPlaying) {
          masterGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
        }
      } else if (enabled && isPlaying) {
        nextNoteTime = ctx.currentTime + 0.08;
        applyTargetVolume(ctx, 0.45);
        if (schedulerTimer === null) {
          schedulerTimer = window.setInterval(runScheduler, LOOKAHEAD_MS);
        }
      }
    });
  }
}

function removeGestureUnlockListeners(): void {
  if (!gestureListenerAttached || typeof window === 'undefined') return;
  gestureListenerAttached = false;
  window.removeEventListener('pointerdown', handleFirstUserGesture, true);
  window.removeEventListener('keydown', handleFirstUserGesture, true);
}

function handleFirstUserGesture(event: Event): void {
  if (!enabled) {
    removeGestureUnlockListeners();
    return;
  }
  const target = event.target as Element | null;
  if (target?.closest?.('[data-music-toggle="true"]')) {
    return;
  }
  const ctx = getAudioContext();
  if (!ctx) return;
  ctx
    .resume()
    .then(() => {
      if (enabled && ctx.state === 'running') {
        removeGestureUnlockListeners();
        startInternalPlayback(ctx);
      }
    })
    .catch(() => {});
}

function attachGestureUnlockListeners(): void {
  if (gestureListenerAttached || typeof window === 'undefined') return;
  gestureListenerAttached = true;
  window.addEventListener('pointerdown', handleFirstUserGesture, {
    capture: true,
    passive: true,
  });
  window.addEventListener('keydown', handleFirstUserGesture, {
    capture: true,
    passive: true,
  });
}

function startInternalPlayback(ctx: AudioContext): void {
  if (!ensureAudioGraph(ctx)) return;
  awaitingGesture = false;
  isPlaying = true;
  nextNoteTime = ctx.currentTime + 0.06;
  applyTargetVolume(ctx, 0.5);
  stopScheduler();
  runScheduler();
  schedulerTimer = window.setInterval(runScheduler, LOOKAHEAD_MS);
  notifyListeners();
}

export function startChristmasMusic(): void {
  attachGlobalHelpers();
  enabled = true;

  const ctx = getAudioContext();
  if (!ctx) {
    awaitingGesture = true;
    notifyListeners();
    return;
  }

  if (ctx.state === 'running') {
    removeGestureUnlockListeners();
    if (!isPlaying) {
      startInternalPlayback(ctx);
    } else {
      applyTargetVolume(ctx, 0.4);
      notifyListeners();
    }
    return;
  }

  // Try resuming immediately; if browser autoplay policy holds it suspended, wait for first gesture
  ctx
    .resume()
    .then(() => {
      if (!enabled) return;
      if (ctx.state === 'running') {
        removeGestureUnlockListeners();
        startInternalPlayback(ctx);
      } else {
        awaitingGesture = true;
        attachGestureUnlockListeners();
        notifyListeners();
      }
    })
    .catch(() => {
      if (!enabled) return;
      awaitingGesture = true;
      attachGestureUnlockListeners();
      notifyListeners();
    });

  // Mark awaitingGesture until resume resolves or first user gesture unlocks audio
  awaitingGesture = true;
  attachGestureUnlockListeners();
  notifyListeners();
}

export function stopChristmasMusic(): void {
  enabled = false;
  awaitingGesture = false;
  isPlaying = false;
  removeGestureUnlockListeners();
  stopScheduler();

  const ctx = getAudioContext();
  if (ctx && masterGain) {
    applyTargetVolume(ctx, 0.2);
  }
  notifyListeners();
}

export function toggleChristmasMusic(): void {
  if (!enabled || awaitingGesture) {
    startChristmasMusic();
  } else {
    stopChristmasMusic();
  }
}

export function subscribeMusicState(
  listener: (state: MusicPlaybackState) => void,
): () => void {
  listeners.add(listener);
  listener(getStateSnapshot());
  return () => {
    listeners.delete(listener);
  };
}
