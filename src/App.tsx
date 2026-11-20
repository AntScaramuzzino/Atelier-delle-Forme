import { useCallback, useEffect, useState } from 'react';
import {
  ExternalLink,
  Grid2x2,
  Palette,
  Play,
  Puzzle,
  Shapes,
  Square,
  Star,
  Volume2,
} from 'lucide-react';
import { CreditsView } from './components/CreditsView';
import { DashboardView, type MasteryStats } from './components/DashboardView';
import { ElfAvatarSvg, XmasLabBadgeSvg } from './components/ElfAvatarSvg';
import { ExploreMode } from './components/ExploreMode';
import { InstructionsView } from './components/InstructionsView';
import { LimWelcomeOverlay } from './components/LimWelcomeOverlay';
import { MatchingGameMode } from './components/MatchingGameMode';
import { QuizGameMode } from './components/QuizGameMode';
import { RoundSummary, type RoundResultSummary } from './components/RoundSummary';
import { ShapeSvg } from './components/ShapeSvg';
import { SnowfallOverlay } from './components/SnowfallOverlay';
import { TopBar, type AppView } from './components/TopBar';
import { CHRISTMAS_MEDALS, ELVES } from './data/elves';
import {
  DIFFICULTY_CONFIGS,
  getColorsForDifficulty,
  getShapesForDifficulty,
  type ColorId,
  type DifficultyLevel,
  type GameMode,
  type ShapeId,
} from './data/gameCatalog';
import {
  playTapSound,
  speakAsElf,
  stopSpeaking,
  subscribeSpeechState,
} from './utils/sound';

const HERO_IMAGE_URL = '/assets/elves/workshop_hero.png';
const STORAGE_KEY = 'missione_natale_atelier_stats_v2';

const EMPTY_STATS: MasteryStats = {
  totalStars: 0,
  gamesCompleted: 0,
  starsByMode: {
    colori: 0,
    forme: 0,
    misto: 0,
    incastri: 0,
  },
  incastriCompleted: 0,
  colorCounts: {},
  shapeCounts: {},
};

function loadStats(): MasteryStats {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATS;
    const parsed = JSON.parse(raw) as Partial<MasteryStats>;
    return {
      totalStars: typeof parsed.totalStars === 'number' ? parsed.totalStars : 0,
      gamesCompleted:
        typeof parsed.gamesCompleted === 'number' ? parsed.gamesCompleted : 0,
      starsByMode: {
        colori: parsed.starsByMode?.colori ?? 0,
        forme: parsed.starsByMode?.forme ?? 0,
        misto: parsed.starsByMode?.misto ?? 0,
        incastri: parsed.starsByMode?.incastri ?? 0,
      },
      incastriCompleted:
        typeof parsed.incastriCompleted === 'number'
          ? parsed.incastriCompleted
          : 0,
      colorCounts: parsed.colorCounts ?? {},
      shapeCounts: parsed.shapeCounts ?? {},
    };
  } catch {
    return EMPTY_STATS;
  }
}

