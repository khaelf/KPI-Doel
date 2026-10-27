import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { WorkEntry, KpiIndicator, Department } from '../types/kpi';
import { calculateIndicatorAchievement, formatMonthLabel, getKpiStatusBadge } from './kpiCalculations';

export function exportToExcel(
  workEntries: WorkEntry[],
  kpiIndicators: KpiIndicator[],
  periodeBulan: string,
  selectedDepartment: 'Semua' | Department
) {
  const monthName = formatMonthLabel(periodeBulan);

  // Filter entries & indicators
  const filteredEntries = workEntries.filter((e) => {
    const entryDate = e.tanggalMasuk || e.tanggal || '';
    const isMonthMatch = entryDate.substring(0, 7) === periodeBulan;
    const isDeptMatch = selectedDepartment === 'Semua' || e.bidang === selectedDepartment;
    return isMonthMatch && isDeptMatch;
  });

  const filteredIndicators = kpiIndicators.filter((i) => {
    const isMonthMatch = i.periodeBulan === periodeBulan;
    const isDeptMatch = selectedDepartment === 'Semua' || i.bidang === selectedDepartment;
    return isMonthMatch && isDeptMatch;
  });

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Indicators
  const indicatorRows = filteredIndicators.map((ind, idx) => {
    const calc = calculateIndicatorAchievement(ind);
    return {
      No: idx + 1,
      Bidang: ind.bidang,
      'Nama Indikator KPI': ind.namaIndikator,
      Target: `${ind.target} ${ind.satuan}`,
      Realisasi: `${ind.realisasi} ${ind.satuan}`,
      'Bobot (%)': `${ind.bobot}%`,
      'Pencapaian (%)': `${calc.cappedPercentage.toFixed(1)}%`,
      'Nilai Terbobot (%)': `${calc.weightedScore.toFixed(2)}%`,
    };
  });

  const wsIndicators = XLSX.utils.json_to_sheet(indicatorRows);
  XLSX.utils.book_append_sheet(wb, wsIndicators, 'KPI Bulanan');

  // Sheet 2: Work Logs
  const workRows = filteredEntries.map((entry, idx) => ({
    No: idx + 1,
    'Tanggal Masuk': entry.tanggalMasuk || entry.tanggal || '-',
    'Tanggal Mulai': entry.tanggalMulai || '-',
    'Tanggal Selesai': entry.tanggalSelesai || 'Proses',
    'Jumlah Revisi': entry.jumlahRevisi || 0,
    Bidang: entry.bidang,
    'Nama Pekerjaan': entry.namaPekerjaan,
    'Target / Hasil Diharapkan': entry.targetHasil,
    Status: entry.status,
    'Pencapaian (%)': `${entry.persentase}%`,
    'Catatan / Dokumentasi': entry.catatan || '-',
  }));

  const wsWork = XLSX.utils.json_to_sheet(workRows);
  XLSX.utils.book_append_sheet(wb, wsWork, 'Catatan Pekerjaan');

  // Download XLSX file
  const fileName = `Laporan_KPI_Parabek_${selectedDepartment}_${periodeBulan}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportToPDF(
  workEntries: WorkEntry[],
  kpiIndicators: KpiIndicator[],
  periodeBulan: string,
  selectedDepartment: 'Semua' | Department
) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const monthName = formatMonthLabel(periodeBulan);

  // Deep green colors matching design theme
  const primaryColor: [number, number, number] = [27, 67, 50]; // #1b4332
  const secondaryColor: [number, number, number] = [45, 106, 79]; // #2d6a4f

  // 1. Header & Title Block
  doc.setFillColor(27, 67, 50);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PONDOK PESANTREN SUMATERA THAWALIB PARABEK', 105, 10, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('BAGIAN HUMAS DAN TEKNOLOGI INFORMASI (IT)', 105, 16, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Jl. Raya Bukittinggi - Payakumbuh Km. 3 Parabek, Agam, Sumatera Barat', 105, 21, { align: 'center' });

  // 2. Document Info
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`LAPORAN KINERJA PEKERJAAN & CAPAIAN KPI`, 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode  : ${monthName}`, 14, 44);
  doc.text(`Unit/Bidang : ${selectedDepartment === 'Semua' ? 'Humas & IT' : selectedDepartment}`, 14, 49);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 140, 44);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 53, 196, 53);

  let currentY = 58;

  // 3. KPI Indicators Section
  const filteredIndicators = kpiIndicators.filter((i) => {
    const isMonthMatch = i.periodeBulan === periodeBulan;
    const isDeptMatch = selectedDepartment === 'Semua' || i.bidang === selectedDepartment;
    return isMonthMatch && isDeptMatch;
  });

  if (filteredIndicators.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(27, 67, 50);
    doc.text('I. REKAPITULASI INDIKATOR KPI BULANAN', 14, currentY);

    currentY += 4;

    let totalScore = 0;
    const tableBody = filteredIndicators.map((ind, idx) => {
      const calc = calculateIndicatorAchievement(ind);
      totalScore += calc.weightedScore;
      return [
        (idx + 1).toString(),
        ind.bidang,
        ind.namaIndikator,
        `${ind.target} ${ind.satuan}`,
        `${ind.realisasi} ${ind.satuan}`,
        `${ind.bobot}%`,
        `${calc.cappedPercentage.toFixed(1)}%`,
        `${calc.weightedScore.toFixed(2)}%`,
      ];
    });

    const statusBadge = getKpiStatusBadge(totalScore);

    // Append summary row
    tableBody.push([
      '',
      '',
      'TOTAL NILAI KPI BULANAN',
      '',
      '',
      '100%',
      '',
      `${totalScore.toFixed(2)}% (${statusBadge.label})`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['No', 'Bidang', 'Indikator Performance', 'Target', 'Realisasi', 'Bobot', 'Pencapaian', 'Nilai Akhir']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 65 },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 15, halign: 'right' },
        6: { cellWidth: 18, halign: 'right' },
        7: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: function (data) {
        if (data.row.index === tableBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 253, 244];
        }
      },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // 4. Detailed Work Entries Section
  const filteredEntries = workEntries.filter((e) => {
    const entryDate = e.tanggalMasuk || e.tanggal || '';
    const isMonthMatch = entryDate.substring(0, 7) === periodeBulan;
    const isDeptMatch = selectedDepartment === 'Semua' || e.bidang === selectedDepartment;
    return isMonthMatch && isDeptMatch;
  });

  if (filteredEntries.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(27, 67, 50);
    doc.text('II. DAFTAR CATATAN PEKERJAAN HARIAN', 14, currentY);

    currentY += 4;

    const workTableBody = filteredEntries.map((e, idx) => [
      (idx + 1).toString(),
      e.tanggalMasuk || e.tanggal || '-',
      e.tanggalMulai || '-',
      e.tanggalSelesai || 'Proses',
      `${e.jumlahRevisi || 0}x`,
      e.bidang,
      e.namaPekerjaan,
      e.status,
      `${e.persentase}%`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['No', 'Tgl Masuk', 'Tgl Mulai', 'Tgl Selesai', 'Revisi', 'Bidang', 'Nama Pekerjaan', 'Status', 'Capaian']],
      body: workTableBody,
      theme: 'grid',
      headStyles: {
        fillColor: secondaryColor,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 19 },
        2: { cellWidth: 19 },
        3: { cellWidth: 19 },
        4: { cellWidth: 14, halign: 'center' },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 50 },
        7: { cellWidth: 22, halign: 'center' },
        8: { cellWidth: 16, halign: 'right' },
      },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 15;
  }

  // 5. Signature / Endorsement Block
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  doc.text('Parabek, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 140, currentY);
  currentY += 6;

  doc.text('Mengetahui,', 20, currentY);
  doc.text('Dibuat oleh,', 140, currentY);

  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Kepala Bagian / Pimpinan Pesantren', 20, currentY);
  doc.text('Penanggung Jawab Humas & IT', 140, currentY);

  currentY += 22;
  doc.text('( _________________________ )', 20, currentY);
  doc.text('( _________________________ )', 140, currentY);

  // Save PDF
  doc.save(`Laporan_KPI_Parabek_${selectedDepartment}_${periodeBulan}.pdf`);
}
