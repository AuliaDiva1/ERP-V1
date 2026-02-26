"use client";

import React, { useState } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PengirimanDetailDialog = ({ visible, onHide, dataPengiriman, dataDetail }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (!dataPengiriman) return;
    
    setIsPrinting(true);
    try {
      // 1. Ambil data Master Perusahaan dinamis
      const res = await axios.get(`${API_URL}/master-perusahaan`);
      const perusahaan = res.data.data.length > 0 ? res.data.data[0] : null;

      if (!perusahaan) {
        alert("Profil perusahaan belum diatur di Master Perusahaan.");
        return;
      }

      // 2. Jalankan fungsi generate dari file PengirimanPDF.js
      const doc = generateSuratJalan(dataPengiriman, dataDetail, perusahaan);
      
      // 3. Simpan/Download PDF
      doc.save(`Surat_Jalan_${dataPengiriman.NO_PENGIRIMAN}.pdf`);
    } catch (err) {
      console.error("Gagal mencetak:", err);
      alert("Terjadi kesalahan teknis saat mencetak.");
    } finally {
      setIsPrinting(false);
    }
  };

  const formatAngka = (val) => {
    return val !== undefined && val !== null ? Number(val).toLocaleString('id-ID') : "0";
  };

  const getStatusSeverity = (status) => {
    switch (status?.toLowerCase()) {
      case 'dikirim': return 'success';
      case 'diproses': return 'info';
      case 'pending': return 'warning';
      case 'batal': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-box text-primary" style={{ fontSize: '1.5rem' }}></i>
          <span>Detail Transaksi Pengiriman: <b>{dataPengiriman?.NO_PENGIRIMAN || "-"}</b></span>
        </div>
      }
      visible={visible}
      style={{ width: "85vw" }}
      modal
      onHide={onHide}
      footer={
        <div className="flex justify-content-between align-items-center">
          <Button 
            label="Cetak Surat Jalan" 
            icon="pi pi-file-pdf" 
            severity="danger" 
            onClick={handlePrint} 
            loading={isPrinting}
            disabled={!dataPengiriman}
          />
          <div className="flex gap-2">
            <Button label="Tutup" icon="pi pi-times" onClick={onHide} className="p-button-outlined p-button-secondary" />
          </div>
        </div>
      }
    >
      <Divider align="left">
        <div className="inline-flex align-items-center">
          <i className="pi pi-info-circle mr-2"></i>
          <b>Informasi Umum</b>
        </div>
      </Divider>

      {dataPengiriman ? (
        <div className="grid mt-2 mb-4 px-2">
          <div className="col-12 md:col-6 lg:col-8">
            <label className="text-500 block font-medium mb-1">Customer / Pelanggan</label>
            <div className="text-900 font-bold text-xl mb-2">
              {dataPengiriman.NAMA_CUSTOMER || dataPengiriman.KODE_PELANGGAN}
            </div>
            
            <label className="text-500 block font-medium mb-1">Alamat Pengiriman</label>
            <div className="text-700 p-3 surface-100 border-round border-left-3 border-primary shadow-1">
              <i className="pi pi-map-marker mr-2 text-primary"></i>
              {dataPengiriman.ALAMAT_TUJUAN || "Alamat tidak tersedia"}
            </div>
          </div>

          <div className="col-12 md:col-6 lg:col-4 md:text-right flex flex-column justify-content-start gap-2">
            <div>
              <small className="text-500 block mb-1 font-medium">Status Pengiriman</small>
              <Tag 
                value={dataPengiriman.STATUS_KIRIM || "Unknown"} 
                severity={getStatusSeverity(dataPengiriman.STATUS_KIRIM)} 
                className="px-3 py-1 text-sm uppercase"
              />
            </div>
            <div>
              <small className="text-500 block mb-1 font-medium">Tanggal Kirim</small>
              <div className="text-900 font-semibold">
                <i className="pi pi-calendar mr-2"></i>
                {dataPengiriman.TGL_KIRIM 
                  ? new Date(dataPengiriman.TGL_KIRIM).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) 
                  : "-"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-4">Sedang memuat data header...</div>
      )}

      <Divider align="left">
        <div className="inline-flex align-items-center">
          <i className="pi pi-list mr-2"></i>
          <b>Rincian Barang (Items)</b>
        </div>
      </Divider>

      <div className="px-2 mt-3">
        <DataTable 
          value={dataDetail} 
          stripedRows 
          size="small" 
          responsiveLayout="stack" 
          className="p-datatable-gridlines shadow-2"
          emptyMessage="Tidak ada rincian barang untuk pengiriman ini."
        >
          <Column field="BARANG_KODE" header="Kode Barang" className="font-bold text-primary" style={{ width: '15%' }} />
          <Column 
            header="Nama Barang & Batch" 
            style={{ width: '35%' }}
            body={(r) => (
              <div>
                <div className="font-bold text-900">{r.NAMA_BARANG || "Barang Tidak Terdaftar"}</div>
                <small className="text-500">Batch No: {r.BATCH_NO || "-"}</small>
              </div>
            )} 
          />
          <Column 
            header="Lokasi Simpan" 
            style={{ width: '25%' }}
            body={(r) => (
              <div className="flex gap-2">
                <Tag severity="secondary" value={r.KODE_GUDANG} />
                <Tag severity="warning" value={r.KODE_RAK} />
              </div>
            )} 
          />
          <Column 
            header="Kuantitas (Qty)" 
            align="right"
            style={{ width: '25%' }}
            body={(r) => (
              <div className="flex flex-column align-items-end">
                <span className="text-xl font-bold text-900">{formatAngka(r.QTY)}</span>
                <span className="text-500 text-xs">{r.KODE_SATUAN || "Pcs"}</span>
              </div>
            )} 
          />
        </DataTable>
      </div>
    </Dialog>
  );
};

export default PengirimanDetailDialog;