"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api").replace(/\/+$/g, "");
const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME || "PT. Perusahaan Indonesia";

const DEPT_COLOR_RGB = {
  PRODUKSI:   [59, 130, 246],
  GUDANG:     [34, 197, 94],
  KEUANGAN:   [139, 92, 246],
  HR:         [245, 158, 11],
  SUPERADMIN: [239, 68, 68],
};

const AdjustPrintGajiJabatan = ({ visible, onHide, setPdfUrl, setFileName, setJsPdfPreviewOpen, token }) => {
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [config,   setConfig]   = useState({
    filterStatus:  "Semua",
    paperSize:     "A4",
    orientation:   "portrait",
    marginTop:     20,
    marginBottom:  20,
    marginLeft:    15,
    marginRight:   15,
  });

  useEffect(() => { if (!visible) setErrorMsg(null); }, [visible]);

  const setC = (k, v) => setConfig((p) => ({ ...p, [k]: v }));

  const fetchData = async () => {
    const res = await axios.get(`${API_URL}/master-gaji-jabatan`, {
      headers: { Authorization: `Bearer ${token}` },
      params: config.filterStatus !== "Semua" ? { status: config.filterStatus } : {},
    });
    return res.data?.data || [];
  };

  const generatePDF = (data) => {
    const doc = new jsPDF({ orientation: config.orientation, unit: "mm", format: config.paperSize });
    const W  = doc.internal.pageSize.width;
    const H  = doc.internal.pageSize.height;
    const mL = config.marginLeft, mR = config.marginRight;
    const mT = config.marginTop,  mB = config.marginBottom;
    const cW = W - mL - mR;

    // ── KOP ──
    doc.setFillColor(26, 54, 93);
    doc.rect(mL, mT, cW, 22, "F");
    doc.setFillColor(212, 175, 55);
    doc.rect(mL, mT + 22, cW, 1.2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN MASTER GAJI JABATAN", W / 2, mT + 9, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 220, 255);
    doc.text(COMPANY.toUpperCase(), W / 2, mT + 17, { align: "center" });

    doc.setTextColor(44, 62, 80);
    doc.setFontSize(8.5);
    doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, mL, mT + 30);
    doc.text(`Total: ${data.length} jabatan`, W - mR, mT + 30, { align: "right" });

    // ── STAT BOXES ──
    const aktif    = data.filter((d) => d.STATUS === "Aktif").length;
    const avgGaji  = data.length ? data.reduce((s, d) => s + parseFloat(d.GAJI_POKOK || 0), 0) / data.length : 0;
    const maxGaji  = data.length ? Math.max(...data.map((d) => parseFloat(d.GAJI_POKOK || 0))) : 0;
    const fmtRp    = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

    const stats = [
      { label: "Total Jabatan", value: String(data.length), color: [99, 102, 241] },
      { label: "Aktif",         value: String(aktif),       color: [34, 197, 94]  },
      { label: "Avg Gaji Pokok",value: fmtRp(avgGaji),     color: [245, 158, 11] },
      { label: "Gaji Tertinggi",value: fmtRp(maxGaji),     color: [139, 92, 246] },
    ];
    const bW = (cW - 6) / 4;
    stats.forEach((s, i) => {
      const bx = mL + i * (bW + 2);
      const by = mT + 35;
      doc.setFillColor(...s.color);
      doc.roundedRect(bx, by, bW, 14, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(s.value.length > 12 ? 6 : 8);
      doc.setFont("helvetica", "bold");
      doc.text(s.value, bx + bW / 2, by + 6.5, { align: "center" });
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.text(s.label.toUpperCase(), bx + bW / 2, by + 11, { align: "center" });
    });

    // ── TABEL ──
    const fmt0 = (n) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n || 0);
    const rows = data.map((row, i) => [
      i + 1,
      row.JABATAN || "-",
      row.DEPARTEMEN || "-",
      fmt0(row.GAJI_POKOK),
      fmt0(parseFloat(row.TUNJANGAN_TRANSPORT || 0) + parseFloat(row.TUNJANGAN_MAKAN || 0) + parseFloat(row.TUNJANGAN_JABATAN || 0) + parseFloat(row.TUNJANGAN_LAINNYA || 0)),
      `${row.BPJS_KESEHATAN_PERSEN || 0}% / ${row.BPJS_TK_PERSEN || 0}%`,
      `${row.BONUS_SCORE_90 || 0}% / ${row.BONUS_SCORE_75 || 0}% / ${row.BONUS_SCORE_60 || 0}%`,
      row.STATUS || "-",
    ]);

    autoTable(doc, {
      startY: mT + 55,
      head: [["No", "Jabatan", "Departemen", "Gaji Pokok", "Total Tunj.", "BPJS K/TK", "Bonus 90/75/60", "Status"]],
      body: rows,
      margin: { left: mL, right: mR, bottom: mB + 15 },
      styles: { fontSize: 7.5, overflow: "linebreak", cellPadding: 2 },
      headStyles: { fillColor: [26, 54, 93], textColor: 255, halign: "center", fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
      },
      didParseCell(d) {
        if (d.section === "body" && d.column.index === 2) {
          const rgb = DEPT_COLOR_RGB[d.cell.raw] || [100, 116, 139];
          d.cell.styles.textColor = rgb;
          d.cell.styles.fontStyle = "bold";
        }
        if (d.section === "body" && d.column.index === 7) {
          d.cell.styles.textColor = d.cell.raw === "Aktif" ? [39, 174, 96] : [192, 57, 43];
          d.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage(d) {
        doc.setFillColor(26, 54, 93);
        doc.rect(mL, H - 12, cW, 8, "F");
        doc.setTextColor(200, 220, 255);
        doc.setFontSize(7);
        doc.text(`${COMPANY} — Laporan Gaji Jabatan`, mL + 2, H - 7);
        doc.text(`Halaman ${d.pageNumber}`, W - mR - 2, H - 7, { align: "right" });
      },
    });

    return doc;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchData();
      if (!data.length) { setErrorMsg("Tidak ada data untuk dicetak."); setLoading(false); return; }
      const doc      = generatePDF(data);
      const pdfUrl   = doc.output("datauristring");
      const fileName = `LAPORAN_GAJI_JABATAN_${new Date().getTime()}.pdf`;
      setPdfUrl(pdfUrl);
      setFileName(fileName);
      setJsPdfPreviewOpen(true);
      onHide();
    } catch (err) {
      setErrorMsg("Gagal memuat data. Periksa koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-print text-primary text-xl" />
          <span className="font-bold text-900">Parameter Cetak Laporan</span>
        </div>
      }
      style={{ width: "460px" }}
      modal
      className="p-fluid"
      footer={
        <div className="flex justify-content-end gap-2 pt-2">
          <Button label="Batal" icon="pi pi-times" outlined severity="secondary" onClick={onHide} />
          <Button label="Proses &amp; Cetak PDF" icon="pi pi-file-pdf" loading={loading} onClick={handleGenerate} />
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
            <i className="pi pi-filter mr-1" /> Filter Status
          </label>
          <Dropdown
            value={config.filterStatus}
            options={[
              { label: "Semua Status", value: "Semua" },
              { label: "Aktif Saja",   value: "Aktif"    },
              { label: "Nonaktif",     value: "Nonaktif" },
            ]}
            onChange={(e) => setC("filterStatus", e.value)}
            className="w-full"
          />
        </div>

        <div className="col-6 field">
          <label className="font-medium text-sm text-700 mb-1 block">Ukuran Kertas</label>
          <Dropdown
            value={config.paperSize}
            options={[
              { label: "A4 Standard",  value: "A4"         },
              { label: "F4 / Legal",   value: [215, 330]   },
              { label: "Letter",       value: "Letter"     },
            ]}
            optionLabel="label"
            onChange={(e) => setC("paperSize", e.value)}
            className="w-full"
          />
        </div>

        <div className="col-6 field">
          <label className="font-medium text-sm text-700 mb-1 block">Orientasi</label>
          <Dropdown
            value={config.orientation}
            options={[
              { label: "Portrait (Tegak)",    value: "portrait"  },
              { label: "Landscape (Mendatar)", value: "landscape" },
            ]}
            onChange={(e) => setC("orientation", e.value)}
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
              onValueChange={(e) => setC(key, e.value)}
              min={0} max={50}
              showButtons buttonLayout="stacked"
              className="w-full"
            />
          </div>
        ))}
      </div>
    </Dialog>
  );
};

export default AdjustPrintGajiJabatan;
