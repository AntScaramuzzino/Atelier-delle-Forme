import type { ShapeId } from '../data/gameCatalog';

interface ShapeSvgProps {
  shape: ShapeId;
  colorHex: string;
  borderHex?: string;
  variant?: 'solid' | 'slot' | 'outline';
  className?: string;
}

export function ShapeSvg({
  shape,
  colorHex,
  borderHex = '#1E293B',
  variant = 'solid',
  className = 'w-28 h-28',
}: ShapeSvgProps) {
  const isSlot = variant === 'slot';
  const isOutline = variant === 'outline';

  const fill = isSlot
    ? '#E7E2D8'
    : isOutline
      ? 'transparent'
      : colorHex;

  const stroke = isSlot
    ? '#A8A29E'
    : isOutline
      ? colorHex
      : borderHex;

  const strokeWidth = isSlot ? 4 : isOutline ? 5 : 3.5;
  const strokeDasharray = isSlot ? '8 6' : undefined;

  const renderGeometry = (extraProps?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    transform?: string;
    opacity?: number;
    pointerEvents?: 'none';
  }) => {
    const common = {
      fill: extraProps?.fill ?? fill,
      stroke: extraProps?.stroke ?? stroke,
      strokeWidth: extraProps?.strokeWidth ?? strokeWidth,
      strokeLinejoin: 'round' as const,
      strokeLinecap: 'round' as const,
      strokeDasharray: extraProps ? undefined : strokeDasharray,
      transform: extraProps?.transform,
      opacity: extraProps?.opacity,
      pointerEvents: extraProps?.pointerEvents,
    };

    switch (shape) {
      case 'cerchio':
        return <circle cx="60" cy="60" r="44" {...common} />;
      case 'quadrato':
        return <rect x="18" y="18" width="84" height="84" rx="10" {...common} />;
      case 'triangolo':
        return <polygon points="60,14 106,98 14,98" {...common} />;
      case 'rettangolo':
        return <rect x="10" y="28" width="100" height="64" rx="9" {...common} />;
      case 'stella':
        return (
          <polygon
            points="60,12 73.5,41 105,45.5 82,67.5 87.5,99 60,84 32.5,99 38,67.5 15,45.5 46.5,41"
            {...common}
          />
        );
      case 'cuore':
        return (
          <path
            d="M60 100 C60 100 14 72 14 42 C14 25 27 16 40 16 C50 16 57 22 60 28 C63 22 70 16 80 16 C93 16 106 25 106 42 C106 72 60 100 60 100 Z"
            {...common}
          />
        );
      case 'rombo':
        return <polygon points="60,12 104,60 60,108 16,60" {...common} />;
      case 'esagono':
        return (
          <polygon
            points="60,14 100,37 100,83 60,106 20,83 20,37"
            {...common}
          />
        );
      case 'ovale':
        return <ellipse cx="60" cy="60" rx="48" ry="33" {...common} />;
    }
  };

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
    >
      {/* Subtle drop depth underneath solid wooden blocks */}
      {variant === 'solid' &&
        renderGeometry({
          fill: 'rgba(15, 23, 42, 0.12)',
          stroke: 'none',
          strokeWidth: 0,
          transform: 'translate(0, 4)',
          pointerEvents: 'none',
        })}

      {renderGeometry()}

      {/* Tactile wooden top rim highlight on solid blocks */}
      {variant === 'solid' &&
        renderGeometry({
          fill: 'none',
          stroke: 'rgba(255, 255, 255, 0.34)',
          strokeWidth: 2.5,
          transform: 'scale(0.92) translate(5.2, 5.2)',
          pointerEvents: 'none',
        })}
    </svg>
  );
}
