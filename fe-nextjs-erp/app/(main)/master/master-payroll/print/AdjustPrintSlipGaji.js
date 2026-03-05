"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

const getScoreColor = (s) => {
  if (s >= 90) return [21, 128, 61];
  if (s >= 75) return [29, 78, 216];
  if (s >= 60) return [161, 98, 7];
  return [185, 28, 28];
};

const generateSlipPDF = (data, companyName) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const W = doc.internal.pageSize.width;
  const H = doc.internal.pageSize.height;

  // ── Background header ──
  doc.setFillColor(26, 54, 93);
  doc.rect(0, 0, W, 32, "F");
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 32, W, 1.5, "F");

  // ── Judul ──
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SLIP GAJI KARYAWAN", W / 2, 12, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 255);
  doc.text(companyName.toUpperCase(), W / 2, 19, { align: "center" });
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  const periode = data.PERIODE
    ? new Date(data.PERIODE).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "—";
  doc.text(`Periode: ${periode}`, W / 2, 27, { align: "center" });

  // ── Info Karyawan ──
  const y1 = 40;
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.NAMA || "—", 15, y1);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 100, 120);
  doc.text(`${data.JABATAN_SNAPSHOT || data.JABATAN || "—"} · ${data.DEPARTEMEN_SNAPSHOT || data.DEPARTEMEN || "—"}`, 15, y1 + 5);
  doc.text(`Kode: ${data.KODE_PAYROLL || "—"}`, 15, y1 + 10);

  // Score badge kanan
  const sc    = parseFloat(data.PERFORMANCE_SCORE || 0);
  const scRgb = getScoreColor(sc);
  doc.setFillColor(...scRgb);
  doc.roundedRect(W - 35, y1 - 4, 24, 16, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(sc.toFixed(0), W - 23, y1 + 5, { align: "center" });
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "normal");
  doc.text("SCORE", W - 23, y1 + 10, { align: "center" });

  // ── Kehadiran boxes ──
  const y2    = y1 + 18;
  const boxes = [
    { l: "Hadir",     v: data.HARI_HADIR || 0 },
    { l: "Alpa",      v: data.HARI_ALPA  || 0 },
    { l: "Terlambat", v: `${data.TOTAL_KEJADIAN_TERLAMBAT || 0}x` },
    { l: "Menit Tlbt",v: data.TOTAL_TERLAMBAT_MENIT || 0 },
    { l: "Logbook",   v: data.TOTAL_LOGBOOK_APPROVED || 0 },
    { l: "Output",    v: data.TOTAL_OUTPUT || 0 },
  ];
  const bW = (W - 30) / 6;
  boxes.forEach((b, i) => {
    const bx = 15 + i * bW;
    doc.setFillColor(245, 248, 255);
    doc.roundedRect(bx, y2, bW - 1, 11, 1.5, 1.5, "F");
    doc.setTextColor(26, 54, 93);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(String(b.v), bx + (bW - 1) / 2, y2 + 5, { align: "center" });
    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 120, 140);
    doc.text(b.l.toUpperCase(), bx + (bW - 1) / 2, y2 + 9.5, { align: "center" });
  });

  // ── Tabel 2 kolom (pendapatan kiri, potongan kanan) ──
  const y3 = y2 + 16;
  doc.setFillColor(26, 54, 93);
  doc.rect(15, y3, (W - 30) / 2 - 1, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("PENDAPATAN", 15 + (W - 30) / 4 - 0.5, y3 + 4, { align: "center" });

  const col2x = 15 + (W - 30) / 2 + 1;
  doc.setFillColor(180, 30, 30);
  doc.rect(col2x, y3, (W - 30) / 2 - 1, 6, "F");
  doc.text("POTONGAN", col2x + (W - 30) / 4 - 0.5, y3 + 4, { align: "center" });

  const pendRows = [
    ["Gaji Pokok",          fmt(data.GAJI_POKOK)],
    ["Tunj. Transport",     fmt(data.TUNJANGAN_TRANSPORT)],
    ["Tunj. Makan",         fmt(data.TUNJANGAN_MAKAN)],
    ["Tunj. Jabatan",       fmt(data.TUNJANGAN_JABATAN)],
    ["Tunj. Lainnya",       fmt(data.TUNJANGAN_LAINNYA)],
    [`Bonus (${data.BONUS_PERSEN_DIPAKAI || 0}%)`, fmt(data.BONUS_KINERJA)],
  ];

  const potRows = [
    ["Terlambat",      fmt(data.POTONGAN_TERLAMBAT)],
    ["Alpa",           fmt(data.POTONGAN_ALPA)],
    ["BPJS Kesehatan", fmt(data.POTONGAN_BPJS_KESEHATAN)],
    ["BPJS TK",        fmt(data.POTONGAN_BPJS_TK)],
    ["PPh21",          fmt(data.POTONGAN_PPH21)],
    ["",               ""],
  ];

  const rowH  = 6.5;
  const tY    = y3 + 7;
  const colW  = (W - 30) / 2;

  pendRows.forEach((r, i) => {
    const ry = tY + i * rowH;
    if (i % 2 === 1) {
      doc.setFillColor(245, 248, 255);
      doc.rect(15, ry - 1, colW - 1, rowH, "F");
    }
    doc.setTextColor(60, 80, 100);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(r[0], 17, ry + 3.5);
    doc.setFont("helvetica", "bold");
    doc.text(r[1], 15 + colW - 3, ry + 3.5, { align: "right" });
  });

  potRows.forEach((r, i) => {
    const ry = tY + i * rowH;
    if (i % 2 === 1) {
      doc.setFillColor(255, 248, 248);
      doc.rect(col2x, ry - 1, colW - 1, rowH, "F");
    }
    if (!r[0]) return;
    doc.setTextColor(60, 80, 100);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(r[0], col2x + 2, ry + 3.5);
    doc.setFont("helvetica", "bold");
    doc.text(r[1], col2x + colW - 3, ry + 3.5, { align: "right" });
  });

  // Garis total
  const totY = tY + pendRows.length * rowH + 1;
  doc.setDrawColor(26, 54, 93);
  doc.setLineWidth(0.3);
  doc.line(15, totY, 15 + colW - 1, totY);
  doc.setTextColor(26, 54, 93);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("Total Pendapatan", 17, totY + 4);
  doc.setTextColor(22, 163, 74);
  doc.text(fmt(data.TOTAL_PENDAPATAN), 15 + colW - 3, totY + 4, { align: "right" });

  doc.setDrawColor(180, 30, 30);
  doc.line(col2x, totY, col2x + colW - 1, totY);
  doc.setTextColor(26, 54, 93);
  doc.setFont("helvetica", "bold");
  doc.text("Total Potongan", col2x + 2, totY + 4);
  doc.setTextColor(185, 28, 28);
  doc.text(fmt(data.TOTAL_POTONGAN), col2x + colW - 3, totY + 4, { align: "right" });

  // ── THP Banner ──
  const thpY = totY + 9;
  doc.setFillColor(26, 54, 93);
  doc.roundedRect(15, thpY, W - 30, 18, 3, 3, "F");
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.6);
  doc.roundedRect(15, thpY, W - 30, 18, 3, 3, "S");
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("TAKE HOME PAY", W / 2, thpY + 5, { align: "center" });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(fmt(data.TAKE_HOME_PAY), W / 2, thpY + 13, { align: "center" });

  // ── TTD ──
  const ttdY = thpY + 24;
  doc.setTextColor(60, 80, 100);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Karyawan,", 20, ttdY);
  doc.text("Mengetahui, HRD", W - 20, ttdY, { align: "right" });
  doc.line(15, ttdY + 18, 55, ttdY + 18);
  doc.line(W - 55, ttdY + 18, W - 15, ttdY + 18);
  doc.setFont("helvetica", "bold");
  doc.text(data.NAMA || "_______________", 35, ttdY + 22, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("_______________", W - 35, ttdY + 22, { align: "center" });

  // ── Footer ──
  doc.setTextColor(150, 160, 170);
  doc.setFontSize(6);
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, W / 2, H - 5, { align: "center" });

  return doc;
};

