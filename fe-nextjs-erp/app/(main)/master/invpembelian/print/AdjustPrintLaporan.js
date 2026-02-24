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
  masterData, // <-- Pastikan ini dikirim dari PembelianPage
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
    // --- DEBUGGING AREA (Cek F12 Console) ---
    console.log("Data Laporan:", dataToPrint);
    console.log("Master Vendor:", masterData?.vendors);

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
    doc.text(`Dicetak pada: ${tglSekarang}`, pageWidth / 2, mT + 7, { align: "center" });

    // 2. MAPPING KOLOM
    const tableColumn = config.selectedColumns.map((col) => {
      const headers = {
        NO_INVOICE_BELI: "No. Invoice",
        NAMA_VENDOR: "Vendor",
        ALAMAT_VENDOR: "Alamat Vendor", 
        TGL_INVOICE: "Tgl Invoice",
        TOTAL_BAYAR: "Total (Rp)",
        SISA_TAGIHAN: "Sisa (Rp)",
        STATUS_BAYAR: "Status"
      };
      return { header: headers[col] || col, dataKey: col };
    });

    // 3. MAPPING DATA BODY (DENGAN LOOKUP ALAMAT)
    const tableRows = dataToPrint.map((item) => {
      // Cari data vendor di masterData.vendors berdasarkan VENDOR_ID atau NAMA_VENDOR
      const vendorInfo = masterData?.vendors?.find(v => 
        (v.VENDOR_ID && item.VENDOR_ID && v.VENDOR_ID === item.VENDOR_ID) || 
        (v.NAMA_VENDOR && item.NAMA_VENDOR && v.NAMA_VENDOR === item.NAMA_VENDOR)
      );

      return {
        ...item,
        // Jika alamat tidak ada di item transaksi, ambil dari master vendor
        ALAMAT_VENDOR: item.ALAMAT_VENDOR || vendorInfo?.ALAMAT_VENDOR || "Alamat -", 
        TGL_INVOICE: item.TGL_INVOICE ? new Date(item.TGL_INVOICE).toLocaleDateString("id-ID") : "-",
        TOTAL_BAYAR: formatCurrency(item.TOTAL_BAYAR),
        SISA_TAGIHAN: formatCurrency(item.SISA_TAGIHAN),
      };
    });

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
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold', halign: 'right' },
      styles: { 
        fontSize: 8, 
        cellPadding: 3, 
        overflow: 'linebreak' // Agar alamat panjang turun ke bawah
      },
      columnStyles: {
        ALAMAT_VENDOR: { cellWidth: 50 }, // Lebar khusus alamat agar tidak sempit
        TOTAL_BAYAR: { halign: 'right' },
        SISA_TAGIHAN: { halign: 'right' },
        STATUS_BAYAR: { halign: 'center' }
      }
    });

    // 4. AREA TANDA TANGAN
    const finalY = doc.lastAutoTable.finalY + 15;
    const signX = pageWidth - mR - 50;
    
    doc.setFontSize(10);
    doc.text("Gresik, " + tglSekarang, signX, finalY);
    doc.text("Disetujui Oleh,", signX, finalY + 7);
    
    doc.setFont("helvetica", "bold");
    doc.text(namaPenandatangan, signX, finalY + 30);
    doc.setLineWidth(0.3);
    doc.line(signX, finalY + 31, signX + 45, finalY + 31); // Garis Tanda Tangan

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
    <Dialog 
      visible={adjustDialog} 
      onHide={() => setAdjustDialog(false)} 
      header={<div className="flex align-items-center gap-2"><i className="pi pi-print text-primary"></i><span>Pengaturan Cetak Laporan</span></div>} 
      style={{ width: "480px" }} 
      modal 
      footer={(
        <div className="flex justify-content-end gap-2">
            <Button label="Batal" icon="pi pi-times" className="p-button-text p-button-secondary" onClick={() => setAdjustDialog(false)} />
            <Button label="Generate PDF" icon="pi pi-file-pdf" severity="danger" onClick={handleGenerate} />
        </div>
    )}>
      <div className="flex flex-column gap-4 p-2">
        <div className="field">
          <label className="font-bold block mb-2">Kolom Yang Ditampilkan</label>
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
            placeholder="Pilih Kolom"
          />
        </div>
        
        <div className="grid">
            <div className="col-6 field">
                <label className="font-bold block mb-2">Ukuran Kertas</label>
                <Dropdown value={config.paperSize} options={paperSizes} optionLabel="name" onChange={(e) => setConfig({...config, paperSize: e.value})} className="w-full" />
            </div>
            <div className="col-6 field">
                <label className="font-bold block mb-2">Orientasi</label>
                <Dropdown value={config.orientation} options={orientationOptions} onChange={(e) => setConfig({...config, orientation: e.value})} className="w-full" />
            </div>
        </div>

        <div className="surface-100 p-3 border-round">
            <span className="text-sm text-600"><i className="pi pi-info-circle mr-2"></i>Alamat vendor diambil otomatis dari Master Vendor jika tidak tersedia di data transaksi.</span>
        </div>
      </div>
    </Dialog>
  );
}