"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormJenisBarang = ({ visible, onHide, onSave, selectedData }) => {
  const [kodeJenis, setKodeJenis] = useState("");
  const [namaJenis, setNamaJenis] = useState("");
  const [status, setStatus] = useState("Aktif");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Tidak Aktif", value: "Tidak Aktif" },
  ];

  useEffect(() => {
    if (!visible) return;
    if (selectedData) {
      setKodeJenis(selectedData.KODE_JENIS || "");
      setNamaJenis(selectedData.NAMA_JENIS || "");
      setStatus(selectedData.STATUS || "Aktif");
    } else {
      setKodeJenis("");
      setNamaJenis("");
      setStatus("Aktif");
    }
    setErrors({});
  }, [visible, selectedData]);

  const validateForm = () => {
    const newErrors = {};
    if (!kodeJenis.trim()) newErrors.kodeJenis = "Kode jenis wajib diisi";
    if (!namaJenis.trim()) newErrors.namaJenis = "Nama jenis wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const data = {
      KODE_JENIS: kodeJenis.trim().toUpperCase(),
      NAMA_JENIS: namaJenis.trim(),
      STATUS: status,
    };

    setLoading(true);
    await onSave(data);
    setLoading(false);
  };

  return (
    <Dialog
      header={selectedData ? "Edit Jenis Barang" : "Tambah Jenis Barang"}
      visible={visible}
      style={{ width: "450px" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-4">
          <label className="font-bold">Kode Jenis <span className="text-red-500">*</span></label>
          <InputText 
            value={kodeJenis} 
            onChange={(e) => setKodeJenis(e.target.value)} 
            placeholder="Contoh: ELK"
            className={errors.kodeJenis ? 'p-invalid' : ''}
          />
          {errors.kodeJenis && <small className="p-error">{errors.kodeJenis}</small>}
        </div>
        <div className="field mb-4">
          <label className="font-bold">Nama Jenis <span className="text-red-500">*</span></label>
          <InputText 
            value={namaJenis} 
            onChange={(e) => setNamaJenis(e.target.value)} 
            className={errors.namaJenis ? 'p-invalid' : ''}
          />
          {errors.namaJenis && <small className="p-error">{errors.namaJenis}</small>}
        </div>
        <div className="field mb-4">
          <label className="font-bold">Status</label>
          <Dropdown value={status} options={statusOptions} onChange={(e) => setStatus(e.value)} />
        </div>
        <div className="flex justify-content-end gap-2 mt-5">
          <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button label="Simpan" icon="pi pi-check" loading={loading} onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
};

export default FormJenisBarang;