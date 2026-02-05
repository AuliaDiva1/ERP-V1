"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
  judulLaporan = "LAPORAN PEMBELIAN BARANG",
  namaPenandatangan = "Admin Gudang",
}) {
  const [config, setConfig] = useState({
    marginTop: 15,
    marginBottom: 15,
    marginRight: 10,
    marginLeft: 10,
    paperSize: "A4",
    orientation: "portrait",
    // Tambahkan ALAMAT_VENDOR di sini
    selectedColumns: ["NO_INVOICE_BELI", "NAMA_VENDOR", "ALAMAT_VENDOR", "TGL_INVOICE", "TOTAL_BAYAR", "STATUS_BAYAR"],
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: config.orientation,
      unit: "mm",
      format: config.paperSize,
    });

    const pageWidth = doc.internal.pageSize.width;
    const { marginLeft: mL, marginTop: mT, marginRight: mR } = config;

    // 1. HEADER
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(judulLaporan.toUpperCase(), pageWidth / 2, mT, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const tglSekarang = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Periode: ${tglSekarang}`, pageWidth / 2, mT + 7, { align: "center" });

    // 2. MAPPING KOLOM
    const tableColumn = config.selectedColumns.map((col) => {
      const headers = {
        NO_INVOICE_BELI: "No. Invoice",
        NAMA_VENDOR: "Vendor",
        ALAMAT_VENDOR: "Alamat Vendor", // Header Alamat
        TGL_INVOICE: "Tgl Invoice",
        TOTAL_BAYAR: "Total (Rp)",
        SISA_TAGIHAN: "Sisa (Rp)",
        STATUS_BAYAR: "Status"
      };
      return { header: headers[col] || col, dataKey: col };
    });

    // 3. MAPPING DATA BODY
    const tableRows = dataToPrint.map((item) => ({
      ...item,
      // Pastikan field ALAMAT_VENDOR ada di dataToPrint, jika tidak ada tampilkan "-"
      ALAMAT_VENDOR: item.ALAMAT_VENDOR || "-", 
      TGL_INVOICE: item.TGL_INVOICE ? new Date(item.TGL_INVOICE).toLocaleDateString("id-ID") : "-",
      TOTAL_BAYAR: formatCurrency(item.TOTAL_BAYAR),
      SISA_TAGIHAN: formatCurrency(item.SISA_TAGIHAN),
    }));

    // Hitung Grand Total
    const grandTotal = dataToPrint.reduce((sum, item) => sum + (parseFloat(item.TOTAL_BAYAR) || 0), 0);

    autoTable(doc, {
      startY: mT + 15,
      columns: tableColumn,
      body: tableRows,
      margin: { left: mL, right: mR },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
      foot: [
        config.selectedColumns.map((col, index) => {
          if (index === 0) return "TOTAL KESELURUHAN";
          if (col === "TOTAL_BAYAR") return formatCurrency(grandTotal);
          return "";
        })
      ],
      footStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold', halign: 'right' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        TOTAL_BAYAR: { halign: 'right' },
        SISA_TAGIHAN: { halign: 'right' },
        ALAMAT_VENDOR: { cellWidth: 40 } // Berikan lebar lebih untuk alamat
      }
    });

    // 4. TANDA TANGAN
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${tglSekarang}`, mL, finalY);

    const signX = pageWidth - mR - 50;
    doc.text("Disetujui Oleh,", signX, finalY);
    doc.setFont("helvetica", "bold");
    doc.text(namaPenandatangan, signX, finalY + 25);
    doc.setLineWidth(0.5);
    doc.line(signX, finalY + 26, signX + 40, finalY + 26); // Garis bawah ttd

    return doc;
  };

  const handleGenerate = () => {
    const doc = generatePDF();
    setPdfUrl(doc.output("datauristring"));
    setFileName(`Laporan_Pembelian_${Date.now()}.pdf`);
    setJsPdfPreviewOpen(true);
    setAdjustDialog(false);
  };

  return (
    <Dialog visible={adjustDialog} onHide={() => setAdjustDialog(false)} header="Pengaturan Cetak Laporan" style={{ width: "450px" }} modal footer={(
        <div className="flex justify-content-end gap-2">
            <Button label="Batal" className="p-button-text p-button-secondary" onClick={() => setAdjustDialog(false)} />
            <Button label="Generate PDF" icon="pi pi-file-pdf" severity="danger" onClick={handleGenerate} />
        </div>
    )}>
      <div className="flex flex-column gap-4">
        <div className="field">
          <label className="font-bold block mb-2">Kolom Laporan</label>
          <MultiSelect 
            value={config.selectedColumns} 
            options={[
                {label: "No Invoice", value: "NO_INVOICE_BELI"},
                {label: "Vendor", value: "NAMA_VENDOR"},
                {label: "Alamat Vendor", value: "ALAMAT_VENDOR"},
                {label: "Tanggal", value: "TGL_INVOICE"},
                {label: "Total Bayar", value: "TOTAL_BAYAR"},
                {label: "Sisa Tagihan", value: "SISA_TAGIHAN"},
                {label: "Status", value: "STATUS_BAYAR"},
            ]} 
            onChange={(e) => setConfig({...config, selectedColumns: e.value})} 
            className="w-full"
            display="chip"
          />
        </div>
        
        <div className="flex gap-3">
            <div className="flex-1 field">
                <label className="font-bold block mb-2">Kertas</label>
                <Dropdown value={config.paperSize} options={paperSizes} optionLabel="name" onChange={(e) => setConfig({...config, paperSize: e.value})} className="w-full" />
            </div>
            <div className="flex-1 field">
                <label className="font-bold block mb-2">Orientasi</label>
                <Dropdown value={config.orientation} options={orientationOptions} onChange={(e) => setConfig({...config, orientation: e.value})} className="w-full" />
            </div>
        </div>
      </div>
    </Dialog>
  );
}