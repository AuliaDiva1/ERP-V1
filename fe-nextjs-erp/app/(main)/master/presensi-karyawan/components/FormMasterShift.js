"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";

const HARI_OPTIONS = [
  { label: "Senin",  value: "Senin"  },
  { label: "Selasa", value: "Selasa" },
  { label: "Rabu",   value: "Rabu"   },
  { label: "Kamis",  value: "Kamis"  },
  { label: "Jumat",  value: "Jumat"  },
  { label: "Sabtu",  value: "Sabtu"  },
  { label: "Minggu", value: "Minggu" },
];

const STATUS_OPTIONS = [
  { label: "Aktif",    value: "Aktif"    },
  { label: "Nonaktif", value: "Nonaktif" },
];

const EMPTY_FORM = {
  NAMA_SHIFT: "",
  JAM_MASUK:  "",
  JAM_KELUAR: "",
  HARI_KERJA: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
  STATUS:     "Aktif",
};

const FormMasterShift = ({ visible, onHide, onSave, selectedData }) => {
  const toast = useRef(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  /* ── Reset saat buka dialog ─────────────────────────────── */
  useEffect(() => {
    if (!visible) return;
    if (selectedData) {
      setFormData({
        NAMA_SHIFT: selectedData.NAMA_SHIFT || "",
        JAM_MASUK:  selectedData.JAM_MASUK  ? selectedData.JAM_MASUK.substring(0, 5)  : "",
        JAM_KELUAR: selectedData.JAM_KELUAR ? selectedData.JAM_KELUAR.substring(0, 5) : "",
        HARI_KERJA:
          typeof selectedData.HARI_KERJA === "string"
            ? selectedData.HARI_KERJA.split(",").map((h) => h.trim())
            : selectedData.HARI_KERJA || EMPTY_FORM.HARI_KERJA,
        STATUS: selectedData.STATUS || "Aktif",
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
  }, [visible, selectedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ── Validasi ───────────────────────────────────────────── */
  const validate = () => {
    const newErrors = {};
    const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;

    if (!formData.NAMA_SHIFT?.trim())
      newErrors.NAMA_SHIFT = "Nama shift wajib diisi";
    if (!formData.JAM_MASUK)
      newErrors.JAM_MASUK = "Jam masuk wajib diisi";
    else if (!timeRegex.test(formData.JAM_MASUK))
      newErrors.JAM_MASUK = "Format jam tidak valid (HH:MM)";
    if (!formData.JAM_KELUAR)
      newErrors.JAM_KELUAR = "Jam keluar wajib diisi";
    else if (!timeRegex.test(formData.JAM_KELUAR))
      newErrors.JAM_KELUAR = "Format jam tidak valid (HH:MM)";
    if (!formData.HARI_KERJA?.length)
      newErrors.HARI_KERJA = "Pilih minimal 1 hari kerja";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Submit ─────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const payload = {
      ...formData,
      JAM_MASUK:  `${formData.JAM_MASUK}:00`,
      JAM_KELUAR: `${formData.JAM_KELUAR}:00`,
      HARI_KERJA: Array.isArray(formData.HARI_KERJA)
        ? formData.HARI_KERJA.join(",")
        : formData.HARI_KERJA,
    };
    await onSave(payload);
    setLoading(false);
  };

  /* ── Info durasi shift ──────────────────────────────────── */
  const infoDurasi = () => {
    if (!formData.JAM_MASUK || !formData.JAM_KELUAR) return null;
    const [hM, mM] = formData.JAM_MASUK.split(":").map(Number);
    const [hK, mK] = formData.JAM_KELUAR.split(":").map(Number);
    let menitMasuk  = hM * 60 + mM;
    let menitKeluar = hK * 60 + mK;
    const isLintas  = menitKeluar <= menitMasuk;
    if (isLintas) menitKeluar += 24 * 60;
    const durasi = menitKeluar - menitMasuk;
    const jam    = Math.floor(durasi / 60);
    const menit  = durasi % 60;
    return (
      <div className="flex align-items-center gap-2 mt-1">
        <Tag
          severity="info"
          value={`Durasi: ${jam} jam${menit > 0 ? ` ${menit} menit` : ""}`}
          className="text-xs"
        />
        {isLintas && (
          <Tag severity="warning" value="⚠ Lintas tengah malam" className="text-xs" />
        )}
      </div>
    );
  };

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-clock text-primary text-xl" />
          <span>{selectedData ? "Edit Shift" : "Tambah Shift Baru"}</span>
        </div>
      }
      visible={visible}
      style={{ width: "95vw", maxWidth: "500px" }}
      modal
      onHide={onHide}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Batal" icon="pi pi-times" onClick={onHide}
            className="p-button-text p-button-secondary" disabled={loading} />
          <Button label="Simpan" icon="pi pi-save" loading={loading}
            onClick={handleSubmit} severity="success" />
        </div>
      }
    >
      <Toast ref={toast} position="top-center" />

      <div className="p-fluid grid mt-2">

        {/* Nama Shift */}
        <div className="field col-12">
          <label className="font-semibold">
            Nama Shift <span className="text-red-500">*</span>
          </label>
          <InputText
            name="NAMA_SHIFT"
            value={formData.NAMA_SHIFT}
            onChange={handleChange}
            placeholder="Contoh: Pagi, Siang, Malam, Office"
            className={errors.NAMA_SHIFT ? "p-invalid" : ""}
          />
          {errors.NAMA_SHIFT && <small className="p-error">{errors.NAMA_SHIFT}</small>}
        </div>

        <div className="col-12"><Divider className="my-1" /></div>

        {/* Jam Masuk */}
        <div className="field col-12 md:col-6">
          <label className="font-semibold">
            <i className="pi pi-sign-in mr-1 text-green-600" />
            Jam Masuk <span className="text-red-500">*</span>
          </label>
          <InputText
            name="JAM_MASUK"
            value={formData.JAM_MASUK}
            onChange={handleChange}
            placeholder="07:00"
            className={errors.JAM_MASUK ? "p-invalid" : ""}
          />
          {errors.JAM_MASUK
            ? <small className="p-error">{errors.JAM_MASUK}</small>
            : <small className="text-500">Format HH:MM (24 jam)</small>
          }
        </div>

        {/* Jam Keluar */}
        <div className="field col-12 md:col-6">
          <label className="font-semibold">
            <i className="pi pi-sign-out mr-1 text-orange-600" />
            Jam Keluar <span className="text-red-500">*</span>
          </label>
          <InputText
            name="JAM_KELUAR"
            value={formData.JAM_KELUAR}
            onChange={handleChange}
            placeholder="15:00"
            className={errors.JAM_KELUAR ? "p-invalid" : ""}
          />
          {errors.JAM_KELUAR
            ? <small className="p-error">{errors.JAM_KELUAR}</small>
            : <small className="text-500">Format HH:MM (24 jam)</small>
          }
        </div>

        {/* Info durasi */}
        <div className="col-12 mb-1">{infoDurasi()}</div>

        <div className="col-12"><Divider className="my-1" /></div>

        {/* Hari Kerja */}
        <div className="field col-12">
          <label className="font-semibold">
            <i className="pi pi-calendar mr-1 text-primary" />
            Hari Kerja <span className="text-red-500">*</span>
          </label>
          <MultiSelect
            value={formData.HARI_KERJA}
            options={HARI_OPTIONS}
            onChange={(e) => setFormData((p) => ({ ...p, HARI_KERJA: e.value }))}
            placeholder="Pilih hari kerja..."
            display="chip"
            className={errors.HARI_KERJA ? "p-invalid" : ""}
          />
          {errors.HARI_KERJA && <small className="p-error">{errors.HARI_KERJA}</small>}
        </div>

        {/* Status */}
        <div className="field col-12 md:col-6">
          <label className="font-semibold">Status</label>
          <Dropdown
            value={formData.STATUS}
            options={STATUS_OPTIONS}
            onChange={(e) => setFormData((p) => ({ ...p, STATUS: e.value }))}
          />
        </div>

      </div>
    </Dialog>
  );
};

export default FormMasterShift;
