"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";

const FormPembelian = ({
  visible,
  onHide,
  onSave,
  vendors,
  barangs,
  gudangs,
  raks,
}) => {
  const [header, setHeader] = useState({
    NO_INVOICE_BELI: "",
    VENDOR_ID: "",
    TGL_INVOICE: new Date(),
    TOTAL_BAYAR: 0,
    JUMLAH_BAYAR: 0,   // Input nominal yang dibayar sekarang
    SISA_TAGIHAN: 0,   // Otomatis: Total - Bayar
    STATUS_BAYAR: "Belum Lunas",
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 1. Reset Form & Auto-generate No Invoice
  useEffect(() => {
    if (visible) {
      setHeader({
        NO_INVOICE_BELI: `PURCH-${Date.now()}`,
        VENDOR_ID: "",
        TGL_INVOICE: new Date(),
        TOTAL_BAYAR: 0,
        JUMLAH_BAYAR: 0,
        SISA_TAGIHAN: 0,
        STATUS_BAYAR: "Belum Lunas",
      });
      setItems([]);
      setErrors({});
    }
  }, [visible]);

  // 2. LOGIC SAKTI: Hitung Total & Sisa & Status Otomatis
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.SUBTOTAL || 0), 0);
    const bayar = header.JUMLAH_BAYAR || 0;
    const sisa = total - bayar;

    let status = "Belum Lunas";
    if (total > 0) {
      if (bayar >= total) status = "Lunas";
      else if (bayar > 0) status = "Cicil";
    }

    setHeader((prev) => ({
      ...prev,
      TOTAL_BAYAR: total,
      SISA_TAGIHAN: sisa < 0 ? 0 : sisa,
      STATUS_BAYAR: status,
    }));
  }, [items, header.JUMLAH_BAYAR]);

  const addRow = () => {
    setItems([
      ...items,
      {
        BARANG_KODE: "",
        QTY_BELI: 1,
        HARGA_SATUAN: 0,
        SUBTOTAL: 0,
        KODE_GUDANG: "",
        KODE_RAK: "",
        BATCH_NO: "",
        TGL_KADALUARSA: null,
      },
    ]);
  };

  const removeRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const onCellEdit = (index, field, value) => {
    let newItems = [...items];
    newItems[index][field] = value;

    if (field === "KODE_GUDANG") newItems[index].KODE_RAK = "";

    if (field === "QTY_BELI" || field === "HARGA_SATUAN") {
      newItems[index].SUBTOTAL = (newItems[index].QTY_BELI || 0) * (newItems[index].HARGA_SATUAN || 0);
    }
    setItems(newItems);
  };

  const validate = () => {
    let err = {};
    if (!header.VENDOR_ID) err.VENDOR_ID = "Vendor wajib dipilih";
    if (items.length === 0) err.items = "Minimal harus ada 1 barang";
    items.forEach((item, i) => {
      if (!item.BARANG_KODE) err[`item_${i}`] = "Barang kosong";
      if (!item.KODE_GUDANG) err[`gudang_${i}`] = "Gudang kosong";
    });
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const payload = {
      header: {
        ...header,
        TGL_INVOICE: header.TGL_INVOICE.toISOString().split("T")[0],
      },
      items: items.map((item) => ({
        ...item,
        TGL_KADALUARSA: item.TGL_KADALUARSA ? item.TGL_KADALUARSA.toISOString().split("T")[0] : null,
      })),
    };

    await onSave(payload);
    setLoading(false);
  };

  return (
    <Dialog
      header="Input Transaksi Pembelian Baru"
      visible={visible}
      style={{ width: "95vw" }}
      modal
      onHide={onHide}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button label="Simpan Transaksi" icon="pi pi-check" severity="success" onClick={handleSubmit} loading={loading} />
        </div>
      }
    >
      <div className="p-fluid grid">
        {/* HEADER SECTION */}
        <div className="field col-12 md:col-3">
          <label className="font-bold">No. Invoice</label>
          <InputText value={header.NO_INVOICE_BELI} readOnly disabled className="bg-gray-100" />
        </div>
        <div className="field col-12 md:col-3">
          <label className="font-bold">Tanggal</label>
          <Calendar value={header.TGL_INVOICE} onChange={(e) => setHeader({ ...header, TGL_INVOICE: e.value })} showIcon />
        </div>
        <div className="field col-12 md:col-6">
          <label className="font-bold">Vendor <span className="text-red-500">*</span></label>
          <Dropdown
            value={header.VENDOR_ID}
            options={vendors}
            optionLabel="NAMA_VENDOR"
            optionValue="VENDOR_ID"
            placeholder="Pilih Vendor"
            onChange={(e) => setHeader({ ...header, VENDOR_ID: e.value })}
            className={errors.VENDOR_ID ? "p-invalid" : ""}
            filter
          />
          {errors.VENDOR_ID && <small className="p-error">{errors.VENDOR_ID}</small>}
        </div>

        {/* PAYMENT SECTION */}
        <div className="field col-12 md:col-3">
          <label className="font-bold text-primary">Total Pembelian</label>
          <InputNumber value={header.TOTAL_BAYAR} readOnly disabled mode="currency" currency="IDR" locale="id-ID" inputClassName="text-xl font-bold text-primary" />
        </div>
        <div className="field col-12 md:col-3">
          <label className="font-bold text-green-600">Jumlah Bayar Sekarang (DP/Cash)</label>
          <InputNumber 
            value={header.JUMLAH_BAYAR} 
            onValueChange={(e) => setHeader({ ...header, JUMLAH_BAYAR: e.value })} 
            mode="currency" currency="IDR" locale="id-ID" 
            min={0}
            max={header.TOTAL_BAYAR}
            inputClassName="text-xl font-bold text-green-600"
          />
        </div>
        <div className="field col-12 md:col-3">
          <label className="font-bold text-red-500">Sisa Tagihan (Hutang)</label>
          <InputNumber value={header.SISA_TAGIHAN} readOnly disabled mode="currency" currency="IDR" locale="id-ID" inputClassName="text-xl font-bold text-red-500" />
        </div>
        <div className="field col-12 md:col-3">
          <label className="font-bold">Status Bayar</label>
          <div className={`p-3 border-round text-center font-bold ${
            header.STATUS_BAYAR === 'Lunas' ? 'bg-green-100 text-green-700' : 
            header.STATUS_BAYAR === 'Cicil' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
          }`}>
            {header.STATUS_BAYAR.toUpperCase()}
          </div>
        </div>

        <Divider align="left"><b>Rincian Barang & Lokasi Simpan</b></Divider>

        {/* DETAIL TABLE */}
        <div className="col-12">
          {errors.items && <Message severity="error" text={errors.items} className="mb-2 w-full" />}
          <DataTable value={items} responsiveLayout="scroll" size="small" className="p-datatable-gridlines shadow-1">
            <Column header="Barang" style={{ width: "25%" }} body={(data, options) => (
              <Dropdown
                value={data.BARANG_KODE}
                options={barangs}
                optionLabel="NAMA_BARANG"
                optionValue="BARANG_KODE"
                placeholder="Pilih Barang"
                onChange={(e) => onCellEdit(options.rowIndex, "BARANG_KODE", e.value)}
                filter
              />
            )} />

            <Column header="Gudang/Rak" style={{ width: "20%" }} body={(data, options) => (
              <div className="flex flex-column gap-1">
                <Dropdown
                  value={data.KODE_GUDANG}
                  options={gudangs}
                  optionLabel="NAMA_GUDANG"
                  optionValue="KODE_GUDANG"
                  placeholder="Gudang"
                  onChange={(e) => onCellEdit(options.rowIndex, "KODE_GUDANG", e.value)}
                />
                <Dropdown
                  value={data.KODE_RAK}
                  options={raks ? raks.filter((r) => r.KODE_GUDANG === data.KODE_GUDANG) : []}
                  optionLabel="NAMA_RAK"
                  optionValue="KODE_RAK"
                  placeholder="Rak"
                  disabled={!data.KODE_GUDANG}
                  onChange={(e) => onCellEdit(options.rowIndex, "KODE_RAK", e.value)}
                />
              </div>
            )} />

            <Column header="Batch/Exp" body={(data, options) => (
              <div className="flex flex-column gap-1">
                <InputText value={data.BATCH_NO} placeholder="Batch" onChange={(e) => onCellEdit(options.rowIndex, "BATCH_NO", e.target.value)} />
                <Calendar value={data.TGL_KADALUARSA} onChange={(e) => onCellEdit(options.rowIndex, "TGL_KADALUARSA", e.value)} placeholder="Kadaluarsa" showIcon />
              </div>
            )} />

            <Column header="Qty" style={{ width: "8%" }} body={(data, options) => (
              <InputNumber value={data.QTY_BELI} onValueChange={(e) => onCellEdit(options.rowIndex, "QTY_BELI", e.value)} min={1} />
            )} />

            <Column header="Harga" body={(data, options) => (
              <InputNumber value={data.HARGA_SATUAN} onValueChange={(e) => onCellEdit(options.rowIndex, "HARGA_SATUAN", e.value)} mode="decimal" />
            )} />

            <Column header="Subtotal" body={(data) => (
              <span className="font-bold">{new Intl.NumberFormat("id-ID").format(data.SUBTOTAL || 0)}</span>
            )} />

            <Column body={(_, options) => (
              <Button icon="pi pi-trash" severity="danger" text onClick={() => removeRow(options.rowIndex)} />
            )} />
          </DataTable>

          <Button label="Tambah Item" icon="pi pi-plus" className="p-button-outlined mt-3" onClick={addRow} />
        </div>
      </div>
    </Dialog>
  );
};

export default FormPembelian;