"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { ProgressBar } from "primereact/progressbar";
import { InputText } from "primereact/inputtext";
import { Avatar } from "primereact/avatar";
import { Chart } from "primereact/chart";
import ToastNotifier from "../../../components/ToastNotifier";
import RekapDetailDialog from "./components/RekapDetailDialog";
import RekapExportDialog from "./components/RekapExportDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RekapitulasiSuperAdminPage() {
  const router = useRouter();
  const toastRef = useRef(null);

  const [token, setToken] = useState("");
  const [allRekap, setAllRekap] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [globalFilter, setGlobalFilter] = useState("");

  // Export Dialog
  const [exportVisible,     setExportVisible]     = useState(false);
  const [exportTarget,      setExportTarget]      = useState(null);
  const [exportMode,        setExportMode]        = useState("single");
  const [exportDefaultMode, setExportDefaultMode] = useState("excel");

  const now = new Date();
  const [startDate, setStartDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const [filterDepartemen, setFilterDepartemen] = useState(null);

  const departemenOptions = [
    { label: "Semua Departemen", value: null },
    { label: "PRODUKSI", value: "PRODUKSI" },
    { label: "GUDANG", value: "GUDANG" },
    { label: "KEUANGAN", value: "KEUANGAN" },
    { label: "HR", value: "HR" },
  ];

  const shortcutOptions = [
    { label: "Bulan Ini", getValue: () => { const n = new Date(); return { start: new Date(n.getFullYear(), n.getMonth(), 1), end: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; }},
    { label: "Bulan Lalu", getValue: () => { const n = new Date(); return { start: new Date(n.getFullYear(), n.getMonth() - 1, 1), end: new Date(n.getFullYear(), n.getMonth(), 0) }; }},
    { label: "3 Bulan", getValue: () => { const n = new Date(); return { start: new Date(n.getFullYear(), n.getMonth() - 2, 1), end: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; }},
    { label: "Tahun Ini", getValue: () => { const n = new Date(); return { start: new Date(n.getFullYear(), 0, 1), end: new Date(n.getFullYear(), 11, 31) }; }},
  ];

  // ── refs untuk menghindari stale closure di fetch functions ──────────────
  const startDateRef      = useRef(startDate);
  const endDateRef        = useRef(endDate);
  const filterDeptRef     = useRef(filterDepartemen);
  const tokenRef          = useRef(token);

  // Sync refs setiap kali state berubah
  useEffect(() => { startDateRef.current  = startDate;      }, [startDate]);
  useEffect(() => { endDateRef.current    = endDate;        }, [endDate]);
  useEffect(() => { filterDeptRef.current = filterDepartemen; }, [filterDepartemen]);
  useEffect(() => { tokenRef.current      = token;          }, [token]);

  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("ROLE");
    if (!t) { router.push("/"); return; }
    if (role !== "SUPERADMIN") { router.push("/dashboard"); return; }
    setToken(t);
    tokenRef.current = t;
  }, [router]);

  // Auto-fetch saat token siap (gunakan tanggal dari ref, bukan closure)
  useEffect(() => {
    if (token) doFetch();
  }, [token]);

  const toYMD = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // ── Fungsi fetch utama — selalu baca dari ref ─────────────────────────────
  const doFetch = async (overrideParams = {}) => {
    const t     = tokenRef.current;
    const sd    = overrideParams.startDate  ?? startDateRef.current;
    const ed    = overrideParams.endDate    ?? endDateRef.current;
    const dept  = overrideParams.dept       ?? filterDeptRef.current;

    if (!t || !sd || !ed) return;

    const params = {
      start_date: toYMD(sd),
      end_date  : toYMD(ed),
      ...(dept ? { departemen: dept } : {}),
    };

    // Validasi format sebelum kirim
    if (!params.start_date || !params.end_date) {
      toastRef.current?.showToast("01", "Tanggal tidak valid");
      return;
    }

    setIsLoading(true);
    try {
      const [rekapRes, rankRes] = await Promise.all([
        axios.get(`${API_URL}/rekapitulasi-kinerja/all`,     { headers: { Authorization: `Bearer ${t}` }, params }),
        axios.get(`${API_URL}/rekapitulasi-kinerja/ranking`, { headers: { Authorization: `Bearer ${t}` }, params }),
      ]);

      if (rekapRes.data.status === "00") {
        setAllRekap(rekapRes.data.data || []);
      } else {
        toastRef.current?.showToast("01", rekapRes.data.message || "Gagal memuat rekap");
      }

      if (rankRes.data.status === "00") {
        setRanking(rankRes.data.data || []);
      }
    } catch (err) {
      console.error("fetch error:", err);
      toastRef.current?.showToast("01", err.response?.data?.message || "Terjadi kesalahan server");
    } finally {
      setIsLoading(false);
    }
  };

  // Wrapper untuk tombol "Tampilkan" — baca langsung dari state (bukan ref)
  const fetchAllRekap = () => doFetch({ startDate, endDate, dept: filterDepartemen });
  const fetchRanking  = () => {}; // sudah digabung ke doFetch

  const fetchDetailByKaryawan = async (karyawanId) => {
    setIsLoadingDetail(true);
    setDetailVisible(true);
    try {
      const res = await axios.get(`${API_URL}/rekapitulasi-kinerja/karyawan/${karyawanId}`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
        params: {
          start_date: toYMD(startDateRef.current),
          end_date  : toYMD(endDateRef.current),
        },
      });
      if (res.data.status === "00") setSelectedDetail(res.data.data);
      else toastRef.current?.showToast("01", res.data.message || "Gagal memuat detail");
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal memuat detail karyawan");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSearch = () => doFetch({ startDate, endDate, dept: filterDepartemen });

  // Buka export dari tombol footer RekapDetailDialog
  const handleOpenExportFromDetail = (detail, format = "excel") => {
    setExportTarget(detail);
    setExportMode("single");
    setExportDefaultMode(format);
    setExportVisible(true);
  };

  // Export semua karyawan
  const handleExportAll = () => {
    setExportTarget(
      allRekap.length > 0
        ? { periode: { start: toYMD(startDateRef.current), end: toYMD(endDateRef.current) } }
        : null
    );
    setExportMode("all");
    setExportDefaultMode("excel");
    setExportVisible(true);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return { label: "Sangat Baik", severity: "success" };
    if (score >= 60) return { label: "Baik", severity: "info" };
    if (score >= 40) return { label: "Cukup", severity: "warning" };
    return { label: "Perlu Perbaikan", severity: "danger" };
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";
  const formatTime = (t) => t ? t.substring(0, 5) : "-";
  const getRankMedal = (rank) => { if (rank === 1) return "🥇"; if (rank === 2) return "🥈"; if (rank === 3) return "🥉"; return `#${rank}`; };

  // --- Aggregated Analytics ---
  const avgScore = allRekap.length ? Math.round(allRekap.reduce((s, r) => s + (r.summary?.performance_score ?? 0), 0) / allRekap.length) : 0;
  const totalOutput = allRekap.reduce((s, r) => s + (r.summary?.produktivitas?.total_output ?? 0), 0);
  const totalLogbook = allRekap.reduce((s, r) => s + (r.summary?.produktivitas?.total_logbook_approved ?? 0), 0);
  const totalAlpa = allRekap.reduce((s, r) => s + (r.summary?.presensi?.alpa ?? 0), 0);
  const totalTerlambat = allRekap.reduce((s, r) => s + (r.summary?.presensi?.terlambat ?? 0), 0);

  // Score distribution
  const scoreDistribution = {
    sangat_baik: allRekap.filter(r => (r.summary?.performance_score ?? 0) >= 80).length,
    baik: allRekap.filter(r => { const sc = r.summary?.performance_score ?? 0; return sc >= 60 && sc < 80; }).length,
    cukup: allRekap.filter(r => { const sc = r.summary?.performance_score ?? 0; return sc >= 40 && sc < 60; }).length,
    perlu_perbaikan: allRekap.filter(r => (r.summary?.performance_score ?? 0) < 40).length,
  };

  // Per departemen
  const deptStats = departemenOptions.filter(d => d.value).map(dept => {
    const group = allRekap.filter(r => r.karyawan?.DEPARTEMEN === dept.value);
    return {
      name: dept.value,
      count: group.length,
      avgScore: group.length ? Math.round(group.reduce((s, r) => s + (r.summary?.performance_score ?? 0), 0) / group.length) : 0,
      totalOutput: group.reduce((s, r) => s + (r.summary?.produktivitas?.total_output ?? 0), 0),
    };
  }).filter(d => d.count > 0);

  const scoreChartData = {
    labels: ["Sangat Baik (≥80)", "Baik (60-79)", "Cukup (40-59)", "Perlu Perbaikan (<40)"],
    datasets: [{
      data: [scoreDistribution.sangat_baik, scoreDistribution.baik, scoreDistribution.cukup, scoreDistribution.perlu_perbaikan],
      backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"],
      borderWidth: 0,
    }]
  };

  const deptChartData = {
    labels: deptStats.map(d => d.name),
    datasets: [
      { label: "Avg Score", data: deptStats.map(d => d.avgScore), backgroundColor: "#3b82f680", borderColor: "#3b82f6", borderWidth: 2, borderRadius: 4, type: "bar" },
      { label: "Total Output", data: deptStats.map(d => d.totalOutput), backgroundColor: "#22c55e80", borderColor: "#22c55e", borderWidth: 2, borderRadius: 4, type: "bar" },
    ]
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: "pi pi-chart-pie" },
    { key: "rekap", label: "Rekap Karyawan", icon: "pi pi-table" },
    { key: "ranking", label: "Ranking", icon: "pi pi-trophy" },
    { key: "analytics", label: "Analytics", icon: "pi pi-chart-bar" },
  ];

  return (
    <div className="card p-0">
      <ToastNotifier ref={toastRef} />

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-bottom-1 surface-border">
        <div className="flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div className="flex align-items-center gap-2 mb-1">
              <Tag value="SUPERADMIN" severity="danger" />
              <span className="text-500 text-sm">Panel Kontrol</span>
            </div>
            <h2 className="text-2xl font-bold text-900 m-0">Rekapitulasi Kinerja</h2>
            <p className="text-500 text-sm mt-1 m-0">Analitik komprehensif seluruh karyawan lintas departemen</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {shortcutOptions.map((opt) => (
              <Button key={opt.label} label={opt.label} size="small" className="p-button-outlined p-button-secondary"
                onClick={() => {
                  const v = opt.getValue();
                  setStartDate(v.start);
                  setEndDate(v.end);
                  // Langsung fetch dengan nilai baru (tidak bergantung pada state yang belum terupdate)
                  doFetch({ startDate: v.start, endDate: v.end, dept: filterDeptRef.current });
                }} />
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex align-items-end gap-3 mt-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-700 mb-2">Dari Tanggal</label>
            <Calendar value={startDate} onChange={(e) => setStartDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-12rem" />
          </div>
          <div>
            <label className="block text-sm font-medium text-700 mb-2">Sampai Tanggal</label>
            <Calendar value={endDate} onChange={(e) => setEndDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-12rem" />
          </div>
          <div>
            <label className="block text-sm font-medium text-700 mb-2">Departemen</label>
            <Dropdown value={filterDepartemen} options={departemenOptions} onChange={(e) => setFilterDepartemen(e.value)} placeholder="Semua" className="w-12rem" showClear />
          </div>
          <Button label="Tampilkan" icon="pi pi-search" onClick={handleSearch} loading={isLoading} />
          <Button label="Export Semua" icon="pi pi-download" severity="success" className="p-button-outlined" onClick={handleExportAll} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-0 px-4 border-bottom-1 surface-border overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex align-items-center gap-2 px-4 py-3 font-medium text-sm border-none bg-transparent cursor-pointer transition-colors"
            style={{
              color: activeTab === tab.key ? "var(--primary-color)" : "var(--text-color-secondary)",
              borderBottom: activeTab === tab.key ? "2px solid var(--primary-color)" : "2px solid transparent",
              outline: "none",
            }}>
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="col-12 md:col-4"><Skeleton height="120px" className="border-round-xl" /></div>)}
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div>
                {/* Big KPI Cards */}
                <div className="grid mb-4">
                  {[
                    { icon: "pi pi-users", color: "#3b82f6", label: "Total Karyawan", value: allRekap.length, sub: "Karyawan aktif" },
                    { icon: "pi pi-star-fill", color: getScoreColor(avgScore), label: "Avg Performance Score", value: avgScore, sub: getScoreLabel(avgScore).label },
                    { icon: "pi pi-check-circle", color: "#8b5cf6", label: "Total Logbook Approved", value: totalLogbook, sub: "Entri" },
                    { icon: "pi pi-box", color: "#f59e0b", label: "Total Output", value: `${totalOutput.toFixed(0)} unit`, sub: "Semua departemen" },
                    { icon: "pi pi-times-circle", color: "#ef4444", label: "Total Alpa", value: totalAlpa, sub: "Hari tidak hadir" },
                    { icon: "pi pi-clock", color: "#f97316", label: "Total Terlambat", value: totalTerlambat, sub: "Kejadian terlambat" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="col-12 md:col-4 lg:col-2">
                      <div className="surface-card border-round-xl shadow-2 p-4" style={{ borderLeft: `4px solid ${kpi.color}` }}>
                        <div className="flex align-items-center gap-2 mb-2">
                          <i className={`${kpi.icon} text-lg`} style={{ color: kpi.color }}></i>
                          <span className="text-500 text-xs font-medium uppercase">{kpi.label}</span>
                        </div>
                        <div className="font-bold text-2xl text-900">{kpi.value}</div>
                        <div className="text-500 text-xs mt-1">{kpi.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Score Distribution */}
                <div className="grid mb-4">
                  <div className="col-12 md:col-4">
                    <Card title="Distribusi Score" className="shadow-2 h-full">
                      <div className="flex flex-column gap-3">
                        {[
                          { label: "Sangat Baik (≥80)", count: scoreDistribution.sangat_baik, color: "#22c55e" },
                          { label: "Baik (60-79)", count: scoreDistribution.baik, color: "#3b82f6" },
                          { label: "Cukup (40-59)", count: scoreDistribution.cukup, color: "#f59e0b" },
                          { label: "Perlu Perbaikan (<40)", count: scoreDistribution.perlu_perbaikan, color: "#ef4444" },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-content-between align-items-center mb-1">
                              <span className="text-600 text-sm">{item.label}</span>
                              <span className="font-bold" style={{ color: item.color }}>{item.count}</span>
                            </div>
                            <ProgressBar value={allRekap.length ? Math.round((item.count / allRekap.length) * 100) : 0}
                              showValue={false} style={{ height: 8, borderRadius: 4 }}
                              pt={{ value: { style: { background: item.color, borderRadius: 4 } } }} />
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Per Dept */}
                  <div className="col-12 md:col-8">
                    <Card title="Statistik per Departemen" className="shadow-2 h-full">
                      <DataTable value={deptStats} size="small">
                        <Column header="Departemen" body={(row) => <Tag value={row.name} severity="info" />} />
                        <Column header="Jumlah Karyawan" body={(row) => <span className="font-bold">{row.count}</span>} />
                        <Column header="Avg Score" body={(row) => (
                          <div className="flex align-items-center gap-2">
                            <ProgressBar value={row.avgScore} showValue={false} style={{ width: "80px", height: 8, borderRadius: 4 }}
                              pt={{ value: { style: { background: getScoreColor(row.avgScore), borderRadius: 4 } } }} />
                            <span className="font-bold" style={{ color: getScoreColor(row.avgScore) }}>{row.avgScore}</span>
                          </div>
                        )} />
                        <Column header="Total Output" body={(row) => <span className="font-bold text-green-600">{row.totalOutput.toFixed(0)} unit</span>} />
                      </DataTable>
                    </Card>
                  </div>
                </div>

                {/* Top & Bottom Performers */}
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <Card title={<div className="flex align-items-center gap-2"><span className="text-xl">🏆</span><span>Top 5 Karyawan</span></div>} className="shadow-2">
                      {ranking.slice(0, 5).map((item, idx) => (
                        <div key={item.karyawan_id} className="flex align-items-center gap-3 mb-3 p-2 surface-50 border-round">
                          <span className="text-2xl" style={{ minWidth: 32 }}>{getRankMedal(idx + 1)}</span>
                          <Avatar label={item.nama?.charAt(0)} shape="circle" size="normal"
                            style={{ background: `${getScoreColor(item.performance_score)}22`, color: getScoreColor(item.performance_score) }} />
                          <div className="flex-1">
                            <div className="font-semibold text-900 text-sm">{item.nama}</div>
                            <div className="text-500 text-xs">{item.departemen}</div>
                          </div>
                          <div className="font-bold text-xl" style={{ color: getScoreColor(item.performance_score) }}>{item.performance_score}</div>
                          <Button icon="pi pi-eye" size="small" text severity="secondary" onClick={() => fetchDetailByKaryawan(item.karyawan_id)} />
                        </div>
                      ))}
                    </Card>
                  </div>
                  <div className="col-12 md:col-6">
                    <Card title={<div className="flex align-items-center gap-2"><span className="text-xl">⚠️</span><span>Perlu Perhatian (Score Terendah)</span></div>} className="shadow-2">
                      {[...ranking].sort((a, b) => a.performance_score - b.performance_score).slice(0, 5).map((item, idx) => (
                        <div key={item.karyawan_id} className="flex align-items-center gap-3 mb-3 p-2 surface-50 border-round">
                          <div className="flex align-items-center justify-content-center border-round-full bg-red-100" style={{ width: 32, height: 32, minWidth: 32 }}>
                            <span className="text-red-600 font-bold text-sm">{idx + 1}</span>
                          </div>
                          <Avatar label={item.nama?.charAt(0)} shape="circle" size="normal"
                            style={{ background: "#ef444422", color: "#ef4444" }} />
                          <div className="flex-1">
                            <div className="font-semibold text-900 text-sm">{item.nama}</div>
                            <div className="text-500 text-xs">{item.departemen} · Alpa: {item.total_alpa}</div>
                          </div>
                          <span className="font-bold text-xl text-red-500">{item.performance_score}</span>
                          <Button icon="pi pi-eye" size="small" text severity="secondary" onClick={() => fetchDetailByKaryawan(item.karyawan_id)} />
                        </div>
                      ))}
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* REKAP TAB */}
            {activeTab === "rekap" && (
              <Card className="shadow-2">
                <div className="flex justify-content-between align-items-center mb-3">
                  <span className="font-semibold text-700">{allRekap.length} karyawan ditemukan</span>
                  <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Cari karyawan..." className="w-18rem" size="small" />
                  </span>
                </div>
                <DataTable value={allRekap} paginator rows={15} rowsPerPageOptions={[10,15,25,50]} size="small" stripedRows
                  globalFilter={globalFilter} emptyMessage="Tidak ada data" sortField="summary.performance_score" sortOrder={-1}>
                  <Column header="#" body={(row, { rowIndex }) => <span className="text-500 text-sm">{rowIndex + 1}</span>} style={{ width: "50px" }} />
                  <Column header="Karyawan" body={(row) => (
                    <div className="flex align-items-center gap-2">
                      <Avatar label={row.karyawan?.NAMA?.charAt(0)} size="normal" shape="circle"
                        style={{ background: `${getScoreColor(row.summary?.performance_score)}22`, color: getScoreColor(row.summary?.performance_score) }} />
                      <div>
                        <div className="font-semibold text-900 text-sm">{row.karyawan?.NAMA}</div>
                        <div className="text-500 text-xs">{row.karyawan?.NIK} · {row.karyawan?.EMAIL}</div>
                      </div>
                    </div>
                  )} style={{ minWidth: "200px" }} />
                  <Column header="Dept" body={(row) => <Tag value={row.karyawan?.DEPARTEMEN} severity="info" />} sortField="karyawan.DEPARTEMEN" sortable />
                  <Column header="Score" sortable sortField="summary.performance_score" body={(row) => {
                    const sc = row.summary?.performance_score ?? 0;
                    return (
                      <div className="flex align-items-center gap-2">
                        <span className="font-bold text-lg" style={{ color: getScoreColor(sc), minWidth: 32 }}>{sc}</span>
                        <Tag value={getScoreLabel(sc).label} severity={getScoreLabel(sc).severity} />
                      </div>
                    );
                  }} style={{ minWidth: "170px" }} />
                  <Column header="Hadir" body={(row) => <span className="font-semibold text-green-600">{row.summary?.presensi?.hadir ?? 0}</span>} />
                  <Column header="Alpa" body={(row) => <span className={`font-semibold ${(row.summary?.presensi?.alpa ?? 0) > 0 ? "text-red-500" : "text-500"}`}>{row.summary?.presensi?.alpa ?? 0}</span>} />
                  <Column header="Terlambat" body={(row) => <span className={`font-semibold ${(row.summary?.presensi?.terlambat ?? 0) > 2 ? "text-orange-500" : "text-500"}`}>{row.summary?.presensi?.terlambat ?? 0}</span>} />
                  <Column header="Jam Kerja" body={(row) => <span className="text-sm">{row.summary?.presensi?.total_jam_kerja ?? 0} jam</span>} />
                  <Column header="Logbook" body={(row) => <span className="font-bold text-purple-600">{row.summary?.produktivitas?.total_logbook_approved ?? 0}</span>} />
                  <Column header="Output" body={(row) => <span className="font-bold text-yellow-700">{row.summary?.produktivitas?.total_output ?? 0} unit</span>} />
                  <Column header="Jam Produktif" body={(row) => <span className="text-sm">{row.summary?.produktivitas?.total_jam_produktif?.toFixed(1) ?? 0} jam</span>} />
                  <Column header="Aksi" style={{ width: "100px" }} body={(row) => (
                    <div className="flex gap-1">
                      <Button icon="pi pi-eye" size="small" severity="info" tooltip="Lihat Detail" tooltipOptions={{ position: "top" }}
                        onClick={() => fetchDetailByKaryawan(row.karyawan?.KARYAWAN_ID)} />
                      <Button icon="pi pi-file-excel" size="small" severity="success" tooltip="Export Excel" tooltipOptions={{ position: "top" }}
                        onClick={() => {
                          const d = allRekap.find((r) => r.karyawan?.KARYAWAN_ID === row.karyawan?.KARYAWAN_ID);
                          if (d) { setExportTarget(d); setExportMode("single"); setExportDefaultMode("excel"); setExportVisible(true); }
                          else fetchDetailByKaryawan(row.karyawan?.KARYAWAN_ID);
                        }} />
                    </div>
                  )} />
                </DataTable>
              </Card>
            )}

            {/* RANKING TAB */}
            {activeTab === "ranking" && (
              <div>
                <div className="grid mb-4">
                  {ranking.slice(0, 3).map((item) => (
                    <div key={item.karyawan_id} className="col-12 md:col-4">
                      <div className="surface-card border-round-xl shadow-3 p-4 text-center"
                        style={{ borderTop: `4px solid ${getScoreColor(item.performance_score)}` }}>
                        <div className="text-5xl mb-3">{getRankMedal(item.rank)}</div>
                        <Avatar label={item.nama?.charAt(0)} size="xlarge" shape="circle"
                          style={{ background: `${getScoreColor(item.performance_score)}22`, color: getScoreColor(item.performance_score), fontSize: "1.8rem", fontWeight: "bold" }} />
                        <div className="mt-3 font-bold text-xl text-900">{item.nama}</div>
                        <div className="text-500 text-sm mb-3">{item.departemen} · {item.jabatan}</div>
                        <div className="font-bold mb-1" style={{ fontSize: "3rem", color: getScoreColor(item.performance_score), lineHeight: 1 }}>{item.performance_score}</div>
                        <Tag value={getScoreLabel(item.performance_score).label} severity={getScoreLabel(item.performance_score).severity} className="mb-3" />
                        <div className="grid text-center mt-2">
                          <div className="col-4"><div className="text-500 text-xs mb-1">Output</div><div className="font-bold text-green-600">{item.total_output}</div></div>
                          <div className="col-4"><div className="text-500 text-xs mb-1">Hadir</div><div className="font-bold text-blue-600">{item.total_hadir}</div></div>
                          <div className="col-4"><div className="text-500 text-xs mb-1">Alpa</div><div className="font-bold text-red-500">{item.total_alpa}</div></div>
                        </div>
                        <Button label="Detail" icon="pi pi-eye" size="small" className="mt-3 w-full" outlined onClick={() => fetchDetailByKaryawan(item.karyawan_id)} />
                      </div>
                    </div>
                  ))}
                </div>
                <Card className="shadow-2">
                  <DataTable value={ranking} paginator rows={15} size="small" stripedRows emptyMessage="Tidak ada data">
                    <Column header="Rank" body={(row) => <span className="font-bold text-lg">{getRankMedal(row.rank)}</span>} style={{ width: "70px" }} />
                    <Column header="Karyawan" body={(row) => (
                      <div className="flex align-items-center gap-2">
                        <Avatar label={row.nama?.charAt(0)} size="normal" shape="circle"
                          style={{ background: `${getScoreColor(row.performance_score)}22`, color: getScoreColor(row.performance_score) }} />
                        <div>
                          <div className="font-semibold">{row.nama}</div>
                          <div className="text-500 text-xs">{row.departemen}</div>
                        </div>
                      </div>
                    )} style={{ minWidth: "180px" }} />
                    <Column header="Score" body={(row) => (
                      <div className="flex align-items-center gap-2">
                        <ProgressBar value={row.performance_score} showValue={false} style={{ width: "80px", height: 8, borderRadius: 4 }}
                          pt={{ value: { style: { background: getScoreColor(row.performance_score), borderRadius: 4 } } }} />
                        <span className="font-bold" style={{ color: getScoreColor(row.performance_score) }}>{row.performance_score}</span>
                      </div>
                    )} style={{ minWidth: "180px" }} />
                    <Column header="Output" body={(row) => <span className="font-bold text-green-600">{row.total_output} unit</span>} sortable sortField="total_output" />
                    <Column header="Hadir" body={(row) => <span className="font-bold text-blue-600">{row.total_hadir}</span>} />
                    <Column header="Alpa" body={(row) => <span className={`font-bold ${row.total_alpa > 0 ? "text-red-500" : "text-500"}`}>{row.total_alpa}</span>} />
                    <Column header="Terlambat" body={(row) => <span className={`font-bold ${row.total_terlambat > 2 ? "text-orange-500" : "text-500"}`}>{row.total_terlambat}</span>} />
                    <Column header="Aksi" body={(row) => (
                      <Button icon="pi pi-eye" size="small" severity="info" tooltip="Lihat Detail" tooltipOptions={{ position: "top" }}
                        onClick={() => fetchDetailByKaryawan(row.karyawan_id)} />
                    )} style={{ width: "80px" }} />
                  </DataTable>
                </Card>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (
              <div className="grid">
                <div className="col-12 md:col-5">
                  <Card title="Distribusi Score Kinerja" className="shadow-2 mb-4">
                    {allRekap.length > 0 ? (
                      <Chart type="doughnut" data={scoreChartData} options={{ plugins: { legend: { position: "bottom" } }, cutout: "65%" }} style={{ maxHeight: "280px" }} />
                    ) : <p className="text-500 text-center">Tidak ada data</p>}
                  </Card>
                </div>
                <div className="col-12 md:col-7">
                  <Card title="Perbandingan per Departemen" className="shadow-2 mb-4">
                    {deptStats.length > 0 ? (
                      <Chart type="bar" data={deptChartData} options={{ plugins: { legend: { position: "top" } }, scales: { y: { beginAtZero: true } }, responsive: true }} style={{ maxHeight: "280px" }} />
                    ) : <p className="text-500 text-center">Tidak ada data</p>}
                  </Card>
                </div>
                {/* Attendance breakdown */}
                <div className="col-12">
                  <Card title="Ringkasan Kehadiran per Departemen" className="shadow-2">
                    <DataTable value={deptStats.map(dept => {
                      const group = allRekap.filter(r => r.karyawan?.DEPARTEMEN === dept.name);
                      return {
                        dept: dept.name,
                        karyawan: dept.count,
                        totalHadir: group.reduce((s, r) => s + (r.summary?.presensi?.hadir ?? 0), 0),
                        totalAlpa: group.reduce((s, r) => s + (r.summary?.presensi?.alpa ?? 0), 0),
                        totalIzin: group.reduce((s, r) => s + (r.summary?.presensi?.izin ?? 0), 0),
                        totalSakit: group.reduce((s, r) => s + (r.summary?.presensi?.sakit ?? 0), 0),
                        totalTerlambat: group.reduce((s, r) => s + (r.summary?.presensi?.terlambat ?? 0), 0),
                        totalJamKerja: group.reduce((s, r) => s + (r.summary?.presensi?.total_jam_kerja ?? 0), 0).toFixed(1),
                      };
                    })} size="small" stripedRows emptyMessage="Tidak ada data">
                      <Column header="Departemen" body={(row) => <Tag value={row.dept} severity="info" />} />
                      <Column header="Karyawan" body={(row) => <span className="font-bold">{row.karyawan}</span>} />
                      <Column header="Total Hadir" body={(row) => <span className="font-bold text-green-600">{row.totalHadir}</span>} />
                      <Column header="Total Alpa" body={(row) => <span className={`font-bold ${row.totalAlpa > 0 ? "text-red-500" : "text-500"}`}>{row.totalAlpa}</span>} />
                      <Column header="Total Izin" body={(row) => <span className="font-bold text-blue-500">{row.totalIzin}</span>} />
                      <Column header="Total Sakit" body={(row) => <span className="font-bold text-yellow-600">{row.totalSakit}</span>} />
                      <Column header="Total Terlambat" body={(row) => <span className={`font-bold ${row.totalTerlambat > 5 ? "text-orange-500" : "text-500"}`}>{row.totalTerlambat}</span>} />
                      <Column header="Total Jam Kerja" body={(row) => <span className="font-bold">{row.totalJamKerja} jam</span>} />
                    </DataTable>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Dialog ── */}
      <RekapDetailDialog
        visible={detailVisible}
        onHide={() => { setDetailVisible(false); setSelectedDetail(null); }}
        isLoading={isLoadingDetail}
        selectedDetail={selectedDetail}
        onExport={handleOpenExportFromDetail}
      />

      {/* ── Export Dialog ── */}
      <RekapExportDialog
        visible={exportVisible}
        onHide={() => { setExportVisible(false); setExportTarget(null); }}
        detail={exportTarget}
        defaultMode={exportDefaultMode}
        allRekap={allRekap}
        exportMode={exportMode}
      />
    </div>
  );
}