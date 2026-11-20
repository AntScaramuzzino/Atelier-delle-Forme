import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Compass,
  HelpCircle,
  Sparkles,
  Square,
  Star,
  Volume2,
} from 'lucide-react';
import { ELVES } from '../data/elves';
import {
  DIFFICULTY_CONFIGS,
  GAME_COLORS,
  GAME_SHAPES,
  getColorsForDifficulty,
  getShapesForDifficulty,
  shuffleArray,
  type ColorId,
  type DifficultyLevel,
  type GameColor,
  type GameShape,
  type ShapeId,
} from '../data/gameCatalog';
import {
  playCelebrationFanfare,
  playSoftRetrySound,
  playSuccessChime,
  playTapSound,
  speakAsElf,
  stopSpeaking,
  subscribeSpeechState,
} from '../utils/sound';
import { ConfettiBurst } from './ConfettiBurst';
import { ElfAvatarSvg } from './ElfAvatarSvg';
import { ShapeSvg } from './ShapeSvg';
import type { RoundResultSummary } from './RoundSummary';

interface ExploreModeProps {
  difficulty: DifficultyLevel;
  soundEnabled: boolean;
  initialTab?: 'abbina' | 'scopri';
  onComplete: (summary: RoundResultSummary) => void;
  onRecordMastery: (colorId: ColorId, shapeId: ShapeId, stars: number) => void;
  onBack: () => void;
}

interface BuilderTarget {
  color: GameColor;
  shape: GameShape;
}

function buildAlfredoTargets(difficulty: DifficultyLevel): BuilderTarget[] {
  const cfg = DIFFICULTY_CONFIGS[difficulty];
  const colors = shuffleArray(getColorsForDifficulty(difficulty));
  const shapes = shuffleArray(getShapesForDifficulty(difficulty));
  const pairs: BuilderTarget[] = [];

  for (let i = 0; i < cfg.roundsCount; i++) {
    const color = colors[i % colors.length];
    const shape = shapes[(i * 2 + Math.floor(i / colors.length)) % shapes.length];
    pairs.push({ color, shape });
  }
  return shuffleArray(pairs);
}

