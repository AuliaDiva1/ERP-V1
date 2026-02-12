"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";

import ToastNotifier from "../../../../components/ToastNotifier";
import HeaderBar from "../../../../components/headerbar";
import CustomDataTable from "../../../../components/DataTable";
import FormLogbook from "./components/FormLogbook";
import LogbookDetailDialog from "./components/LogbookDetailDialog";
import LogbookValidasiDialog from "./components/LogbookValidasiDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LogbookPekerjaanPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [userRole, setUserRole] = useState("");
  const [logbook, setLogbook] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [validasiVisible, setValidasiVisible] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  // Filter states
  const [filterBatch, setFilterBatch] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterTanggalMulai, setFilterTanggalMulai] = useState(null);
  const [filterTanggalSelesai, setFilterTanggalSelesai] = useState(null);

  // Filter options
  const [batchList, setBatchList] = useState([]);

  const statusOptions = [
    { label: "Semua Status", value: null },
    { label: "Draft", value: "Draft" },
    { label: "Submitted", value: "Submitted" },
    { label: "Approved", value: "Approved" },
    { label: "Rejected", value: "Rejected" }
  ];

  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("ROLE");
    if (!t) {
      router.push("/");
      return;
    }
    setToken(t);
    setUserRole(role);
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchLogbook(token);
      fetchBatchList(token);
    }
  }, [token]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  const fetchLogbook = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/logbook-pekerjaan`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        setLogbook(data);
        setOriginalData(data);
        setHasAccess(true);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data logbook");
      }
    } catch (err) {
      console.error("Error fetching logbook:", err);
      
      if (err.response?.status === 403 || err.response?.status === 401) {
        setHasAccess(false);
        toastRef.current?.showToast("01", "Anda tidak memiliki akses ke halaman ini");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        toastRef.current?.showToast("01", err.message || "Gagal memuat data logbook");
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
          .filter(b => b.STATUS_BATCH === "In Progress" || b.STATUS_BATCH === "Pending")
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
      filtered = filtered.filter(l => l.BATCH_ID === filterBatch);
    }

    if (filterStatus) {
      filtered = filtered.filter(l => l.STATUS === filterStatus);
    }

    if (filterTanggalMulai && filterTanggalSelesai) {
      const startDate = new Date(filterTanggalMulai).toISOString().split('T')[0];
      const endDate = new Date(filterTanggalSelesai).toISOString().split('T')[0];
      
      filtered = filtered.filter(l => {
        const logbookDate = new Date(l.TANGGAL).toISOString().split('T')[0];
        return logbookDate >= startDate && logbookDate <= endDate;
      });
    }

    setLogbook(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filterBatch, filterStatus, filterTanggalMulai, filterTanggalSelesai]);

  const resetFilters = () => {
    setFilterBatch(null);
    setFilterStatus(null);
    setFilterTanggalMulai(null);
    setFilterTanggalSelesai(null);
    setLogbook(originalData);
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFilters();
    } else {
      const lowerKeyword = keyword.toLowerCase();
      let filtered = [...originalData];

      // Apply dropdown filters first
      if (filterBatch) {
        filtered = filtered.filter(l => l.BATCH_ID === filterBatch);
      }
      if (filterStatus) {
        filtered = filtered.filter(l => l.STATUS === filterStatus);
      }

      // Then apply keyword search
      filtered = filtered.filter(
        (l) =>
          l.LOGBOOK_ID?.toLowerCase().includes(lowerKeyword) ||
          l.BATCH_ID?.toLowerCase().includes(lowerKeyword) ||
          l.NAMA_BATCH?.toLowerCase().includes(lowerKeyword) ||
          l.KARYAWAN_ID?.toLowerCase().includes(lowerKeyword) ||
          l.NAMA_KARYAWAN?.toLowerCase().includes(lowerKeyword) ||
          l.AKTIVITAS?.toLowerCase().includes(lowerKeyword)
      );
      
      setLogbook(filtered);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedLogbook) {
        const res = await axios.put(
          `${API_URL}/logbook-pekerjaan/${selectedLogbook.ID}`,
          data,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Logbook berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal memperbarui logbook");
          return;
        }
      } else {
        const res = await axios.post(`${API_URL}/logbook-pekerjaan`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        });

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", `Logbook berhasil ditambahkan. Kode: ${res.data.logbook_id}`);
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal menambahkan logbook");
          return;
        }
      }

      if (isMounted.current) {
        await fetchLogbook(token);
        setDialogVisible(false);
        setSelectedLogbook(null);
      }
    } catch (err) {
      console.error(err);
      
      if (err.response?.status === 403) {
        toastRef.current?.showToast("01", "Anda tidak memiliki izin untuk melakukan aksi ini");
      } else {
        toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan logbook");
      }
    }
  };

  const handleSubmitLogbook = (rowData) => {
    confirmDialog({
      message: `Submit logbook untuk validasi HR?`,
      header: "Konfirmasi Submit",
      icon: "pi pi-send",
      acceptLabel: "Ya, Submit",
      rejectLabel: "Batal",
      accept: async () => {
        try {
          const res = await axios.patch(
            `${API_URL}/logbook-pekerjaan/${rowData.ID}/submit`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (res.data.status === "00") {
            toastRef.current?.showToast("00", "Logbook berhasil di-submit");
            await fetchLogbook(token);
          } else {
            toastRef.current?.showToast("01", res.data.message || "Gagal submit logbook");
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", err.response?.data?.message || "Gagal submit logbook");
        }
      },
    });
  };

  const handleValidasi = async (logbookId, aksi, catatan) => {
    try {
      const res = await axios.post(
        `${API_URL}/logbook-pekerjaan/${logbookId}/validate`,
        { aksi, catatan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.status === "00") {
        toastRef.current?.showToast("00", `Logbook berhasil di-${aksi === "Approved" ? "approve" : "reject"}`);
        await fetchLogbook(token);
        setValidasiVisible(false);
        setSelectedLogbook(null);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal validasi logbook");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal validasi logbook");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus logbook "${rowData.LOGBOOK_ID}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const res = await axios.delete(`${API_URL}/logbook-pekerjaan/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (res.data.status === "00") {
            toastRef.current?.showToast("00", "Logbook berhasil dihapus");
            if (isMounted.current) {
              await fetchLogbook(token);
            }
          } else {
            toastRef.current?.showToast("01", res.data.message || "Gagal menghapus logbook");
          }
        } catch (err) {
          console.error(err);
          
          if (err.response?.status === 403) {
            toastRef.current?.showToast("01", "Anda tidak memiliki izin untuk menghapus logbook");
          } else {
            toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menghapus logbook");
          }
        }
      },
    });
  };

  const getStatusSeverity = (status) => {
    const map = {
      "Draft": "secondary",
      "Submitted": "warning",
      "Approved": "success",
      "Rejected": "danger"
    };
    return map[status] || "secondary";
  };

  const logbookColumns = [
    { 
      field: "LOGBOOK_ID", 
      header: "Kode Logbook", 
      style: { minWidth: "130px" },
      sortable: true
    },
    { 
      field: "TANGGAL", 
      header: "Tanggal",
      body: (row) => row.TANGGAL 
        ? new Date(row.TANGGAL).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric"
          }) 
        : "-",
      sortable: true,
      style: { minWidth: "120px" }
    },
    { 
      field: "BATCH_ID", 
      header: "Batch", 
      style: { minWidth: "120px" },
      sortable: true
    },
    { 
      field: "NAMA_BATCH", 
      header: "Nama Batch", 
      style: { minWidth: "180px" },
      sortable: true
    },
    { 
      field: "NAMA_KARYAWAN", 
      header: "Karyawan", 
      style: { minWidth: "150px" },
      sortable: true
    },
    { 
      field: "DEPARTEMEN", 
      header: "Departemen", 
      style: { minWidth: "120px" },
      body: (rowData) => (
        <Tag value={rowData.DEPARTEMEN} severity="info" />
      ),
      sortable: true
    },
    {
      field: "JAM_MULAI",
      header: "Jam Mulai",
      style: { width: "100px" },
      sortable: true
    },
    {
      field: "JAM_SELESAI",
      header: "Jam Selesai",
      body: (rowData) => rowData.JAM_SELESAI || "-",
      style: { width: "100px" },
      sortable: true
    },
    {
      field: "JAM_KERJA",
      header: "Total Jam",
      body: (rowData) => {
        if (!rowData.JAM_KERJA) return "-";
        
        const parts = rowData.JAM_KERJA.toString().split(':');
        if (parts.length === 2) {
          const hours = parseInt(parts[0]) || 0;
          const minutes = parseInt(parts[1]) || 0;
          
          if (hours > 0 && minutes > 0) {
            return `${hours} jam ${minutes} menit`;
          } else if (hours > 0) {
            return `${hours} jam`;
          } else if (minutes > 0) {
            return `${minutes} menit`;
          }
        }
        
        // Fallback
        const decimal = parseFloat(rowData.JAM_KERJA);
        if (!isNaN(decimal)) {
          const h = Math.floor(decimal);
          const m = Math.round((decimal - h) * 60);
          return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
        }
        
        return rowData.JAM_KERJA;
      },
      style: { width: "130px" },
      sortable: true
    },
    {
      field: "JUMLAH_OUTPUT",
      header: "Output",
      body: (rowData) => {
        const output = Math.floor(rowData.JUMLAH_OUTPUT || 0);
        return `${output} unit`;
      },
      style: { width: "100px" },
      sortable: true
    },
    {
      field: "AKTIVITAS",
      header: "Aktivitas",
      style: { minWidth: "200px" },
      body: (rowData) => {
        const maxLength = 50;
        return rowData.AKTIVITAS?.length > maxLength 
          ? `${rowData.AKTIVITAS.substring(0, maxLength)}...` 
          : rowData.AKTIVITAS;
      },
      sortable: true
    },
    {
      field: "STATUS",
      header: "Status",
      body: (rowData) => (
        <Tag
          value={rowData.STATUS}
          severity={getStatusSeverity(rowData.STATUS)}
        />
      ),
      style: { width: "120px" },
      sortable: true
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
              setSelectedLogbook(rowData);
              setDetailVisible(true);
            }}
          />
          
          {/* Edit - hanya jika status Draft dan milik user */}
          {rowData.STATUS === "Draft" && (
            <Button
              icon="pi pi-pencil"
              size="small"
              severity="warning"
              tooltip="Edit"
              tooltipOptions={{ position: "top" }}
              onClick={() => {
                setSelectedLogbook(rowData);
                setDialogVisible(true);
              }}
            />
          )}

          {/* Submit - hanya jika status Draft */}
          {rowData.STATUS === "Draft" && (
            <Button
              icon="pi pi-send"
              size="small"
              severity="success"
              tooltip="Submit"
              tooltipOptions={{ position: "top" }}
              onClick={() => handleSubmitLogbook(rowData)}
            />
          )}

          {/* Validasi - hanya HR dan status Submitted */}
          {(userRole === "HR" || userRole === "SUPERADMIN") && rowData.STATUS === "Submitted" && (
            <Button
              icon="pi pi-check-circle"
              size="small"
              severity="help"
              tooltip="Validasi"
              tooltipOptions={{ position: "top" }}
              onClick={() => {
                setSelectedLogbook(rowData);
                setValidasiVisible(true);
              }}
            />
          )}

          {/* Delete - hanya jika status Draft */}
          {rowData.STATUS === "Draft" && (
            <Button
              icon="pi pi-trash"
              size="small"
              severity="danger"
              tooltip="Hapus"
              tooltipOptions={{ position: "top" }}
              onClick={() => handleDelete(rowData)}
            />
          )}
        </div>
      ),
      style: { width: "220px" },
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

  // Hanya PRODUKSI, GUDANG, KEUANGAN yang bisa create
  const canCreate = ["PRODUKSI", "GUDANG", "KEUANGAN", "SUPERADMIN"].includes(userRole);

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Logbook Pekerjaan</h3>

      <div className="mb-4">
        <HeaderBar
          title=""
          placeholder="Cari logbook (Kode, Batch, Karyawan, Aktivitas)"
          onSearch={handleSearch}
          onAddClick={() => {
            setSelectedLogbook(null);
            setDialogVisible(true);
          }}
          showAddButton={canCreate}
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
        <div className="col-12 md:col-2">
          <label className="block mb-2 text-sm font-medium">Dari Tanggal</label>
          <Calendar
            value={filterTanggalMulai}
            onChange={(e) => setFilterTanggalMulai(e.value)}
            dateFormat="dd/mm/yy"
            placeholder="Pilih Tanggal"
            showIcon
            className="w-full"
          />
        </div>
        <div className="col-12 md:col-2">
          <label className="block mb-2 text-sm font-medium">Sampai Tanggal</label>
          <Calendar
            value={filterTanggalSelesai}
            onChange={(e) => setFilterTanggalSelesai(e.value)}
            dateFormat="dd/mm/yy"
            placeholder="Pilih Tanggal"
            showIcon
            className="w-full"
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
        data={logbook} 
        loading={isLoading} 
        columns={logbookColumns}
        emptyMessage="Belum ada data logbook"
        paginator={true}
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      <FormLogbook
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedLogbook(null);
        }}
        selectedLogbook={selectedLogbook}
        onSave={handleSubmit}
      />

      <LogbookDetailDialog
        visible={detailVisible}
        onHide={() => {
          setDetailVisible(false);
          setSelectedLogbook(null);
        }}
        logbook={selectedLogbook}
      />

      <LogbookValidasiDialog
        visible={validasiVisible}
        onHide={() => {
          setValidasiVisible(false);
          setSelectedLogbook(null);
        }}
        logbook={selectedLogbook}
        onValidasi={handleValidasi}
      />
    </div>
  );
}