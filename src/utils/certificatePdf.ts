import { jsPDF } from 'jspdf';
import { CHRISTMAS_MEDALS, getEarnedRankTitle } from '../data/elves';
import { GAME_COLORS, GAME_SHAPES, type ColorId, type ShapeId } from '../data/gameCatalog';

export interface CertificatePayload {
  studentName: string;
  teacherName?: string;
  totalStars: number;
  gamesCompleted: number;
  incastriCompleted: number;
  colorCounts: Partial<Record<ColorId, number>>;
  shapeCounts: Partial<Record<ShapeId, number>>;
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 400;
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function drawStar(
  doc: jsPDF,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  fillRgb: [number, number, number],
  strokeRgb?: [number, number, number],
): void {
  const points: Array<[number, number]> = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (-Math.PI / 2) + (i * Math.PI) / 5;
    points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  doc.setFillColor(...fillRgb);
  if (strokeRgb) {
    doc.setDrawColor(...strokeRgb);
    doc.setLineWidth(0.35);
  }
  // Build lines using jsPDF path API
  const lines: Array<[number, number]> = [];
  for (let i = 1; i < points.length; i++) {
    lines.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]]);
  }
  doc.lines(lines, points[0][0], points[0][1], [1, 1], strokeRgb ? 'FD' : 'F', true);
}

function drawSnowflake(doc: jsPDF, cx: number, cy: number, r: number): void {
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.35);
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3;
    doc.line(
      cx - Math.cos(a) * r,
      cy - Math.sin(a) * r,
      cx + Math.cos(a) * r,
      cy + Math.sin(a) * r,
    );
  }
}

function drawChristmasTree(doc: jsPDF, cx: number, bottomY: number): void {
  // Trunk
  doc.setFillColor(120, 53, 15);
  doc.rect(cx - 2.5, bottomY - 5, 5, 5, 'F');
  // 3 tiers
  doc.setFillColor(21, 128, 61);
  doc.triangle(cx, bottomY - 26, cx - 10, bottomY - 14, cx + 10, bottomY - 14, 'F');
  doc.triangle(cx, bottomY - 20, cx - 12, bottomY - 9, cx + 12, bottomY - 9, 'F');
  doc.triangle(cx, bottomY - 14, cx - 14, bottomY - 4, cx + 14, bottomY - 4, 'F');
  // Star on top
  drawStar(doc, cx, bottomY - 27.5, 3, 1.3, [250, 204, 21], [161, 98, 7]);
  // Ornaments
  doc.setFillColor(220, 38, 38);
  doc.circle(cx - 4, bottomY - 11, 1.2, 'F');
  doc.circle(cx + 5, bottomY - 7, 1.2, 'F');
  doc.setFillColor(250, 204, 21);
  doc.circle(cx + 2, bottomY - 16, 1.1, 'F');
  doc.circle(cx - 5, bottomY - 6, 1.1, 'F');
}

function drawHangingOrnament(
  doc: jsPDF,
  cx: number,
  topY: number,
  len: number,
  r: number,
  bodyRgb: [number, number, number],
): void {
  doc.setDrawColor(180, 130, 50);
  doc.setLineWidth(0.5);
  doc.line(cx, topY, cx, topY + len);
  doc.setFillColor(234, 179, 8);
  doc.rect(cx - 1.8, topY + len - 1, 3.6, 2, 'F');
  doc.setFillColor(...bodyRgb);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.35);
  doc.circle(cx, topY + len + r + 0.6, r, 'FD');
  doc.setFillColor(250, 204, 21);
  doc.rect(cx - r + 0.6, topY + len + r - 0.5, (r - 0.6) * 2, 1.8, 'F');
}

function drawElfaStellaPortrait(doc: jsPDF, x: number, y: number, size: number): void {
  // Frame
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.7);
  doc.roundedRect(x, y, size, size, 3, 3, 'FD');

  const cx = x + size / 2;
  const cy = y + size * 0.53;

  // Green sweater
  doc.setFillColor(22, 163, 74);
  doc.roundedRect(x + size * 0.18, y + size * 0.74, size * 0.64, size * 0.24, 2, 2, 'F');

  // Face
  doc.setFillColor(254, 215, 170);
  doc.circle(cx, cy, size * 0.24, 'F');

  // Hat
  doc.setFillColor(21, 128, 61);
  doc.triangle(cx - size * 0.24, cy - size * 0.12, cx + size * 0.28, cy - size * 0.36, cx + size * 0.24, cy - size * 0.12, 'F');
  doc.setFillColor(220, 38, 38);
  doc.roundedRect(cx - size * 0.25, cy - size * 0.16, size * 0.5, size * 0.08, 1, 1, 'F');
  drawStar(doc, cx + size * 0.29, cy - size * 0.36, size * 0.07, size * 0.03, [250, 204, 21]);

  // Glasses & eyes
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.45);
  doc.circle(cx - size * 0.09, cy - size * 0.01, size * 0.065, 'S');
  doc.circle(cx + size * 0.09, cy - size * 0.01, size * 0.065, 'S');
  doc.setFillColor(30, 41, 59);
  doc.circle(cx - size * 0.09, cy - size * 0.01, size * 0.02, 'F');
  doc.circle(cx + size * 0.09, cy - size * 0.01, size * 0.02, 'F');

  // Smile
  doc.setDrawColor(154, 52, 18);
  doc.line(cx - size * 0.06, cy + size * 0.1, cx + size * 0.06, cy + size * 0.1);
}

