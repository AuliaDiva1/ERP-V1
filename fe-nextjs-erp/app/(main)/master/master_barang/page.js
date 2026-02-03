"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";

import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormBarang from "./components/FormBarang";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MasterBarangPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [barang, setBarang] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [jenis, setJenis] = useState([]);
  const [satuan, setSatuan] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  
  // State untuk track permission
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (!t) {
      router.push("/");
      return;
    }
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (token) fetchAllRequiredData(token);
  }, [token]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  const fetchAllRequiredData = async (t) => {
    setIsLoading(true);
    try {
      // Mengambil data Barang, Jenis, dan Satuan sekaligus
      const [resB, resJ, resS] = await Promise.all([
        axios.get(`${API_URL}/master-barang`, { headers: { Authorization: `Bearer ${t}` } }),
        axios.get(`${API_URL}/master-jenis-barang`, { headers: { Authorization: `Bearer ${t}` } }),
        axios.get(`${API_URL}/master-satuan-barang`, { headers: { Authorization: `Bearer ${t}` } })
      ]);

      if (!isMounted.current) return;

      if (resB.data.status === "00") {
        setBarang(resB.data.data || []);
        setOriginalData(resB.data.data || []);
        setJenis(resJ.data.data || []);
        setSatuan(resS.data.data || []);
        setHasAccess(true);
      } else {
        toastRef.current?.showToast("01", resB.data.message || "Gagal memuat data barang");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setHasAccess(false);
        toastRef.current?.showToast("01", "Anda tidak memiliki akses ke halaman ini");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        toastRef.current?.showToast("01", err.message || "Terjadi kesalahan server");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      setBarang(originalData);
    } else {
      const lowerKeyword = keyword.toLowerCase();
      const filtered = originalData.filter(
        (b) =>
          b.BARANG_KODE?.toLowerCase().includes(lowerKeyword) ||
          b.NAMA_BARANG?.toLowerCase().includes(lowerKeyword) ||
          b.NAMA_JENIS?.toLowerCase().includes(lowerKeyword) ||
          b.NAMA_SATUAN?.toLowerCase().includes(lowerKeyword)
      );
      setBarang(filtered);
    }
  };

  const handleSubmit = async (payload) => {
    try {
      let res;
      if (selectedBarang) {
        res = await axios.put(`${API_URL}/master-barang/${selectedBarang.ID}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axios.post(`${API_URL}/master-barang`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (res.data.status === "00") {
        toastRef.current?.showToast("00", `Barang berhasil ${selectedBarang ? 'diperbarui' : 'ditambahkan'}`);
        setDialogVisible(false);
        setSelectedBarang(null);
        fetchAllRequiredData(token);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal menyimpan data");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        toastRef.current?.showToast("01", "Anda tidak memiliki izin untuk aksi ini");
      } else {
        toastRef.current?.showToast("01", "Internal Server Error");
      }
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus barang "${rowData.NAMA_BARANG}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-barang/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Barang berhasil dihapus");
          fetchAllRequiredData(token);
        } catch (err) {
          toastRef.current?.showToast("01", "Gagal menghapus barang");
        }
      },
    });
  };

  const barangColumns = [
    { field: "BARANG_KODE", header: "Kode", sortable: true, style: { width: "120px" } },
    { field: "NAMA_BARANG", header: "Nama Barang", sortable: true, filter: true },
    { 
      field: "NAMA_JENIS", 
      header: "Jenis", 
      sortable: true,
      body: (row) => <Tag value={row.NAMA_JENIS} severity="info" /> 
    },
    { field: "NAMA_SATUAN", header: "Satuan", sortable: true },
    { 
      field: "STOK_SAAT_INI", 
      header: "Stok", 
      sortable: true,
      body: (row) => {
        const isLow = row.STOK_SAAT_INI <= row.STOK_MINIMAL;
        return (
          <div className="flex flex-column">
            <span className={isLow ? "text-red-500 font-bold" : "text-green-600"}>
              {row.STOK_SAAT_INI || 0}
            </span>
            <small className="text-400">Min: {row.STOK_MINIMAL || 0}</small>
          </div>
        );
      }
    },
    { 
      field: "HARGA_BELI_TERAKHIR", 
      header: "Harga Terakhir", 
      sortable: true,
      body: (row) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.HARGA_BELI_TERAKHIR || 0)
    },
    {
      field: "STATUS",
      header: "Status",
      body: (row) => (
        <Tag value={row.STATUS} severity={row.STATUS === "Aktif" ? "success" : "danger"} />
      )
    },
   {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            tooltip="Edit"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedBarang(rowData);
              setDialogVisible(true);
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            tooltip="Hapus"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleDelete(rowData)}
          />
        </div>
      ),
      style: { width: "120px" },
    },
  ];


  if (!hasAccess) {
    return (
      <div className="card p-4">
        <ToastNotifier ref={toastRef} />
        <div className="text-center py-8">
          <i className="pi pi-lock text-6xl text-500 mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">Akses Ditolak</h3>
          <p className="text-500">Anda tidak memiliki izin untuk mengakses Master Barang.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Barang</h3>

      <div className="mb-4">
        <HeaderBar
          placeholder="Cari Barang (Kode, Nama, Jenis...)"
          onSearch={handleSearch}
          onAddClick={() => {
            setSelectedBarang(null);
            setDialogVisible(true);
          }}
          showAddButton={true}
        />
      </div>

      <CustomDataTable 
        data={barang} 
        loading={isLoading} 
        columns={barangColumns}
        emptyMessage="Data barang tidak tersedia"
      />

      <FormBarang
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedBarang(null);
        }}
        selectedData={selectedBarang}
        onSave={handleSubmit}
        jenisList={jenis}
        satuanList={satuan}
      />
    </div>
  );
}