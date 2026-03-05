"use client";

import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { ProgressBar } from "primereact/progressbar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Divider } from "primereact/divider";
import { Badge } from "primereact/badge";
import { Tooltip } from "primereact/tooltip";
import { Chart } from "primereact/chart";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import HeaderBar from "../../../components/headerbar";
import DetailPayroll from "./components/DetailPayroll";
import GeneratePayrollDialog from "./components/GeneratePayrollDialog";
import AdjustPrintSlipGaji from "./print/AdjustPrintSlipGaji";
import PDFViewer from "./print/PDFViewer";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api").replace(/\/+$/g, "");

const DEPT_COLOR = {
  PRODUKSI: "#3b82f6", GUDANG: "#22c55e",
  KEUANGAN: "#8b5cf6", HR: "#f59e0b", SUPERADMIN: "#ef4444",
};

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

const fmtShort = (n) => {
  if (!n) return "Rp 0";
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000)         return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return fmt(n);
};

const getScoreColor = (s) => {
  if (s >= 90) return { text: "text-green-600",  bg: "#dcfce7", hex: "#16a34a", label: "Excellent" };
  if (s >= 75) return { text: "text-blue-600",   bg: "#dbeafe", hex: "#1d4ed8", label: "Good"      };
  if (s >= 60) return { text: "text-yellow-600", bg: "#fef9c3", hex: "#a16207", label: "Average"   };
  return             { text: "text-red-600",     bg: "#fee2e2", hex: "#b91c1c", label: "Below Avg" };
};

const getStatusSeverity = (s) =>
  s === "Paid" ? "success" : s === "Approved" ? "warning" : "secondary";

const STATUS_OPTS = [
  { label: "Semua Status", value: "" },
  { label: "Draft",        value: "Draft"    },
  { label: "Approved",     value: "Approved" },
  { label: "Paid",         value: "Paid"     },
];

const DEPT_OPTS = [
  { label: "Semua Dept",   value: "" },
  { label: "PRODUKSI",     value: "PRODUKSI"   },
  { label: "GUDANG",       value: "GUDANG"     },
  { label: "KEUANGAN",     value: "KEUANGAN"   },
  { label: "HR",           value: "HR"         },
  { label: "SUPERADMIN",   value: "SUPERADMIN" },
];

