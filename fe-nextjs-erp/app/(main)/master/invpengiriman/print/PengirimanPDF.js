import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * ============================================================
 * UTILITY HELPERS
 * ============================================================
 */
const formatDate = (date) => {
    if (!date) return "-";
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(date).toLocaleDateString("id-ID", options);
};

const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("id-ID", {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

/**
 * CORE PDF GENERATOR: SURAT JALAN (PREMIUM EDITION)
 * Berfokus pada estetika, akurasi data master_customer, dan master_perusahaan.
 */
export const generateSuratJalan = (header, details, perusahaan) => {
    // 1. Inisialisasi Dokumen Dasar
    const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        floatPrecision: 16 
    });

    // Properti Metadata
    doc.setProperties({
        title: `SJ-${header.NO_PENGIRIMAN}`,
        subject: 'Surat Jalan Logistik',
        author: perusahaan?.NAMA_PERUSAHAAN || 'Sistem Logistik',
        keywords: 'surat jalan, pengiriman, logistik',
        creator: 'Gemini ERP System'
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const mL = 15; // Margin Kiri
    const mR = 15; // Margin Kanan
    let currentY = 15;

    /**
     * FUNGSI INTERNAL: HEADER DEKORATIF
     * Muncul di setiap halaman jika diperlukan
     */
    const drawHeaderBackground = () => {
        // Background Abu-abu Muda di bagian atas
        doc.setFillColor(245, 247, 250);
        doc.rect(0, 0, pageWidth, 48, 'F');
        
        // Garis aksen biru tipis di paling atas
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, pageWidth, 2, 'F');
    };

    /**
     * FUNGSI INTERNAL: WATERMARK
     */
    const drawWatermark = (text = "ORIGINAL DOCUMENT") => {
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.05 }));
            doc.setFontSize(50);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(150);
            doc.text(text, pageWidth / 2, pageHeight / 2, {
                align: 'center',
                angle: 45
            });
            doc.restoreGraphicsState();
        }
    };

    // Jalankan Header Background
    drawHeaderBackground();

    /**
     * SECTION 1: PROFIL PERUSAHAAN (PENGIRIM)
     */
    // Rendering Logo
    if (perusahaan?.LOGO_PATH) {
        try {
            doc.addImage(perusahaan.LOGO_PATH, "PNG", mL, currentY, 28, 28, 'LOGO_MAIN', 'FAST');
        } catch (e) {
            doc.setDrawColor(200);
            doc.rect(mL, currentY, 28, 28, 'S');
            doc.setFontSize(8);
            doc.text("MISSING LOGO", mL + 14, currentY + 14, { align: 'center' });
        }
    }

    const textStartX = perusahaan?.LOGO_PATH ? mL + 32 : mL;

    // Nama PT
    doc.setTextColor(41, 128, 185);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(perusahaan?.NAMA_PERUSAHAAN?.toUpperCase() || "PT. LOGISTIK JAYA ABADI", textStartX, currentY + 6);

    // Alamat Kantor
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const companyAddr = perusahaan?.ALAMAT_KANTOR || "Alamat kantor pusat belum diatur dalam Master Perusahaan.";
    const splitAddr = doc.splitTextToSize(companyAddr, 90);
    doc.text(splitAddr, textStartX, currentY + 11);

    // Kontak Line
    const contactLineY = currentY + 11 + (splitAddr.length * 4.5);
    doc.setFont("helvetica", "bold");
    doc.text(`Telp: ${perusahaan?.TELEPON || "-"} | WA: ${perusahaan?.WA_HOTLINE || "-"}`, textStartX, contactLineY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Email: ${perusahaan?.EMAIL || "-"} | Web: ${perusahaan?.WEBSITE || "-"}`, textStartX, contactLineY + 4);

    // Judul Dokumen (Kanan Atas)
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("SURAT JALAN", pageWidth - mR, currentY + 10, { align: "right" });
    
    doc.setTextColor(120);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("DELIVERY ORDER", pageWidth - mR, currentY + 16, { align: "right" });

    // Garis Pemisah Utama
    currentY = 52;
    doc.setLineWidth(0.8);
    doc.setDrawColor(41, 128, 185);
    doc.line(mL, currentY, pageWidth - mR, currentY);

    /**
     * SECTION 2: INFORMASI TRANSAKSI & PENERIMA
     */
    currentY += 10;
    
    // Desain Box untuk info
    const boxHeight = 45;
    const boxWidth = (pageWidth / 2) - 20;

    // Box Kiri: Penerima (Data master_customer)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220);
    doc.roundedRect(mL, currentY, boxWidth, boxHeight, 2, 2, 'FD');
    
    // Box Kanan: Detail Dokumen
    doc.roundedRect(pageWidth / 2 + 5, currentY, boxWidth, boxHeight, 2, 2, 'FD');

    // Header Box Kiri
    doc.setFillColor(41, 128, 185);
    doc.rect(mL, currentY, boxWidth, 8, 'F');
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("TUJUAN PENGIRIMAN / PENERIMA", mL + 4, currentY + 5.5);

    // Isi Box Kiri
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(header.NAMA_CUSTOMER || "PELANGGAN UMUM", mL + 4, currentY + 14);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const custAddress = header.ALAMAT || header.ALAMAT_TUJUAN || "Alamat tidak ditemukan";
    const splitCustAddr = doc.splitTextToSize(custAddress, boxWidth - 8);
    doc.text(splitCustAddr, mL + 4, currentY + 20);

    // Info Kontak Customer
    const custContactY = currentY + 20 + (splitCustAddr.length * 4.5);
    doc.setFontSize(8.5);
    doc.setTextColor(80);
    doc.text(`UP/Telp : ${header.NO_TELP || "-"}`, mL + 4, custContactY + 2);
    doc.text(`Email   : ${header.EMAIL || "-"}`, mL + 4, custContactY + 6);

    // Header Box Kanan
    doc.setFillColor(52, 73, 94);
    doc.rect(pageWidth / 2 + 5, currentY, boxWidth, 8, 'F');
    doc.setTextColor(255);
    doc.text("INFORMASI PENGIRIMAN", pageWidth / 2 + 9, currentY + 5.5);

    // Isi Box Kanan
    const rightInfoX = pageWidth / 2 + 9;
    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`No. Dokumen`, rightInfoX, currentY + 14);
    doc.text(`Tanggal`, rightInfoX, currentY + 20);
    doc.text(`Gudang`, rightInfoX, currentY + 26);
    doc.text(`Driver`, rightInfoX, currentY + 32);
    doc.text(`Status`, rightInfoX, currentY + 38);

    doc.setFont("helvetica", "normal");
    doc.text(`: ${header.NO_PENGIRIMAN}`, rightInfoX + 25, currentY + 14);
    doc.text(`: ${formatDate(header.TGL_KIRIM)}`, rightInfoX + 25, currentY + 20);
    doc.text(`: ${perusahaan?.ALAMAT_GUDANG?.substring(0, 25) || "Gudang Utama"}`, rightInfoX + 25, currentY + 26);
    doc.text(`: ${header.NAMA_DRIVER || "-"}`, rightInfoX + 25, currentY + 32);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text(`: ${header.STATUS_KIRIM || "Diproses"}`, rightInfoX + 25, currentY + 38);

    currentY += boxHeight + 8;

    /**
     * SECTION 3: TABEL DATA BARANG
     */
    autoTable(doc, {
        startY: currentY,
        head: [['NO', 'KODE BARANG', 'NAMA PRODUK / DESKRIPSI', 'LOKASI', 'QTY', 'SATUAN']],
        body: details.map((item, index) => [
            { content: index + 1, styles: { halign: 'center' } },
            item.BARANG_KODE,
            item.NAMA_BARANG || "Produk tidak dikenal",
            `${item.KODE_GUDANG || '-'} / ${item.KODE_RAK || '-'}`,
            { content: Number(item.QTY).toLocaleString('id-ID'), styles: { halign: 'right', fontStyle: 'bold' } },
            item.KODE_SATUAN || "PCS"
        ]),
        headStyles: { 
            fillColor: [41, 128, 185], 
            textColor: 255, 
            fontSize: 10, 
            fontStyle: 'bold', 
            halign: 'center',
            cellPadding: 4 
        },
        bodyStyles: { 
            fontSize: 9, 
            cellPadding: 3,
            textColor: 40 
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: mL, right: mR },
        styles: { lineColor: [230, 230, 230], lineWidth: 0.1 },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 35 },
            2: { cellWidth: 65 },
            3: { cellWidth: 30 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 },
        },
    });

    /**
     * SECTION 4: AREA TANDA TANGAN (SIGNATURE SECTION)
     */
    let finalY = doc.lastAutoTable.finalY + 12;

    // Proteksi jika sisa halaman tidak cukup untuk tanda tangan
    if (finalY + 65 > pageHeight) {
        doc.addPage();
        drawHeaderBackground();
        finalY = 30;
    }

    const colWidth = (pageWidth - mL - mR) / 3;

    // Layout Tanda Tangan
    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Penerima
    doc.text("Diterima Oleh,", mL + (colWidth / 2), finalY, { align: "center" });
    doc.text("( ____________________ )", mL + (colWidth / 2), finalY + 28, { align: "center" });
    doc.setFontSize(7.5);
    doc.text("Stempel & Nama Jelas", mL + (colWidth / 2), finalY + 32, { align: "center" });

    // Kurir
    doc.setFontSize(9);
    doc.text("Sopir / Kurir,", mL + colWidth + (colWidth / 2), finalY, { align: "center" });
    doc.text("( ____________________ )", mL + colWidth + (colWidth / 2), finalY + 28, { align: "center" });
    doc.setFontSize(7.5);
    doc.text("Petugas Pengirim", mL + colWidth + (colWidth / 2), finalY + 32, { align: "center" });

    // Pimpinan / Admin
    doc.setFontSize(9);
    const kotaTgl = `${perusahaan?.KOTA_TERBIT || "Indonesia"}, ${formatDate(new Date())}`;
    doc.text(kotaTgl, mL + (colWidth * 2) + (colWidth / 2), finalY - 5, { align: "center" });
    doc.text(perusahaan?.JABATAN_PIMPINAN || "Hormat Kami,", mL + (colWidth * 2) + (colWidth / 2), finalY, { align: "center" });
    
    doc.setFont("helvetica", "bold");
    doc.text(`( ${perusahaan?.NAMA_PIMPINAN || "Admin Logistik"} )`, mL + (colWidth * 2) + (colWidth / 2), finalY + 28, { align: "center" });

    /**
     * SECTION 5: FOOTER NOTES & SECURITY
     */
    const notesY = finalY + 45;
    doc.setDrawColor(230);
    doc.line(mL, notesY, pageWidth - mR, notesY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(100);
    doc.text("Catatan:", mL, notesY + 5);
    doc.text("1. Barang yang sudah diterima tidak dapat ditukar/dikembalikan tanpa perjanjian sebelumnya.", mL, notesY + 9);
    doc.text("2. Surat jalan ini merupakan bukti sah serah terima barang antara pengirim dan penerima.", mL, notesY + 13);

    // Digital Stamp / Log
    const bottomY = pageHeight - 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(180);
    const digitalLog = `System Log: ${header.NO_PENGIRIMAN} | Generated by ERP | ${formatDate(new Date())} ${formatTime(new Date())}`;
    doc.text(digitalLog, mL, bottomY);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - mR, bottomY, { align: "right" });

    // Terapkan Watermark di akhir
    drawWatermark("PT. LOGISTIK JAYA ABADI");

    return doc;
};