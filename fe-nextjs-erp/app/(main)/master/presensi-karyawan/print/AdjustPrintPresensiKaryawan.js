"use client";

import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api").replace(/\/+$/g, "");

export default function AdjustPrintPresensiKaryawan({
  visible,
  onHide,
  setPdfUrl,
  setFileName,
  setJsPdfPreviewOpen,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [config, setConfig] = useState({
    dateRange: null,
    marginTop: 20,
    marginBottom: 20,
    marginRight: 15,
    marginLeft: 15,
    paperSize: "A4",
    orientation: "portrait",
  });

  useEffect(() => {
    if (visible && !config.dateRange) {
      const end = new Date();
      const start = new Date();
      start.setDate(1);
      setConfig((prev) => ({ ...prev, dateRange: [start, end] }));
    }
  }, [visible]);

  const paperSizes = [
    { name: "A4 Standard", value: "A4" },
    { name: "F4 / Legal", value: [215, 330] },
    { name: "Letter", value: "Letter" },
  ];

  const orientationOptions = [
    { label: "Portrait (Tegak)", value: "portrait" },
    { label: "Landscape (Mendatar)", value: "landscape" },
  ];

  const fetchRekapPresensi = async () => {
    try {
      if (!config.dateRange?.[0] || !config.dateRange?.[1]) {
        setErrorMsg("Pilih rentang tanggal lengkap.");
        return [];
      }

      // Ambil token — sama seperti page.js dan halaman lain
      const token = localStorage.getItem("TOKEN");
      if (!token) {
        setErrorMsg("Sesi tidak ditemukan. Silakan login kembali.");
        return [];
      }

      const start = config.dateRange[0].toLocaleDateString("en-CA");
      const end   = config.dateRange[1].toLocaleDateString("en-CA");

      const res = await axios.get(`${API_URL}/master-presensi/rekap`, {
        params: { start_date: start, end_date: end },
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.data || [];
    } catch (error) {
      console.error("Fetch Error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setErrorMsg("Sesi habis atau tidak punya akses. Silakan login kembali.");
      } else {
        setErrorMsg("Koneksi server terputus.");
      }
      return [];
    }
  };

  const generatePDF = (dataPresensi) => {
    const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME || "PT. Perusahaan Indonesia";

    const doc = new jsPDF({
      orientation: config.orientation,
      unit: "mm",
      format: config.paperSize,
    });

    const W  = doc.internal.pageSize.width;
    const H  = doc.internal.pageSize.height;
    const { marginLeft: mL, marginTop: mT, marginRight: mR, marginBottom: mB } = config;
    const contentW = W - mL - mR;

    // ── KOP SURAT ──────────────────────────────────────────────
    doc.setFillColor(26, 54, 93);
    doc.rect(mL, mT, contentW, 22, "F");

    doc.setFillColor(212, 175, 55);
    doc.rect(mL, mT + 22, contentW, 1.2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN REKAPITULASI PRESENSI KARYAWAN", W / 2, mT + 9, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 220, 255);
    doc.text(COMPANY.toUpperCase(), W / 2, mT + 16, { align: "center" });

    doc.setTextColor(44, 62, 80);
    doc.setFontSize(9);
    const rangeStr = `${config.dateRange[0].toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} s/d ${config.dateRange[1].toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`;
    doc.text(`Periode Laporan: ${rangeStr}`, mL, mT + 30);
    doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, W - mR, mT + 30, { align: "right" });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(mL, mT + 33, W - mR, mT + 33);

    // ── STATISTIK RINGKASAN ─────────────────────────────────────
    const total     = dataPresensi.length;
    const hadir     = dataPresensi.filter((d) => d.STATUS === "Hadir").length;
    const izin      = dataPresensi.filter((d) => d.STATUS === "Izin").length;
    const sakit     = dataPresensi.filter((d) => d.STATUS === "Sakit").length;
    const terlambat = dataPresensi.filter((d) => d.IS_TERLAMBAT == 1).length;

    const stats = [
      { label: "Total Record", value: total,     color: [41, 128, 185] },
      { label: "Hadir",        value: hadir,      color: [39, 174, 96]  },
      { label: "Izin",         value: izin,       color: [243, 156, 18] },
      { label: "Sakit",        value: sakit,      color: [230, 126, 34] },
      { label: "Terlambat",    value: terlambat,  color: [192, 57, 43]  },
    ];

    const boxW = contentW / stats.length - 2;
    stats.forEach((s, i) => {
      const bx = mL + i * (boxW + 2);
      const by = mT + 36;
      doc.setFillColor(...s.color);
      doc.roundedRect(bx, by, boxW, 14, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(String(s.value), bx + boxW / 2, by + 7, { align: "center" });
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text(s.label.toUpperCase(), bx + boxW / 2, by + 12, { align: "center" });
    });

    // ── TABEL DATA ──────────────────────────────────────────────
    const cols = ["No", "ID Karyawan", "Nama Karyawan", "Tanggal", "Masuk", "Pulang", "Durasi", "Status", "Keterangan"];
    const rows = dataPresensi.map((item, idx) => {
      let durasi = "-";
      if (item.JAM_MASUK && item.JAM_KELUAR) {
        const [hM, mM] = item.JAM_MASUK.split(":").map(Number);
        const [hK, mK] = item.JAM_KELUAR.split(":").map(Number);
        const total = (hK * 60 + mK) - (hM * 60 + mM);
        if (total > 0) durasi = `${Math.floor(total / 60)}j ${total % 60}m`;
      }
      return [
        idx + 1,
        item.KARYAWAN_ID || "-",
        item.NAMA_KARYAWAN || item.NAMA || "N/A",
        item.TANGGAL ? new Date(item.TANGGAL).toLocaleDateString("id-ID") : "-",
        item.JAM_MASUK?.substring(0, 5) || "--:--",
        item.JAM_KELUAR?.substring(0, 5) || "--:--",
        durasi,
        item.STATUS || "Hadir",
        item.IS_TERLAMBAT == 1 ? "Terlambat" : (item.KETERANGAN || "-"),
      ];
    });

    autoTable(doc, {
      startY: mT + 55,
      head: [cols],
      body: rows,
      margin: { left: mL, right: mR, bottom: mB + 15 },
      styles: { fontSize: 7.5, overflow: "linebreak", cellPadding: 2 },
      headStyles: {
        fillColor: [26, 54, 93],
        textColor: 255,
        halign: "center",
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
      },
      didParseCell(data) {
        if (data.section === "body") {
          if (data.column.index === 7 && data.cell.raw === "Terlambat") {
            data.cell.styles.textColor = [192, 57, 43];
            data.cell.styles.fontStyle = "bold";
          }
          if (data.column.index === 7 && data.cell.raw === "Hadir") {
            data.cell.styles.textColor = [39, 174, 96];
          }
        }
      },
      didDrawPage(d) {
        doc.setFillColor(26, 54, 93);
        doc.rect(mL, H - 12, contentW, 8, "F");
        doc.setTextColor(200, 220, 255);
        doc.setFontSize(7);
        doc.text(`${COMPANY} — Laporan Presensi Karyawan`, mL + 2, H - 7);
        doc.text(`Halaman ${d.pageNumber}`, W - mR - 2, H - 7, { align: "right" });
      },
    });

    // ── TANDA TANGAN ────────────────────────────────────────────
    const finalY = (doc.lastAutoTable?.finalY || mT + 60) + 15;
    if (finalY < H - 50) {
      const signX = W - mR - 55;
      const signY = finalY;
      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.rect(signX - 5, signY, 60, 32, "S");
      doc.setTextColor(44, 62, 80);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `${config.dateRange[1].toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`,
        signX + 25, signY + 6, { align: "center" }
      );
      doc.text("Mengetahui,", signX + 25, signY + 11, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.text("HRD DEPARTMENT", signX + 25, signY + 26, { align: "center" });
      doc.setLineWidth(0.5);
      doc.line(signX, signY + 27, signX + 50, signY + 27);
    }

    return doc;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);
    const data = await fetchRekapPresensi();
    if (data.length === 0) {
      if (!errorMsg) setErrorMsg("Tidak ada data presensi pada periode tersebut.");
      setLoading(false);
      return;
    }
    const doc      = generatePDF(data);
    const pdfUrl   = doc.output("datauristring");
    const fileName = `REKAP_PRESENSI_${new Date().getTime()}.pdf`;
    setPdfUrl(pdfUrl);
    setFileName(fileName);
    setJsPdfPreviewOpen(true);
    onHide();
    setLoading(false);
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-print text-primary text-xl"></i>
          <span className="font-bold text-900">Parameter Cetak Laporan</span>
        </div>
      }
      style={{ width: "460px" }}
      modal
      className="p-fluid"
      footer={
        <div className="flex justify-content-end gap-2 pt-2">
          <Button label="Batal" icon="pi pi-times" outlined severity="secondary" onClick={onHide} />
          <Button label="Proses & Cetak PDF" icon="pi pi-file-pdf" loading={loading} onClick={handleGenerate} />
        </div>
      }
    >
      <div className="grid pt-2">
        {errorMsg && (
          <div className="col-12 mb-2">
            <Message severity="error" text={errorMsg} className="w-full" />
          </div>
        )}

        <div className="col-12 field">
          <label className="font-medium text-sm text-700 mb-2 block">
            <i className="pi pi-calendar mr-1" /> Rentang Tanggal
          </label>
          <Calendar
            value={config.dateRange}
            onChange={(e) => setConfig((p) => ({ ...p, dateRange: e.value }))}
            selectionMode="range"
            readOnlyInput
            showIcon
            placeholder="Pilih tanggal awal - akhir..."
            className="w-full"
            dateFormat="dd/mm/yy"
          />
        </div>

        <div className="col-6 field">
          <label className="font-medium text-sm text-700 mb-1 block">Ukuran Kertas</label>
          <Dropdown
            value={config.paperSize}
            options={paperSizes}
            onChange={(e) => setConfig((p) => ({ ...p, paperSize: e.value }))}
            optionLabel="name"
            className="w-full"
          />
        </div>

        <div className="col-6 field">
          <label className="font-medium text-sm text-700 mb-1 block">Orientasi</label>
          <Dropdown
            value={config.orientation}
            options={orientationOptions}
            onChange={(e) => setConfig((p) => ({ ...p, orientation: e.value }))}
            className="w-full"
          />
        </div>

        <div className="col-12 my-1">
          <Divider align="left">
            <span className="text-xs font-medium text-500 uppercase">Margin Dokumen (mm)</span>
          </Divider>
        </div>

        {[
          { label: "Atas",   key: "marginTop"    },
          { label: "Bawah",  key: "marginBottom" },
          { label: "Kiri",   key: "marginLeft"   },
          { label: "Kanan",  key: "marginRight"  },
        ].map(({ label, key }) => (
          <div className="col-3 field" key={key}>
            <label className="text-xs mb-1 block font-medium text-700">{label}</label>
            <InputNumber
              value={config[key]}
              onValueChange={(e) => setConfig((p) => ({ ...p, [key]: e.value }))}
              min={0}
              max={50}
              showButtons
              buttonLayout="stacked"
              className="w-full"
            />
          </div>
        ))}
      </div>
    </Dialog>
  );
}