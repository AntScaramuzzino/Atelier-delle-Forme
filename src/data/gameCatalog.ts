export type ColorId =
  | 'rosso'
  | 'blu'
  | 'giallo'
  | 'verde'
  | 'arancione'
  | 'viola';

export type ShapeId =
  | 'cerchio'
  | 'quadrato'
  | 'triangolo'
  | 'rettangolo'
  | 'stella'
  | 'cuore'
  | 'rombo'
  | 'esagono'
  | 'ovale';

export type DifficultyLevel = 'facile' | 'medio' | 'esperto';

export type GameMode = 'colori' | 'forme' | 'misto' | 'incastri';

export interface GameColor {
  id: ColorId;
  name: string;
  articleAndName: string;
  hex: string;
  darkHex: string;
  lightBg: string;
  textOnColor: string;
  example: string;
  xmasObject: string;
  level: 1 | 2;
}

export interface GameShape {
  id: ShapeId;
  name: string;
  articleAndName: string;
  sidesLabel: string;
  description: string;
  xmasGift: string;
  riddle: string;
  level: 1 | 2 | 3;
}

export const GAME_COLORS: GameColor[] = [
  {
    id: 'rosso',
    name: 'Rosso',
    articleAndName: 'il Rosso',
    hex: '#DC2626',
    darkHex: '#991B1B',
    lightBg: '#FEF2F2',
    textOnColor: '#FFFFFF',
    example: 'Come una fragola matura',
    xmasObject: 'Cappello di Babbo Natale',
    level: 1,
  },
  {
    id: 'blu',
    name: 'Blu',
    articleAndName: 'il Blu',
    hex: '#2563EB',
    darkHex: '#1E40AF',
    lightBg: '#EFF6FF',
    textOnColor: '#FFFFFF',
    example: 'Come il cielo d’inverno',
    xmasObject: 'Fiocco di neve ghiacciato',
    level: 1,
  },
  {
    id: 'giallo',
    name: 'Giallo',
    articleAndName: 'il Giallo',
    hex: '#EAB308',
    darkHex: '#A16207',
    lightBg: '#FEFCE8',
    textOnColor: '#1E293B',
    example: 'Come una stella lucente',
    xmasObject: 'Campanella d’oro',
    level: 1,
  },
  {
    id: 'verde',
    name: 'Verde',
    articleAndName: 'il Verde',
    hex: '#16A34A',
    darkHex: '#166534',
    lightBg: '#F0FDF4',
    textOnColor: '#FFFFFF',
    example: 'Come gli abeti del bosco',
    xmasObject: 'Albero di Natale',
    level: 1,
  },
  {
    id: 'arancione',
    name: 'Arancione',
    articleAndName: 'l’Arancione',
    hex: '#EA580C',
    darkHex: '#9A3412',
    lightBg: '#FFF7ED',
    textOnColor: '#FFFFFF',
    example: 'Come un mandarino dolce',
    xmasObject: 'Naso del pupazzo di neve',
    level: 2,
  },
  {
    id: 'viola',
    name: 'Viola',
    articleAndName: 'il Viola',
    hex: '#9333EA',
    darkHex: '#6B21A8',
    lightBg: '#FAF5FF',
    textOnColor: '#FFFFFF',
    example: 'Come i fiori di lavanda',
    xmasObject: 'Fiocco del pacchetto magico',
    level: 2,
  },
];

