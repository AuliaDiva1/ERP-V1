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
import FormVendor from "./components/FormVendor";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MasterVendorPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [vendor, setVendor] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  
  // State untuk track permission dari backend
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
    if (token) fetchVendor(token);
  }, [token]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  const fetchVendor = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-vendor`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        setVendor(data);
        setOriginalData(data);
        setHasAccess(true); // User punya akses
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data vendor");
      }
    } catch (err) {
      console.error("Error fetching vendor:", err);
      
      // Jika error 403 atau 401, berarti tidak punya akses
      if (err.response?.status === 403 || err.response?.status === 401) {
        setHasAccess(false);
        toastRef.current?.showToast("01", "Anda tidak memiliki akses ke halaman ini");
        // Redirect ke dashboard atau halaman lain
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        toastRef.current?.showToast("01", err.message || "Gagal memuat data vendor");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Search handler
  const handleSearch = (keyword) => {
    if (!keyword) {
      setVendor(originalData);
    } else {
      const lowerKeyword = keyword.toLowerCase();
      const filtered = originalData.filter(
        (v) =>
          v.VENDOR_ID?.toLowerCase().includes(lowerKeyword) ||
          v.NAMA_VENDOR?.toLowerCase().includes(lowerKeyword) ||
          v.ALAMAT_VENDOR?.toLowerCase().includes(lowerKeyword) ||
          v.PIC?.toLowerCase().includes(lowerKeyword) ||
          v.NO_TELP_PIC?.toLowerCase().includes(lowerKeyword) ||
          v.EMAIL_PIC?.toLowerCase().includes(lowerKeyword)
      );
      setVendor(filtered);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedVendor) {
        const res = await axios.put(
          `${API_URL}/master-vendor/${selectedVendor.ID}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Vendor berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal memperbarui vendor");
          return;
        }
      } else {
        const res = await axios.post(`${API_URL}/master-vendor`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Vendor berhasil ditambahkan");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal menambahkan vendor");
          return;
        }
      }

      if (isMounted.current) {
        await fetchVendor(token);
        setDialogVisible(false);
        setSelectedVendor(null);
      }
    } catch (err) {
      console.error(err);
      
      // Handle error dari backend
      if (err.response?.status === 403) {
        toastRef.current?.showToast("01", "Anda tidak memiliki izin untuk melakukan aksi ini");
      } else {
        toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan vendor");
      }
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus vendor "${rowData.NAMA_VENDOR}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-vendor/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Vendor berhasil dihapus");
          if (isMounted.current) {
            await fetchVendor(token);
          }
        } catch (err) {
          console.error(err);
          
          // Handle error dari backend
          if (err.response?.status === 403) {
            toastRef.current?.showToast("01", "Anda tidak memiliki izin untuk menghapus vendor");
          } else {
            toastRef.current?.showToast("01", "Gagal menghapus vendor");
          }
        }
      },
    });
  };

  const vendorColumns = [
    { 
      field: "ID", 
      header: "ID", 
      style: { width: "80px" },
      sortable: true
    },
    { 
      field: "VENDOR_ID", 
      header: "Kode Vendor", 
      style: { minWidth: "120px" },
      sortable: true
    },
    { 
      field: "NAMA_VENDOR", 
      header: "Nama Vendor", 
      style: { minWidth: "200px" },
      filter: true,
      sortable: true
    },
    {
      field: "ALAMAT_VENDOR",
      header: "Alamat",
      style: { minWidth: "250px" },
      filter: true,
      sortable: true
    },
    {
      field: "PIC",
      header: "PIC",
      style: { minWidth: "150px" },
      filter: true,
      sortable: true
    },
    {
      field: "NO_TELP_PIC",
      header: "No. Telp PIC",
      style: { minWidth: "140px" },
      body: (rowData) => rowData.NO_TELP_PIC || "-",
      sortable: true
    },
    {
      field: "EMAIL_PIC",
      header: "Email PIC",
      style: { minWidth: "200px" },
      body: (rowData) => rowData.EMAIL_PIC || "-",
      sortable: true
    },
    {
      field: "KETERSEDIAAN_BARANG",
      header: "Ketersediaan Barang",
      style: { minWidth: "180px" },
      body: (rowData) => {
        const status = rowData.KETERSEDIAAN_BARANG;
        return (
          <Tag
            value={status}
            severity={status === "Tersedia" ? "success" : "danger"}
            icon={status === "Tersedia" ? "pi pi-check-circle" : "pi pi-times-circle"}
          />
        );
      },
      filter: true,
      sortable: true
    },
    {
      field: "created_at",
      header: "Dibuat Pada",
      body: (row) => row.created_at 
        ? new Date(row.created_at).toLocaleString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }) 
        : "-",
      sortable: true,
      style: { width: "180px" }
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
              setSelectedVendor(rowData);
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

  // Jika tidak punya akses, tampilkan pesan
  if (!hasAccess) {
    return (
      <div className="card p-4">
        <ToastNotifier ref={toastRef} />
        <div className="text-center py-8">
          <i className="pi pi-lock text-6xl text-500 mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">Akses Ditolak</h3>
          <p className="text-500">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Vendor</h3>

      {/* Toolbar */}
      <div className="mb-4">
        <HeaderBar
          title=""
          placeholder="Cari vendor (Kode, Nama, Alamat, PIC, Telepon, Email)"
          onSearch={handleSearch}
          onAddClick={() => {
            setSelectedVendor(null);
            setDialogVisible(true);
          }}
          showAddButton={true}
        />
      </div>

      {/* Tabel Data */}
      <CustomDataTable 
        data={vendor} 
        loading={isLoading} 
        columns={vendorColumns}
        emptyMessage="Belum ada data vendor"
      />

      {/* Form Vendor */}
      <FormVendor
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedVendor(null);
        }}
        selectedVendor={selectedVendor}
        onSave={handleSubmit}
        vendorList={originalData}
      />
    </div>
  );
}