export async function generateKindergartenCertificatePdf(
  payload: CertificatePayload,
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageW = 297;
  const pageH = 210;

  // Warm cream parchment background
  doc.setFillColor(255, 253, 248);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Triple festive borders
  doc.setDrawColor(20, 83, 45);
  doc.setLineWidth(2.2);
  doc.rect(6, 6, pageW - 12, pageH - 12, 'S');

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.9);
  doc.rect(9, 9, pageW - 18, pageH - 18, 'S');

  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.4);
  doc.rect(11, 11, pageW - 22, pageH - 22, 'S');

  // Pine green top header banner
  doc.setFillColor(20, 83, 45);
  doc.rect(11, 11, pageW - 22, 31, 'F');
  doc.setDrawColor(234, 179, 8);
  doc.setLineWidth(0.8);
  doc.line(11, 42, pageW - 11, 42);

  // EFT Calabria Logo box on top-left
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(17, 15, 42, 23, 2.5, 2.5, 'F');
  const eftLogoDataUrl = await loadImageAsDataUrl('/assets/aistudio/image_0299a0fc.png');
  if (eftLogoDataUrl) {
    doc.addImage(eftLogoDataUrl, 'PNG', 19, 17, 38, 19);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(161, 98, 7);
    doc.text('EFT Calabria', 38, 28, { align: 'center' });
  }

  // Xmas Lab Badge on top-right
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageW - 43, 15, 26, 23, 2.5, 2.5, 'F');
  const xmasLabDataUrl = await loadImageAsDataUrl('/assets/aistudio/image_f371b378.png');
  if (xmasLabDataUrl) {
    doc.addImage(xmasLabDataUrl, 'PNG', pageW - 41, 16, 22, 21);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('XMAS LAB', pageW - 30, 27, { align: 'center' });
  }

  // Header Titles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(250, 204, 21);
  doc.text(
    'MISSIONE NATALE: ATELIER DELLE FORME E DEI COLORI  |  XMAS LAB',
    pageW / 2,
    22,
    { align: 'center' },
  );

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("CERTIFICATO DELL'ELFO GEOMETRA", pageW / 2, 34, {
    align: 'center',
  });

  // Hanging ornaments & snowflakes
  drawHangingOrnament(doc, 22, 42, 10, 4.5, [220, 38, 38]);
  drawHangingOrnament(doc, 36, 42, 14, 3.8, [21, 128, 61]);
  drawSnowflake(doc, 52, 52, 4);
  drawStar(doc, 65, 52, 4, 1.7, [250, 204, 21], [161, 98, 7]);

  drawStar(doc, pageW - 65, 52, 4, 1.7, [250, 204, 21], [161, 98, 7]);
  drawSnowflake(doc, pageW - 52, 52, 4);
  drawHangingOrnament(doc, pageW - 36, 42, 14, 3.8, [21, 128, 61]);
  drawHangingOrnament(doc, pageW - 22, 42, 10, 4.5, [220, 38, 38]);

  // Recipient section
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('Si certifica con gioia che', pageW / 2, 55, { align: 'center' });

  const cleanName = payload.studentName.trim();
  if (cleanName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(21);
    doc.setTextColor(15, 23, 42);
    doc.text(cleanName, pageW / 2, 66, { align: 'center' });
  }
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(74, 68.5, pageW - 74, 68.5);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('(Nome alunno/a o sezione infanzia)', pageW / 2, 72.5, {
    align: 'center',
  });

  // Flanking trees
  drawChristmasTree(doc, 49, 96);
  drawSnowflake(doc, 27, 84, 4);
  drawChristmasTree(doc, pageW - 49, 96);
  drawSnowflake(doc, pageW - 27, 84, 4);

  // Red Title Pill Banner
  const earnedTitle = getEarnedRankTitle(payload.totalStars);
  doc.setFillColor(220, 38, 38);
  doc.roundedRect(68, 78, pageW - 136, 13, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`Titolo conseguito: ${earnedTitle}`, pageW / 2, 86.2, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(
    'Ha esplorato con entusiasmo colori brillanti, forme geometriche e incastri nell’Atelier di Natale!',
    pageW / 2,
    98.5,
    { align: 'center' },
  );

  // 4 Stat Cards
  const colorsFound = GAME_COLORS.filter(
    (c) => (payload.colorCounts[c.id] ?? 0) > 0,
  ).length;
  const shapesFound = GAME_SHAPES.filter(
    (s) => (payload.shapeCounts[s.id] ?? 0) > 0,
  ).length;
  const unlockedMedals = CHRISTMAS_MEDALS.filter(
    (m) => payload.totalStars >= m.threshold,
  );
  const nextMedal = CHRISTMAS_MEDALS.find((m) => payload.totalStars < m.threshold);

  const cards = [
    {
      label: 'STELLE TOTALI',
      value: `${payload.totalStars}`,
      sub: 'Raccolte nei giochi',
      stripe: [217, 119, 6] as [number, number, number],
    },
    {
      label: 'MEDAGLIE SBLOCCATE',
      value: `${unlockedMedals.length}/${CHRISTMAS_MEDALS.length}`,
      sub: nextMedal
        ? `Prossima a ${nextMedal.threshold} stelle`
        : 'Tutte sbloccate!',
      stripe: [220, 38, 38] as [number, number, number],
    },
    {
      label: 'COLORI SCOPERTI',
      value: `${colorsFound}/${GAME_COLORS.length}`,
      sub: 'Rosso, Blu, Giallo, Verde...',
      stripe: [20, 83, 45] as [number, number, number],
    },
    {
      label: 'FORME E INCASTRI',
      value: `${shapesFound}/${GAME_SHAPES.length}`,
      sub: `${payload.incastriCompleted} tavole completate`,
      stripe: [2, 132, 199] as [number, number, number],
    },
  ];

  const cardW = 59;
  const cardGap = 6;
  const startX = (pageW - (cardW * 4 + cardGap * 3)) / 2;
  const cardY = 105;
  const cardH = 29;

  cards.forEach((c, i) => {
    const x = startX + i * (cardW + cardGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, cardY, cardW, cardH, 2.5, 2.5, 'FD');

    doc.setFillColor(...c.stripe);
    doc.rect(x + 0.5, cardY + 0.5, cardW - 1, 2.4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(c.label, x + cardW / 2, cardY + 8.5, { align: 'center' });

    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42);
    doc.text(c.value, x + cardW / 2, cardY + 18.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(c.sub, x + cardW / 2, cardY + 25, { align: 'center' });
  });

  // Medals Status Strip
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(startX, 139, cardW * 4 + cardGap * 3, 10.5, 2.5, 2.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 83, 45);
  const medalsText =
    unlockedMedals.length > 0
      ? `Medaglie di Natale ottenute: ${unlockedMedals.map((m) => m.name).join(' · ')}`
      : 'Medaglie di Natale: raggiungi almeno 3 stelle per sbloccare il Fiocco di Neve!';
  doc.text(medalsText, pageW / 2, 145.6, { align: 'center' });

  // Footer with real Elfa Stella PNG + Signature + Rosette Seal
  const stellaDataUrl = await loadImageAsDataUrl('/assets/elves/stella.png');
  if (stellaDataUrl) {
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.7);
    doc.roundedRect(22, 156, 28, 28, 2.5, 2.5, 'S');
    doc.addImage(stellaDataUrl, 'PNG', 22.5, 156.5, 27, 27);
  } else {
    drawElfaStellaPortrait(doc, 22, 156, 28);
  }

  const dateFormatted = new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 83, 45);
  doc.text("Rilasciato ufficialmente dall'Elfa Stella", 55, 165);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Iniziativa Xmas Lab · In data ${dateFormatted}`, 55, 171);
  doc.text(
    'Elfi Equipers - EFT Calabria (istruzione.calabria.it/EFT)',
    55,
    177,
  );

  // Signature line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.45);
  doc.line(156, 178, 228, 178);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const sigLabel = payload.teacherName?.trim()
    ? `Firma dell'Elfa Stella e di ${payload.teacherName.trim()}`
    : "Firma dell'Elfa Stella e dell'Insegnante";
  doc.text(sigLabel, 192, 183, { align: 'center' });

  // Gold Rosette Seal with Red Ribbons (Bottom-Right)
  const sealX = 256;
  const sealY = 169;
  doc.setFillColor(220, 38, 38);
  doc.triangle(sealX - 7, sealY + 6, sealX - 13, sealY + 23, sealX - 2, sealY + 18, 'F');
  doc.triangle(sealX + 7, sealY + 6, sealX + 13, sealY + 23, sealX + 2, sealY + 18, 'F');

  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1.2);
  doc.circle(sealX, sealY, 14, 'FD');
  doc.setLineWidth(0.4);
  doc.circle(sealX, sealY, 11.5, 'S');
  drawStar(doc, sealX, sealY - 3, 5, 2.2, [250, 204, 21], [161, 98, 7]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text(`${payload.totalStars} STELLE`, sealX, sealY + 7.5, { align: 'center' });

  // Holly leaves in bottom corners
  const drawHolly = (hx: number, hy: number) => {
    doc.setFillColor(21, 128, 61);
    doc.ellipse(hx - 3, hy, 4.5, 2.2, 'F');
    doc.ellipse(hx + 3, hy, 4.5, 2.2, 'F');
    doc.setFillColor(220, 38, 38);
    doc.circle(hx, hy + 1.5, 1.8, 'F');
  };
  drawHolly(17, pageH - 15);
  drawHolly(pageW - 17, pageH - 15);

  const safeSlug = cleanName
    ? cleanName.toLowerCase().replace(/[^a-z0-9]+/gi, '_')
    : 'elfo_geometra';
  doc.save(`Certificato_${safeSlug}.pdf`);
}
