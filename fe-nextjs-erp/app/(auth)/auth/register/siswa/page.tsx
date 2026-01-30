'use client';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber } from 'primereact/inputnumber';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ToastNotifier from '../../../../components/ToastNotifier';
import '@/styles/gradient.css';
import axios from 'axios';

type ToastNotifierHandle = {
  showToast: (status: string, message?: string) => void;
};

interface OrangTua {
  jenis: 'Ayah' | 'Ibu' | 'Wali';
  nama: string;
  pekerjaan: string;
  pendidikan: string;
  alamat: string;
  no_hp: string;
}

const genderOptions = [
  { label: 'Laki-laki', value: 'L' },
  { label: 'Perempuan', value: 'P' },
];

const agamaOptions = [
  { label: 'Islam', value: 'Islam' },
  { label: 'Kristen', value: 'Kristen' },
  { label: 'Katolik', value: 'Katolik' },
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Buddha', value: 'Buddha' },
  { label: 'Konghucu', value: 'Konghucu' },
];

const golDarahOptions = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'AB', value: 'AB' },
  { label: 'O', value: 'O' },
];

const RegisterSiswaPage = () => {
  const router = useRouter();
  const toastRef = useRef<ToastNotifierHandle>(null);
  const fileUploadRef = useRef<any>(null);

  const [form, setForm] = useState({
    nis: '',
    nisn: '',
    nama: '',
    email: '',
    password: '',
    gender: '',
    tgl_lahir: null as Date | null,
    tempat_lahir: '',
    agama: '',
    alamat: '',
    no_telp: '',
    gol_darah: '',
    tinggi: null as number | null,
    berat: null as number | null,
    kebutuhan_khusus: '',
    foto: null as File | null,
  });

  const [orangTua, setOrangTua] = useState<OrangTua[]>([
    { jenis: 'Ayah', nama: '', pekerjaan: '', pendidikan: '', alamat: '', no_hp: '' },
    { jenis: 'Ibu', nama: '', pekerjaan: '', pendidikan: '', alamat: '', no_hp: '' },
    { jenis: 'Wali', nama: '', pekerjaan: '', pendidikan: '', alamat: '', no_hp: '' },
  ]);

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileSelect = (e: any) => {
    const file = e.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, foto: file }));
    }
  };

  const handleOrangTuaChange = (index: number, field: keyof OrangTua, value: string) => {
    setOrangTua((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // Data siswa
      formData.append('nis', form.nis.trim());
      formData.append('nisn', form.nisn.trim());
      formData.append('nama', form.nama.trim());
      formData.append('email', form.email.trim());
      formData.append('password', form.password.trim());
      formData.append('gender', form.gender);
      formData.append('status', 'Aktif');
      
      if (form.tgl_lahir) {
        formData.append('tgl_lahir', form.tgl_lahir.toISOString().split('T')[0]);
      }
      
      if (form.tempat_lahir) formData.append('tempat_lahir', form.tempat_lahir);
      if (form.agama) formData.append('agama', form.agama);
      if (form.alamat) formData.append('alamat', form.alamat);
      if (form.no_telp) formData.append('no_telp', form.no_telp);
      if (form.gol_darah) formData.append('gol_darah', form.gol_darah);
      if (form.tinggi) formData.append('tinggi', form.tinggi.toString());
      if (form.berat) formData.append('berat', form.berat.toString());
      if (form.kebutuhan_khusus) formData.append('kebutuhan_khusus', form.kebutuhan_khusus);
      
      // Upload foto
      if (form.foto) {
        formData.append('foto', form.foto);
      }

      // Filter orang tua yang diisi (minimal nama)
      const orangTuaFiltered = orangTua.filter((ot) => ot.nama.trim() !== '');
      formData.append('orang_tua', JSON.stringify(orangTuaFiltered));

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register-siswa`,
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );

      toastRef.current?.showToast('00', 'Siswa berhasil didaftarkan');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (err: any) {
      toastRef.current?.showToast(
        '99',
        err.response?.data?.message || 'Terjadi kesalahan koneksi'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-content-center align-items-center py-4">
      <ToastNotifier ref={toastRef} />
      <div className="animated-gradient-bg w-full h-full flex justify-content-center align-items-center p-4">
        <div className="card w-full md:w-11 lg:w-10 h-auto p-5 shadow-3 rounded-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <h3 className="text-2xl text-center font-semibold mb-4">
            Registrasi Akun Siswa
          </h3>

          <form className="grid formgrid" onSubmit={handleSubmit}>
            {/* === DATA SISWA === */}
            <div className="col-12">
              <h4 className="text-lg font-semibold mb-2 text-primary border-b pb-2">
                Data Siswa
              </h4>
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="nis" className="block text-900 font-medium mb-1">
                NIS <span className="text-red-500">*</span>
              </label>
              <InputText
                id="nis"
                value={form.nis}
                onChange={handleChange}
                placeholder="Contoh: 231234"
                required
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="nisn" className="block text-900 font-medium mb-1">
                NISN <span className="text-red-500">*</span>
              </label>
              <InputText
                id="nisn"
                value={form.nisn}
                onChange={handleChange}
                placeholder="Contoh: 1234567890"
                required
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="nama" className="block text-900 font-medium mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <InputText
                id="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                required
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-6">
              <label className="block text-900 font-medium mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={form.gender}
                options={genderOptions}
                onChange={(e) => setForm((prev) => ({ ...prev, gender: e.value }))}
                placeholder="Pilih Gender"
                required
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="tempat_lahir" className="block text-900 font-medium mb-1">
                Tempat Lahir
              </label>
              <InputText
                id="tempat_lahir"
                value={form.tempat_lahir}
                onChange={handleChange}
                placeholder="Contoh: Jakarta"
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-6">
              <label className="block text-900 font-medium mb-1">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <Calendar
                value={form.tgl_lahir}
                onChange={(e) => setForm((prev) => ({ ...prev, tgl_lahir: e.value as Date }))}
                dateFormat="yy-mm-dd"
                showIcon
                placeholder="YYYY-MM-DD"
                required
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-6">
              <label className="block text-900 font-medium mb-1">Agama</label>
              <Dropdown
                value={form.agama}
                options={agamaOptions}
                onChange={(e) => setForm((prev) => ({ ...prev, agama: e.value }))}
                placeholder="Pilih Agama"
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-6">
              <label className="block text-900 font-medium mb-1">Golongan Darah</label>
              <Dropdown
                value={form.gol_darah}
                options={golDarahOptions}
                onChange={(e) => setForm((prev) => ({ ...prev, gol_darah: e.value }))}
                placeholder="Pilih Gol. Darah"
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="alamat" className="block text-900 font-medium mb-1">
                Alamat
              </label>
              <InputText
                id="alamat"
                value={form.alamat}
                onChange={handleChange}
                placeholder="Alamat lengkap"
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="no_telp" className="block text-900 font-medium mb-1">
                No. Telepon
              </label>
              <InputText
                id="no_telp"
                value={form.no_telp}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-4">
              <label className="block text-900 font-medium mb-1">Tinggi Badan (cm)</label>
              <InputNumber
                value={form.tinggi}
                onValueChange={(e) => setForm((prev) => ({ ...prev, tinggi: e.value ?? null }))}
                placeholder="Contoh: 165"
                className="w-full"
                suffix=" cm"
              />
            </div>

            <div className="field col-12 md:col-4">
              <label className="block text-900 font-medium mb-1">Berat Badan (kg)</label>
              <InputNumber
                value={form.berat}
                onValueChange={(e) => setForm((prev) => ({ ...prev, berat: e.value ?? null }))}
                placeholder="Contoh: 55"
                className="w-full"
                suffix=" kg"
              />
            </div>

            <div className="field col-12 md:col-4">
              <label htmlFor="kebutuhan_khusus" className="block text-900 font-medium mb-1">
                Kebutuhan Khusus
              </label>
              <InputText
                id="kebutuhan_khusus"
                value={form.kebutuhan_khusus}
                onChange={handleChange}
                placeholder="Jika ada"
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-12">
              <label className="block text-900 font-medium mb-1">Foto Siswa</label>
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

            {/* === DATA AKUN === */}
            <div className="col-12 mt-3">
              <h4 className="text-lg font-semibold mb-2 text-primary border-b pb-2">
                Data Akun
              </h4>
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="email" className="block text-900 font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <InputText
                id="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@anda.com"
                type="email"
                required
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="password" className="block text-900 font-medium mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <InputText
                id="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 karakter"
                type="password"
                required
                className="w-full"
              />
            </div>

            {/* === DATA ORANG TUA / WALI === */}
            {orangTua.map((ot, index) => (
              <React.Fragment key={index}>
                <div className="col-12 mt-3">
                  <h4 className="text-lg font-semibold mb-2 text-primary border-b pb-2">
                    Data {ot.jenis}
                  </h4>
                </div>

                <div className="field col-12 md:col-6">
                  <label className="block text-900 font-medium mb-1">
                    Nama {ot.jenis}
                  </label>
                  <InputText
                    value={ot.nama}
                    onChange={(e) => handleOrangTuaChange(index, 'nama', e.target.value)}
                    placeholder={`Nama ${ot.jenis}`}
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-6">
                  <label className="block text-900 font-medium mb-1">Pekerjaan</label>
                  <InputText
                    value={ot.pekerjaan}
                    onChange={(e) => handleOrangTuaChange(index, 'pekerjaan', e.target.value)}
                    placeholder="Pekerjaan"
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-4">
                  <label className="block text-900 font-medium mb-1">Pendidikan</label>
                  <InputText
                    value={ot.pendidikan}
                    onChange={(e) => handleOrangTuaChange(index, 'pendidikan', e.target.value)}
                    placeholder="Pendidikan Terakhir"
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-4">
                  <label className="block text-900 font-medium mb-1">Alamat</label>
                  <InputText
                    value={ot.alamat}
                    onChange={(e) => handleOrangTuaChange(index, 'alamat', e.target.value)}
                    placeholder="Alamat"
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-4">
                  <label className="block text-900 font-medium mb-1">No. HP</label>
                  <InputText
                    value={ot.no_hp}
                    onChange={(e) => handleOrangTuaChange(index, 'no_hp', e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full"
                  />
                </div>
              </React.Fragment>
            ))}

            {/* Tombol Submit */}
            <div className="col-12 mt-4 flex gap-2">
              <Button
                type="submit"
                label={loading ? 'Memproses...' : 'Daftar Sekarang'}
                disabled={loading}
                className="flex-1 p-3"
                icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
              />
            </div>

            <div className="col-12 text-center mt-2">
              <span>Sudah punya akun? </span>
              <Link href="/auth/login" className="text-blue-500 hover:underline font-semibold">
                Login disini
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterSiswaPage;
