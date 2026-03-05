"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { ProgressBar } from "primereact/progressbar";
import { Skeleton } from "primereact/skeleton";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Chip } from "primereact/chip";
import { Message } from "primereact/message";
import ToastNotifier from "../../../../components/ToastNotifier";
import RekapExportDialog from "./components/RekapExportDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const toYMD = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

const formatTime = (t) => (t ? String(t).substring(0, 5) : "-");

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

const StatCard = ({ icon, iconColor, label, value, subValue }) => (
  <div className="surface-card border-round-xl shadow-2 p-4 flex align-items-center gap-3">
    <div className="flex align-items-center justify-content-center border-round-lg flex-shrink-0"
      style={{ width: 52, height: 52, background: `${iconColor}22` }}>
      <i className={`${icon} text-2xl`} style={{ color: iconColor }} />
    </div>
    <div>
      <div className="text-500 text-xs font-medium uppercase mb-1">{label}</div>
      <div className="text-900 font-bold text-2xl">{value}</div>
      {subValue && <div className="text-500 text-xs mt-1">{subValue}</div>}
    </div>
  </div>
);

export default function RekapitulasiKaryawanPage() {
  const router   = useRouter();
  const toastRef = useRef(null);

  const [token,     setToken]     = useState("");
  const [rekap,     setRekap]     = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── Export Dialog ─────────────────────────────────────────
  const [exportVisible,     setExportVisible]     = useState(false);
  const [exportDefaultMode, setExportDefaultMode] = useState("excel");

  const now = new Date();
  const [startDate, setStartDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [endDate,   setEndDate]   = useState(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  // ── Auth ──────────────────────────────────────────────────
  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (!t) { router.push("/"); return; }
    setToken(t);
  }, [router]);

  // ── Fetch ─────────────────────────────────────────────────
  const doFetch = async (sd, ed, t) => {
    if (!t) return;
    const sdStr = toYMD(sd);
    const edStr = toYMD(ed);
    if (!sdStr || !edStr) { toastRef.current?.showToast("01", "Tanggal tidak valid"); return; }

    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/rekapitulasi-kinerja/my`, {
        headers: { Authorization: `Bearer ${t}` },
        params : { start_date: sdStr, end_date: edStr },
      });
      if (res.data.status === "00") setRekap(res.data.data);
      else toastRef.current?.showToast("01", res.data.message || "Gagal memuat data");
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Terjadi kesalahan server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) doFetch(startDate, endDate, token);
  }, [token]); // eslint-disable-line

  const applyShortcut = (sd, ed) => {
    setStartDate(sd);
    setEndDate(ed);
    doFetch(sd, ed, token);
  };

  const shortcutOptions = [
    { label: "Bulan Ini",  getRange: () => { const n = new Date(); return { s: new Date(n.getFullYear(), n.getMonth(), 1),     e: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; } },
    { label: "Bulan Lalu", getRange: () => { const n = new Date(); return { s: new Date(n.getFullYear(), n.getMonth() - 1, 1), e: new Date(n.getFullYear(), n.getMonth(), 0) }; } },
    { label: "3 Bulan",    getRange: () => { const n = new Date(); return { s: new Date(n.getFullYear(), n.getMonth() - 2, 1), e: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; } },
    { label: "Tahun Ini",  getRange: () => { const n = new Date(); return { s: new Date(n.getFullYear(), 0, 1),                e: new Date(n.getFullYear(), 11, 31) }; } },
  ];

  const presensi      = rekap?.summary?.presensi;
  const produktivitas = rekap?.summary?.produktivitas;
  const score         = rekap?.summary?.performance_score ?? 0;
  const scoreInfo     = getScoreLabel(score);
  const scoreColor    = getScoreColor(score);

  return (
    <div className="card p-0">
      <ToastNotifier ref={toastRef} />

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-bottom-1 surface-border">
        <div className="flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-900 m-0">Rekapitulasi Kinerja Saya</h2>
            <p className="text-500 text-sm mt-1 m-0">Ringkasan performa dan produktivitas Anda</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {shortcutOptions.map((opt) => (
              <Button key={opt.label} label={opt.label} size="small" className="p-button-outlined p-button-secondary"
                onClick={() => { const r = opt.getRange(); applyShortcut(r.s, r.e); }} />
            ))}
          </div>
        </div>

        <div className="flex align-items-end gap-3 mt-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-700 mb-2">Dari Tanggal</label>
            <Calendar value={startDate} onChange={(e) => setStartDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-12rem" />
          </div>
          <div>
            <label className="block text-sm font-medium text-700 mb-2">Sampai Tanggal</label>
            <Calendar value={endDate} onChange={(e) => setEndDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-12rem" />
          </div>
          <Button label="Tampilkan" icon="pi pi-search"
            onClick={() => doFetch(startDate, endDate, token)} loading={isLoading} />
          {rekap && (
            <div className="flex gap-2">
              <Button label="Export Excel" icon="pi pi-file-excel" severity="success" className="p-button-outlined"
                onClick={() => { setExportDefaultMode("excel"); setExportVisible(true); }} />
              <Button label="Cetak PDF" icon="pi pi-file-pdf" severity="danger" className="p-button-outlined"
                onClick={() => { setExportDefaultMode("pdf"); setExportVisible(true); }} />
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid">
            {[1,2,3,4].map((i) => (
              <div key={i} className="col-12 md:col-3"><Skeleton height="100px" className="border-round-xl" /></div>
            ))}
            <div className="col-12 mt-3"><Skeleton height="300px" className="border-round-xl" /></div>
          </div>

        ) : rekap ? (
          <>
            {/* Banner presensi kosong */}
            {presensi?.total_hari_kerja === 0 && produktivitas?.total_logbook_approved > 0 && (
              <Message severity="info" className="mb-4 w-full"
                text={`Ditemukan ${produktivitas.total_logbook_approved} logbook approved, namun belum ada data presensi pada periode ini.`} />
            )}

            {/* Karyawan Hero */}
            <div className="surface-50 border-round-xl p-4 mb-4 border-1 surface-border">
              <div className="flex align-items-center gap-3 flex-wrap">
                <div className="flex align-items-center justify-content-center border-round-full bg-primary flex-shrink-0"
                  style={{ width: 56, height: 56 }}>
                  <span className="text-white font-bold text-2xl">{rekap.karyawan?.NAMA?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="text-900 font-bold text-xl">{rekap.karyawan?.NAMA}</div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Chip label={rekap.karyawan?.NIK}        icon="pi pi-id-card" />
                    <Chip label={rekap.karyawan?.DEPARTEMEN} icon="pi pi-building" />
                    <Chip label={rekap.karyawan?.JABATAN}    icon="pi pi-briefcase" />
                    {rekap.karyawan?.SHIFT && <Chip label={`Shift ${rekap.karyawan.SHIFT}`} icon="pi pi-clock" />}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-500 text-xs mb-1">Periode</div>
                  <div className="font-semibold text-700">{formatDate(rekap.periode?.start)} — {formatDate(rekap.periode?.end)}</div>
                  <div className="text-500 text-sm">{rekap.periode?.total_hari} hari data</div>
                </div>
              </div>
            </div>

            {/* Score Banner */}
            <div className="surface-card border-round-xl shadow-3 p-5 mb-4 text-center"
              style={{ background: `linear-gradient(135deg, ${scoreColor}15, ${scoreColor}05)`, border: `2px solid ${scoreColor}40` }}>
              <div className="text-500 text-sm font-medium uppercase mb-2 tracking-widest">Performance Score</div>
              <div className="font-bold mb-2"
                style={{ fontSize: "5rem", color: scoreColor, lineHeight: 1, textShadow: `0 4px 32px ${scoreColor}44` }}>
                {score}
              </div>
              <Tag value={scoreInfo.label} severity={scoreInfo.severity} className="text-sm px-3 mb-3" />
              <ProgressBar value={score} showValue={false}
                style={{ height: "12px", borderRadius: "6px", maxWidth: "400px", margin: "0 auto" }}
                pt={{ value: { style: { background: scoreColor, borderRadius: "6px" } } }} />

              {/* Score breakdown */}
              <div className="flex justify-content-center gap-3 mt-4 flex-wrap">
                {[
                  { label: "Base",         value: "+100",                                color: "#3b82f6" },
                  { label: "Alpa ×10",     value: `-${(presensi?.alpa ?? 0) * 10}`,     color: "#ef4444" },
                  { label: "Terlambat ×2", value: `-${(presensi?.terlambat ?? 0) * 2}`, color: "#f97316" },
                  { label: "Pulang Awal",  value: `-${presensi?.pulang_awal ?? 0}`,      color: "#ec4899" },
                  { label: "Score Akhir",  value: score,                                 color: scoreColor },
                ].map((item) => (
                  <div key={item.label} className="surface-50 border-round-lg px-3 py-2 border-1 surface-border text-center"
                    style={{ minWidth: "90px" }}>
                    <div className="font-bold text-lg" style={{ color: item.color }}>{item.value}</div>
                    <div className="text-500 text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid mb-4">
              <div className="col-12 md:col-3">
                <StatCard icon="pi pi-calendar-plus" iconColor="#22c55e" label="Total Hadir"
                  value={presensi?.hadir ?? 0} subValue={`dari ${presensi?.total_hari_kerja ?? 0} hari kerja`} />
              </div>
              <div className="col-12 md:col-3">
                <StatCard icon="pi pi-clock" iconColor="#3b82f6" label="Total Jam Kerja"
                  value={`${presensi?.total_jam_kerja ?? 0} jam`} subValue="Berdasarkan presensi" />
              </div>
              <div className="col-12 md:col-3">
                <StatCard icon="pi pi-check-circle" iconColor="#8b5cf6" label="Logbook Approved"
                  value={produktivitas?.total_logbook_approved ?? 0} subValue="Entri disetujui HR" />
              </div>
              <div className="col-12 md:col-3">
                <StatCard icon="pi pi-box" iconColor="#f59e0b" label="Total Output"
                  value={`${produktivitas?.total_output ?? 0} unit`}
                  subValue={`${produktivitas?.batch_dikerjakan ?? 0} batch · ${produktivitas?.total_jam_produktif?.toFixed(1) ?? 0} jam produktif`} />
              </div>
            </div>

            {/* Detail Cards */}
            <div className="grid mb-4">
              {/* Presensi */}
              <div className="col-12 md:col-6">
                <Card title={<div className="flex align-items-center gap-2"><i className="pi pi-calendar text-blue-600" /><span>Detail Presensi</span></div>}
                  className="shadow-2 h-full">
                  {presensi?.total_hari_kerja === 0 ? (
                    <div className="text-center py-4">
                      <i className="pi pi-calendar-times text-4xl text-300 mb-3 block" />
                      <p className="text-500">Belum ada data presensi</p>
                    </div>
                  ) : (
                    <div className="grid">
                      {[
                        { label: "Hadir",       value: presensi?.hadir,       color: "#22c55e" },
                        { label: "Alpa",        value: presensi?.alpa,        color: "#ef4444" },
                        { label: "Izin",        value: presensi?.izin,        color: "#3b82f6" },
                        { label: "Sakit",       value: presensi?.sakit,       color: "#f59e0b" },
                        { label: "Cuti",        value: presensi?.cuti,        color: "#8b5cf6" },
                        { label: "Dinas Luar",  value: presensi?.dinas_luar,  color: "#06b6d4" },
                        { label: "Terlambat",   value: presensi?.terlambat,   color: "#f97316" },
                        { label: "Pulang Awal", value: presensi?.pulang_awal, color: "#ec4899" },
                      ].map((item) => (
                        <div key={item.label} className="col-6 mb-2">
                          <div className="flex align-items-center justify-content-between p-2 surface-100 border-round"
                            style={{ border: `1px solid ${item.color}22` }}>
                            <span className="text-700 text-sm">{item.label}</span>
                            <span className="font-bold" style={{ color: item.color }}>{item.value ?? 0}</span>
                          </div>
                        </div>
                      ))}
                      <div className="col-12">
                        <div className="flex align-items-center justify-content-between p-3 border-round"
                          style={{ background: "var(--surface-100)", borderTop: "2px solid var(--surface-200)" }}>
                          <span className="text-600 text-sm font-semibold">Total Jam Kerja</span>
                          <span className="font-bold text-900">{presensi?.total_jam_kerja ?? 0} jam</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Produktivitas */}
              <div className="col-12 md:col-6">
                <Card title={<div className="flex align-items-center gap-2"><i className="pi pi-chart-line text-green-600" /><span>Detail Produktivitas</span></div>}
                  className="shadow-2 h-full">
                  {produktivitas?.total_logbook_approved === 0 ? (
                    <div className="text-center py-4">
                      <i className="pi pi-book text-4xl text-300 mb-3 block" />
                      <p className="text-500">Belum ada logbook approved</p>
                    </div>
                  ) : (
                    <div className="flex flex-column gap-3">
                      {[
                        { icon: "pi pi-check-circle", color: "#8b5cf6", label: "Logbook Approved", value: produktivitas?.total_logbook_approved ?? 0 },
                        { icon: "pi pi-box",          color: "#f59e0b", label: "Total Output",     value: `${produktivitas?.total_output ?? 0} unit` },
                        { icon: "pi pi-clock",        color: "#22c55e", label: "Jam Produktif",    value: `${produktivitas?.total_jam_produktif?.toFixed(1) ?? 0} jam` },
                        { icon: "pi pi-th-large",     color: "#3b82f6", label: "Batch Dikerjakan", value: produktivitas?.batch_dikerjakan ?? 0 },
                      ].map((item) => (
                        <div key={item.label} className="flex align-items-center justify-content-between p-3 surface-50 border-round border-1 surface-border">
                          <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center border-round"
                              style={{ width: 36, height: 36, background: `${item.color}22` }}>
                              <i className={`${item.icon} text-sm`} style={{ color: item.color }} />
                            </div>
                            <span className="text-700 text-sm font-medium">{item.label}</span>
                          </div>
                          <span className="font-bold text-900">{item.value}</span>
                        </div>
                      ))}
                      {produktivitas?.batch_list?.length > 0 && (
                        <div className="p-3 surface-50 border-round border-1 surface-border">
                          <div className="text-600 text-xs font-medium mb-2">Batch yang Dikerjakan:</div>
                          <div className="flex flex-wrap gap-2">
                            {produktivitas.batch_list.map((b) => <Chip key={b} label={b} className="text-xs" />)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Daily Table */}
            {rekap.daily_data?.length > 0 && (
              <Card title={
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-list text-indigo-600" />
                  <span>Data Harian</span>
                  <Tag value={`${rekap.daily_data.length} hari`} severity="secondary" className="text-xs ml-1" />
                </div>
              } className="shadow-2">
                <DataTable value={rekap.daily_data} paginator rows={10} rowsPerPageOptions={[5,10,25,31]}
                  size="small" stripedRows>
                  <Column header="Tanggal" sortable sortField="tanggal" body={(row) => (
                    <div>
                      <div className="font-medium text-sm">{formatDate(row.tanggal)}</div>
                      <div className="text-500 text-xs">{new Date(row.tanggal).toLocaleDateString("id-ID", { weekday: "long" })}</div>
                    </div>
                  )} style={{ minWidth: "130px" }} />
                  <Column header="Status" body={(row) => {
                    const s = row.presensi?.STATUS;
                    if (!s) return <span className="text-400 text-xs italic">—</span>;
                    const map = { Hadir: "success", Alpa: "danger", Izin: "info", Sakit: "warning", Cuti: "help", "Dinas Luar": "secondary" };
                    return <Tag value={s} severity={map[s] || "secondary"} />;
                  }} style={{ minWidth: "90px" }} />
                  <Column header="Masuk"  body={(row) => <span className="text-sm font-medium">{formatTime(row.presensi?.JAM_MASUK)}</span>} style={{ minWidth: "70px" }} />
                  <Column header="Keluar" body={(row) => <span className="text-sm font-medium">{formatTime(row.presensi?.JAM_KELUAR)}</span>} style={{ minWidth: "70px" }} />
                  <Column header="Jam Kerja" body={(row) => (
                    <span className="text-sm">{row.summary?.jam_kerja_presensi ? `${parseFloat(row.summary.jam_kerja_presensi).toFixed(1)} jam` : "—"}</span>
                  )} style={{ minWidth: "90px" }} />
                  <Column header="Terlambat" body={(row) => {
                    if (!row.presensi) return <span className="text-400">—</span>;
                    return row.presensi?.IS_TERLAMBAT ? <Tag value="Ya" severity="warning" /> : <Tag value="Tidak" severity="success" />;
                  }} style={{ minWidth: "90px" }} />
                  <Column header="Pulang Awal" body={(row) => {
                    if (!row.presensi) return <span className="text-400">—</span>;
                    return row.presensi?.IS_PULANG_AWAL ? <Tag value="Ya" severity="danger" /> : <Tag value="Tidak" severity="success" />;
                  }} style={{ minWidth: "100px" }} />
                  <Column header="Logbook" body={(row) => (
                    <span className={`font-bold ${(row.summary?.jumlah_logbook ?? 0) > 0 ? "text-purple-600" : "text-400"}`}>
                      {row.summary?.jumlah_logbook ?? 0}
                    </span>
                  )} style={{ minWidth: "80px" }} />
                  <Column header="Output" body={(row) => (
                    row.summary?.total_output
                      ? <span className="font-bold text-yellow-700">{row.summary.total_output} unit</span>
                      : <span className="text-400">—</span>
                  )} style={{ minWidth: "90px" }} />
                  <Column header="Jam Produktif" body={(row) => (
                    <span className="text-green-700 font-semibold">
                      {row.summary?.jam_produktif ? `${parseFloat(row.summary.jam_produktif).toFixed(1)} jam` : "—"}
                    </span>
                  )} style={{ minWidth: "110px" }} />
                </DataTable>
              </Card>
            )}
          </>

        ) : (
          <div className="text-center py-8">
            <i className="pi pi-spin pi-spinner text-4xl text-primary mb-4 block" />
            <h3 className="text-xl font-semibold text-600">Memuat data...</h3>
            <p className="text-500 mb-3">Jika tidak muncul otomatis, klik tombol di bawah</p>
            <Button label="Tampilkan Sekarang" icon="pi pi-search"
              onClick={() => doFetch(startDate, endDate, token)} loading={isLoading} />
          </div>
        )}
      </div>

      {/* ── Export Dialog ── */}
      <RekapExportDialog
        visible={exportVisible}
        onHide={() => setExportVisible(false)}
        detail={rekap}
        defaultMode={exportDefaultMode}
        exportMode="single"
      />
    </div>
  );
}