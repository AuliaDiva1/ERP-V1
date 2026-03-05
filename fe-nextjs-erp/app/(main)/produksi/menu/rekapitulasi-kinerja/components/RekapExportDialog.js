"use client";

/**
 * RekapExportDialog — Export Rekapitulasi ke Excel / PDF
 *
 * Deps:
 *   npm install xlsx jspdf jspdf-autotable
 *
 * Props:
 *  - visible: boolean
 *  - onHide: () => void
 *  - detail: object | null
 *  - defaultMode: "excel" | "pdf"
 *  - allRekap: array
 *  - exportMode: "single" | "all"
 */

import { useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ProgressBar } from "primereact/progressbar";
import { Divider } from "primereact/divider";
import { RadioButton } from "primereact/radiobutton";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";

// ─── Helpers ─────────────────────────────────────────────────

const getScoreColor = (score) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
};

const getScoreLabel = (score) => {
  if (score >= 80) return "Sangat Baik";
  if (score >= 60) return "Baik";
  if (score >= 40) return "Cukup";
  return "Perlu Perbaikan";
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

const formatTime = (t) => (t ? String(t).substring(0, 5) : "-");
const isTruthy = (v) => v === 1 || v === true || v === "1";

// ─── Excel Export — single karyawan ──────────────────────────

const exportToExcel = (detail, options = {}) => {
  const { includeDaily = true, includeSummary = true, fileName = null } = options;
  const { karyawan, summary, periode, daily_data } = detail;

  const wb = XLSX.utils.book_new();

  if (includeSummary) {
    const summaryData = [
      ["REKAPITULASI KINERJA KARYAWAN"],
      [],
      ["Nama", karyawan?.NAMA ?? "-"],
      ["NIK", karyawan?.NIK ?? "-"],
      ["Departemen", karyawan?.DEPARTEMEN ?? "-"],
      ["Jabatan", karyawan?.JABATAN ?? "-"],
      ["Email", karyawan?.EMAIL ?? "-"],
      ["Shift", karyawan?.SHIFT ?? "-"],
      [],
      ["Periode Mulai", formatDate(periode?.start)],
      ["Periode Akhir", formatDate(periode?.end)],
      ["Total Hari", periode?.total_hari ?? 0],
      [],
      ["─── PRESENSI ───"],
      ["Total Hari Kerja", summary?.presensi?.total_hari_kerja ?? 0],
      ["Hadir", summary?.presensi?.hadir ?? 0],
      ["Alpa", summary?.presensi?.alpa ?? 0],
      ["Izin", summary?.presensi?.izin ?? 0],
      ["Sakit", summary?.presensi?.sakit ?? 0],
      ["Cuti", summary?.presensi?.cuti ?? 0],
      ["Dinas Luar", summary?.presensi?.dinas_luar ?? 0],
      ["Terlambat", summary?.presensi?.terlambat ?? 0],
      ["Pulang Awal", summary?.presensi?.pulang_awal ?? 0],
      ["Total Jam Kerja", `${summary?.presensi?.total_jam_kerja ?? 0} jam`],
      [],
      ["─── PRODUKTIVITAS ───"],
      ["Logbook Approved", summary?.produktivitas?.total_logbook_approved ?? 0],
      ["Total Output", `${summary?.produktivitas?.total_output ?? 0} unit`],
      ["Total Jam Produktif", `${summary?.produktivitas?.total_jam_produktif?.toFixed(1) ?? 0} jam`],
      ["Batch Dikerjakan", summary?.produktivitas?.batch_dikerjakan ?? 0],
      [],
      ["─── PERFORMANCE SCORE ───"],
      ["Score", summary?.performance_score ?? 0],
      ["Kategori", getScoreLabel(summary?.performance_score ?? 0)],
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws["!cols"] = [{ wch: 24 }, { wch: 36 }];
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
  }

  if (includeDaily && daily_data?.length > 0) {
    const headers = [
      "No", "Tanggal", "Hari", "Status Kehadiran",
      "Jam Masuk", "Jam Keluar", "Jam Kerja (jam)",
      "Terlambat", "Pulang Awal",
      "Jumlah Logbook", "Total Output (unit)", "Jam Produktif",
    ];

    const rows = daily_data.map((day, idx) => {
      const d = new Date(day.tanggal);
      return [
        idx + 1,
        d.toLocaleDateString("id-ID"),
        d.toLocaleDateString("id-ID", { weekday: "long" }),
        day.presensi?.STATUS ?? "-",
        formatTime(day.presensi?.JAM_MASUK),
        formatTime(day.presensi?.JAM_KELUAR),
        parseFloat((day.summary?.jam_kerja_presensi ?? 0).toFixed(2)),
        isTruthy(day.presensi?.IS_TERLAMBAT) ? "Ya" : "Tidak",
        isTruthy(day.presensi?.IS_PULANG_AWAL) ? "Ya" : "Tidak",
        day.summary?.jumlah_logbook ?? 0,
        parseFloat((day.summary?.total_output ?? 0).toFixed(2)),
        parseFloat((day.summary?.jam_produktif ?? 0).toFixed(2)),
      ];
    });

    const ws2 = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws2["!cols"] = [5, 14, 14, 18, 10, 10, 16, 10, 12, 16, 20, 14].map((w) => ({ wch: w }));
    ws2["!freeze"] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, ws2, "Data Harian");
  }

  const safeName = (karyawan?.NAMA ?? "Karyawan").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
  const out = fileName || `Rekap_${safeName}_${periode?.start ?? "period"}.xlsx`;
  XLSX.writeFile(wb, out);
  return out;
};

// ─── Excel Export — semua karyawan ───────────────────────────

const exportAllToExcel = (allRekap, periodeLabel = "") => {
  const wb = XLSX.utils.book_new();

  const headers = [
    "No", "Nama", "NIK", "Departemen", "Jabatan",
    "Performance Score", "Kategori",
    "Hadir", "Alpa", "Izin", "Sakit", "Cuti", "Terlambat", "Pulang Awal", "Jam Kerja",
    "Logbook Approved", "Total Output (unit)", "Jam Produktif", "Batch Dikerjakan",
  ];

  const rows = allRekap.map((item, idx) => [
    idx + 1,
    item.karyawan?.NAMA ?? "-",
    item.karyawan?.NIK ?? "-",
    item.karyawan?.DEPARTEMEN ?? "-",
    item.karyawan?.JABATAN ?? "-",
    item.summary?.performance_score ?? 0,
    getScoreLabel(item.summary?.performance_score ?? 0),
    item.summary?.presensi?.hadir ?? 0,
    item.summary?.presensi?.alpa ?? 0,
    item.summary?.presensi?.izin ?? 0,
    item.summary?.presensi?.sakit ?? 0,
    item.summary?.presensi?.cuti ?? 0,
    item.summary?.presensi?.terlambat ?? 0,
    item.summary?.presensi?.pulang_awal ?? 0,
    parseFloat((item.summary?.presensi?.total_jam_kerja ?? 0).toFixed(2)),
    item.summary?.produktivitas?.total_logbook_approved ?? 0,
    parseFloat((item.summary?.produktivitas?.total_output ?? 0).toFixed(2)),
    parseFloat((item.summary?.produktivitas?.total_jam_produktif ?? 0).toFixed(2)),
    item.summary?.produktivitas?.batch_dikerjakan ?? 0,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = [5, 24, 14, 14, 20, 18, 16, 8, 8, 8, 8, 8, 12, 14, 12, 18, 20, 14, 18].map((w) => ({ wch: w }));
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws, "Rekapitulasi");
  XLSX.writeFile(wb, `Rekap_Semua_Karyawan_${periodeLabel || "period"}.xlsx`);
};

// ─── PDF Export ───────────────────────────────────────────────

const exportToPDF = (detail, options = {}) => {
  const {
    includeDaily = true,
    includeSummary = true,
    companyName = "PT. Perusahaan",
    fileName = null,
  } = options;

  const { karyawan, summary, periode, daily_data } = detail;
  const score = summary?.performance_score ?? 0;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 18;

  // ── Header ────────────────────────────────────────────────
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("REKAPITULASI KINERJA KARYAWAN", pageW / 2, 11, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(companyName, pageW / 2, 18, { align: "center" });
  doc.text(
    `Periode: ${formatDate(periode?.start)} – ${formatDate(periode?.end)}`,
    pageW / 2, 25, { align: "center" }
  );
  y = 36;

  // ── Info Karyawan ─────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageW - 28, 30, 3, 3, "FD");
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(karyawan?.NAMA ?? "-", 20, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    [`NIK: ${karyawan?.NIK ?? "-"}`, `Dept: ${karyawan?.DEPARTEMEN ?? "-"}`, `Jabatan: ${karyawan?.JABATAN ?? "-"}`, `Email: ${karyawan?.EMAIL ?? "-"}`].join("   ·   "),
    20, y + 15
  );
  doc.text(`Total Hari: ${periode?.total_hari ?? 0} hari`, 20, y + 22);

  // Score badge
  const sc = score >= 80 ? [34,197,94] : score >= 60 ? [59,130,246] : score >= 40 ? [245,158,11] : [239,68,68];
  doc.setFillColor(...sc);
  doc.roundedRect(pageW - 50, y + 3, 36, 24, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(String(score), pageW - 32, y + 16, { align: "center" });
  doc.setFontSize(7);
  doc.text(getScoreLabel(score), pageW - 32, y + 23, { align: "center" });
  y += 38;

  // ── KPI Row ───────────────────────────────────────────────
  const kpis = [
    { label: "Hadir", value: summary?.presensi?.hadir ?? 0, color: [34,197,94] },
    { label: "Alpa", value: summary?.presensi?.alpa ?? 0, color: [239,68,68] },
    { label: "Terlambat", value: summary?.presensi?.terlambat ?? 0, color: [249,115,22] },
    { label: "Output", value: summary?.produktivitas?.total_output ?? 0, color: [245,158,11] },
    { label: "Logbook", value: summary?.produktivitas?.total_logbook_approved ?? 0, color: [139,92,246] },
    { label: "Jam Prod.", value: `${summary?.produktivitas?.total_jam_produktif?.toFixed(1) ?? 0}j`, color: [59,130,246] },
  ];
  const kpiW = (pageW - 28) / kpis.length;
  kpis.forEach((kpi, i) => {
    const x = 14 + i * kpiW;
    doc.setFillColor(
      Math.round(255 - (255 - kpi.color[0]) * 0.1),
      Math.round(255 - (255 - kpi.color[1]) * 0.1),
      Math.round(255 - (255 - kpi.color[2]) * 0.1)
    );
    doc.setDrawColor(
      Math.round(255 - (255 - kpi.color[0]) * 0.25),
      Math.round(255 - (255 - kpi.color[1]) * 0.25),
      Math.round(255 - (255 - kpi.color[2]) * 0.25)
    );
    doc.roundedRect(x, y, kpiW - 2, 16, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...kpi.color);
    doc.text(String(kpi.value), x + kpiW / 2 - 1, y + 8, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + kpiW / 2 - 1, y + 13, { align: "center" });
  });
  y += 22;

  // ── Summary Tables ────────────────────────────────────────
  if (includeSummary) {
    const midX = pageW / 2 + 2;

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: midX - 4 },
      head: [["Presensi", "Nilai"]],
      body: [
        ["Total Hari Kerja", summary?.presensi?.total_hari_kerja ?? 0],
        ["Hadir", summary?.presensi?.hadir ?? 0],
        ["Alpa", summary?.presensi?.alpa ?? 0],
        ["Izin", summary?.presensi?.izin ?? 0],
        ["Sakit", summary?.presensi?.sakit ?? 0],
        ["Cuti", summary?.presensi?.cuti ?? 0],
        ["Dinas Luar", summary?.presensi?.dinas_luar ?? 0],
        ["Terlambat", summary?.presensi?.terlambat ?? 0],
        ["Pulang Awal", summary?.presensi?.pulang_awal ?? 0],
        ["Total Jam Kerja", `${summary?.presensi?.total_jam_kerja ?? 0} jam`],
      ],
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [30,41,59], textColor: [255,255,255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248,250,252] },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    });
    const afterLeft = doc.lastAutoTable.finalY;

    autoTable(doc, {
      startY: y,
      margin: { left: midX, right: 14 },
      head: [["Produktivitas", "Nilai"]],
      body: [
        ["Logbook Approved", summary?.produktivitas?.total_logbook_approved ?? 0],
        ["Total Output", `${summary?.produktivitas?.total_output ?? 0} unit`],
        ["Jam Produktif", `${summary?.produktivitas?.total_jam_produktif?.toFixed(1) ?? 0} jam`],
        ["Batch Dikerjakan", summary?.produktivitas?.batch_dikerjakan ?? 0],
        ["Performance Score", `${score} — ${getScoreLabel(score)}`],
      ],
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [30,41,59], textColor: [255,255,255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248,250,252] },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    });

    y = Math.max(afterLeft, doc.lastAutoTable.finalY) + 6;
  }

  // ── Daily Data Table ──────────────────────────────────────
  if (includeDaily && daily_data?.length > 0) {
    if (y > 220) { doc.addPage(); y = 18; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text("DATA HARIAN", 14, y);
    y += 4;

    const dailyRows = daily_data.map((day, idx) => {
      const d = new Date(day.tanggal);
      return [
        idx + 1,
        d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }),
        d.toLocaleDateString("id-ID", { weekday: "short" }),
        day.presensi?.STATUS ?? "-",
        formatTime(day.presensi?.JAM_MASUK),
        formatTime(day.presensi?.JAM_KELUAR),
        isTruthy(day.presensi?.IS_TERLAMBAT) ? "Ya" : "-",
        day.summary?.jumlah_logbook ?? 0,
        parseFloat((day.summary?.total_output ?? 0).toFixed(1)),
        parseFloat((day.summary?.jam_produktif ?? 0).toFixed(1)),
      ];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [["No","Tanggal","Hari","Status","Masuk","Keluar","Terlambat","Logbook","Output","Jam Produktif"]],
      body: dailyRows,
      styles: { fontSize: 7.5, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [30,41,59], textColor: [255,255,255], fontStyle: "bold", fontSize: 7.5, halign: "center", cellPadding: 2 },
      alternateRowStyles: { fillColor: [248,250,252] },
      tableWidth: 182,
      columnStyles: {
        0: { halign: "center", cellWidth: 7 },
        1: { halign: "center", cellWidth: 24 },
        2: { halign: "center", cellWidth: 16 },
        3: { halign: "center", cellWidth: 24 },
        4: { halign: "center", cellWidth: 16 },
        5: { halign: "center", cellWidth: 16 },
        6: { halign: "center", cellWidth: 18 },
        7: { halign: "center", cellWidth: 18 },
        8: { halign: "right",  cellWidth: 18 },
        9: { halign: "right",  cellWidth: 25 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 3) {
          const v = data.cell.raw;
          if (v === "Alpa") data.cell.styles.textColor = [239,68,68];
          else if (v === "Hadir") data.cell.styles.textColor = [34,197,94];
          else if (v === "Izin") data.cell.styles.textColor = [59,130,246];
          else if (v === "Sakit") data.cell.styles.textColor = [245,158,11];
        }
        if (data.section === "body" && data.column.index === 6 && data.cell.raw === "Ya") {
          data.cell.styles.textColor = [249,115,22];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
  }

  // ── Footer per halaman ────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    doc.setFillColor(248, 250, 252);
    doc.rect(0, ph - 10, pageW, 10, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, ph - 4);
    doc.text(`Halaman ${i} / ${totalPages}`, pageW - 14, ph - 4, { align: "right" });
  }

  const safeName = (karyawan?.NAMA ?? "Karyawan").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
  const out = fileName || `Rekap_${safeName}_${periode?.start ?? "period"}.pdf`;
  doc.save(out);
  return out;
};

// ─── Main Component ───────────────────────────────────────────

export default function RekapExportDialog({
  visible,
  onHide,
  detail,
  defaultMode = "excel",
  allRekap = [],
  exportMode = "single",
}) {
  const [mode, setMode] = useState(defaultMode);
  const [includeDaily, setIncludeDaily] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [companyName, setCompanyName] = useState("PT. Perusahaan");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastExported, setLastExported] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { setMode(defaultMode); }, [defaultMode, visible]);

  const handleExport = useCallback(() => {
    if (!detail && exportMode === "single") return;
    setIsExporting(true);
    setExportProgress(20);
    setError(null);
    setLastExported(null);

    // Bungkus dalam setTimeout agar UI sempat render progress bar
    setTimeout(() => {
      try {
        setExportProgress(60);
        let fileName;

        if (exportMode === "all") {
          const lbl = detail?.periode?.start
            ? `${detail.periode.start}_${detail.periode.end}`
            : "period";
          exportAllToExcel(allRekap, lbl);
          fileName = `Rekap_Semua_Karyawan.xlsx`;
        } else if (mode === "excel") {
          fileName = exportToExcel(detail, { includeDaily, includeSummary });
        } else {
          fileName = exportToPDF(detail, { includeDaily, includeSummary, companyName });
        }

        setExportProgress(100);
        setLastExported(fileName);
      } catch (err) {
        console.error("Export error:", err);
        setError(err.message || "Terjadi kesalahan saat export.");
      } finally {
        setTimeout(() => { setIsExporting(false); setExportProgress(0); }, 600);
      }
    }, 80);
  }, [detail, mode, includeDaily, includeSummary, companyName, exportMode, allRekap]);

  const headerContent = (
    <div className="flex align-items-center gap-2">
      <div className="flex align-items-center justify-content-center border-round"
        style={{ width: 36, height: 36, background: mode === "excel" ? "#22c55e22" : "#ef444422" }}>
        <i className={mode === "excel" ? "pi pi-file-excel text-green-500" : "pi pi-file-pdf text-red-500"} style={{ fontSize: "1.1rem" }} />
      </div>
      <div>
        <div className="font-bold text-900">Export Rekapitulasi</div>
        <div className="text-500 text-xs">
          {exportMode === "all" ? `${allRekap.length} karyawan → Excel` : detail?.karyawan?.NAMA ?? "-"}
        </div>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        {lastExported && (
          <div className="flex align-items-center gap-2 text-green-600 text-sm">
            <i className="pi pi-check-circle" /><span>Berhasil: {lastExported}</span>
          </div>
        )}
        {error && (
          <div className="flex align-items-center gap-1 text-red-500 text-xs" style={{ maxWidth: 280 }}>
            <i className="pi pi-exclamation-circle flex-shrink-0" /><span>{error}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button label="Batal" severity="secondary" size="small" outlined onClick={onHide} disabled={isExporting} />
        <Button
          label={isExporting ? "Mengexport..." : exportMode === "all" ? "Export Excel Semua" : mode === "excel" ? "Export Excel" : "Export PDF"}
          icon={isExporting ? "pi pi-spin pi-spinner" : mode === "excel" ? "pi pi-file-excel" : "pi pi-file-pdf"}
          severity={mode === "excel" ? "success" : "danger"}
          size="small"
          onClick={handleExport}
          disabled={isExporting || (!detail && exportMode === "single")}
        />
      </div>
    </div>
  );

  return (
    <Dialog header={headerContent} footer={footerContent} visible={visible}
      style={{ width: "480px", maxWidth: "95vw" }} modal onHide={onHide} dismissableMask={!isExporting}>
      <div className="py-2">

        {isExporting && (
          <div className="mb-4">
            <ProgressBar value={exportProgress} style={{ height: 8, borderRadius: 4 }} className="mb-2" />
            <p className="text-500 text-xs text-center">Menyiapkan file export...</p>
          </div>
        )}

        {exportMode === "all" ? (
          <div className="border-round-lg p-4 text-center" style={{ background: "#22c55e0d", border: "1px solid #22c55e33" }}>
            <i className="pi pi-users text-4xl text-green-500 mb-3 block" />
            <div className="font-bold text-900 text-lg mb-1">Export Semua Karyawan</div>
            <div className="text-500 text-sm mb-3">
              Akan mengexport data <span className="font-bold text-green-600">{allRekap.length} karyawan</span> ke satu file Excel (.xlsx)
            </div>
            <Tag value="Format: Excel (.xlsx)" severity="success" icon="pi pi-file-excel" />
          </div>
        ) : (
          <>
            {/* Format Selection */}
            <div className="mb-4">
              <div className="text-600 text-sm font-semibold mb-3">Format Export</div>
              <div className="flex gap-3">
                {[
                  { val: "excel", label: "Excel (.xlsx)", icon: "pi pi-file-excel", color: "#22c55e", desc: "Spreadsheet dengan data lengkap" },
                  { val: "pdf",   label: "PDF (A4)",      icon: "pi pi-file-pdf",   color: "#ef4444", desc: "Dokumen siap cetak" },
                ].map((opt) => (
                  <div key={opt.val} className="flex-1 border-round-lg p-3 cursor-pointer"
                    style={{
                      border: `2px solid ${mode === opt.val ? opt.color : "var(--surface-border)"}`,
                      background: mode === opt.val ? `${opt.color}0d` : "var(--surface-0)",
                    }}
                    onClick={() => setMode(opt.val)}>
                    <div className="flex align-items-center gap-2 mb-2">
                      <RadioButton inputId={opt.val} value={opt.val} onChange={(e) => setMode(e.value)} checked={mode === opt.val} />
                      <i className={`${opt.icon} text-xl`} style={{ color: opt.color }} />
                      <span className="font-semibold text-900 text-sm">{opt.label}</span>
                    </div>
                    <p className="text-500 text-xs m-0 ml-5">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <Divider className="my-3" />

            {/* Konten */}
            <div className="mb-4">
              <div className="text-600 text-sm font-semibold mb-3">Konten yang Disertakan</div>
              <div className="flex flex-column gap-2">
                <div className="flex align-items-center gap-3 p-2 border-round surface-50">
                  <Checkbox inputId="inc-sum" checked={includeSummary} onChange={(e) => setIncludeSummary(e.checked)} />
                  <label htmlFor="inc-sum" className="cursor-pointer">
                    <div className="font-medium text-900 text-sm">Ringkasan Kinerja</div>
                    <div className="text-500 text-xs">Info karyawan, total presensi, produktivitas, score</div>
                  </label>
                </div>
                <div className="flex align-items-center gap-3 p-2 border-round surface-50">
                  <Checkbox inputId="inc-daily" checked={includeDaily} onChange={(e) => setIncludeDaily(e.checked)} />
                  <label htmlFor="inc-daily" className="cursor-pointer">
                    <div className="font-medium text-900 text-sm">Data Harian</div>
                    <div className="text-500 text-xs">Detail per hari: presensi, logbook, output</div>
                  </label>
                </div>
              </div>
            </div>

            {/* Opsi PDF */}
            {mode === "pdf" && (
              <>
                <Divider className="my-3" />
                <div>
                  <div className="text-600 text-sm font-semibold mb-2">Opsi PDF</div>
                  <label className="block text-sm text-700 mb-1">Nama Perusahaan (header dokumen)</label>
                  <InputText value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="PT. Nama Perusahaan" className="w-full" size="small" />
                </div>
              </>
            )}

            {/* Preview */}
            <Divider className="my-3" />
            <div className="border-round-lg p-3" style={{ background: "var(--surface-50)", border: "1px solid var(--surface-border)" }}>
              <div className="text-500 text-xs font-semibold uppercase mb-2">Preview Ekspor</div>
              <div className="flex flex-column gap-1">
                {[
                  { label: "Karyawan", value: detail?.karyawan?.NAMA ?? "-" },
                  { label: "Periode", value: `${formatDate(detail?.periode?.start)} – ${formatDate(detail?.periode?.end)}` },
                  { label: "Data Harian", value: includeDaily ? `${detail?.daily_data?.length ?? 0} baris` : "Tidak disertakan" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-content-between text-sm">
                    <span className="text-600">{item.label}:</span>
                    <span className="font-medium text-900">{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-content-between text-sm">
                  <span className="text-600">Performance Score:</span>
                  <span className="font-bold" style={{ color: getScoreColor(detail?.summary?.performance_score ?? 0) }}>
                    {detail?.summary?.performance_score ?? 0} — {getScoreLabel(detail?.summary?.performance_score ?? 0)}
                  </span>
                </div>
                <div className="flex justify-content-between text-sm align-items-center">
                  <span className="text-600">Format:</span>
                  <Tag value={mode === "excel" ? "Excel (.xlsx)" : "PDF (A4)"} severity={mode === "excel" ? "success" : "danger"} className="text-xs" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}