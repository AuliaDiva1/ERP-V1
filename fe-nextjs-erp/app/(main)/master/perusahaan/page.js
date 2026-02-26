"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";

import ToastNotifier from "../../../components/ToastNotifier";
import FormMasterPerusahaan from "./components/FormMasterPerusahaan";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MasterPerusahaanPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [perusahaanData, setPerusahaanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, []);

  // --- 1. READ (GET DATA) ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-perusahaan`);
      if (res.data.status === "00" && res.data.data.length > 0) {
        setPerusahaanData(res.data.data[0]);
      } else {
        setPerusahaanData(null);
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal memuat profil perusahaan");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // --- 2. CREATE & UPDATE (SAVE DATA) ---
  const handleSubmit = async (payload) => {
    try {
      let res;
      if (perusahaanData && perusahaanData.ID_PERUSAHAAN) {
        res = await axios.put(`${API_URL}/master-perusahaan/${perusahaanData.ID_PERUSAHAAN}`, payload);
      } else {
        res = await axios.post(`${API_URL}/master-perusahaan`, payload);
      }

      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Data profil berhasil disimpan");
        setDialogVisible(false);
        fetchData();
      }
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Terjadi kesalahan server");
    }
  };

  // --- 3. DELETE (HAPUS DATA) ---
  const handleDelete = () => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus profil "${perusahaanData.NAMA_PERUSAHAAN}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const res = await axios.delete(`${API_URL}/master-perusahaan/${perusahaanData.ID_PERUSAHAAN}`);
          if (res.data.status === "00") {
            toastRef.current?.showToast("00", "Profil berhasil dihapus");
            setPerusahaanData(null);
            fetchData();
          }
        } catch (err) {
          toastRef.current?.showToast("01", "Gagal menghapus profil");
        }
      }
    });
  };

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />
      
      {/* HEADER SECTION */}
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
           <h3 className="text-xl font-semibold m-0">Pengaturan Profil Perusahaan</h3>
           <small className="text-gray-500">Kelola identitas resmi yang muncul pada dokumen & laporan</small>
        </div>
        <div className="flex gap-2">
          {perusahaanData && (
            <Button label="Hapus" icon="pi pi-trash" severity="danger" outlined onClick={handleDelete} />
          )}
          <Button 
            label={perusahaanData ? "Edit Profil" : "Tambah Profil"} 
            icon={perusahaanData ? "pi pi-pencil" : "pi pi-plus"} 
            severity={perusahaanData ? "warning" : "success"}
            onClick={() => setDialogVisible(true)} 
            loading={isLoading}
          />
        </div>
      </div>

      {/* MAIN CONTENT CARD */}
      <Card className="shadow-2 border-round-xl">
        {perusahaanData ? (
          <div className="grid">
            <div className="col-12 md:col-2 flex justify-content-center align-items-start">
              <div className="border-1 border-300 border-circle bg-gray-100 flex justify-content-center align-items-center" style={{ width: '130px', height: '130px', overflow: 'hidden' }}>
                {perusahaanData.LOGO_PATH ? (
                  <img src={perusahaanData.LOGO_PATH} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                ) : (
                  <i className="pi pi-building text-5xl text-gray-400"></i>
                )}
              </div>
            </div>

            <div className="col-12 md:col-10">
              <div className="flex flex-column gap-1">
                <h2 className="m-0 text-primary uppercase font-bold">{perusahaanData.NAMA_PERUSAHAAN}</h2>
                <p className="text-lg text-gray-700 m-0"><i className="pi pi-map-marker mr-2 text-primary"></i>{perusahaanData.ALAMAT_KANTOR}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm font-medium">
                  <span><i className="pi pi-phone mr-2 text-primary"></i>{perusahaanData.TELEPON || '-'}</span>
                  <span><i className="pi pi-whatsapp mr-2 text-green-500"></i>{perusahaanData.WA_HOTLINE || '-'}</span>
                  <span><i className="pi pi-envelope mr-2 text-primary"></i>{perusahaanData.EMAIL || '-'}</span>
                  <span><i className="pi pi-globe mr-2 text-primary"></i>{perusahaanData.WEBSITE || '-'}</span>
                </div>
              </div>

              <Divider />

              <div className="grid mt-2">
                <div className="col-12 md:col-4">
                  <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Legalitas & Pajak</label>
                  <p className="m-0 font-semibold text-gray-800">NPWP: {perusahaanData.NPWP || '-'}</p>
                  <p className="m-0 text-sm">Kota Terbit: {perusahaanData.KOTA_TERBIT || '-'}</p>
                </div>
                <div className="col-12 md:col-4">
                  <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Rekening Pembayaran</label>
                  <p className="m-0 font-semibold text-gray-800">{perusahaanData.NAMA_BANK || '-'}</p>
                  <p className="m-0 text-sm font-bold text-primary">{perusahaanData.NOMOR_REKENING || '-'}</p>
                  <p className="m-0 text-xs text-gray-600">a/n {perusahaanData.ATAS_NAMA_BANK || '-'}</p>
                </div>
                <div className="col-12 md:col-4">
                  <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Penanggung Jawab (TTD)</label>
                  <p className="m-0 font-semibold text-gray-800">{perusahaanData.NAMA_PIMPINAN || '-'}</p>
                  <p className="m-0 text-sm text-primary italic font-bold">{perusahaanData.JABATAN_PIMPINAN || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-column align-items-center justify-content-center p-8 bg-gray-50 border-round">
            <i className="pi pi-building text-6xl text-gray-300 mb-4"></i>
            <h4 className="m-0 text-gray-600">Profil Perusahaan Belum Diset</h4>
            <Button label="Lengkapi Sekarang" icon="pi pi-plus" severity="success" onClick={() => setDialogVisible(true)} className="mt-4" />
          </div>
        )}
      </Card>

      {/* ADDITIONAL INFO SECTION (YANG BARU DITAMBAHKAN DI BAWAHNYA) */}
      {perusahaanData && (
        <div className="grid mt-4">
          <div className="col-12 md:col-8">
            <Card title="Detail Alamat Operasional" className="h-full">
               <div className="flex align-items-start gap-3">
                  <i className="pi pi-truck text-2xl text-primary mt-1"></i>
                  <div>
                    <span className="font-bold block mb-1">Alamat Gudang Utama</span>
                    <p className="text-gray-600 m-0">{perusahaanData.ALAMAT_GUDANG || 'Alamat gudang belum spesifik diatur.'}</p>
                  </div>
               </div>
            </Card>
          </div>
          
          <div className="col-12 md:col-4">
            <Card title="Metadata" className="h-full">
              <div className="flex flex-column gap-3">
                <div className="flex justify-content-between">
                  <span className="text-gray-500">Status Data</span>
                  <Tag value="Aktif" severity="success" />
                </div>
                <div className="flex justify-content-between">
                  <span className="text-gray-500">Terakhir Update</span>
                  <span className="font-medium text-sm">
                    {perusahaanData.updated_at ? new Date(perusahaanData.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                  </span>
                </div>
                <div className="flex justify-content-between">
                  <span className="text-gray-500">ID Sistem</span>
                  <span className="font-medium text-sm text-primary">#{perusahaanData.ID_PERUSAHAAN}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      <FormMasterPerusahaan 
        visible={dialogVisible} 
        onHide={() => setDialogVisible(false)} 
        onSave={handleSubmit} 
        selectedData={perusahaanData} 
      />
    </div>
  );
}