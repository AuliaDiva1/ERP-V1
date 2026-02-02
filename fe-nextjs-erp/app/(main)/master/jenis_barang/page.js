"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";

import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import HeaderBar from "../../../components/headerbar";
import FormJenisBarang from "./components/FormJenisBarang";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MasterJenisPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [dataList, setDataList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-jenis-barang`);
      if (res.data.status === "00") {
        setDataList(res.data.data || []);
        setOriginalData(res.data.data || []);
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal memuat data jenis barang");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      setDataList(originalData);
      return;
    }
    const filtered = originalData.filter(v => 
      v.KODE_JENIS?.toLowerCase().includes(keyword.toLowerCase()) || 
      v.NAMA_JENIS?.toLowerCase().includes(keyword.toLowerCase())
    );
    setDataList(filtered);
  };

  const handleSubmit = async (payload) => {
    try {
      let res;
      if (selectedData) {
        res = await axios.put(`${API_URL}/master-jenis-barang/${selectedData.ID}`, payload);
      } else {
        res = await axios.post(`${API_URL}/master-jenis-barang`, payload);
      }

      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Data berhasil disimpan");
        setDialogVisible(false);
        fetchData();
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal menyimpan data");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus jenis "${rowData.NAMA_JENIS}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const res = await axios.delete(`${API_URL}/master-jenis-barang/${rowData.ID}`);
          if (res.data.status === "00") {
            toastRef.current?.showToast("00", "Data berhasil dihapus");
            fetchData();
          } else {
            toastRef.current?.showToast("01", res.data.message || "Gagal menghapus data");
          }
        } catch (err) {
          toastRef.current?.showToast("01", "Data tidak bisa dihapus karena masih digunakan di tabel lain");
        }
      }
    });
  };

  const columns = [
    { field: "KODE_JENIS", header: "Kode", sortable: true },
    { field: "NAMA_JENIS", header: "Nama Jenis", sortable: true },
    { 
      field: "STATUS", 
      header: "Status", 
      body: (row) => <Tag value={row.STATUS} severity={row.STATUS === "Aktif" ? "success" : "danger"} /> 
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
              setSelectedData(rowData);
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


  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />
      
      <h3 className="text-xl font-semibold mb-3">Master Jenis Barang</h3>
      
      <HeaderBar 
        onSearch={handleSearch} 
        onAddClick={() => { 
          setSelectedData(null); 
          setDialogVisible(true); 
        }} 
        showAddButton={true} 
        placeholder="Cari kode atau nama jenis..."
      />

      <CustomDataTable 
        data={dataList} 
        loading={isLoading} 
        columns={columns} 
        emptyMessage="Data jenis barang tidak ditemukan."
      />

      <FormJenisBarang 
        visible={dialogVisible} 
        onHide={() => setDialogVisible(false)} 
        onSave={handleSubmit} 
        selectedData={selectedData} 
      />
    </div>
  );
}