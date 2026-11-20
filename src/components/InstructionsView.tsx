import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  Layers,
  Sparkles,
  Square,
  Volume2,
} from 'lucide-react';
import { ELVES } from '../data/elves';
import {
  playTapSound,
  speakAsElf,
  stopSpeaking,
  subscribeSpeechState,
} from '../utils/sound';
import { ElfAvatarSvg } from './ElfAvatarSvg';

interface InstructionsViewProps {
  soundEnabled: boolean;
  onBack: () => void;
}

const SIMPLE_PROMPT = `Crea un'applicazione web didattica a tema natalizio per la Scuola dell'Infanzia (3–6 anni) intitolata "Missione Natale: Atelier delle Forme e dei Colori", utilizzabile sia su PC/Tablet sia alla LIM in classe.

Funzionalità essenziali:
1. Tre livelli di difficoltà per fascia d'età:
   - Facile (3–4 anni): colori primari e secondari, forme base (cerchio, quadrato, triangolo, rettangolo, stella) con aiuto visivo per chi non legge ancora.
   - Medio (4–5 anni): aggiunge cuore e rombo, senza aiuto visivo diretto.
   - Esperto (5–6 anni): tutti i 6 colori e tutte le 9 figure geometriche (inclusi esagono e ovale).
2. Quattro attività di colori e forme guidate dagli Elfi Equipers:
   - Trova il Colore (Elfa Rossella): ascolta il colore e tocca il blocco giusto.
   - Incastra le Forme (Elfo Lorenzo): tavola di legno stile Montessori con trascinamento e doppio tocco.
   - Trova la Forma (Elfo Antonio): carica sulla slitta la figura geometrica richiesta.
   - Abbina le Forme (Elfo Alfredo): componi insieme colore e forma richiesti (più modalità "Scopri Liberamente").
3. Dashboard Progressi (Elfa Stella) con grafico delle stelle raccolte, 6 medaglie natalizie sbloccabili e certificato PDF finale personalizzabile.
4. Interfaccia ad alto contrasto (verde pino, rosso Natale, oro su sfondo chiaro), pulsante "Modalità LIM" senza scorrimento, nevicata leggera disattivabile e sintesi vocale in italiano con pulsante Audio (muto all'avvio).`;

const ADVANCED_PROMPT = `Realizza in React, TypeScript e Tailwind CSS un'applicazione web educativa completa per la Scuola dell'Infanzia (3–6 anni) intitolata "Missione Natale: Atelier delle Forme e dei Colori" (Xmas Lab · EFT Calabria), progettata per Desktop, Tablet e LIM (Lavagna Interattiva Multimediale).

1. ARCHITETTURA, LIVELLI E ATTIVITÀ DIDATTICHE:
   - Selettore di fascia d'età persistente: Facile (3–4 anni, con anteprima visiva di aiuto), Medio (4–5 anni) ed Esperto (5–6 anni).
   - 4 attività coerenti e interattive con salvataggio progressi in localStorage:
     * Trova il Colore (Elfa Rossella): riconoscimento uditivo e visivo di Rosso, Blu, Giallo, Verde, Arancione e Viola con indizi non punitivi.
     * Incastra le Forme (Elfo Lorenzo): tavola in legno Montessori con doppio supporto Drag & Drop (pointer events tattili) e Doppio Tocco accessibile sulla LIM.
     * Trova la Forma (Elfo Antonio): riconoscimento di cerchio, quadrato, triangolo, rettangolo, stella, cuore, rombo, esagono e ovale associati ai doni di Natale.
     * Abbina le Forme (Elfo Alfredo): banco da lavoro dove combinare simultaneamente colore e forma per vincere stelle, più scheda "Scopri Liberamente" per esplorare lati e caratteristiche.

2. I 5 ELFI EQUIPERS, VOCI ITALIANE E AUDIO WEB AUDIO:
   - Inserisci 5 personaggi illustrati ("Elfi Equipers"): Elfa Rossella, Elfo Lorenzo, Elfo Antonio, Elfo Alfredo ed Elfa Stella.
   - Sintesi vocale Web Speech API in italiano (it-IT) con selezione automatica delle voci più naturali e profili separati per genere: voci femminili calde per Elfa Rossella ed Elfa Stella; voci maschili distinte per Elfo Lorenzo, Elfo Antonio ed Elfo Alfredo.
   - Effetti sonori generati via Web Audio API (tap, accordo positivo, suggerimento morbido, fanfara). Audio muto di default all'avvio con toggle in barra superiore e pulsanti "Ascolta / Ferma" su ogni schermata.

3. DASHBOARD, MEDAGLIE, CERTIFICATO PDF E MODALITÀ LIM:
   - Dashboard con grafico a barre (Recharts) delle stelle guadagnate per attività, elenco dei colori e delle forme scoperte e 6 medaglie natalizie sbloccabili.
   - Generatore di Certificato PDF lato client (jsPDF, formato A4 orizzontale) con nome dell'alunno, livello frequentato, stelle totali e firme di Elfa Stella ed EFT Calabria.
   - Barra LIM dedicata con "Modalità LIM" (layout compatto anti-scroll e blocco pinch-zoom/menu contestuale), "Schermo Intero", "Neve: Sì/No", pagina "Istruzioni & Prompt" per i docenti e pagina "Elfi Equipers".`;

