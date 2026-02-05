import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateFakturPDF = (dataInvoice, dataDetail) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "A4",
  });

  const pageWidth = doc.internal.pageSize.width;
  const mL = 15;
  let currentY = 20;

  // --- 1. HEADER / KOP SURAT ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FAKTUR PEMBELIAN", pageWidth / 2, currentY, { align: "center" });
  
  currentY += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Laporan Penerimaan Barang & Tagihan Vendor", pageWidth / 2, currentY, { align: "center" });

  currentY += 5;
  doc.setLineWidth(0.5);
  doc.line(mL, currentY, pageWidth - mL, currentY);

  // --- 2. INFORMASI INVOICE & VENDOR ---
  currentY += 10;
  
  // Sisi Kiri: Info Invoice
  doc.setFont("helvetica", "bold");
  doc.text("INFORMASI INVOICE:", mL, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`No. Invoice : ${dataInvoice.NO_INVOICE_BELI || "-"}`, mL, currentY + 7);
  doc.text(`Tanggal      : ${dataInvoice.TGL_INVOICE ? new Date(dataInvoice.TGL_INVOICE).toLocaleDateString("id-ID") : "-"}`, mL, currentY + 12);
  
  // Styling Status (Warna Merah jika belum lunas)
  const status = dataInvoice.STATUS_BAYAR || "Belum Lunas";
  doc.text("Status       : ", mL, currentY + 17);
  if (status !== "Lunas") doc.setTextColor(200, 0, 0); // Merah
  doc.setFont("helvetica", "bold");
  doc.text(status.toUpperCase(), mL + 22, currentY + 17);
  doc.setTextColor(0, 0, 0); // Reset Hitam

  // Sisi Kanan: Info Vendor
  const col2X = pageWidth / 2;
  doc.setFont("helvetica", "bold");
  doc.text("VENDOR / SUPPLIER:", col2X, currentY);
  doc.setFont("helvetica", "bold");
  doc.text(`${dataInvoice.NAMA_VENDOR || "-"}`, col2X, currentY + 7);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  // Alamat Menggunakan textWrap agar tidak keluar kertas jika panjang
  const alamat = dataInvoice.ALAMAT_VENDOR || "Alamat tidak ditemukan di database";
  doc.text(alamat, col2X, currentY + 12, { maxWidth: 80 });

  currentY += 30;

  // --- 3. TABEL DETAIL BARANG ---
  const tableColumn = [
    { header: "Barang", dataKey: "barang" },
    { header: "Gudang", dataKey: "gudang" },
    { header: "Rak", dataKey: "rak" },
    { header: "Batch", dataKey: "batch" },
    { header: "Qty", dataKey: "qty" },
    { header: "Harga (Rp)", dataKey: "harga" },
    { header: "Subtotal (Rp)", dataKey: "subtotal" },
  ];

  const tableRows = (dataDetail || []).map((item) => ({
    barang: item.NAMA_BARANG || item.BARANG_KODE,
    gudang: item.NAMA_GUDANG || item.KODE_GUDANG || "-",
    rak: item.NAMA_RAK || item.KODE_RAK || "-",
    batch: item.BATCH_NO || "-",
    qty: item.QTY_BELI || 0,
    harga: new Intl.NumberFormat("id-ID").format(item.HARGA_SATUAN || 0),
    subtotal: new Intl.NumberFormat("id-ID").format(item.SUBTOTAL || 0),
  }));

  autoTable(doc, {
    startY: currentY,
    columns: tableColumn,
    body: tableRows,
    margin: { left: mL, right: mL },
    headStyles: { fillColor: [44, 62, 80], fontSize: 9, halign: 'center' },
    styles: { fontSize: 8 },
    columnStyles: {
      qty: { halign: 'center' },
      harga: { halign: 'right' },
      subtotal: { halign: 'right' },
    },
  });

  // --- 4. FOOTER (TOTAL & TANDA TANGAN) ---
  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Total Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setFillColor(240, 240, 240);
  doc.rect(pageWidth - mL - 80, finalY - 5, 80, 10, 'F');
  doc.text(`TOTAL AKHIR: Rp ${new Intl.NumberFormat("id-ID").format(dataInvoice.TOTAL_BAYAR || 0)}`, pageWidth - mL - 5, finalY + 2, { align: "right" });

  // Signatures Section
  const signatureY = finalY + 25;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  doc.text("Diterima Oleh,", mL + 10, signatureY);
  doc.text("Gudang / Logistik", mL + 9, signatureY + 4);
  
  doc.text("Supplier / Vendor,", pageWidth - mL - 40, signatureY);
  doc.text("Hormat Kami,", pageWidth - mL - 36, signatureY + 4);
  
  doc.text("( ________________ )", mL + 5, signatureY + 30);
  doc.text("( ________________ )", pageWidth - mL - 45, signatureY + 30);

  return doc;
};