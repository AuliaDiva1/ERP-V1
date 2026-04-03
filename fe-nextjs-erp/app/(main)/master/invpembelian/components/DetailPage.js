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
import { Fieldset } from "primereact/fieldset";

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

/**
 * @param {object}   dataInvoice    - Data header invoice (HARUS fresh dari parent agar sisa tagihan update)
 * @param {array}    dataDetail     - Item barang
 * @param {array}    dataPembayaran - Riwayat pembayaran (di-refresh dari parent setelah bayar)
 * @param {object}   masterData     - Master lookup
 * @param {function} onBayar        - Callback buka FormPelunasan dari dalam modal ini
 */
const PembelianDetailDialog = ({
  visible,
  onHide,
  dataInvoice,
  dataDetail,
  dataPembayaran,
  masterData,
  onBayar,
}) => {
  const getNamaBarang = (kode) =>
    masterData?.barangs?.find((b) => b.KODE_BARANG === kode)?.NAMA_BARANG || kode;
  const getNamaGudang = (kode) =>
    masterData?.gudangs?.find((g) => g.KODE_GUDANG === kode)?.NAMA_GUDANG || kode;
  const getNamaRak = (kode) =>
    masterData?.raks?.find((r) => r.KODE_RAK === kode)?.NAMA_RAK || kode;

  // Ambil alamat vendor dari masterData jika tidak ada di dataInvoice
  const getAlamatVendor = () => {
    if (dataInvoice?.ALAMAT_VENDOR) return dataInvoice.ALAMAT_VENDOR;
    const vendor = masterData?.vendors?.find(
      (v) =>
        (v.VENDOR_ID && dataInvoice?.VENDOR_ID && v.VENDOR_ID === dataInvoice.VENDOR_ID) ||
        (v.NAMA_VENDOR && dataInvoice?.NAMA_VENDOR && v.NAMA_VENDOR === dataInvoice.NAMA_VENDOR)
    );
    return vendor?.ALAMAT_VENDOR || "-";
  };

  const sisaTagihan = parseFloat(dataInvoice?.SISA_TAGIHAN || 0);
  const masihAdaHutang = sisaTagihan > 0;

  const dialogHeader = (
    <div className="flex align-items-center justify-content-between w-full pr-3">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-shopping-bag text-primary text-2xl"></i>
        <span className="font-bold text-xl">Detail Lengkap Transaksi</span>
      </div>
      {/* Tombol Bayar di header dialog — muncul hanya jika masih ada hutang */}
      {masihAdaHutang && dataInvoice && (
        <Button
          label="Bayar Hutang"
          icon="pi pi-credit-card"
          severity="success"
          size="small"
          raised
          onClick={() => onBayar?.(dataInvoice)}
        />
      )}
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
      footer={
        <div className="flex justify-content-between align-items-center">
          {/* Info ringkas sisa di footer agar selalu terlihat */}
          {masihAdaHutang ? (
            <span className="text-red-500 font-semibold">
              <i className="pi pi-exclamation-circle mr-1"></i>
              Sisa hutang: {formatRupiah(sisaTagihan)}
            </span>
          ) : (
            <span className="text-green-600 font-semibold">
              <i className="pi pi-check-circle mr-1"></i>
              Sudah Lunas
            </span>
          )}
          <div className="flex gap-2">
            {masihAdaHutang && dataInvoice && (
              <Button
                label="Bayar Sekarang"
                icon="pi pi-credit-card"
                severity="success"
                onClick={() => onBayar?.(dataInvoice)}
              />
            )}
            <Button
              label="Tutup"
              icon="pi pi-times"
              onClick={onHide}
              className="p-button-text"
            />
          </div>
        </div>
      }
    >
      {dataInvoice ? (
        <>
          {/* === RINGKASAN INVOICE === */}
          <div className="grid">
            <div className="col-12 md:col-4">
              <InfoItem
                label="No. Invoice"
                value={dataInvoice.NO_INVOICE_BELI}
                large
                color="text-primary"
              />
              <InfoItem
                label="Tanggal Transaksi"
                value={formatTanggal(dataInvoice.TGL_INVOICE)}
              />
            </div>
            <div className="col-12 md:col-4 border-left-1 border-300">
              <InfoItem label="Nama Vendor" value={dataInvoice.NAMA_VENDOR} />
              <InfoItem
                label="Alamat Vendor"
                value={getAlamatVendor()}
              />
            </div>
            <div className="col-12 md:col-4 border-left-1 border-300 text-right">
              <span className="text-600 text-sm font-medium block mb-2">
                Status Pembayaran
              </span>
              <Tag
                value={dataInvoice.STATUS_BAYAR?.toUpperCase()}
                severity={
                  dataInvoice.STATUS_BAYAR?.toUpperCase() === "LUNAS"
                    ? "success"
                    : dataInvoice.STATUS_BAYAR?.toUpperCase() === "CICIL"
                    ? "info"
                    : "warning"
                }
                className="text-lg px-3 mb-3"
              />
              <InfoItem
                label="Total Pembelian"
                value={formatRupiah(dataInvoice.TOTAL_BAYAR)}
              />
              <InfoItem
                label="Sisa Tagihan"
                value={formatRupiah(dataInvoice.SISA_TAGIHAN)}
                large
                color={masihAdaHutang ? "text-red-500" : "text-green-600"}
              />
            </div>
          </div>

          <Divider />

          {/* === TABS === */}
          <TabView>
            {/* TAB 1: ITEM BARANG */}
            <TabPanel header="Item Barang" leftIcon="pi pi-box mr-2">
              <DataTable
                value={dataDetail}
                stripedRows
                size="small"
                responsiveLayout="scroll"
                emptyMessage="Tidak ada item barang."
              >
                <Column field="BARANG_KODE" header="Kode" />
                <Column
                  header="Nama Barang"
                  body={(r) => (
                    <span className="font-bold">
                      {r.NAMA_BARANG || getNamaBarang(r.BARANG_KODE)}
                    </span>
                  )}
                />
                <Column
                  header="Gudang / Rak"
                  body={(r) => (
                    <div className="text-sm">
                      <Tag
                        severity="secondary"
                        value={getNamaGudang(r.KODE_GUDANG)}
                        className="mr-1"
                      />
                      <Tag severity="info" value={getNamaRak(r.KODE_RAK)} />
                    </div>
                  )}
                />
                <Column field="BATCH_NO" header="Batch" className="text-center" />
                <Column
                  header="Expired"
                  body={(r) => formatTanggal(r.TGL_KADALUARSA)}
                />
                <Column field="QTY_BELI" header="Qty" className="text-center" />
                <Column
                  header="Harga Satuan"
                  body={(r) => formatRupiah(r.HARGA_SATUAN)}
                  className="text-right"
                />
                <Column
                  header="Subtotal"
                  body={(r) => (
                    <span className="font-bold">{formatRupiah(r.SUBTOTAL)}</span>
                  )}
                  className="text-right"
                />
              </DataTable>
            </TabPanel>

            {/* TAB 2: RIWAYAT BAYAR */}
            <TabPanel
              header={`Riwayat Bayar (${dataPembayaran?.length || 0})`}
              leftIcon="pi pi-history mr-2"
            >
              {dataPembayaran && dataPembayaran.length > 0 ? (
                <>
                  <DataTable
                    value={dataPembayaran}
                    stripedRows
                    size="small"
                    emptyMessage="Tidak ada riwayat pembayaran."
                  >
                    <Column field="NO_KWITANSI" header="No. Kwitansi" />
                    <Column
                      header="Tanggal Bayar"
                      body={(r) => formatTanggal(r.TGL_BAYAR)}
                    />
                    <Column
                      header="Nominal"
                      body={(r) => (
                        <span className="text-green-600 font-bold">
                          {formatRupiah(r.NOMINAL_BAYAR)}
                        </span>
                      )}
                      className="text-right"
                    />
                  </DataTable>

                  {/* Ringkasan total yang sudah dibayar */}
                  <div className="flex justify-content-end mt-3">
                    <div className="surface-100 border-round p-3 text-right" style={{ minWidth: "260px" }}>
                      <div className="text-600 text-sm mb-1">Total Sudah Dibayar</div>
                      <div className="text-green-600 font-bold text-lg">
                        {formatRupiah(
                          dataPembayaran.reduce(
                            (sum, p) => sum + parseFloat(p.NOMINAL_BAYAR || 0),
                            0
                          )
                        )}
                      </div>
                      <div className="text-600 text-sm mt-2 mb-1">Sisa Tagihan</div>
                      <div
                        className={`font-bold text-lg ${
                          masihAdaHutang ? "text-red-500" : "text-green-600"
                        }`}
                      >
                        {formatRupiah(dataInvoice.SISA_TAGIHAN)}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="pi pi-inbox text-400 text-5xl mb-3 block"></i>
                  <p className="text-600">Belum ada riwayat pembayaran.</p>
                  {masihAdaHutang && (
                    <Button
                      label="Bayar Sekarang"
                      icon="pi pi-credit-card"
                      severity="success"
                      className="mt-2"
                      onClick={() => onBayar?.(dataInvoice)}
                    />
                  )}
                </div>
              )}
            </TabPanel>

            {/* TAB 3: LOG SISTEM */}
            <TabPanel header="Log Sistem" leftIcon="pi pi-info-circle mr-2">
              <div className="grid">
                <div className="col-12 md:col-6">
                  <Fieldset legend="Metadata Pembuatan">
                    <InfoItem
                      label="Created At"
                      value={formatTanggal(dataInvoice.created_at)}
                    />
                    <InfoItem label="ID Transaksi" value={dataInvoice.ID_INV_BELI} />
                  </Fieldset>
                </div>
                <div className="col-12 md:col-6">
                  <Fieldset legend="Metadata Perubahan">
                    <InfoItem
                      label="Updated At"
                      value={formatTanggal(dataInvoice.updated_at)}
                    />
                  </Fieldset>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </>
      ) : (
        <Skeleton height="20rem" />
      )}
    </Dialog>
  );
};

export default PembelianDetailDialog;
