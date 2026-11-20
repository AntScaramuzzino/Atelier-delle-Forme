import { useState } from 'react';
import { ELVES, type ElfId } from '../data/elves';

interface ElfAvatarSvgProps {
  elfId: ElfId;
  className?: string;
}

export function ElfAvatarSvg({
  elfId,
  className = 'w-24 h-24 rounded-2xl',
}: ElfAvatarSvgProps) {
  const [imgError, setImgError] = useState(false);
  const elf = ELVES[elfId];

  if (!imgError) {
    return (
      <img
        src={`/assets/elves/${elfId}.png`}
        alt={elf.name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`object-cover bg-white ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-display font-extrabold text-slate-900 border border-[#E5E0D5] ${className}`}
      style={{ backgroundColor: elf.softBgHex }}
      aria-label={elf.name}
    >
      {elf.name
        .split(' ')
        .map((w) => w[0])
        .join('')}
    </div>
  );
}

export function XmasLabBadgeSvg({
  className = 'w-16 h-16',
}: {
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="/assets/aistudio/image_f371b378.png"
        alt="Xmas Lab - La magIA continua"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`object-contain rounded-2xl border border-slate-200 bg-white p-1.5 ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-2xl border border-[#E5E0D5] bg-white flex items-center justify-center text-[10px] font-extrabold text-red-600 text-center p-1 ${className}`}
    >
      XMAS LAB
    </div>
  );
}

export function ChristmasMedalSvg({
  medalId,
  unlocked,
  colorHex,
  accentHex,
  className = 'w-16 h-16',
}: {
  medalId: string;
  unlocked: boolean;
  colorHex: string;
  accentHex: string;
  className?: string;
}) {
  const stroke = unlocked ? colorHex : '#94A3B8';
  const bg = unlocked ? accentHex : '#F1F5F9';

  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <path d="M28 6 L40 22 L52 6 Z" fill={unlocked ? '#DC2626' : '#CBD5E1'} />
      <circle cx="40" cy="45" r="28" fill={bg} stroke={stroke} strokeWidth="4" />
      <circle
        cx="40"
        cy="45"
        r="22"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {medalId === 'fiocco' && (
        <g stroke={stroke} strokeWidth="3" strokeLinecap="round">
          <line x1="40" y1="30" x2="40" y2="60" />
          <line x1="27" y1="37" x2="53" y2="53" />
          <line x1="27" y1="53" x2="53" y2="37" />
        </g>
      )}
      {medalId === 'campanella' && (
        <g fill={stroke}>
          <path d="M40 30 C32 30 29 38 28 48 L24 53 L56 53 L52 48 C51 38 48 30 40 30 Z" />
          <circle cx="40" cy="56" r="3.5" />
        </g>
      )}
      {medalId === 'alberello' && (
        <g fill={stroke}>
          <polygon points="40,28 53,45 27,45" />
          <polygon points="40,37 56,55 24,55" />
          <rect x="37" y="55" width="6" height="6" />
        </g>
      )}
      {medalId === 'pacco' && (
        <g fill="none" stroke={stroke} strokeWidth="3">
          <rect
            x="28"
            y="36"
            width="24"
            height="20"
            rx="2"
            fill={unlocked ? '#FFFFFF' : 'none'}
          />
          <line x1="40" y1="36" x2="40" y2="56" />
          <line x1="28" y1="45" x2="52" y2="45" />
          <path d="M40 36 C35 30 31 32 34 36 C37 36 40 36 40 36 Z" />
          <path d="M40 36 C45 30 49 32 46 36 C43 36 40 36 40 36 Z" />
        </g>
      )}
      {medalId === 'renna' && (
        <g fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round">
          <circle
            cx="40"
            cy="48"
            r="10"
            fill={unlocked ? '#FFFFFF' : 'none'}
          />
          <path d="M33 39 L28 28 M28 33 L24 31 M47 39 L52 28 M52 33 L56 31" />
          <circle
            cx="40"
            cy="50"
            r="3"
            fill={unlocked ? '#DC2626' : '#94A3B8'}
            stroke="none"
          />
        </g>
      )}
      {medalId === 'cometa' && (
        <polygon
          points="40,29 44,39 55,40 46,47 49,58 40,52 31,58 34,47 25,40 36,39"
          fill={stroke}
        />
      )}
    </svg>
  );
}
