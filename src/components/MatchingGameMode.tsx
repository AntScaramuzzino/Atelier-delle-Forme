import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Square,
  Star,
  Volume2,
} from 'lucide-react';
import { ELVES } from '../data/elves';
import {
  DIFFICULTY_CONFIGS,
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

interface PegItem {
  id: string;
  shape: GameShape;
  color: GameColor;
}

interface MatchingGameModeProps {
  difficulty: DifficultyLevel;
  soundEnabled: boolean;
  limMode: boolean;
  onComplete: (summary: RoundResultSummary) => void;
  onRecordMastery: (colorId: ColorId, shapeId: ShapeId, stars: number) => void;
  onBack: () => void;
}

const TOTAL_BOARDS = 3;

function createBoardItems(
  difficulty: DifficultyLevel,
  boardIndex: number,
): { slots: PegItem[]; tray: PegItem[] } {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const allShapes = shuffleArray(getShapesForDifficulty(difficulty));
  const allColors = shuffleArray(getColorsForDifficulty(difficulty));

  const chosenShapes = allShapes.slice(0, config.matchSlotCount);
  const slots: PegItem[] = chosenShapes.map((shape, idx) => ({
    id: `board-${boardIndex}-${shape.id}`,
    shape,
    color: allColors[idx % allColors.length],
  }));

  const tray = shuffleArray(slots);
  return { slots, tray };
}

export function MatchingGameMode({
  difficulty,
  soundEnabled,
  limMode,
  onComplete,
  onRecordMastery,
  onBack,
}: MatchingGameModeProps) {
  const [boardIndex, setBoardIndex] = useState(0);
  const [placedIds, setPlacedIds] = useState<string[]>([]);
  const [selectedTrayId, setSelectedTrayId] = useState<string | null>(null);
  const [shakingSlotId, setShakingSlotId] = useState<string | null>(null);
  const [starsEarned, setStarsEarned] = useState(0);
  const [firstTryBoards, setFirstTryBoards] = useState(0);
  const [hadWrongOnBoard, setHadWrongOnBoard] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'hint';
    text: string;
  } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [speakingTag, setSpeakingTag] = useState<string | null>(null);

  const [dragItem, setDragItem] = useState<{
    item: PegItem;
    x: number;
    y: number;
    isDragging: boolean;
  } | null>(null);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const slotRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const practicedColorsRef = useRef<ColorId[]>([]);
  const practicedShapesRef = useRef<ShapeId[]>([]);
  const boardTimerRef = useRef<number | null>(null);

  const elf = ELVES.lorenzo;
  const { slots, tray } = useMemo(
    () => createBoardItems(difficulty, boardIndex),
    [difficulty, boardIndex],
  );

  useEffect(() => {
    return subscribeSpeechState(setSpeakingTag);
  }, []);

  useEffect(() => {
    if (!soundEnabled) return;
    const speakTimer = window.setTimeout(() => {
      speakAsElf(
        'Ciao da Elfo Lorenzo! Incastra ogni forma nel suo spazio sull’albero di legno.',
        'lorenzo',
        soundEnabled,
        { utteranceTag: `match-board-${boardIndex}` },
      );
    }, 180);
    return () => window.clearTimeout(speakTimer);
  }, [boardIndex, soundEnabled]);

  useEffect(() => {
    return () => {
      if (boardTimerRef.current !== null) {
        window.clearTimeout(boardTimerRef.current);
      }
      stopSpeaking();
    };
  }, []);

  const attemptPlace = useCallback(
    (piece: PegItem, targetSlot: PegItem) => {
      if (placedIds.includes(targetSlot.id)) return;

      if (piece.id === targetSlot.id) {
        const nextPlaced = [...placedIds, piece.id];
        setPlacedIds(nextPlaced);
        setSelectedTrayId(null);

        practicedColorsRef.current.push(piece.color.id);
        practicedShapesRef.current.push(piece.shape.id);
        onRecordMastery(piece.color.id, piece.shape.id, 1);

        const boardFinished = nextPlaced.length === slots.length;
        if (boardFinished) {
          const newStars = starsEarned + 2;
          const newFirstTry = hadWrongOnBoard ? firstTryBoards : firstTryBoards + 1;
          setStarsEarned(newStars);
          setFirstTryBoards(newFirstTry);
          setShowConfetti(true);
          setFeedbackBanner({
            type: 'success',
            text: `Evviva! Hai completato la tavola ${boardIndex + 1}!`,
          });
          playCelebrationFanfare(soundEnabled);
          speakAsElf(
            'Bravissimo! Tutte le forme di Natale sono al posto giusto!',
            'lorenzo',
            soundEnabled,
          );

          boardTimerRef.current = window.setTimeout(() => {
            setShowConfetti(false);
            if (boardIndex + 1 >= TOTAL_BOARDS) {
              onComplete({
                mode: 'incastri',
                starsEarned: newStars,
                totalRounds: TOTAL_BOARDS,
                firstTryCount: newFirstTry,
                practicedColors: practicedColorsRef.current,
                practicedShapes: practicedShapesRef.current,
              });
            } else {
              setBoardIndex((b) => b + 1);
              setPlacedIds([]);
              setSelectedTrayId(null);
              setHadWrongOnBoard(false);
              setFeedbackBanner(null);
            }
          }, 1350);
        } else {
          setStarsEarned((s) => s + 1);
          setFeedbackBanner({
            type: 'success',
            text: `Perfetto! Hai incastrato ${piece.shape.articleAndName}!`,
          });
          playSuccessChime(soundEnabled);
          speakAsElf(`Bravo! ${piece.shape.name}!`, 'lorenzo', soundEnabled);
        }
      } else {
        setHadWrongOnBoard(true);
        setShakingSlotId(targetSlot.id);
        window.setTimeout(() => setShakingSlotId(null), 380);
        playSoftRetrySound(soundEnabled);
        const hint = `Quello spazio è per ${targetSlot.shape.articleAndName}. Prova a cercare ${piece.shape.articleAndName}!`;
        setFeedbackBanner({ type: 'hint', text: hint });
        speakAsElf(hint, 'lorenzo', soundEnabled);
      }
    },
    [
      placedIds,
      slots.length,
      starsEarned,
      hadWrongOnBoard,
      firstTryBoards,
      boardIndex,
      soundEnabled,
      onComplete,
      onRecordMastery,
    ],
  );

  useEffect(() => {
    if (!dragItem) return;

    const handlePointerMove = (e: PointerEvent) => {
      const start = dragStartRef.current;
      if (!start) return;
      const dist = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      if (dist > 8 || dragItem.isDragging) {
        setDragItem((prev) =>
          prev
            ? { ...prev, x: e.clientX, y: e.clientY, isDragging: true }
            : null,
        );
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (dragItem.isDragging) {
        let matchedSlot: PegItem | null = null;
        for (const slot of slots) {
          const el = slotRefs.current[slot.id];
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (
            e.clientX >= rect.left - 12 &&
            e.clientX <= rect.right + 12 &&
            e.clientY >= rect.top - 12 &&
            e.clientY <= rect.bottom + 12
          ) {
            matchedSlot = slot;
            break;
          }
        }
        if (matchedSlot) {
          attemptPlace(dragItem.item, matchedSlot);
        }
      }
      setDragItem(null);
      dragStartRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragItem, slots, attemptPlace]);

  const handleSelectTrayBlock = (item: PegItem) => {
    if (placedIds.includes(item.id)) return;
    playTapSound(soundEnabled);
    setSelectedTrayId(item.id);
    speakAsElf(`${item.shape.name} ${item.color.name}`, 'lorenzo', soundEnabled);
  };

  const handleSlotTap = (slot: PegItem) => {
    if (placedIds.includes(slot.id)) return;
    if (!selectedTrayId) {
      playTapSound(soundEnabled);
      const hint = `Prima tocca un blocco in basso, poi toccalo qui per incastrare ${slot.shape.articleAndName}.`;
      setFeedbackBanner({ type: 'hint', text: hint });
      speakAsElf(`Questo spazio è per ${slot.shape.articleAndName}`, 'lorenzo', soundEnabled);
      return;
    }
    const piece = tray.find((t) => t.id === selectedTrayId);
    if (piece) {
      attemptPlace(piece, slot);
    }
  };

  const isBoardSpeaking = speakingTag === `match-board-${boardIndex}`;

  const handleToggleSpeech = () => {
    if (isBoardSpeaking) {
      stopSpeaking();
    } else {
      speakAsElf(
        'Incastra ogni forma di legno nello spazio giusto! Puoi trascinare i blocchi o usare il doppio tocco.',
        'lorenzo',
        soundEnabled,
        { forcePlay: true, utteranceTag: `match-board-${boardIndex}` },
      );
    }
  };

  const slotsGridCols =
    slots.length <= 3
      ? 'grid-cols-3'
      : slots.length === 4
        ? 'grid-cols-2 sm:grid-cols-4'
        : 'grid-cols-2 sm:grid-cols-5';

  return (
    <section
      className={`max-w-6xl mx-auto px-4 sm:px-6 ${limMode ? 'py-4' : 'py-7'} select-none`}
      style={limMode ? { touchAction: 'none' } : undefined}
    >
      <ConfettiBurst active={showConfetti} />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
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
          <span>Albero e Incastri · {elf.name}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>
            Tavola {boardIndex + 1} / {TOTAL_BOARDS}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5 text-slate-900 font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" aria-hidden="true" />
            {starsEarned}
          </span>
        </div>
      </div>

      {/* Instruction Header with Elfo Lorenzo */}
      <div className="bg-white border border-[#E5E0D5] rounded-3xl p-5 sm:p-6 shadow-sm mb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ElfAvatarSvg
            elfId="lorenzo"
            className="w-16 h-16 rounded-2xl shrink-0 border border-[#E5E0D5]"
          />
          <div>
            <p className="text-xs font-semibold text-emerald-700 mb-0.5">
              {elf.name} · {elf.role}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Incastra ogni forma al posto giusto!
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Trascina i blocchi sulla tavola di legno oppure tocca un blocco e poi il suo spazio.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleSpeech}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            isBoardSpeaking
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
          }`}
        >
          {isBoardSpeaking ? (
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

      {/* Feedback status */}
      <div className="min-h-[46px] mb-4 flex items-center justify-center">
        {feedbackBanner && (
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
        )}
      </div>

      {/* Wooden Pegboard Zone */}
      <div className="bg-[#EFE9DC] border-2 border-[#DDD3BF] rounded-3xl p-5 sm:p-6 mb-6">
        <p className="text-xs font-bold text-slate-600 mb-3 text-center">
          Tavola degli Incastri Natalizia
        </p>

        <div className={`grid ${slotsGridCols} gap-4`}>
          {slots.map((slot) => {
            const isFilled = placedIds.includes(slot.id);
            const isShaking = shakingSlotId === slot.id;
            const showColorHint = difficulty === 'facile';

            return (
              <button
                key={slot.id}
                ref={(el) => {
                  slotRefs.current[slot.id] = el;
                }}
                type="button"
                onClick={() => handleSlotTap(slot)}
                aria-label={`Spazio per ${slot.shape.name}`}
                className={`rounded-2xl p-4 min-h-[144px] flex flex-col items-center justify-center gap-2 border-2 transition-all cursor-pointer active:scale-95 ${
                  isShaking ? 'animate-gentle-shake' : ''
                } ${
                  isFilled
                    ? 'bg-white border-emerald-400 shadow-sm animate-pop-celebrate'
                    : selectedTrayId
                      ? 'bg-[#F8F5EE] border-dashed border-amber-500 hover:bg-white'
                      : 'bg-[#F8F5EE] border-dashed border-[#C5BAA5] hover:border-slate-500'
                }`}
              >
                {isFilled ? (
                  <ShapeSvg
                    shape={slot.shape.id}
                    colorHex={slot.color.hex}
                    borderHex={slot.color.darkHex}
                    className="w-24 h-24"
                  />
                ) : (
                  <ShapeSvg
                    shape={slot.shape.id}
                    colorHex={showColorHint ? slot.color.hex : '#94A3B8'}
                    variant={showColorHint ? 'outline' : 'slot'}
                    className="w-24 h-24 opacity-85"
                  />
                )}

                <span className="font-display text-sm font-bold text-slate-700">
                  {slot.shape.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wooden Blocks Tray */}
      <div className="bg-white border border-[#E5E0D5] rounded-3xl p-5 sm:p-6 shadow-sm">
        <p className="text-xs font-bold text-slate-500 mb-3 text-center">
          Blocchi da Incastrare
        </p>

        <div className={`grid ${slotsGridCols} gap-4`}>
          {tray.map((item) => {
            const isPlaced = placedIds.includes(item.id);
            const isSelected = selectedTrayId === item.id;
            const isCurrentlyDragged =
              dragItem?.isDragging && dragItem.item.id === item.id;

            return (
              <button
                key={item.id}
                type="button"
                disabled={isPlaced}
                onClick={() => handleSelectTrayBlock(item)}
                onPointerDown={(e) => {
                  if (isPlaced) return;
                  dragStartRef.current = { x: e.clientX, y: e.clientY };
                  setDragItem({
                    item,
                    x: e.clientX,
                    y: e.clientY,
                    isDragging: false,
                  });
                }}
                aria-label={`Blocco ${item.shape.name} ${item.color.name}`}
                style={{ touchAction: 'none' }}
                className={`rounded-2xl p-4 min-h-[138px] flex flex-col items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
                  isPlaced
                    ? 'bg-[#FAF8F4] border-transparent opacity-20 cursor-default'
                    : isCurrentlyDragged
                      ? 'bg-[#FAF8F4] border-amber-400 opacity-35'
                      : isSelected
                        ? 'bg-amber-50 border-amber-500 shadow-md -translate-y-1 cursor-pointer'
                        : 'bg-white border-[#E5E0D5] shadow-sm hover:-translate-y-0.5 hover:border-slate-400 cursor-grab active:cursor-grabbing'
                }`}
              >
                <ShapeSvg
                  shape={item.shape.id}
                  colorHex={item.color.hex}
                  borderHex={item.color.darkHex}
                  className="w-24 h-24"
                />
                <span className="font-display text-sm font-bold text-slate-800">
                  {item.shape.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {dragItem?.isDragging && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 drop-shadow-xl"
          style={{ left: dragItem.x, top: dragItem.y }}
          aria-hidden="true"
        >
          <ShapeSvg
            shape={dragItem.item.shape.id}
            colorHex={dragItem.item.color.hex}
            borderHex={dragItem.item.color.darkHex}
            className="w-28 h-28 scale-110"
          />
        </div>
      )}
    </section>
  );
}
