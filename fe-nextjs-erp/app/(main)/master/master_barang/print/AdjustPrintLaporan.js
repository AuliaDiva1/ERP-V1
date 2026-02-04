"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// 1. Definisikan kolom sesuai NAMA_KOLOM di database (Flat Structure)
const allColumnOptions = [
  { name: "Kode Barang", value: "BARANG_KODE" },
  { name: "Nama Barang", value: "NAMA_BARANG" },
  { name: "Jenis", value: "NAMA_JENIS" }, 
  { name: "Satuan", value: "NAMA_SATUAN" }, 
  { name: "Stok Minimal", value: "STOK_MINIMAL" },
  { name: "Stok Saat Ini", value: "STOK_SAAT_INI" },
  { name: "Harga Beli", value: "HARGA_BELI_TERAKHIR" },
  { name: "Status", value: "STATUS" },
];

const defaultSelectedColumns = [
  "BARANG_KODE",
  "NAMA_BARANG",
  "NAMA_JENIS",
  "NAMA_SATUAN",
  "STOK_SAAT_INI",
  "STATUS",
];

const paperSizes = [
  { name: "A4", value: "A4" },
  { name: "F4", value: [210, 330] },
  { name: "Letter", value: "Letter" },
];

export default function AdjustPrintLaporan({
  adjustDialog,
  setAdjustDialog,
  dataToPrint,
  setPdfUrl,
  setFileName,
  setJsPdfPreviewOpen,
  judulLaporan = "LAPORAN DATA MASTER BARANG",
  namaPenandatangan = "Kepala Gudang",
}) {
  const [config, setConfig] = useState({
    marginTop: 15,
    marginBottom: 15,
    marginRight: 10,
    marginLeft: 10,
    paperSize: "A4",
    orientation: "portrait",
    selectedColumns: defaultSelectedColumns,
  });

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: config.orientation,
      unit: "mm",
      format: config.paperSize,
    });

    const pageWidth = doc.internal.pageSize.width;
    const { marginLeft: mL, marginTop: mT, marginRight: mR, marginBottom: mB } = config;

    // --- Header ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(judulLaporan, pageWidth / 2, mT, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Sistem Manajemen Inventaris Barang", pageWidth / 2, mT + 6, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(mL, mT + 10, pageWidth - mR, mT + 10);

    // --- Table Column Mapping (SAFE CHECK) ---
    const tableColumn = config.selectedColumns.map((colValue) => {
      const colConfig = allColumnOptions.find((c) => c.value === colValue);
      // Pencegahan error 'name' of undefined
      return { 
        header: colConfig ? colConfig.name : colValue, 
        dataKey: colValue 
      };
    });

    // --- Table Rows Data Mapping ---
    const tableRows = dataToPrint.map((item) => {
      const row = {};
      config.selectedColumns.forEach((colKey) => {
        let val = item[colKey];
        
        // Format Rupiah khusus kolom harga
        if (colKey === "HARGA_BELI_TERAKHIR") {
          val = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val || 0);
        }
        
        row[colKey] = (val !== null && val !== undefined) ? val : "-";
      });
      return row;
    });

    autoTable(doc, {
      startY: mT + 18,
      columns: tableColumn,
      body: tableRows,
      margin: { left: mL, right: mR, bottom: mB },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
    });

    // --- Tanda Tangan ---
    const finalY = doc.lastAutoTable.finalY + 15;
    const ttdX = pageWidth - mR - 50;
    
    doc.setFontSize(10);
    doc.text("Mengetahui,", ttdX, finalY);
    doc.text("Kepala Gudang,", ttdX, finalY + 5);
    
    doc.setFont("helvetica", "bold");
    doc.text(namaPenandatangan, ttdX, finalY + 25);
    doc.setLineWidth(0.2);
    doc.line(ttdX, finalY + 26, ttdX + 45, finalY + 26);

    return doc;
  };

  const handleGenerate = () => {
    if (!dataToPrint || dataToPrint.length === 0) return;
    try {
      const doc = generatePDF();
      setPdfUrl(doc.output("datauristring"));
      setFileName(`Laporan_Barang_${new Date().getTime()}.pdf`);
      setJsPdfPreviewOpen(true);
      setAdjustDialog(false);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    }
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={() => setAdjustDialog(false)} />
      <Button label="Proses PDF" icon="pi pi-file-pdf" onClick={handleGenerate} />
    </div>
  );

  return (
    <Dialog visible={adjustDialog} onHide={() => setAdjustDialog(false)} header="Pengaturan Cetak" style={{ width: "450px" }} modal footer={footer}>
      <div className="grid p-fluid">
        <div className="col-12 field">
          <label className="font-bold mb-2 block">Pilih Kolom Laporan</label>
          <MultiSelect 
            value={config.selectedColumns} 
            options={allColumnOptions} 
            onChange={(e) => setConfig({ ...config, selectedColumns: e.value })} 
            optionLabel="name" 
            optionValue="value" 
            display="chip" 
            placeholder="Pilih Kolom"
          />
        </div>
        <div className="col-6 field">
          <label className="font-bold mb-2 block">Kertas</label>
          <Dropdown value={config.paperSize} options={paperSizes} onChange={(e) => setConfig({ ...config, paperSize: e.value })} optionLabel="name" />
        </div>
        <div className="col-6 field">
          <label className="font-bold mb-2 block">Orientasi</label>
          <Dropdown 
            value={config.orientation} 
            options={[{label: 'Potrait', value: 'portrait'}, {label: 'Landscape', value: 'landscape'}]} 
            onChange={(e) => setConfig({ ...config, orientation: e.value })} 
          />
        </div>
      </div>
    </Dialog>
  );
}