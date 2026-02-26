"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";

const FormMasterPerusahaan = ({ visible, onHide, onSave, selectedData }) => {
  const [formData, setFormData] = useState({
    NAMA_PERUSAHAAN: "",
    ALAMAT_KANTOR: "",
    ALAMAT_GUDANG: "",
    TELEPON: "",
    WA_HOTLINE: "",
    EMAIL: "",
    WEBSITE: "",
    NPWP: "",
    NAMA_BANK: "",
    NOMOR_REKENING: "",
    ATAS_NAMA_BANK: "",
    NAMA_PIMPINAN: "",
    JABATAN_PIMPINAN: "",
    KOTA_TERBIT: "",
    LOGO_PATH: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Sinkronisasi data saat Dialog dibuka
  useEffect(() => {
    if (!visible) return;
    if (selectedData) {
      // Jika Mode EDIT: Isi form dengan data yang dipilih
      setFormData({ ...selectedData });
    } else {
      // Jika Mode TAMBAH: Kosongkan form
      setFormData({
        NAMA_PERUSAHAAN: "",
        ALAMAT_KANTOR: "",
        ALAMAT_GUDANG: "",
        TELEPON: "",
        WA_HOTLINE: "",
        EMAIL: "",
        WEBSITE: "",
        NPWP: "",
        NAMA_BANK: "",
        NOMOR_REKENING: "",
        ATAS_NAMA_BANK: "",
        NAMA_PIMPINAN: "",
        JABATAN_PIMPINAN: "",
        KOTA_TERBIT: "",
        LOGO_PATH: ""
      });
    }
    setErrors({});
  }, [visible, selectedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.NAMA_PERUSAHAAN?.trim()) newErrors.NAMA_PERUSAHAAN = "Nama perusahaan wajib diisi";
    if (!formData.ALAMAT_KANTOR?.trim()) newErrors.ALAMAT_KANTOR = "Alamat kantor wajib diisi";
    if (!formData.KOTA_TERBIT?.trim()) newErrors.KOTA_TERBIT = "Kota terbit wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    // onSave akan menjalankan logic POST (jika baru) atau PUT (jika edit) di Page utama
    await onSave(formData);
    setLoading(false);
  };

  return (
    <Dialog 
      header={selectedData ? "Edit Profil Perusahaan" : "Tambah Profil Perusahaan"} 
      visible={visible} 
      style={{ width: "75vw" }} 
      modal 
      onHide={onHide}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Batal" icon="pi pi-times" onClick={onHide} className="p-button-text p-button-secondary" />
          <Button label="Simpan Data" icon="pi pi-save" loading={loading} onClick={handleSubmit} severity="success" />
        </div>
      }
    >
      <div className="p-fluid grid mt-2">
        {/* SECTION 1: IDENTITAS */}
        <div className="col-12">
           <span className="font-bold text-lg text-primary">1. Identitas & Legalitas</span>
           <Divider />
        </div>
        
        <div className="field col-12 md:col-6">
          <label className="font-semibold">Nama Perusahaan <span className="text-red-500">*</span></label>
          <InputText name="NAMA_PERUSAHAAN" value={formData.NAMA_PERUSAHAAN} onChange={handleChange} className={errors.NAMA_PERUSAHAAN ? 'p-invalid' : ''} />
          {errors.NAMA_PERUSAHAAN && <small className="p-error">{errors.NAMA_PERUSAHAAN}</small>}
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-semibold">NPWP</label>
          <InputText name="NPWP" value={formData.NPWP} onChange={handleChange} placeholder="00.000.000.0-000.000" />
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-semibold">Alamat Kantor <span className="text-red-500">*</span></label>
          <InputTextarea name="ALAMAT_KANTOR" value={formData.ALAMAT_KANTOR} onChange={handleChange} rows={2} className={errors.ALAMAT_KANTOR ? 'p-invalid' : ''} />
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-semibold">Alamat Gudang</label>
          <InputTextarea name="ALAMAT_GUDANG" value={formData.ALAMAT_GUDANG} onChange={handleChange} rows={2} />
        </div>

        {/* SECTION 2: KONTAK */}
        <div className="col-12 mt-3">
           <span className="font-bold text-lg text-primary">2. Kontak & Media</span>
           <Divider />
        </div>

        <div className="field col-12 md:col-3">
          <label className="font-semibold">Telepon</label>
          <InputText name="TELEPON" value={formData.TELEPON} onChange={handleChange} />
        </div>
        <div className="field col-12 md:col-3">
          <label className="font-semibold">WhatsApp</label>
          <InputText name="WA_HOTLINE" value={formData.WA_HOTLINE} onChange={handleChange} />
        </div>
        <div className="field col-12 md:col-3">
          <label className="font-semibold">Email</label>
          <InputText name="EMAIL" value={formData.EMAIL} onChange={handleChange} />
        </div>
        <div className="field col-12 md:col-3">
          <label className="font-semibold">Website</label>
          <InputText name="WEBSITE" value={formData.WEBSITE} onChange={handleChange} />
        </div>

        {/* SECTION 3: BANK & OTORITAS */}
        <div className="col-12 mt-3">
           <span className="font-bold text-lg text-primary">3. Perbankan & Tanda Tangan</span>
           <Divider />
        </div>

        <div className="field col-12 md:col-4">
          <label className="font-semibold">Nama Bank</label>
          <InputText name="NAMA_BANK" value={formData.NAMA_BANK} onChange={handleChange} />
        </div>
        <div className="field col-12 md:col-4">
          <label className="font-semibold">No. Rekening</label>
          <InputText name="NOMOR_REKENING" value={formData.NOMOR_REKENING} onChange={handleChange} />
        </div>
        <div className="field col-12 md:col-4">
          <label className="font-semibold">Atas Nama Bank</label>
          <InputText name="ATAS_NAMA_BANK" value={formData.ATAS_NAMA_BANK} onChange={handleChange} />
        </div>

        <div className="field col-12 md:col-4">
          <label className="font-semibold">Kota Terbit Dokumen <span className="text-red-500">*</span></label>
          <InputText name="KOTA_TERBIT" value={formData.KOTA_TERBIT} onChange={handleChange} className={errors.KOTA_TERBIT ? 'p-invalid' : ''} />
        </div>
        <div className="field col-12 md:col-4">
          <label className="font-semibold">Nama Pimpinan (TTD)</label>
          <InputText name="NAMA_PIMPINAN" value={formData.NAMA_PIMPINAN} onChange={handleChange} />
        </div>
        <div className="field col-12 md:col-4">
          <label className="font-semibold">Jabatan</label>
          <InputText name="JABATAN_PIMPINAN" value={formData.JABATAN_PIMPINAN} onChange={handleChange} />
        </div>

        <div className="field col-12">
          <label className="font-semibold">Logo Path (URL)</label>
          <InputText name="LOGO_PATH" value={formData.LOGO_PATH} onChange={handleChange} placeholder="/images/logo.png" />
        </div>
      </div>
    </Dialog>
  );
};

export default FormMasterPerusahaan;