export default function App() {
  const [view, setView] = useState<AppView>('TITLE_MENU');
  const [activeMode, setActiveMode] = useState<GameMode>('colori');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('facile');

  // Audio muted by default on startup as requested
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [snowEnabled, setSnowEnabled] = useState<boolean>(true);
  const [limMode, setLimMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLimWelcome, setShowLimWelcome] = useState<boolean>(false);

  const [gameInstanceKey, setGameInstanceKey] = useState<number>(1);
  const [exploreTab, setExploreTab] = useState<'abbina' | 'scopri'>('abbina');
  const [lastSummary, setLastSummary] = useState<RoundResultSummary | null>(null);
  const [stats, setStats] = useState<MasteryStats>(() => loadStats());
  const [heroImgFailed, setHeroImgFailed] = useState<boolean>(false);
  const [speakingTag, setSpeakingTag] = useState<string | null>(null);

  useEffect(() => {
    return subscribeSpeechState(setSpeakingTag);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore storage write errors
    }
  }, [stats]);

  // Sync native fullscreen change events
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Block pinch-zoom in LIM mode
  useEffect(() => {
    if (!limMode) return;
    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('wheel', preventZoom, { passive: false });
    window.addEventListener('gesturestart', preventGesture);
    return () => {
      window.removeEventListener('wheel', preventZoom);
      window.removeEventListener('gesturestart', preventGesture);
    };
  }, [limMode]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (!next) {
        stopSpeaking();
      } else {
        playTapSound(true);
      }
      return next;
    });
  }, []);

  const handleToggleSnow = useCallback(() => {
    playTapSound(soundEnabled);
    setSnowEnabled((prev) => !prev);
  }, [soundEnabled]);

  const handleToggleLim = useCallback(() => {
    playTapSound(soundEnabled);
    setLimMode((prev) => !prev);
  }, [soundEnabled]);

  const handleToggleFullscreen = useCallback(async () => {
    playTapSound(soundEnabled);
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // In-app fallback when browser/iframe blocks native Fullscreen API
      setIsFullscreen((prev) => !prev);
    }
  }, [soundEnabled]);

  const startGame = useCallback(
    (mode: GameMode) => {
      playTapSound(soundEnabled);
      setActiveMode(mode);
      setGameInstanceKey((k) => k + 1);
      if (mode === 'misto') {
        setExploreTab('abbina');
        setView('EXPLORE');
      } else {
        setView('PLAYING');
      }
    },
    [soundEnabled],
  );

  const handleNavigate = useCallback(
    (targetView: AppView, quickMode?: GameMode) => {
      stopSpeaking();
      playTapSound(soundEnabled);
      if (targetView === 'PLAYING' && quickMode) {
        setActiveMode(quickMode);
        setGameInstanceKey((k) => k + 1);
      }
      if (targetView === 'EXPLORE') {
        setExploreTab('abbina');
        setGameInstanceKey((k) => k + 1);
      }
      setView(targetView);
    },
    [soundEnabled],
  );

  const handleRecordMastery = useCallback(
    (colorId: ColorId, shapeId: ShapeId, starsDelta: number) => {
      setStats((prev) => ({
        ...prev,
        totalStars: prev.totalStars + starsDelta,
        colorCounts: {
          ...prev.colorCounts,
          [colorId]: (prev.colorCounts[colorId] ?? 0) + 1,
        },
        shapeCounts: {
          ...prev.shapeCounts,
          [shapeId]: (prev.shapeCounts[shapeId] ?? 0) + 1,
        },
      }));
    },
    [],
  );

  const handleGameComplete = useCallback((summary: RoundResultSummary) => {
    setStats((prev) => ({
      ...prev,
      gamesCompleted: prev.gamesCompleted + 1,
      starsByMode: {
        ...prev.starsByMode,
        [summary.mode]: (prev.starsByMode[summary.mode] ?? 0) + summary.starsEarned,
      },
      incastriCompleted:
        summary.mode === 'incastri'
          ? prev.incastriCompleted + summary.totalRounds
          : prev.incastriCompleted,
    }));
    setLastSummary(summary);
    setView('ROUND_SUMMARY');
  }, []);

  const handleResetStats = useCallback(() => {
    playTapSound(soundEnabled);
    setStats(EMPTY_STATS);
  }, [soundEnabled]);

  const handleToggleHeroRossella = () => {
    const tag = 'hero-rossella';
    if (speakingTag === tag) {
      stopSpeaking();
    } else {
      speakAsElf(ELVES.rossella.introLine, 'rossella', soundEnabled, {
        forcePlay: true,
        utteranceTag: tag,
      });
    }
  };

  const activeDifficultyConfig = DIFFICULTY_CONFIGS[difficulty];
  const levelColors = getColorsForDifficulty(difficulty);
  const levelShapes = getShapesForDifficulty(difficulty);
  const unlockedMedalsCount = CHRISTMAS_MEDALS.filter(
    (m) => stats.totalStars >= m.threshold,
  ).length;

  return (
    <div
      onContextMenu={limMode ? (e) => e.preventDefault() : undefined}
      className={`min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 ${
        isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''
      }`}
    >
      <SnowfallOverlay active={snowEnabled} />

      <TopBar
        currentView={view}
        activeMode={activeMode}
        soundEnabled={soundEnabled}
        snowEnabled={snowEnabled}
        limMode={limMode}
        isFullscreen={isFullscreen}
        onNavigate={handleNavigate}
        onToggleSound={handleToggleSound}
        onToggleSnow={handleToggleSnow}
        onToggleLim={handleToggleLim}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenGuide={() => setShowLimWelcome(true)}
      />

      <LimWelcomeOverlay
        open={showLimWelcome}
        soundEnabled={soundEnabled}
        onClose={() => setShowLimWelcome(false)}
        onStartWithRossella={() => {
          setShowLimWelcome(false);
          startGame('colori');
        }}
      />

      <main className="flex-1 relative z-10">
        {view === 'TITLE_MENU' && (
          <div
            className={`max-w-6xl mx-auto px-4 sm:px-6 ${
              limMode ? 'py-4' : 'py-7 sm:py-9'
            }`}
          >
            {/* Balanced 2-Column Hero matching reference Villaggio delle Forme */}
            <div
              className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch ${
                limMode ? 'mb-5' : 'mb-9'
              }`}
            >
              {/* Left Column: Title + Level Selector + Primary CTAs */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-1.5">
                        Scuola dell’Infanzia <span aria-hidden="true">·</span> 3–6 anni <span aria-hidden="true">·</span> Stelle: <span className="tabular-nums font-bold text-slate-800">{stats.totalStars}</span>
                      </p>
                      <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.12] text-balance">
                        Missione Natale: Atelier delle Forme e dei Colori
                      </h1>
                    </div>

                    <XmasLabBadgeSvg className="w-20 h-20 shrink-0 hidden sm:block" />
                  </div>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 max-w-2xl">
                    Inizia insieme a <strong>Elfa Rossella</strong> a riconoscere i colori del Natale e poi prosegui con <strong>Elfo Lorenzo</strong>, <strong>Elfo Antonio</strong>, <strong>Elfo Alfredo</strong> ed <strong>Elfa Stella</strong> tra colori primari e secondari, forme geometriche e incastri di forme e colori
                  </p>

                  {/* 3 Age-Tiered Difficulty Cards */}
                  <div className="mb-6">
                    <span className="block text-xs font-bold text-slate-700 mb-2.5">
                      Scegli la fascia d’età
                    </span>
                    <div
                      role="group"
                      aria-label="Livelli di difficoltà per età"
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                      {(['facile', 'medio', 'esperto'] as DifficultyLevel[]).map(
                        (lvl) => {
                          const cfg = DIFFICULTY_CONFIGS[lvl];
                          const isActive = difficulty === lvl;
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => {
                                playTapSound(soundEnabled);
                                setDifficulty(lvl);
                              }}
                              aria-pressed={isActive}
                              className={`rounded-2xl p-3.5 border-2 text-left transition-all cursor-pointer active:scale-95 ${
                                isActive
                                  ? 'bg-[#F0FDF4] border-[#0F5132] shadow-xs'
                                  : 'bg-[#F8FAFC] border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              <div className="font-display font-extrabold text-sm text-slate-900">
                                {cfg.label} · {cfg.ageRange}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-snug">
                                {cfg.subtitle}
                              </p>
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>

                {/* Hero Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => startGame('colori')}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-red-600 text-white font-display font-bold text-base hover:bg-red-700 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
                    >
                      <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                      <span>Inizia con Elfa Rossella</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleHeroRossella}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border font-bold text-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        speakingTag === 'hero-rossella'
                          ? 'bg-amber-400 border-amber-500 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {speakingTag === 'hero-rossella' ? (
                        <>
                          <Square className="w-4 h-4 fill-current" aria-hidden="true" />
                          <span>Ferma</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" aria-hidden="true" />
                          <span>Ascolta Elfa Rossella</span>
                        </>
                      )}
                    </button>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {activeDifficultyConfig.roundsCount} sfide per partita
                  </span>
                </div>
              </div>

              {/* Right Column: Christmas Elf Workshop Illustration + Featured Elfa Rossella Card */}
              <div className="lg:col-span-5 rounded-3xl overflow-hidden border border-[#0F5132] bg-[#0F5132] shadow-sm flex flex-col p-3">
                <div className="relative flex-1 min-h-[220px] rounded-2xl overflow-hidden bg-[#14532D] flex items-center justify-center">
                  {!heroImgFailed ? (
                    <>
                      <img
                        src={HERO_IMAGE_URL}
                        alt="Bottega di Natale degli Elfi con lanterna calda, albero illuminato e forme geometriche in legno colorate sul tavolo"
                        referrerPolicy="no-referrer"
                        onError={() => setHeroImgFailed(true)}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0F5132] to-transparent"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <div className="p-8 grid grid-cols-2 gap-5 place-items-center">
                      <ShapeSvg shape="cerchio" colorHex="#DC2626" borderHex="#991B1B" className="w-20 h-20" />
                      <ShapeSvg shape="quadrato" colorHex="#2563EB" borderHex="#1E40AF" className="w-20 h-20" />
                      <ShapeSvg shape="triangolo" colorHex="#EAB308" borderHex="#A16207" className="w-20 h-20" />
                      <ShapeSvg shape="stella" colorHex="#16A34A" borderHex="#166534" className="w-20 h-20" />
                    </div>
                  )}
                </div>

                {/* Featured Elf Spotlight: Elfa Rossella first! */}
                <div className="pt-4 pb-2 px-2 bg-[#0F5132] text-white flex items-center gap-4">
                  <ElfAvatarSvg
                    elfId="rossella"
                    className="w-16 h-16 rounded-2xl shrink-0 border-2 border-amber-300"
                  />
                  <div className="min-w-0">
                    <h2 className="font-display text-base font-extrabold text-white">
                      La voce di Elfa Rossella
                    </h2>
                    <p className="text-xs text-emerald-100 leading-relaxed mt-0.5">
                      {ELVES.rossella.bio}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Game Modes Grid (Each paired with its Elf Equiper) */}
            <div className={limMode ? 'mb-5' : 'mb-8'}>
              <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-slate-900">
                    Le Attività con gli Elfi Equipers
                  </h2>
                  <p className="text-sm text-slate-600">
                    Livello attivo: {activeDifficultyConfig.label} ({activeDifficultyConfig.ageRange})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigate('DASHBOARD')}
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-900 hover:underline cursor-pointer whitespace-nowrap"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" aria-hidden="true" />
                  <span className="tabular-nums">
                    {stats.totalStars} stelle · {unlockedMedalsCount}/{CHRISTMAS_MEDALS.length} medaglie
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Trova il Colore — Elfa Rossella */}
                <button
                  type="button"
                  onClick={() => startGame('colori')}
                  className="group bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left flex flex-col justify-between hover:-translate-y-1 hover:border-slate-400 active:scale-95 transition-all cursor-pointer"
                >
                  <div>
                    <div className="w-full h-24 rounded-2xl bg-[#FEF2F2] border border-[#F5E1E1] flex items-center justify-between px-4 mb-4">
                      <ShapeSvg
                        shape="cerchio"
                        colorHex="#DC2626"
                        borderHex="#991B1B"
                        className="w-16 h-16 transition-transform duration-150 group-hover:scale-105"
                      />
                      <ElfAvatarSvg elfId="rossella" className="w-16 h-16 rounded-2xl" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 mb-1">
                      <Palette className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>1. Elfa Rossella</span>
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900 mb-1">
                      Trova il Colore
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ascolta il colore richiesto e tocca il blocco giusto.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center text-sm font-bold text-red-700 group-hover:underline">
                    Gioca ora →
                  </span>
                </button>

                {/* 2. Incastra le Forme — Elfo Lorenzo */}
                <button
                  type="button"
                  onClick={() => startGame('incastri')}
                  className="group bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left flex flex-col justify-between hover:-translate-y-1 hover:border-slate-400 active:scale-95 transition-all cursor-pointer"
                >
                  <div>
                    <div className="w-full h-24 rounded-2xl bg-[#F0FDF4] border border-[#D8F1DF] flex items-center justify-between px-4 mb-4">
                      <ShapeSvg
                        shape="quadrato"
                        colorHex="#16A34A"
                        borderHex="#166534"
                        className="w-16 h-16 transition-transform duration-150 group-hover:scale-105"
                      />
                      <ElfAvatarSvg elfId="lorenzo" className="w-16 h-16 rounded-2xl" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
                      <Puzzle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>2. Elfo Lorenzo</span>
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900 mb-1">
                      Incastra le Forme
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Trascina o usa il doppio tocco sulla tavola di legno.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center text-sm font-bold text-emerald-800 group-hover:underline">
                    Gioca ora →
                  </span>
                </button>

                {/* 3. Sfida Slitta Forme — Elfo Antonio */}
                <button
                  type="button"
                  onClick={() => startGame('forme')}
                  className="group bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left flex flex-col justify-between hover:-translate-y-1 hover:border-slate-400 active:scale-95 transition-all cursor-pointer"
                >
                  <div>
                    <div className="w-full h-24 rounded-2xl bg-[#EFF6FF] border border-[#DCE8F8] flex items-center justify-between px-4 mb-4">
                      <ShapeSvg
                        shape="triangolo"
                        colorHex="#2563EB"
                        borderHex="#1E40AF"
                        className="w-16 h-16 transition-transform duration-150 group-hover:scale-105"
                      />
                      <ElfAvatarSvg elfId="antonio" className="w-16 h-16 rounded-2xl" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
                      <Shapes className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>3. Elfo Antonio</span>
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900 mb-1">
                      Trova la Forma
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Carica cerchi, triangoli, stelle e figure sulla slitta.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center text-sm font-bold text-slate-900 group-hover:underline">
                    Gioca ora →
                  </span>
                </button>

                {/* 4. Abbina le Forme — Elfo Alfredo */}
                <button
                  type="button"
                  onClick={() => startGame('misto')}
                  className="group bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left flex flex-col justify-between hover:-translate-y-1 hover:border-slate-400 active:scale-95 transition-all cursor-pointer"
                >
                  <div>
                    <div className="w-full h-24 rounded-2xl bg-[#ECFDF5] border border-[#CDEFE0] flex items-center justify-between px-4 mb-4">
                      <ShapeSvg
                        shape="stella"
                        colorHex="#16A34A"
                        borderHex="#166534"
                        className="w-16 h-16 transition-transform duration-150 group-hover:scale-105"
                      />
                      <ElfAvatarSvg elfId="alfredo" className="w-16 h-16 rounded-2xl" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
                      <Grid2x2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>4. Elfo Alfredo</span>
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900 mb-1">
                      Abbina le Forme
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Componi forme e colori insieme in base alla tua età per vincere stelle.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center text-sm font-bold text-emerald-800 group-hover:underline">
                    Gioca ora →
                  </span>
                </button>

                {/* 5. Medaglie & Certificato PDF — Elfa Stella */}
                <button
                  type="button"
                  onClick={() => handleNavigate('DASHBOARD')}
                  className="group bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left flex flex-col justify-between hover:-translate-y-1 hover:border-slate-400 active:scale-95 transition-all cursor-pointer"
                >
                  <div>
                    <div className="w-full h-24 rounded-2xl bg-[#FEFCE8] border border-[#F3ECC2] flex items-center justify-between px-4 mb-4">
                      <ShapeSvg
                        shape="cuore"
                        colorHex="#EAB308"
                        borderHex="#A16207"
                        className="w-16 h-16 transition-transform duration-150 group-hover:scale-105"
                      />
                      <ElfAvatarSvg elfId="stella" className="w-16 h-16 rounded-2xl" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
                      <Star className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>5. Elfa Stella</span>
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900 mb-1">
                      Medaglie & PDF
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Controlla le stelle vinte e scarica il Certificato finale.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center text-sm font-bold text-amber-800 group-hover:underline">
                    Apri Dashboard →
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom Shapes & Objects Preview Strip (as in reference screenshot) */}
            {!limMode && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                    Forme e oggetti ({activeDifficultyConfig.ageRange})
                  </h3>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {levelShapes.length} figure · {levelColors.length} colori
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-3">
                  {levelShapes.map((shp, idx) => {
                    const col = levelColors[idx % levelColors.length];
                    return (
                      <button
                        key={shp.id}
                        type="button"
                        onClick={() => handleNavigate('EXPLORE')}
                        className="rounded-2xl bg-[#FAF8F4] border border-slate-200 p-3 text-center hover:border-slate-400 active:scale-95 transition-all cursor-pointer"
                      >
                        <div className="flex justify-center mb-2">
                          <ShapeSvg
                            shape={shp.id}
                            colorHex={col.hex}
                            borderHex={col.darkHex}
                            className="w-11 h-11"
                          />
                        </div>
                        <div className="font-display font-bold text-xs text-slate-900 truncate">
                          {shp.name}
                        </div>
                        <div className="text-[11px] font-medium text-emerald-800 truncate">
                          {shp.xmasGift}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'PLAYING' && activeMode !== 'incastri' && (
          <QuizGameMode
            key={`quiz-${activeMode}-${difficulty}-${gameInstanceKey}`}
            mode={activeMode}
            difficulty={difficulty}
            soundEnabled={soundEnabled}
            limMode={limMode}
            onComplete={handleGameComplete}
            onRecordMastery={handleRecordMastery}
            onBack={() => setView('TITLE_MENU')}
          />
        )}

        {view === 'PLAYING' && activeMode === 'incastri' && (
          <MatchingGameMode
            key={`match-${difficulty}-${gameInstanceKey}`}
            difficulty={difficulty}
            soundEnabled={soundEnabled}
            limMode={limMode}
            onComplete={handleGameComplete}
            onRecordMastery={handleRecordMastery}
            onBack={() => setView('TITLE_MENU')}
          />
        )}

        {view === 'ROUND_SUMMARY' && lastSummary && (
          <RoundSummary
            summary={lastSummary}
            onPlayAgain={() => startGame(lastSummary.mode)}
            onOpenDashboard={() => handleNavigate('DASHBOARD')}
            onBackToMenu={() => setView('TITLE_MENU')}
          />
        )}

        {view === 'EXPLORE' && (
          <ExploreMode
            key={`explore-${exploreTab}-${difficulty}-${gameInstanceKey}`}
            difficulty={difficulty}
            soundEnabled={soundEnabled}
            initialTab={exploreTab}
            onComplete={handleGameComplete}
            onRecordMastery={handleRecordMastery}
            onBack={() => setView('TITLE_MENU')}
          />
        )}

        {view === 'DASHBOARD' && (
          <DashboardView
            stats={stats}
            soundEnabled={soundEnabled}
            onResetStats={handleResetStats}
            onBack={() => setView('TITLE_MENU')}
          />
        )}

        {view === 'INSTRUCTIONS' && (
          <InstructionsView
            soundEnabled={soundEnabled}
            onBack={() => setView('TITLE_MENU')}
          />
        )}

        {view === 'CREDITS' && (
          <CreditsView
            soundEnabled={soundEnabled}
            onBack={() => setView('TITLE_MENU')}
          />
        )}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/image_0299a0fc.png"
              alt="Logo Équipe Formativa Calabria"
              referrerPolicy="no-referrer"
              className="h-6 w-auto object-contain"
            />
            <span className="font-semibold text-slate-800">
              Missione Natale: Atelier delle Forme e dei Colori · Xmas Lab · EFT Calabria
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-semibold tabular-nums">
            <span>Stelle: {stats.totalStars}</span>
            <span aria-hidden="true">·</span>
            <span>Medaglie: {unlockedMedalsCount}/{CHRISTMAS_MEDALS.length}</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleNavigate('INSTRUCTIONS')}
              className="hover:text-slate-900 underline cursor-pointer"
            >
              Istruzioni
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('CREDITS')}
              className="hover:text-slate-900 underline cursor-pointer"
            >
              Elfi Equipers
            </button>
            <a
              href="https://www.istruzione.calabria.it/EFT/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 underline"
            >
              <span>EFT Calabria</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