export default function MasterPayrollPage() {
  const router    = useRouter();
  const toastRef  = useRef(null);
  const isMounted = useRef(true);

  const [token,      setToken]      = useState("");
  const [userRole,   setUserRole]   = useState("");
  const [dataList,   setDataList]   = useState([]);
  const [origData,   setOrigData]   = useState([]);
  const [summary,    setSummary]    = useState(null);
  const [karyawanList, setKaryawanList] = useState([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genResult,  setGenResult]  = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [printData,  setPrintData]  = useState(null);

  // Filter state
  const now = new Date();
  const [filterPeriode,  setFilterPeriode]  = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterDept,     setFilterDept]     = useState("");

  // Modal state
  const [modals, setModals] = useState({
    detail: false, generate: false, print: false,
  });

  // PDF state
  const [pdfUrl,      setPdfUrl]      = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfOpen,     setPdfOpen]     = useState(false);

  // Aktif tab
  const [activeTab, setActiveTab] = useState("list");

  // ── Auth ──────────────────────────────────────────────────────
  useEffect(() => {
    const t    = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("ROLE");
    if (!t) { router.push("/"); return; }
    if (!["SUPERADMIN", "HR"].includes(role)) { router.push("/dashboard"); return; }
    setToken(t);
    setUserRole(role);
    return () => { isMounted.current = false; };
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchData();
      fetchSummary();
      fetchKaryawan();
    }
  }, [token, filterPeriode, filterStatus, filterDept]);

  const auth = () => ({ Authorization: `Bearer ${token}` });

  // ── Helpers periode ───────────────────────────────────────────
  const periodeStr = () => {
    if (!filterPeriode) return "";
    const d = new Date(filterPeriode);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  };

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (periodeStr())    params.periode    = periodeStr();
      if (filterStatus)    params.status     = filterStatus;
      if (filterDept)      params.departemen = filterDept;

      const res = await axios.get(`${API_URL}/master-payroll`, { headers: auth(), params });
      if (res.data.status === "00" && isMounted.current) {
        setDataList(res.data.data || []);
        setOrigData(res.data.data || []);
      }
    } catch (err) {
      if (err.response?.status === 401) router.push("/");
      else toastRef.current?.showToast("01", "Gagal memuat data payroll");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    const p = periodeStr();
    if (!p) return;
    try {
      const res = await axios.get(`${API_URL}/master-payroll/summary`, { headers: auth(), params: { periode: p } });
      if (res.data.status === "00" && isMounted.current) setSummary(res.data.data);
    } catch { /* silent */ }
  };

  const fetchKaryawan = async () => {
    try {
      const res = await axios.get(`${API_URL}/master-karyawan`, { headers: auth() });
      if (res.data.status === "00") {
        setKaryawanList(
          (res.data.data || [])
            .filter((k) => k.STATUS_AKTIF === "Aktif")
            .map((k) => ({ label: `${k.NAMA} — ${k.JABATAN}`, value: k.KARYAWAN_ID }))
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
        d.KODE_PAYROLL?.toLowerCase().includes(k) ||
        d.JABATAN?.toLowerCase().includes(k) ||
        d.STATUS?.toLowerCase().includes(k)
      )
    );
  };

  // ── Generate ──────────────────────────────────────────────────
  const handleGenerate = async ({ mode, karyawanId, startDate, endDate }) => {
    setGenerating(true);
    setGenResult(null);
    try {
      if (mode === "bulk") {
        const res = await axios.post(`${API_URL}/master-payroll/generate-bulk`,
          { start_date: startDate, end_date: endDate }, { headers: auth() });
        if (res.data.status === "00") {
          setGenResult(res.data.data || []);
          fetchData(); fetchSummary();
          toastRef.current?.showToast("00", res.data.message);
        }
      } else {
        const res = await axios.post(`${API_URL}/master-payroll/generate`,
          { karyawan_id: karyawanId, start_date: startDate, end_date: endDate }, { headers: auth() });
        if (res.data.status === "00") {
          setGenResult([{ status: "success", nama: res.data.data?.NAMA, karyawan_id: karyawanId }]);
          fetchData(); fetchSummary();
          toastRef.current?.showToast("00", "Payroll berhasil digenerate");
        }
      }
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal generate payroll");
    } finally {
      setGenerating(false);
    }
  };

  // ── Detail ────────────────────────────────────────────────────
  const openDetail = async (row) => {
    try {
      const res = await axios.get(`${API_URL}/master-payroll/${row.ID}`, { headers: auth() });
      if (res.data.status === "00") {
        setDetailData(res.data.data);
        setModals((p) => ({ ...p, detail: true }));
      }
    } catch { toastRef.current?.showToast("01", "Gagal memuat detail"); }
  };

  // ── Approve ───────────────────────────────────────────────────
  const handleApprove = (row) => {
    confirmDialog({
      message:         `Approve payroll "${row.NAMA}" periode ${row.PERIODE ? new Date(row.PERIODE).toLocaleDateString("id-ID",{month:"long",year:"numeric"}) : "—"}?`,
      header:          "Konfirmasi Approve",
      icon:            "pi pi-check-circle",
      acceptLabel:     "Ya, Approve",
      rejectLabel:     "Batal",
      acceptClassName: "p-button-success",
      accept: async () => {
        setLoadingAction(true);
        try {
          await axios.patch(`${API_URL}/master-payroll/${row.ID}/approve`, {}, { headers: auth() });
          toastRef.current?.showToast("00", "Payroll berhasil diapprove");
          fetchData(); fetchSummary();
          if (modals.detail) {
            const res = await axios.get(`${API_URL}/master-payroll/${row.ID}`, { headers: auth() });
            if (res.data.status === "00") setDetailData(res.data.data);
          }
        } catch (err) {
          toastRef.current?.showToast("01", err.response?.data?.message || "Gagal approve");
        } finally { setLoadingAction(false); }
      },
    });
  };

  // ── Paid ──────────────────────────────────────────────────────
  const handlePaid = (row) => {
    confirmDialog({
      message:         `Tandai payroll "${row.NAMA}" sudah dibayar?`,
      header:          "Konfirmasi Pembayaran",
      icon:            "pi pi-wallet",
      acceptLabel:     "Ya, Sudah Dibayar",
      rejectLabel:     "Batal",
      acceptClassName: "p-button-info",
      accept: async () => {
        setLoadingAction(true);
        try {
          await axios.patch(`${API_URL}/master-payroll/${row.ID}/paid`, {}, { headers: auth() });
          toastRef.current?.showToast("00", "Payroll ditandai Paid");
          fetchData(); fetchSummary();
          if (modals.detail) {
            const res = await axios.get(`${API_URL}/master-payroll/${row.ID}`, { headers: auth() });
            if (res.data.status === "00") setDetailData(res.data.data);
          }
        } catch (err) {
          toastRef.current?.showToast("01", err.response?.data?.message || "Gagal tandai paid");
        } finally { setLoadingAction(false); }
      },
    });
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = (row) => {
    confirmDialog({
      message:         `Hapus payroll Draft "${row.NAMA}"? Data tidak bisa dikembalikan.`,
      header:          "Konfirmasi Hapus",
      icon:            "pi pi-exclamation-triangle",
      acceptLabel:     "Ya, Hapus",
      rejectLabel:     "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-payroll/${row.ID}`, { headers: auth() });
          toastRef.current?.showToast("00", "Payroll berhasil dihapus");
          fetchData(); fetchSummary();
        } catch (err) {
          toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menghapus");
        }
      },
    });
  };

  // ── Print ─────────────────────────────────────────────────────
  const openPrint = (row) => {
    setPrintData(row);
    setModals((p) => ({ ...p, print: true }));
  };

  // ── Chart data ────────────────────────────────────────────────
  const deptStats = dataList.reduce((acc, d) => {
    const k = d.DEPARTEMEN_SNAPSHOT || d.DEPARTEMEN || "Lainnya";
    if (!acc[k]) acc[k] = { count: 0, totalThp: 0, totalScore: 0 };
    acc[k].count++;
    acc[k].totalThp   += parseFloat(d.TAKE_HOME_PAY || 0);
    acc[k].totalScore += parseFloat(d.PERFORMANCE_SCORE || 0);
    return acc;
  }, {});

  const scoreDistrib = {
    excellent: dataList.filter(d => parseFloat(d.PERFORMANCE_SCORE||0) >= 90).length,
    good:      dataList.filter(d => { const s=parseFloat(d.PERFORMANCE_SCORE||0); return s>=75&&s<90; }).length,
    average:   dataList.filter(d => { const s=parseFloat(d.PERFORMANCE_SCORE||0); return s>=60&&s<75; }).length,
    below:     dataList.filter(d => parseFloat(d.PERFORMANCE_SCORE||0) < 60).length,
  };

  const thpChartData = {
    labels: Object.keys(deptStats),
    datasets: [{
      label: "Total THP",
      data: Object.values(deptStats).map(d => d.totalThp),
      backgroundColor: Object.keys(deptStats).map(k => `${DEPT_COLOR[k] || "#94a3b8"}bb`),
      borderColor:     Object.keys(deptStats).map(k => DEPT_COLOR[k] || "#94a3b8"),
      borderWidth: 2, borderRadius: 6,
    }],
  };

  const scoreChartData = {
    labels: ["Excellent (≥90)", "Good (≥75)", "Average (≥60)", "Below Avg (<60)"],
    datasets: [{
      data: [scoreDistrib.excellent, scoreDistrib.good, scoreDistrib.average, scoreDistrib.below],
      backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"],
      borderWidth: 2, borderColor: "#fff",
    }],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { callback: (v) => fmtShort(v), font: { size: 10 } } },
      x: { ticks: { font: { size: 10 } } },
    },
  };

  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { font: { size: 11 }, padding: 16 } },
    },
  };

  // ── Top 5 ─────────────────────────────────────────────────────
  const top5THP   = [...dataList].sort((a,b) => parseFloat(b.TAKE_HOME_PAY||0)    - parseFloat(a.TAKE_HOME_PAY||0)   ).slice(0, 5);
  const top5Score = [...dataList].sort((a,b) => parseFloat(b.PERFORMANCE_SCORE||0) - parseFloat(a.PERFORMANCE_SCORE||0)).slice(0, 5);

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
              color: DEPT_COLOR[r.DEPARTEMEN] || "#64748b",
              fontWeight: "bold",
            }}
          />
          <div>
            <div className="font-semibold text-900">{r.NAMA}</div>
            <div className="text-500 text-xs">{r.KODE_PAYROLL}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Dept",
      body: (r) => (
        <span className="text-xs px-2 py-1 border-round font-medium"
          style={{ background: `${DEPT_COLOR[r.DEPARTEMEN]||"#94a3b8"}18`, color: DEPT_COLOR[r.DEPARTEMEN]||"#64748b" }}>
          {r.DEPARTEMEN_SNAPSHOT || r.DEPARTEMEN || "—"}
        </span>
      ),
    },
    {
      header: "Score",
      sortable: true,
      field: "PERFORMANCE_SCORE",
      body: (r) => {
        const sc = parseFloat(r.PERFORMANCE_SCORE || 0);
        const si = getScoreColor(sc);
        return (
          <div className="flex align-items-center gap-2">
            <span className="font-bold text-2xl" style={{ color: si.hex }}>{sc.toFixed(0)}</span>
            <span className="text-xs" style={{ color: si.hex }}>{si.label}</span>
          </div>
        );
      },
    },
    {
      field: "GAJI_POKOK",
      header: "Gaji Pokok",
      sortable: true,
      body: (r) => <span className="font-semibold text-700">{fmt(r.GAJI_POKOK)}</span>,
    },
    {
      field: "BONUS_KINERJA",
      header: "Bonus",
      sortable: true,
      body: (r) => (
        <div>
          <span className="font-semibold text-green-600">{fmt(r.BONUS_KINERJA)}</span>
          {r.BONUS_PERSEN_DIPAKAI > 0 && (
            <div className="text-xs text-500">{r.BONUS_PERSEN_DIPAKAI}%</div>
          )}
        </div>
      ),
    },
    {
      field: "TOTAL_POTONGAN",
      header: "Potongan",
      sortable: true,
      body: (r) => <span className="font-semibold text-red-500">{fmt(r.TOTAL_POTONGAN)}</span>,
    },
    {
      field: "TAKE_HOME_PAY",
      header: "Take Home Pay",
      sortable: true,
      body: (r) => <span className="font-bold text-primary text-lg">{fmt(r.TAKE_HOME_PAY)}</span>,
    },
    {
      header: "Sumber",
      body: (r) => (
        <Tag
          value={r.SUMBER_GAJI}
          severity={r.SUMBER_GAJI === "Override" ? "warning" : "info"}
          className="text-xs"
        />
      ),
    },
    {
      field: "STATUS",
      header: "Status",
      sortable: true,
      body: (r) => <Tag value={r.STATUS} severity={getStatusSeverity(r.STATUS)} rounded />,
    },
    {
      header: "Aksi",
      style: { width: "140px" },
      body: (r) => (
        <div className="flex gap-1">
          <Button icon="pi pi-eye" size="small" severity="info"
            tooltip="Detail" tooltipOptions={{ position: "top" }}
            onClick={() => openDetail(r)} />
          <Button icon="pi pi-print" size="small" severity="secondary"
            tooltip="Slip Gaji" tooltipOptions={{ position: "top" }}
            disabled={r.STATUS === "Draft"}
            onClick={() => openPrint(r)} />
          {r.STATUS === "Draft" && (
            <Button icon="pi pi-check" size="small" severity="success"
              tooltip="Approve" tooltipOptions={{ position: "top" }}
              onClick={() => handleApprove(r)} />
          )}
          {r.STATUS === "Approved" && (
            <Button icon="pi pi-wallet" size="small" severity="help"
              tooltip="Tandai Paid" tooltipOptions={{ position: "top" }}
              onClick={() => handlePaid(r)} />
          )}
          {r.STATUS === "Draft" && (
            <Button icon="pi pi-trash" size="small" severity="danger"
              tooltip="Hapus" tooltipOptions={{ position: "top" }}
              onClick={() => handleDelete(r)} />
          )}
        </div>
      ),
    },
  ];

  // ── Tab navigation ────────────────────────────────────────────
  const tabs = [
    { key: "overview", label: "Overview",      icon: "pi pi-chart-bar" },
    { key: "list",     label: "Daftar Payroll", icon: "pi pi-list"     },
    { key: "analytics",label: "Analytics",     icon: "pi pi-chart-pie" },
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
              <i className="pi pi-wallet text-primary text-2xl" />
              <h2 className="m-0 text-2xl font-bold text-900">Master Payroll</h2>
            </div>
            <p className="m-0 text-500 text-sm mt-1">
              Kelola penggajian karyawan — generate, review, approve, dan cetak slip gaji.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap align-items-center">
            {/* Filter Periode */}
            <Calendar
              value={filterPeriode}
              onChange={(e) => setFilterPeriode(e.value)}
              view="month"
              dateFormat="MM yy"
              showIcon
              placeholder="Pilih periode..."
              style={{ width: "160px" }}
            />
            <Dropdown
              value={filterStatus}
              options={STATUS_OPTS}
              onChange={(e) => setFilterStatus(e.value)}
              className="w-9rem"
            />
            <Dropdown
              value={filterDept}
              options={DEPT_OPTS}
              onChange={(e) => setFilterDept(e.value)}
              className="w-9rem"
            />
            <Button
              icon="pi pi-refresh"
              severity="secondary"
              outlined
              tooltip="Refresh"
              onClick={() => { fetchData(); fetchSummary(); }}
            />
            <Button
              icon="pi pi-cog"
              label="Generate Payroll"
              onClick={() => { setGenResult(null); setModals((p) => ({ ...p, generate: true })); }}
            />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mt-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="flex align-items-center gap-2 px-4 py-2 border-round-top border-none cursor-pointer font-medium text-sm transition-all transition-duration-200"
              style={{
                background:   activeTab === t.key ? "var(--primary-color)" : "transparent",
                color:        activeTab === t.key ? "#fff" : "var(--text-color-secondary)",
                borderBottom: activeTab === t.key ? "2px solid var(--primary-color)" : "2px solid transparent",
              }}
            >
              <i className={t.icon} />
              {t.label}
              {t.key === "list" && dataList.length > 0 && (
                <Badge value={dataList.length} severity="info" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">

        {/* ════════════════════════════════════════
            TAB: OVERVIEW
        ════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div>
            {isLoading ? (
              <div className="grid">
                {[1,2,3,4,5,6].map(i => <div key={i} className="col-12 md:col-2"><Skeleton height="90px" className="border-round-xl" /></div>)}
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid mb-4">
                  {[
                    { label: "Total Karyawan", value: summary?.total_karyawan ?? dataList.length,     icon: "pi pi-users",       color: "#6366f1" },
                    { label: "Draft",           value: summary?.total_draft    ?? dataList.filter(d=>d.STATUS==="Draft").length,    icon: "pi pi-file-edit",   color: "#94a3b8" },
                    { label: "Approved",        value: summary?.total_approved ?? dataList.filter(d=>d.STATUS==="Approved").length, icon: "pi pi-check-circle",color: "#f59e0b" },
                    { label: "Paid",            value: summary?.total_paid     ?? dataList.filter(d=>d.STATUS==="Paid").length,     icon: "pi pi-wallet",      color: "#22c55e" },
                    { label: "Total THP",       value: fmtShort(summary?.total_thp ?? dataList.reduce((s,d)=>s+parseFloat(d.TAKE_HOME_PAY||0),0)),         icon: "pi pi-money-bill",  color: "#3b82f6" },
                    { label: "Total Potongan",  value: fmtShort(summary?.total_potongan ?? dataList.reduce((s,d)=>s+parseFloat(d.TOTAL_POTONGAN||0),0)),   icon: "pi pi-minus-circle",color: "#ef4444" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="col-12 md:col-2">
                      <div className="surface-card border-round-xl shadow-2 p-4 h-full" style={{ borderLeft: `4px solid ${kpi.color}` }}>
                        <div className="flex align-items-center gap-2 mb-2">
                          <i className={`${kpi.icon} text-base`} style={{ color: kpi.color }} />
                          <span className="text-500 text-xs font-medium uppercase">{kpi.label}</span>
                        </div>
                        <div className="font-bold text-xl text-900">{kpi.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Status */}
                {dataList.length > 0 && (
                  <div className="grid mb-4">
                    <div className="col-12 md:col-4">
                      <Card title="Status Payroll" className="shadow-2 h-full">
                        {[
                          { label: "Draft",    count: dataList.filter(d=>d.STATUS==="Draft").length,    color: "#94a3b8" },
                          { label: "Approved", count: dataList.filter(d=>d.STATUS==="Approved").length, color: "#f59e0b" },
                          { label: "Paid",     count: dataList.filter(d=>d.STATUS==="Paid").length,     color: "#22c55e" },
                        ].map((s) => (
                          <div key={s.label} className="mb-4">
                            <div className="flex justify-content-between mb-1">
                              <span className="text-700 font-medium text-sm">{s.label}</span>
                              <span className="font-bold" style={{ color: s.color }}>{s.count} / {dataList.length}</span>
                            </div>
                            <ProgressBar
                              value={dataList.length ? Math.round((s.count / dataList.length) * 100) : 0}
                              showValue={false}
                              style={{ height: 10, borderRadius: 5 }}
                              pt={{ value: { style: { background: s.color, borderRadius: 5 } } }}
                            />
                          </div>
                        ))}
                      </Card>
                    </div>

                    {/* Top 5 THP */}
                    <div className="col-12 md:col-4">
                      <Card title="Top 5 Take Home Pay" className="shadow-2 h-full">
                        {top5THP.map((r, i) => (
                          <div key={r.ID} className="flex align-items-center justify-content-between py-2 border-bottom-1 surface-border">
                            <div className="flex align-items-center gap-2">
                              <span className="font-bold text-xs text-500 w-1rem">{i + 1}</span>
                              <Avatar label={r.NAMA?.charAt(0)} shape="circle" size="small"
                                style={{ background: `${DEPT_COLOR[r.DEPARTEMEN]||"#94a3b8"}22`, color: DEPT_COLOR[r.DEPARTEMEN]||"#64748b" }} />
                              <div>
                                <div className="font-semibold text-sm text-900">{r.NAMA}</div>
                                <div className="text-xs text-500">{r.DEPARTEMEN}</div>
                              </div>
                            </div>
                            <span className="font-bold text-primary text-sm">{fmtShort(r.TAKE_HOME_PAY)}</span>
                          </div>
                        ))}
                      </Card>
                    </div>

                    {/* Top 5 Score */}
                    <div className="col-12 md:col-4">
                      <Card title="Top 5 Performance Score" className="shadow-2 h-full">
                        {top5Score.map((r, i) => {
                          const si = getScoreColor(parseFloat(r.PERFORMANCE_SCORE || 0));
                          return (
                            <div key={r.ID} className="flex align-items-center justify-content-between py-2 border-bottom-1 surface-border">
                              <div className="flex align-items-center gap-2">
                                <span className="font-bold text-xs text-500 w-1rem">{i + 1}</span>
                                <Avatar label={r.NAMA?.charAt(0)} shape="circle" size="small"
                                  style={{ background: `${DEPT_COLOR[r.DEPARTEMEN]||"#94a3b8"}22`, color: DEPT_COLOR[r.DEPARTEMEN]||"#64748b" }} />
                                <span className="font-semibold text-sm text-900">{r.NAMA}</span>
                              </div>
                              <span className="font-bold text-lg" style={{ color: si.hex }}>
                                {parseFloat(r.PERFORMANCE_SCORE || 0).toFixed(0)}
                              </span>
                            </div>
                          );
                        })}
                      </Card>
                    </div>
                  </div>
                )}

                {dataList.length === 0 && !isLoading && (
                  <div className="flex flex-column align-items-center justify-content-center p-8 surface-50 border-round-xl border-2 border-dashed border-300">
                    <i className="pi pi-wallet text-400 mb-3" style={{ fontSize: "3rem" }} />
                    <div className="font-bold text-xl text-700 mb-2">Belum Ada Payroll</div>
                    <div className="text-500 text-sm mb-4">
                      {filterPeriode
                        ? `Belum ada payroll untuk periode ${filterPeriode.toLocaleDateString("id-ID",{month:"long",year:"numeric"})}`
                        : "Pilih periode untuk melihat data payroll"}
                    </div>
                    <Button
                      icon="pi pi-cog" label="Generate Payroll Sekarang"
                      onClick={() => { setGenResult(null); setModals((p) => ({ ...p, generate: true })); }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: DAFTAR PAYROLL
        ════════════════════════════════════════ */}
        {activeTab === "list" && (
          <div>
            {/* Mini summary */}
            {!isLoading && dataList.length > 0 && (
              <div className="grid mb-4">
                {[
                  { label: "Total Karyawan", value: dataList.length,                                                                   icon: "pi pi-users",        color: "#6366f1" },
                  { label: "Draft",          value: dataList.filter(d=>d.STATUS==="Draft").length,                                     icon: "pi pi-file-edit",    color: "#94a3b8" },
                  { label: "Approved",       value: dataList.filter(d=>d.STATUS==="Approved").length,                                  icon: "pi pi-check-circle", color: "#f59e0b" },
                  { label: "Paid",           value: dataList.filter(d=>d.STATUS==="Paid").length,                                      icon: "pi pi-wallet",       color: "#22c55e" },
                  { label: "Total THP",      value: fmtShort(dataList.reduce((s,d)=>s+parseFloat(d.TAKE_HOME_PAY||0),0)),             icon: "pi pi-money-bill",   color: "#3b82f6" },
                  { label: "Avg Score",      value: dataList.length ? (dataList.reduce((s,d)=>s+parseFloat(d.PERFORMANCE_SCORE||0),0)/dataList.length).toFixed(1) : "0", icon: "pi pi-star", color: "#8b5cf6" },
                ].map((kpi) => (
                  <div key={kpi.label} className="col-12 md:col-2">
                    <div className="surface-card border-round-xl shadow-2 p-3" style={{ borderLeft: `4px solid ${kpi.color}` }}>
                      <div className="flex align-items-center gap-2 mb-1">
                        <i className={`${kpi.icon} text-sm`} style={{ color: kpi.color }} />
                        <span className="text-500 text-xs font-medium uppercase">{kpi.label}</span>
                      </div>
                      <div className="font-bold text-lg text-900">{kpi.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Card className="shadow-2">
              <div className="flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-table text-primary" />
                  <span className="font-semibold text-700">Daftar Payroll</span>
                  <Tag value={`${dataList.length} record`} severity="info" rounded />
                </div>
              </div>
              <HeaderBar
                onSearch={handleSearch}
                showAddButton={false}
                placeholder="Cari nama, kode, jabatan, atau status..."
              />
              <CustomDataTable
                data={dataList}
                loading={isLoading}
                columns={columns}
                emptyMessage="Belum ada payroll untuk periode ini. Gunakan 'Generate Payroll' untuk membuat."
              />
            </Card>
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: ANALYTICS
        ════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div>
            {isLoading ? (
              <div className="grid">
                {[1,2,3,4].map(i => <div key={i} className="col-12 md:col-6"><Skeleton height="280px" className="border-round-xl" /></div>)}
              </div>
            ) : dataList.length === 0 ? (
              <div className="flex flex-column align-items-center justify-content-center p-8 surface-50 border-round-xl border-2 border-dashed border-300">
                <i className="pi pi-chart-pie text-400 mb-3" style={{ fontSize: "3rem" }} />
                <div className="font-bold text-xl text-700">Tidak ada data untuk dianalisis</div>
                <div className="text-500 text-sm mt-2">Pilih periode yang sudah memiliki data payroll</div>
              </div>
            ) : (
              <>
                <div className="grid mb-4">
                  {/* Chart THP per Departemen */}
                  <div className="col-12 md:col-7">
                    <Card title="Total THP per Departemen" className="shadow-2">
                      <div style={{ height: "280px" }}>
                        <Chart type="bar" data={thpChartData} options={chartOpts} />
                      </div>
                    </Card>
                  </div>

                  {/* Chart Distribusi Score */}
                  <div className="col-12 md:col-5">
                    <Card title="Distribusi Performance Score" className="shadow-2">
                      <div style={{ height: "280px" }}>
                        <Chart type="doughnut" data={scoreChartData} options={doughnutOpts} />
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Statistik per Departemen */}
                <div className="grid mb-4">
                  <div className="col-12 md:col-7">
                    <Card title="Statistik per Departemen" className="shadow-2">
                      <table className="w-full" style={{ borderCollapse: "collapse" }}>
                        <thead>
                          <tr className="surface-100">
                            {["Departemen","Karyawan","Avg THP","Avg Score","Total Bonus"].map(h => (
                              <th key={h} className="p-2 text-left text-xs font-bold text-600 uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(deptStats).sort((a,b) => b[1].totalThp - a[1].totalThp).map(([dept, st]) => {
                            const avgThp   = st.totalThp   / st.count;
                            const avgScore = st.totalScore / st.count;
                            const si       = getScoreColor(avgScore);
                            const bonusTotal = dataList
                              .filter(d => (d.DEPARTEMEN_SNAPSHOT || d.DEPARTEMEN) === dept)
                              .reduce((s, d) => s + parseFloat(d.BONUS_KINERJA || 0), 0);
                            return (
                              <tr key={dept} className="border-bottom-1 surface-border hover:surface-50 transition-colors">
                                <td className="p-2">
                                  <span className="text-xs px-2 py-1 border-round font-bold"
                                    style={{ background: `${DEPT_COLOR[dept]||"#94a3b8"}18`, color: DEPT_COLOR[dept]||"#64748b" }}>
                                    {dept}
                                  </span>
                                </td>
                                <td className="p-2 font-bold text-900 text-center">{st.count}</td>
                                <td className="p-2 font-bold text-primary text-sm">{fmtShort(avgThp)}</td>
                                <td className="p-2">
                                  <span className="font-bold text-sm px-2 py-1 border-round"
                                    style={{ background: si.bg, color: si.hex }}>
                                    {avgScore.toFixed(1)}
                                  </span>
                                </td>
                                <td className="p-2 font-semibold text-green-600 text-sm">{fmtShort(bonusTotal)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </Card>
                  </div>

                  {/* Ringkasan Keuangan */}
                  <div className="col-12 md:col-5">
                    <Card title="Ringkasan Keuangan Periode" className="shadow-2">
                      {(() => {
                        const totPend = dataList.reduce((s,d)=>s+parseFloat(d.TOTAL_PENDAPATAN||0),0);
                        const totPot  = dataList.reduce((s,d)=>s+parseFloat(d.TOTAL_POTONGAN||0),0);
                        const totThp  = dataList.reduce((s,d)=>s+parseFloat(d.TAKE_HOME_PAY||0),0);
                        const totBonus= dataList.reduce((s,d)=>s+parseFloat(d.BONUS_KINERJA||0),0);
                        const rasio   = totPend ? ((totPot/totPend)*100).toFixed(1) : 0;
                        return (
                          <div className="flex flex-column gap-3">
                            {[
                              { label: "Total Pendapatan",  value: totPend,  color: "#22c55e", icon: "pi pi-plus-circle"  },
                              { label: "Total Potongan",    value: totPot,   color: "#ef4444", icon: "pi pi-minus-circle" },
                              { label: "Total Take Home Pay",value:totThp,   color: "#3b82f6", icon: "pi pi-money-bill"   },
                              { label: "Total Bonus Kinerja",value:totBonus, color: "#f59e0b", icon: "pi pi-star"         },
                            ].map((item) => (
                              <div key={item.label} className="flex align-items-center justify-content-between p-3 surface-50 border-round-xl border-1 border-200">
                                <div className="flex align-items-center gap-2">
                                  <i className={`${item.icon}`} style={{ color: item.color, fontSize: "1.1rem" }} />
                                  <span className="text-700 text-sm font-medium">{item.label}</span>
                                </div>
                                <span className="font-bold text-lg" style={{ color: item.color }}>{fmt(item.value)}</span>
                              </div>
                            ))}
                            <div className="p-3 border-round-xl text-center"
                              style={{ background: "linear-gradient(135deg,#1a365d,#2d5a9e)", color: "white" }}>
                              <div className="text-xs font-bold opacity-70 uppercase mb-1">Rasio Potongan</div>
                              <div className="font-bold text-3xl">{rasio}%</div>
                              <div className="text-xs opacity-60 mt-1">dari total pendapatan</div>
                            </div>
                          </div>
                        );
                      })()}
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Dialogs ── */}
      <DetailPayroll
        visible={modals.detail}
        onHide={() => setModals((p) => ({ ...p, detail: false }))}
        data={detailData}
        loading={loadingAction}
        onApprove={handleApprove}
        onPaid={handlePaid}
        onPrint={openPrint}
      />

      <GeneratePayrollDialog
        visible={modals.generate}
        onHide={() => setModals((p) => ({ ...p, generate: false }))}
        karyawanList={karyawanList}
        onGenerate={handleGenerate}
        isLoading={generating}
        generateResult={genResult}
      />

      <AdjustPrintSlipGaji
        visible={modals.print}
        onHide={() => setModals((p) => ({ ...p, print: false }))}
        data={printData}
        setPdfUrl={setPdfUrl}
        setFileName={setPdfFileName}
        setPreviewOpen={setPdfOpen}
      />

      {pdfOpen && (
        <PDFViewer pdfUrl={pdfUrl} fileName={pdfFileName} onClose={() => setPdfOpen(false)} />
      )}
    </div>
  );
}
