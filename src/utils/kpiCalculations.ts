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
  const weightedScore = (cappedPercentage * indicator.bobot) / 100;

  return {
    rawPercentage,
    cappedPercentage,
    weightedScore,
  };
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
    const entryDate = entry.tanggalMasuk || entry.tanggal || '';
    const entryMonth = entryDate.substring(0, 7);
    return entry.bidang === bidang && entryMonth === periodeBulan;
  });

  const totalPekerjaan = deptEntries.length;
  const pekerjaanSelesai = deptEntries.filter((e) => e.status === 'Selesai').length;
  const pekerjaanProses = deptEntries.filter((e) => e.status === 'Proses').length;
  const pekerjaanBelum = deptEntries.filter((e) => e.status === 'Belum dikerjakan').length;

  let totalBobot = 0;
  deptIndicators.forEach((ind) => {
    totalBobot += ind.bobot;
  });

  // Hitungan persentase diambil dari berapa banyak pekerjaan selesai dari total pekerjaan ditugaskan dalam bulan tersebut
  const nilaiKpi = totalPekerjaan > 0
    ? (pekerjaanSelesai / totalPekerjaan) * 100
    : 0;

  return {
    bidang,
    totalPekerjaan,
    pekerjaanSelesai,
    pekerjaanProses,
    pekerjaanBelum,
    nilaiKpi: Number(nilaiKpi.toFixed(2)),
    totalBobot: Number(totalBobot.toFixed(2)),
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
