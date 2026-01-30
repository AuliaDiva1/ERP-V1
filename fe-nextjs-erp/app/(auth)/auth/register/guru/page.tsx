'use client';
import React, { useRef, useState, FC } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import ToastNotifier from '../../../../components/ToastNotifier';
import '@/styles/gradient.css';
import axios from 'axios';

type ToastNotifierHandle = {
  showToast: (status: string, message?: string) => void;
};

// Interface untuk data form guru
interface GuruFormData {
  nip: string;
  nama: string;
  pangkat: string;
  kode_jabatan: string;
  status_kepegawaian: string;
  gender: string;
  tgl_lahir: Date | null;
  tempat_lahir: string;
  email: string;
  no_telp: string;
  alamat: string;
  pendidikan_terakhir: string;
  tahun_lulus: string;
  universitas: string;
  no_sertifikat_pendidik: string;
  tahun_sertifikat: string;
  keahlian: string; // ✅ Diperbaiki dari mapel_diampu ke keahlian
  password: string;
  foto: File | null;
}

const GENDER_OPTIONS = [
  { label: 'Laki-laki', value: 'L' },
  { label: 'Perempuan', value: 'P' },
];

const STATUS_KEPEGAWAIAN_OPTIONS = [
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Cuti', value: 'Cuti' },
  { label: 'Pensiun', value: 'Pensiun' },
];

interface JabatanOption {
  label: string;
  value: string;
}

