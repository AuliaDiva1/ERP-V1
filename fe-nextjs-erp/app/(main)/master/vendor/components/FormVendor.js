"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormVendor = ({
  visible,
  onHide,
  onSave,
  selectedVendor,
  vendorList,
}) => {
  const [vendorId, setVendorId] = useState("");
  const [namaVendor, setNamaVendor] = useState("");
  const [alamatVendor, setAlamatVendor] = useState("");
  const [pic, setPic] = useState("");
  const [noTelpPic, setNoTelpPic] = useState("");
  const [emailPic, setEmailPic] = useState("");
  const [ketersediaanBarang, setKetersediaanBarang] = useState("Tersedia");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const ketersediaanOptions = [
    { label: "Tersedia", value: "Tersedia" },
    { label: "Tidak Tersedia", value: "Tidak Tersedia" },
  ];

  // Generate Vendor ID otomatis (untuk mode tambah)
  const generateVendorId = () => {
    if (!vendorList || vendorList.length === 0) {
      return "V0001";
    }

    // Ambil vendor terakhir berdasarkan VENDOR_ID
    const sortedList = [...vendorList].sort((a, b) => {
      const numA = parseInt(a.VENDOR_ID.replace("V", ""), 10);
      const numB = parseInt(b.VENDOR_ID.replace("V", ""), 10);
      return numB - numA;
    });

    const lastVendor = sortedList[0];
    const lastId = lastVendor?.VENDOR_ID || "V0000";

    // Extract angka dari ID terakhir
    const numericPart = parseInt(lastId.replace("V", ""), 10);
    const nextNumber = isNaN(numericPart) ? 1 : numericPart + 1;

    // Format: V + angka 4 digit
    return `V${nextNumber.toString().padStart(4, "0")}`;
  };

  // Inisialisasi form setiap kali dialog dibuka
  useEffect(() => {
    if (!visible) return;

    if (selectedVendor) {
      // Mode EDIT
      setVendorId(selectedVendor.VENDOR_ID || "");
      setNamaVendor(selectedVendor.NAMA_VENDOR || "");
      setAlamatVendor(selectedVendor.ALAMAT_VENDOR || "");
      setPic(selectedVendor.PIC || "");
      setNoTelpPic(selectedVendor.NO_TELP_PIC || "");
      setEmailPic(selectedVendor.EMAIL_PIC || "");
      setKetersediaanBarang(selectedVendor.KETERSEDIAAN_BARANG || "Tersedia");
    } else {
      // Mode TAMBAH - Generate ID otomatis
      const newId = generateVendorId();
      setVendorId(newId);
      setNamaVendor("");
      setAlamatVendor("");
      setPic("");
      setNoTelpPic("");
      setEmailPic("");
      setKetersediaanBarang("Tersedia");
    }
    setErrors({});
  }, [visible, selectedVendor, vendorList]);

  // Reset form
  const resetForm = () => {
    setVendorId("");
    setNamaVendor("");
    setAlamatVendor("");
    setPic("");
    setNoTelpPic("");
    setEmailPic("");
    setKetersediaanBarang("Tersedia");
    setErrors({});
  };

  // Validasi email
  const validateEmail = (email) => {
    if (!email) return true; // Email opsional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validasi form
  const validateForm = () => {
    const newErrors = {};

    if (!namaVendor.trim()) {
      newErrors.namaVendor = "Nama vendor wajib diisi";
    }

    if (!alamatVendor.trim()) {
      newErrors.alamatVendor = "Alamat vendor wajib diisi";
    }

    if (!pic.trim()) {
      newErrors.pic = "PIC wajib diisi";
    }

    if (emailPic && !validateEmail(emailPic)) {
      newErrors.emailPic = "Format email tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    // Validasi field
    if (!validateForm()) {
      return;
    }

    const data = {
      NAMA_VENDOR: namaVendor.trim(),
      ALAMAT_VENDOR: alamatVendor.trim(),
      PIC: pic.trim(),
      KETERSEDIAAN_BARANG: ketersediaanBarang,
    };

    // Tambahkan field opsional jika diisi
    if (noTelpPic.trim()) {
      data.NO_TELP_PIC = noTelpPic.trim();
    }

    if (emailPic.trim()) {
      data.EMAIL_PIC = emailPic.trim();
    }

    // Hanya kirim VENDOR_ID saat edit (backend akan auto-generate saat create)
    if (selectedVendor) {
      data.VENDOR_ID = vendorId;
    }

    setLoading(true);
    await onSave(data);
    setLoading(false);
    resetForm();
  };

  // Handle dialog close
  const handleHide = () => {
    resetForm();
    onHide();
  };

  return (
    <Dialog
      header={selectedVendor ? `Edit Vendor: ${selectedVendor.NAMA_VENDOR || ""}` : "Tambah Vendor Baru"}
      visible={visible}
      style={{ minWidth: "600px", maxWidth: "700px" }}
      modal
      onHide={handleHide}
      draggable={false}
      dismissableMask
    >
      <div className="p-fluid">
        {/* Vendor ID - Tampilkan di semua mode (read-only) */}
        <div className="field mb-4">
          <label htmlFor="vendorId" className="block text-900 font-medium mb-2">
            Kode Vendor <span className="text-red-500">*</span>
          </label>
          <InputText
            id="vendorId"
            value={vendorId}
            readOnly
            disabled
            className="p-disabled w-full"
          />
          {!selectedVendor && (
            <small className="text-500 block mt-1">
              Kode akan di-generate otomatis dengan format VXXXX
            </small>
          )}
        </div>

        {/* Nama Vendor */}
        <div className="field mb-4">
          <label htmlFor="namaVendor" className="block text-900 font-medium mb-2">
            Nama Vendor <span className="text-red-500">*</span>
          </label>
          <InputText
            id="namaVendor"
            value={namaVendor}
            onChange={(e) => {
              setNamaVendor(e.target.value);
              if (errors.namaVendor) {
                setErrors({ ...errors, namaVendor: null });
              }
            }}
            placeholder="Masukkan nama vendor"
            maxLength={100}
            autoFocus
            className={`w-full ${errors.namaVendor ? 'p-invalid' : ''}`}
          />
          {errors.namaVendor && (
            <small className="p-error block mt-1">{errors.namaVendor}</small>
          )}
        </div>

        {/* Alamat Vendor */}
        <div className="field mb-4">
          <label htmlFor="alamatVendor" className="block text-900 font-medium mb-2">
            Alamat Vendor <span className="text-red-500">*</span>
          </label>
          <InputTextarea
            id="alamatVendor"
            value={alamatVendor}
            onChange={(e) => {
              setAlamatVendor(e.target.value);
              if (errors.alamatVendor) {
                setErrors({ ...errors, alamatVendor: null });
              }
            }}
            placeholder="Masukkan alamat lengkap vendor"
            rows={3}
            maxLength={255}
            autoResize
            className={`w-full ${errors.alamatVendor ? 'p-invalid' : ''}`}
          />
          {errors.alamatVendor && (
            <small className="p-error block mt-1">{errors.alamatVendor}</small>
          )}
          <small className="text-500 block mt-1">
            {alamatVendor.length}/255 karakter
          </small>
        </div>

        {/* PIC (Person In Charge) */}
        <div className="field mb-4">
          <label htmlFor="pic" className="block text-900 font-medium mb-2">
            PIC (Person In Charge) <span className="text-red-500">*</span>
          </label>
          <InputText
            id="pic"
            value={pic}
            onChange={(e) => {
              setPic(e.target.value);
              if (errors.pic) {
                setErrors({ ...errors, pic: null });
              }
            }}
            placeholder="Masukkan nama PIC"
            maxLength={100}
            className={`w-full ${errors.pic ? 'p-invalid' : ''}`}
          />
          {errors.pic && (
            <small className="p-error block mt-1">{errors.pic}</small>
          )}
        </div>

        {/* No. Telp PIC */}
        <div className="field mb-4">
          <label htmlFor="noTelpPic" className="block text-900 font-medium mb-2">
            No. Telepon PIC
          </label>
          <InputText
            id="noTelpPic"
            value={noTelpPic}
            onChange={(e) => setNoTelpPic(e.target.value)}
            placeholder="Contoh: 081234567890"
            maxLength={20}
            className="w-full"
          />
          <small className="text-500 block mt-1">
            Opsional - Nomor telepon yang dapat dihubungi
          </small>
        </div>

        {/* Email PIC */}
        <div className="field mb-4">
          <label htmlFor="emailPic" className="block text-900 font-medium mb-2">
            Email PIC
          </label>
          <InputText
            id="emailPic"
            value={emailPic}
            onChange={(e) => {
              setEmailPic(e.target.value);
              if (errors.emailPic) {
                setErrors({ ...errors, emailPic: null });
              }
            }}
            placeholder="Contoh: pic@vendor.com"
            maxLength={100}
            type="email"
            className={`w-full ${errors.emailPic ? 'p-invalid' : ''}`}
          />
          {errors.emailPic && (
            <small className="p-error block mt-1">{errors.emailPic}</small>
          )}
          <small className="text-500 block mt-1">
            Opsional - Email untuk korespondensi
          </small>
        </div>

        {/* Ketersediaan Barang */}
        <div className="field mb-4">
          <label htmlFor="ketersediaanBarang" className="block text-900 font-medium mb-2">
            Ketersediaan Barang <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="ketersediaanBarang"
            value={ketersediaanBarang}
            options={ketersediaanOptions}
            onChange={(e) => setKetersediaanBarang(e.value)}
            placeholder="Pilih status ketersediaan"
            className="w-full"
          />
        </div>

        {/* Tombol */}
        <div className="flex justify-content-end gap-2 mt-5 pt-4 border-top-1 surface-border">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={handleHide}
            disabled={loading}
            type="button"
          />
          <Button
            label={selectedVendor ? "Update Vendor" : "Tambah Vendor"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-save"}
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
            type="submit"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormVendor;