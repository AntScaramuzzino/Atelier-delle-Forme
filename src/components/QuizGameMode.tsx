import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Square,
  Star,
  Volume2,
} from 'lucide-react';
import { ELVES, type ElfId } from '../data/elves';
import {
  DIFFICULTY_CONFIGS,
  getColorsForDifficulty,
  getShapesForDifficulty,
  shuffleArray,
  type ColorId,
  type DifficultyLevel,
  type GameColor,
  type GameMode,
  type GameShape,
  type ShapeId,
} from '../data/gameCatalog';
import {
  playCelebrationFanfare,
  playSoftRetrySound,
  playSuccessChime,
  speakAsElf,
  stopSpeaking,
  subscribeSpeechState,
} from '../utils/sound';
import { ConfettiBurst } from './ConfettiBurst';
import { ElfAvatarSvg } from './ElfAvatarSvg';
import { ShapeSvg } from './ShapeSvg';
import type { RoundResultSummary } from './RoundSummary';

interface QuizOption {
  id: string;
  color: GameColor;
  shape: GameShape;
  isTarget: boolean;
}

interface QuizQuestion {
  targetColor: GameColor;
  targetShape: GameShape;
  promptText: string;
  riddleLine?: string;
  spokenText: string;
  options: QuizOption[];
}

interface QuizGameModeProps {
  mode: Exclude<GameMode, 'incastri'>;
  difficulty: DifficultyLevel;
  soundEnabled: boolean;
  limMode: boolean;
  onComplete: (summary: RoundResultSummary) => void;
  onRecordMastery: (colorId: ColorId, shapeId: ShapeId, stars: number) => void;
  onBack: () => void;
}

function buildQuestions(
  mode: Exclude<GameMode, 'incastri'>,
  difficulty: DifficultyLevel,
): QuizQuestion[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const colors = getColorsForDifficulty(difficulty);
  const shapes = getShapesForDifficulty(difficulty);
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < config.roundsCount; i++) {
    const targetColor = colors[i % colors.length];
    const targetShape =
      shapes[(i * 2 + Math.floor(i / colors.length)) % shapes.length];

    const shuffledColors = shuffleArray(colors);
    const shuffledShapes = shuffleArray(shapes);

    if (mode === 'colori') {
      const distractorColors = shuffledColors
        .filter((c) => c.id !== targetColor.id)
        .slice(0, config.choiceCount - 1);

      const optionColors = shuffleArray([targetColor, ...distractorColors]);
      const options: QuizOption[] = optionColors.map((col, idx) => ({
        id: `${i}-c-${col.id}`,
        color: col,
        shape:
          difficulty === 'facile'
            ? targetShape
            : shuffledShapes[idx % shuffledShapes.length],
        isTarget: col.id === targetColor.id,
      }));

      questions.push({
        targetColor,
        targetShape,
        promptText: `Tocca il colore ${targetColor.name}!`,
        riddleLine: `${targetColor.xmasObject} · ${targetColor.example}`,
        spokenText: `Ciao! Sono Elfa Rossella. Tocca il colore ${targetColor.name}, ${targetColor.example}!`,
        options,
      });
    } else if (mode === 'forme') {
      const distractorShapes = shuffledShapes
        .filter((s) => s.id !== targetShape.id)
        .slice(0, config.choiceCount - 1);

      const optionShapes = shuffleArray([targetShape, ...distractorShapes]);
      const options: QuizOption[] = optionShapes.map((shp, idx) => ({
        id: `${i}-s-${shp.id}`,
        color: shuffledColors[idx % shuffledColors.length],
        shape: shp,
        isTarget: shp.id === targetShape.id,
      }));

      questions.push({
        targetColor,
        targetShape,
        promptText: `Carica sulla slitta ${targetShape.articleAndName}!`,
        riddleLine: `Regalo di Natale: ${targetShape.xmasGift}`,
        spokenText: `Qui è Elfo Antonio dalla slitta! Trova ${targetShape.articleAndName} per preparare ${targetShape.xmasGift}!`,
        options,
      });
    } else {
      const distractors: Array<{ color: GameColor; shape: GameShape }> = [];
      const altColor =
        shuffledColors.find((c) => c.id !== targetColor.id) ?? colors[0];
      distractors.push({ color: altColor, shape: targetShape });

      const altShape =
        shuffledShapes.find((s) => s.id !== targetShape.id) ?? shapes[0];
      distractors.push({ color: targetColor, shape: altShape });

      for (const s of shuffledShapes) {
        for (const c of shuffledColors) {
          if (distractors.length >= config.choiceCount - 1) break;
          if (s.id === targetShape.id && c.id === targetColor.id) continue;
          if (
            distractors.some((d) => d.shape.id === s.id && d.color.id === c.id)
          ) {
            continue;
          }
          distractors.push({ color: c, shape: s });
        }
        if (distractors.length >= config.choiceCount - 1) break;
      }

      const rawOptions = shuffleArray([
        { color: targetColor, shape: targetShape, isTarget: true },
        ...distractors.slice(0, config.choiceCount - 1).map((d) => ({
          ...d,
          isTarget: false,
        })),
      ]);

      const options: QuizOption[] = rawOptions.map((opt, idx) => ({
        id: `${i}-m-${opt.shape.id}-${opt.color.id}-${idx}`,
        color: opt.color,
        shape: opt.shape,
        isTarget: opt.isTarget,
      }));

      questions.push({
        targetColor,
        targetShape,
        promptText: `Trova ${targetShape.articleAndName} ${targetColor.name}!`,
        riddleLine: `Sfida di Elfo Alfredo · ${targetShape.riddle}`,
        spokenText: `Ciao da Elfo Alfredo! ${targetShape.riddle} Trova ${targetShape.articleAndName} di colore ${targetColor.name}!`,
        options,
      });
    }
  }

  return shuffleArray(questions);
}

