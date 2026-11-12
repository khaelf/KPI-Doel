/**
 * Hijri Date Utilities for Pesantren Sumatera Thawalib Parabek
 * Uses standard ECMAScript Internationalization API (Intl.DateTimeFormat)
 * with the Umm al-Qura Islamic calendar system (id-ID-u-ca-islamic-umalqura)
 * and supports an optional day-offset (penyesuaian hilal/ru'yah).
 */

export interface HijriDateParts {
  day: number;
  dayStr: string;
  monthName: string;
  monthShort: string;
  year: string;
  yearNum: number;
  full: string;
  short: string;
  isFirstDayOfMonth: boolean;
}

const MONTH_SHORT_MAP: Record<string, string> = {
  Muharram: 'Muh.',
  Safar: 'Safar',
  Rabiulawal: 'Rab. Awal',
  'Rabiʻ I': 'Rab. Awal',
  Rabiulakhir: 'Rab. Akhir',
  'Rabiʻ II': 'Rab. Akhir',
  Jumadilawal: 'Jum. Awal',
  'Jumada I': 'Jum. Awal',
  Jumadilakhir: 'Jum. Akhir',
  'Jumada II': 'Jum. Akhir',
  Rajab: 'Rajab',
  Syaban: "Sya'ban",
  "Sha'ban": "Sya'ban",
  Ramadan: 'Ramadan',
  Syawal: 'Syawal',
  Shawwal: 'Syawal',
  Zulkaidah: "Dzulqa'dah",
  "Dhuʻl-Qiʻdah": "Dzulqa'dah",
  Zulhijah: 'Dzulhijjah',
  "Dhuʻl-Hijjah": 'Dzulhijjah',
};

/**
 * Normalizes Islamic month names to standard Indonesian Pesantren spelling
 */
export function normalizeHijriMonthName(name: string): string {
  if (!name) return '';
  const clean = name.trim();
  if (MONTH_SHORT_MAP[clean]) {
    // If it's a known formal variant
    if (clean.includes('Jumadilawal') || clean.includes('Jumada I')) return 'Jumadil Ula';
    if (clean.includes('Jumadilakhir') || clean.includes('Jumada II')) return 'Jumadil Akhir';
    if (clean.includes('Rabiulawal') || clean.includes('Rabiʻ I')) return 'Rabiul Awwal';
    if (clean.includes('Rabiulakhir') || clean.includes('Rabiʻ II')) return 'Rabiul Akhir';
    if (clean.includes('Zulkaidah') || clean.includes('Dhuʻl-Qiʻdah')) return "Dzulqa'dah";
    if (clean.includes('Zulhijah') || clean.includes('Dhuʻl-Hijjah')) return 'Dzulhijjah';
    if (clean.includes('Syaban') || clean.includes("Sha'ban")) return "Sya'ban";
  }
  return clean;
}

/**
 * Short month label for calendar grid day cells (e.g., "1 Jum. Akhir")
 */
export function getShortHijriMonth(monthName: string): string {
  if (!monthName) return '';
  for (const [key, val] of Object.entries(MONTH_SHORT_MAP)) {
    if (monthName.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }
  return monthName.slice(0, 5);
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

/**
 * Get detailed Hijri date parts for any Gregorian date
 */
export function getHijriDateParts(dateStr: string | Date, adjustmentDays: number = 0): HijriDateParts {
  const date = parseDateWithOffset(dateStr, adjustmentDays);

  try {
    const fDay = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { day: 'numeric' });
    const fMonth = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { month: 'long' });
    const fYear = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { year: 'numeric' });

    const rawDay = fDay.format(date);
    const rawMonth = fMonth.format(date);
    const rawYear = fYear.format(date);

    const dayNum = parseInt(rawDay.replace(/\D/g, ''), 10) || 1;
    const yearNum = parseInt(rawYear.replace(/\D/g, ''), 10) || 1448;
    const monthName = normalizeHijriMonthName(rawMonth);
    const monthShort = getShortHijriMonth(rawMonth);

    const yearLabel = rawYear.includes('H') ? rawYear : `${yearNum} H`;
    const full = `${dayNum} ${monthName} ${yearLabel}`;
    const short = `${dayNum} ${monthShort}`;

    return {
      day: dayNum,
      dayStr: String(dayNum),
      monthName,
      monthShort,
      year: yearLabel,
      yearNum,
      full,
      short,
      isFirstDayOfMonth: dayNum === 1,
    };
  } catch {
    // Fallback if Intl.DateTimeFormat with islamic calendar fails
    return {
      day: 1,
      dayStr: '1',
      monthName: 'Hijriah',
      monthShort: 'H',
      year: '1448 H',
      yearNum: 1448,
      full: '1 Hijriah',
      short: '1 H',
      isFirstDayOfMonth: false,
    };
  }
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