export function InstructionsView({ soundEnabled, onBack }: InstructionsViewProps) {
  const [promptTab, setPromptTab] = useState<'simple' | 'advanced'>('simple');
  const [copied, setCopied] = useState(false);
  const [speakingTag, setSpeakingTag] = useState<string | null>(null);

  useEffect(() => {
    return subscribeSpeechState(setSpeakingTag);
  }, []);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const activePrompt = promptTab === 'simple' ? SIMPLE_PROMPT : ADVANCED_PROMPT;
  const isSpeaking = speakingTag === 'instructions-guide';

  const handleToggleListen = () => {
    playTapSound(soundEnabled);
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    speakAsElf(
      'Ciao da Elfa Rossella! In questa pagina trovi come usare l’Atelier delle Forme alla LIM o sul tablet e i due prompt pronti da copiare in Google AI Studio per i docenti della Scuola dell’Infanzia.',
      'rossella',
      soundEnabled,
      { forcePlay: true, utteranceTag: 'instructions-guide' },
    );
  };

  const handleCopyPrompt = () => {
    playTapSound(soundEnabled);
    navigator.clipboard?.writeText(activePrompt).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-7 space-y-6">
      {/* Top Header Strip matching reference */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ElfAvatarSvg
            elfId="rossella"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0 border border-slate-200"
          />
          <div>
            <p className="text-xs font-bold text-[#0F5132] mb-0.5">
              Guida <span aria-hidden="true">·</span> {ELVES.rossella.name}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Istruzioni &amp; Prompt
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl">
              Guida rapida all’uso in classe e due prompt pronti (Semplice e Avanzato) per ricreare l’app in Google AI Studio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onBack();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-800 font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Giochi</span>
          </button>

          <button
            type="button"
            onClick={handleToggleListen}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap ${
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
      </div>

      {/* 2-Column Classroom Guide + Ready-to-Copy Prompts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Come usare il gioco in classe */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#0F5132] text-white flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-slate-900">
                Come usare il gioco in classe
              </h3>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed">
                <strong className="text-slate-900">1. Scegli la vista e l’età:</strong> usa{' '}
                <strong className="text-slate-900">Modalità LIM</strong> per una lavagna orizzontale senza scorrimento oppure Tablet/PC, e imposta{' '}
                <strong className="text-slate-900">Facile (3–4)</strong>,{' '}
                <strong className="text-slate-900">Medio (4–5)</strong> o{' '}
                <strong className="text-slate-900">Esperto (5–6 anni)</strong>.
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed">
                <strong className="text-slate-900">2. Ascolta i 5 Elfi:</strong>{' '}
                <strong className="text-slate-900">Rossella</strong> e{' '}
                <strong className="text-slate-900">Stella</strong> usano voci femminili;{' '}
                <strong className="text-slate-900">Lorenzo</strong>,{' '}
                <strong className="text-slate-900">Antonio</strong> e{' '}
                <strong className="text-slate-900">Alfredo</strong> voci maschili. Attiva l’audio in alto o clicca{' '}
                <strong className="text-[#B45309]">Ascolta</strong>.
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed">
                <strong className="text-slate-900">3. Gioca, abbina e certifica:</strong> esplora{' '}
                <strong className="text-slate-900">Trova il Colore</strong>,{' '}
                <strong className="text-slate-900">Incastra le Forme</strong>,{' '}
                <strong className="text-slate-900">Trova la Forma</strong> e{' '}
                <strong className="text-slate-900">Abbina le Forme</strong>, poi scarica dalla Dashboard il certificato PDF rilasciato da{' '}
                <strong className="text-slate-900">Elfa Stella</strong>.
              </div>
            </div>
          </div>

          {/* Mint Green Callout Box */}
          <div className="rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#065F46] mb-2">
              <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Ricreare l’app con Google AI Studio / Canvas</span>
            </div>
            <ol className="space-y-1.5 text-xs sm:text-sm text-[#065F46] leading-relaxed list-decimal list-inside">
              <li>
                Scegli <strong>Prompt Semplice</strong> (prototipo rapido) o{' '}
                <strong>Prompt Avanzato</strong> (tutte le funzionalità).
              </li>
              <li>
                Clicca su <strong>Copia Prompt</strong> e incollalo in{' '}
                <strong>Google AI Studio Build</strong> o Gemini Canvas.
              </li>
              <li>
                Carica eventuali loghi o personaggi personalizzati per adattarlo subito alla tua sezione!
              </li>
            </ol>
          </div>
        </div>

        {/* Right Column: Dark Pine Prompt Panel */}
        <div className="lg:col-span-7 bg-[#0F5132] text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-3 mb-4">
              <Layers className="w-6 h-6 text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-display text-xl font-extrabold text-white">
                  {promptTab === 'simple'
                    ? 'Prompt Semplice (Avvio Rapido)'
                    : 'Prompt Avanzato AI Studio (Completo)'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                  {promptTab === 'simple'
                    ? 'Versione sintetica ideale per Gemini Canvas o per partire da una base leggera.'
                    : 'Specifiche complete per docenti: livelli 3–6 anni, 5 voci Elfi, modalità LIM e PDF.'}
                </p>
              </div>
            </div>

            {/* Mode Switcher + Copy Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div
                role="group"
                aria-label="Tipo di prompt per docenti"
                className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#093621] border border-emerald-800"
              >
                <button
                  type="button"
                  onClick={() => {
                    playTapSound(soundEnabled);
                    setPromptTab('simple');
                    setCopied(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    promptTab === 'simple'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  Semplice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTapSound(soundEnabled);
                    setPromptTab('advanced');
                    setCopied(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    promptTab === 'advanced'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  Avanzato AI Studio
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyPrompt}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-900 font-bold text-xs sm:text-sm hover:bg-amber-300 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-900" aria-hidden="true" />
                    <span>Copiato ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    <span>Copia Prompt</span>
                  </>
                )}
              </button>
            </div>

            {/* Scrollable Prompt Code Box */}
            <pre className="w-full rounded-2xl bg-[#093621] border border-emerald-800/80 p-4 sm:p-5 text-xs sm:text-[13px] leading-relaxed font-mono text-emerald-50 whitespace-pre-wrap overflow-y-auto max-h-[380px]">
              {activePrompt}
            </pre>
          </div>

          <p className="mt-4 text-xs text-emerald-200 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
            <span>
              {promptTab === 'simple'
                ? 'Passa ad “Avanzato AI Studio” per ottenere il prompt tecnico completo di ogni funzione.'
                : 'Usa “Semplice” se desideri una versione più breve da provare rapidamente su Gemini Canvas.'}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
