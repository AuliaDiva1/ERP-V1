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
import ToastNotifier from "../../../../components/ToastNotifier";
import RekapDetailDialog from "./components/RekapDetailDialog";
import RekapExportDialog from "./components/RekapExportDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

const getRankMedal = (rank) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
};

const toYMD = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function RekapitulasiHRPage() {
  const router   = useRef(null);
  const toastRef = useRef(null);
  const tokenRef = useRef("");
  const filterDeptRef = useRef(null);

  const [token,           setToken]           = useState("");
  const [allRekap,        setAllRekap]        = useState([]);
  const [ranking,         setRanking]         = useState([]);
  const [isLoading,       setIsLoading]       = useState(false);
  const [activeTab,       setActiveTab]       = useState("rekap");
  const [globalFilter,    setGlobalFilter]    = useState("");
  const [selectedDetail,  setSelectedDetail]  = useState(null);
  const [detailVisible,   setDetailVisible]   = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [exportVisible,     setExportVisible]     = useState(false);
  const [exportTarget,      setExportTarget]      = useState(null);
  const [exportMode,        setExportMode]        = useState("single");
  const [exportDefaultMode, setExportDefaultMode] = useState("excel");

  const now = new Date();
  const [startDate,        setStartDate]        = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [endDate,          setEndDate]          = useState(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const [filterDepartemen, setFilterDepartemen] = useState(null);

  useEffect(() => { filterDeptRef.current = filterDepartemen; }, [filterDepartemen]);

  const routerNav = useRouter();

  const departemenOptions = [
    { label: "Semua Departemen", value: null },
    { label: "PRODUKSI",  value: "PRODUKSI" },
    { label: "GUDANG",    value: "GUDANG" },
    { label: "KEUANGAN",  value: "KEUANGAN" },
    { label: "HR",        value: "HR" },
  ];

  const shortcutOptions = [
    { label: "Bulan Ini",  getValue: () => { const n = new Date(); return { start: new Date(n.getFullYear(), n.getMonth(), 1),     end: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; } },
    { label: "Bulan Lalu", getValue: () => { const n = new Date(); return { start: new Date(n.getFullYear(), n.getMonth() - 1, 1), end: new Date(n.getFullYear(), n.getMonth(), 0) }; } },
    { label: "3 Bulan",    getValue: () => { const n = new Date(); return { start: new Date(n.getFullYear(), n.getMonth() - 2, 1), end: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; } },
  ];

  useEffect(() => {
    const t    = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("ROLE");
    if (!t) { routerNav.push("/"); return; }
    if (!["HR", "SUPERADMIN"].includes(role)) { routerNav.push("/dashboard"); return; }
    setToken(t);
    tokenRef.current = t;
  }, [routerNav]);

  useEffect(() => {
    if (token) {
      fetchAllRekapWith(startDate, endDate);
      fetchRankingWith(startDate, endDate);
    }
  }, [token]); // eslint-disable-line

  // ── Fetch — selalu terima tanggal eksplisit agar tidak stale ─────────────
  const fetchAllRekapWith = async (sd, ed, dept) => {
    const t       = tokenRef.current;
    const deptVal = dept !== undefined ? dept : filterDeptRef.current;
    if (!t || !sd || !ed) return;

    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/rekapitulasi-kinerja/all`, {
        headers: { Authorization: `Bearer ${t}` },
        params : { start_date: toYMD(sd), end_date: toYMD(ed), ...(deptVal ? { departemen: deptVal } : {}) },
      });
      if (res.data.status === "00") setAllRekap(res.data.data || []);
      else toastRef.current?.showToast("01", res.data.message || "Gagal memuat data");
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRankingWith = async (sd, ed, dept) => {
    const t       = tokenRef.current;
    const deptVal = dept !== undefined ? dept : filterDeptRef.current;
    if (!t || !sd || !ed) return;
    try {
      const res = await axios.get(`${API_URL}/rekapitulasi-kinerja/ranking`, {
        headers: { Authorization: `Bearer ${t}` },
        params : { start_date: toYMD(sd), end_date: toYMD(ed), ...(deptVal ? { departemen: deptVal } : {}) },
      });
      if (res.data.status === "00") setRanking(res.data.data || []);
    } catch (err) { console.error("Ranking fetch error", err); }
  };

  const handleSearch = () => {
    fetchAllRekapWith(startDate, endDate, filterDepartemen);
    fetchRankingWith(startDate, endDate, filterDepartemen);
  };

  const fetchDetailByKaryawan = async (karyawanId) => {
    setIsLoadingDetail(true);
    setDetailVisible(true);
    setSelectedDetail(null);
    try {
      const res = await axios.get(`${API_URL}/rekapitulasi-kinerja/karyawan/${karyawanId}`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
        params : { start_date: toYMD(startDate), end_date: toYMD(endDate) },
      });
      if (res.data.status === "00") setSelectedDetail(res.data.data);
      else toastRef.current?.showToast("01", res.data.message || "Gagal memuat detail");
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal memuat detail karyawan");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleOpenExportFromDetail = (detail, format = "excel") => {
    setExportTarget(detail); setExportMode("single"); setExportDefaultMode(format); setExportVisible(true);
  };

  const handleExportAll = () => {
    setExportTarget(allRekap.length > 0 ? { periode: { start: toYMD(startDate), end: toYMD(endDate) } } : null);
    setExportMode("all"); setExportDefaultMode("excel"); setExportVisible(true);
  };

  const avgScore    = allRekap.length ? Math.round(allRekap.reduce((s, r) => s + (r.summary?.performance_score ?? 0), 0) / allRekap.length) : 0;
  const totalOutput = allRekap.reduce((s, r) => s + (r.summary?.produktivitas?.total_output ?? 0), 0);
  const totalLogbook= allRekap.reduce((s, r) => s + (r.summary?.produktivitas?.total_logbook_approved ?? 0), 0);

  return (
    <div className="card p-0">
      <ToastNotifier ref={toastRef} />

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-bottom-1 surface-border">
        <div className="flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-900 m-0">Rekapitulasi Kinerja Karyawan</h2>
            <p className="text-500 text-sm mt-1 m-0">Monitor performa semua karyawan dalam satu tampilan</p>
          </div>

          {/* Shortcut Buttons — auto-fetch dengan tanggal baru */}
          <div className="flex gap-2 flex-wrap">
            {shortcutOptions.map((opt) => (
              <Button key={opt.label} label={opt.label} size="small" className="p-button-outlined p-button-secondary"
                onClick={() => {
                  const v = opt.getValue();
                  setStartDate(v.start);
                  setEndDate(v.end);
                  fetchAllRekapWith(v.start, v.end);
                  fetchRankingWith(v.start, v.end);
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
            <Dropdown value={filterDepartemen} options={departemenOptions} onChange={(e) => setFilterDepartemen(e.value)}
              placeholder="Semua" className="w-12rem" showClear />
          </div>
          <Button label="Tampilkan" icon="pi pi-search" onClick={handleSearch} loading={isLoading} />
          <Button label="Export Semua" icon="pi pi-download" severity="success" className="p-button-outlined" onClick={handleExportAll} />
        </div>
      </div>

      <div className="p-4">
        {/* Summary Cards */}
        {!isLoading && allRekap.length > 0 && (
          <div className="grid mb-4">
            {[
              { icon: "pi pi-users", color: "#3b82f6", label: "Total Karyawan", value: allRekap.length, sub: null },
              { icon: "pi pi-star",  color: getScoreColor(avgScore), label: "Rata-rata Score", value: avgScore, sub: null },
              { icon: "pi pi-check-circle", color: "#8b5cf6", label: "Total Logbook Approved", value: totalLogbook, sub: null },
              { icon: "pi pi-box",   color: "#f59e0b", label: "Total Output", value: `${totalOutput.toFixed(0)} unit`, sub: null },
            ].map((kpi) => (
              <div key={kpi.label} className="col-12 md:col-3">
                <div className="surface-card border-round-xl shadow-2 p-4 text-center" style={{ borderTop: `4px solid ${kpi.color}` }}>
                  <i className={`${kpi.icon} text-3xl mb-2 block`} style={{ color: kpi.color }} />
                  <div className="text-500 text-xs uppercase mb-1">{kpi.label}</div>
                  <div className="font-bold text-3xl" style={{ color: kpi.color }}>{kpi.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4">
          <Button label="Rekap Semua Karyawan" icon="pi pi-table"
            className={activeTab === "rekap" ? "" : "p-button-outlined p-button-secondary"}
            onClick={() => setActiveTab("rekap")} />
          <Button label="Performance Ranking" icon="pi pi-trophy"
            className={activeTab === "ranking" ? "" : "p-button-outlined p-button-secondary"}
            onClick={() => setActiveTab("ranking")} />
        </div>

        {isLoading ? (
          <Skeleton height="400px" className="border-round-xl" />
        ) : activeTab === "rekap" ? (

          /* ════ TAB REKAP ════ */
          <Card className="shadow-2">
            <div className="flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <span className="font-semibold text-700">{allRekap.length} karyawan ditemukan</span>
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Cari karyawan..." className="w-16rem" size="small" />
              </span>
            </div>
            <DataTable value={allRekap} paginator rows={10} rowsPerPageOptions={[5,10,25,50]}
              size="small" stripedRows globalFilter={globalFilter}
              emptyMessage="Tidak ada data" sortField="summary.performance_score" sortOrder={-1}>
              <Column header="Karyawan" style={{ minWidth: "180px" }} body={(row) => (
                <div className="flex align-items-center gap-2">
                  <Avatar label={row.karyawan?.NAMA?.charAt(0)} size="normal" shape="circle"
                    style={{ background: `${getScoreColor(row.summary?.performance_score)}22`, color: getScoreColor(row.summary?.performance_score) }} />
                  <div>
                    <div className="font-semibold text-900 text-sm">{row.karyawan?.NAMA}</div>
                    <div className="text-500 text-xs">{row.karyawan?.NIK} · {row.karyawan?.EMAIL}</div>
                  </div>
                </div>
              )} />
              <Column header="Departemen" sortable sortField="karyawan.DEPARTEMEN"
                body={(row) => <Tag value={row.karyawan?.DEPARTEMEN} severity="info" />} />
              <Column header="Jabatan" style={{ minWidth: "130px" }}
                body={(row) => <span className="text-sm">{row.karyawan?.JABATAN}</span>} />
              <Column header="Score" sortable sortField="summary.performance_score" style={{ minWidth: "160px" }}
                body={(row) => {
                  const sc = row.summary?.performance_score ?? 0;
                  return (
                    <div className="flex align-items-center gap-2">
                      <span className="font-bold text-lg" style={{ color: getScoreColor(sc), minWidth: 32 }}>{sc}</span>
                      <Tag value={getScoreLabel(sc).label} severity={getScoreLabel(sc).severity} />
                    </div>
                  );
                }} />
              <Column header="Hadir"
                body={(row) => <span className="font-semibold text-green-600">{row.summary?.presensi?.hadir ?? 0}</span>} />
              <Column header="Alpa"
                body={(row) => <span className={`font-semibold ${(row.summary?.presensi?.alpa ?? 0) > 0 ? "text-red-500" : "text-500"}`}>{row.summary?.presensi?.alpa ?? 0}</span>} />
              <Column header="Terlambat"
                body={(row) => <span className={`font-semibold ${(row.summary?.presensi?.terlambat ?? 0) > 2 ? "text-orange-500" : "text-500"}`}>{row.summary?.presensi?.terlambat ?? 0}</span>} />
              <Column header="Output"
                body={(row) => <span className="font-bold">{row.summary?.produktivitas?.total_output ?? 0} unit</span>} />
              <Column header="Logbook"
                body={(row) => <span className="font-bold text-purple-600">{row.summary?.produktivitas?.total_logbook_approved ?? 0}</span>} />
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

        ) : (

          /* ════ TAB RANKING ════ */
          <div>
            <div className="grid mb-4">
              {ranking.slice(0, 3).map((item) => (
                <div key={item.karyawan_id} className="col-12 md:col-4">
                  <div className="surface-card border-round-xl shadow-3 p-4 text-center"
                    style={{ borderTop: `4px solid ${getScoreColor(item.performance_score)}` }}>
                    <div className="text-4xl mb-2">{getRankMedal(item.rank)}</div>
                    <Avatar label={item.nama?.charAt(0)} size="xlarge" shape="circle"
                      style={{ background: `${getScoreColor(item.performance_score)}22`, color: getScoreColor(item.performance_score), fontSize: "1.5rem", fontWeight: "bold" }} />
                    <div className="mt-3 font-bold text-lg text-900">{item.nama}</div>
                    <div className="text-500 text-sm mb-3">{item.departemen} · {item.jabatan}</div>
                    <div className="font-bold text-4xl mb-1" style={{ color: getScoreColor(item.performance_score) }}>{item.performance_score}</div>
                    <Tag value={getScoreLabel(item.performance_score).label} severity={getScoreLabel(item.performance_score).severity} />
                    <div className="grid mt-3 text-center">
                      <div className="col-4"><div className="text-500 text-xs">Output</div><div className="font-bold text-green-600">{item.total_output}</div></div>
                      <div className="col-4"><div className="text-500 text-xs">Hadir</div><div className="font-bold text-blue-600">{item.total_hadir}</div></div>
                      <div className="col-4"><div className="text-500 text-xs">Alpa</div><div className="font-bold text-red-500">{item.total_alpa}</div></div>
                    </div>
                    <Button label="Detail" icon="pi pi-eye" size="small" className="mt-3 w-full" outlined
                      onClick={() => fetchDetailByKaryawan(item.karyawan_id)} />
                  </div>
                </div>
              ))}
            </div>

            <Card className="shadow-2">
              <DataTable value={ranking} paginator rows={10} size="small" stripedRows emptyMessage="Tidak ada data ranking">
                <Column header="Rank" style={{ width: "80px" }}
                  body={(row) => <span className="font-bold text-lg">{getRankMedal(row.rank)}</span>} />
                <Column header="Karyawan" style={{ minWidth: "180px" }} body={(row) => (
                  <div className="flex align-items-center gap-2">
                    <Avatar label={row.nama?.charAt(0)} size="normal" shape="circle"
                      style={{ background: `${getScoreColor(row.performance_score)}22`, color: getScoreColor(row.performance_score) }} />
                    <div>
                      <div className="font-semibold">{row.nama}</div>
                      <div className="text-500 text-xs">{row.departemen}</div>
                    </div>
                  </div>
                )} />
                <Column header="Score" style={{ minWidth: "200px" }} body={(row) => (
                  <div className="flex align-items-center gap-2">
                    <div className="flex-1">
                      <ProgressBar value={row.performance_score} showValue={false} style={{ height: 8, borderRadius: 4 }}
                        pt={{ value: { style: { background: getScoreColor(row.performance_score), borderRadius: 4 } } }} />
                    </div>
                    <span className="font-bold" style={{ color: getScoreColor(row.performance_score), minWidth: 32 }}>{row.performance_score}</span>
                  </div>
                )} />
                <Column header="Output" sortable sortField="total_output"
                  body={(row) => <span className="font-bold text-green-600">{row.total_output} unit</span>} />
                <Column header="Hadir"
                  body={(row) => <span className="font-bold text-blue-600">{row.total_hadir}</span>} />
                <Column header="Alpa"
                  body={(row) => <span className={`font-bold ${row.total_alpa > 0 ? "text-red-500" : "text-500"}`}>{row.total_alpa}</span>} />
                <Column header="Terlambat"
                  body={(row) => <span className={`font-bold ${row.total_terlambat > 2 ? "text-orange-500" : "text-500"}`}>{row.total_terlambat}</span>} />
                <Column header="Aksi" style={{ width: "80px" }} body={(row) => (
                  <Button icon="pi pi-eye" size="small" severity="info" tooltip="Lihat Detail" tooltipOptions={{ position: "top" }}
                    onClick={() => fetchDetailByKaryawan(row.karyawan_id)} />
                )} />
              </DataTable>
            </Card>
          </div>
        )}
      </div>

      <RekapDetailDialog
        visible={detailVisible}
        onHide={() => { setDetailVisible(false); setSelectedDetail(null); }}
        isLoading={isLoadingDetail}
        selectedDetail={selectedDetail}
        onExport={handleOpenExportFromDetail}
      />

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