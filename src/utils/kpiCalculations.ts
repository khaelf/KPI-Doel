import { KpiIndicator, WorkEntry, Department, DepartmentSummary } from '../types/kpi';

export function calculateIndicatorAchievement(indicator: KpiIndicator): {
  rawPercentage: number;
  cappedPercentage: number;
  weightedScore: number;
} {
  const target = Math.max(0.0001, indicator.target); // prevent divide by zero
  const realisasi = Math.max(0, indicator.realisasi);
  const rawPercentage = (realisasi / target) * 100;
  const cappedPercentage = Math.min(100, rawPercentage);

  return {
    rawPercentage,
    cappedPercentage,
    weightedScore: cappedPercentage,
  };
}

/**
 * Determines whether a work entry belongs to or carries over to the selected month.
 * Rule: "semua pekerjaan yang belum selesai maka berlanjut ke bulan selanjutnya"
 * - If status !== 'Selesai': it started on or before selectedMonth (startMonth <= selectedMonth),
 *   so it continues to every month until it is finished!
 * - If status === 'Selesai': it belongs to the month it was finished in (finishMonth === selectedMonth),
 *   or if no finish date recorded, started in selectedMonth (startMonth === selectedMonth).
 */
export function isWorkEntryInMonth(entry: WorkEntry, selectedMonth: string): boolean {
  if (!selectedMonth) return true;

  const startMonth = (entry.tanggalMulai || entry.tanggalMasuk || entry.tanggal || '').substring(0, 7);
  const finishMonth = entry.tanggalSelesai ? entry.tanggalSelesai.substring(0, 7) : '';

  // Cannot appear before it was started/created
  if (startMonth && startMonth > selectedMonth) {
    return false;
  }

  // If not completed yet: carries over to all months on or after startMonth
  if (entry.status !== 'Selesai') {
    return true;
  }

  // If completed:
  // Appears in the month it was completed (finishMonth === selectedMonth)
  // Or if started in this month
  if (finishMonth) {
    return finishMonth === selectedMonth || startMonth === selectedMonth;
  }

  return startMonth === selectedMonth;
}

export function calculateDepartmentSummary(
  bidang: Department,
  indicators: KpiIndicator[],
  workEntries: WorkEntry[],
  periodeBulan: string
): DepartmentSummary {
  const deptIndicators = indicators.filter(
    (ind) => ind.bidang === bidang && ind.periodeBulan === periodeBulan
  );

  const deptEntries = workEntries.filter((entry) => {
    return entry.bidang === bidang && isWorkEntryInMonth(entry, periodeBulan);
  });

  const totalPekerjaan = deptEntries.length;
  const pekerjaanSelesai = deptEntries.filter((e) => e.status === 'Selesai').length;
  const pekerjaanProses = deptEntries.filter((e) => e.status === 'Proses').length;
  const pekerjaanBelum = deptEntries.filter((e) => e.status === 'Belum dikerjakan').length;

  let nilaiKpi = 0;
  if (deptIndicators.length > 0) {
    const totalAch = deptIndicators.reduce((acc, ind) => {
      return acc + calculateIndicatorAchievement(ind).cappedPercentage;
    }, 0);
    nilaiKpi = totalAch / deptIndicators.length;
  } else if (totalPekerjaan > 0) {
    nilaiKpi = (pekerjaanSelesai / totalPekerjaan) * 100;
  }

  return {
    bidang,
    totalPekerjaan,
    pekerjaanSelesai,
    pekerjaanProses,
    pekerjaanBelum,
    nilaiKpi: Number(nilaiKpi.toFixed(2)),
    totalBobot: 100,
  };
}

export function formatMonthLabel(monthString: string): string {
  if (!monthString) return '';
  const [year, month] = monthString.split('-');
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${months[mIndex] || month} ${year}`;
}

export function getKpiStatusBadge(score: number): {
  label: string;
  bgClass: string;
  textClass: string;
  badgeClass: string;
} {
  if (score >= 90) {
    return {
      label: 'SANGAT BAIK',
      bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      textClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-600 text-white',
    };
  } else if (score >= 75) {
    return {
      label: 'BAIK',
      bgClass: 'bg-green-50 text-green-700 border-green-200',
      textClass: 'text-green-700',
      badgeClass: 'bg-green-600 text-white',
    };
  } else if (score >= 60) {
    return {
      label: 'CUKUP',
      bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
      textClass: 'text-amber-700',
      badgeClass: 'bg-amber-500 text-white',
    };
  } else {
    return {
      label: 'PERLU EVALUASI',
      bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
      textClass: 'text-rose-700',
      badgeClass: 'bg-rose-600 text-white',
    };
  }
}
