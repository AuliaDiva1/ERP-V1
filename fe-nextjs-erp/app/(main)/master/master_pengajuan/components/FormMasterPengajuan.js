"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

const FormPengajuan = ({ visible, onHide, onSave, selectedData }) => {
  const [formData, setFormData] = useState({
    KODE_PENGAJUAN: "",
    NAMA_PENGAJUAN: "",
    KATEGORI: null,
    KETERANGAN: "",
    STATUS: "Aktif",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible && selectedData) {
      setFormData({
        KODE_PENGAJUAN: selectedData.KODE_PENGAJUAN || "",
        NAMA_PENGAJUAN: selectedData.NAMA_PENGAJUAN || "",
        KATEGORI: selectedData.KATEGORI || null,
        KETERANGAN: selectedData.KETERANGAN || "",
        STATUS:
          selectedData.STATUS === "Tidak aktif"
            ? "Tidak aktif"
            : "Aktif",
      });
    } else {
      setFormData({
        KODE_PENGAJUAN: "",
        NAMA_PENGAJUAN: "",
        KATEGORI: null,
        KETERANGAN: "",
        STATUS: "Aktif",
      });
    }
    setErrors({});
  }, [visible, selectedData]);

  const validateForm = () => {
    const err = {};
    if (!formData.KODE_PENGAJUAN?.trim())
      err.KODE_PENGAJUAN = "Kode pengajuan wajib diisi";
    if (!formData.NAMA_PENGAJUAN?.trim())
      err.NAMA_PENGAJUAN = "Nama pengajuan wajib diisi";
    if (!formData.KATEGORI)
      err.KATEGORI = "Kategori wajib dipilih";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      KODE_PENGAJUAN: formData.KODE_PENGAJUAN.trim(),
      NAMA_PENGAJUAN: formData.NAMA_PENGAJUAN.trim(),
      KATEGORI: formData.KATEGORI,
      KETERANGAN: formData.KETERANGAN?.trim() || null,
      STATUS: formData.STATUS, // "Aktif" | "Tidak aktif"
    };

    setLoading(true);
    try {
      await onSave(payload);
    } catch (error) {
      console.error("Submit Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const kategoriOptions = [
    { label: "Kinerja", value: "Kinerja" },
    { label: "Operasional", value: "Operasional" },
  ];

  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Tidak aktif", value: "Tidak aktif" },
  ];

  return (
    <Dialog
      header={selectedData ? "Edit Master Pengajuan" : "Tambah Master Pengajuan"}
      visible={visible}
      style={{ width: "600px" }}
      modal
      onHide={onHide}
      draggable={false}
    >
      <div className="p-fluid grid mt-2">
        <div className="field col-12 md:col-6">
          <label className="font-bold">Kode Pengajuan</label>
          <InputText
            value={formData.KODE_PENGAJUAN}
            onChange={(e) =>
              setFormData({ ...formData, KODE_PENGAJUAN: e.target.value })
            }
            className={errors.KODE_PENGAJUAN ? "p-invalid" : ""}
            placeholder="Contoh: PJG004"
          />
          {errors.KODE_PENGAJUAN && (
            <small className="p-error">{errors.KODE_PENGAJUAN}</small>
          )}
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-bold">Nama Pengajuan</label>
          <InputText
            value={formData.NAMA_PENGAJUAN}
            onChange={(e) =>
              setFormData({ ...formData, NAMA_PENGAJUAN: e.target.value })
            }
            className={errors.NAMA_PENGAJUAN ? "p-invalid" : ""}
          />
          {errors.NAMA_PENGAJUAN && (
            <small className="p-error">{errors.NAMA_PENGAJUAN}</small>
          )}
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-bold">Kategori</label>
          <Dropdown
            value={formData.KATEGORI}
            options={kategoriOptions}
            placeholder="Pilih Kategori"
            onChange={(e) =>
              setFormData({ ...formData, KATEGORI: e.value })
            }
            className={errors.KATEGORI ? "p-invalid" : ""}
          />
          {errors.KATEGORI && (
            <small className="p-error">{errors.KATEGORI}</small>
          )}
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-bold">Status</label>
          <Dropdown
            value={formData.STATUS}
            options={statusOptions}
            onChange={(e) =>
              setFormData({ ...formData, STATUS: e.value })
            }
          />
        </div>

        <div className="field col-12">
          <label className="font-bold">Keterangan</label>
          <InputTextarea
            rows={3}
            value={formData.KETERANGAN}
            onChange={(e) =>
              setFormData({ ...formData, KETERANGAN: e.target.value })
            }
            placeholder="Opsional"
          />
        </div>

        <div className="col-12 mt-4 flex justify-content-end gap-2">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
          />
          <Button
            label="Simpan Data"
            icon="pi pi-save"
            loading={loading}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormPengajuan;