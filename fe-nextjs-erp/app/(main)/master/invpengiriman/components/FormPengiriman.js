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

export default function FormPengiriman({ masterData, onSave, onCancel, loading }) {
  const [header, setHeader] = useState({
    NO_PENGIRIMAN: "",
    TGL_KIRIM: new Date(),
    KODE_PELANGGAN: "",
    ALAMAT_TUJUAN: "",
    KETERANGAN: ""
  });

  const [items, setItems] = useState([]); 
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  const onCustomerChange = (e) => {
    const cust = masterData.customers.find((c) => c.KODE_CUSTOMER === e.value);
    setHeader({ 
      ...header, 
      KODE_PELANGGAN: e.value, 
      ALAMAT_TUJUAN: cust?.ALAMAT || "" 
    });
    setError("");
  };

  const addBarang = () => {
    if (!selectedBarang) {
      setError("Pilih barang terlebih dahulu!");
      return;
    }
    if (qty <= 0) {
      setError("Jumlah minimal adalah 1");
      return;
    }

    // --- PERBAIKAN LOGIKA DI SINI ---
    // Cari data stok_lokasi yang sesuai dengan barang yang dipilih dari masterData
    // Kita asumsikan masterData.stokLokasi dikirim dari parent component
    const infoStok = masterData.stokLokasi?.find(s => s.BARANG_KODE === selectedBarang.BARANG_KODE);

    // Jika info stok tidak ada, gunakan default dari database (GDG-001) agar tidak error G01 lagi
    const gudangFix = infoStok?.KODE_GUDANG || "GDG-001"; 
    const rakFix = infoStok?.KODE_RAK || "RAK-A1";
    const batchFix = infoStok?.BATCH_NO || "-";

    const existingIndex = items.findIndex((i) => i.BARANG_KODE === selectedBarang.BARANG_KODE);
    
    if (existingIndex > -1) {
      const newItems = [...items];
      newItems[existingIndex].QTY += qty;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          BARANG_KODE: selectedBarang.BARANG_KODE,
          NAMA_BARANG: selectedBarang.NAMA_BARANG,
          KODE_GUDANG: gudangFix, // Menggunakan kode yang benar (GDG-001)
          KODE_RAK: rakFix,       // Menggunakan kode yang benar (RAK-A1)
          QTY: qty,
          BATCH_NO: batchFix,
        },
      ]);
    }

    setSelectedBarang(null);
    setQty(1);
    setError("");
  };

  const removeItem = (kode) => {
    setItems(items.filter((i) => i.BARANG_KODE !== kode));
  };

  const handleFinalSave = () => {
    if (!header.NO_PENGIRIMAN || !header.KODE_PELANGGAN) {
      setError("Nomor SJ dan Customer wajib diisi!");
      return;
    }
    if (items.length === 0) {
      setError("Tambahkan minimal 1 barang untuk dikirim!");
      return;
    }
    
    onSave({ header, items });
  };

  const footerTable = (
    <div className="flex justify-content-between align-items-center px-2">
      <span className="font-bold">Total Jenis Barang: {items.length}</span>
      <span className="text-xl font-bold text-primary">
        Total Qty: {items.reduce((sum, item) => sum + item.QTY, 0)}
      </span>
    </div>
  );

  return (
    <div className="grid p-fluid">
      {error && (
        <div className="col-12 mb-2">
          <Message severity="error" text={error} className="w-full justify-content-start" />
        </div>
      )}

      <div className="col-12 md:col-4">
        <Card title="Informasi Pengiriman">
          <div className="flex flex-column gap-3">
            <div className="field">
              <label className="font-bold">No. Surat Jalan</label>
              <InputText 
                value={header.NO_PENGIRIMAN} 
                onChange={(e) => setHeader({ ...header, NO_PENGIRIMAN: e.target.value.toUpperCase() })} 
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
              <label className="font-bold">Customer</label>
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
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12 md:col-8">
        <Card title="Daftar Barang">
          <div className="grid align-items-end mb-4">
            <div className="col-12 md:col-6 field mb-0">
              <label className="font-bold">Pilih Barang</label>
              <Dropdown 
                value={selectedBarang} 
                options={masterData.barangs} 
                optionLabel="NAMA_BARANG" 
                onChange={(e) => setSelectedBarang(e.value)} 
                filter 
                placeholder="Cari Barang..." 
              />
            </div>
            <div className="col-12 md:col-3 field mb-0">
              <label className="font-bold">Jumlah</label>
              <InputNumber 
                value={qty} 
                onValueChange={(e) => setQty(e.value)} 
                showButtons 
                min={1} 
              />
            </div>
            <div className="col-12 md:col-3">
              <Button label="Tambah" icon="pi pi-plus" onClick={addBarang} />
            </div>
          </div>

          <DataTable 
            value={items} 
            className="p-datatable-sm"
            footer={items.length > 0 ? footerTable : null}
          >
            <Column field="BARANG_KODE" header="Kode" />
            <Column field="NAMA_BARANG" header="Nama" />
            <Column 
                header="Lokasi" 
                body={(r) => <small className="p-tag p-tag-info">{r.KODE_GUDANG} | {r.KODE_RAK}</small>} 
            />
            <Column field="QTY" header="Qty" body={(r) => <b>{r.QTY}</b>} />
            <Column
              header="Aksi"
              body={(rowData) => (
                <Button icon="pi pi-trash" severity="danger" text onClick={() => removeItem(rowData.BARANG_KODE)} />
              )}
            />
          </DataTable>

          <div className="flex justify-content-end gap-2 mt-4">
            <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={onCancel} />
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