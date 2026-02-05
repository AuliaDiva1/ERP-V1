"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormGudang = ({
  visible,
  onHide,
  onSave,
  selectedGudang,
  gudangList,
}) => {
  const [kodeGudang, setKodeGudang] = useState("");
  const [namaGudang, setNamaGudang] = useState("");
  const [alamat, setAlamat] = useState("");
  const [status, setStatus] = useState("Aktif");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Tidak Aktif", value: "Tidak Aktif" },
  ];

  // Generate Kode Gudang otomatis (Contoh: GDG001)
  const generateKodeGudang = () => {
    if (!gudangList || gudangList.length === 0) return "GDG001";

    const sortedList = [...gudangList].sort((a, b) => {
      const numA = parseInt(a.KODE_GUDANG?.replace("GDG", "") || 0, 10);
      const numB = parseInt(b.KODE_GUDANG?.replace("GDG", "") || 0, 10);
      return numB - numA;
    });

    const lastId = sortedList[0]?.KODE_GUDANG || "GDG000";
    const numericPart = parseInt(lastId.replace("GDG", ""), 10);
    const nextNumber = isNaN(numericPart) ? 1 : numericPart + 1;

    return `GDG${nextNumber.toString().padStart(3, "0")}`;
  };

  useEffect(() => {
    if (!visible) return;

    if (selectedGudang) {
      // Mode EDIT
      setKodeGudang(selectedGudang.KODE_GUDANG || "");
      setNamaGudang(selectedGudang.NAMA_GUDANG || "");
      setAlamat(selectedGudang.ALAMAT || "");
      setStatus(selectedGudang.STATUS || "Aktif");
    } else {
      // Mode TAMBAH
      setKodeGudang(generateKodeGudang());
      setNamaGudang("");
      setAlamat("");
      setStatus("Aktif");
    }
    setErrors({});
  }, [visible, selectedGudang, gudangList]);

  const validateForm = () => {
    const newErrors = {};
    if (!namaGudang.trim()) {
      newErrors.namaGudang = "Nama gudang wajib diisi";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const data = {
      KODE_GUDANG: kodeGudang,
      NAMA_GUDANG: namaGudang.trim(),
      ALAMAT: alamat.trim(),
      STATUS: status,
    };

    setLoading(true);
    await onSave(data);
    setLoading(false);
    onHide();
  };

  return (
    <Dialog
      header={selectedGudang ? `Edit Gudang: ${selectedGudang.NAMA_GUDANG}` : "Tambah Gudang Baru"}
      visible={visible}
      style={{ width: "450px" }}
      modal
      onHide={onHide}
      draggable={false}
      dismissableMask
    >
      <div className="p-fluid">
        {/* Kode Gudang */}
        <div className="field mb-4">
          <label htmlFor="kodeGudang" className="font-bold block mb-2">
            Kode Gudang
          </label>
          <InputText
            id="kodeGudang"
            value={kodeGudang}
            readOnly
            disabled
            className="p-disabled bg-gray-100"
          />
        </div>

        {/* Nama Gudang */}
        <div className="field mb-4">
          <label htmlFor="namaGudang" className="font-bold block mb-2">
            Nama Gudang <span className="text-red-500">*</span>
          </label>
          <InputText
            id="namaGudang"
            value={namaGudang}
            onChange={(e) => {
              setNamaGudang(e.target.value);
              if (errors.namaGudang) setErrors({ ...errors, namaGudang: null });
            }}
            placeholder="Contoh: Gudang Utama"
            className={errors.namaGudang ? "p-invalid" : ""}
          />
          {errors.namaGudang && <small className="p-error">{errors.namaGudang}</small>}
        </div>

        {/* Alamat */}
        <div className="field mb-4">
          <label htmlFor="alamat" className="font-bold block mb-2">
            Alamat Gudang
          </label>
          <InputTextarea
            id="alamat"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            rows={3}
            autoResize
            placeholder="Masukkan alamat lengkap..."
          />
        </div>

        {/* Status */}
        <div className="field mb-4">
          <label htmlFor="status" className="font-bold block mb-2">
            Status
          </label>
          <Dropdown
            id="status"
            value={status}
            options={statusOptions}
            onChange={(e) => setStatus(e.value)}
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-content-end gap-2 mt-5">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
            disabled={loading}
          />
          <Button
            label={selectedGudang ? "Simpan Perubahan" : "Simpan Gudang"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
            onClick={handleSubmit}
            disabled={loading}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormGudang;