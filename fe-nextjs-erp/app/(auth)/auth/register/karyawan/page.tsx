'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Steps } from 'primereact/steps';
import { MenuItem } from 'primereact/menuitem';
import axios from 'axios';
import ToastNotifier from '../../../../components/ToastNotifier';
import { RegisterPageSkeleton } from '../../../../components/SkeletonLoader'; // ✅ IMPORT

type ToastNotifierHandle = {
  showToast: (status: string, message?: string) => void;
};

const RegisterKaryawanPage = () => {
    const router = useRouter();
    const toastRef = useRef<ToastNotifierHandle>(null);
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    
    // ✅ STATE UNTUK SKELETON
    const [isPageLoading, setIsPageLoading] = useState(true);
    
    // State Form
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'HR',
        nik: '',
        nama: '',
        gender: 'L',
        tempat_lahir: '',
        tgl_lahir: null as Date | null,
        alamat: '',
        no_telp: '',
        departemen: 'HR', // ✅ Default sesuai role
        jabatan: '',
        tanggal_masuk: new Date(),
        status_karyawan: 'Kontrak',
        shift: '',
        pendidikan_terakhir: '',
    });

    const [foto, setFoto] = useState<File | null>(null);

    // ✅ EFFECT UNTUK LOADING
    useEffect(() => {
        // Simulasi loading untuk smooth transition
        const timer = setTimeout(() => {
            setIsPageLoading(false);
        }, 500); // 500ms loading

        return () => clearTimeout(timer);
    }, []);

    // Steps Configuration
    const steps: MenuItem[] = [
        { label: 'Akun Login', icon: 'pi pi-user' },
        { label: 'Data Pribadi', icon: 'pi pi-id-card' },
        { label: 'Data Pekerjaan', icon: 'pi pi-briefcase' },
        { label: 'Foto & Konfirmasi', icon: 'pi pi-check-circle' }
    ];

    // Options untuk Dropdown
    const roleOptions = [
        { label: 'HR', value: 'HR' },
        { label: 'PRODUKSI', value: 'PRODUKSI' },
        { label: 'GUDANG', value: 'GUDANG' },
        { label: 'KEUANGAN', value: 'KEUANGAN' }
    ];

    const genderOptions = [
        { label: 'Laki-laki', value: 'L' },
        { label: 'Perempuan', value: 'P' }
    ];

    const departemenOptions = [
        { label: 'Human Resource (HR)', value: 'HR' },
        { label: 'Produksi', value: 'PRODUKSI' },
        { label: 'Gudang', value: 'GUDANG' },
        { label: 'Keuangan & Accounting', value: 'KEUANGAN' }
    ];

    const jabatanOptions = [
        { label: 'Staff', value: 'Staff' },
        { label: 'Operator', value: 'Operator' },
        { label: 'Supervisor', value: 'Supervisor' },
        { label: 'Manager', value: 'Manager' },
        { label: 'Kepala Departemen', value: 'Kepala Departemen' }
    ];

    const statusOptions = [
        { label: 'Kontrak', value: 'Kontrak' },
        { label: 'Tetap', value: 'Tetap' },
        { label: 'Magang', value: 'Magang' }
    ];

    const shiftOptions = [
        { label: 'Tidak Ada Shift', value: '' },
        { label: 'Pagi (07:00 - 15:00)', value: 'Pagi' },
        { label: 'Siang (15:00 - 23:00)', value: 'Siang' },
        { label: 'Malam (23:00 - 07:00)', value: 'Malam' }
    ];

    const pendidikanOptions = [
        { label: 'SD', value: 'SD' },
        { label: 'SMP', value: 'SMP' },
        { label: 'SMA/SMK', value: 'SMA/SMK' },
        { label: 'D3', value: 'D3' },
        { label: 'S1', value: 'S1' },
        { label: 'S2', value: 'S2' },
        { label: 'S3', value: 'S3' }
    ];

    const handleInputChange = (e: any) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleDropdownChange = (field: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Sinkronisasi: Departemen akan selalu mengikuti Role
            if (field === 'role') {
                newData.departemen = value;
            }

            return newData;
        });
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 0:
                if (!formData.email || !formData.password || !formData.confirmPassword) {
                    toastRef.current?.showToast('01', 'Semua field wajib diisi');
                    return false;
                }
                if (formData.password.length < 8) {
                    toastRef.current?.showToast('01', 'Password minimal 8 karakter');
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    toastRef.current?.showToast('01', 'Konfirmasi password tidak cocok');
                    return false;
                }
                return true;

            case 1:
                if (!formData.nik || !formData.nama || !formData.gender) {
                    toastRef.current?.showToast('01', 'NIK, Nama, dan Gender wajib diisi');
                    return false;
                }
                return true;

            case 2:
                if (!formData.departemen || !formData.jabatan) {
                    toastRef.current?.showToast('01', 'Departemen dan Jabatan wajib diisi');
                    return false;
                }
                return true;

            default:
                return true;
        }
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

        setLoading(true);

        try {
            const data = new FormData();
            
            Object.keys(formData).forEach(key => {
                const value = (formData as any)[key];
                
                if (key === 'confirmPassword') return;
                
                if (value instanceof Date) {
                    const year = value.getFullYear();
                    const month = String(value.getMonth() + 1).padStart(2, '0');
                    const day = String(value.getDate()).padStart(2, '0');
                    data.append(key, `${year}-${month}-${day}`);
                } else if (value !== null && value !== undefined && value !== '') {
                    data.append(key, value);
                }
            });

            if (foto) {
                data.append('foto', foto);
            }

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/register-karyawan`,
                data,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (res.data.status === '00' || res.status === 201) {
                toastRef.current?.showToast('00', `Registrasi berhasil! Kode Karyawan: ${res.data.karyawan_id}`);
                setTimeout(() => router.push('/auth/login'), 2000);
            }
        } catch (err: any) {
            console.error('Error:', err.response?.data);
            const msg = err.response?.data?.message || 'Gagal mendaftar';
            toastRef.current?.showToast('01', msg);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <div className="p-fluid">
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-900 font-medium mb-2">
                                Email (Username) *
                            </label>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-envelope text-400"></i>
                                <InputText
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="yourname@gmail.com"
                                    className="w-full"
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </span>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="block text-900 font-medium mb-2">
                                Password *
                            </label>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-lock text-400"></i>
                                <InputText
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Minimal 8 karakter"
                                    className="w-full"
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </span>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="block text-900 font-medium mb-2">
                                Konfirmasi Password *
                            </label>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-lock text-400"></i>
                                <InputText
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Ulangi password"
                                    className="w-full"
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </span>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="role" className="block text-900 font-medium mb-2">
                                Akses Role *
                            </label>
                            <Dropdown
                                id="role"
                                value={formData.role}
                                options={roleOptions}
                                onChange={(e) => handleDropdownChange('role', e.value)}
                                placeholder="Pilih Role"
                                className="w-full"
                            />
                            <small className="text-500">
                                Pilih sesuai departemen Anda
                            </small>
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="p-fluid">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <label htmlFor="nik" className="block text-900 font-medium mb-2">
                                    NIK (Nomor Induk Karyawan) *
                                </label>
                                <InputText
                                    id="nik"
                                    value={formData.nik}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan NIK"
                                />
                            </div>

                            <div className="col-12 md:col-6">
                                <label htmlFor="gender" className="block text-900 font-medium mb-2">
                                    Jenis Kelamin *
                                </label>
                                <Dropdown
                                    id="gender"
                                    value={formData.gender}
                                    options={genderOptions}
                                    onChange={(e) => handleDropdownChange('gender', e.value)}
                                />
                            </div>

                            <div className="col-12">
                                <label htmlFor="nama" className="block text-900 font-medium mb-2">
                                    Nama Lengkap *
                                </label>
                                <InputText
                                    id="nama"
                                    value={formData.nama}
                                    onChange={handleInputChange}
                                    placeholder="Nama sesuai KTP"
                                />
                            </div>

                            <div className="col-12 md:col-6">
                                <label htmlFor="tempat_lahir" className="block text-900 font-medium mb-2">
                                    Tempat Lahir
                                </label>
                                <InputText
                                    id="tempat_lahir"
                                    value={formData.tempat_lahir}
                                    onChange={handleInputChange}
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
                                    onChange={(e) => handleDropdownChange('tgl_lahir', e.value)}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Alamat sesuai KTP"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="p-fluid">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <label htmlFor="departemen" className="block text-900 font-medium mb-2">
                                    Departemen *
                                </label>
                                <Dropdown
                                    id="departemen"
                                    value={formData.departemen}
                                    options={departemenOptions}
                                    onChange={(e) => handleDropdownChange('departemen', e.value)}
                                    placeholder="Pilih Departemen"
                                    filter
                                    disabled={true}
                                />
                                <small className="text-500">
                                    Departemen terkunci otomatis sesuai Role Akses yang dipilih di Step 1.
                                </small>
                            </div>

                            <div className="col-12 md:col-6">
                                <label htmlFor="jabatan" className="block text-900 font-medium mb-2">
                                    Jabatan *
                                </label>
                                <Dropdown
                                    id="jabatan"
                                    value={formData.jabatan}
                                    options={jabatanOptions}
                                    onChange={(e) => handleDropdownChange('jabatan', e.value)}
                                    placeholder="Pilih Jabatan"
                                />
                            </div>

                            <div className="col-12 md:col-6">
                                <label htmlFor="status_karyawan" className="block text-900 font-medium mb-2">
                                    Status Karyawan
                                </label>
                                <Dropdown
                                    id="status_karyawan"
                                    value={formData.status_karyawan}
                                    options={statusOptions}
                                    onChange={(e) => handleDropdownChange('status_karyawan', e.value)}
                                />
                            </div>

                            <div className="col-12 md:col-6">
                                <label htmlFor="tanggal_masuk" className="block text-900 font-medium mb-2">
                                    Tanggal Masuk
                                </label>
                                <Calendar
                                    id="tanggal_masuk"
                                    value={formData.tanggal_masuk}
                                    onChange={(e) => handleDropdownChange('tanggal_masuk', e.value)}
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
                                    onChange={(e) => handleDropdownChange('shift', e.value)}
                                    placeholder="Pilih Shift (Opsional)"
                                />
                                <small className="text-500">
                                    Kosongkan jika tidak ada shift
                                </small>
                            </div>

                            <div className="col-12 md:col-6">
                                <label htmlFor="pendidikan_terakhir" className="block text-900 font-medium mb-2">
                                    Pendidikan Terakhir
                                </label>
                                <Dropdown
                                    id="pendidikan_terakhir"
                                    value={formData.pendidikan_terakhir}
                                    options={pendidikanOptions}
                                    onChange={(e) => handleDropdownChange('pendidikan_terakhir', e.value)}
                                    placeholder="Pilih Pendidikan"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="p-fluid">
                        <div className="mb-5">
                            <label className="block text-900 font-medium mb-3">
                                <i className="pi pi-image mr-2"></i>
                                Foto Profil (Opsional)
                            </label>
                            <FileUpload
                                mode="basic"
                                accept="image/*"
                                maxFileSize={1000000}
                                onSelect={(e) => setFoto(e.files[0])}
                                chooseLabel="Pilih Foto"
                                className="w-full"
                                auto
                            />
                            {foto && (
                                <div className="mt-3 p-3 surface-100 border-round">
                                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                                    <span className="text-green-700 font-medium">{foto.name}</span>
                                </div>
                            )}
                            <small className="text-500 block mt-2">
                                Format: JPG, PNG, GIF. Maksimal 1MB
                            </small>
                        </div>

                        <div className="surface-100 border-round p-4">
                            <h3 className="text-900 font-bold mb-3">
                                <i className="pi pi-info-circle mr-2"></i>
                                Ringkasan Data
                            </h3>
                            <div className="grid">
                                <div className="col-6">
                                    <p className="text-600 mb-1 text-sm">Email</p>
                                    <p className="text-900 font-medium">{formData.email}</p>
                                </div>
                                <div className="col-6">
                                    <p className="text-600 mb-1 text-sm">Role</p>
                                    <p className="text-900 font-medium">{formData.role}</p>
                                </div>
                                <div className="col-6">
                                    <p className="text-600 mb-1 text-sm">NIK</p>
                                    <p className="text-900 font-medium">{formData.nik}</p>
                                </div>
                                <div className="col-6">
                                    <p className="text-600 mb-1 text-sm">Nama</p>
                                    <p className="text-900 font-medium">{formData.nama}</p>
                                </div>
                                <div className="col-6">
                                    <p className="text-600 mb-1 text-sm">Departemen</p>
                                    <p className="text-900 font-medium">{formData.departemen}</p>
                                </div>
                                <div className="col-6">
                                    <p className="text-600 mb-1 text-sm">Jabatan</p>
                                    <p className="text-900 font-medium">{formData.jabatan}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // ✅ TAMPILKAN SKELETON SAAT LOADING
    if (isPageLoading) {
        return <RegisterPageSkeleton />;
    }

    // ✅ RENDER NORMAL PAGE
    return (
        <>
            <ToastNotifier ref={toastRef} />
            
            <div 
                className="min-h-screen flex align-items-center justify-content-center p-4"
                style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    animation: 'fadeIn 0.5s ease-in'
                }}
            >
                <div className="surface-card shadow-8 border-round-2xl overflow-hidden"
                     style={{ maxWidth: '900px', width: '100%' }}>
                    
                    <div className="p-5 border-bottom-1 surface-border"
                         style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
                        <div className="flex align-items-center justify-content-between">
                            <div>
                                <h2 className="text-white text-3xl font-bold m-0 mb-2">
                                    Registrasi Karyawan
                                </h2>
                                <p className="text-white-alpha-80 m-0">
                                    Lengkapi data Anda untuk membuat akun karyawan
                                </p>
                            </div>
                            <Button
                                icon="pi pi-times"
                                className="p-button-rounded p-button-text p-button-plain hover:bg-black-alpha-20 hover:text-red-400"
                                style={{ color: 'white', transition: '0.3s' }}
                                onClick={() => router.push('/auth/login')}
                            />
                        </div>
                    </div>

                    <div className="p-5 border-bottom-1 surface-border">
                        <Steps
                            model={steps}
                            activeIndex={activeStep}
                            readOnly
                            className="mb-0"
                        />
                    </div>

                    <div className="p-6">
                        {renderStepContent()}
                    </div>

                    <div className="p-5 border-top-1 surface-border flex justify-content-between">
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
                                label={loading ? 'Memproses...' : 'Daftar Sekarang'}
                                icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                                iconPos="right"
                                onClick={handleSubmit}
                                loading={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none'
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterKaryawanPage;