/**
 * Hijri Date Utilities for Pesantren Sumatera Thawalib Parabek
 * Uses Intl.DateTimeFormat with numeric parts (en-u-ca-islamic-umalqura)
 * mapped directly to Indonesian Islamic month names, with a deterministic
 * Kuwaiti/tabular Hijri fallback so Gregorian month names never leak through.
 */

export interface HijriDateParts {
  day: number;
  dayStr: string;
  monthNumber: number;
  monthName: string;
  monthShort: string;
  year: string;
  yearNum: number;
  full: string;
  short: string;
  isFirstDayOfMonth: boolean;
}

const HIJRI_MONTHS_FULL = [
  'Muharram',
  'Safar',
  'Rabiul Awwal',
  'Rabiul Akhir',
  'Jumadil Ula',
  'Jumadil Akhir',
  'Rajab',
  "Sya'ban",
  'Ramadhan',
  'Syawal',
  "Dzulqa'dah",
  'Dzulhijjah',
];

const HIJRI_MONTHS_SHORT = [
  'Muh.',
  'Safar',
  'Rab. Awal',
  'Rab. Akhir',
  'Jum. Awal',
  'Jum. Akhir',
  'Rajab',
  "Sya'ban",
  'Ram.',
  'Syawal',
  "Dzulqa'dah",
  'Dzulhijjah',
];

/**
 * Deterministic Gregorian -> Hijri (Kuwaiti/Tabular Islamic calendar) conversion
 * used as fallback if browser ICU lacks islamic-umalqura support.
 */
function gregorianToHijriTabular(date: Date): { day: number; month: number; year: number } {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524;

  const iyear = 10631 / 30;
  const epochastro = 1948084;
  const shift1 = 8.01 / 60;

  let z = jd - epochastro;
  const cyc = Math.floor(z / 10631);
  z = z - 10631 * cyc;
  const j = Math.floor((z - shift1) / iyear);
  const iy = 30 * cyc + j;
  z = z - Math.floor(j * iyear + shift1);
  let im = Math.floor((z + 28.5001) / 29.5);
  if (im === 13) im = 12;
  const id = z - Math.floor(29.5001 * im - 29);

  return {
    day: Math.max(1, Math.min(30, Math.round(id))),
    month: Math.max(1, Math.min(12, im)),
    year: iy,
  };
}

/**
 * Creates a JS Date at local noon from YYYY-MM-DD string, applying optional day offset
 */
function parseDateWithOffset(dateStr: string | Date, adjustmentDays: number = 0): Date {
  let date: Date;
  if (typeof dateStr === 'string') {
    const parts = dateStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    date = new Date(y, m, d, 12, 0, 0);
  } else {
    date = new Date(dateStr.getTime());
    date.setHours(12, 0, 0, 0);
  }

  if (adjustmentDays !== 0) {
    date.setDate(date.getDate() + adjustmentDays);
  }

  return date;
}

function resolveNumericHijriParts(date: Date): { day: number; month: number; year: number } {
  const locales = ['en-u-ca-islamic-umalqura', 'id-ID-u-ca-islamic-umalqura'];

  for (const locale of locales) {
    try {
      const fmt = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
      const cal = fmt.resolvedOptions().calendar || '';
      if (!cal.startsWith('islamic')) continue;

      const parts = fmt.formatToParts(date);
      const dayVal = parts.find((p) => p.type === 'day')?.value || '';
      const monthVal = parts.find((p) => p.type === 'month')?.value || '';
      const yearVal = parts.find((p) => p.type === 'year')?.value || '';

      const day = parseInt(dayVal.replace(/\D/g, ''), 10);
      const month = parseInt(monthVal.replace(/\D/g, ''), 10);
      const year = parseInt(yearVal.replace(/\D/g, ''), 10);

      if (
        day >= 1 &&
        day <= 30 &&
        month >= 1 &&
        month <= 12 &&
        year >= 1200 &&
        year <= 1700
      ) {
        return { day, month, year };
      }
    } catch {
      // Try next locale / fallback
    }
  }

  return gregorianToHijriTabular(date);
}

/**
 * Get detailed Hijri date parts for any Gregorian date
 */
export function getHijriDateParts(
  dateStr: string | Date,
  adjustmentDays: number = 0
): HijriDateParts {
  const date = parseDateWithOffset(dateStr, adjustmentDays);
  const { day, month, year } = resolveNumericHijriParts(date);

  const monthIdx = Math.max(0, Math.min(11, month - 1));
  const monthName = HIJRI_MONTHS_FULL[monthIdx];
  const monthShort = HIJRI_MONTHS_SHORT[monthIdx];
  const yearLabel = `${year} H`;

  return {
    day,
    dayStr: String(day),
    monthNumber: month,
    monthName,
    monthShort,
    year: yearLabel,
    yearNum: year,
    full: `${day} ${monthName} ${yearLabel}`,
    short: `${day} ${monthShort}`,
    isFirstDayOfMonth: day === 1,
  };
}

/**
 * Returns full Hijri date string, e.g. "2 Jumadil Akhir 1448 H"
 */
export function getHijriDateFull(dateStr: string | Date, adjustmentDays: number = 0): string {
  return getHijriDateParts(dateStr, adjustmentDays).full;
}

/**
 * Returns the Hijri months covered in a Gregorian month (e.g. "Jumadil Ula – Jumadil Akhir 1448 H")
 */
export function getHijriMonthRange(yearMonth: string, adjustmentDays: number = 0): string {
  try {
    const [yStr, mStr] = yearMonth.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);

    const firstDate = new Date(y, m - 1, 1, 12, 0, 0);
    const lastDate = new Date(y, m, 0, 12, 0, 0);

    const p1 = getHijriDateParts(firstDate, adjustmentDays);
    const p2 = getHijriDateParts(lastDate, adjustmentDays);

    if (p1.monthName === p2.monthName && p1.year === p2.year) {
      return `${p1.monthName} ${p1.year}`;
    }
    if (p1.year === p2.year) {
      return `${p1.monthName} – ${p2.monthName} ${p1.year}`;
    }
    return `${p1.monthName} ${p1.year} – ${p2.monthName} ${p2.year}`;
  } catch {
    return 'Tahun Hijriah';
  }
}

/**
 * Formats a Gregorian date alongside its Hijri equivalent
 * Example: "Kamis, 12 November 2026 · 2 Jumadil Akhir 1448 H"
 */
export function formatDateIndoWithHijri(
  dateStr: string,
  gregorianFormatted: string,
  adjustmentDays: number = 0
): string {
  const hijri = getHijriDateFull(dateStr, adjustmentDays);
  return `${gregorianFormatted} · ${hijri}`;
}
