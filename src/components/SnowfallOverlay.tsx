interface SnowfallOverlayProps {
  active: boolean;
}

const SNOWFLAKES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: ((i * 4.2 + 2) % 97).toFixed(1),
  size: 5 + (i % 4) * 2,
  duration: 7 + (i % 5) * 1.8,
  delay: -((i * 1.1) % 8),
  opacity: 0.45 + (i % 4) * 0.12,
}));

export function SnowfallOverlay({ active }: SnowfallOverlayProps) {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-30"
      aria-hidden="true"
    >
      {SNOWFLAKES.map((flake) => (
        <span
          key={flake.id}
          className="absolute -top-4 rounded-full bg-sky-200 border border-white/80 animate-snowfall"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
