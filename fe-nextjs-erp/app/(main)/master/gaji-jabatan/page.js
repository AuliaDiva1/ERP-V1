"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { Card } from "primereact/card";
import { ProgressBar } from "primereact/progressbar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import HeaderBar from "../../../components/headerbar";
import FormGajiJabatan from "./components/FormGajiJabatan";
import AdjustPrintGajiJabatan from "./print/AdjustPrintGajiJabatan";
import PDFViewer from "./print/PDFViewer";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DEPT_COLOR = {
  PRODUKSI:   "#3b82f6",
  GUDANG:     "#22c55e",
  KEUANGAN:   "#8b5cf6",
  HR:         "#f59e0b",
  SUPERADMIN: "#ef4444",
};

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

const fmtShort = (n) => {
  if (!n) return "Rp 0";
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000)     return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return fmt(n);
};

export default function MasterGajiJabatanPage() {
  const router   = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token,      setToken]      = useState("");
  const [dataList,   setDataList]   = useState([]);
  const [origData,   setOrigData]   = useState([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [editData,   setEditData]   = useState(null);

  const [modals, setModals] = useState({ form: false, print: false });

  const [pdfUrl,           setPdfUrl]           = useState(null);
  const [fileName,         setFileName]         = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // ── Auth ──────────────────────────────────────────────────────
  useEffect(() => {
    const t    = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("ROLE");
    if (!t) { router.push("/"); return; }
    if (!["SUPERADMIN", "HR"].includes(role)) { router.push("/dashboard"); return; }
    setToken(t);
    return () => { isMounted.current = false; };
  }, [router]);

  useEffect(() => { if (token) fetchData(); }, [token]);

  const auth = () => ({ Authorization: `Bearer ${token}` });

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-gaji-jabatan`, { headers: auth() });
      if (res.data.status === "00") {
        if (isMounted.current) {
          setDataList(res.data.data || []);
          setOrigData(res.data.data || []);
        }
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toastRef.current?.showToast("01", "Sesi habis, silakan login kembali");
        router.push("/");
      } else {
        toastRef.current?.showToast("01", "Gagal memuat data gaji jabatan");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // ── Search ────────────────────────────────────────────────────
  const handleSearch = (kw) => {
    if (!kw) { setDataList(origData); return; }
    const k = kw.toLowerCase();
    setDataList(
      origData.filter((d) =>
        d.JABATAN?.toLowerCase().includes(k) ||
        d.DEPARTEMEN?.toLowerCase().includes(k) ||
        d.STATUS?.toLowerCase().includes(k)
      )
    );
  };

  // ── CRUD ──────────────────────────────────────────────────────
  const openCreate = () => {
    setEditData(null);
    setModals((p) => ({ ...p, form: true }));
  };

  const openEdit = (row) => {
    setEditData(row);
    setModals((p) => ({ ...p, form: true }));
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editData) {
        await axios.put(`${API_URL}/master-gaji-jabatan/${editData.ID}`, formData, { headers: auth() });
        toastRef.current?.showToast("00", "Data berhasil diupdate");
      } else {
        await axios.post(`${API_URL}/master-gaji-jabatan`, formData, { headers: auth() });
        toastRef.current?.showToast("00", "Data berhasil disimpan");
      }
      setModals((p) => ({ ...p, form: false }));
      fetchData();
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (row) => {
    confirmDialog({
      message:         `Hapus jabatan "${row.JABATAN}"? Tindakan ini akan mempengaruhi template payroll.`,
      header:          "Konfirmasi Penghapusan",
      icon:            "pi pi-exclamation-triangle",
      acceptLabel:     "Ya, Hapus",
      rejectLabel:     "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-gaji-jabatan/${row.ID}`, { headers: auth() });
          toastRef.current?.showToast("00", "Data berhasil dihapus");
          fetchData();
        } catch (err) {
          toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menghapus");
        }
      },
    });
  };

  // ── Stats ─────────────────────────────────────────────────────
  const jabatanAktif = dataList.filter((d) => d.STATUS === "Aktif").length;
  const avgGaji      = dataList.length
    ? dataList.reduce((s, d) => s + parseFloat(d.GAJI_POKOK || 0), 0) / dataList.length
    : 0;
  const maxGaji = dataList.length
    ? Math.max(...dataList.map((d) => parseFloat(d.GAJI_POKOK || 0)))
    : 0;

  const deptGroups = dataList.reduce((acc, d) => {
    const k = d.DEPARTEMEN || "Lainnya";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  // ── Columns ───────────────────────────────────────────────────
  const columns = [
    {
      field: "JABATAN",
      header: "Jabatan",
      sortable: true,
      body: (r) => (
        <div>
          <div className="font-semibold text-900">{r.JABATAN}</div>
          {r.DEPARTEMEN && (
            <span
              className="text-xs px-2 py-1 border-round font-medium"
              style={{
                background: `${DEPT_COLOR[r.DEPARTEMEN] || "#94a3b8"}18`,
                color:       DEPT_COLOR[r.DEPARTEMEN] || "#64748b",
              }}
            >
              {r.DEPARTEMEN}
            </span>
          )}
        </div>
      ),
    },
    {
      field: "GAJI_POKOK",
      header: "Gaji Pokok",
      sortable: true,
      body: (r) => <span className="font-bold text-green-700">{fmt(r.GAJI_POKOK)}</span>,
    },
    {
      header: "Total Tunjangan",
      body: (r) => {
        const t = [r.TUNJANGAN_TRANSPORT, r.TUNJANGAN_MAKAN, r.TUNJANGAN_JABATAN, r.TUNJANGAN_LAINNYA]
          .reduce((s, v) => s + parseFloat(v || 0), 0);
        return <span className="font-semibold text-blue-600">{fmt(t)}</span>;
      },
    },
    {
      header: "Potongan",
      body: (r) => (
        <div className="text-xs">
          <div className="text-orange-600">Trlbt: <b>{fmtShort(r.POTONGAN_TERLAMBAT_PER_MENIT)}/mnt</b></div>
          <div className="text-red-500 mt-1">Alpa: <b>{fmtShort(r.POTONGAN_ALPA_PER_HARI)}/hr</b></div>
        </div>
      ),
    },
    {
      header: "BPJS",
      body: (r) => (
        <div className="text-xs">
          <div>Kes: <b>{r.BPJS_KESEHATAN_PERSEN}%</b></div>
          <div>TK: <b>{r.BPJS_TK_PERSEN}%</b></div>
        </div>
      ),
    },
    {
      header: "Bonus Kinerja",
      body: (r) => (
        <div className="flex flex-column gap-1">
          <span className="text-xs text-green-600  font-bold">≥90: {r.BONUS_SCORE_90}%</span>
          <span className="text-xs text-blue-600   font-bold">≥75: {r.BONUS_SCORE_75}%</span>
          <span className="text-xs text-yellow-600 font-bold">≥60: {r.BONUS_SCORE_60}%</span>
        </div>
      ),
    },
    {
      header: "PPh21",
      body: (r) =>
        r.IS_KENA_PPH21
          ? <Tag value="Kena"  severity="warning" rounded />
          : <Tag value="Bebas" severity="success" rounded />,
    },
    {
      field: "STATUS",
      header: "Status",
      sortable: true,
      body: (r) => (
        <Tag value={r.STATUS} severity={r.STATUS === "Aktif" ? "success" : "danger"} rounded />
      ),
    },
    {
      header: "Aksi",
      style: { width: "100px" },
      body: (r) => (
        <div className="flex gap-1">
          <Button
            icon="pi pi-pencil" size="small" severity="warning"
            tooltip="Edit" tooltipOptions={{ position: "top" }}
            onClick={() => openEdit(r)}
          />
          <Button
            icon="pi pi-trash" size="small" severity="danger"
            tooltip="Hapus" tooltipOptions={{ position: "top" }}
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
              <i className="pi pi-briefcase text-primary text-2xl" />
              <h2 className="m-0 text-2xl font-bold text-900">Master Gaji Jabatan</h2>
            </div>
            <p className="m-0 text-500 text-sm mt-1">
              Setup template komponen gaji default per jabatan — dasar kalkulasi payroll bulanan.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              icon="pi pi-print" label="Cetak Laporan" severity="secondary" outlined
              onClick={() => setModals((p) => ({ ...p, print: true }))}
            />
            <Button icon="pi pi-plus" label="Tambah Jabatan" onClick={openCreate} />
          </div>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-12 md:col-3">
                <Skeleton height="90px" className="border-round-xl" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid mb-4">
              {[
                { icon: "pi pi-briefcase",     color: "#6366f1", label: "Total Jabatan",        value: dataList.length,     sub: "Semua jabatan"    },
                { icon: "pi pi-check-circle",   color: "#22c55e", label: "Jabatan Aktif",        value: jabatanAktif,         sub: "Status aktif"     },
                { icon: "pi pi-money-bill",     color: "#f59e0b", label: "Rata-rata Gaji Pokok", value: fmtShort(avgGaji),    sub: "Avg semua jabatan"},
                { icon: "pi pi-arrow-up-right", color: "#8b5cf6", label: "Gaji Tertinggi",       value: fmtShort(maxGaji),    sub: "Maks gaji pokok"  },
              ].map((kpi) => (
                <div key={kpi.label} className="col-12 md:col-3">
                  <div className="surface-card border-round-xl shadow-2 p-4" style={{ borderLeft: `4px solid ${kpi.color}` }}>
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

            {/* ── Charts Row ── */}
            {Object.keys(deptGroups).length > 0 && (
              <div className="grid mb-4">

                {/* Distribusi Departemen */}
                <div className="col-12 md:col-4">
                  <Card title="Distribusi per Departemen" className="shadow-2 h-full">
                    <div className="flex flex-column gap-3">
                      {Object.entries(deptGroups).map(([dept, count]) => (
                        <div key={dept}>
                          <div className="flex justify-content-between align-items-center mb-1">
                            <span className="text-600 text-sm font-medium">{dept}</span>
                            <span className="font-bold" style={{ color: DEPT_COLOR[dept] || "#64748b" }}>
                              {count} jabatan
                            </span>
                          </div>
                          <ProgressBar
                            value={dataList.length ? Math.round((count / dataList.length) * 100) : 0}
                            showValue={false}
                            style={{ height: 8, borderRadius: 4 }}
                            pt={{ value: { style: { background: DEPT_COLOR[dept] || "#94a3b8", borderRadius: 4 } } }}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Estimasi THP Maks */}
                <div className="col-12 md:col-8">
                  <Card title="Estimasi THP Maksimum per Jabatan (Score ≥90, tanpa potongan)" className="shadow-2 h-full">
                    <div className="flex flex-column gap-2">
                      {dataList
                        .filter((d) => d.STATUS === "Aktif")
                        .sort((a, b) => parseFloat(b.GAJI_POKOK || 0) - parseFloat(a.GAJI_POKOK || 0))
                        .slice(0, 6)
                        .map((row) => {
                          const gp  = parseFloat(row.GAJI_POKOK || 0);
                          const tj  = [row.TUNJANGAN_TRANSPORT, row.TUNJANGAN_MAKAN, row.TUNJANGAN_JABATAN, row.TUNJANGAN_LAINNYA]
                            .reduce((s, v) => s + parseFloat(v || 0), 0);
                          const bon  = (parseFloat(row.BONUS_SCORE_90 || 0) / 100) * gp;
                          const bpjs = ((parseFloat(row.BPJS_KESEHATAN_PERSEN || 0) + parseFloat(row.BPJS_TK_PERSEN || 0)) / 100) * gp;
                          const thp  = gp + tj + bon - bpjs;
                          return (
                            <div key={row.ID} className="flex align-items-center justify-content-between p-2 surface-50 border-round border-1 border-200">
                              <div className="flex align-items-center gap-2">
                                <div className="border-round-full flex-shrink-0"
                                  style={{ width: 8, height: 8, background: DEPT_COLOR[row.DEPARTEMEN] || "#94a3b8" }} />
                                <div>
                                  <div className="font-semibold text-sm text-900">{row.JABATAN}</div>
                                  <div className="text-xs text-500">{row.DEPARTEMEN || "—"}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-900">{fmt(thp)}</div>
                                <div className="text-xs text-green-600">Bonus {row.BONUS_SCORE_90}%</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ── Tabel ── */}
            <Card className="shadow-2">
              <div className="flex align-items-center justify-content-between mb-3">
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-table text-primary" />
                  <span className="font-semibold text-700">Daftar Gaji Jabatan</span>
                  <Tag value={`${dataList.length} data`} severity="info" rounded />
                </div>
              </div>
              <HeaderBar
                onSearch={handleSearch}
                showAddButton={false}
                placeholder="Cari jabatan, departemen, atau status..."
              />
              <CustomDataTable
                data={dataList}
                loading={isLoading}
                columns={columns}
                emptyMessage="Belum ada data jabatan. Klik 'Tambah Jabatan' untuk mulai."
              />
            </Card>
          </>
        )}
      </div>

      {/* ── Dialogs ── */}
      <FormGajiJabatan
        visible={modals.form}
        onHide={() => setModals((p) => ({ ...p, form: false }))}
        onSave={handleSave}
        editData={editData}
        isLoading={saving}
      />

      <AdjustPrintGajiJabatan
        visible={modals.print}
        onHide={() => setModals((p) => ({ ...p, print: false }))}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        token={token}
      />

      {/* ── PDF Preview Overlay ── */}
      {jsPdfPreviewOpen && (
        <PDFViewer
          pdfUrl={pdfUrl}
          fileName={fileName}
          onClose={() => setJsPdfPreviewOpen(false)}
        />
      )}
    </div>
  );
}
