"use client";

import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// 1. Definisikan opsi kolom khusus untuk GUDANG
const gudangColumnOptions = [
  { name: "Kode Gudang", value: "KODE_GUDANG", dataKey: "KODE_GUDANG" },
  { name: "Nama Gudang", value: "NAMA_GUDANG", dataKey: "NAMA_GUDANG" },
  { name: "Alamat", value: "ALAMAT", dataKey: "ALAMAT" },
  { name: "Status", value: "STATUS", dataKey: "STATUS" },
  { name: "Tgl Dibuat", value: "created_at", dataKey: "created_at" },
];

const paperSizes = [
  { name: "A4", value: "A4" },
  { name: "F4 (Legal)", value: [210, 330] },
  { name: "Letter", value: "Letter" },
];

const orientationOptions = [
  { label: "Portrait", value: "portrait" },
  { label: "Landscape", value: "landscape" },
];

export default function AdjustPrintLaporan({
  adjustDialog,
  setAdjustDialog,
  dataToPrint,
  setPdfUrl,
  setFileName,
  setJsPdfPreviewOpen,
  judulLaporan = "LAPORAN DATA MASTER GUDANG",
  namaPenandatangan,
  jabatanPenandatangan = "Manajer Operasional",
}) {
  const [config, setConfig] = useState({
    marginTop: 15,
    marginBottom: 15,
    marginRight: 10,
    marginLeft: 10,
    paperSize: "A4",
    orientation: "portrait",
    selectedColumns: ["KODE_GUDANG", "NAMA_GUDANG", "ALAMAT", "STATUS"], // Default Gudang
  });

  const onChangeNumber = (e, name) => {
    setConfig((prev) => ({ ...prev, [name]: e.value || 0 }));
  };

  const onChangeSelect = (e, name) => {
    setConfig((prev) => ({ ...prev, [name]: e.value }));
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: config.orientation,
      unit: "mm",
      format: config.paperSize,
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const { marginLeft: mL, marginTop: mT, marginRight: mR, marginBottom: mB } = config;

    let currentY = mT;

    // --- Header ---
    doc.setTextColor(44, 62, 80); // Warna Biru Gelap Profesional
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(judulLaporan, pageWidth / 2, currentY, { align: "center" });
    
    currentY += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Sistem Manajemen Inventaris (WMS)", pageWidth / 2, currentY, { align: "center" });

    currentY += 5;
    doc.setDrawColor(44, 62, 80);
    doc.setLineWidth(0.5);
    doc.line(mL, currentY, pageWidth - mR, currentY);
    currentY += 10;

    // --- Table Configuration ---
    const tableColumn = config.selectedColumns.map((colValue) => {
      const colConfig = gudangColumnOptions.find((c) => c.value === colValue);
      return { header: colConfig.name, dataKey: colConfig.dataKey };
    });

    const tableRows = dataToPrint.map((item) => {
      const row = {};
      config.selectedColumns.forEach((colKey) => {
        let val = item[colKey] || "-";
        
        // Format Tanggal jika created_at
        if (colKey === "created_at" && val !== "-") {
            val = new Date(val).toLocaleDateString("id-ID");
        }
        row[colKey] = val;
      });
      return row;
    });

    autoTable(doc, {
      startY: currentY,
      columns: tableColumn,
      body: tableRows,
      margin: { left: mL, right: mR, bottom: mB },
      styles: { fontSize: 9, cellPadding: 3, font: "helvetica" },
      headStyles: { 
        fillColor: [52, 73, 94], // Warna Header Tabel Profesional
        textColor: [255, 255, 255], 
        halign: "center",
        fontStyle: "bold"
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.text(
          `Halaman ${doc.internal.getCurrentPageInfo().pageNumber}`,
          pageWidth - mR,
          pageHeight - 5,
          { align: "right" }
        );
      },
    });

    // --- Tanda Tangan ---
    const finalY = doc.lastAutoTable.finalY;
    const ttdX = pageWidth - mR - 50;
    let ttdY = finalY + 15;

    // Cek jika ttd melewati batas kertas
    if (ttdY > pageHeight - 40) {
      doc.addPage();
      ttdY = mT + 10;
    }

    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak pada: ${today}`, mL, finalY + 10);
    
    doc.text("Dibuat Oleh,", ttdX, ttdY);
    doc.text(jabatanPenandatangan + ",", ttdX, ttdY + 5);
    
    ttdY += 20;
    doc.setFont("helvetica", "bold");
    doc.text(namaPenandatangan || "____________________", ttdX, ttdY);

    return doc;
  };

  const handleGenerate = () => {
    if (!dataToPrint || dataToPrint.length === 0) return;
    const doc = generatePDF();
    setPdfUrl(doc.output("datauristring"));
    setFileName(`${judulLaporan.replace(/ /g, "_")}.pdf`);
    setJsPdfPreviewOpen(true);
    setAdjustDialog(false);
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={() => setAdjustDialog(false)} />
      <Button label="Preview Laporan" icon="pi pi-file-pdf" severity="primary" onClick={handleGenerate} />
    </div>
  );

  return (
    <Dialog 
        visible={adjustDialog} 
        onHide={() => setAdjustDialog(false)} 
        header={<div className="flex align-items-center gap-2"><i className="pi pi-print"></i> Pengaturan Cetak</div>} 
        style={{ width: "450px" }} 
        modal 
        footer={footer}
        draggable={false}
    >
      <div className="grid p-fluid">
        <div className="col-12 field">
          <label className="font-bold mb-2 block">Pilih Kolom Laporan</label>
          <MultiSelect 
            value={config.selectedColumns} 
            options={gudangColumnOptions} 
            onChange={(e) => onChangeSelect(e, "selectedColumns")} 
            optionLabel="name" 
            optionValue="value" 
            display="chip" 
            placeholder="Pilih Kolom"
          />
        </div>
        <div className="col-6 field">
          <label className="font-bold mb-2 block">Kertas</label>
          <Dropdown value={config.paperSize} options={paperSizes} onChange={(e) => onChangeSelect(e, "paperSize")} optionLabel="name" />
        </div>
        <div className="col-6 field">
          <label className="font-bold mb-2 block">Orientasi</label>
          <Dropdown value={config.orientation} options={orientationOptions} onChange={(e) => onChangeSelect(e, "orientation")} />
        </div>
        <div className="col-6 field">
          <label className="font-bold mb-2 block">Margin Atas (mm)</label>
          <InputNumber value={config.marginTop} onChange={(e) => onChangeNumber(e, "marginTop")} showButtons min={0} suffix=" mm" />
        </div>
        <div className="col-6 field">
          <label className="font-bold mb-2 block">Margin Kiri (mm)</label>
          <InputNumber value={config.marginLeft} onChange={(e) => onChangeNumber(e, "marginLeft")} showButtons min={0} suffix=" mm" />
        </div>
      </div>
    </Dialog>
  );
}