"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Badge } from "primereact/badge";

import ToastNotifier from "../../../../components/ToastNotifier";
import HeaderBar from "../../../../components/headerbar";
import CustomDataTable from "../../../../components/DataTable";
import LogbookDetailDialog from "../../../produksi/menu/logbook-pekerjaan/components/LogbookDetailDialog";
import ValidasiQuickDialog from "./components/ValidasiQuickDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ValidasiLogbookPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [userRole, setUserRole] = useState("");
  const [logbook, setLogbook] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [validasiVisible, setValidasiVisible] = useState(false);
  const [validasiMode, setValidasiMode] = useState("reject"); // "reject" or "both"
  const [hasAccess, setHasAccess] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    submitted: 0,
    approved: 0,
    rejected: 0,
  });

  // Filter states
  const [filterBatch, setFilterBatch] = useState(null);
  const [filterKaryawan, setFilterKaryawan] = useState(null);
  const [filterDepartemen, setFilterDepartemen] = useState(null);
  const [filterTanggalMulai, setFilterTanggalMulai] = useState(null);
  const [filterTanggalSelesai, setFilterTanggalSelesai] = useState(null);

  // Filter options
  const [batchList, setBatchList] = useState([]);
  const [karyawanList, setKaryawanList] = useState([]);
  const [departemenList, setDepartemenList] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("ROLE");
    
    if (!t) {
      router.push("/");
      return;
    }

    // Hanya HR dan SUPERADMIN yang bisa akses
    if (role !== "HR" && role !== "SUPERADMIN") {
      setHasAccess(false);
      return;
    }

    setToken(t);
    setUserRole(role);
  }, [router]);

  useEffect(() => {
    if (token && hasAccess) {
      fetchLogbook(token);
      fetchBatchList(token);
      fetchKaryawanList(token);
    }
  }, [token, hasAccess]);

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

        // Calculate stats
        setStats({
          submitted: data.filter(l => l.STATUS === "Submitted").length,
          approved: data.filter(l => l.STATUS === "Approved").length,
          rejected: data.filter(l => l.STATUS === "Rejected").length,
        });

        // Extract unique departemen
        const uniqueDept = [...new Set(data.map(l => l.DEPARTEMEN))].filter(Boolean);
        setDepartemenList([
          { label: "Semua Departemen", value: null },
          ...uniqueDept.map(d => ({ label: d, value: d }))
        ]);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data logbook");
      }
    } catch (err) {
      console.error("Error fetching logbook:", err);
      toastRef.current?.showToast("01", err.message || "Gagal memuat data logbook");
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
        const options = data.map(b => ({
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

  const fetchKaryawanList = async (t) => {
    try {
      const res = await axios.get(`${API_URL}/master-karyawan`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (res.data.status === "00") {
        const data = res.data.data || [];
        const options = data
          .filter(k => ["PRODUKSI", "GUDANG", "KEUANGAN"].includes(k.DEPARTEMEN))
          .map(k => ({
            label: `${k.KARYAWAN_ID} - ${k.NAMA}`,
            value: k.KARYAWAN_ID
          }));
        
        setKaryawanList([
          { label: "Semua Karyawan", value: null },
          ...options
        ]);
      }
    } catch (err) {
      console.error("Error fetching karyawan list:", err);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...originalData];

    if (filterBatch) {
      filtered = filtered.filter(l => l.BATCH_ID === filterBatch);
    }

    if (filterKaryawan) {
      filtered = filtered.filter(l => l.KARYAWAN_ID === filterKaryawan);
    }

    if (filterDepartemen) {
      filtered = filtered.filter(l => l.DEPARTEMEN === filterDepartemen);
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
  }, [filterBatch, filterKaryawan, filterDepartemen, filterTanggalMulai, filterTanggalSelesai]);

  const resetFilters = () => {
    setFilterBatch(null);
    setFilterKaryawan(null);
    setFilterDepartemen(null);
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
      if (filterKaryawan) {
        filtered = filtered.filter(l => l.KARYAWAN_ID === filterKaryawan);
      }
      if (filterDepartemen) {
        filtered = filtered.filter(l => l.DEPARTEMEN === filterDepartemen);
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

  // ✅ IMPROVED: Use ValidasiQuickDialog for both approve and reject
  const handleQuickValidate = (rowData, mode) => {
    setSelectedLogbook(rowData);
    setValidasiMode(mode);
    setValidasiVisible(true);
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
      field: "NAMA_KARYAWAN", 
      header: "Karyawan", 
      style: { minWidth: "150px" },
      sortable: true
    },
    { 
      field: "NIK", 
      header: "NIK", 
      style: { minWidth: "120px" },
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
      field: "NAMA_BATCH", 
      header: "Batch", 
      style: { minWidth: "180px" },
      sortable: true
    },
    {
      field: "JAM_KERJA",
      header: "Jam Kerja",
      body: (rowData) => {
        // ✅ Parse format "5:17" menjadi "5 jam 17 menit"
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
        
        // Fallback untuk format lama (decimal)
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
        // ✅ Remove decimal, display as integer
        const output = Math.floor(rowData.JUMLAH_OUTPUT || 0);
        return (
          <div className="flex align-items-center gap-2">
            <i className="pi pi-chart-bar text-primary"></i>
            <span className="font-semibold">{output}</span>
          </div>
        );
      },
      style: { width: "100px" },
      sortable: true
    },
    {
      field: "AKTIVITAS",
      header: "Aktivitas",
      style: { minWidth: "200px" },
      body: (rowData) => {
        const maxLength = 40;
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
      header: "Aksi Validasi",
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
          
          {rowData.STATUS === "Submitted" && (
            <>
              <Button
                icon="pi pi-check-circle"
                size="small"
                severity="success"
                tooltip="Validasi (Approve/Reject)"
                tooltipOptions={{ position: "top" }}
                onClick={() => handleQuickValidate(rowData, "both")}
              />
              <Button
                icon="pi pi-times"
                size="small"
                severity="danger"
                tooltip="Quick Reject"
                tooltipOptions={{ position: "top" }}
                onClick={() => handleQuickValidate(rowData, "reject")}
              />
            </>
          )}

          {rowData.STATUS === "Approved" && (
            <Tag value="Approved" severity="success" icon="pi pi-check-circle" />
          )}

          {rowData.STATUS === "Rejected" && (
            <Tag value="Rejected" severity="danger" icon="pi pi-times-circle" />
          )}
        </div>
      ),
      style: { width: "200px" },
    },
  ];

  if (!hasAccess) {
    return (
      <div className="card p-4">
        <ToastNotifier ref={toastRef} />
        <div className="text-center py-8">
          <i className="pi pi-lock text-6xl text-500 mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">Akses Ditolak</h3>
          <p className="text-500">Hanya HR yang dapat mengakses halaman validasi logbook.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <div className="flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="text-xl font-semibold m-0">Validasi Logbook Pekerjaan</h3>
          <p className="text-600 text-sm mt-1">Review dan approve/reject logbook dari karyawan</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid mb-4">
        <div className="col-12 md:col-4">
          <div className="surface-card shadow-2 p-3 border-round">
            <div className="flex justify-content-between mb-2">
              <div>
                <span className="block text-500 font-medium mb-2">Menunggu Validasi</span>
                <div className="text-900 font-bold text-3xl">{stats.submitted}</div>
              </div>
              <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{width: '3rem', height: '3rem'}}>
                <i className="pi pi-clock text-orange-500 text-2xl"></i>
              </div>
            </div>
            <Badge value="Submitted" severity="warning" />
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="surface-card shadow-2 p-3 border-round">
            <div className="flex justify-content-between mb-2">
              <div>
                <span className="block text-500 font-medium mb-2">Approved</span>
                <div className="text-900 font-bold text-3xl">{stats.approved}</div>
              </div>
              <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{width: '3rem', height: '3rem'}}>
                <i className="pi pi-check-circle text-green-500 text-2xl"></i>
              </div>
            </div>
            <Badge value="Disetujui" severity="success" />
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="surface-card shadow-2 p-3 border-round">
            <div className="flex justify-content-between mb-2">
              <div>
                <span className="block text-500 font-medium mb-2">Rejected</span>
                <div className="text-900 font-bold text-3xl">{stats.rejected}</div>
              </div>
              <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{width: '3rem', height: '3rem'}}>
                <i className="pi pi-times-circle text-red-500 text-2xl"></i>
              </div>
            </div>
            <Badge value="Ditolak" severity="danger" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <HeaderBar
          title=""
          placeholder="Cari logbook (Kode, Karyawan, Batch, Aktivitas)"
          onSearch={handleSearch}
          showAddButton={false}
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
        <div className="col-12 md:col-3">
          <label className="block mb-2 text-sm font-medium">Karyawan</label>
          <Dropdown
            value={filterKaryawan}
            options={karyawanList}
            onChange={(e) => setFilterKaryawan(e.value)}
            placeholder="Pilih Karyawan"
            className="w-full"
            showClear
            filter
          />
        </div>
        <div className="col-12 md:col-2">
          <label className="block mb-2 text-sm font-medium">Departemen</label>
          <Dropdown
            value={filterDepartemen}
            options={departemenList}
            onChange={(e) => setFilterDepartemen(e.value)}
            placeholder="Pilih Departemen"
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
          <label className="block mb-2 text-sm font-medium">Sampai</label>
          <Calendar
            value={filterTanggalSelesai}
            onChange={(e) => setFilterTanggalSelesai(e.value)}
            dateFormat="dd/mm/yy"
            placeholder="Pilih Tanggal"
            showIcon
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          label="Reset Filter"
          icon="pi pi-refresh"
          className="p-button-outlined"
          onClick={resetFilters}
        />
        <Button
          label="Submitted Saja"
          icon="pi pi-clock"
          severity="warning"
          className="p-button-outlined"
          onClick={() => {
            resetFilters();
            setLogbook(originalData.filter(l => l.STATUS === "Submitted"));
          }}
        />
      </div>

      <CustomDataTable 
        data={logbook} 
        loading={isLoading} 
        columns={logbookColumns}
        emptyMessage="Belum ada logbook untuk divalidasi"
        paginator={true}
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Detail Dialog */}
      <LogbookDetailDialog
        visible={detailVisible}
        onHide={() => {
          setDetailVisible(false);
          setSelectedLogbook(null);
        }}
        logbook={selectedLogbook}
      />

      {/* ✅ ENHANCED: Single dialog for both approve and reject */}
      <ValidasiQuickDialog
        visible={validasiVisible}
        onHide={() => {
          setValidasiVisible(false);
          setSelectedLogbook(null);
        }}
        logbook={selectedLogbook}
        onValidasi={handleValidasi}
        mode={validasiMode}
      />
    </div>
  );
}