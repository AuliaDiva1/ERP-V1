"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const paperSizes = [
  { name: "A4", value: "a4" },
  { name: "F4 (Legal)", value: [210, 330] },
  { name: "Letter", value: "letter" },
];

const orientationOptions = [
  { label: "Portrait", value: "portrait" },
  { label: "Landscape", value: "landscape" },
];

// Mapping label kolom agar bisa digunakan di MultiSelect dan Header Tabel
const columnOptions = [
  { label: "No Surat Jalan", value: "NO_PENGIRIMAN" },
  { label: "Tanggal Kirim", value: "TGL_KIRIM" },
  { label: "Customer", value: "NAMA_CUSTOMER" },
  { label: "Alamat Tujuan", value: "ALAMAT_TUJUAN" },
  { label: "Status Kirim", value: "STATUS_KIRIM" },
];

export default function AdjustPrintPengiriman({
  adjustDialog,
  setAdjustDialog,
  dataToPrint,
  setPdfUrl,
  setFileName,
  setJsPdfPreviewOpen,
  judulLaporan = "LAPORAN PENGIRIMAN BARANG (SURAT JALAN)",
  namaPenandatangan = "Kepala Gudang",
}) {
  const [config, setConfig] = useState({
    marginTop: 15,
    marginBottom: 15,
    marginRight: 10,
    marginLeft: 10,
    paperSize: "a4",
    orientation: "portrait",
    selectedColumns: ["NO_PENGIRIMAN", "TGL_KIRIM", "NAMA_CUSTOMER", "ALAMAT_TUJUAN", "STATUS_KIRIM"],
  });

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: config.orientation,
      unit: "mm",
      format: config.paperSize,
      putOnlyUsedFonts: true
    });

    const pageWidth = doc.internal.pageSize.width;
    const { marginLeft: mL, marginTop: mT, marginRight: mR } = config;

    // 1. HEADER (KOP SEDERHANA)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(judulLaporan.toUpperCase(), pageWidth / 2, mT, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(mL, mT + 2, pageWidth - mR, mT + 2); // Garis dekorasi bawah judul

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const tglSekarang = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Periode Laporan: s/d ${tglSekarang}`, pageWidth / 2, mT + 9, { align: "center" });

    // 2. MAPPING KOLOM
    const headersMap = {
      NO_PENGIRIMAN: "No. Surat Jalan",
      TGL_KIRIM: "Tgl Kirim",
      NAMA_CUSTOMER: "Customer",
      ALAMAT_TUJUAN: "Alamat Tujuan",
      STATUS_KIRIM: "Status"
    };

    const tableColumn = config.selectedColumns.map((col) => ({
      header: headersMap[col] || col,
      dataKey: col
    }));

    // 3. MAPPING DATA BODY
    const tableRows = dataToPrint.map((item) => ({
      ...item,
      TGL_KIRIM: item.TGL_KIRIM ? new Date(item.TGL_KIRIM).toLocaleDateString("id-ID") : "-",
      STATUS_KIRIM: item.STATUS_KIRIM?.toUpperCase() || "DIPROSES"
    }));

    autoTable(doc, {
      startY: mT + 18,
      columns: tableColumn,
      body: tableRows,
      margin: { left: mL, right: mR, bottom: config.marginBottom },
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255, 
        halign: 'center',
        fontSize: 9
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 3, 
        overflow: 'linebreak',
        valign: 'middle'
      },
      columnStyles: {
        NO_PENGIRIMAN: { cellWidth: 35 },
        STATUS_KIRIM: { halign: 'center', cellWidth: 25 },
        TGL_KIRIM: { halign: 'center', cellWidth: 25 }
      },
      didParseCell: function (data) {
          // Memberi warna teks berbeda untuk status tertentu jika perlu
          if (data.column.dataKey === 'STATUS_KIRIM' && data.cell.section === 'body') {
              if (data.cell.raw === 'BATAL') data.cell.styles.textColor = [231, 76, 60];
          }
      }
    });

    // 4. AREA TANDA TANGAN
    const finalY = doc.lastAutoTable.finalY + 15;
    const signX = pageWidth - mR - 50;
    
    // Cek jika tanda tangan keluar dari halaman
    if (finalY + 35 > doc.internal.pageSize.height) {
        doc.addPage();
    }

    const currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(9);
    doc.text(`Dicetak pada: ${tglSekarang}`, mL, currentY);
    
    doc.text("Petugas Logistik,", signX, currentY);
    
    doc.setFont("helvetica", "bold");
    doc.text(namaPenandatangan, signX, currentY + 25);
    doc.setLineWidth(0.3);
    doc.line(signX, currentY + 26, signX + 45, currentY + 26);

    return doc;
  };

  const handleGenerate = () => {
    if (config.selectedColumns.length === 0) {
        alert("Pilih minimal satu kolom untuk ditampilkan!");
        return;
    }
    const doc = generatePDF();
    setPdfUrl(doc.output("datauristring"));
    setFileName(`Laporan_Pengiriman_${Date.now()}.pdf`);
    setJsPdfPreviewOpen(true);
    setAdjustDialog(false);
  };

  return (
    <Dialog 
      visible={adjustDialog} 
      onHide={() => setAdjustDialog(false)} 
      header={
        <div className="flex align-items-center gap-2">
            <i className="pi pi-print text-primary text-xl"></i>
            <span className="font-bold">Pengaturan Cetak Laporan</span>
        </div>
      } 
      style={{ width: "90vw", maxWidth: "500px" }} 
      modal 
      footer={
        <div className="flex justify-content-end gap-2">
            <Button label="Batal" icon="pi pi-times" className="p-button-text p-button-secondary" onClick={() => setAdjustDialog(false)} />
            <Button label="Preview PDF" icon="pi pi-file-pdf" severity="danger" onClick={handleGenerate} />
        </div>
      }>
      
      <div className="flex flex-column gap-4 p-2">
        <div className="field">
          <label className="font-bold block mb-2 text-sm">Pilih Kolom Tabel</label>
          <MultiSelect 
            value={config.selectedColumns} 
            options={columnOptions} 
            onChange={(e) => setConfig({...config, selectedColumns: e.value})} 
            className="w-full"
            display="chip"
            placeholder="Pilih Kolom"
          />
        </div>
        
        <div className="grid">
            <div className="col-6 field">
                <label className="font-bold block mb-2 text-sm">Ukuran Kertas</label>
                <Dropdown 
                    value={config.paperSize} 
                    options={paperSizes} 
                    optionLabel="name" 
                    optionValue="value"
                    onChange={(e) => setConfig({...config, paperSize: e.value})} 
                    className="w-full" 
                />
            </div>
            <div className="col-6 field">
                <label className="font-bold block mb-2 text-sm">Orientasi</label>
                <Dropdown 
                    value={config.orientation} 
                    options={orientationOptions} 
                    onChange={(e) => setConfig({...config, orientation: e.value})} 
                    className="w-full" 
                />
            </div>
        </div>

        <div className="surface-ground p-3 border-round border-1 border-200">
            <div className="flex align-items-start gap-3">
                <i className="pi pi-info-circle text-blue-500 mt-1"></i>
                <span className="text-xs text-700 line-height-3">
                    Gunakan pengaturan ini untuk menyesuaikan tampilan laporan PDF. 
                    Pastikan orientasi <b>Landscape</b> dipilih jika kolom yang ditampilkan cukup banyak.
                </span>
            </div>
        </div>
      </div>
    </Dialog>
  );
}