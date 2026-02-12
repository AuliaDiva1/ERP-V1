"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";

import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormBatch from "./components/FormBatch";
import BatchDetailDialog from "./components/BatchDetailDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MasterBatchPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [batch, setBatch] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  // Filter states
  const [filterJenisBatch, setFilterJenisBatch] = useState(null);
  const [filterStatusBatch, setFilterStatusBatch] = useState(null);
  const [filterKategori, setFilterKategori] = useState(null);

  // Filter options
  const [kategoriList, setKategoriList] = useState([]);

  const jenisBatchOptions = [
    { label: "Semua Jenis", value: null },
    { label: "Standar", value: "Standar" },
    { label: "Khusus", value: "Khusus" }
  ];

  const statusBatchOptions = [
    { label: "Semua Status", value: null },
    { label: "Pending", value: "Pending" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
    { label: "On Hold", value: "On Hold" },
    { label: "Cancelled", value: "Cancelled" }
  ];

  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (!t) {
      router.push("/");
      return;
    }
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (token) fetchBatch(token);
  }, [token]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  const fetchBatch = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-batch`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        setBatch(data);
        setOriginalData(data);
        setHasAccess(true);

        // Extract unique kategori
        const uniqueKategori = [...new Set(data.map(b => b.KATEGORI_PRODUK))].filter(Boolean);
        setKategoriList([
          { label: "Semua Kategori", value: null },
          ...uniqueKategori.map(k => ({ label: k, value: k }))
        ]);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data batch");
      }
    } catch (err) {
      console.error("Error fetching batch:", err);
      
      if (err.response?.status === 403 || err.response?.status === 401) {
        setHasAccess(false);
        toastRef.current?.showToast("01", "Anda tidak memiliki akses ke halaman ini");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        toastRef.current?.showToast("01", err.message || "Gagal memuat data batch");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...originalData];

    if (filterJenisBatch) {
      filtered = filtered.filter(b => b.JENIS_BATCH === filterJenisBatch);
    }

    if (filterStatusBatch) {
      filtered = filtered.filter(b => b.STATUS_BATCH === filterStatusBatch);
    }

    if (filterKategori) {
      filtered = filtered.filter(b => b.KATEGORI_PRODUK === filterKategori);
    }

    setBatch(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filterJenisBatch, filterStatusBatch, filterKategori]);

  const resetFilters = () => {
    setFilterJenisBatch(null);
    setFilterStatusBatch(null);
    setFilterKategori(null);
    setBatch(originalData);
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFilters();
    } else {
      const lowerKeyword = keyword.toLowerCase();
      let filtered = [...originalData];

      // Apply dropdown filters first
      if (filterJenisBatch) {
        filtered = filtered.filter(b => b.JENIS_BATCH === filterJenisBatch);
      }
      if (filterStatusBatch) {
        filtered = filtered.filter(b => b.STATUS_BATCH === filterStatusBatch);
      }
      if (filterKategori) {
        filtered = filtered.filter(b => b.KATEGORI_PRODUK === filterKategori);
      }

      // Then apply keyword search
      filtered = filtered.filter(
        (b) =>
          b.BATCH_ID?.toLowerCase().includes(lowerKeyword) ||
          b.NAMA_BATCH?.toLowerCase().includes(lowerKeyword) ||
          b.KATEGORI_PRODUK?.toLowerCase().includes(lowerKeyword) ||
          b.KODE_PRODUK?.toLowerCase().includes(lowerKeyword)
      );
      
      setBatch(filtered);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedBatch) {
        const res = await axios.put(
          `${API_URL}/master-batch/${selectedBatch.ID}`,
          data,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Batch berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal memperbarui batch");
          return;
        }
      } else {
        const res = await axios.post(`${API_URL}/master-batch`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", `Batch berhasil ditambahkan. Kode: ${res.data.batch_id}`);
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal menambahkan batch");
          return;
        }
      }

      if (isMounted.current) {
        await fetchBatch(token);
        setDialogVisible(false);
        setSelectedBatch(null);
      }
    } catch (err) {
      console.error(err);
      
      if (err.response?.status === 403) {
        toastRef.current?.showToast("01", "Anda tidak memiliki izin untuk melakukan aksi ini");
      } else {
        toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan batch");
      }
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus batch "${rowData.NAMA_BATCH}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const res = await axios.delete(`${API_URL}/master-batch/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (res.data.status === "00") {
            toastRef.current?.showToast("00", "Batch berhasil dihapus");
            if (isMounted.current) {
              await fetchBatch(token);
            }
          } else {
            toastRef.current?.showToast("01", res.data.message || "Gagal menghapus batch");
          }
        } catch (err) {
          console.error(err);
          
          if (err.response?.status === 403) {
            toastRef.current?.showToast("01", "Anda tidak memiliki izin untuk menghapus batch");
          } else {
            toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menghapus batch");
          }
        }
      },
    });
  };

  const getStatusSeverity = (status) => {
    const map = {
      "Pending": "warning",
      "In Progress": "info",
      "Completed": "success",
      "On Hold": "warning",
      "Cancelled": "danger"
    };
    return map[status] || "secondary";
  };

  const batchColumns = [
    { 
      field: "BATCH_ID", 
      header: "Kode Batch", 
      style: { minWidth: "140px" },
      sortable: true
    },
    { 
      field: "NAMA_BATCH", 
      header: "Nama Batch", 
      style: { minWidth: "200px" },
      sortable: true
    },
    {
      field: "JENIS_BATCH",
      header: "Jenis",
      body: (rowData) => (
        <Tag 
          value={rowData.JENIS_BATCH} 
          severity={rowData.JENIS_BATCH === "Standar" ? "info" : "help"}
        />
      ),
      style: { width: "120px" },
      sortable: true
    },
    {
      field: "KATEGORI_PRODUK",
      header: "Kategori",
      style: { minWidth: "150px" },
      body: (rowData) => rowData.KATEGORI_PRODUK || "-",
      sortable: true
    },
    {
      field: "TARGET_JUMLAH",
      header: "Target",
      style: { minWidth: "100px" },
      body: (rowData) => `${rowData.TARGET_JUMLAH} ${rowData.SATUAN || ""}`,
      sortable: true
    },
    {
      field: "JUMLAH_SELESAI",
      header: "Selesai",
      style: { minWidth: "100px" },
      body: (rowData) => {
        const progress = rowData.TARGET_JUMLAH > 0 
          ? ((rowData.JUMLAH_SELESAI / rowData.TARGET_JUMLAH) * 100).toFixed(0)
          : 0;
        
        return (
          <div>
            <div>{rowData.JUMLAH_SELESAI} ({progress}%)</div>
          </div>
        );
      },
      sortable: true
    },
    {
      field: "STATUS_BATCH",
      header: "Status",
      style: { minWidth: "130px" },
      body: (rowData) => (
        <Tag
          value={rowData.STATUS_BATCH}
          severity={getStatusSeverity(rowData.STATUS_BATCH)}
        />
      ),
      sortable: true
    },
    {
      field: "TANGGAL_MULAI",
      header: "Tanggal Mulai",
      body: (row) => row.TANGGAL_MULAI 
        ? new Date(row.TANGGAL_MULAI).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric"
          }) 
        : "-",
      sortable: true,
      style: { minWidth: "130px" }
    },
    {
      field: "TANGGAL_TARGET_SELESAI",
      header: "Target Selesai",
      body: (row) => row.TANGGAL_TARGET_SELESAI 
        ? new Date(row.TANGGAL_TARGET_SELESAI).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric"
          }) 
        : "-",
      sortable: true,
      style: { minWidth: "130px" }
    },
    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-eye"
            size="small"
            severity="info"
            tooltip="Detail"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedBatch(rowData);
              setDetailVisible(true);
            }}
          />
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            tooltip="Edit"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedBatch(rowData);
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
      style: { width: "180px" },
    },
  ];

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

      <h3 className="text-xl font-semibold mb-3">Master Batch Produksi</h3>

      <div className="mb-4">
        <HeaderBar
          title=""
          placeholder="Cari batch (Kode, Nama, Kategori, Kode Produk)"
          onSearch={handleSearch}
          onAddClick={() => {
            setSelectedBatch(null);
            setDialogVisible(true);
          }}
          showAddButton={true}
        />
      </div>

      {/* Filter Dropdown */}
      <div className="grid mb-4">
        <div className="col-12 md:col-3">
          <label className="block mb-2 text-sm font-medium">Jenis Batch</label>
          <Dropdown
            value={filterJenisBatch}
            options={jenisBatchOptions}
            onChange={(e) => setFilterJenisBatch(e.value)}
            placeholder="Pilih Jenis"
            className="w-full"
            showClear
          />
        </div>
        <div className="col-12 md:col-3">
          <label className="block mb-2 text-sm font-medium">Status Batch</label>
          <Dropdown
            value={filterStatusBatch}
            options={statusBatchOptions}
            onChange={(e) => setFilterStatusBatch(e.value)}
            placeholder="Pilih Status"
            className="w-full"
            showClear
          />
        </div>
        <div className="col-12 md:col-3">
          <label className="block mb-2 text-sm font-medium">Kategori Produk</label>
          <Dropdown
            value={filterKategori}
            options={kategoriList}
            onChange={(e) => setFilterKategori(e.value)}
            placeholder="Pilih Kategori"
            className="w-full"
            showClear
          />
        </div>
        <div className="col-12 md:col-3 flex align-items-end">
          <Button
            label="Reset Filter"
            icon="pi pi-refresh"
            className="p-button-outlined w-full"
            onClick={resetFilters}
          />
        </div>
      </div>

      <CustomDataTable 
        data={batch} 
        loading={isLoading} 
        columns={batchColumns}
        emptyMessage="Belum ada data batch"
        paginator={true}
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      <FormBatch
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedBatch(null);
        }}
        selectedBatch={selectedBatch}
        onSave={handleSubmit}
      />

      <BatchDetailDialog
        visible={detailVisible}
        onHide={() => {
          setDetailVisible(false);
          setSelectedBatch(null);
        }}
        batch={selectedBatch}
      />
    </div>
  );
}