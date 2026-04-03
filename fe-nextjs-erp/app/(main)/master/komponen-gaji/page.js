"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Dropdown } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Message } from "primereact/message";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import HeaderBar from "../../../components/headerbar";
import FormOverrideGaji from "./components/FormOverrideGaji";
import DetailKomponenGaji from "./components/DetailKomponenGaji";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DEPT_COLOR = {
  PRODUKSI:   "#3b82f6",
  GUDANG:     "#22c55e",
  KEUANGAN:   "#8b5cf6",
  HR:         "#f59e0b",
  SUPERADMIN: "#ef4444",
};

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(n || 0);

export default function MasterKomponenGajiPage() {
  const router    = useRouter();
  const toastRef  = useRef(null);
  const isMounted = useRef(true);

  const [token,            setToken]            = useState("");
  const [dataList,         setDataList]         = useState([]);
  const [origData,         setOrigData]         = useState([]);
  const [karyawanList,     setKaryawanList]     = useState([]);
  const [isLoading,        setIsLoading]        = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [loadingResolve,   setLoadingResolve]   = useState(false);
  const [resolvedData,     setResolvedData]     = useState(null);
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);

  const [modals, setModals] = useState({ form: false, detail: false });

  // ── Auth ──────────────────────────────────────────────────────
  useEffect(() => {
    const t    = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("ROLE");
    if (!t) { router.push("/"); return; }
    if (!["SUPERADMIN", "HR"].includes(role)) { router.push("/dashboard"); return; }
    setToken(t);
    return () => { isMounted.current = false; };
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchData();
      fetchKaryawan();
    }
  }, [token]);

  const auth = () => ({ Authorization: `Bearer ${token}` });

  // ── Fetch list override ───────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-komponen-gaji`, { headers: auth() });
      if (res.data.status === "00") {
        if (isMounted.current) {
          setDataList(res.data.data || []);
          setOrigData(res.data.data  || []);
        }
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/");
      } else {
        toastRef.current?.showToast("01", "Gagal memuat data komponen gaji");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // ── Fetch dropdown karyawan ───────────────────────────────────
  const fetchKaryawan = async () => {
    try {
      const res = await axios.get(`${API_URL}/master-karyawan`, { headers: auth() });
      if (res.data.status === "00") {
        setKaryawanList(
          (res.data.data || [])
            .filter((k) => k.STATUS_AKTIF === "Aktif")
            .map((k) => ({
              label: `${k.NAMA} — ${k.JABATAN}`,
              value: k.KARYAWAN_ID,
            }))
        );
      }
    } catch { /* silent */ }
  };

  // ── Search ────────────────────────────────────────────────────
  const handleSearch = (kw) => {
    if (!kw) { setDataList(origData); return; }
    const k = kw.toLowerCase();
    setDataList(
      origData.filter((d) =>
        d.NAMA?.toLowerCase().includes(k) ||
        d.KARYAWAN_ID?.toLowerCase().includes(k) ||
        d.JABATAN?.toLowerCase().includes(k) ||
        d.DEPARTEMEN?.toLowerCase().includes(k)
      )
    );
  };

  // ── Resolve komponen karyawan ─────────────────────────────────
  const resolveKaryawan = async (karyawanId) => {
    setLoadingResolve(true);
    setResolvedData(null);
    try {
      const res = await axios.get(`${API_URL}/master-komponen-gaji/${karyawanId}`, { headers: auth() });
      if (res.data.status === "00") {
        setResolvedData(res.data.data);
        setSelectedKaryawan(karyawanId);
      }
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal memuat data karyawan");
      return false;
    } finally {
      setLoadingResolve(false);
    }
    return true;
  };

  const openDetail = async (karyawanId) => {
    const ok = await resolveKaryawan(karyawanId);
    if (ok) setModals((p) => ({ ...p, detail: true }));
  };

  const openForm = async (karyawanId) => {
    const ok = await resolveKaryawan(karyawanId);
    if (ok) setModals((p) => ({ ...p, form: true }));
  };

  const handleSetOverride = async () => {
    if (!selectedKaryawan) {
      toastRef.current?.showToast("01", "Pilih karyawan terlebih dahulu");
      return;
    }
    await openForm(selectedKaryawan);
  };

  // ── Save ──────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    if (!selectedKaryawan) return;
    setSaving(true);
    try {
      await axios.post(
        `${API_URL}/master-komponen-gaji/${selectedKaryawan}`,
        formData,
        { headers: auth() }
      );
      toastRef.current?.showToast("00", "Override gaji berhasil disimpan");
      setModals({ form: false, detail: false });
      fetchData();
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan override");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete override ───────────────────────────────────────────
  const handleDelete = (row) => {
    confirmDialog({
      message:         `Hapus override gaji "${row.NAMA}"? Karyawan akan kembali ke default jabatannya.`,
      header:          "Konfirmasi Hapus Override",
      icon:            "pi pi-exclamation-triangle",
      acceptLabel:     "Ya, Hapus",
      rejectLabel:     "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(
            `${API_URL}/master-komponen-gaji/${row.KARYAWAN_ID}`,
            { headers: auth() }
          );
          toastRef.current?.showToast("00", "Override dihapus — kembali ke default jabatan");
          fetchData();
        } catch (err) {
          toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menghapus override");
        }
      },
    });
  };

  // ── Stats ─────────────────────────────────────────────────────
  const deptCounts = dataList.reduce((acc, d) => {
    const k = d.DEPARTEMEN || "Lainnya";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  // ── Columns ───────────────────────────────────────────────────
  const columns = [
    {
      header: "Karyawan",
      style: { minWidth: "200px" },
      body: (r) => (
        <div className="flex align-items-center gap-2">
          <Avatar
            label={r.NAMA?.charAt(0)}
            shape="circle"
            style={{
              background: `${DEPT_COLOR[r.DEPARTEMEN] || "#94a3b8"}22`,
              color:       DEPT_COLOR[r.DEPARTEMEN] || "#64748b",
              fontWeight:  "bold",
            }}
          />
          <div>
            <div className="font-semibold text-900">{r.NAMA}</div>
            <div className="text-500 text-xs">{r.KARYAWAN_ID} · {r.JABATAN}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Departemen",
      body: (r) => (
        <span
          className="text-xs px-2 py-1 border-round font-medium"
          style={{
            background: `${DEPT_COLOR[r.DEPARTEMEN] || "#94a3b8"}18`,
            color:       DEPT_COLOR[r.DEPARTEMEN] || "#64748b",
          }}
        >
          {r.DEPARTEMEN || "—"}
        </span>
      ),
    },
    {
      header: "Override Gaji Pokok",
      style: { minWidth: "190px" },
      body: (r) =>
        r.GAJI_POKOK != null ? (
          <div className="flex align-items-center gap-1">
            <span className="font-bold text-yellow-700">{fmt(r.GAJI_POKOK)}</span>
            <Tag value="Override" severity="warning" className="text-xs" />
          </div>
        ) : (
          <span className="text-500 text-sm italic">— (default jabatan)</span>
        ),
    },
    {
      header: "Override Tunjangan",
      body: (r) => {
        const fields = [r.TUNJANGAN_TRANSPORT, r.TUNJANGAN_MAKAN, r.TUNJANGAN_JABATAN, r.TUNJANGAN_LAINNYA];
        const hasAny = fields.some((v) => v != null);
        if (!hasAny) return <span className="text-500 text-sm italic">—</span>;
        const total = fields.reduce((s, v) => s + (v != null ? parseFloat(v) : 0), 0);
        return <span className="font-semibold text-blue-600">{fmt(total)}</span>;
      },
    },
    {
      header: "Catatan",
      style: { minWidth: "140px" },
      body: (r) => (
        <span className="text-500 text-xs">{r.CATATAN || "—"}</span>
      ),
    },
    {
      header: "Aksi",
      style: { width: "120px" },
      body: (r) => (
        <div className="flex gap-1">
          <Button
            icon="pi pi-eye"
            size="small"
            severity="info"
            tooltip="Detail Komponen"
            tooltipOptions={{ position: "top" }}
            onClick={() => openDetail(r.KARYAWAN_ID)}
          />
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            tooltip="Edit Override"
            tooltipOptions={{ position: "top" }}
            onClick={() => openForm(r.KARYAWAN_ID)}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            tooltip="Hapus Override"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleDelete(r)}
          />
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="card p-0">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-bottom-1 surface-border">
        <div className="flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div className="flex align-items-center gap-2 mb-1">
              <i className="pi pi-user-edit text-primary text-2xl" />
              <h2 className="m-0 text-2xl font-bold text-900">Komponen Gaji Karyawan</h2>
            </div>
            <p className="m-0 text-500 text-sm mt-1">
              Override komponen gaji per individu. Karyawan tanpa override otomatis menggunakan default jabatannya.
            </p>
          </div>
          <div className="flex gap-2 align-items-center flex-wrap">
            <Dropdown
              value={selectedKaryawan}
              options={karyawanList}
              onChange={(e) => setSelectedKaryawan(e.value)}
              placeholder="Pilih karyawan..."
              className="w-18rem"
              filter
              showClear
            />
            <Button
              icon="pi pi-pencil"
              label="Set Override"
              severity="warning"
              onClick={handleSetOverride}
              disabled={!selectedKaryawan}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="col-12 md:col-4">
                <Skeleton height="90px" className="border-round-xl" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid mb-4">
              {[
                {
                  icon:  "pi pi-users",
                  color: "#f59e0b",
                  label: "Karyawan dengan Override",
                  value: dataList.length,
                  sub:   "Komponen gaji custom",
                },
                {
                  icon:  "pi pi-building",
                  color: "#3b82f6",
                  label: "Departemen Terdampak",
                  value: Object.keys(deptCounts).length,
                  sub:   "Dept dengan override",
                },
                {
                  icon:  "pi pi-check-circle",
                  color: "#22c55e",
                  label: "Menggunakan Default",
                  value: Math.max(0, karyawanList.length - dataList.length),
                  sub:   "Default dari jabatan",
                },
              ].map((kpi) => (
                <div key={kpi.label} className="col-12 md:col-4">
                  <div
                    className="surface-card border-round-xl shadow-2 p-4"
                    style={{ borderLeft: `4px solid ${kpi.color}` }}
                  >
                    <div className="flex align-items-center gap-2 mb-2">
                      <i className={`${kpi.icon} text-lg`} style={{ color: kpi.color }} />
                      <span className="text-500 text-xs font-medium uppercase">{kpi.label}</span>
                    </div>
                    <div className="font-bold text-2xl text-900">{kpi.value}</div>
                    <div className="text-500 text-xs mt-1">{kpi.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Info ── */}
            <Message
              severity="info"
              className="w-full mb-4"
              text="Karyawan yang tidak ada di daftar berikut akan otomatis menggunakan gaji default dari jabatannya."
            />

            {/* ── Tabel ── */}
            <Card className="shadow-2">
              <div className="flex align-items-center justify-content-between mb-3">
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-table text-primary" />
                  <span className="font-semibold text-700">Daftar Override Aktif</span>
                  <Tag value={`${dataList.length} karyawan`} severity="warning" rounded />
                </div>
              </div>
              <HeaderBar
                onSearch={handleSearch}
                showAddButton={false}
                placeholder="Cari nama, ID, jabatan, atau departemen..."
              />
              <CustomDataTable
                data={dataList}
                loading={isLoading}
                columns={columns}
                emptyMessage="Belum ada override. Semua karyawan menggunakan gaji default jabatan."
              />
            </Card>
          </>
        )}
      </div>

      {/* ── Dialog Form Override ── */}
      <FormOverrideGaji
        visible={modals.form}
        onHide={() => setModals((p) => ({ ...p, form: false }))}
        onSave={handleSave}
        isLoading={saving}
        resolvedData={resolvedData}
        loadingResolve={loadingResolve}
      />

      {/* ── Dialog Detail ── */}
      <DetailKomponenGaji
        visible={modals.detail}
        onHide={() => setModals((p) => ({ ...p, detail: false }))}
        resolvedData={resolvedData}
        loading={loadingResolve}
        onEdit={() => {
          setModals({ detail: false, form: true });
        }}
      />
    </div>
  );
}
