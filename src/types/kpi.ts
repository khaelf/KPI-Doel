export type Department = 'Humas' | 'IT';

export type TaskStatus = 'Belum dikerjakan' | 'Proses' | 'Selesai';

export interface WorkEntry {
  id: string;
  tanggalMasuk: string; // YYYY-MM-DD (Tanggal Permintaan/Masuk)
  tanggalMulai?: string; // YYYY-MM-DD (Tanggal Pengerjaan Dimulai)
  tanggalSelesai?: string; // YYYY-MM-DD (Tanggal Selesai)
  jumlahRevisi?: number; // Jumlah revisi (0, 1, 2, dst)
  tanggal?: string; // Fallback helper YYYY-MM-DD
  bidang: Department;
  namaPekerjaan: string;
  indikatorKpi?: string; // Indikator KPI terkait dari KPI bulanan
  targetHasil?: string; // Removed field, optional for backwards compatibility
  status: TaskStatus;
  persentase: number; // 0 - 100
  catatan?: string;
  createdAt: string;
}

export interface KpiIndicator {
  id: string;
  bidang: Department;
  namaIndikator: string;
  satuan: string; // e.g., 'Berita', 'Konten', 'Kegiatan', 'Laporan', '%', 'Perangkat'
  target: number;
  realisasi: number;
  bobot: number; // percentage, sum should be 100% per department
  periodeBulan: string; // YYYY-MM
}

export interface DepartmentSummary {
  bidang: Department;
  totalPekerjaan: number;
  pekerjaanSelesai: number;
  pekerjaanProses: number;
  pekerjaanBelum: number;
  nilaiKpi: number; // overall weighted % (0 - 100)
  totalBobot: number;
}