export const GAME_SHAPES: GameShape[] = [
  {
    id: 'cerchio',
    name: 'Cerchio',
    articleAndName: 'il Cerchio',
    sidesLabel: '0 angoli',
    description: 'È rotondo e gira come una pallina sull’albero.',
    xmasGift: 'Pallina dell’Albero',
    riddle: 'Sono tutto rotondo e non ho punte, proprio come una pallina di Natale!',
    level: 1,
  },
  {
    id: 'quadrato',
    name: 'Quadrato',
    articleAndName: 'il Quadrato',
    sidesLabel: '4 lati uguali',
    description: 'Ha quattro lati tutti uguali come un pacchetto regalo.',
    xmasGift: 'Pacco Regalo',
    riddle: 'Ho quattro lati tutti uguali come una scatola piena di doni!',
    level: 1,
  },
  {
    id: 'triangolo',
    name: 'Triangolo',
    articleAndName: 'il Triangolo',
    sidesLabel: '3 lati',
    description: 'Ha tre punte e sembra proprio un alberello di Natale.',
    xmasGift: 'Alberello di Natale',
    riddle: 'Ho tre punte e assomiglio alla punta dell’albero di Natale!',
    level: 1,
  },
  {
    id: 'rettangolo',
    name: 'Rettangolo',
    articleAndName: 'il Rettangolo',
    sidesLabel: '4 lati',
    description: 'Ha due lati lunghi e due corti, come un biglietto d’auguri.',
    xmasGift: 'Biglietto d’Auguri',
    riddle: 'Ho due lati lunghi e due più corti, proprio come una lettera per Babbo Natale!',
    level: 2,
  },
  {
    id: 'stella',
    name: 'Stella',
    articleAndName: 'la Stella',
    sidesLabel: '5 punte',
    description: 'Brilla in cima all’albero con cinque punte luminose.',
    xmasGift: 'Puntale dell’Albero',
    riddle: 'Brillo in alto con cinque punte sopra tutto l’albero!',
    level: 2,
  },
  {
    id: 'cuore',
    name: 'Cuore',
    articleAndName: 'il Cuore',
    sidesLabel: 'forma curva',
    description: 'Ha una forma dolce come un biscotto allo zenzero.',
    xmasGift: 'Biscotto di Natale',
    riddle: 'Sono dolce come un biscotto e porto tanto affetto!',
    level: 2,
  },
  {
    id: 'rombo',
    name: 'Rombo',
    articleAndName: 'il Rombo',
    sidesLabel: '4 lati uguali',
    description: 'Sembra un cristallo brillante o un aquilone festivo.',
    xmasGift: 'Cristallo di Ghiaccio',
    riddle: 'Ho quattro lati uguali e sembro un cristallo brillante!',
    level: 3,
  },
  {
    id: 'esagono',
    name: 'Esagono',
    articleAndName: 'l’Esagono',
    sidesLabel: '6 lati',
    description: 'Ha sei lati come i fiocchi di neve più preziosi.',
    xmasGift: 'Fiocco di Neve',
    riddle: 'Ho sei lati tutti in fila, come il cuore di un fiocco di neve!',
    level: 3,
  },
  {
    id: 'ovale',
    name: 'Ovale',
    articleAndName: 'l’Ovale',
    sidesLabel: '0 angoli',
    description: 'È un cerchio allungato, come un campanellino o un ovetto.',
    xmasGift: 'Addobbo Ovale',
    riddle: 'Sono rotondo ma un po’ allungato, proprio come una ghianda dorata!',
    level: 3,
  },
];

export interface DifficultyConfig {
  id: DifficultyLevel;
  label: string;
  ageRange: string;
  subtitle: string;
  maxColorLevel: 1 | 2;
  maxShapeLevel: 1 | 2 | 3;
  choiceCount: number;
  matchSlotCount: number;
  roundsCount: number;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  facile: {
    id: 'facile',
    label: 'Facile',
    ageRange: '3–4 anni',
    subtitle: '4 colori e 3 forme base con aiuto visivo',
    maxColorLevel: 1,
    maxShapeLevel: 1,
    choiceCount: 3,
    matchSlotCount: 3,
    roundsCount: 6,
  },
  medio: {
    id: 'medio',
    label: 'Medio',
    ageRange: '4–5 anni',
    subtitle: '6 colori e 6 forme tra regali e alberelli',
    maxColorLevel: 2,
    maxShapeLevel: 2,
    choiceCount: 4,
    matchSlotCount: 4,
    roundsCount: 8,
  },
  esperto: {
    id: 'esperto',
    label: 'Esperto',
    ageRange: '5–6 anni',
    subtitle: 'Tutti i 6 colori e tutte le 9 forme geometriche',
    maxColorLevel: 2,
    maxShapeLevel: 3,
    choiceCount: 6,
    matchSlotCount: 5,
    roundsCount: 8,
  },
};

export function getColorsForDifficulty(level: DifficultyLevel): GameColor[] {
  const max = DIFFICULTY_CONFIGS[level].maxColorLevel;
  return GAME_COLORS.filter((c) => c.level <= max);
}

export function getShapesForDifficulty(level: DifficultyLevel): GameShape[] {
  const max = DIFFICULTY_CONFIGS[level].maxShapeLevel;
  return GAME_SHAPES.filter((s) => s.level <= max);
}

export function getColorById(id: ColorId): GameColor {
  return GAME_COLORS.find((c) => c.id === id) ?? GAME_COLORS[0];
}

export function getShapeById(id: ShapeId): GameShape {
  return GAME_SHAPES.find((s) => s.id === id) ?? GAME_SHAPES[0];
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