const MODE_META: Record<
  Exclude<GameMode, 'incastri'>,
  { title: string; elfId: ElfId }
> = {
  colori: { title: 'Trova il Colore', elfId: 'rossella' },
  forme: { title: 'Trova la Forma · Slitta', elfId: 'antonio' },
  misto: { title: 'Abbina le Forme', elfId: 'alfredo' },
};

export function QuizGameMode({
  mode,
  difficulty,
  soundEnabled,
  limMode,
  onComplete,
  onRecordMastery,
  onBack,
}: QuizGameModeProps) {
  const questions = useMemo(
    () => buildQuestions(mode, difficulty),
    [mode, difficulty],
  );
  const meta = MODE_META[mode];
  const elf = ELVES[meta.elfId];

  const [roundIndex, setRoundIndex] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [hadWrongThisRound, setHadWrongThisRound] = useState(false);
  const [wrongOptionIds, setWrongOptionIds] = useState<string[]>([]);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [solvedOptionId, setSolvedOptionId] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'hint';
    text: string;
  } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [speakingTag, setSpeakingTag] = useState<string | null>(null);

  const practicedColorsRef = useRef<ColorId[]>([]);
  const practicedShapesRef = useRef<ShapeId[]>([]);
  const advanceTimerRef = useRef<number | null>(null);

  const currentQuestion = questions[roundIndex];

  useEffect(() => {
    return subscribeSpeechState(setSpeakingTag);
  }, []);

  useEffect(() => {
    if (!currentQuestion || !soundEnabled) return;
    const speakTimer = window.setTimeout(() => {
      speakAsElf(currentQuestion.spokenText, meta.elfId, soundEnabled, {
        utteranceTag: `quiz-prompt-${roundIndex}`,
      });
    }, 180);

    return () => {
      window.clearTimeout(speakTimer);
    };
  }, [roundIndex, currentQuestion, soundEnabled, meta.elfId]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
      stopSpeaking();
    };
  }, []);

  const isPromptSpeaking = speakingTag === `quiz-prompt-${roundIndex}`;

  const handleTogglePromptSpeech = useCallback(() => {
    if (!currentQuestion) return;
    if (isPromptSpeaking) {
      stopSpeaking();
    } else {
      speakAsElf(currentQuestion.spokenText, meta.elfId, soundEnabled, {
        forcePlay: true,
        utteranceTag: `quiz-prompt-${roundIndex}`,
      });
    }
  }, [currentQuestion, isPromptSpeaking, meta.elfId, roundIndex, soundEnabled]);

  const handleOptionTap = (option: QuizOption) => {
    if (solvedOptionId !== null) return;

    if (option.isTarget) {
      setSolvedOptionId(option.id);
      setShowConfetti(true);

      const newStars = starsEarned + 1;
      const newFirstTry = hadWrongThisRound ? firstTryCount : firstTryCount + 1;
      setStarsEarned(newStars);
      setFirstTryCount(newFirstTry);

      practicedColorsRef.current.push(option.color.id);
      practicedShapesRef.current.push(option.shape.id);
      onRecordMastery(option.color.id, option.shape.id, 1);

      const praiseText =
        mode === 'colori'
          ? `Bravo! Questo è ${option.color.articleAndName}!`
          : mode === 'forme'
            ? `Bravissimo! Hai caricato ${option.shape.articleAndName} sulla slitta!`
            : `Perfetto! È ${option.shape.articleAndName} ${option.color.name}!`;

      setFeedbackBanner({ type: 'success', text: praiseText });

      const isLastRound = roundIndex + 1 >= questions.length;
      if (isLastRound) {
        playCelebrationFanfare(soundEnabled);
        speakAsElf(`Evviva! ${praiseText}`, meta.elfId, soundEnabled);
      } else {
        playSuccessChime(soundEnabled);
        speakAsElf(praiseText, meta.elfId, soundEnabled);
      }

      advanceTimerRef.current = window.setTimeout(() => {
        setShowConfetti(false);
        if (isLastRound) {
          onComplete({
            mode,
            starsEarned: newStars,
            totalRounds: questions.length,
            firstTryCount: newFirstTry,
            practicedColors: practicedColorsRef.current,
            practicedShapes: practicedShapesRef.current,
          });
        } else {
          setRoundIndex((idx) => idx + 1);
          setSolvedOptionId(null);
          setHadWrongThisRound(false);
          setWrongOptionIds([]);
          setFeedbackBanner(null);
        }
      }, 1300);
    } else {
      setHadWrongThisRound(true);
      if (!wrongOptionIds.includes(option.id)) {
        setWrongOptionIds((prev) => [...prev, option.id]);
      }
      setShakingId(option.id);
      window.setTimeout(() => setShakingId(null), 380);

      playSoftRetrySound(soundEnabled);

      let hintText = '';
      if (mode === 'colori') {
        hintText = `Quello è ${option.color.articleAndName}. Cerchiamo ${currentQuestion.targetColor.articleAndName}!`;
      } else if (mode === 'forme') {
        hintText = `Quello è ${option.shape.articleAndName}. Cerchiamo ${currentQuestion.targetShape.articleAndName}!`;
      } else {
        hintText = `Quello è ${option.shape.articleAndName} ${option.color.name}. Riprova!`;
      }

      setFeedbackBanner({ type: 'hint', text: hintText });
      speakAsElf(hintText, meta.elfId, soundEnabled);
    }
  };

  if (!currentQuestion) return null;

  const gridColsClass =
    currentQuestion.options.length <= 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : currentQuestion.options.length === 4
        ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4'
        : 'grid-cols-2 sm:grid-cols-3';

  return (
    <section
      className={`max-w-6xl mx-auto px-4 sm:px-6 ${limMode ? 'py-4' : 'py-7'}`}
      style={limMode ? { touchAction: 'none' } : undefined}
    >
      <ConfettiBurst active={showConfetti} />

      {/* Tidy Game HUD strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            onBack();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5E0D5] text-slate-800 font-semibold text-sm hover:bg-[#FAF8F4] active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Torna ai Giochi</span>
        </button>

        <div className="flex items-center gap-4 text-sm font-semibold text-slate-700 tabular-nums">
          <span>{meta.title}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>
            Domanda {roundIndex + 1} / {questions.length}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5 text-slate-900 font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" aria-hidden="true" />
            {starsEarned}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div
        className="w-full h-2.5 bg-[#E6E1D6] rounded-full overflow-hidden mb-6"
        role="progressbar"
        aria-valuenow={roundIndex + 1}
        aria-valuemin={1}
        aria-valuemax={questions.length}
      >
        <div
          className="h-full bg-emerald-600 transition-transform duration-300 origin-left"
          style={{
            transform: `scaleX(${(roundIndex + (solvedOptionId ? 1 : 0.15)) / questions.length})`,
          }}
        />
      </div>

      {/* Prompt Card with Active Elf */}
      <div className="bg-white border border-[#E5E0D5] rounded-3xl p-5 sm:p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-left">
          <ElfAvatarSvg
            elfId={meta.elfId}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0 border border-[#E5E0D5]"
          />

          {/* Gentle visual clue on Facile (3-4 anni) for pre-readers */}
          {difficulty === 'facile' && (
            <div
              className="w-16 h-16 rounded-2xl border border-[#E5E0D5] bg-[#FAF8F4] flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              {mode === 'colori' ? (
                <span
                  className="w-10 h-10 rounded-full border border-black/15"
                  style={{ backgroundColor: currentQuestion.targetColor.hex }}
                />
              ) : mode === 'forme' ? (
                <ShapeSvg
                  shape={currentQuestion.targetShape.id}
                  colorHex="#475569"
                  variant="outline"
                  className="w-11 h-11"
                />
              ) : (
                <ShapeSvg
                  shape={currentQuestion.targetShape.id}
                  colorHex={currentQuestion.targetColor.hex}
                  borderHex={currentQuestion.targetColor.darkHex}
                  className="w-11 h-11"
                />
              )}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              {elf.name} <span aria-hidden="true">·</span> {DIFFICULTY_CONFIGS[difficulty].label} ({DIFFICULTY_CONFIGS[difficulty].ageRange})
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 text-balance">
              {currentQuestion.promptText}
            </h2>
            {currentQuestion.riddleLine && (
              <p className="text-sm text-slate-600 mt-1">
                {currentQuestion.riddleLine}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleTogglePromptSpeech}
          className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-base active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            isPromptSpeaking
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
          }`}
        >
          {isPromptSpeaking ? (
            <>
              <Square className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>Ferma</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" aria-hidden="true" />
              <span>Ascolta</span>
            </>
          )}
        </button>
      </div>

      {/* Feedback Banner */}
      <div className="min-h-[52px] mb-5 flex items-center justify-center">
        {feedbackBanner ? (
          <div
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border text-base font-bold ${
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
        ) : (
          <p className="text-sm font-medium text-slate-500">
            Tocca la tessera giusta con il dito, il mouse o la penna LIM
          </p>
        )}
      </div>

      {/* Choice Tiles Grid */}
      <div className={`grid ${gridColsClass} gap-5`}>
        {currentQuestion.options.map((option) => {
          const isSolved = solvedOptionId === option.id;
          const isWrong = wrongOptionIds.includes(option.id);
          const isShaking = shakingId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOptionTap(option)}
              disabled={solvedOptionId !== null}
              aria-label={`${option.shape.name} ${option.color.name}`}
              className={`group relative rounded-3xl p-6 ${
                limMode ? 'min-h-[188px]' : 'min-h-[168px] sm:min-h-[188px]'
              } flex flex-col items-center justify-center gap-3 border-2 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 ${
                isShaking ? 'animate-gentle-shake' : ''
              } ${
                isSolved
                  ? 'bg-emerald-50 border-emerald-500 shadow-md animate-pop-celebrate'
                  : isWrong
                    ? 'bg-[#F5F2EB] border-[#DDD6C7] opacity-65'
                    : 'bg-white border-[#E5E0D5] shadow-sm hover:-translate-y-1 hover:border-slate-400 active:scale-95'
              }`}
            >
              <ShapeSvg
                shape={option.shape.id}
                colorHex={option.color.hex}
                borderHex={option.color.darkHex}
                className="w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-150 group-hover:scale-105"
              />

              {(isSolved || isWrong) && (
                <span className="font-display text-sm font-bold text-slate-800">
                  {mode === 'colori'
                    ? option.color.name
                    : mode === 'forme'
                      ? option.shape.name
                      : `${option.shape.name} ${option.color.name}`}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
