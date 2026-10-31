import React, { useState, useEffect } from 'react';
import { AgendaItem, AgendaStatus, Department } from '../types/kpi';
import { autoCapitalizeText } from '../utils/textUtils';
import { X, Save, Calendar, Clock, MapPin, User, FileText } from 'lucide-react';

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agenda: Omit<AgendaItem, 'id' | 'createdAt'>, editingId?: string) => void;
  editingAgenda?: AgendaItem | null;
  defaultDepartment?: Department | 'Semua';
  defaultDate?: string;
}

export const AgendaModal: React.FC<AgendaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAgenda,
  defaultDepartment = 'Humas',
  defaultDate,
}) => {
  const today = new Date().toISOString().substring(0, 10);

  const [jenisJadwal, setJenisJadwal] = useState<'1hari' | 'rentang'>('1hari');
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState(today);
  const [tanggalSelesaiAgenda, setTanggalSelesaiAgenda] = useState('');
  const [waktuMulai, setWaktuMulai] = useState('09:00');
  const [waktuSelesai, setWaktuSelesai] = useState('11:00');
  const [lokasi, setLokasi] = useState('');
  const [bidang, setBidang] = useState<Department | 'Semua'>('Humas');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [status, setStatus] = useState<AgendaStatus>('Mendatang');

  useEffect(() => {
    if (editingAgenda) {
      const isRange =
        editingAgenda.jenisJadwal === 'rentang' ||
        (!!editingAgenda.tanggalSelesaiAgenda && editingAgenda.tanggalSelesaiAgenda !== editingAgenda.tanggal);
      setJenisJadwal(isRange ? 'rentang' : '1hari');
      setJudul(autoCapitalizeText(editingAgenda.judul));
      setTanggal(editingAgenda.tanggal || today);
      setTanggalSelesaiAgenda(editingAgenda.tanggalSelesaiAgenda || editingAgenda.tanggal || '');
      setWaktuMulai(editingAgenda.waktuMulai || '09:00');
      setWaktuSelesai(editingAgenda.waktuSelesai || '11:00');
      setLokasi(autoCapitalizeText(editingAgenda.lokasi || ''));
      setBidang(editingAgenda.bidang);
      setPenanggungJawab(autoCapitalizeText(editingAgenda.penanggungJawab || ''));
      setKeterangan(autoCapitalizeText(editingAgenda.keterangan || ''));
      setStatus(editingAgenda.status);
    } else {
      setJenisJadwal('1hari');
      setJudul('');
      setTanggal(defaultDate || today);
      setTanggalSelesaiAgenda('');
      setWaktuMulai('09:00');
      setWaktuSelesai('11:00');
      setLokasi('');
      setBidang(defaultDepartment);
      setPenanggungJawab('');
      setKeterangan('');
      setStatus('Mendatang');
    }
  }, [editingAgenda, isOpen, defaultDepartment, defaultDate, today]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) return;

    const endDate = jenisJadwal === 'rentang' ? (tanggalSelesaiAgenda || tanggal) : undefined;

    onSave(
      {
        judul: autoCapitalizeText(judul.trim()),
        jenisJadwal,
        tanggal,
        tanggalSelesaiAgenda: endDate,
        waktuMulai: waktuMulai.trim(),
        waktuSelesai: waktuSelesai.trim(),
        lokasi: autoCapitalizeText(lokasi.trim()),
        bidang,
        penanggungJawab: autoCapitalizeText(penanggungJawab.trim()),
        keterangan: autoCapitalizeText(keterangan.trim()),
        status,
      },
      editingAgenda?.id
    );

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 cursor-default max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#1b4332] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-300" />
            <h3 className="text-base font-bold">
              {editingAgenda ? 'Edit Agenda Kegiatan' : 'Tambah Agenda Kegiatan Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs text-slate-700 overflow-y-auto flex-1">
          {/* Judul Agenda */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1">
              Judul Agenda <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Rapat Koordinasi Tim Humas & IT"
              value={judul}
              onChange={(e) => setJudul(autoCapitalizeText(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Bidang & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Bidang
              </label>
              <select
                value={bidang}
                onChange={(e) => setBidang(e.target.value as Department | 'Semua')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Humas">HUMAS</option>
                <option value="IT">IT</option>
                <option value="Umum">UMUM</option>
                <option value="Semua">SEMUA</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AgendaStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Mendatang">Mendatang</option>
                <option value="Berlangsung">Berlangsung</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Tanggal & Waktu */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            {/* Pilihan Jenis Jadwal Agenda */}
            <div>
              <label className="block font-semibold text-slate-900 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>Jadwal Agenda <span className="text-rose-500">*</span></span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setJenisJadwal('1hari');
                    setTanggalSelesaiAgenda('');
                  }}
                  className={`py-1.5 px-3 rounded-lg font-bold text-xs transition-all ${
                    jenisJadwal === '1hari'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1 Hari
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJenisJadwal('rentang');
                    if (!tanggalSelesaiAgenda) {
                      setTanggalSelesaiAgenda(tanggal);
                    }
                  }}
                  className={`py-1.5 px-3 rounded-lg font-bold text-xs transition-all ${
                    jenisJadwal === 'rentang'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rentang Tanggal
                </button>
              </div>
            </div>

            {/* Inputs Tanggal */}
            {jenisJadwal === '1hari' ? (
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Tanggal Agenda
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => {
                      setTanggal(e.target.value);
                      if (tanggalSelesaiAgenda && e.target.value > tanggalSelesaiAgenda) {
                        setTanggalSelesaiAgenda(e.target.value);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    min={tanggal}
                    value={tanggalSelesaiAgenda || tanggal}
                    onChange={(e) => setTanggalSelesaiAgenda(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Mulai</span>
                </label>
                <input
                  type="time"
                  value={waktuMulai}
                  onChange={(e) => setWaktuMulai(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Selesai</span>
                </label>
                <input
                  type="time"
                  value={waktuSelesai}
                  onChange={(e) => setWaktuSelesai(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-600" />
              <span>Lokasi</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Ruang Rapat Rektorat / Zoom Meeting"
              value={lokasi}
              onChange={(e) => setLokasi(autoCapitalizeText(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Penanggung Jawab / PIC */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>Penanggung Jawab / PIC</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Ustadz Syahrul / Tim Broadcast"
              value={penanggungJawab}
              onChange={(e) => setPenanggungJawab(autoCapitalizeText(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Catatan</span>
            </label>
            <textarea
              rows={3}
              placeholder="Detail kegiatan, persiapan perangkat, atau instruksi khusus..."
              value={keterangan}
              onChange={(e) => setKeterangan(autoCapitalizeText(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>

          {/* Modal Footer */}
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
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Agenda</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
