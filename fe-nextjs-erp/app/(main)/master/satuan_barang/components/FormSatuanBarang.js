"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormSatuanBarang = ({ visible, onHide, onSave, selectedData }) => {
  const [kodeSatuan, setKodeSatuan] = useState("");
  const [namaSatuan, setNamaSatuan] = useState("");
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
      setKodeSatuan(selectedData.KODE_SATUAN || "");
      setNamaSatuan(selectedData.NAMA_SATUAN || "");
      setStatus(selectedData.STATUS || "Aktif");
    } else {
      setKodeSatuan("");
      setNamaSatuan("");
      setStatus("Aktif");
    }
    setErrors({});
  }, [visible, selectedData]);

  const handleSubmit = async () => {
    const newErrors = {};
    if (!kodeSatuan.trim()) newErrors.kodeSatuan = "Kode satuan wajib";
    if (!namaSatuan.trim()) newErrors.namaSatuan = "Nama satuan wajib";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    await onSave({ KODE_SATUAN: kodeSatuan.toUpperCase(), NAMA_SATUAN: namaSatuan, STATUS: status });
    setLoading(false);
  };

  return (
    <Dialog header="Master Satuan" visible={visible} style={{ width: "400px" }} modal onHide={onHide}>
      <div className="p-fluid">
        <div className="field mb-3">
          <label>Kode Satuan (Pcs/Box/Kg)</label>
          <InputText value={kodeSatuan} onChange={(e) => setKodeSatuan(e.target.value)} className={errors.kodeSatuan ? 'p-invalid' : ''} />
        </div>
        <div className="field mb-3">
          <label>Nama Satuan</label>
          <InputText value={namaSatuan} onChange={(e) => setNamaSatuan(e.target.value)} className={errors.namaSatuan ? 'p-invalid' : ''} />
        </div>
        <div className="field mb-4">
          <label>Status</label>
          <Dropdown value={status} options={statusOptions} onChange={(e) => setStatus(e.value)} />
        </div>
        <Button label="Simpan Satuan" icon="pi pi-save" loading={loading} onClick={handleSubmit} />
      </div>
    </Dialog>
  );
};

export default FormSatuanBarang;