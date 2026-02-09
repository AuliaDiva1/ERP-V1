"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { Image } from "primereact/image";
import { Dropdown } from "primereact/dropdown";

import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormKaryawan from "./components/FormKaryawan";
import KaryawanDetailDialog from "./components/KaryawanDetailDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MasterKaryawanPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [karyawan, setKaryawan] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  // ✅ State untuk filter dropdown
  const [filterDepartemen, setFilterDepartemen] = useState(null);
  const [filterJabatan, setFilterJabatan] = useState(null);
  const [filterStatusKaryawan, setFilterStatusKaryawan] = useState(null);
  const [filterStatusAktif, setFilterStatusAktif] = useState(null);
  const [filterGender, setFilterGender] = useState(null);

  // ✅ Data untuk dropdown filter
  const [departemenList, setDepartemenList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  const statusKaryawanOptions = [
    { label: "Semua Status", value: null },
    { label: "Tetap", value: "Tetap" },
    { label: "Kontrak", value: "Kontrak" },
    { label: "Magang", value: "Magang" }
  ];

  const statusAktifOptions = [
    { label: "Semua", value: null },
    { label: "Aktif", value: "Aktif" },
    { label: "Nonaktif", value: "Nonaktif" }
  ];

  const genderOptions = [
    { label: "Semua", value: null },
    { label: "Laki-laki", value: "L" },
    { label: "Perempuan", value: "P" }
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
    if (token) fetchKaryawan(token);
  }, [token]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  const fetchKaryawan = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-karyawan`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        setKaryawan(data);
        setOriginalData(data);
        setHasAccess(true);

        // ✅ Extract unique departemen dan jabatan untuk filter
        const uniqueDept = [...new Set(data.map(k => k.DEPARTEMEN))].filter(Boolean);
        const uniqueJabatan = [...new Set(data.map(k => k.JABATAN))].filter(Boolean);

        setDepartemenList([
          { label: "Semua Departemen", value: null },
          ...uniqueDept.map(d => ({ label: d, value: d }))
        ]);

        setJabatanList([
          { label: "Semua Jabatan", value: null },
          ...uniqueJabatan.map(j => ({ label: j, value: j }))
        ]);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data karyawan");
      }
    } catch (err) {
      console.error("Error fetching karyawan:", err);
      
      if (err.response?.status === 403 || err.response?.status === 401) {
        setHasAccess(false);
        toastRef.current?.showToast("01", "Anda tidak memiliki akses ke halaman ini");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        toastRef.current?.showToast("01", err.message || "Gagal memuat data karyawan");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // ✅ Fungsi untuk apply filter
  const applyFilters = () => {
    let filtered = [...originalData];

    // Filter by search keyword
    if (filterDepartemen) {
      filtered = filtered.filter(k => k.DEPARTEMEN === filterDepartemen);
    }

    if (filterJabatan) {
      filtered = filtered.filter(k => k.JABATAN === filterJabatan);
    }

    if (filterStatusKaryawan) {
      filtered = filtered.filter(k => k.STATUS_KARYAWAN === filterStatusKaryawan);
    }

    if (filterStatusAktif) {
      filtered = filtered.filter(k => k.STATUS_AKTIF === filterStatusAktif);
    }

    if (filterGender) {
      filtered = filtered.filter(k => k.GENDER === filterGender);
    }

    setKaryawan(filtered);
  };

  // ✅ Trigger filter setiap ada perubahan
  useEffect(() => {
    applyFilters();
  }, [filterDepartemen, filterJabatan, filterStatusKaryawan, filterStatusAktif, filterGender]);

  // ✅ Reset semua filter
  const resetFilters = () => {
    setFilterDepartemen(null);
    setFilterJabatan(null);
    setFilterStatusKaryawan(null);
    setFilterStatusAktif(null);
    setFilterGender(null);
    setKaryawan(originalData);
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFilters(); // Apply existing filters
    } else {
      const lowerKeyword = keyword.toLowerCase();
      let filtered = [...originalData];

      // Apply dropdown filters first
      if (filterDepartemen) {
        filtered = filtered.filter(k => k.DEPARTEMEN === filterDepartemen);
      }
      if (filterJabatan) {
        filtered = filtered.filter(k => k.JABATAN === filterJabatan);
      }
      if (filterStatusKaryawan) {
        filtered = filtered.filter(k => k.STATUS_KARYAWAN === filterStatusKaryawan);
      }
      if (filterStatusAktif) {
        filtered = filtered.filter(k => k.STATUS_AKTIF === filterStatusAktif);
      }
      if (filterGender) {
        filtered = filtered.filter(k => k.GENDER === filterGender);
      }

      // Then apply keyword search
      filtered = filtered.filter(
        (k) =>
          k.KARYAWAN_ID?.toLowerCase().includes(lowerKeyword) ||
          k.NIK?.toLowerCase().includes(lowerKeyword) ||
          k.NAMA?.toLowerCase().includes(lowerKeyword) ||
          k.EMAIL?.toLowerCase().includes(lowerKeyword) ||
          k.DEPARTEMEN?.toLowerCase().includes(lowerKeyword) ||
          k.JABATAN?.toLowerCase().includes(lowerKeyword) ||
          k.NO_TELP?.toLowerCase().includes(lowerKeyword)
      );
      
      setKaryawan(filtered);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedKaryawan) {
        const res = await axios.put(
          `${API_URL}/master-karyawan/${selectedKaryawan.ID}`,
          data,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Karyawan berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal memperbarui karyawan");
          return;
        }
      } else {
        const res = await axios.post(`${API_URL}/master-karyawan`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        });

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", `Karyawan berhasil ditambahkan. Kode: ${res.data.karyawan_id}`);
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal menambahkan karyawan");
          return;
        }
      }

      if (isMounted.current) {
        await fetchKaryawan(token);
        setDialogVisible(false);
        setSelectedKaryawan(null);
      }
    } catch (err) {
      console.error(err);
      
      if (err.response?.status === 403) {
        toastRef.current?.showToast("01", "Anda tidak memiliki izin untuk melakukan aksi ini");
      } else {
        toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan karyawan");
      }
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus karyawan "${rowData.NAMA}"? Data user terkait juga akan dihapus.`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const res = await axios.delete(`${API_URL}/master-karyawan/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (res.data.status === "00") {
            toastRef.current?.showToast("00", "Karyawan dan user terkait berhasil dihapus");
            if (isMounted.current) {
              await fetchKaryawan(token);
            }
          } else {
            toastRef.current?.showToast("01", res.data.message || "Gagal menghapus karyawan");
          }
        } catch (err) {
          console.error(err);
          
          if (err.response?.status === 403) {
            toastRef.current?.showToast("01", "Anda tidak memiliki izin untuk menghapus karyawan");
          } else {
            toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menghapus karyawan");
          }
        }
      },
    });
  };

  const handleToggleStatus = async (rowData) => {
    const newStatus = rowData.STATUS_AKTIF === "Aktif" ? "Nonaktif" : "Aktif";
    
    confirmDialog({
      message: `Ubah status karyawan "${rowData.NAMA}" menjadi ${newStatus}?`,
      header: "Konfirmasi Ubah Status",
      icon: "pi pi-question-circle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      accept: async () => {
        try {
          const res = await axios.patch(
            `${API_URL}/master-karyawan/${rowData.ID}/toggle-status`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (res.data.status === "00") {
            toastRef.current?.showToast("00", `Status berhasil diubah menjadi ${newStatus}`);
            if (isMounted.current) {
              await fetchKaryawan(token);
            }
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

  const karyawanColumns = [
    { 
      field: "FOTO", 
      header: "Foto",
      body: (rowData) => {
        const fotoUrl = rowData.FOTO 
          ? `${API_URL.replace("/api", "")}${rowData.FOTO}` 
          : null;
        
        return (
          <div className="flex justify-content-center">
            {fotoUrl ? (
              <Image 
                src={fotoUrl} 
                alt={rowData.NAMA}
                width="80"
                height="80"
                preview
                imageStyle={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <Avatar
                icon="pi pi-user"
                size="xlarge"
                shape="circle"
                style={{ 
                  backgroundColor: '#2196F3',
                  color: '#ffffff',
                  width: '80px',
                  height: '80px'
                }}
              />
            )}
          </div>
        );
      },
      style: { width: "120px", textAlign: "center" }
    },
    { 
      field: "KARYAWAN_ID", 
      header: "Kode", 
      style: { minWidth: "120px" },
      sortable: true
    },
    { 
      field: "NIK", 
      header: "NIK", 
      style: { minWidth: "140px" },
      sortable: true
    },
    { 
      field: "NAMA", 
      header: "Nama Lengkap", 
      style: { minWidth: "200px" },
      sortable: true
    },
    {
      field: "GENDER",
      header: "L/P",
      body: (rowData) => (
        <Tag 
          value={rowData.GENDER} 
          severity={rowData.GENDER === "L" ? "info" : "danger"}
          style={{ minWidth: "40px" }}
        />
      ),
      style: { width: "80px" },
      sortable: true
    },
    {
      field: "EMAIL",
      header: "Email",
      style: { minWidth: "200px" },
      sortable: true
    },
    {
      field: "NO_TELP",
      header: "No. Telp",
      style: { minWidth: "140px" },
      body: (rowData) => rowData.NO_TELP || "-",
      sortable: true
    },
    {
      field: "DEPARTEMEN",
      header: "Departemen",
      style: { minWidth: "150px" },
      body: (rowData) => (
        <Tag value={rowData.DEPARTEMEN} severity="info" />
      ),
      sortable: true
    },
    {
      field: "JABATAN",
      header: "Jabatan",
      style: { minWidth: "150px" },
      sortable: true
    },
    {
      field: "STATUS_KARYAWAN",
      header: "Status",
      style: { minWidth: "120px" },
      body: (rowData) => {
        const severityMap = {
          "Tetap": "success",
          "Kontrak": "warning",
          "Magang": "info"
        };
        return (
          <Tag 
            value={rowData.STATUS_KARYAWAN} 
            severity={severityMap[rowData.STATUS_KARYAWAN] || "secondary"}
          />
        );
      },
      sortable: true
    },
    {
      field: "STATUS_AKTIF",
      header: "Aktif",
      style: { minWidth: "120px" },
      body: (rowData) => (
        <Tag
          value={rowData.STATUS_AKTIF}
          severity={rowData.STATUS_AKTIF === "Aktif" ? "success" : "danger"}
          icon={rowData.STATUS_AKTIF === "Aktif" ? "pi pi-check-circle" : "pi pi-times-circle"}
        />
      ),
      sortable: true
    },
    {
      field: "TANGGAL_MASUK",
      header: "Tanggal Masuk",
      body: (row) => row.TANGGAL_MASUK 
        ? new Date(row.TANGGAL_MASUK).toLocaleDateString("id-ID", {
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
            icon="pi pi-eye"
            size="small"
            severity="info"
            tooltip="Detail"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedKaryawan(rowData);
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
              setSelectedKaryawan(rowData);
              setDialogVisible(true);
            }}
          />
          <Button
            icon={rowData.STATUS_AKTIF === "Aktif" ? "pi pi-ban" : "pi pi-check"}
            size="small"
            severity={rowData.STATUS_AKTIF === "Aktif" ? "warning" : "success"}
            tooltip={rowData.STATUS_AKTIF === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
            tooltipOptions={{ position: "top" }}
            onClick={() => handleToggleStatus(rowData)}
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

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Karyawan</h3>

      <div className="mb-4">
        <HeaderBar
          title=""
          placeholder="Cari karyawan (Kode, NIK, Nama, Email, Departemen, Jabatan, Telepon)"
          onSearch={handleSearch}
          onAddClick={() => {
            setSelectedKaryawan(null);
            setDialogVisible(true);
          }}
          showAddButton={true}
        />
      </div>

      {/* ✅ Filter Dropdown Section */}
      <div className="grid mb-4">
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
          <label className="block mb-2 text-sm font-medium">Jabatan</label>
          <Dropdown
            value={filterJabatan}
            options={jabatanList}
            onChange={(e) => setFilterJabatan(e.value)}
            placeholder="Pilih Jabatan"
            className="w-full"
            showClear
          />
        </div>
        <div className="col-12 md:col-2">
          <label className="block mb-2 text-sm font-medium">Status Karyawan</label>
          <Dropdown
            value={filterStatusKaryawan}
            options={statusKaryawanOptions}
            onChange={(e) => setFilterStatusKaryawan(e.value)}
            placeholder="Pilih Status"
            className="w-full"
            showClear
          />
        </div>
        <div className="col-12 md:col-2">
          <label className="block mb-2 text-sm font-medium">Status Aktif</label>
          <Dropdown
            value={filterStatusAktif}
            options={statusAktifOptions}
            onChange={(e) => setFilterStatusAktif(e.value)}
            placeholder="Pilih Status"
            className="w-full"
            showClear
          />
        </div>
        <div className="col-12 md:col-2">
          <label className="block mb-2 text-sm font-medium">Gender</label>
          <Dropdown
            value={filterGender}
            options={genderOptions}
            onChange={(e) => setFilterGender(e.value)}
            placeholder="Pilih Gender"
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
        data={karyawan} 
        loading={isLoading} 
        columns={karyawanColumns}
        emptyMessage="Belum ada data karyawan"
        paginator={true}
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      <FormKaryawan
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedKaryawan(null);
        }}
        selectedKaryawan={selectedKaryawan}
        onSave={handleSubmit}
      />

      <KaryawanDetailDialog
        visible={detailVisible}
        onHide={() => {
          setDetailVisible(false);
          setSelectedKaryawan(null);
        }}
        karyawan={selectedKaryawan}
      />
    </div>
  );
}