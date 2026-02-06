"use client";

import React from "react";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Fieldset } from "primereact/fieldset"; // <-- Import sudah ada sekarang

// === FUNGSI FORMATTING ===
const formatRupiah = (number) => {
  if (number === null || number === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

const formatTanggal = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const InfoItem = ({ label, value, large = false, color = "text-900" }) => (
  <div className="mb-3">
    <span className="text-600 text-sm font-medium block mb-1">{label}</span>
    <span className={`${large ? "text-xl font-bold" : "font-semibold"} ${color}`}>
      {value || "-"}
    </span>
  </div>
);

const PembelianDetailDialog = ({ 
  visible, 
  onHide, 
  dataInvoice, 
  dataDetail, 
  dataPembayaran, 
  masterData 
}) => {

  // Helper mapping nama
  const getNamaBarang = (kode) => masterData?.barangs?.find(b => b.KODE_BARANG === kode)?.NAMA_BARANG || kode;
  const getNamaGudang = (kode) => masterData?.gudangs?.find(g => g.KODE_GUDANG === kode)?.NAMA_GUDANG || kode;
  const getNamaRak = (kode) => masterData?.raks?.find(r => r.KODE_RAK === kode)?.NAMA_RAK || kode;

  const dialogHeader = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-shopping-bag text-primary text-2xl"></i>
      <span className="font-bold text-xl">Detail Lengkap Transaksi</span>
    </div>
  );

  return (
    <Dialog
      header={dialogHeader}
      visible={visible}
      style={{ width: "1100px", maxWidth: "95vw" }}
      modal
      draggable={false}
      onHide={onHide}
      footer={<Button label="Tutup" icon="pi pi-times" onClick={onHide} className="p-button-text" />}
    >
      {dataInvoice ? (
        <>
          <div className="grid">
            <div className="col-12 md:col-4">
              <InfoItem label="No. Invoice" value={dataInvoice.NO_INVOICE_BELI} large color="text-primary" />
              <InfoItem label="Tanggal Transaksi" value={formatTanggal(dataInvoice.TGL_INVOICE)} />
            </div>
            <div className="col-12 md:col-4 border-left-1 border-300">
              <InfoItem label="Nama Vendor" value={dataInvoice.NAMA_VENDOR} />
              <InfoItem label="Alamat Vendor" value={dataInvoice.ALAMAT_VENDOR || "Jl. Veteran No. 9, Gresik"} />
            </div>
            <div className="col-12 md:col-4 border-left-1 border-300 text-right">
              <span className="text-600 text-sm font-medium block mb-2">Status Pembayaran</span>
              <Tag 
                value={dataInvoice.STATUS_BAYAR?.toUpperCase()} 
                severity={dataInvoice.STATUS_BAYAR === "Lunas" ? "success" : "info"}
                className="text-lg px-3 mb-3"
              />
              <InfoItem 
                label="Sisa Tagihan" 
                value={formatRupiah(dataInvoice.SISA_TAGIHAN)} 
                large 
                color={parseFloat(dataInvoice.SISA_TAGIHAN) > 0 ? "text-red-500" : "text-green-600"} 
              />
            </div>
          </div>

          <Divider />

          <TabView>
            <TabPanel header="Item Barang" leftIcon="pi pi-box mr-2">
              <DataTable value={dataDetail} stripedRows size="small" responsiveLayout="scroll">
                <Column field="BARANG_KODE" header="Kode" />
                <Column header="Nama Barang" body={(r) => <span className="font-bold">{getNamaBarang(r.NAMA_BARANG)}</span>} />
                <Column 
                  header="Gudang / Rak" 
                  body={(r) => (
                    <div className="text-sm">
                      <Tag severity="secondary" value={getNamaGudang(r.KODE_GUDANG)} className="mr-1" />
                      <Tag severity="info" value={getNamaRak(r.KODE_RAK)} />
                    </div>
                  )} 
                />
                <Column field="BATCH_NO" header="Batch" className="text-center" />
                <Column header="Expired" body={(r) => formatTanggal(r.TGL_KADALUARSA)} />
                <Column field="QTY_BELI" header="Qty" className="text-center" />
                <Column header="Harga Satuan" body={(r) => formatRupiah(r.HARGA_SATUAN)} className="text-right" />
                <Column header="Subtotal" body={(r) => <span className="font-bold">{formatRupiah(r.SUBTOTAL)}</span>} className="text-right" />
              </DataTable>
            </TabPanel>

            <TabPanel header="Riwayat Bayar" leftIcon="pi pi-history mr-2">
              <DataTable value={dataPembayaran} stripedRows size="small" emptyMessage="Tidak ada riwayat pembayaran.">
                <Column field="NO_KWITANSI" header="No. Kwitansi" />
                <Column header="Tanggal Bayar" body={(r) => formatTanggal(r.TGL_BAYAR)} />
                <Column header="Nominal" body={(r) => <span className="text-green-600 font-bold">{formatRupiah(r.NOMINAL_BAYAR)}</span>} className="text-right" />
              </DataTable>
            </TabPanel>

            <TabPanel header="Log Sistem" leftIcon="pi pi-info-circle mr-2">
              <div className="grid">
                <div className="col-12 md:col-6">
                   <Fieldset legend="Metadata Pembuatan">
                      <InfoItem label="Created At" value={dataInvoice.created_at} />
                      <InfoItem label="ID Transaksi" value={dataInvoice.ID_INV_BELI} />
                   </Fieldset>
                </div>
                <div className="col-12 md:col-6">
                   <Fieldset legend="Metadata Perubahan">
                      <InfoItem label="Updated At" value={dataInvoice.updated_at} />
                   </Fieldset>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </>
      ) : <Skeleton height="20rem" />}
    </Dialog>
  );
};

export default PembelianDetailDialog;