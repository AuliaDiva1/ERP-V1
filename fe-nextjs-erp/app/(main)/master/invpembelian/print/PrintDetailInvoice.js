import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateFakturPDF = (dataInvoice, dataDetail, dataPembayaran = []) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "A4",
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const mL = 15;
  let currentY = 20;

  // --- 1. HEADER ATAS ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FAKTUR PEMBELIAN", pageWidth / 2, currentY, { align: "center" });
  
  currentY += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Laporan Penerimaan Barang & Detail Pembayaran", pageWidth / 2, currentY, { align: "center" });

  currentY += 5;
  doc.setLineWidth(0.5);
  doc.line(mL, currentY, pageWidth - mL, currentY);

  // --- 2. INFORMASI INVOICE & VENDOR ---
  currentY += 10;
  
  // Kiri: Info Invoice
  doc.setFont("helvetica", "bold");
  doc.text("INFORMASI INVOICE:", mL, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`No. Invoice : ${dataInvoice.NO_INVOICE_BELI || "-"}`, mL, currentY + 7);
  doc.text(`Tgl Invoice : ${dataInvoice.TGL_INVOICE ? new Date(dataInvoice.TGL_INVOICE).toLocaleDateString("id-ID") : "-"}`, mL, currentY + 12);
  
  const status = dataInvoice.STATUS_BAYAR || "Belum Lunas";
  doc.text("Status      : ", mL, currentY + 17);
  if (status.toUpperCase() !== "LUNAS") doc.setTextColor(200, 0, 0); 
  doc.setFont("helvetica", "bold");
  doc.text(status.toUpperCase(), mL + 22, currentY + 17);
  doc.setTextColor(0, 0, 0); 

  // Kanan: Vendor
  const col2X = pageWidth / 2;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("VENDOR / SUPPLIER:", col2X, currentY);
  doc.text(`${dataInvoice.NAMA_VENDOR || dataInvoice.VENDOR_ID || "-"}`, col2X, currentY + 7);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(dataInvoice.ALAMAT_VENDOR || "Alamat Vendor tidak tersedia", col2X, currentY + 12, { maxWidth: 80 });

  currentY += 30;

  // --- 3. TABEL DETAIL BARANG ---
  const tableColumn = [
    { header: "Barang", dataKey: "barang" },
    { header: "Batch", dataKey: "batch" },
    { header: "Exp Date", dataKey: "exp" },
    { header: "Qty", dataKey: "qty" },
    { header: "Harga", dataKey: "harga" },
    { header: "Subtotal", dataKey: "subtotal" },
  ];

  const tableRows = (dataDetail || []).map((item) => ({
    barang: item.NAMA_BARANG || item.BARANG_KODE,
    batch: item.BATCH_NO || "-",
    exp: item.TGL_KADALUARSA ? new Date(item.TGL_KADALUARSA).toLocaleDateString("id-ID") : "-",
    qty: `${item.QTY_BELI || 0}`,
    harga: new Intl.NumberFormat("id-ID").format(item.HARGA_SATUAN || 0),
    subtotal: new Intl.NumberFormat("id-ID").format(item.SUBTOTAL || 0),
  }));

  autoTable(doc, {
    startY: currentY,
    columns: tableColumn,
    body: tableRows,
    margin: { left: mL, right: mL },
    headStyles: { fillColor: [44, 62, 80], fontSize: 9, halign: 'center' },
    styles: { fontSize: 8, overflow: 'linebreak' },
    columnStyles: {
        qty: { halign: 'center' },
        harga: { halign: 'right' },
        subtotal: { halign: 'right' }
    }
  });

  let nextY = doc.lastAutoTable.finalY + 10;

  // --- 4. TABEL RIWAYAT PEMBAYARAN (DISESUAIKAN DENGAN DB OM) ---
  if (dataPembayaran && dataPembayaran.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RIWAYAT PEMBAYARAN:", mL, nextY);
    
    const payColumn = [
      { header: "Tgl Bayar", dataKey: "tgl_bayar" },
      { header: "No. Kwitansi", dataKey: "no_kwitansi" },
      { header: "Nominal Bayar", dataKey: "nominal" },
    ];

    const payRows = dataPembayaran.map(p => ({
      // Pakai field TGL_BAYAR dari DB
      tgl_bayar: p.TGL_BAYAR ? new Date(p.TGL_BAYAR).toLocaleDateString("id-ID") : "-",
      // Pakai field NO_KWITANSI dari DB
      no_kwitansi: p.NO_KWITANSI || "-",
      // Pakai field NOMINAL_BAYAR dari DB
      nominal: "Rp " + new Intl.NumberFormat("id-ID").format(p.NOMINAL_BAYAR || 0)
    }));

    autoTable(doc, {
      startY: nextY + 3,
      columns: payColumn,
      body: payRows,
      margin: { left: mL, right: mL },
      headStyles: { fillColor: [39, 174, 96], fontSize: 9, halign: 'center' },
      styles: { fontSize: 8 },
      columnStyles: { 
        tgl_bayar: { halign: 'center' },
        no_kwitansi: { halign: 'center' },
        nominal: { halign: 'right' } 
      }
    });
    
    nextY = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("* Belum ada riwayat pembayaran yang tercatat.", mL, nextY);
    nextY += 10;
  }

  // --- 5. RINGKASAN TOTAL ---
  if (nextY > pageHeight - 60) {
    doc.addPage();
    nextY = 20;
  }

  const boxWidth = 80;
  const boxX = pageWidth - mL - boxWidth;
  
  const totalInvoice = parseFloat(dataInvoice.TOTAL_BAYAR || 0);
  const sisaDatabase = parseFloat(dataInvoice.SISA_TAGIHAN || 0);
  const totalSudahBayar = totalInvoice - sisaDatabase;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Total Belanja :", boxX, nextY);
  doc.text(`Rp ${new Intl.NumberFormat("id-ID").format(totalInvoice)}`, pageWidth - mL, nextY, { align: "right" });

  doc.text("Total Dibayar   :", boxX, nextY + 5);
  doc.text(`Rp ${new Intl.NumberFormat("id-ID").format(totalSudahBayar)}`, pageWidth - mL, nextY + 5, { align: "right" });

  doc.setDrawColor(200);
  doc.line(boxX, nextY + 7, pageWidth - mL, nextY + 7);

  doc.setFont("helvetica", "bold").setFontSize(10);
  doc.text("SISA TAGIHAN :", boxX, nextY + 12);
  
  if (sisaDatabase > 0) doc.setTextColor(200, 0, 0);
  doc.text(`Rp ${new Intl.NumberFormat("id-ID").format(sisaDatabase)}`, pageWidth - mL, nextY + 12, { align: "right" });
  doc.setTextColor(0, 0, 0);

  // --- 6. TANDA TANGAN ---
  const signatureY = Math.max(nextY + 30, pageHeight - 45);
  doc.setFontSize(9).setFont("helvetica", "normal");
  
  doc.text("Diterima Oleh,", mL + 10, signatureY);
  doc.text("Bag. Gudang / Logistik", mL + 5, signatureY + 4);
  doc.text("( ________________ )", mL + 5, signatureY + 25);
  
  doc.text("Supplier / Vendor,", pageWidth - mL - 40, signatureY);
  doc.text(`${dataInvoice.NAMA_VENDOR || 'Pihak Kedua'}`, pageWidth - mL - 40, signatureY + 4, { maxWidth: 40 });
  doc.text("( ________________ )", pageWidth - mL - 45, signatureY + 25);

  return doc;
};