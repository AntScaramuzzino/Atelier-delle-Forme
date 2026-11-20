import {
  BookOpen,
  HelpCircle,
  Maximize2,
  Minimize2,
  Monitor,
  Music,
  Snowflake,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { GameMode } from '../data/gameCatalog';

export type AppView =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'ROUND_SUMMARY'
  | 'EXPLORE'
  | 'DASHBOARD'
  | 'INSTRUCTIONS'
  | 'CREDITS';

interface TopBarProps {
  currentView: AppView;
  activeMode: GameMode;
  soundEnabled: boolean;
  musicPlaying: boolean;
  musicAwaitingGesture: boolean;
  musicSongTitle: string;
  snowEnabled: boolean;
  limMode: boolean;
  isFullscreen: boolean;
  onNavigate: (view: AppView, quickMode?: GameMode) => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleSnow: () => void;
  onToggleLim: () => void;
  onToggleFullscreen: () => void;
  onOpenGuide: () => void;
}

export function TopBar({
  currentView,
  activeMode,
  soundEnabled,
  musicPlaying,
  musicAwaitingGesture,
  musicSongTitle,
  snowEnabled,
  limMode,
  isFullscreen,
  onNavigate,
  onToggleSound,
  onToggleMusic,
  onToggleSnow,
  onToggleLim,
  onToggleFullscreen,
  onOpenGuide,
}: TopBarProps) {
  const navTabClass = (active: boolean) =>
    `text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer py-2 border-b-2 active:scale-95 ${
      active
        ? 'text-slate-900 border-red-600'
        : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
    }`;

  const toolbarBtnClass = (active: boolean, activeStyle = 'bg-sky-50 border-sky-300 text-sky-900') =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
      active
        ? activeStyle
        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
    }`;

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Row 1: 3-Zone Top Bar Contract */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Logo + Single-line Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('TITLE_MENU')}
          className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 rounded-lg active:scale-95 transition-transform"
        >
          <img
            src="/assets/aistudio/image_0299a0fc.png"
            alt="Équipe Formativa Calabria"
            referrerPolicy="no-referrer"
            className="h-8 w-auto object-contain shrink-0"
          />
          <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#0F5132] whitespace-nowrap shrink-0">
            Atelier delle Forme
          </span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Navigazione principale"
          className="hidden lg:flex items-center gap-5"
        >
          <button
            type="button"
            onClick={() => onNavigate('TITLE_MENU')}
            className={navTabClass(
              currentView === 'TITLE_MENU' ||
                (currentView === 'PLAYING' && activeMode !== 'incastri'),
            )}
          >
            Giochi
          </button>
          <button
            type="button"
            onClick={() => onNavigate('PLAYING', 'incastri')}
            className={navTabClass(
              currentView === 'PLAYING' && activeMode === 'incastri',
            )}
          >
            Incastra
          </button>
          <button
            type="button"
            onClick={() => onNavigate('EXPLORE')}
            className={navTabClass(currentView === 'EXPLORE')}
          >
            Abbina le Forme
          </button>
          <button
            type="button"
            onClick={() => onNavigate('DASHBOARD')}
            className={navTabClass(currentView === 'DASHBOARD')}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onNavigate('INSTRUCTIONS')}
            className={navTabClass(currentView === 'INSTRUCTIONS')}
          >
            Istruzioni
          </button>
          <button
            type="button"
            onClick={() => onNavigate('CREDITS')}
            className={navTabClass(currentView === 'CREDITS')}
          >
            Elfi Equipers
          </button>
        </nav>

        {/* Zone 3: Primary CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('PLAYING', 'colori')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <span>Nuova Partita</span>
          </button>
        </div>
      </div>

      {/* Classroom / LIM Compact Utility Bar */}
      <div className="border-t border-slate-100 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Aula · Tablet, PC e LIM {limMode ? '· Blocco Tocco Attivo' : ''}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenGuide}
              className={toolbarBtnClass(false)}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span>Guida LIM</span>
            </button>

            <button
              type="button"
              onClick={onToggleLim}
              aria-pressed={limMode}
              className={toolbarBtnClass(
                limMode,
                'bg-emerald-50 border-emerald-400 text-emerald-900',
              )}
            >
              <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{limMode ? 'LIM: Attiva' : 'Modalità LIM'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleFullscreen}
              aria-pressed={isFullscreen}
              className={toolbarBtnClass(isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{isFullscreen ? 'Esci Schermo' : 'Schermo Intero'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleSnow}
              aria-pressed={snowEnabled}
              className={toolbarBtnClass(snowEnabled)}
            >
              <Snowflake className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{snowEnabled ? 'Neve: Sì' : 'Neve: No'}</span>
            </button>

            <button
              type="button"
              data-music-toggle="true"
              onClick={onToggleMusic}
              aria-pressed={musicPlaying}
              title={
                musicPlaying
                  ? `In riproduzione: ${musicSongTitle} (clicca per mettere in pausa)`
                  : 'Avvia la musica natalizia di sottofondo'
              }
              className={toolbarBtnClass(
                musicPlaying || musicAwaitingGesture,
                musicPlaying
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900',
              )}
            >
              <Music className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {musicPlaying
                  ? 'Musica: Sì'
                  : musicAwaitingGesture
                    ? 'Avvia Musica'
                    : 'Musica: No'}
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              aria-pressed={soundEnabled}
              className={toolbarBtnClass(
                soundEnabled,
                'bg-emerald-700 border-emerald-800 text-white',
              )}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{soundEnabled ? 'Audio: Attivo' : 'Audio: Muto'}</span>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Quick Nav Row (hidden on lg where top nav is visible) */}
        <div className="lg:hidden max-w-6xl mx-auto px-4 pb-2 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => onNavigate('TITLE_MENU')}
            className="px-3 py-1 rounded-lg bg-white border border-[#E5E0D5] text-xs font-bold text-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Giochi
          </button>
          <button
            type="button"
            onClick={() => onNavigate('PLAYING', 'incastri')}
            className="px-3 py-1 rounded-lg bg-white border border-[#E5E0D5] text-xs font-bold text-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Incastra
          </button>
          <button
            type="button"
            onClick={() => onNavigate('EXPLORE')}
            className="px-3 py-1 rounded-lg bg-white border border-[#E5E0D5] text-xs font-bold text-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Abbina le Forme
          </button>
          <button
            type="button"
            onClick={() => onNavigate('DASHBOARD')}
            className="px-3 py-1 rounded-lg bg-white border border-[#E5E0D5] text-xs font-bold text-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onNavigate('INSTRUCTIONS')}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-[#E5E0D5] text-xs font-bold text-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-3 h-3" aria-hidden="true" />
            <span>Istruzioni</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('CREDITS')}
            className="px-3 py-1 rounded-lg bg-white border border-[#E5E0D5] text-xs font-bold text-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Elfi Equipers
          </button>
        </div>
      </div>
    </header>
  );
}
