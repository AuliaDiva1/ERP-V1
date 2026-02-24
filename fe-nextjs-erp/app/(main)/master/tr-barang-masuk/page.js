"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "primereact/confirmdialog";
import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormBarangMasuk from "./components/FormBarangMasuk";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BarangMasukPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [barangMasuk, setBarangMasuk] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  const [masterBarang, setMasterBarang] = useState([]);
  const [masterGudang, setMasterGudang] = useState([]);
  const [masterRak, setMasterRak] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (!t) { router.push("/"); return; }
    setToken(t);
    return () => { isMounted.current = false; };
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchMainData(token);
      fetchMasterData(token);
    }
  }, [token]);

  const fetchMainData = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/barang-masuk`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.data.status === "00") {
        setBarangMasuk(res.data.data || []);
        setOriginalData(res.data.data || []);
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal memuat data transaksi");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const fetchMasterData = async (t) => {
    try {
      const [resBarang, resGudang, resRak] = await Promise.all([
        axios.get(`${API_URL}/master-barang`, { headers: { Authorization: `Bearer ${t}` } }),
        axios.get(`${API_URL}/master-gudang`, { headers: { Authorization: `Bearer ${t}` } }),
        axios.get(`${API_URL}/master-rak`, { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      setMasterBarang(resBarang.data.data || []);
      setMasterGudang(resGudang.data.data || []);
      setMasterRak(resRak.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSave = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/barang-masuk`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Berhasil dicatat");
        fetchMainData(token);
        setDialogVisible(false);
      }
    } catch (err) { toastRef.current?.showToast("01", "Gagal simpan"); }
  };

  const tableColumns = [
    { field: "NO_MASUK", header: "No. Transaksi", sortable: true },
    { field: "NAMA_BARANG", header: "Nama Barang", sortable: true },
    { field: "QTY", header: "QTY", body: (row) => <b className="text-blue-600">{row.QTY}</b> },
    // Menampilkan NAMA, jika null tampilkan KODE, jika null tampilkan -
    { field: "NAMA_GUDANG", header: "Gudang", body: (row) => row.NAMA_GUDANG || row.KODE_GUDANG || "-" },
    { field: "NAMA_RAK", header: "Rak", body: (row) => row.NAMA_RAK || row.KODE_RAK || "-" },
    { field: "BATCH_NO", header: "Batch" },
    { 
        field: "TGL_KADALUARSA", 
        header: "Exp. Date", 
        body: (row) => row.TGL_KADALUARSA ? new Date(row.TGL_KADALUARSA).toLocaleDateString("id-ID") : "-" 
    },
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />
      <h3 className="text-xl font-semibold mb-3">Transaksi Barang Masuk</h3>
      <HeaderBar onAddClick={() => setDialogVisible(true)} showAddButton={true} />
      <CustomDataTable data={barangMasuk} loading={isLoading} columns={tableColumns} />
      <FormBarangMasuk
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        onSave={handleSave}
        masterBarang={masterBarang}
        masterGudang={masterGudang}
        masterRak={masterRak}
        barangMasukList={originalData}
      />
    </div>
  );
}