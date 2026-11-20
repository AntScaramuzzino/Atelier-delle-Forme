import { GAME_COLORS } from '../data/gameCatalog';

interface ConfettiBurstProps {
  active: boolean;
}

const CONFETTI_PIECES = Array.from({ length: 22 }, (_, i) => {
  const color = GAME_COLORS[i % GAME_COLORS.length].hex;
  const left = 6 + ((i * 4.3) % 88);
  const delay = (i % 7) * 0.045;
  const size = 10 + (i % 3) * 4;
  const isRound = i % 3 === 0;
  return { id: i, color, left, delay, size, isRound };
});

export function ConfettiBurst({ active }: ConfettiBurstProps) {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 h-80 overflow-hidden z-50"
      aria-hidden="true"
    >
      {CONFETTI_PIECES.map((piece) => (
        <span
          key={piece.id}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.isRound ? piece.size : piece.size * 0.65}px`,
            backgroundColor: piece.color,
            borderRadius: piece.isRound ? '9999px' : '3px',
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