const RegisterGuruPage: FC = () => {
  const router = useRouter();
  const toastRef = useRef<ToastNotifierHandle>(null);
  const fileUploadRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [jabatanOptions, setJabatanOptions] = useState<JabatanOption[]>([]);
  const [loadingJabatan, setLoadingJabatan] = useState(false);
  const [form, setForm] = useState<GuruFormData>({
    nip: '',
    nama: '',
    pangkat: '',
    kode_jabatan: '',
    status_kepegawaian: 'Aktif',
    gender: '',
    tgl_lahir: null,
    tempat_lahir: '',
    email: '',
    no_telp: '',
    alamat: '',
    pendidikan_terakhir: '',
    tahun_lulus: '',
    universitas: '',
    no_sertifikat_pendidik: '',
    tahun_sertifikat: '',
    keahlian: '', // ✅ Diperbaiki dari mapel_diampu ke keahlian
    password: '',
    foto: null,
  });

  // Fetch data jabatan saat component mount
  React.useEffect(() => {
    fetchJabatan();
  }, []);

  const fetchJabatan = async () => {
    setLoadingJabatan(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/master-jabatan`
      );
      
      // Transform data menjadi format dropdown
      const options = response.data.data.map((jabatan: any) => ({
        label: `${jabatan.KODE_JABATAN} | ${jabatan.NAMA_JABATAN}`,
        value: jabatan.KODE_JABATAN,
      }));
      
      setJabatanOptions(options);
    } catch (err: any) {
      console.error('Error fetching jabatan:', err);
      toastRef.current?.showToast(
        '99',
        'Gagal memuat data jabatan'
      );
    } finally {
      setLoadingJabatan(false);
    }
  };

  // Handler untuk mengubah state form
  const handleChange = (name: keyof GuruFormData, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler untuk upload foto
  const handleFileSelect = (e: any) => {
    const file = e.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, foto: file }));
    }
  };

  // Handler untuk submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Buat FormData untuk mengirim file dan data lainnya
      const formData = new FormData();
      
      // Append semua field ke FormData
      formData.append('nip', form.nip);
      formData.append('nama', form.nama);
      formData.append('pangkat', form.pangkat);
      formData.append('kode_jabatan', form.kode_jabatan);
      formData.append('status_kepegawaian', form.status_kepegawaian);
      formData.append('gender', form.gender);
      formData.append('email', form.email);
      formData.append('no_telp', form.no_telp);
      formData.append('alamat', form.alamat);
      formData.append('tempat_lahir', form.tempat_lahir);
      formData.append('pendidikan_terakhir', form.pendidikan_terakhir);
      formData.append('tahun_lulus', form.tahun_lulus);
      formData.append('universitas', form.universitas);
      formData.append('no_sertifikat_pendidik', form.no_sertifikat_pendidik);
      formData.append('tahun_sertifikat', form.tahun_sertifikat);
      formData.append('keahlian', form.keahlian); // ✅ Diperbaiki dari mapel_diampu ke keahlian
      formData.append('password', form.password);
      
      // Format tanggal lahir
      if (form.tgl_lahir) {
        formData.append('tgl_lahir', form.tgl_lahir.toISOString().split('T')[0]);
      }
      
      // Append foto jika ada
      if (form.foto) {
        formData.append('foto', form.foto);
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register-guru`,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data' 
          },
        }
      );

      toastRef.current?.showToast('00', 'Guru berhasil didaftarkan!');
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch (err: any) {
      toastRef.current?.showToast(
        '99',
        err.response?.data?.message || 'Terjadi kesalahan pada server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-content-center align-items-center">
      <ToastNotifier ref={toastRef} />
      <div className="animated-gradient-bg w-full h-full flex justify-content-center align-items-center p-4">
        <div className="card w-full md:w-10 lg:w-9 h-auto p-5 shadow-3 rounded-lg">
          <div className="flex flex-column md:flex-row items-start">
            {/* Kolom Form (Kiri) */}
            <div className="w-full md:w-7/12 p-fluid px-4">
              <h3 className="text-2xl text-center font-semibold mb-4">
                Registrasi Akun Guru
              </h3>
              <form onSubmit={handleSubmit} className="grid formgrid">
                {/* Data Kepegawaian */}
                <div className="col-12">
                  <h4 className="text-lg font-semibold mb-2 text-primary">Data Kepegawaian</h4>
                </div>
                
                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="nip" className="block text-900 font-medium mb-1">
                    NIP <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    id="nip"
                    value={form.nip}
                    onChange={(e) => handleChange('nip', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="nama" className="block text-900 font-medium mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    id="nama"
                    value={form.nama}
                    onChange={(e) => handleChange('nama', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="pangkat" className="block text-900 font-medium mb-1">
                    Pangkat
                  </label>
                  <InputText
                    id="pangkat"
                    value={form.pangkat}
                    onChange={(e) => handleChange('pangkat', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="kode_jabatan" className="block text-900 font-medium mb-1">
                    Jabatan
                  </label>
                  <Dropdown
                    id="kode_jabatan"
                    value={form.kode_jabatan}
                    options={jabatanOptions}
                    onChange={(e: DropdownChangeEvent) => handleChange('kode_jabatan', e.value)}
                    className="w-full"
                    placeholder={loadingJabatan ? 'Memuat data...' : 'Pilih Jabatan'}
                    disabled={loadingJabatan}
                    filter
                    showClear
                    emptyMessage="Tidak ada data jabatan"
                    emptyFilterMessage="Jabatan tidak ditemukan"
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="status_kepegawaian" className="block text-900 font-medium mb-1">
                    Status Kepegawaian <span className="text-red-500">*</span>
                  </label>
                  <Dropdown
                    id="status_kepegawaian"
                    value={form.status_kepegawaian}
                    options={STATUS_KEPEGAWAIAN_OPTIONS}
                    onChange={(e: DropdownChangeEvent) => handleChange('status_kepegawaian', e.value)}
                    className="w-full"
                    placeholder="Pilih Status"
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="keahlian" className="block text-900 font-medium mb-1">
                    Keahlian / Bidang Spesialisasi
                  </label>
                  <InputText
                    id="keahlian"
                    value={form.keahlian}
                    onChange={(e) => handleChange('keahlian', e.target.value)}
                    className="w-full"
                  />
                  <small className="text-gray-600">
                    Isi dengan bidang keahlian atau mata pelajaran yang dikuasai
                  </small>
                </div>

                {/* Data Pribadi */}
                <div className="col-12 mt-3">
                  <h4 className="text-lg font-semibold mb-2 text-primary">Data Pribadi</h4>
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="email" className="block text-900 font-medium mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="gender" className="block text-900 font-medium mb-1">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <Dropdown
                    id="gender"
                    value={form.gender}
                    options={GENDER_OPTIONS}
                    onChange={(e: DropdownChangeEvent) => handleChange('gender', e.value)}
                    className="w-full"
                    placeholder="Pilih Gender"
                    required
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="tempat_lahir" className="block text-900 font-medium mb-1">
                    Tempat Lahir
                  </label>
                  <InputText
                    id="tempat_lahir"
                    value={form.tempat_lahir}
                    onChange={(e) => handleChange('tempat_lahir', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="tgl_lahir" className="block text-900 font-medium mb-1">
                    Tanggal Lahir
                  </label>
                  <Calendar
                    id="tgl_lahir"
                    value={form.tgl_lahir}
                    onChange={(e: any) => handleChange('tgl_lahir', e.value)}
                    dateFormat="yy-mm-dd"
                    showIcon
                    className="w-full"
                    placeholder="YYYY-MM-DD"
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="no_telp" className="block text-900 font-medium mb-1">
                    No. Telepon
                  </label>
                  <InputText
                    id="no_telp"
                    value={form.no_telp}
                    onChange={(e) => handleChange('no_telp', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="alamat" className="block text-900 font-medium mb-1">
                    Alamat
                  </label>
                  <InputText
                    id="alamat"
                    value={form.alamat}
                    onChange={(e) => handleChange('alamat', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Data Pendidikan */}
                <div className="col-12 mt-3">
                  <h4 className="text-lg font-semibold mb-2 text-primary">Data Pendidikan</h4>
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="pendidikan_terakhir" className="block text-900 font-medium mb-1">
                    Pendidikan Terakhir
                  </label>
                  <InputText
                    id="pendidikan_terakhir"
                    value={form.pendidikan_terakhir}
                    onChange={(e) => handleChange('pendidikan_terakhir', e.target.value)}
                    className="w-full"
                    placeholder="Contoh: S1, S2"
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="universitas" className="block text-900 font-medium mb-1">
                    Universitas
                  </label>
                  <InputText
                    id="universitas"
                    value={form.universitas}
                    onChange={(e) => handleChange('universitas', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="tahun_lulus" className="block text-900 font-medium mb-1">
                    Tahun Lulus
                  </label>
                  <InputText
                    id="tahun_lulus"
                    value={form.tahun_lulus}
                    onChange={(e) => handleChange('tahun_lulus', e.target.value)}
                    className="w-full"
                    placeholder="Contoh: 2020"
                    maxLength={4}
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="no_sertifikat_pendidik" className="block text-900 font-medium mb-1">
                    No. Sertifikat Pendidik
                  </label>
                  <InputText
                    id="no_sertifikat_pendidik"
                    value={form.no_sertifikat_pendidik}
                    onChange={(e) => handleChange('no_sertifikat_pendidik', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="tahun_sertifikat" className="block text-900 font-medium mb-1">
                    Tahun Sertifikat
                  </label>
                  <InputText
                    id="tahun_sertifikat"
                    value={form.tahun_sertifikat}
                    onChange={(e) => handleChange('tahun_sertifikat', e.target.value)}
                    className="w-full"
                    placeholder="Contoh: 2021"
                    maxLength={4}
                  />
                </div>

                {/* Upload Foto */}
                <div className="field col-12 md:col-6 mb-3">
                  <label htmlFor="foto" className="block text-900 font-medium mb-1">
                    Foto Profil
                  </label>
                  <FileUpload
                    ref={fileUploadRef}
                    mode="basic"
                    name="foto"
                    accept="image/*"
                    maxFileSize={2000000}
                    onSelect={handleFileSelect}
                    chooseLabel={form.foto ? 'Ubah Foto' : 'Pilih Foto'}
                    className="w-full"
                    auto={false}
                  />
                  {form.foto && (
                    <small className="text-green-600">File terpilih: {form.foto.name}</small>
                  )}
                </div>

                {/* Password */}
                <div className="col-12 mt-3">
                  <h4 className="text-lg font-semibold mb-2 text-primary">Keamanan Akun</h4>
                </div>

                <div className="field col-12 mb-3">
                  <label htmlFor="password" className="block text-900 font-medium mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full"
                    required
                    minLength={8}
                  />
                  <small className="text-gray-600">Minimal 8 karakter</small>
                </div>

                <div className="col-12 mt-4">
                  <Button
                    type="submit"
                    label={loading ? 'Memproses...' : 'Daftar Sekarang'}
                    disabled={loading}
                    className="w-full p-3"
                    icon={loading ? 'pi pi-spin pi-spinner' : undefined}
                    iconPos="right"
                  />
                </div>
                
                <div className="col-12 text-center mt-3">
                  <span>Sudah punya akun? </span>
                  <Link href="/auth/login" className="text-blue-500 hover:underline font-semibold">
                    Login disini
                  </Link>
                </div>
              </form>
            </div>

            {/* Kolom Gambar (Kanan) */}
            <div className="hidden md:block md:w-5/12 px-4">
              <div className="sticky top-4">
                <img
                  src="https://www.darulilmimurni.sch.id/upload/imagecache/21317206GreenandOrangeColorfulInternationalTeachersDayInstagramPost-800x800.png"
                  className="w-full h-auto object-cover rounded-lg shadow-2"
                  alt="cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterGuruPage;
