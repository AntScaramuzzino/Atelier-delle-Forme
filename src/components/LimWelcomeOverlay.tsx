import { useEffect, useState } from 'react';
import { Play, Square, Volume2, X } from 'lucide-react';
import { ELVES } from '../data/elves';
import { speakAsElf, stopSpeaking, subscribeSpeechState } from '../utils/sound';
import { ElfAvatarSvg, XmasLabBadgeSvg } from './ElfAvatarSvg';

interface LimWelcomeOverlayProps {
  open: boolean;
  soundEnabled: boolean;
  onClose: () => void;
  onStartWithRossella: () => void;
}

export function LimWelcomeOverlay({
  open,
  soundEnabled,
  onClose,
  onStartWithRossella,
}: LimWelcomeOverlayProps) {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeSpeechState(setSpeakingId);
  }, []);

  if (!open) return null;

  const isSpeaking = speakingId === 'lim-welcome';

  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakAsElf(
        `${ELVES.stella.introLine} Cominciamo subito insieme a Elfa Rossella con i colori del Natale!`,
        'stella',
        soundEnabled,
        { forcePlay: true, utteranceTag: 'lim-welcome' },
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lim-welcome-title"
    >
      <div className="bg-[#F8FAFC] border-2 border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/image_0299a0fc.png"
              alt="Logo Équipe Formativa Territoriale della Calabria"
              referrerPolicy="no-referrer"
              className="h-10 w-auto object-contain"
            />
            <div className="text-xs font-bold text-[#0F5132]">
              Xmas Lab · Modalità Accoglienza LIM
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            aria-label="Chiudi finestra di benvenuto"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="md:col-span-4 flex items-center justify-center gap-3">
            <ElfAvatarSvg elfId="stella" className="w-24 h-24 rounded-2xl shadow-sm" />
            <ElfAvatarSvg elfId="rossella" className="w-24 h-24 rounded-2xl shadow-sm" />
          </div>

          <div className="md:col-span-8">
            <h2
              id="lim-welcome-title"
              className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2"
            >
              Benvenuti nell’Atelier delle Forme e dei Colori!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
              Un laboratorio natalizio pensato per bambine e bambini dai 3 ai 6 anni su LIM, tablet e computer. Inizia con <strong>Elfa Rossella</strong> a scoprire i colori, poi incontra <strong>Elfo Lorenzo</strong>, <strong>Elfo Antonio</strong>, <strong>Elfo Alfredo</strong> ed <strong>Elfa Stella</strong>!
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleToggleVoice}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 font-bold text-sm hover:bg-amber-300 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>Ferma</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                    <span>Ascolta Elfa Stella</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="font-display font-bold text-slate-900 mb-1">1. Scegli l’età</div>
            <p className="text-slate-600 text-xs">
              Facile (3–4 anni), Medio (4–5 anni) o Esperto (5–6 anni) con aiuti visivi graduati.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="font-display font-bold text-slate-900 mb-1">2. Tocca o Trascina</div>
            <p className="text-slate-600 text-xs">
              Tasti grandi per dita e penna LIM, trascinamento e doppio tocco negli incastri.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-2">
            <div>
              <div className="font-display font-bold text-slate-900 mb-1">3. Raccogli Stelle</div>
              <p className="text-slate-600 text-xs">
                Sblocca le 6 Medaglie di Natale e stampa il Certificato PDF!
              </p>
            </div>
            <XmasLabBadgeSvg className="w-12 h-12 shrink-0" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-5 py-3 rounded-2xl bg-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            Esplora il Menu
          </button>

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onStartWithRossella();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-600 text-white font-display font-bold text-base hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>Inizia con Elfa Rossella</span>
          </button>
        </div>
      </div>
    </div>
  );
}
