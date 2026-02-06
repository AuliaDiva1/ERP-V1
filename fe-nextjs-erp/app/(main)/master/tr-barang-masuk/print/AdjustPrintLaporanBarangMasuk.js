"use client";

import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AdjustPrintLaporanBarangMasuk = ({ 
    adjustDialog, 
    setAdjustDialog, 
    dataToPrint, 
    setPdfUrl, 
    setFileName, 
    setJsPdfPreviewOpen 
}) => {
    const [dateRange, setDateRange] = useState(null);

    const generatePDF = () => {
        // 1. Inisialisasi jsPDF (A4, Portrait)
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // 2. Header Laporan
        doc.setFontSize(16);
        doc.text("LAPORAN MUTASI BARANG MASUK", pageWidth / 2, 15, { align: "center" });
        
        doc.setFontSize(10);
        doc.text(`Tanggal Cetak: ${new Date().toLocaleString("id-ID")}`, 14, 25);
        doc.line(14, 27, pageWidth - 14, 27); // Garis pemisah

        // 3. Mapping Data untuk Tabel
        // Sesuaikan field dengan database Om (item.NAMA_BARANG, item.QTY, dll)
        const tableRows = dataToPrint.map((item, index) => [
            index + 1,
            item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-",
            item.NO_MASUK || "-",
            item.NAMA_BARANG || "-",
            item.QTY || 0,
            item.BATCH_NO || "-",
            item.NAMA_GUDANG || "-"
        ]);

        // 4. Konfigurasi AutoTable
        doc.autoTable({
            startY: 32,
            head: [["No", "Tgl Masuk", "No. Transaksi", "Nama Barang", "Qty", "Batch", "Lokasi"]],
            body: tableRows,
            theme: "grid",
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Warna Biru Professional
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { halign: "center", cellWidth: 10 },
                4: { halign: "right", fontStyle: "bold" }, // Qty tebal & kanan
            },
        });

        // 5. Generate Blob URL untuk Previewer
        const pdfBlob = doc.output("blob");
        const url = URL.createObjectURL(pdfBlob);

        // 6. Kirim ke State Parent
        setFileName(`Laporan_Barang_Masuk_${new Date().getTime()}.pdf`);
        setPdfUrl(url);
        setJsPdfPreviewOpen(true);
        setAdjustDialog(false);
    };

    return (
        <Dialog 
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-print text-primary text-xl"></i>
                    <span className="font-bold">Konfigurasi Cetak Laporan</span>
                </div>
            } 
            visible={adjustDialog} 
            style={{ width: "400px" }} 
            onHide={() => setAdjustDialog(false)}
            footer={
                <div className="flex justify-content-end gap-2">
                    <Button label="Batal" icon="pi pi-times" onClick={() => setAdjustDialog(false)} className="p-button-text p-button-secondary" />
                    <Button label="Generate PDF" icon="pi pi-file-pdf" onClick={generatePDF} className="p-button-success" />
                </div>
            }
        >
            <div className="flex flex-column gap-3 p-2">
                <div className="flex flex-column gap-2">
                    <label className="font-medium text-sm text-600">Total Data Terpilih</label>
                    <div className="p-3 bg-blue-50 border-round border-1 border-blue-100">
                        <span className="text-blue-700 font-bold">{dataToPrint.length} Baris Transaksi</span>
                    </div>
                </div>

                <div className="flex flex-column gap-2">
                    <label className="font-medium text-sm text-600">Filter Tanggal (Opsional)</label>
                    <Calendar 
                        value={dateRange} 
                        onChange={(e) => setDateRange(e.value)} 
                        selectionMode="range" 
                        readOnlyInput 
                        placeholder="Pilih rentang tanggal"
                        className="w-full"
                        showIcon
                    />
                </div>

                <small className="text-500 italic">
                    * PDF akan dibuka di jendela preview setelah proses generate selesai.
                </small>
            </div>
        </Dialog>
    );
};

export default AdjustPrintLaporanBarangMasuk;