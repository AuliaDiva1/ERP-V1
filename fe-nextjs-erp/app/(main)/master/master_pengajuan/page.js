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
import FormPengajuan from "./components/FormMasterPengajuan";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MasterPengajuanPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [pengajuan, setPengajuan] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  /* ================= TOKEN ================= */
  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (!t) {
      router.push("/");
      return;
    }
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (token) fetchData(token);
  }, [token]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /* ================= FETCH DATA ================= */
  const fetchData = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-pengajuan`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        setPengajuan(res.data.data || []);
        setOriginalData(res.data.data || []);
        setHasAccess(true);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data");
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setHasAccess(false);
        toastRef.current?.showToast("01", "Anda tidak memiliki akses");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        toastRef.current?.showToast("01", err.message || "Terjadi kesalahan server");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  /* ================= SEARCH ================= */
  const handleSearch = (keyword) => {
    if (!keyword) {
      setPengajuan(originalData);
    } else {
      const key = keyword.toLowerCase();
      const filtered = originalData.filter(
        (d) =>
          d.KODE_PENGAJUAN?.toLowerCase().includes(key) ||
          d.NAMA_PENGAJUAN?.toLowerCase().includes(key) ||
          d.KATEGORI?.toLowerCase().includes(key)
      );
      setPengajuan(filtered);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (payload) => {
    try {
      let res;
      if (selectedData) {
        res = await axios.put(
          `${API_URL}/master-pengajuan/${selectedData.ID}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post(
          `${API_URL}/master-pengajuan`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (res.data.status === "00") {
        toastRef.current?.showToast(
          "00",
          `Pengajuan berhasil ${selectedData ? "diperbarui" : "ditambahkan"}`
        );
        setDialogVisible(false);
        setSelectedData(null);
        fetchData(token);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal menyimpan data");
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Internal Server Error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus pengajuan "${row.NAMA_PENGAJUAN}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-pengajuan/${row.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Data berhasil dihapus");
          fetchData(token);
        } catch (err) {
          toastRef.current?.showToast("01", "Gagal menghapus data");
        }
      },
    });
  };

  /* ================= COLUMNS ================= */
  const columns = [
    { field: "KODE_PENGAJUAN", header: "Kode", sortable: true, style: { width: "140px" } },
    { field: "NAMA_PENGAJUAN", header: "Nama Pengajuan", sortable: true },
    {
      field: "KATEGORI",
      header: "Kategori",
      body: (row) => (
        <Tag value={row.KATEGORI} severity={row.KATEGORI === "Kinerja" ? "info" : "warning"} />
      ),
    },
    {
      field: "STATUS",
      header: "Status",
      body: (row) => (
        <Tag value={row.STATUS} severity={row.STATUS === "Aktif" ? "success" : "danger"} />
      ),
    },
    {
      field: "KETERANGAN",
      header: "Keterangan",
      body: (row) => row.KETERANGAN || "-",
    },
    {
      header: "Aksi",
      body: (row) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            onClick={() => {
              setSelectedData(row);
              setDialogVisible(true);
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
      style: { width: "120px" },
    },
  ];

  /* ================= NO ACCESS ================= */
  if (!hasAccess) {
    return (
      <div className="card p-4 text-center py-8">
        <ToastNotifier ref={toastRef} />
        <i className="pi pi-lock text-6xl text-500 mb-4"></i>
        <h3>Akses Ditolak</h3>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Pengajuan</h3>

      <HeaderBar
        placeholder="Cari Pengajuan (Kode, Nama, Kategori...)"
        onSearch={handleSearch}
        onAddClick={() => {
          setSelectedData(null);
          setDialogVisible(true);
        }}
        showAddButton
      />

      <CustomDataTable
        data={pengajuan}
        loading={isLoading}
        columns={columns}
      />

      <FormPengajuan
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedData(null);
        }}
        selectedData={selectedData}
        onSave={handleSubmit}
      />
    </div>
  );
}