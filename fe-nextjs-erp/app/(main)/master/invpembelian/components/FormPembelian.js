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
  vendors = [],
  barangs = [],
  gudangs = [],
  raks = [],
  jenisBarangs = [],
}) => {
  const [header, setHeader] = useState({
    NO_INVOICE_BELI: "",
    VENDOR_ID: "",
    TGL_INVOICE: new Date(),
    TOTAL_BAYAR: 0,
    JUMLAH_BAYAR: 0,
    SISA_TAGIHAN: 0,
    STATUS_BAYAR: "Belum Lunas",
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset Form saat modal dibuka
  useEffect(() => {
    if (visible) {
      setHeader({
        NO_INVOICE_BELI: "",
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

  // Kalkulasi Otomatis Total & Sisa Tagihan
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

  // Fungsi pembersihan tanggal untuk MySQL (YYYY-MM-DD)
  const formatDateForMySQL = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addRow = () => {
    setItems([
      ...items,
      {
        JENIS_ID: null, 
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

  const onCellEdit = (index, field, value) => {
    let newItems = [...items];
    newItems[index][field] = value;

    if (field === "JENIS_ID") newItems[index].BARANG_KODE = "";
    if (field === "KODE_GUDANG") newItems[index].KODE_RAK = "";

    if (field === "QTY_BELI" || field === "HARGA_SATUAN") {
      newItems[index].SUBTOTAL = (newItems[index].QTY_BELI || 0) * (newItems[index].HARGA_SATUAN || 0);
    }
    setItems(newItems);
  };

  const validate = () => {
    let err = {};
    if (!header.NO_INVOICE_BELI) err.NO_INVOICE_BELI = "No. Invoice wajib diisi";
    if (!header.VENDOR_ID) err.VENDOR_ID = "Vendor wajib dipilih";
    if (items.length === 0) err.items = "Minimal masukkan 1 barang";
    
    items.forEach((item, i) => {
      if (!item.JENIS_ID) err[`jenis_${i}`] = "Jenis Kosong";
      if (!item.BARANG_KODE) err[`item_${i}`] = "Barang Kosong";
      if (!item.KODE_GUDANG) err[`gudang_${i}`] = "Lokasi Kosong";
    });

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        header: {
          ...header,
          TGL_INVOICE: formatDateForMySQL(header.TGL_INVOICE),
          TOTAL_BAYAR: Number(header.TOTAL_BAYAR),
          JUMLAH_BAYAR: Number(header.JUMLAH_BAYAR),
          SISA_TAGIHAN: Number(header.SISA_TAGIHAN),
        },
        items: items.map((item) => ({
          ...item,
          TGL_KADALUARSA: formatDateForMySQL(item.TGL_KADALUARSA),
          QTY_BELI: Number(item.QTY_BELI),
          HARGA_SATUAN: Number(item.HARGA_SATUAN),
          SUBTOTAL: Number(item.SUBTOTAL),
        })),
      };

      console.log("Payload Final:", payload);
      await onSave(payload);
    } catch (err) {
      console.error("Submit Error:", err);
    } finally {
      setLoading(false);
    }
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
          <label className="font-bold">No. Invoice <span className="text-red-500">*</span></label>
          <InputText 
            value={header.NO_INVOICE_BELI} 
            onChange={(e) => setHeader({ ...header, NO_INVOICE_BELI: e.target.value.toUpperCase() })} 
            className={errors.NO_INVOICE_BELI ? "p-invalid" : ""}
          />
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
        </div>

        {/* SUMMARY SECTION */}
        <div className="field col-12 md:col-3">
          <label className="font-bold text-primary">Total Pembelian</label>
          <InputNumber value={header.TOTAL_BAYAR} mode="currency" currency="IDR" locale="id-ID" disabled />
        </div>
        <div className="field col-12 md:col-3">
          <label className="font-bold text-green-600">Bayar Sekarang (DP)</label>
          <InputNumber value={header.JUMLAH_BAYAR} onValueChange={(e) => setHeader({ ...header, JUMLAH_BAYAR: e.value })} mode="currency" currency="IDR" locale="id-ID" min={0} />
        </div>
        <div className="field col-12 md:col-3">
          <label className="font-bold text-red-500">Sisa Hutang</label>
          <InputNumber value={header.SISA_TAGIHAN} mode="currency" currency="IDR" locale="id-ID" disabled />
        </div>
        <div className="field col-12 md:col-3">
          <label className="font-bold">Status</label>
          <div className="p-3 border-round text-center font-bold bg-gray-100 text-gray-800 border-1 border-300">
            {header.STATUS_BAYAR.toUpperCase()}
          </div>
        </div>

        <Divider align="left"><b>Rincian Barang & Lokasi Simpan</b></Divider>

        <div className="col-12">
          {errors.items && <Message severity="error" text={errors.items} className="mb-2 w-full" />}
          
          <DataTable value={items} responsiveLayout="scroll" size="small" className="p-datatable-gridlines shadow-1">
            <Column header="Jenis" style={{ width: "15%" }} body={(data, options) => (
              <Dropdown
                value={data.JENIS_ID}
                options={jenisBarangs}
                optionLabel="NAMA_JENIS"
                optionValue="ID" 
                placeholder="Jenis"
                onChange={(e) => onCellEdit(options.rowIndex, "JENIS_ID", e.value)}
                filter
                className={errors[`jenis_${options.rowIndex}`] ? "p-invalid" : ""}
              />
            )} />

            <Column header="Barang" style={{ width: "20%" }} body={(data, options) => {
              const filteredBarangs = barangs.filter(b => Number(b.JENIS_ID) === Number(data.JENIS_ID));
              return (
                <Dropdown
                  value={data.BARANG_KODE}
                  options={filteredBarangs}
                  optionLabel="NAMA_BARANG"
                  optionValue="BARANG_KODE"
                  placeholder={data.JENIS_ID ? "Pilih Barang" : "Pilih Jenis..."}
                  disabled={!data.JENIS_ID}
                  onChange={(e) => onCellEdit(options.rowIndex, "BARANG_KODE", e.value)}
                  filter
                  className={errors[`item_${options.rowIndex}`] ? "p-invalid" : ""}
                />
              );
            }} />

            <Column header="Gudang / Rak" style={{ width: "18%" }} body={(data, options) => (
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
                  options={raks.filter(r => String(r.KODE_GUDANG) === String(data.KODE_GUDANG))}
                  optionLabel="NAMA_RAK"
                  optionValue="KODE_RAK"
                  placeholder="Rak"
                  disabled={!data.KODE_GUDANG}
                  onChange={(e) => onCellEdit(options.rowIndex, "KODE_RAK", e.value)}
                />
              </div>
            )} />

            <Column header="Batch / Exp" style={{ width: "15%" }} body={(data, options) => (
              <div className="flex flex-column gap-1">
                <InputText value={data.BATCH_NO} placeholder="Batch" onChange={(e) => onCellEdit(options.rowIndex, "BATCH_NO", e.target.value)} />
                <Calendar value={data.TGL_KADALUARSA} onChange={(e) => onCellEdit(options.rowIndex, "TGL_KADALUARSA", e.value)} placeholder="Kadaluarsa" showIcon />
              </div>
            )} />

            <Column header="Qty" style={{ width: "8%" }} body={(data, options) => (
              <InputNumber value={data.QTY_BELI} onValueChange={(e) => onCellEdit(options.rowIndex, "QTY_BELI", e.value)} min={1} />
            )} />

            <Column header="Harga" style={{ width: "10%" }} body={(data, options) => (
              <InputNumber value={data.HARGA_SATUAN} onValueChange={(e) => onCellEdit(options.rowIndex, "HARGA_SATUAN", e.value)} mode="decimal" />
            )} />

            <Column header="Subtotal" style={{ width: "10%" }} body={(data) => (
              <span className="font-bold text-primary">{new Intl.NumberFormat("id-ID").format(data.SUBTOTAL || 0)}</span>
            )} />

            <Column style={{ width: "4%" }} body={(_, options) => (
              <Button icon="pi pi-trash" severity="danger" text onClick={() => setItems(items.filter((_, i) => i !== options.rowIndex))} />
            )} />
          </DataTable>

          <Button label="Tambah Baris" icon="pi pi-plus" className="p-button-outlined mt-3" onClick={addRow} />
        </div>
      </div>
    </Dialog>
  );
};

export default FormPembelian;