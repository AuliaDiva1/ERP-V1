"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";

const FormRak = ({ visible, onHide, onSave, selectedData, gudangList }) => {
  const [formData, setFormData] = useState({
    KODE_GUDANG: "",
    KODE_RAK: "",
    NAMA_RAK: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Sinkronisasi data saat Dialog dibuka atau SelectedData berubah
  useEffect(() => {
    if (visible) {
      if (selectedData) {
        setFormData({ 
          KODE_GUDANG: selectedData.KODE_GUDANG || "",
          KODE_RAK: selectedData.KODE_RAK || "",
          NAMA_RAK: selectedData.NAMA_RAK || ""
        });
      } else {
        setFormData({ KODE_GUDANG: "", KODE_RAK: "", NAMA_RAK: "" });
      }
      setErrors({});
    }
  }, [visible, selectedData]);

  // VALIDASI SEMUA FIELD (WAJIB ISI)
  const validate = () => {
    let err = {};
    if (!formData.KODE_GUDANG) err.KODE_GUDANG = "Gudang lokasi wajib dipilih!";
    if (!formData.KODE_RAK?.trim()) err.KODE_RAK = "Kode rak tidak boleh kosong!";
    if (!formData.NAMA_RAK?.trim()) err.NAMA_RAK = "Nama rak wajib diisi!";
    
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await onSave(formData);
      // parent (RakPage) biasanya akan menutup dialog jika onSave berhasil
    } catch (e) {
      console.error("Save Error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Tombol Aksi di bagian bawah Dialog
  const footerContent = (
    <div className="flex justify-content-end gap-2 pt-3">
      <Button 
        label="Batal" 
        icon="pi pi-times" 
        className="p-button-text p-button-secondary" 
        onClick={onHide} 
        disabled={loading}
      />
      <Button 
        label={selectedData ? "Update Data" : "Simpan Data"} 
        icon="pi pi-check" 
        severity="success"
        loading={loading} 
        onClick={handleSubmit} 
      />
    </div>
  );

  return (
    <Dialog 
      header={
        <div className="flex align-items-center gap-2">
          <i className={`pi ${selectedData ? 'pi-pencil' : 'pi-plus-circle'} text-primary`} style={{ fontSize: '1.2rem' }}></i>
          <span className="font-bold">{selectedData ? "Edit Detail Rak" : "Tambah Master Rak Baru"}</span>
        </div>
      } 
      visible={visible} 
      style={{ width: "450px" }} 
      modal 
      onHide={onHide}
      footer={footerContent}
      draggable={false}
      resizable={false}
      className="p-fluid"
    >
      <Divider className="mt-0 mb-4" />
      
      <div className="grid">
        {/* FIELD 1: GUDANG LOKASI */}
        <div className="field col-12 mb-3">
          <label htmlFor="gudang" className="font-bold mb-2 block text-900">
            Gudang Lokasi <span className="text-red-500">*</span>
          </label>
          <Dropdown 
            id="gudang"
            value={formData.KODE_GUDANG} 
            options={gudangList} 
            optionLabel="NAMA_GUDANG" 
            optionValue="KODE_GUDANG" 
            placeholder="-- Pilih Gudang --"
            filter 
            autoFocus
            onChange={(e) => setFormData({...formData, KODE_GUDANG: e.value})}
            className={errors.KODE_GUDANG ? 'p-invalid' : ''}
          />
          {errors.KODE_GUDANG && <small className="p-error block mt-1 font-medium">{errors.KODE_GUDANG}</small>}
        </div>

        {/* FIELD 2: KODE RAK */}
        <div className="field col-12 mb-3">
          <label htmlFor="kode_rak" className="font-bold mb-2 block text-900">
            Kode Rak <span className="text-red-500">*</span>
          </label>
          <InputText 
            id="kode_rak"
            value={formData.KODE_RAK} 
            onChange={(e) => setFormData({...formData, KODE_RAK: e.target.value.toUpperCase()})} 
            placeholder="Contoh: RAK-01"
            className={errors.KODE_RAK ? 'p-invalid font-bold' : 'font-bold'}
          />
          {errors.KODE_RAK && <small className="p-error block mt-1 font-medium">{errors.KODE_RAK}</small>}
        </div>

        {/* FIELD 3: NAMA RAK (SEKARANG WAJIB) */}
        <div className="field col-12 mb-2">
          <label htmlFor="nama_rak" className="font-bold mb-2 block text-900">
            Nama Rak <span className="text-red-500">*</span>
          </label>
          <InputText 
            id="nama_rak"
            value={formData.NAMA_RAK} 
            onChange={(e) => setFormData({...formData, NAMA_RAK: e.target.value})} 
            placeholder="Contoh: Rak Besi Siku Baris A"
            className={errors.NAMA_RAK ? 'p-invalid' : ''}
          />
          {errors.NAMA_RAK && <small className="p-error block mt-1 font-medium">{errors.NAMA_RAK}</small>}
        </div>
      </div>
      
      <div className="bg-blue-50 p-2 border-round mt-4">
         <p className="text-xs text-blue-700 m-0 italic">
          <i className="pi pi-info-circle mr-1" style={{ fontSize: '0.7rem' }}></i>
          Pastikan semua data terisi dengan benar sebelum menyimpan.
        </p>
      </div>
    </Dialog>
  );
};

export default FormRak;