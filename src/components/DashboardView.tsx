import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  RotateCcw,
  Square,
  Star,
  Volume2,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CHRISTMAS_MEDALS,
  ELVES,
  getEarnedRankTitle,
} from '../data/elves';
import {
  GAME_COLORS,
  GAME_SHAPES,
  type ColorId,
  type GameMode,
  type ShapeId,
} from '../data/gameCatalog';
import { generateKindergartenCertificatePdf } from '../utils/certificatePdf';
import {
  playTapSound,
  speakAsElf,
  stopSpeaking,
  subscribeSpeechState,
} from '../utils/sound';
import { ChristmasMedalSvg, ElfAvatarSvg } from './ElfAvatarSvg';
import { ShapeSvg } from './ShapeSvg';

export interface MasteryStats {
  totalStars: number;
  gamesCompleted: number;
  starsByMode: Record<GameMode, number>;
  incastriCompleted: number;
  colorCounts: Partial<Record<ColorId, number>>;
  shapeCounts: Partial<Record<ShapeId, number>>;
}

interface DashboardViewProps {
  stats: MasteryStats;
  soundEnabled: boolean;
  onResetStats: () => void;
  onBack: () => void;
}

export function DashboardView({
  stats,
  soundEnabled,
  onResetStats,
  onBack,
}: DashboardViewProps) {
  const [studentName, setStudentName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfNotice, setPdfNotice] = useState<string | null>(null);
  const [speakingTag, setSpeakingTag] = useState<string | null>(null);

  useEffect(() => {
    return subscribeSpeechState(setSpeakingTag);
  }, []);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const colorsUnlocked = GAME_COLORS.filter(
    (c) => (stats.colorCounts[c.id] ?? 0) > 0,
  ).length;
  const shapesUnlocked = GAME_SHAPES.filter(
    (s) => (stats.shapeCounts[s.id] ?? 0) > 0,
  ).length;
  const unlockedMedals = CHRISTMAS_MEDALS.filter(
    (m) => stats.totalStars >= m.threshold,
  );
  const earnedTitle = getEarnedRankTitle(stats.totalStars);

  const chartData = [
    {
      name: 'Colori',
      stelle: stats.starsByMode.colori ?? 0,
      fill: '#DC2626',
    },
    {
      name: 'Trova Forma',
      stelle: stats.starsByMode.forme ?? 0,
      fill: '#2563EB',
    },
    {
      name: 'Abbina Forme',
      stelle: stats.starsByMode.misto ?? 0,
      fill: '#EAB308',
    },
    {
      name: 'Incastri',
      stelle: stats.starsByMode.incastri ?? 0,
      fill: '#16A34A',
    },
  ];

  const isSpeaking = speakingTag === 'dashboard-stella';

  const handleToggleStellaVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakAsElf(
        `Ciao! Sono Elfa Stella. Finora hai raccolto ${stats.totalStars} stelle e sbloccato ${unlockedMedals.length} medaglie di Natale! Il tuo titolo è ${earnedTitle}.`,
        'stella',
        soundEnabled,
        { forcePlay: true, utteranceTag: 'dashboard-stella' },
      );
    }
  };

  const handleDownloadPdf = async () => {
    playTapSound(soundEnabled);
    setIsGeneratingPdf(true);
    setPdfNotice(null);
    try {
      await generateKindergartenCertificatePdf({
        studentName,
        teacherName,
        totalStars: stats.totalStars,
        gamesCompleted: stats.gamesCompleted,
        incastriCompleted: stats.incastriCompleted,
        colorCounts: stats.colorCounts,
        shapeCounts: stats.shapeCounts,
      });
      setPdfNotice('Certificato PDF pronto e scaricato!');
    } catch {
      setPdfNotice('Impossibile generare il PDF in questo momento. Riprova.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
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

        <button
          type="button"
          onClick={onResetStats}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F2EFE8] text-slate-700 font-semibold text-sm hover:bg-[#E7E2D6] active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Azzera Progressi</span>
        </button>
      </div>

      {/* Elfa Stella Welcome Banner & KPIs */}
      <div className="bg-white border border-[#E5E0D5] rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <ElfAvatarSvg
              elfId="stella"
              className="w-20 h-20 rounded-2xl shrink-0 border border-[#E5E0D5]"
            />
            <div>
              <p className="text-xs font-bold text-amber-700 mb-1">
                {ELVES.stella.name} · {ELVES.stella.role}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
                Dashboard, Medaglie e Certificato
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Titolo attuale: <strong className="text-slate-900">{earnedTitle}</strong>
              </p>
              <button
                type="button"
                onClick={handleToggleStellaVoice}
                className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-red-600 text-white'
                    : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                    <span>Ferma</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Ascolta Elfa Stella</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 border-t lg:border-t-0 lg:border-l border-[#ECE7DC] pt-5 lg:pt-0 lg:pl-8 shrink-0">
            <div>
              <div className="flex items-center gap-1.5 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                <Star className="w-6 h-6 fill-amber-400 text-amber-500" aria-hidden="true" />
                <span>{stats.totalStars}</span>
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                Stelle totali
              </div>
            </div>

            <div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {unlockedMedals.length}/{CHRISTMAS_MEDALS.length}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                Medaglie
              </div>
            </div>

            <div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {colorsUnlocked}/{GAME_COLORS.length}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                Colori scoperti
              </div>
            </div>

            <div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {shapesUnlocked}/{GAME_SHAPES.length}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                Forme scoperte
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart + PDF Generator 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 items-stretch">
        {/* Left: Recharts Bar Chart */}
        <div className="lg:col-span-6 bg-white border border-[#E5E0D5] rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="font-display text-xl font-bold text-slate-900 mb-1">
            Stelle per Attività
          </h3>
          <p className="text-sm text-slate-600 mb-5">
            Andamento delle stelle raccolte nei quattro giochi dell’atelier.
          </p>

          <div className="flex-1 min-h-[260px] w-full">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE7DC" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: '#E5E0D5' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.7)' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E5E0D5',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="stelle" name="Stelle" radius={[10, 10, 0, 0]} maxBarSize={56}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Client-side A4 PDF Certificate Builder */}
        <div className="lg:col-span-6 bg-white border border-[#E5E0D5] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="font-display text-xl font-bold text-slate-900">
                Certificato dell’Elfo Geometra (PDF A4)
              </h3>
              <span className="text-xs font-bold text-emerald-800">
                Firmato da Elfa Stella
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Personalizza con il nome del bambino o della sezione dell’infanzia e scarica l’attestato natalizio da stampare.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="cert-student-name"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Nome alunno/a o sezione (es. Sofia · Sezione Coccinelle)
                </label>
                <input
                  id="cert-student-name"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Scrivi il nome o lascia vuoto per compilarlo a mano"
                  maxLength={60}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF8F4] border border-[#DDD3BF] text-slate-900 text-sm font-medium focus:outline-2 focus:outline-emerald-700"
                />
              </div>

              <div>
                <label
                  htmlFor="cert-teacher-name"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Nome Insegnante (opzionale)
                </label>
                <input
                  id="cert-teacher-name"
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Es. Maestra Maria"
                  maxLength={45}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF8F4] border border-[#DDD3BF] text-slate-900 text-sm font-medium focus:outline-2 focus:outline-emerald-700"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-800 text-white font-display font-bold text-base hover:bg-emerald-900 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              <Download className="w-5 h-5" aria-hidden="true" />
              <span>
                {isGeneratingPdf
                  ? 'Preparazione PDF in corso...'
                  : 'Scarica Certificato PDF (A4 Orizzontale)'}
              </span>
            </button>

            {pdfNotice && (
              <p
                role="status"
                className="mt-3 text-xs font-bold text-emerald-800 text-center"
              >
                {pdfNotice}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 6 Christmas Medals Grid */}
      <div className="mb-10">
        <h3 className="font-display text-xl font-bold text-slate-900 mb-4">
          Le 6 Medaglie di Natale
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CHRISTMAS_MEDALS.map((medal) => {
            const unlocked = stats.totalStars >= medal.threshold;
            return (
              <div
                key={medal.id}
                className={`rounded-2xl p-4 border text-center flex flex-col items-center transition-colors ${
                  unlocked
                    ? 'bg-white border-[#E5E0D5] shadow-sm'
                    : 'bg-[#F2EFE8]/80 border-[#E5E0D5] opacity-75'
                }`}
              >
                <ChristmasMedalSvg
                  medalId={medal.id}
                  unlocked={unlocked}
                  colorHex={medal.colorHex}
                  accentHex={medal.accentHex}
                  className="w-16 h-16 mb-2"
                />
                <div className="font-display font-bold text-sm text-slate-900">
                  {medal.name}
                </div>
                <div className="text-xs text-slate-600 mt-0.5 mb-2">
                  {medal.description}
                </div>
                <div className="mt-auto text-xs font-bold tabular-nums text-slate-700 inline-flex items-center gap-1">
                  {unlocked ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      <span className="text-emerald-800">Sbloccata!</span>
                    </>
                  ) : (
                    <>
                      <Star className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                      <span>{medal.threshold} stelle</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Album of Colors & Shapes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <h3 className="font-display text-xl font-bold text-slate-900 mb-4">
            Album dei Colori
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {GAME_COLORS.map((color) => {
              const count = stats.colorCounts[color.id] ?? 0;
              const mastered = count > 0;
              return (
                <div
                  key={color.id}
                  className={`rounded-2xl p-4 border text-center ${
                    mastered
                      ? 'bg-white border-[#E5E0D5] shadow-sm'
                      : 'bg-[#F2EFE8]/70 border-[#E5E0D5] opacity-70'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-2.5 border border-black/10"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="font-display font-bold text-sm text-slate-900">
                    {color.name}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 tabular-nums mt-0.5">
                    {mastered ? `${count}x` : 'Da scoprire'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7">
          <h3 className="font-display text-xl font-bold text-slate-900 mb-4">
            Album delle Forme Geometriche
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3.5">
            {GAME_SHAPES.map((shape, idx) => {
              const count = stats.shapeCounts[shape.id] ?? 0;
              const mastered = count > 0;
              const swatch = GAME_COLORS[idx % GAME_COLORS.length];

              return (
                <div
                  key={shape.id}
                  className={`rounded-2xl p-3.5 border text-center ${
                    mastered
                      ? 'bg-white border-[#E5E0D5] shadow-sm'
                      : 'bg-[#F2EFE8]/70 border-[#E5E0D5] opacity-70'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <ShapeSvg
                      shape={shape.id}
                      colorHex={mastered ? swatch.hex : '#CBD5E1'}
                      borderHex={mastered ? swatch.darkHex : '#94A3B8'}
                      className="w-12 h-12"
                    />
                  </div>
                  <div className="font-display font-bold text-xs sm:text-sm text-slate-900">
                    {shape.name}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 tabular-nums mt-0.5">
                    {mastered ? `${count}x` : 'Da scoprire'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
