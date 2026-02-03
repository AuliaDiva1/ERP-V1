"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormBarang = ({ visible, onHide, onSave, selectedData, jenisList, satuanList }) => {
  const [formData, setFormData] = useState({
    BARANG_KODE: "",
    NAMA_BARANG: "",
    JENIS_ID: null,
    SATUAN_ID: null,
    STOK_MINIMAL: 0,
    STOK_SAAT_INI: 0,
    HARGA_BELI_TERAKHIR: 0,
    STATUS: "Aktif"
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Sync data saat dialog dibuka atau data terpilih berubah
  useEffect(() => {
    if (visible && selectedData) {
      setFormData({ 
        ...selectedData,
        // Pastikan nilai null dari DB terkonversi ke default form
        STOK_MINIMAL: selectedData.STOK_MINIMAL || 0,
        STOK_SAAT_INI: selectedData.STOK_SAAT_INI || 0,
        HARGA_BELI_TERAKHIR: selectedData.HARGA_BELI_TERAKHIR || 0,
      });
    } else {
      // Reset ke awal untuk Tambah Data Baru
      setFormData({
        BARANG_KODE: "",
        NAMA_BARANG: "",
        JENIS_ID: null,
        SATUAN_ID: null,
        STOK_MINIMAL: 0,
        STOK_SAAT_INI: 0,
        HARGA_BELI_TERAKHIR: 0,
        STATUS: "Aktif"
      });
    }
    setErrors({});
  }, [visible, selectedData]);

  const validateForm = () => {
    const err = {};
    if (!formData.BARANG_KODE?.trim()) err.BARANG_KODE = "Kode wajib diisi";
    if (!formData.NAMA_BARANG?.trim()) err.NAMA_BARANG = "Nama wajib diisi";
    if (!formData.JENIS_ID) err.JENIS_ID = "Pilih jenis barang";
    if (!formData.SATUAN_ID) err.SATUAN_ID = "Pilih satuan barang";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Payload yang dikirim hanya kolom murni database (tanpa alias atau kolom otomatis)
    const payload = {
      BARANG_KODE: formData.BARANG_KODE,
      NAMA_BARANG: formData.NAMA_BARANG,
      JENIS_ID: formData.JENIS_ID,
      SATUAN_ID: formData.SATUAN_ID,
      STOK_MINIMAL: formData.STOK_MINIMAL,
      STOK_SAAT_INI: formData.STOK_SAAT_INI,
      HARGA_BELI_TERAKHIR: formData.HARGA_BELI_TERAKHIR,
      STATUS: formData.STATUS
    };

    setLoading(true);
    await onSave(payload); 
    setLoading(false);
  };

  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Non-Aktif", value: "Non-Aktif" },
  ];

  return (
    <Dialog 
      header={selectedData ? "Edit Data Barang" : "Tambah Barang Baru"} 
      visible={visible} 
      style={{ width: "700px" }} 
      modal 
      onHide={onHide}
      draggable={false}
    >
      <div className="p-fluid grid">
        {/* Row 1: Kode & Nama */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Kode Barang</label>
          <InputText 
            value={formData.BARANG_KODE} 
            onChange={(e) => setFormData({...formData, BARANG_KODE: e.target.value})} 
            className={errors.BARANG_KODE ? 'p-invalid' : ''}
            placeholder="Contoh: LAP-ASUS-001"
          />
          {errors.BARANG_KODE && <small className="p-error">{errors.BARANG_KODE}</small>}
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-bold">Nama Barang</label>
          <InputText 
            value={formData.NAMA_BARANG} 
            onChange={(e) => setFormData({...formData, NAMA_BARANG: e.target.value})} 
            className={errors.NAMA_BARANG ? 'p-invalid' : ''}
          />
          {errors.NAMA_BARANG && <small className="p-error">{errors.NAMA_BARANG}</small>}
        </div>

        {/* Row 2: Jenis & Satuan (Dropdown dari DB) */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Jenis Barang</label>
          <Dropdown 
            value={formData.JENIS_ID} 
            options={jenisList} 
            optionLabel="NAMA_JENIS" 
            optionValue="ID" 
            placeholder="Pilih Jenis"
            onChange={(e) => setFormData({...formData, JENIS_ID: e.value})}
            className={errors.JENIS_ID ? 'p-invalid' : ''}
          />
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-bold">Satuan Barang</label>
          <Dropdown 
            value={formData.SATUAN_ID} 
            options={satuanList} 
            optionLabel="NAMA_SATUAN" 
            optionValue="ID" 
            placeholder="Pilih Satuan"
            onChange={(e) => setFormData({...formData, SATUAN_ID: e.value})}
            className={errors.SATUAN_ID ? 'p-invalid' : ''}
          />
        </div>

        {/* Row 3: Stok Minimal & Stok Saat Ini */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Stok Minimal</label>
          <InputNumber 
            value={formData.STOK_MINIMAL} 
            onValueChange={(e) => setFormData({...formData, STOK_MINIMAL: e.value})} 
            min={0}
          />
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-bold">Stok Saat Ini</label>
          <InputNumber 
            value={formData.STOK_SAAT_INI} 
            onValueChange={(e) => setFormData({...formData, STOK_SAAT_INI: e.value})} 
            min={0}
          />
        </div>

        {/* Row 4: Harga & Status */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Harga Beli Terakhir</label>
          <InputNumber 
            value={formData.HARGA_BELI_TERAKHIR} 
            mode="currency" 
            currency="IDR" 
            locale="id-ID" 
            onValueChange={(e) => setFormData({...formData, HARGA_BELI_TERAKHIR: e.value})} 
          />
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-bold">Status</label>
          <Dropdown 
            value={formData.STATUS} 
            options={statusOptions} 
            onChange={(e) => setFormData({...formData, STATUS: e.value})} 
          />
        </div>

        {/* Footer Actions */}
        <div className="col-12 mt-4 flex justify-content-end gap-2">
          <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button label="Simpan Data" icon="pi pi-save" loading={loading} onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
};

export default FormBarang;