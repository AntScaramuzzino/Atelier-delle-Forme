export type ElfId = 'rossella' | 'lorenzo' | 'antonio' | 'alfredo' | 'stella';

export interface ElfProfile {
  id: ElfId;
  name: string;
  role: string;
  specialty: string;
  gender: 'female' | 'male';
  pitch: number;
  rate: number;
  accentHex: string;
  softBgHex: string;
  borderHex: string;
  introLine: string;
  bio: string;
}

export const ELVES: Record<ElfId, ElfProfile> = {
  rossella: {
    id: 'rossella',
    name: 'Elfa Rossella',
    role: 'Trova il Colore',
    specialty: 'Didattica Infanzia',
    gender: 'female',
    pitch: 1.04,
    rate: 0.93,
    accentHex: '#0284C7',
    softBgHex: '#F0F9FF',
    borderHex: '#7DD3FC',
    introLine:
      'Ciao piccoli esploratori, sono Elfa Rossella! Iniziamo insieme a scoprire i colori brillanti del Natale.',
    bio: 'Accoglie i bambini all’ingresso dell’atelier e li guida nei giochi sui colori primari e secondari.',
  },
  lorenzo: {
    id: 'lorenzo',
    name: 'Elfo Lorenzo',
    role: 'Incastra le Forme',
    specialty: 'Incastri & Costruzioni',
    gender: 'male',
    pitch: 0.98,
    rate: 0.97,
    accentHex: '#059669',
    softBgHex: '#ECFDF5',
    borderHex: '#6EE7B7',
    introLine:
      'Ciao amici! Sono Elfo Lorenzo. Aiutami a incastrare ogni blocco di legno nello spazio giusto, sulla tavola di Natale!',
    bio: 'Specialista della tavola in legno e dell’Albero delle Forme, allena la coordinazione mano-occhio.',
  },
  antonio: {
    id: 'antonio',
    name: 'Elfo Antonio',
    role: 'Trova la Forma',
    specialty: 'Geometria & Gioco',
    gender: 'male',
    pitch: 0.89,
    rate: 0.91,
    accentHex: '#D97706',
    softBgHex: '#FFFBEB',
    borderHex: '#FCD34D',
    introLine:
      'Benvenuti alla slitta, sono Elfo Antonio! Carichiamo insieme cerchi, triangoli, stelle e pacchetti geometrici.',
    bio: 'Coordina la slitta natalizia aiutando i bambini a riconoscere ogni figura geometrica tra i regali.',
  },
  alfredo: {
    id: 'alfredo',
    name: 'Elfo Alfredo',
    role: 'Abbina le Forme',
    specialty: 'Forme & Colori',
    gender: 'male',
    pitch: 0.94,
    rate: 0.95,
    accentHex: '#16A34A',
    softBgHex: '#F0FDF4',
    borderHex: '#86EFAC',
    introLine:
      'Ehilà, sono Elfo Alfredo! Con me puoi abbinare forme e colori insieme in base alla tua età, per vincere tante stelle e medaglie.',
    bio: 'Guida il gioco Abbina le Forme per combinare colori e figure geometriche e scoprire lati e caratteristiche.',
  },
  stella: {
    id: 'stella',
    name: 'Elfa Stella',
    role: 'Dashboard & Certificati',
    specialty: 'Creatività & LIM',
    gender: 'female',
    pitch: 1.09,
    rate: 0.98,
    accentHex: '#CA8A04',
    softBgHex: '#FEFCE8',
    borderHex: '#FDE047',
    introLine:
      'Evviva, sono Elfa Stella! Tengo il conto delle tue stelle, sblocco le medaglie di Natale e preparo il tuo certificato finale.',
    bio: 'Accoglie la classe alla LIM, festeggia ogni progresso e firma il Certificato ufficiale dell’Elfo Geometra.',
  },
};

export const ELF_ORDER: ElfId[] = [
  'rossella',
  'lorenzo',
  'antonio',
  'alfredo',
  'stella',
];

export interface ChristmasMedal {
  id: string;
  name: string;
  threshold: number;
  description: string;
  colorHex: string;
  accentHex: string;
}

export const CHRISTMAS_MEDALS: ChristmasMedal[] = [
  {
    id: 'fiocco',
    name: 'Fiocco di Neve',
    threshold: 3,
    description: 'Primi passi tra i colori',
    colorHex: '#0284C7',
    accentHex: '#E0F2FE',
  },
  {
    id: 'campanella',
    name: 'Campanella d’Oro',
    threshold: 6,
    description: 'Orecchio attento alle forme',
    colorHex: '#D97706',
    accentHex: '#FEF3C7',
  },
  {
    id: 'alberello',
    name: 'Alberello Magico',
    threshold: 12,
    description: 'Esploratore dell’atelier',
    colorHex: '#15803D',
    accentHex: '#DCFCE7',
  },
  {
    id: 'pacco',
    name: 'Pacco dei Doni',
    threshold: 18,
    description: 'Campione degli incastri',
    colorHex: '#DC2626',
    accentHex: '#FEE2E2',
  },
  {
    id: 'renna',
    name: 'Renna Polare',
    threshold: 25,
    description: 'Veloce e preciso con la slitta',
    colorHex: '#9333EA',
    accentHex: '#F3E8FF',
  },
  {
    id: 'cometa',
    name: 'Stella Cometa',
    threshold: 35,
    description: 'Maestro dei Colori e delle Forme',
    colorHex: '#CA8A04',
    accentHex: '#FEF9C3',
  },
];

export function getEarnedRankTitle(totalStars: number): string {
  if (totalStars >= 35) return 'Maestro Elfo dei Colori e delle Forme';
  if (totalStars >= 25) return 'Grande Esploratore di Natale';
  if (totalStars >= 12) return 'Aiutante Esperto dell’Atelier';
  if (totalStars >= 3) return 'Piccolo Scopritore dell’Atelier';
  return 'Apprendista dell’Atelier';
}
