"use client";

import React from "react";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";

/**
 * Props:
 *   visible        - boolean
 *   onHide         - function
 *   dataPengiriman - object (header pengiriman)
 *   dataDetail     - array (item barang)
 *   customers      - array (master customer, untuk lookup info lengkap)
 *   perusahaan     - object (profil perusahaan)
 *   onPrint        - function(rowData) — cetak PDF dihandle di page.js agar perusahaan sudah tersedia
 */
const PengirimanDetailDialog = ({
  visible,
  onHide,
  dataPengiriman,
  dataDetail,
  customers = [],
  perusahaan,
  onPrint,
}) => {
  const formatAngka = (val) =>
    val !== undefined && val !== null ? Number(val).toLocaleString("id-ID") : "0";

  const formatTanggal = (val) =>
    val
      ? new Date(val).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";

  const getStatusSeverity = (status) => {
    switch (status?.toLowerCase()) {
      case "diterima": return "success";
      case "dikirim":  return "info";
      case "diproses": return "warning";
      case "batal":    return "danger";
      default:         return "secondary";
    }
  };

  // Lookup info lengkap customer dari master
  const custInfo = customers.find(
    (c) => c.KODE_CUSTOMER === dataPengiriman?.KODE_PELANGGAN
  );

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-truck text-primary" style={{ fontSize: "1.4rem" }}></i>
          <span>
            Detail Pengiriman:{" "}
            <b className="text-primary">{dataPengiriman?.NO_PENGIRIMAN || "-"}</b>
          </span>
        </div>
      }
      visible={visible}
      style={{ width: "85vw" }}
      modal
      onHide={onHide}
      footer={
        <div className="flex justify-content-between align-items-center">
          {/* Tombol cetak — delegasi ke page.js via onPrint agar tidak perlu re-fetch */}
          <Button
            label="Cetak Surat Jalan"
            icon="pi pi-file-pdf"
            severity="danger"
            onClick={() => onPrint?.(dataPengiriman)}
            disabled={!dataPengiriman || !dataDetail?.length}
          />
          <Button
            label="Tutup"
            icon="pi pi-times"
            onClick={onHide}
            className="p-button-outlined p-button-secondary"
          />
        </div>
      }
    >
      {/* ── HEADER INFO ── */}
      <Divider align="left">
        <div className="inline-flex align-items-center gap-2">
          <i className="pi pi-info-circle"></i>
          <b>Informasi Umum</b>
        </div>
      </Divider>

      {dataPengiriman ? (
        <div className="grid mt-2 mb-3 px-2">
          {/* Kiri: Info Customer */}
          <div className="col-12 md:col-7">
            <label className="text-500 block font-medium mb-1 text-sm">
              Customer / Pelanggan
            </label>
            <div className="text-900 font-bold text-xl mb-3">
              {dataPengiriman.NAMA_CUSTOMER || custInfo?.NAMA_CUSTOMER || dataPengiriman.KODE_PELANGGAN}
            </div>

            <label className="text-500 block font-medium mb-1 text-sm">
              Alamat Pengiriman
            </label>
            <div className="text-700 p-3 surface-100 border-round border-left-3 border-primary">
              <i className="pi pi-map-marker mr-2 text-primary"></i>
              {dataPengiriman.ALAMAT_TUJUAN || custInfo?.ALAMAT || "Alamat tidak tersedia"}
            </div>

            {/* Info kontak dari master customer jika ada */}
            {(custInfo?.NO_TELP || custInfo?.EMAIL) && (
              <div className="mt-2 text-sm text-500">
                {custInfo?.NO_TELP && (
                  <span className="mr-3">
                    <i className="pi pi-phone mr-1"></i>
                    {custInfo.NO_TELP}
                  </span>
                )}
                {custInfo?.EMAIL && (
                  <span>
                    <i className="pi pi-envelope mr-1"></i>
                    {custInfo.EMAIL}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Kanan: Status & Tanggal */}
          <div className="col-12 md:col-5 flex flex-column gap-3 md:align-items-end">
            <div>
              <small className="text-500 block mb-1 font-medium">Status Pengiriman</small>
              <Tag
                value={dataPengiriman.STATUS_KIRIM || "Diproses"}
                severity={getStatusSeverity(dataPengiriman.STATUS_KIRIM)}
                className="px-3 py-1 text-sm"
              />
            </div>
            <div>
              <small className="text-500 block mb-1 font-medium">Tanggal Kirim</small>
              <div className="text-900 font-semibold">
                <i className="pi pi-calendar mr-2 text-primary"></i>
                {formatTanggal(dataPengiriman.TGL_KIRIM)}
              </div>
            </div>
            {perusahaan && (
              <div>
                <small className="text-500 block mb-1 font-medium">Gudang Pengirim</small>
                <div className="text-700 text-sm">
                  <i className="pi pi-home mr-1"></i>
                  {perusahaan.ALAMAT_GUDANG || perusahaan.NAMA_PERUSAHAAN || "-"}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Skeleton height="8rem" className="mb-3" />
      )}

      {/* ── TABEL ITEM BARANG ── */}
      <Divider align="left">
        <div className="inline-flex align-items-center gap-2">
          <i className="pi pi-list"></i>
          <b>Rincian Barang ({dataDetail?.length || 0} item)</b>
        </div>
      </Divider>

      <div className="px-2">
        <DataTable
          value={dataDetail}
          stripedRows
          size="small"
          responsiveLayout="scroll"
          className="p-datatable-gridlines shadow-1"
          emptyMessage={
            dataPengiriman
              ? "Tidak ada rincian barang untuk pengiriman ini."
              : "Memuat data..."
          }
          loading={dataPengiriman && !dataDetail}
          footer={
            dataDetail?.length > 0 ? (
              <div className="flex justify-content-end font-bold">
                Total Qty:{" "}
                {dataDetail.reduce((s, r) => s + Number(r.QTY || 0), 0).toLocaleString("id-ID")}
              </div>
            ) : null
          }
        >
          <Column
            field="BARANG_KODE"
            header="Kode Barang"
            style={{ width: "13%" }}
            className="font-bold text-primary"
          />
          <Column
            header="Nama Barang"
            style={{ width: "35%" }}
            body={(r) => (
              <div>
                <div className="font-bold text-900">
                  {r.NAMA_BARANG || "Barang Tidak Terdaftar"}
                </div>
                <small className="text-500">
                  Batch: {r.BATCH_NO || "-"}
                </small>
              </div>
            )}
          />
          <Column
            header="Lokasi Simpan"
            style={{ width: "22%" }}
            body={(r) => (
              <div className="flex gap-2 flex-wrap">
                <Tag severity="secondary" value={r.KODE_GUDANG || "-"} />
                <Tag severity="warning" value={r.KODE_RAK || "-"} />
              </div>
            )}
          />
          <Column
            header="Qty"
            align="right"
            style={{ width: "15%" }}
            body={(r) => (
              <div className="text-right">
                <span className="text-xl font-bold text-900">{formatAngka(r.QTY)}</span>
                <span className="text-500 text-xs ml-1">
                  {r.KODE_SATUAN || r.SATUAN || "Pcs"}
                </span>
              </div>
            )}
          />
        </DataTable>
      </div>
    </Dialog>
  );
};

export default PengirimanDetailDialog;