const AdjustPrintSlipGaji = ({ visible, onHide, data, setPdfUrl, setFileName, setPreviewOpen }) => {
  const defaultCompany = process.env.NEXT_PUBLIC_COMPANY_NAME || "PT. Perusahaan Indonesia";
  const [companyName, setCompanyName] = useState(defaultCompany);

  const handlePrint = () => {
    if (!data) return;
    const doc  = generateSlipPDF(data, companyName);
    const url  = doc.output("datauristring");
    const name = `Slip_${data.NAMA?.replace(/ /g, "_")}_${data.PERIODE?.substring(0, 7)}.pdf`;
    setPdfUrl(url);
    setFileName(name);
    setPreviewOpen(true);
    onHide();
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-print text-primary text-xl" />
          <span className="font-bold text-900">Cetak Slip Gaji</span>
        </div>
      }
      style={{ width: "420px" }}
      className="p-fluid"
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Batal" icon="pi pi-times" outlined severity="secondary" onClick={onHide} />
          <Button label="Generate PDF" icon="pi pi-file-pdf" onClick={handlePrint} disabled={!data} />
        </div>
      }
    >
      <div className="pt-2">
        {data && (
          <div className="surface-50 border-round-xl p-3 mb-4 border-1 border-200">
            <div className="font-bold text-900">{data.NAMA}</div>
            <div className="text-500 text-sm mt-1">
              {data.JABATAN_SNAPSHOT} · {data.DEPARTEMEN_SNAPSHOT} ·{" "}
              {data.PERIODE ? new Date(data.PERIODE).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) : "—"}
            </div>
            <div className="font-bold text-primary text-lg mt-2">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(data.TAKE_HOME_PAY || 0)}
            </div>
          </div>
        )}
        <div className="field">
          <label className="font-medium text-sm text-700 mb-2 block">
            <i className="pi pi-building mr-1" /> Nama Perusahaan (pada slip)
          </label>
          <InputText
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full"
            placeholder="PT. Nama Perusahaan"
          />
        </div>
        <div className="surface-50 border-round p-3 text-sm text-600 flex align-items-start gap-2">
          <i className="pi pi-info-circle text-blue-500 mt-1 flex-shrink-0" />
          <span>Slip gaji format A5 Portrait akan digenerate dalam format PDF siap cetak.</span>
        </div>
      </div>
    </Dialog>
  );
};

export default AdjustPrintSlipGaji;
