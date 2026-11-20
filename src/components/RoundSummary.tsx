import { Award, Home, RotateCcw, Star } from 'lucide-react';
import {
  getColorById,
  getShapeById,
  type ColorId,
  type GameMode,
  type ShapeId,
} from '../data/gameCatalog';
import { ElfAvatarSvg } from './ElfAvatarSvg';
import { ShapeSvg } from './ShapeSvg';

export interface RoundResultSummary {
  mode: GameMode;
  starsEarned: number;
  totalRounds: number;
  firstTryCount: number;
  practicedColors: ColorId[];
  practicedShapes: ShapeId[];
}

interface RoundSummaryProps {
  summary: RoundResultSummary;
  onPlayAgain: () => void;
  onOpenDashboard: () => void;
  onBackToMenu: () => void;
}

const MODE_LABELS: Record<GameMode, string> = {
  colori: 'Trova il Colore',
  forme: 'Trova la Forma',
  misto: 'Abbina le Forme',
  incastri: 'Incastra le Forme',
};

export function RoundSummary({
  summary,
  onPlayAgain,
  onOpenDashboard,
  onBackToMenu,
}: RoundSummaryProps) {
  const uniqueColors = Array.from(new Set(summary.practicedColors));
  const uniqueShapes = Array.from(new Set(summary.practicedShapes));

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white border border-[#E5E0D5] rounded-3xl p-8 sm:p-10 shadow-sm text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <ElfAvatarSvg
            elfId="stella"
            className="w-20 h-20 rounded-2xl border border-[#E5E0D5]"
          />
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Award className="w-9 h-9" aria-hidden="true" />
          </div>
        </div>

        <p className="text-sm font-semibold text-slate-500 mb-2">
          {MODE_LABELS[summary.mode]} <span aria-hidden="true">·</span> Partita Completata
        </p>

        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 text-balance">
          Bravissimo! Elfa Stella ha raccolto le tue stelle!
        </h2>

        <p className="text-base text-slate-600 mb-8 max-w-lg mx-auto">
          Controlla nella Dashboard le Medaglie Natalizie sbloccate e scarica il tuo Certificato dell’Elfo Geometra.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8 py-5 border-y border-[#ECE7DC]">
          <div>
            <div className="flex items-center justify-center gap-1.5 font-display text-3xl font-extrabold text-slate-900 tabular-nums">
              <Star className="w-7 h-7 fill-amber-400 text-amber-500" aria-hidden="true" />
              <span>{summary.starsEarned}</span>
            </div>
            <div className="text-sm font-medium text-slate-600 mt-1">
              Stelle vinte
            </div>
          </div>

          <div>
            <div className="font-display text-3xl font-extrabold text-slate-900 tabular-nums">
              {summary.firstTryCount} / {summary.totalRounds}
            </div>
            <div className="text-sm font-medium text-slate-600 mt-1">
              Al primo colpo
            </div>
          </div>
        </div>

        {(uniqueShapes.length > 0 || uniqueColors.length > 0) && (
          <div className="mb-9">
            <h3 className="text-sm font-semibold text-slate-500 mb-4">
              Forme e colori esplorati in questa partita
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-5">
              {uniqueShapes.slice(0, 6).map((shapeId, index) => {
                const shape = getShapeById(shapeId);
                const color = getColorById(
                  uniqueColors[index % Math.max(1, uniqueColors.length)] ?? 'blu',
                );
                return (
                  <div
                    key={shapeId}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <ShapeSvg
                      shape={shape.id}
                      colorHex={color.hex}
                      borderHex={color.darkHex}
                      className="w-12 h-12"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {shape.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-red-600 text-white font-display font-bold text-base hover:bg-red-700 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
            <span>Gioca Ancora</span>
          </button>

          <button
            type="button"
            onClick={onOpenDashboard}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-700 text-white font-display font-bold text-base hover:bg-emerald-800 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Award className="w-5 h-5" aria-hidden="true" />
            <span>Dashboard & Certificato</span>
          </button>

          <button
            type="button"
            onClick={onBackToMenu}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#F2EFE8] text-slate-800 font-display font-bold text-base hover:bg-[#E7E2D6] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            <span>Menu Giochi</span>
          </button>
        </div>
      </div>
    </section>
  );
}
