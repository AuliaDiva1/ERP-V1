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
import FormBatchKaryawan from "./components/FormBatchKaryawan";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BatchKaryawanPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [batchKaryawan, setBatchKaryawan] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  // Filter states
  const [filterBatch, setFilterBatch] = useState(null);
  const [filterRole, setFilterRole] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  // Filter options
  const [batchList, setBatchList] = useState([]);

  const roleOptions = [
    { label: "Semua Role", value: null },
    { label: "Leader", value: "Leader" },
    { label: "Member", value: "Member" }
  ];

  const statusOptions = [
    { label: "Semua Status", value: null },
    { label: "Aktif", value: "Aktif" },
    { label: "Selesai", value: "Selesai" },
    { label: "Keluar", value: "Keluar" }
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
    if (token) {
      fetchBatchKaryawan(token);
      fetchBatchList(token);
    }
  }, [token]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  const fetchBatchKaryawan = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/batch-karyawan`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        setBatchKaryawan(data);
        setOriginalData(data);
        setHasAccess(true);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data");
      }
    } catch (err) {
      console.error("Error fetching batch karyawan:", err);
      
      if (err.response?.status === 403 || err.response?.status === 401) {
        setHasAccess(false);
        toastRef.current?.showToast("01", "Anda tidak memiliki akses ke halaman ini");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        toastRef.current?.showToast("01", err.message || "Gagal memuat data");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const fetchBatchList = async (t) => {
    try {
      const res = await axios.get(`${API_URL}/master-batch`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (res.data.status === "00") {
        const data = res.data.data || [];
        const options = data
          .filter(b => b.STATUS_BATCH !== "Completed" && b.STATUS_BATCH !== "Cancelled")
          .map(b => ({
            label: `${b.BATCH_ID} - ${b.NAMA_BATCH}`,
            value: b.BATCH_ID
          }));
        
        setBatchList([
          { label: "Semua Batch", value: null },
          ...options
        ]);
      }
    } catch (err) {
      console.error("Error fetching batch list:", err);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...originalData];

    if (filterBatch) {
      filtered = filtered.filter(bk => bk.BATCH_ID === filterBatch);
    }

    if (filterRole) {
      filtered = filtered.filter(bk => bk.ROLE_DALAM_BATCH === filterRole);
    }

    if (filterStatus) {
      filtered = filtered.filter(bk => bk.STATUS === filterStatus);
    }

    setBatchKaryawan(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filterBatch, filterRole, filterStatus]);

  const resetFilters = () => {
    setFilterBatch(null);
    setFilterRole(null);
    setFilterStatus(null);
    setBatchKaryawan(originalData);
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFilters();
    } else {
      const lowerKeyword = keyword.toLowerCase();
      let filtered = [...originalData];

      // Apply dropdown filters first
      if (filterBatch) {
        filtered = filtered.filter(bk => bk.BATCH_ID === filterBatch);
      }
      if (filterRole) {
        filtered = filtered.filter(bk => bk.ROLE_DALAM_BATCH === filterRole);
      }
      if (filterStatus) {
        filtered = filtered.filter(bk => bk.STATUS === filterStatus);
      }

      // Then apply keyword search
      filtered = filtered.filter(
        (bk) =>
          bk.BATCH_ID?.toLowerCase().includes(lowerKeyword) ||
          bk.NAMA_BATCH?.toLowerCase().includes(lowerKeyword) ||
          bk.KARYAWAN_ID?.toLowerCase().includes(lowerKeyword) ||
          bk.NAMA_KARYAWAN?.toLowerCase().includes(lowerKeyword) ||
          bk.NIK?.toLowerCase().includes(lowerKeyword)
      );
      
      setBatchKaryawan(filtered);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/batch-karyawan`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Karyawan berhasil ditambahkan ke batch");
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal menambahkan karyawan");
        return;
      }

      if (isMounted.current) {
        await fetchBatchKaryawan(token);
        setDialogVisible(false);
      }
    } catch (err) {
      console.error(err);
      
      if (err.response?.status === 403) {
        toastRef.current?.showToast("01", "Anda tidak memiliki izin untuk melakukan aksi ini");
      } else {
        toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan data");
      }
    }
  };

  const handleUpdateStatus = (rowData) => {
    const statusOptions = [
      { label: "Aktif", value: "Aktif" },
      { label: "Selesai", value: "Selesai" },
      { label: "Keluar", value: "Keluar" }
    ];

    confirmDialog({
      message: (
        <div>
          <p>Ubah status karyawan <strong>{rowData.NAMA_KARYAWAN}</strong> di batch <strong>{rowData.NAMA_BATCH}</strong>?</p>
          <div className="mt-3">
            <label className="block mb-2">Pilih Status Baru:</label>
            <Dropdown
              id="status-dropdown"
              options={statusOptions}
              placeholder="Pilih Status"
              className="w-full"
            />
          </div>
        </div>
      ),
      header: "Ubah Status Karyawan",
      icon: "pi pi-exclamation-circle",
      acceptLabel: "Ubah",
      rejectLabel: "Batal",
      accept: async () => {
        const newStatus = document.getElementById("status-dropdown").value;
        if (!newStatus) {
          toastRef.current?.showToast("01", "Pilih status terlebih dahulu");
          return;
        }

        try {
          const res = await axios.patch(
            `${API_URL}/batch-karyawan/${rowData.ID}/status`,
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (res.data.status === "00") {
            toastRef.current?.showToast("00", "Status berhasil diubah");
            await fetchBatchKaryawan(token);
          } else {
            toastRef.current?.showToast("01", res.data.message || "Gagal mengubah status");
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", err.response?.data?.message || "Gagal mengubah status");
        }
      },
    });
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus karyawan "${rowData.NAMA_KARYAWAN}" dari batch "${rowData.NAMA_BATCH}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const res = await axios.delete(`${API_URL}/batch-karyawan/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (res.data.status === "00") {
            toastRef.current?.showToast("00", "Karyawan berhasil dihapus dari batch");
            if (isMounted.current) {
              await fetchBatchKaryawan(token);
            }
          } else {
            toastRef.current?.showToast("01", res.data.message || "Gagal menghapus");
          }
        } catch (err) {
          console.error(err);
          
          if (err.response?.status === 403) {
            toastRef.current?.showToast("01", "Anda tidak memiliki izin untuk menghapus");
          } else {
            toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menghapus");
          }
        }
      },
    });
  };

  const batchKaryawanColumns = [
    { 
      field: "BATCH_ID", 
      header: "Kode Batch", 
      style: { minWidth: "130px" },
      sortable: true
    },
    { 
      field: "NAMA_BATCH", 
      header: "Nama Batch", 
      style: { minWidth: "200px" },
      sortable: true
    },
    {
      field: "STATUS_BATCH",
      header: "Status Batch",
      body: (rowData) => {
        const severityMap = {
          "Pending": "warning",
          "In Progress": "info",
          "Completed": "success",
          "On Hold": "warning",
          "Cancelled": "danger"
        };
        return (
          <Tag 
            value={rowData.STATUS_BATCH} 
            severity={severityMap[rowData.STATUS_BATCH] || "secondary"}
          />
        );
      },
      style: { minWidth: "130px" },
      sortable: true
    },
    { 
      field: "KARYAWAN_ID", 
      header: "Kode Karyawan", 
      style: { minWidth: "130px" },
      sortable: true
    },
    { 
      field: "NIK", 
      header: "NIK", 
      style: { minWidth: "130px" },
      sortable: true
    },
    { 
      field: "NAMA_KARYAWAN", 
      header: "Nama Karyawan", 
      style: { minWidth: "180px" },
      sortable: true
    },
    { 
      field: "DEPARTEMEN", 
      header: "Departemen", 
      style: { minWidth: "130px" },
      body: (rowData) => (
        <Tag value={rowData.DEPARTEMEN} severity="info" />
      ),
      sortable: true
    },
    {
      field: "ROLE_DALAM_BATCH",
      header: "Role",
      body: (rowData) => (
        <Tag 
          value={rowData.ROLE_DALAM_BATCH} 
          severity={rowData.ROLE_DALAM_BATCH === "Leader" ? "success" : "info"}
          icon={rowData.ROLE_DALAM_BATCH === "Leader" ? "pi pi-star-fill" : "pi pi-user"}
        />
      ),
      style: { width: "120px" },
      sortable: true
    },
    {
      field: "STATUS",
      header: "Status",
      body: (rowData) => {
        const severityMap = {
          "Aktif": "success",
          "Selesai": "info",
          "Keluar": "danger"
        };
        return (
          <Tag
            value={rowData.STATUS}
            severity={severityMap[rowData.STATUS] || "secondary"}
          />
        );
      },
      style: { width: "100px" },
      sortable: true
    },
    {
      field: "created_at",
      header: "Tanggal Bergabung",
      body: (row) => row.created_at 
        ? new Date(row.created_at).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric"
          }) 
        : "-",
      sortable: true,
      style: { minWidth: "140px" }
    },
    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            tooltip="Ubah Status"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleUpdateStatus(rowData)}
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
          <p className="text-500">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Batch Karyawan</h3>

      <div className="mb-4">
        <HeaderBar
          title=""
          placeholder="Cari (Batch, Karyawan, NIK)"
          onSearch={handleSearch}
          onAddClick={() => {
            setSelectedAssignment(null);
            setDialogVisible(true);
          }}
          showAddButton={true}
        />
      </div>

      {/* Filter Dropdown */}
      <div className="grid mb-4">
        <div className="col-12 md:col-3">
          <label className="block mb-2 text-sm font-medium">Batch</label>
          <Dropdown
            value={filterBatch}
            options={batchList}
            onChange={(e) => setFilterBatch(e.value)}
            placeholder="Pilih Batch"
            className="w-full"
            showClear
            filter
          />
        </div>
        <div className="col-12 md:col-2">
          <label className="block mb-2 text-sm font-medium">Role</label>
          <Dropdown
            value={filterRole}
            options={roleOptions}
            onChange={(e) => setFilterRole(e.value)}
            placeholder="Pilih Role"
            className="w-full"
            showClear
          />
        </div>
        <div className="col-12 md:col-2">
          <label className="block mb-2 text-sm font-medium">Status</label>
          <Dropdown
            value={filterStatus}
            options={statusOptions}
            onChange={(e) => setFilterStatus(e.value)}
            placeholder="Pilih Status"
            className="w-full"
            showClear
          />
        </div>
        <div className="col-12 md:col-2 flex align-items-end">
          <Button
            label="Reset Filter"
            icon="pi pi-refresh"
            className="p-button-outlined w-full"
            onClick={resetFilters}
          />
        </div>
      </div>

      <CustomDataTable 
        data={batchKaryawan} 
        loading={isLoading} 
        columns={batchKaryawanColumns}
        emptyMessage="Belum ada assignment karyawan ke batch"
        paginator={true}
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      <FormBatchKaryawan
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedAssignment(null);
        }}
        onSave={handleSubmit}
      />
    </div>
  );
}