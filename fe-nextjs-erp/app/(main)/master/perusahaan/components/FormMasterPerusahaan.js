"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";

const EMPTY_FORM = {
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
  LOGO_PATH: "",
  // GPS & Geofencing
  LAT_KANTOR: "",
  LON_KANTOR: "",
  RADIUS_METER: 500,
  // Jam Kerja
  JAM_MASUK_NORMAL: "08:00",
  JAM_PULANG_NORMAL: "17:00",
};

const FormMasterPerusahaan = ({ visible, onHide, onSave, selectedData }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!visible) return;
    if (selectedData) {
      setFormData({
        ...EMPTY_FORM,
        ...selectedData,
        RADIUS_METER: selectedData.RADIUS_METER ?? 500,
        JAM_MASUK_NORMAL: selectedData.JAM_MASUK_NORMAL ?? "08:00",
        JAM_PULANG_NORMAL: selectedData.JAM_PULANG_NORMAL ?? "17:00",
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
  }, [visible, selectedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleNumberChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.NAMA_PERUSAHAAN?.trim()) newErrors.NAMA_PERUSAHAAN = "Nama perusahaan wajib diisi";
    if (!formData.ALAMAT_KANTOR?.trim()) newErrors.ALAMAT_KANTOR = "Alamat kantor wajib diisi";
    if (!formData.KOTA_TERBIT?.trim()) newErrors.KOTA_TERBIT = "Kota terbit wajib diisi";
    if (formData.LAT_KANTOR && isNaN(parseFloat(formData.LAT_KANTOR))) newErrors.LAT_KANTOR = "Format latitude tidak valid";
    if (formData.LON_KANTOR && isNaN(parseFloat(formData.LON_KANTOR))) newErrors.LON_KANTOR = "Format longitude tidak valid";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const payload = {
      ...formData,
      LAT_KANTOR: formData.LAT_KANTOR ? parseFloat(formData.LAT_KANTOR) : null,
      LON_KANTOR: formData.LON_KANTOR ? parseFloat(formData.LON_KANTOR) : null,
      RADIUS_METER: formData.RADIUS_METER ? parseInt(formData.RADIUS_METER) : 500,
    };
    await onSave(payload);
    setLoading(false);
  };

  const Field = ({ label, required, error, children }) => (
    <div className="field">
      <label className="font-semibold text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <small className="p-error">{error}</small>}
    </div>
  );

  return (
    <Dialog
      header={selectedData ? "Edit Profil Perusahaan" : "Tambah Profil Perusahaan"}
      visible={visible}
      style={{ width: "80vw", maxWidth: "900px" }}
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

        {/* ===== SECTION 1: IDENTITAS ===== */}
        <div className="col-12">
          <span className="font-bold text-lg text-primary">1. Identitas & Legalitas</span>
          <Divider />
        </div>
        <div className="col-12 md:col-6">
          <Field label="Nama Perusahaan" required error={errors.NAMA_PERUSAHAAN}>
            <InputText name="NAMA_PERUSAHAAN" value={formData.NAMA_PERUSAHAAN} onChange={handleChange} className={errors.NAMA_PERUSAHAAN ? "p-invalid" : ""} placeholder="PT. Contoh Jaya" />
          </Field>
        </div>
        <div className="col-12 md:col-6">
          <Field label="NPWP">
            <InputText name="NPWP" value={formData.NPWP} onChange={handleChange} placeholder="00.000.000.0-000.000" />
          </Field>
        </div>
        <div className="col-12 md:col-6">
          <Field label="Alamat Kantor" required error={errors.ALAMAT_KANTOR}>
            <InputTextarea name="ALAMAT_KANTOR" value={formData.ALAMAT_KANTOR} onChange={handleChange} rows={3} className={errors.ALAMAT_KANTOR ? "p-invalid" : ""} />
          </Field>
        </div>
        <div className="col-12 md:col-6">
          <Field label="Alamat Gudang">
            <InputTextarea name="ALAMAT_GUDANG" value={formData.ALAMAT_GUDANG} onChange={handleChange} rows={3} />
          </Field>
        </div>

        {/* ===== SECTION 2: KONTAK ===== */}
        <div className="col-12 mt-2">
          <span className="font-bold text-lg text-primary">2. Kontak & Media</span>
          <Divider />
        </div>
        <div className="col-12 md:col-3">
          <Field label="Telepon">
            <InputText name="TELEPON" value={formData.TELEPON} onChange={handleChange} placeholder="021-xxxx" />
          </Field>
        </div>
        <div className="col-12 md:col-3">
          <Field label="WhatsApp Hotline">
            <InputText name="WA_HOTLINE" value={formData.WA_HOTLINE} onChange={handleChange} placeholder="08xx-xxxx" />
          </Field>
        </div>
        <div className="col-12 md:col-3">
          <Field label="Email">
            <InputText name="EMAIL" value={formData.EMAIL} onChange={handleChange} placeholder="info@perusahaan.com" />
          </Field>
        </div>
        <div className="col-12 md:col-3">
          <Field label="Website">
            <InputText name="WEBSITE" value={formData.WEBSITE} onChange={handleChange} placeholder="www.perusahaan.com" />
          </Field>
        </div>

        {/* ===== SECTION 3: BANK & OTORITAS ===== */}
        <div className="col-12 mt-2">
          <span className="font-bold text-lg text-primary">3. Perbankan & Tanda Tangan</span>
          <Divider />
        </div>
        <div className="col-12 md:col-4">
          <Field label="Nama Bank">
            <InputText name="NAMA_BANK" value={formData.NAMA_BANK} onChange={handleChange} placeholder="Bank BCA" />
          </Field>
        </div>
        <div className="col-12 md:col-4">
          <Field label="No. Rekening">
            <InputText name="NOMOR_REKENING" value={formData.NOMOR_REKENING} onChange={handleChange} placeholder="1234567890" />
          </Field>
        </div>
        <div className="col-12 md:col-4">
          <Field label="Atas Nama Rekening">
            <InputText name="ATAS_NAMA_BANK" value={formData.ATAS_NAMA_BANK} onChange={handleChange} />
          </Field>
        </div>
        <div className="col-12 md:col-4">
          <Field label="Kota Terbit Dokumen" required error={errors.KOTA_TERBIT}>
            <InputText name="KOTA_TERBIT" value={formData.KOTA_TERBIT} onChange={handleChange} className={errors.KOTA_TERBIT ? "p-invalid" : ""} placeholder="Surabaya" />
          </Field>
        </div>
        <div className="col-12 md:col-4">
          <Field label="Nama Pimpinan (TTD)">
            <InputText name="NAMA_PIMPINAN" value={formData.NAMA_PIMPINAN} onChange={handleChange} placeholder="Budi Santoso" />
          </Field>
        </div>
        <div className="col-12 md:col-4">
          <Field label="Jabatan Pimpinan">
            <InputText name="JABATAN_PIMPINAN" value={formData.JABATAN_PIMPINAN} onChange={handleChange} placeholder="Direktur Utama" />
          </Field>
        </div>

        {/* ===== SECTION 4: GPS & GEOFENCING ===== */}
        <div className="col-12 mt-2">
          <span className="font-bold text-lg text-primary">4. GPS & Geofencing (Absensi)</span>
          <Divider />
        </div>
        <div className="col-12 mb-2">
          <Message
            severity="info"
            text="Koordinat GPS digunakan untuk validasi absensi berbasis lokasi. Radius menentukan jarak maksimal karyawan dari kantor saat absen."
          />
        </div>
        <div className="col-12 md:col-4">
          <Field label="Latitude Kantor" error={errors.LAT_KANTOR}>
            <InputText
              name="LAT_KANTOR"
              value={formData.LAT_KANTOR}
              onChange={handleChange}
              placeholder="-7.2575"
              className={errors.LAT_KANTOR ? "p-invalid" : ""}
            />
          </Field>
        </div>
        <div className="col-12 md:col-4">
          <Field label="Longitude Kantor" error={errors.LON_KANTOR}>
            <InputText
              name="LON_KANTOR"
              value={formData.LON_KANTOR}
              onChange={handleChange}
              placeholder="112.7521"
              className={errors.LON_KANTOR ? "p-invalid" : ""}
            />
          </Field>
        </div>
        <div className="col-12 md:col-4">
          <Field label="Radius Geofence (meter)">
            <InputNumber
              value={formData.RADIUS_METER}
              onValueChange={(e) => handleNumberChange("RADIUS_METER", e.value)}
              min={50}
              max={5000}
              showButtons
              suffix=" m"
              placeholder="500"
            />
          </Field>
        </div>

        {/* ===== SECTION 5: JAM KERJA ===== */}
        <div className="col-12 mt-2">
          <span className="font-bold text-lg text-primary">5. Jam Kerja Default (Absensi)</span>
          <Divider />
        </div>
        <div className="col-12 mb-2">
          <Message
            severity="info"
            text="Jam kerja ini menjadi acuan sistem untuk menentukan status Terlambat dan Pulang Awal pada rekap absensi."
          />
        </div>
        <div className="col-12 md:col-3">
          <Field label="Jam Masuk Normal">
            <InputText
              type="time"
              name="JAM_MASUK_NORMAL"
              value={formData.JAM_MASUK_NORMAL}
              onChange={handleChange}
            />
          </Field>
        </div>
        <div className="col-12 md:col-3">
          <Field label="Jam Pulang Normal">
            <InputText
              type="time"
              name="JAM_PULANG_NORMAL"
              value={formData.JAM_PULANG_NORMAL}
              onChange={handleChange}
            />
          </Field>
        </div>

        {/* ===== SECTION 6: LOGO ===== */}
        <div className="col-12 mt-2">
          <span className="font-bold text-lg text-primary">6. Identitas Visual</span>
          <Divider />
        </div>
        <div className="col-12">
          <Field label="Logo Path (URL atau path relatif)">
            <InputText name="LOGO_PATH" value={formData.LOGO_PATH} onChange={handleChange} placeholder="/images/logo.png atau https://cdn.contoh.com/logo.png" />
          </Field>
          {formData.LOGO_PATH && (
            <div className="mt-2 flex align-items-center gap-3">
              <small className="text-gray-500">Preview:</small>
              <img
                src={formData.LOGO_PATH}
                alt="Logo Preview"
                style={{ height: "50px", objectFit: "contain", border: "1px solid #dee2e6", borderRadius: "6px", padding: "4px" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          )}
        </div>

      </div>
    </Dialog>
  );
};

export default FormMasterPerusahaan;