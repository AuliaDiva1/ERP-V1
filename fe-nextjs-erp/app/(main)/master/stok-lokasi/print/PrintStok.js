import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateStokPDF = (data) => {
  const doc = new jsPDF("l", "mm", "a4"); // Landscape
  const pageWidth = doc.internal.pageSize.width;

  doc.setFontSize(16);
  doc.text("LAPORAN POSISI STOK BARANG", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(`Periode: ${new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 22, { align: "center" });

  const tableColumn = ["No", "Kode", "Nama Barang", "Gudang", "Rak", "Batch No", "Exp Date", "Qty"];
  const tableRows = data.map((item, index) => [
    index + 1,
    item.BARANG_KODE,
    item.NAMA_BARANG,
    item.NAMA_GUDANG,
    item.NAMA_RAK || "-",
    item.BATCH_NO || "-",
    item.TGL_KADALUARSA ? new Date(item.TGL_KADALUARSA).toLocaleDateString("id-ID") : "-",
    item.QTY
  ]);

  autoTable(doc, {
    startY: 30,
    head: [tableColumn],
    body: tableRows,
    headStyles: { fillColor: [41, 128, 185], halign: 'center' },
    columnStyles: {
      7: { halign: 'right' } // Qty ke kanan
    },
    styles: { fontSize: 8 }
  });

  return doc;
};