export function ExploreMode({
  difficulty,
  soundEnabled,
  initialTab = 'abbina',
  onComplete,
  onRecordMastery,
  onBack,
}: ExploreModeProps) {
  const [tab, setTab] = useState<'abbina' | 'scopri'>(initialTab);
  const [selectedColorId, setSelectedColorId] = useState<ColorId>('rosso');
  const [selectedShapeId, setSelectedShapeId] = useState<ShapeId>('cerchio');
  const [bounceKey, setBounceKey] = useState(0);
  const [speakingTag, setSpeakingTag] = useState<string | null>(null);

  // Challenge state ("Sfida Abbina e Vinci" with Elfo Alfredo)
  const targets = useMemo(() => buildAlfredoTargets(difficulty), [difficulty]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [hadWrongThisRound, setHadWrongThisRound] = useState(false);
  const [isRoundSolved, setIsRoundSolved] = useState(false);
  const [shakingStage, setShakingStage] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'hint';
    text: string;
  } | null>(null);

  const practicedColorsRef = useRef<ColorId[]>([]);
  const practicedShapesRef = useRef<ShapeId[]>([]);
  const advanceTimerRef = useRef<number | null>(null);

  const elf = ELVES.alfredo;
  const availableColors = getColorsForDifficulty(difficulty);
  const availableShapes = getShapesForDifficulty(difficulty);

  const selectedColor =
    availableColors.find((c) => c.id === selectedColorId) ?? availableColors[0];
  const selectedShape =
    availableShapes.find((s) => s.id === selectedShapeId) ?? availableShapes[0];

  const currentTarget = targets[roundIndex];

  useEffect(() => {
    return subscribeSpeechState(setSpeakingTag);
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
      stopSpeaking();
    };
  }, []);

  // Ensure initial selection in Abbina mode doesn't accidentally start already solved
  useEffect(() => {
    if (tab !== 'abbina' || !currentTarget) return;
    const altColor =
      availableColors.find((c) => c.id !== currentTarget.color.id) ??
      availableColors[0];
    const altShape =
      availableShapes.find((s) => s.id !== currentTarget.shape.id) ??
      availableShapes[0];
    setSelectedColorId(altColor.id);
    setSelectedShapeId(altShape.id);
    setFeedbackBanner(null);
    setIsRoundSolved(false);
  }, [tab, roundIndex, currentTarget]);

  useEffect(() => {
    if (tab !== 'abbina' || !currentTarget || !soundEnabled) return;
    const timer = window.setTimeout(() => {
      speakAsElf(
        `Ciao da Elfo Alfredo! Preparami ${currentTarget.shape.articleAndName} di colore ${currentTarget.color.name}!`,
        'alfredo',
        soundEnabled,
        { utteranceTag: `alfredo-target-${roundIndex}` },
      );
    }, 180);
    return () => window.clearTimeout(timer);
  }, [tab, roundIndex, currentTarget, soundEnabled]);

  const handleSelectColor = (colorId: ColorId) => {
    if (isRoundSolved && tab === 'abbina') return;
    setSelectedColorId(colorId);
    setBounceKey((k) => k + 1);
    playTapSound(soundEnabled);
    const col = GAME_COLORS.find((c) => c.id === colorId);
    if (!col) return;

    if (tab === 'scopri') {
      speakAsElf(
        `${selectedShape.name} ${col.name}. ${col.example}, come ${col.xmasObject}!`,
        'alfredo',
        soundEnabled,
        { utteranceTag: 'abbina-stage' },
      );
    } else {
      speakAsElf(col.name, 'alfredo', soundEnabled);
    }
  };

  const handleSelectShape = (shapeId: ShapeId) => {
    if (isRoundSolved && tab === 'abbina') return;
    setSelectedShapeId(shapeId);
    setBounceKey((k) => k + 1);
    playTapSound(soundEnabled);
    const shp = GAME_SHAPES.find((s) => s.id === shapeId);
    if (!shp) return;

    if (tab === 'scopri') {
      speakAsElf(
        `${shp.name} ${selectedColor.name}. ${shp.description}`,
        'alfredo',
        soundEnabled,
        { utteranceTag: 'abbina-stage' },
      );
    } else {
      speakAsElf(shp.name, 'alfredo', soundEnabled);
    }
  };

  const handleCheckCombination = () => {
    if (!currentTarget || isRoundSolved) return;

    const colorOk = selectedColorId === currentTarget.color.id;
    const shapeOk = selectedShapeId === currentTarget.shape.id;

    if (colorOk && shapeOk) {
      setIsRoundSolved(true);
      setShowConfetti(true);

      const newStars = starsEarned + 1;
      const newFirstTry = hadWrongThisRound ? firstTryCount : firstTryCount + 1;
      setStarsEarned(newStars);
      setFirstTryCount(newFirstTry);

      practicedColorsRef.current.push(currentTarget.color.id);
      practicedShapesRef.current.push(currentTarget.shape.id);
      onRecordMastery(currentTarget.color.id, currentTarget.shape.id, 1);

      const praise = `Perfetto! Hai preparato ${currentTarget.shape.articleAndName} ${currentTarget.color.name}!`;
      setFeedbackBanner({ type: 'success', text: praise });

      const isLast = roundIndex + 1 >= targets.length;
      if (isLast) {
        playCelebrationFanfare(soundEnabled);
        speakAsElf(`Evviva! ${praise}`, 'alfredo', soundEnabled);
      } else {
        playSuccessChime(soundEnabled);
        speakAsElf(praise, 'alfredo', soundEnabled);
      }

      advanceTimerRef.current = window.setTimeout(() => {
        setShowConfetti(false);
        if (isLast) {
          onComplete({
            mode: 'misto',
            starsEarned: newStars,
            totalRounds: targets.length,
            firstTryCount: newFirstTry,
            practicedColors: practicedColorsRef.current,
            practicedShapes: practicedShapesRef.current,
          });
        } else {
          setRoundIndex((i) => i + 1);
          setHadWrongThisRound(false);
          setFeedbackBanner(null);
          setIsRoundSolved(false);
        }
      }, 1300);
    } else {
      setHadWrongThisRound(true);
      setShakingStage(true);
      window.setTimeout(() => setShakingStage(false), 380);
      playSoftRetrySound(soundEnabled);

      let hint = '';
      if (colorOk && !shapeOk) {
        hint = `Il colore ${currentTarget.color.name} è giusto! Ora scegli ${currentTarget.shape.articleAndName}.`;
      } else if (!colorOk && shapeOk) {
        hint = `La forma ${currentTarget.shape.name} è giusta! Ora tocca il colore ${currentTarget.color.name}.`;
      } else {
        hint = `Hai composto ${selectedShape.articleAndName} ${selectedColor.name}. Proviamo a cercare ${currentTarget.shape.articleAndName} ${currentTarget.color.name}!`;
      }
      setFeedbackBanner({ type: 'hint', text: hint });
      speakAsElf(hint, 'alfredo', soundEnabled);
    }
  };

  const activeSpeechTag =
    tab === 'abbina' ? `alfredo-target-${roundIndex}` : 'abbina-stage';
  const isSpeaking = speakingTag === activeSpeechTag;

  const handleToggleListen = useCallback(() => {
    playTapSound(soundEnabled);
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (tab === 'abbina' && currentTarget) {
      speakAsElf(
        `Ciao da Elfo Alfredo! Componi ${currentTarget.shape.articleAndName} di colore ${currentTarget.color.name}!`,
        'alfredo',
        soundEnabled,
        { forcePlay: true, utteranceTag: activeSpeechTag },
      );
    } else {
      speakAsElf(
        `Ciao da Elfo Alfredo! Questo è ${selectedShape.articleAndName} ${selectedColor.name}. ${selectedShape.description}`,
        'alfredo',
        soundEnabled,
        { forcePlay: true, utteranceTag: activeSpeechTag },
      );
    }
  }, [
    activeSpeechTag,
    currentTarget,
    isSpeaking,
    selectedColor.name,
    selectedShape.articleAndName,
    selectedShape.description,
    soundEnabled,
    tab,
  ]);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
      <ConfettiBurst active={showConfetti} />

      {/* Header bar with mode switch */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            onBack();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-sm hover:bg-slate-50 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Torna ai Giochi</span>
        </button>

        {/* Segmented Control: Sfida Abbina vs Scopri Liberamente */}
        <div
          role="group"
          aria-label="Modalità di Elfo Alfredo"
          className="inline-flex items-center gap-1 p-1 bg-slate-200/80 rounded-2xl"
        >
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              playTapSound(soundEnabled);
              setTab('abbina');
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              tab === 'abbina'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span>Sfida Abbina e Vinci ★</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              playTapSound(soundEnabled);
              setTab('scopri');
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              tab === 'scopri'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <span>Scopri Liberamente</span>
          </button>
        </div>

        {tab === 'abbina' ? (
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 tabular-nums">
            <span>
              Sfida {roundIndex + 1} / {targets.length}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5 text-slate-900 font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" aria-hidden="true" />
              {starsEarned}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <ElfAvatarSvg elfId="alfredo" className="w-8 h-8 rounded-xl" />
            <span>
              Abbina le Forme · {elf.name} ({DIFFICULTY_CONFIGS[difficulty].ageRange})
            </span>
          </div>
        )}
      </div>

      {/* Challenge Prompt Banner in Abbina mode */}
      {tab === 'abbina' && currentTarget && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <ElfAvatarSvg
              elfId="alfredo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0 border border-slate-200"
            />

            {difficulty === 'facile' && (
              <div
                className="w-16 h-16 rounded-2xl border border-slate-200 bg-[#F8FAFC] flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <ShapeSvg
                  shape={currentTarget.shape.id}
                  colorHex={currentTarget.color.hex}
                  borderHex={currentTarget.color.darkHex}
                  className="w-11 h-11"
                />
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-emerald-700 mb-0.5">
                {elf.name} · {DIFFICULTY_CONFIGS[difficulty].label} ({DIFFICULTY_CONFIGS[difficulty].ageRange})
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 text-balance">
                Preparami {currentTarget.shape.articleAndName} {currentTarget.color.name}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Scegli un colore e una forma qui sotto, poi premi “Consegna ad Alfredo!”.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleListen}
            className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isSpeaking
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
            }`}
          >
            {isSpeaking ? (
              <>
                <Square className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>Ferma</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                <span>Ascolta</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Feedback Banner */}
      {tab === 'abbina' && feedbackBanner && (
        <div className="mb-5 flex items-center justify-center">
          <div
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border text-sm sm:text-base font-bold ${
              feedbackBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            {feedbackBanner.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
            ) : (
              <HelpCircle className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
            )}
            <span>{feedbackBanner.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Workbench Preview Stage */}
        <div
          className={`lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center ${
            shakingStage ? 'animate-gentle-shake' : ''
          }`}
        >
          <div
            key={bounceKey}
            className="w-full aspect-square max-w-[240px] rounded-2xl flex items-center justify-center mb-5 animate-pop-celebrate border border-slate-200"
            style={{ backgroundColor: selectedColor.lightBg }}
          >
            <ShapeSvg
              shape={selectedShape.id}
              colorHex={selectedColor.hex}
              borderHex={selectedColor.darkHex}
              className="w-44 h-44 sm:w-48 sm:h-48"
            />
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1.5 text-balance">
            {selectedShape.name} {selectedColor.name}
          </h3>

          <p className="text-sm font-semibold text-slate-500 mb-3">
            {selectedShape.sidesLabel} <span aria-hidden="true">·</span> {selectedShape.xmasGift}
          </p>

          {tab === 'scopri' ? (
            <>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6 max-w-sm">
                {selectedShape.description}
              </p>

              <button
                type="button"
                onClick={handleToggleListen}
                className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-base active:scale-95 transition-all cursor-pointer whitespace-nowrap ${
                  isSpeaking
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>Ferma</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" aria-hidden="true" />
                    <span>Ascolta Elfo Alfredo</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCheckCombination}
              disabled={isRoundSolved}
              className="mt-2 w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#0F5132] text-white font-display font-bold text-lg hover:bg-emerald-900 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              <span>Consegna ad Alfredo!</span>
            </button>
          )}
        </div>

        {/* Right: Color & Shape Selector Trays */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 mb-4">
              1. Scegli un Colore
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {availableColors.map((color) => {
                const isSelected = color.id === selectedColorId;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleSelectColor(color.id)}
                    aria-pressed={isSelected}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer min-h-[60px] active:scale-95 ${
                      isSelected
                        ? 'border-slate-900 bg-[#F8FAFC] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <span
                      className="w-10 h-10 rounded-xl shrink-0 border border-black/15"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden="true"
                    />
                    <span className="font-display font-bold text-base text-slate-900 truncate">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 mb-4">
              2. Scegli una Forma
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {availableShapes.map((shape) => {
                const isSelected = shape.id === selectedShapeId;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => handleSelectShape(shape.id)}
                    aria-pressed={isSelected}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all cursor-pointer min-h-[64px] active:scale-95 ${
                      isSelected
                        ? 'border-slate-900 bg-[#F8FAFC] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <ShapeSvg
                      shape={shape.id}
                      colorHex={selectedColor.hex}
                      borderHex={selectedColor.darkHex}
                      className="w-10 h-10 shrink-0"
                    />
                    <span className="font-display font-bold text-base text-slate-900 truncate">
                      {shape.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
