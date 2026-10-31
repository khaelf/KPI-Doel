import React, { useState, useEffect } from 'react';
import { WorkEntry, KpiIndicator, Department, TaskStatus } from '../types/kpi';
import { autoCapitalizeText } from '../utils/textUtils';
import { X, Save, Calendar, Target, Clock, MapPin, Palette, Link, Bell } from 'lucide-react';

interface WorkEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<WorkEntry, 'id' | 'createdAt'>, editingId?: string) => void;
  editingEntry?: WorkEntry | null;
  defaultDepartment?: Department;
  defaultMonth?: string;
  kpiIndicators?: KpiIndicator[];
}

export const WorkEntryModal: React.FC<WorkEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  defaultDepartment = 'Humas',
  defaultMonth,
  kpiIndicators = [],
}) => {
  const [tanggalMasuk, setTanggalMasuk] = useState('');
  const [tanggalAcara, setTanggalAcara] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [jamDeadline, setJamDeadline] = useState('17:00');
  const [opsiPengingat, setOpsiPengingat] = useState('1 hari sebelumnya');
  const [spesifikasiFormat, setSpesifikasiFormat] = useState('');
  const [linkMasterFile, setLinkMasterFile] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [jumlahRevisi, setJumlahRevisi] = useState<number>(0);
  const [bidang, setBidang] = useState<Department>('Humas');
  const [namaPekerjaan, setNamaPekerjaan] = useState('');
  const [indikatorKpi, setIndikatorKpi] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Proses');
  const [persentase, setPersentase] = useState<number>(50);
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    if (editingEntry) {
      setTanggalMasuk(editingEntry.tanggalMasuk || editingEntry.tanggal || today);
      setTanggalAcara(editingEntry.tanggalAcara || '');
      setTanggalMulai(editingEntry.tanggalMulai || editingEntry.tanggal || today);
      setTanggalSelesai(editingEntry.tanggalSelesai || '');
      setJamMulai(editingEntry.jamMulai || '');
      setJamSelesai(editingEntry.jamSelesai || '');
      setJamDeadline(editingEntry.jamDeadline || '17:00');
      setOpsiPengingat(editingEntry.opsiPengingat || '1 hari sebelumnya');
      setSpesifikasiFormat(editingEntry.spesifikasiFormat || '');
      setLinkMasterFile(editingEntry.linkMasterFile || '');
      setLokasi(autoCapitalizeText(editingEntry.lokasi || ''));
      setJumlahRevisi(editingEntry.jumlahRevisi ?? 0);
      setBidang(editingEntry.bidang);
      setNamaPekerjaan(autoCapitalizeText(editingEntry.namaPekerjaan));
      setIndikatorKpi(editingEntry.indikatorKpi || '');
      setStatus(editingEntry.status);
      setPersentase(editingEntry.persentase);
      setCatatan(editingEntry.catatan || '');
    } else {
      setTanggalMasuk(today);
      setTanggalAcara('');
      setTanggalMulai(today);
      setTanggalSelesai('');
      setJamMulai('');
      setJamSelesai('');
      setJamDeadline('17:00');
      setOpsiPengingat('1 hari sebelumnya');
      setSpesifikasiFormat('');
      setLinkMasterFile('');
      setLokasi('');
      setJumlahRevisi(0);
      setBidang(defaultDepartment);
      setNamaPekerjaan('');
      setIndikatorKpi('');
      setStatus('Proses');
      setPersentase(50);
      setCatatan('');
    }
  }, [editingEntry, isOpen, defaultDepartment]);

  if (!isOpen) return null;

  // Distinct KPI indicators for the selected department (Rule: indikator KPI disamakan setiap bulan)
  const departmentIndicators = Array.from(
    new Map(
      kpiIndicators
        .filter((ind) => ind.bidang === bidang)
        .map((ind) => [ind.namaIndikator.trim().toLowerCase(), ind])
    ).values()
  );

  const calculateDurationText = () => {
    if (!tanggalMulai || !tanggalSelesai) return 'Durasi: 0 menit';
    const startStr = `${tanggalMulai}T${jamMulai || '00:00'}:00`;
    const endStr = `${tanggalSelesai}T${jamSelesai || '00:00'}:00`;
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    if (isNaN(start) || isNaN(end) || end < start) return 'Durasi: 0 menit';
    const diffMinutes = Math.round((end - start) / (1000 * 60));
    if (diffMinutes < 60) return `Durasi: ${diffMinutes} menit`;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours < 24) {
      return `Durasi: ${hours} jam ${mins > 0 ? `${mins} menit` : ''}`;
    }
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `Durasi: ${days} hari ${remHours > 0 ? `${remHours} jam` : ''}`;
  };

  const isDesainGrafis = indikatorKpi.trim().toLowerCase() === 'desain grafis';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPekerjaan.trim()) return;

    onSave(
      {
        tanggalMasuk,
        tanggalAcara: tanggalAcara.trim() ? tanggalAcara.trim() : '',
        tanggalMulai: tanggalMulai || tanggalMasuk,
        tanggalSelesai: tanggalSelesai.trim() ? tanggalSelesai.trim() : '',
        jamMulai: jamMulai.trim(),
        jamSelesai: jamSelesai.trim(),
        jamDeadline: jamDeadline.trim(),
        opsiPengingat: opsiPengingat.trim(),
        spesifikasiFormat: spesifikasiFormat.trim(),
        linkMasterFile: linkMasterFile.trim(),
        durasiPengerjaan: calculateDurationText(),
        lokasi: autoCapitalizeText(lokasi.trim()),
        jumlahRevisi: Number(jumlahRevisi) || 0,
        tanggal: tanggalMasuk, // fallback for month filters
        bidang,
        namaPekerjaan: autoCapitalizeText(namaPekerjaan.trim()),
        indikatorKpi: indikatorKpi.trim(),
        status,
        persentase: Number(persentase),
        catatan: catatan.trim(),
      },
      editingEntry?.id
    );

    onClose();
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    const today = new Date().toISOString().substring(0, 10);
    if (newStatus === 'Selesai') {
      setPersentase(100);
      if (!tanggalSelesai) setTanggalSelesai(today);
    } else if (newStatus === 'Belum dikerjakan') {
      setPersentase(0);
      setTanggalSelesai('');
    } else if (persentase === 100 || persentase === 0) {
      setPersentase(50);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-xl w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 cursor-default"
      >
        {/* Modal Header */}
        <div className="bg-[#1b4332] text-white p-5 flex items-center justify-between">
          <h3 className="text-base font-bold">
            {editingEntry ? 'Edit Catatan Pekerjaan' : 'Tambah Catatan Pekerjaan Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700 max-h-[85vh] overflow-y-auto">
          {/* Bidang */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1">
              Bidang / Dept <span className="text-rose-500">*</span>
            </label>
            <select
              value={bidang}
              onChange={(e) => setBidang(e.target.value as Department)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Humas">HUMAS</option>
              <option value="IT">IT</option>
              <option value="Umum">UMUM</option>
            </select>
          </div>

          {/* Nama Pekerjaan */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1">
              Nama Pekerjaan / Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoCapitalize="sentences"
              placeholder="Contoh: Pembuatan Banner Publikasi Milad Parabek"
              value={namaPekerjaan}
              onChange={(e) => setNamaPekerjaan(autoCapitalizeText(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Indikator KPI */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-700" />
                <span>Indikator KPI Terkait <span className="text-slate-400 font-normal">(Opsional)</span></span>
              </span>
              <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                KPI Bulanan
              </span>
            </label>
            <select
              value={indikatorKpi}
              onChange={(e) => setIndikatorKpi(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="">-- Tanpa Indikator KPI --</option>
              {departmentIndicators.map((ind) => (
                <option key={ind.namaIndikator} value={ind.namaIndikator}>
                  {ind.namaIndikator}
                </option>
              ))}
            </select>
            {departmentIndicators.length === 0 && (
              <p className="text-[11px] text-slate-400 mt-1 italic">
                Belum ada Indikator KPI terdaftar untuk bidang {bidang}.
              </p>
            )}
          </div>

          {/* FORM VIEW: IF DESAIN GRAFIS SELECTED -> GAMBAR 3 LAYOUT + STATUS */}
          {isDesainGrafis ? (
            <div className="space-y-4">
              {/* PENCATATAN WAKTU & DURASI PENGERJAAN */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3.5">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 tracking-wide uppercase">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>Pencatatan Waktu & Durasi Pengerjaan</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-2xs font-mono">
                    {calculateDurationText()}
                  </span>
                </div>

                {/* Row 1: Tanggal Permintaan, Mulai Pengerjaan, Selesai Pengerjaan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Tanggal Permintaan */}
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Tanggal Permintaan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={tanggalMasuk}
                      onChange={(e) => setTanggalMasuk(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>

                  {/* Mulai Pengerjaan */}
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Mulai Pengerjaan
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="date"
                        value={tanggalMulai}
                        onChange={(e) => setTanggalMulai(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-slate-900 text-[11px] font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      />
                      <input
                        type="time"
                        value={jamMulai}
                        onChange={(e) => setJamMulai(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-slate-900 text-[11px] font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  {/* Selesai Pengerjaan (Opsional awal) */}
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Selesai Pengerjaan <span className="text-slate-400 font-normal">(Opsional awal)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="date"
                        value={tanggalSelesai}
                        onChange={(e) => setTanggalSelesai(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-slate-900 text-[11px] font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      />
                      <input
                        type="time"
                        value={jamSelesai}
                        onChange={(e) => setJamSelesai(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-slate-900 text-[11px] font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Spesifikasi / Ukuran Format & Link File Master */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Spesifikasi / Ukuran Format
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Banner 4x1 meter / Feed IG 1080x1350 / Brosur A4"
                      value={spesifikasiFormat}
                      onChange={(e) => setSpesifikasiFormat(autoCapitalizeText(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Link File Master / Cloud Storage
                    </label>
                    <input
                      type="text"
                      placeholder="Link Google Drive / Canva / Figma"
                      value={linkMasterFile}
                      onChange={(e) => setLinkMasterFile(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* BATAS WAKTU (DEADLINE) & PENGINGAT */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 tracking-wide uppercase border-b border-slate-200/70 pb-2">
                  <Calendar className="w-4 h-4 text-slate-700" />
                  <span>Batas Waktu (Deadline) & Pengingat</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Tanggal Batas Selesai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={tanggalAcara}
                      onChange={(e) => setTanggalAcara(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Jam Batas Selesai
                    </label>
                    <input
                      type="time"
                      value={jamDeadline}
                      onChange={(e) => setJamDeadline(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Opsi Pengingat Otomatis
                    </label>
                    <select
                      value={opsiPengingat}
                      onChange={(e) => setOpsiPengingat(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="1 hari sebelumnya">1 hari sebelumnya</option>
                      <option value="2 hari sebelumnya">2 hari sebelumnya</option>
                      <option value="3 jam sebelumnya">3 jam sebelumnya</option>
                      <option value="Pada hari H">Pada hari H</option>
                      <option value="Tidak ada">Tidak ada</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status Pekerjaan (Ditambahkan per Permintaan User) & Revisi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    Status Pekerjaan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Belum dikerjakan">Belum dikerjakan</option>
                    <option value="Proses">Proses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    Jumlah Revisi
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={jumlahRevisi}
                    onChange={(e) => setJumlahRevisi(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Catatan / Keterangan Tambahan */}
              <div>
                <label className="block font-semibold text-slate-900 mb-1">
                  Catatan / Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan koordinasi, kebutuhan alat, instruksi khusus..."
                  value={catatan}
                  onChange={(e) => setCatatan(autoCapitalizeText(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>
            </div>
          ) : (
            /* TAMPILAN STANDAR (Indikator Lain / Tanpa Indikator) */
            <>
              {/* Group: Tanggal Masuk, Tanggal Acara, Jadwal & Jam */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Jadwal, Tanggal Acara & Riwayat Revisi</span>
                </h4>

                {/* Row 1: Tanggal Masuk, Tanggal Acara, Jumlah Revisi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Tanggal Masuk */}
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Tanggal Masuk <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={tanggalMasuk}
                      onChange={(e) => setTanggalMasuk(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>

                  {/* Tanggal Acara */}
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1 flex items-center justify-between">
                      <span>Tanggal Acara</span>
                      <span className="text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                        Deadline
                      </span>
                    </label>
                    <input
                      type="date"
                      value={tanggalAcara}
                      onChange={(e) => setTanggalAcara(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>

                  {/* Jumlah Revisi */}
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Jumlah Revisi
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={jumlahRevisi}
                      onChange={(e) => setJumlahRevisi(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Row 2: Jadwal */}
                <div className="pt-2 border-t border-slate-200/70">
                  <label className="block font-semibold text-slate-900 mb-1.5">
                    Jadwal
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300">
                      <span className="text-[11px] font-medium text-slate-500 shrink-0">Dari:</span>
                      <input
                        type="date"
                        required
                        value={tanggalMulai}
                        onChange={(e) => setTanggalMulai(e.target.value)}
                        className="w-full text-slate-900 font-medium focus:outline-none bg-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300">
                      <span className="text-[11px] font-medium text-slate-500 shrink-0">Sampai:</span>
                      <input
                        type="date"
                        value={tanggalSelesai}
                        onChange={(e) => setTanggalSelesai(e.target.value)}
                        className="w-full text-slate-900 font-medium focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Jam */}
                <div className="pt-2 border-t border-slate-200/70">
                  <label className="block font-semibold text-slate-900 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span>Jam</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300">
                      <span className="text-[11px] font-medium text-slate-500 shrink-0">Dari:</span>
                      <input
                        type="time"
                        value={jamMulai}
                        onChange={(e) => setJamMulai(e.target.value)}
                        className="w-full text-slate-900 font-medium focus:outline-none bg-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300">
                      <span className="text-[11px] font-medium text-slate-500 shrink-0">Sampai:</span>
                      <input
                        type="time"
                        value={jamSelesai}
                        onChange={(e) => setJamSelesai(e.target.value)}
                        className="w-full text-slate-900 font-medium focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lokasi Pekerjaan */}
              <div>
                <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  <span>Lokasi Pekerjaan</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kantor Humas / Ruang IT / Lab Komputer"
                  value={lokasi}
                  onChange={(e) => setLokasi(autoCapitalizeText(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Status & Persentase */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Status Pekerjaan</label>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Belum dikerjakan">Belum dikerjakan</option>
                    <option value="Proses">Proses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    Nilai Pencapaian (%): <span className="font-mono text-emerald-700 font-bold">{persentase}%</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={persentase}
                    onChange={(e) => setPersentase(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Slider */}
              <div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={persentase}
                  onChange={(e) => setPersentase(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="block font-semibold text-slate-900 mb-1">
                  Catatan
                </label>
                <input
                  type="text"
                  autoCapitalize="sentences"
                  placeholder="https://drive.google.com/... atau catatan kendala"
                  value={catatan}
                  onChange={(e) => setCatatan(autoCapitalizeText(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pekerjaan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
