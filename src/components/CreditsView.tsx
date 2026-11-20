import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  HeartHandshake,
  Square,
  Volume2,
} from 'lucide-react';
import { ELF_ORDER, ELVES, type ElfId } from '../data/elves';
import {
  playTapSound,
  speakAsElf,
  stopSpeaking,
  subscribeSpeechState,
} from '../utils/sound';
import { ElfAvatarSvg } from './ElfAvatarSvg';

interface CreditsViewProps {
  soundEnabled: boolean;
  onBack: () => void;
}

export function CreditsView({ soundEnabled, onBack }: CreditsViewProps) {
  const [speakingTag, setSpeakingTag] = useState<string | null>(null);

  useEffect(() => {
    return subscribeSpeechState(setSpeakingTag);
  }, []);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const handleSpeakAllIntro = () => {
    const tag = 'credits-intro';
    if (speakingTag === tag) {
      stopSpeaking();
    } else {
      playTapSound(soundEnabled);
      speakAsElf(
        'Benvenuti tra i cinque Elfi Equipers della Calabria! Tocca ciascun elfo per ascoltare la sua voce e il suo gioco nell’Atelier delle Forme e dei Colori.',
        'rossella',
        soundEnabled,
        { forcePlay: true, utteranceTag: tag },
      );
    }
  };

  const handleElfCardClick = (elfId: ElfId) => {
    const tag = `credits-${elfId}`;
    if (speakingTag === tag) {
      stopSpeaking();
    } else {
      playTapSound(soundEnabled);
      const elf = ELVES[elfId];
      speakAsElf(elf.introLine, elfId, soundEnabled, {
        forcePlay: true,
        utteranceTag: tag,
      });
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
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

        <span className="text-sm font-semibold text-slate-500">
          5 Elfi Equipers <span aria-hidden="true">·</span> EFT Calabria
        </span>
      </div>

      {/* Pine Green Header Banner */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="bg-white rounded-2xl px-4 py-3 shrink-0">
            <img
              src="/assets/aistudio/image_0299a0fc.png"
              alt="Logo Équipe Formativa Territoriale della Calabria"
              referrerPolicy="no-referrer"
              className="h-12 w-auto object-contain"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-300 mb-1">
              Équipe Formativa Territoriale della Calabria · Xmas Lab
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-1">
              Credits · I 5 Personaggi degli Elfi Equipers
            </h2>
            <p className="text-sm text-emerald-100">
              Tocca un personaggio per ascoltare la sua presentazione vocale nell’atelier di Natale.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSpeakAllIntro}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 text-slate-900 font-bold text-sm hover:bg-amber-300 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            {speakingTag === 'credits-intro' ? (
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

          <a
            href="https://www.istruzione.calabria.it/EFT/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 active:scale-95 transition-all whitespace-nowrap"
          >
            <span>Portale EFT Calabria</span>
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* 5 Interactive Elf Cards */}
      <div className="bg-white border border-[#E5E0D5] rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
              I Nodi e i Personaggi degli “Elfi Equipers”
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Si parte con Elfa Rossella e si prosegue insieme a Elfo Lorenzo, Elfo Antonio, Elfo Alfredo ed Elfa Stella.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            5 Voci Italiane Dedicate · EFT Calabria
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ELF_ORDER.map((elfId, idx) => {
            const elf = ELVES[elfId];
            const isSpeaking = speakingTag === `credits-${elfId}`;

            return (
              <button
                key={elf.id}
                type="button"
                onClick={() => handleElfCardClick(elf.id)}
                className="group rounded-3xl p-5 border-2 text-center flex flex-col items-center justify-between transition-all cursor-pointer hover:-translate-y-1 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"
                style={{
                  borderColor: isSpeaking ? '#DC2626' : elf.borderHex,
                  backgroundColor: isSpeaking ? '#FEF2F2' : '#FFFFFF',
                }}
              >
                <div className="w-full flex flex-col items-center">
                  <ElfAvatarSvg
                    elfId={elf.id}
                    className="w-32 h-32 rounded-2xl mb-4 shadow-xs transition-transform duration-150 group-hover:scale-105"
                  />

                  <span className="text-xs font-semibold text-slate-500 mb-1">
                    {idx + 1}. {elf.specialty}
                  </span>

                  <h4 className="font-display text-lg font-extrabold text-slate-900">
                    {elf.name}
                  </h4>

                  <p
                    className="text-xs font-bold mt-1 mb-3"
                    style={{ color: elf.accentHex }}
                  >
                    {elf.role}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {elf.bio}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                    isSpeaking ? 'text-red-700' : 'text-amber-700'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      <span>Ferma voce</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Tocca per ascoltare</span>
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Institutional EFT Calabria Footer Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <HeartHandshake className="w-6 h-6 text-emerald-800 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-display font-bold text-sm sm:text-base text-slate-900">
              Scopri i progetti e la formazione dell’Équipe Formativa Territoriale Calabria
            </p>
            <a
              href="https://www.istruzione.calabria.it/EFT/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-semibold text-emerald-800 underline hover:text-emerald-950"
            >
              https://www.istruzione.calabria.it/EFT/
            </a>
          </div>
        </div>

        <a
          href="https://www.istruzione.calabria.it/EFT/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900 text-white text-sm font-bold hover:bg-emerald-950 active:scale-95 transition-all whitespace-nowrap shrink-0"
        >
          <span>Visita il sito EFT</span>
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
