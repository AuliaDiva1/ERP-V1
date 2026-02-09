"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Steps } from "primereact/steps";
import { FileUpload } from "primereact/fileupload";
import { Avatar } from "primereact/avatar";

const FormKaryawan = ({
  visible,
  onHide,
  onSave,
  selectedKaryawan,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    // Step 1: Akun
    email: "",
    password: "",
    confirmPassword: "",
    
    // Step 2: Data Pribadi
    nik: "",
    nama: "",
    gender: "L",
    tempat_lahir: "",
    tgl_lahir: null,
    alamat: "",
    no_telp: "",
    
    // Step 3: Data Pekerjaan
    departemen: "",
    jabatan: "",
    tanggal_masuk: new Date(),
    status_karyawan: "Kontrak",
    shift: "",
    pendidikan_terakhir: "",
  });

  // Steps Configuration
  const steps = [
    { label: "Akun Login" },
    { label: "Data Pribadi" },
    { label: "Data Pekerjaan" },
    { label: "Foto & Konfirmasi" }
  ];

  // Dropdown Options
  const genderOptions = [
    { label: "Laki-laki", value: "L" },
    { label: "Perempuan", value: "P" }
  ];

  const departemenOptions = [
    { label: "Human Resource (HR)", value: "HR" },
    { label: "Produksi", value: "PRODUKSI" },
    { label: "Gudang", value: "GUDANG" },
    { label: "Keuangan & Accounting", value: "KEUANGAN" }
  ];

  const jabatanOptions = [
    { label: "Staff", value: "Staff" },
    { label: "Operator", value: "Operator" },
    { label: "Supervisor", value: "Supervisor" },
    { label: "Manager", value: "Manager" },
    { label: "Kepala Departemen", value: "Kepala Departemen" }
  ];

  const statusOptions = [
    { label: "Kontrak", value: "Kontrak" },
    { label: "Tetap", value: "Tetap" },
    { label: "Magang", value: "Magang" }
  ];

  const shiftOptions = [
    { label: "Tidak Ada Shift", value: "" },
    { label: "Pagi (07:00 - 15:00)", value: "Pagi" },
    { label: "Siang (15:00 - 23:00)", value: "Siang" },
    { label: "Malam (23:00 - 07:00)", value: "Malam" }
  ];

  const pendidikanOptions = [
    { label: "SD", value: "SD" },
    { label: "SMP", value: "SMP" },
    { label: "SMA/SMK", value: "SMA/SMK" },
    { label: "D3", value: "D3" },
    { label: "S1", value: "S1" },
    { label: "S2", value: "S2" },
    { label: "S3", value: "S3" }
  ];

  // Initialize form
  useEffect(() => {
    if (!visible) return;

    if (selectedKaryawan) {
      // Mode EDIT - Password tidak ditampilkan
      setFormData({
        email: selectedKaryawan.EMAIL || "",
        password: "", // Tidak diisi saat edit
        confirmPassword: "",
        nik: selectedKaryawan.NIK || "",
        nama: selectedKaryawan.NAMA || "",
        gender: selectedKaryawan.GENDER || "L",
        tempat_lahir: selectedKaryawan.TEMPAT_LAHIR || "",
        tgl_lahir: selectedKaryawan.TGL_LAHIR ? new Date(selectedKaryawan.TGL_LAHIR) : null,
        alamat: selectedKaryawan.ALAMAT || "",
        no_telp: selectedKaryawan.NO_TELP || "",
        departemen: selectedKaryawan.DEPARTEMEN || "",
        jabatan: selectedKaryawan.JABATAN || "",
        tanggal_masuk: selectedKaryawan.TANGGAL_MASUK ? new Date(selectedKaryawan.TANGGAL_MASUK) : new Date(),
        status_karyawan: selectedKaryawan.STATUS_KARYAWAN || "Kontrak",
        shift: selectedKaryawan.SHIFT || "",
        pendidikan_terakhir: selectedKaryawan.PENDIDIKAN_TERAKHIR || "",
      });
      
      // Set foto preview jika ada
      if (selectedKaryawan.FOTO) {
        setFotoPreview(`${process.env.NEXT_PUBLIC_API_URL}${selectedKaryawan.FOTO}`);
      }
    } else {
      // Mode TAMBAH
      resetForm();
    }
    
    setActiveStep(0);
    setErrors({});
  }, [visible, selectedKaryawan]);

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      nik: "",
      nama: "",
      gender: "L",
      tempat_lahir: "",
      tgl_lahir: null,
      alamat: "",
      no_telp: "",
      departemen: "",
      jabatan: "",
      tanggal_masuk: new Date(),
      status_karyawan: "Kontrak",
      shift: "",
      pendidikan_terakhir: "",
    });
    setFoto(null);
    setFotoPreview(null);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFotoSelect = (e) => {
    const file = e.files[0];
    setFoto(file);
    
    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setFotoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Validasi per step
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Akun Login
        if (!formData.email.trim()) {
          newErrors.email = "Email wajib diisi";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Format email tidak valid";
        }

        // Password wajib saat tambah, opsional saat edit
        if (!selectedKaryawan) {
          if (!formData.password) {
            newErrors.password = "Password wajib diisi";
          } else if (formData.password.length < 8) {
            newErrors.password = "Password minimal 8 karakter";
          }

          if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Konfirmasi password tidak cocok";
          }
        }
        break;

      case 1: // Data Pribadi
        if (!formData.nik.trim()) {
          newErrors.nik = "NIK wajib diisi";
        }
        if (!formData.nama.trim()) {
          newErrors.nama = "Nama lengkap wajib diisi";
        }
        break;

      case 2: // Data Pekerjaan
        if (!formData.departemen) {
          newErrors.departemen = "Departemen wajib dipilih";
        }
        if (!formData.jabatan) {
          newErrors.jabatan = "Jabatan wajib dipilih";
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    const data = new FormData();
    
    // Append semua field
    data.append("nik", formData.nik.trim());
    data.append("nama", formData.nama.trim());
    data.append("gender", formData.gender);
    data.append("email", formData.email.trim());
    data.append("departemen", formData.departemen);
    data.append("jabatan", formData.jabatan);
    data.append("status_karyawan", formData.status_karyawan);

    // Password hanya dikirim saat tambah atau jika diisi saat edit
    if (formData.password) {
      data.append("password", formData.password);
    }

    // Field opsional
    if (formData.tempat_lahir) data.append("tempat_lahir", formData.tempat_lahir.trim());
    if (formData.tgl_lahir) {
      const year = formData.tgl_lahir.getFullYear();
      const month = String(formData.tgl_lahir.getMonth() + 1).padStart(2, '0');
      const day = String(formData.tgl_lahir.getDate()).padStart(2, '0');
      data.append("tgl_lahir", `${year}-${month}-${day}`);
    }
    if (formData.alamat) data.append("alamat", formData.alamat.trim());
    if (formData.no_telp) data.append("no_telp", formData.no_telp.trim());
    if (formData.tanggal_masuk) {
      const year = formData.tanggal_masuk.getFullYear();
      const month = String(formData.tanggal_masuk.getMonth() + 1).padStart(2, '0');
      const day = String(formData.tanggal_masuk.getDate()).padStart(2, '0');
      data.append("tanggal_masuk", `${year}-${month}-${day}`);
    }
    if (formData.shift) data.append("shift", formData.shift);
    if (formData.pendidikan_terakhir) data.append("pendidikan_terakhir", formData.pendidikan_terakhir);

    // Foto
    if (foto) {
      data.append("foto", foto);
    }

    setLoading(true);
    await onSave(data);
    setLoading(false);
    resetForm();
  };

  const handleHide = () => {
    resetForm();
    onHide();
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Akun Login
        return (
          <div className="p-fluid">
            <div className="field mb-4">
              <label htmlFor="email" className="block text-900 font-medium mb-2">
                Email (Username) <span className="text-red-500">*</span>
              </label>
              <span className="p-input-icon-left w-full">
                <i className="pi pi-envelope text-400"></i>
                <InputText
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="karyawan@gmail.com"
                  className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  disabled={selectedKaryawan} // Email tidak bisa diubah saat edit
                />
              </span>
              {errors.email && <small className="p-error">{errors.email}</small>}
            </div>

            {!selectedKaryawan && (
              <>
                <div className="field mb-4">
                  <label htmlFor="password" className="block text-900 font-medium mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <span className="p-input-icon-left w-full">
                    <i className="pi pi-lock text-400"></i>
                    <InputText
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </span>
                  {errors.password && <small className="p-error">{errors.password}</small>}
                </div>

                <div className="field mb-4">
                  <label htmlFor="confirmPassword" className="block text-900 font-medium mb-2">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <span className="p-input-icon-left w-full">
                    <i className="pi pi-lock text-400"></i>
                    <InputText
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Ulangi password"
                      className={`w-full ${errors.confirmPassword ? 'p-invalid' : ''}`}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </span>
                  {errors.confirmPassword && <small className="p-error">{errors.confirmPassword}</small>}
                </div>
              </>
            )}

            {selectedKaryawan && (
              <small className="text-500 block">
                <i className="pi pi-info-circle mr-2"></i>
                Email tidak dapat diubah. Password hanya diisi jika ingin mengubahnya.
              </small>
            )}
          </div>
        );

      case 1: // Data Pribadi
        return (
          <div className="p-fluid">
            <div className="grid">
              <div className="col-12 md:col-6">
                <label htmlFor="nik" className="block text-900 font-medium mb-2">
                  NIK <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="nik"
                  value={formData.nik}
                  onChange={(e) => handleInputChange("nik", e.target.value)}
                  placeholder="Nomor Induk Karyawan"
                  className={errors.nik ? 'p-invalid' : ''}
                />
                {errors.nik && <small className="p-error">{errors.nik}</small>}
              </div>

              <div className="col-12 md:col-6">
                <label htmlFor="gender" className="block text-900 font-medium mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  id="gender"
                  value={formData.gender}
                  options={genderOptions}
                  onChange={(e) => handleInputChange("gender", e.value)}
                />
              </div>

              <div className="col-12">
                <label htmlFor="nama" className="block text-900 font-medium mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => handleInputChange("nama", e.target.value)}
                  placeholder="Nama sesuai KTP"
                  className={errors.nama ? 'p-invalid' : ''}
                />
                {errors.nama && <small className="p-error">{errors.nama}</small>}
              </div>

              <div className="col-12 md:col-6">
                <label htmlFor="tempat_lahir" className="block text-900 font-medium mb-2">
                  Tempat Lahir
                </label>
                <InputText
                  id="tempat_lahir"
                  value={formData.tempat_lahir}
                  onChange={(e) => handleInputChange("tempat_lahir", e.target.value)}
                  placeholder="Kota kelahiran"
                />
              </div>

              <div className="col-12 md:col-6">
                <label htmlFor="tgl_lahir" className="block text-900 font-medium mb-2">
                  Tanggal Lahir
                </label>
                <Calendar
                  id="tgl_lahir"
                  value={formData.tgl_lahir}
                  onChange={(e) => handleInputChange("tgl_lahir", e.value)}
                  showIcon
                  dateFormat="dd/mm/yy"
                  placeholder="Pilih tanggal"
                />
              </div>

              <div className="col-12 md:col-6">
                <label htmlFor="no_telp" className="block text-900 font-medium mb-2">
                  No. Telepon
                </label>
                <InputText
                  id="no_telp"
                  value={formData.no_telp}
                  onChange={(e) => handleInputChange("no_telp", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="col-12">
                <label htmlFor="alamat" className="block text-900 font-medium mb-2">
                  Alamat Lengkap
                </label>
                <InputTextarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => handleInputChange("alamat", e.target.value)}
                  rows={3}
                  placeholder="Alamat sesuai KTP"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Data Pekerjaan
        return (
          <div className="p-fluid">
            <div className="grid">
              <div className="col-12 md:col-6">
                <label htmlFor="departemen" className="block text-900 font-medium mb-2">
                  Departemen <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  id="departemen"
                  value={formData.departemen}
                  options={departemenOptions}
                  onChange={(e) => handleInputChange("departemen", e.value)}
                  placeholder="Pilih Departemen"
                  filter
                  className={errors.departemen ? 'p-invalid' : ''}
                />
                {errors.departemen && <small className="p-error">{errors.departemen}</small>}
              </div>

              <div className="col-12 md:col-6">
                <label htmlFor="jabatan" className="block text-900 font-medium mb-2">
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  id="jabatan"
                  value={formData.jabatan}
                  options={jabatanOptions}
                  onChange={(e) => handleInputChange("jabatan", e.value)}
                  placeholder="Pilih Jabatan"
                  className={errors.jabatan ? 'p-invalid' : ''}
                />
                {errors.jabatan && <small className="p-error">{errors.jabatan}</small>}
              </div>

              <div className="col-12 md:col-6">
                <label htmlFor="status_karyawan" className="block text-900 font-medium mb-2">
                  Status Karyawan
                </label>
                <Dropdown
                  id="status_karyawan"
                  value={formData.status_karyawan}
                  options={statusOptions}
                  onChange={(e) => handleInputChange("status_karyawan", e.value)}
                />
              </div>

              <div className="col-12 md:col-6">
                <label htmlFor="tanggal_masuk" className="block text-900 font-medium mb-2">
                  Tanggal Masuk
                </label>
                <Calendar
                  id="tanggal_masuk"
                  value={formData.tanggal_masuk}
                  onChange={(e) => handleInputChange("tanggal_masuk", e.value)}
                  showIcon
                  dateFormat="dd/mm/yy"
                />
              </div>

              <div className="col-12 md:col-6">
                <label htmlFor="shift" className="block text-900 font-medium mb-2">
                  Shift Kerja
                </label>
                <Dropdown
                  id="shift"
                  value={formData.shift}
                  options={shiftOptions}
                  onChange={(e) => handleInputChange("shift", e.value)}
                  placeholder="Pilih Shift (Opsional)"
                />
              </div>

              <div className="col-12 md:col-6">
                <label htmlFor="pendidikan_terakhir" className="block text-900 font-medium mb-2">
                  Pendidikan Terakhir
                </label>
                <Dropdown
                  id="pendidikan_terakhir"
                  value={formData.pendidikan_terakhir}
                  options={pendidikanOptions}
                  onChange={(e) => handleInputChange("pendidikan_terakhir", e.value)}
                  placeholder="Pilih Pendidikan"
                />
              </div>
            </div>
          </div>
        );

      case 3: // Foto & Konfirmasi
        return (
          <div className="p-fluid">
            <div className="mb-5">
              <label className="block text-900 font-medium mb-3">
                <i className="pi pi-image mr-2"></i>
                Foto Profil (Opsional)
              </label>
              
              <div className="flex align-items-center gap-4 mb-3">
                <Avatar
                  image={fotoPreview}
                  icon={!fotoPreview ? "pi pi-user" : null}
                  size="xlarge"
                  shape="circle"
                  style={{ 
                    backgroundColor: !fotoPreview ? '#2196F3' : 'transparent',
                    width: '100px',
                    height: '100px'
                  }}
                />
                <FileUpload
                  mode="basic"
                  accept="image/*"
                  maxFileSize={1000000}
                  onSelect={handleFotoSelect}
                  chooseLabel="Pilih Foto"
                  auto
                />
              </div>
              
              {foto && (
                <small className="text-green-600 block">
                  <i className="pi pi-check-circle mr-2"></i>
                  {foto.name}
                </small>
              )}
              <small className="text-500 block mt-2">
                Format: JPG, PNG, GIF. Maksimal 1MB
              </small>
            </div>

            <div className="surface-100 border-round p-4">
              <h4 className="text-900 font-bold mb-3">
                <i className="pi pi-info-circle mr-2"></i>
                Ringkasan Data
              </h4>
              <div className="grid">
                <div className="col-6">
                  <p className="text-600 mb-1 text-sm">Email</p>
                  <p className="text-900 font-medium">{formData.email}</p>
                </div>
                <div className="col-6">
                  <p className="text-600 mb-1 text-sm">NIK</p>
                  <p className="text-900 font-medium">{formData.nik || "-"}</p>
                </div>
                <div className="col-6">
                  <p className="text-600 mb-1 text-sm">Nama</p>
                  <p className="text-900 font-medium">{formData.nama || "-"}</p>
                </div>
                <div className="col-6">
                  <p className="text-600 mb-1 text-sm">Gender</p>
                  <p className="text-900 font-medium">{formData.gender === "L" ? "Laki-laki" : "Perempuan"}</p>
                </div>
                <div className="col-6">
                  <p className="text-600 mb-1 text-sm">Departemen</p>
                  <p className="text-900 font-medium">{formData.departemen || "-"}</p>
                </div>
                <div className="col-6">
                  <p className="text-600 mb-1 text-sm">Jabatan</p>
                  <p className="text-900 font-medium">{formData.jabatan || "-"}</p>
                </div>
                <div className="col-6">
                  <p className="text-600 mb-1 text-sm">Status</p>
                  <p className="text-900 font-medium">{formData.status_karyawan}</p>
                </div>
                <div className="col-6">
                  <p className="text-600 mb-1 text-sm">Shift</p>
                  <p className="text-900 font-medium">{formData.shift || "Tidak ada"}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      header={selectedKaryawan ? `Edit Karyawan: ${selectedKaryawan.NAMA}` : "Tambah Karyawan Baru"}
      visible={visible}
      style={{ width: "90vw", maxWidth: "900px" }}
      modal
      onHide={handleHide}
      draggable={false}
    >
      {/* Steps Indicator */}
      <div className="mb-5">
        <Steps
          model={steps}
          activeIndex={activeStep}
          readOnly
        />
      </div>

      {/* Content */}
      <div className="mb-5">
        {renderStepContent()}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-content-between pt-4 border-top-1 surface-border">
        <Button
          label="Kembali"
          icon="pi pi-arrow-left"
          className="p-button-text"
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
        />
        
        {activeStep < steps.length - 1 ? (
          <Button
            label="Selanjutnya"
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={handleNext}
            disabled={loading}
          />
        ) : (
          <Button
            label={loading ? 'Menyimpan...' : (selectedKaryawan ? 'Update Karyawan' : 'Simpan Karyawan')}
            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
            iconPos="right"
            onClick={handleSubmit}
            loading={loading}
          />
        )}
      </div>
    </Dialog>
  );
};

export default FormKaryawan;