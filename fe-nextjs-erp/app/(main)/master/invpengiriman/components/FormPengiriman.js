"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";

/**
 * masterData props yang dikirim dari page.js:
 *   customers   - list customer
 *   barangs     - list master barang
 *   gudangs     - list master gudang
 *   raks        - list master rak
 *   stokLokasi  - list stok_lokasi (BARANG_KODE, KODE_GUDANG, KODE_RAK, QTY, BATCH_NO)
 */
export default function FormPengiriman({ masterData, onSave, onCancel, loading }) {
  const [header, setHeader] = useState({
    NO_PENGIRIMAN: "",
    TGL_KIRIM: new Date(),
    KODE_PELANGGAN: "",
    ALAMAT_TUJUAN: "",
  });

  const [items, setItems] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [selectedStokRow, setSelectedStokRow] = useState(null); // stok_lokasi yang dipilih
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  const onCustomerChange = (e) => {
    const cust = masterData.customers.find((c) => c.KODE_CUSTOMER === e.value);
    setHeader({ ...header, KODE_PELANGGAN: e.value, ALAMAT_TUJUAN: cust?.ALAMAT || "" });
    setError("");
  };

  // Ambil stok lokasi yang tersedia untuk barang terpilih
  const stokAvailable = selectedBarang
    ? (masterData.stokLokasi || []).filter(
        (s) => s.BARANG_KODE === selectedBarang.BARANG_KODE && s.QTY > 0
      )
    : [];

  // Label untuk dropdown stok lokasi
  const stokOptions = stokAvailable.map((s) => {
    const namaGudang =
      masterData.gudangs?.find((g) => g.KODE_GUDANG === s.KODE_GUDANG)?.NAMA_GUDANG ||
      s.KODE_GUDANG;
    const namaRak =
      masterData.raks?.find((r) => r.KODE_RAK === s.KODE_RAK)?.NAMA_RAK || s.KODE_RAK;
    return {
      ...s,
      label: `${namaGudang} / ${namaRak} — Stok: ${s.QTY}`,
    };
  });

  const addBarang = () => {
    setError("");

    if (!selectedBarang) { setError("Pilih barang terlebih dahulu!"); return; }
    if (!selectedStokRow) { setError("Pilih lokasi gudang/rak sumber stok!"); return; }
    if (qty <= 0) { setError("Jumlah minimal adalah 1"); return; }
    if (qty > selectedStokRow.QTY) {
      setError(`Stok tidak cukup! Tersedia: ${selectedStokRow.QTY}`);
      return;
    }

    // Cek duplikat (barang + lokasi sama → tambah qty saja)
    const existingIndex = items.findIndex(
      (i) =>
        i.BARANG_KODE === selectedBarang.BARANG_KODE &&
        i.KODE_GUDANG === selectedStokRow.KODE_GUDANG &&
        i.KODE_RAK === selectedStokRow.KODE_RAK
    );

    if (existingIndex > -1) {
      const newItems = [...items];
      const newQty = newItems[existingIndex].QTY + qty;
      if (newQty > selectedStokRow.QTY) {
        setError(`Total qty melebihi stok tersedia (${selectedStokRow.QTY})`);
        return;
      }
      newItems[existingIndex].QTY = newQty;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          BARANG_KODE: selectedBarang.BARANG_KODE,
          NAMA_BARANG: selectedBarang.NAMA_BARANG,
          KODE_GUDANG: selectedStokRow.KODE_GUDANG,
          KODE_RAK: selectedStokRow.KODE_RAK,
          QTY: qty,
          BATCH_NO: selectedStokRow.BATCH_NO || "-",
          _stokMax: selectedStokRow.QTY, // untuk validasi UI saja
        },
      ]);
    }

    setSelectedBarang(null);
    setSelectedStokRow(null);
    setQty(1);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleFinalSave = () => {
    if (!header.NO_PENGIRIMAN || !header.KODE_PELANGGAN) {
      setError("Nomor SJ dan Customer wajib diisi!");
      return;
    }
    if (items.length === 0) {
      setError("Tambahkan minimal 1 barang!");
      return;
    }

    // Format tanggal sebelum kirim
    const tglFormatted =
      header.TGL_KIRIM instanceof Date
        ? header.TGL_KIRIM.toISOString().split("T")[0]
        : header.TGL_KIRIM;

    // Bersihkan field internal (_stokMax) sebelum kirim ke API
    const cleanItems = items.map(({ _stokMax, NAMA_BARANG, ...rest }) => rest);

    onSave({ header: { ...header, TGL_KIRIM: tglFormatted }, items: cleanItems });
  };

  return (
    <div className="grid p-fluid">
      {error && (
        <div className="col-12 mb-2">
          <Message severity="error" text={error} className="w-full" />
        </div>
      )}

      {/* ── KIRI: INFO PENGIRIMAN ── */}
      <div className="col-12 md:col-4">
        <Card title="Informasi Pengiriman">
          <div className="flex flex-column gap-3">
            <div className="field">
              <label className="font-bold">
                No. Surat Jalan <span className="text-red-500">*</span>
              </label>
              <InputText
                value={header.NO_PENGIRIMAN}
                onChange={(e) =>
                  setHeader({ ...header, NO_PENGIRIMAN: e.target.value.toUpperCase() })
                }
                placeholder="CONTOH: SJ/2026/001"
              />
            </div>

            <div className="field">
              <label className="font-bold">Tanggal Kirim</label>
              <Calendar
                value={header.TGL_KIRIM}
                onChange={(e) => setHeader({ ...header, TGL_KIRIM: e.value })}
                showIcon
                dateFormat="dd/mm/yy"
              />
            </div>

            <div className="field">
              <label className="font-bold">
                Customer <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={header.KODE_PELANGGAN}
                options={masterData.customers}
                optionLabel="NAMA_CUSTOMER"
                optionValue="KODE_CUSTOMER"
                onChange={onCustomerChange}
                filter
                placeholder="Pilih Pelanggan"
              />
            </div>

            <div className="field">
              <label className="font-bold">Alamat Tujuan</label>
              <InputText
                value={header.ALAMAT_TUJUAN}
                onChange={(e) => setHeader({ ...header, ALAMAT_TUJUAN: e.target.value })}
                placeholder="Terisi otomatis saat pilih customer"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* ── KANAN: DAFTAR BARANG ── */}
      <div className="col-12 md:col-8">
        <Card title="Daftar Barang Dikirim">
          {/* Form Tambah Barang */}
          <div className="grid align-items-end mb-3">
            <div className="col-12 md:col-5 field mb-0">
              <label className="font-bold">Pilih Barang</label>
              <Dropdown
                value={selectedBarang}
                options={masterData.barangs}
                optionLabel="NAMA_BARANG"
                onChange={(e) => {
                  setSelectedBarang(e.value);
                  setSelectedStokRow(null); // reset lokasi saat barang ganti
                }}
                filter
                placeholder="Cari Barang..."
              />
            </div>

            <div className="col-12 md:col-4 field mb-0">
              <label className="font-bold">
                Lokasi (Gudang / Rak){" "}
                {selectedBarang && stokOptions.length === 0 && (
                  <span className="text-red-500 text-xs">— Stok kosong!</span>
                )}
              </label>
              <Dropdown
                value={selectedStokRow}
                options={stokOptions}
                optionLabel="label"
                onChange={(e) => setSelectedStokRow(e.value)}
                placeholder={selectedBarang ? "Pilih Lokasi Stok" : "Pilih barang dulu"}
                disabled={!selectedBarang || stokOptions.length === 0}
                emptyMessage="Tidak ada stok tersedia"
              />
            </div>

            <div className="col-12 md:col-2 field mb-0">
              <label className="font-bold">
                Qty{" "}
                {selectedStokRow && (
                  <span className="text-green-600 text-xs">max {selectedStokRow.QTY}</span>
                )}
              </label>
              <InputNumber
                value={qty}
                onValueChange={(e) => setQty(e.value)}
                showButtons
                min={1}
                max={selectedStokRow?.QTY || 99999}
              />
            </div>

            <div className="col-12 md:col-1">
              <Button
                icon="pi pi-plus"
                onClick={addBarang}
                severity="success"
                tooltip="Tambah ke daftar"
              />
            </div>
          </div>

          <Divider className="my-2" />

          {/* Tabel Item */}
          <DataTable
            value={items}
            className="p-datatable-sm"
            emptyMessage="Belum ada barang ditambahkan"
            footer={
              items.length > 0 ? (
                <div className="flex justify-content-between font-bold px-1">
                  <span>Total Jenis Barang: {items.length}</span>
                  <span className="text-primary">
                    Total Qty: {items.reduce((s, i) => s + i.QTY, 0)}
                  </span>
                </div>
              ) : null
            }
          >
            <Column field="BARANG_KODE" header="Kode" style={{ width: "10%" }} />
            <Column field="NAMA_BARANG" header="Nama Barang" />
            <Column
              header="Lokasi"
              body={(r) => (
                <div className="flex gap-1">
                  <Tag severity="secondary" value={r.KODE_GUDANG} />
                  <Tag severity="info" value={r.KODE_RAK} />
                </div>
              )}
            />
            <Column field="BATCH_NO" header="Batch" style={{ width: "10%" }} />
            <Column
              header="Qty"
              style={{ width: "8%" }}
              body={(r) => <b className="text-primary">{r.QTY}</b>}
            />
            <Column
              header="#"
              style={{ width: "4%" }}
              body={(_, opt) => (
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  onClick={() => removeItem(opt.rowIndex)}
                />
              )}
            />
          </DataTable>

          <div className="flex justify-content-end gap-2 mt-4">
            <Button
              label="Batal"
              icon="pi pi-times"
              className="p-button-text"
              onClick={onCancel}
              disabled={loading}
            />
            <Button
              label="Simpan Pengiriman"
              icon="pi pi-check"
              severity="success"
              onClick={handleFinalSave}
              loading={loading}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
