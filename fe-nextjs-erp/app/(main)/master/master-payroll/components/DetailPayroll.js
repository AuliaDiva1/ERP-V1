"use client";

import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Skeleton } from "primereact/skeleton";

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

const DEPT_COLOR = {
  PRODUKSI:   "#3b82f6",
  GUDANG:     "#22c55e",
  KEUANGAN:   "#8b5cf6",
  HR:         "#f59e0b",
  SUPERADMIN: "#ef4444",
};

const getScoreColor = (s) => {
  if (s >= 90) return { bg: "#dcfce7", text: "#15803d", label: "Excellent",  glow: "#22c55e44" };
  if (s >= 75) return { bg: "#dbeafe", text: "#1d4ed8", label: "Good",       glow: "#3b82f644" };
  if (s >= 60) return { bg: "#fef9c3", text: "#a16207", label: "Average",    glow: "#f59e0b44" };
  return             { bg: "#fee2e2", text: "#b91c1c", label: "Below Avg",  glow: "#ef444444" };
};

const getStatusSeverity = (s) =>
  s === "Paid" ? "success" : s === "Approved" ? "warning" : "secondary";

// ── Row komponen gaji ─────────────────────────────────────────
const RpRow = ({ label, value, color, highlight }) => (
  <div className="flex justify-content-between align-items-center py-2"
    style={{ borderBottom: "1px solid #f1f5f9" }}>
    <span className="text-sm" style={{ color: "#64748b" }}>{label}</span>
    <span className="font-semibold text-sm" style={{ color: color || "#0f172a" }}>
      {fmt(value)}
    </span>
  </div>
);

// ── KPI card ─────────────────────────────────────────────────
const KpiCard = ({ label, value, icon, color, sub, subColor }) => (
  <div className="flex flex-column align-items-center justify-content-center p-3 border-round-xl"
    style={{ background: `${color}0f`, border: `1.5px solid ${color}22`, minHeight: 90 }}>
    <i className={`${icon} mb-2`} style={{ color, fontSize: "1.1rem" }} />
    <div className="font-bold text-xl" style={{ color: "#0f172a", lineHeight: 1 }}>{value}</div>
    <div className="text-xs font-medium mt-1" style={{ color: "#64748b" }}>{label}</div>
    {sub && <div className="text-xs font-bold mt-1" style={{ color: subColor || color }}>{sub}</div>}
  </div>
);

const DetailPayroll = ({ visible, onHide, data, loading, onApprove, onPaid, onPrint }) => {
  if (!data && !loading) return null;

  const score     = parseFloat(data?.PERFORMANCE_SCORE || 0);
  const scoreInfo = getScoreColor(score);

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal
      header={null}
      style={{ width: "800px" }}
      breakpoints={{ "960px": "95vw" }}
      contentClassName="p-0"
      pt={{ root: { style: { borderRadius: "16px", overflow: "hidden" } } }}
    >
      {loading ? (
        <div className="p-5 flex flex-column gap-3">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} height="48px" className="border-round-lg" />)}
        </div>
      ) : data ? (
        <div>

          {/* ── Header ── */}
          <div className="px-5 pt-5 pb-4"
            style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1a365d 100%)" }}>
            <div className="flex align-items-start justify-content-between gap-3">
              <div className="flex align-items-center gap-3">
                <Avatar
                  label={data.NAMA?.charAt(0)}
                  size="xlarge"
                  shape="circle"
                  style={{
                    background: `${DEPT_COLOR[data.DEPARTEMEN] || "#94a3b8"}33`,
                    color: "white",
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    border: "2px solid rgba(255,255,255,0.2)",
                  }}
                />
                <div>
                  <div className="font-bold text-white mb-1" style={{ fontSize: "1.3rem" }}>{data.NAMA}</div>
                  <div className="flex align-items-center gap-2 flex-wrap">
                    <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>
                      {data.JABATAN_SNAPSHOT || data.JABATAN}
                    </span>
                    <span className="text-xs px-2 py-1 border-round-lg font-bold"
                      style={{ background: `${DEPT_COLOR[data.DEPARTEMEN] || "#94a3b8"}33`, color: "white" }}>
                      {data.DEPARTEMEN_SNAPSHOT || data.DEPARTEMEN}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Tag value={data.STATUS} severity={getStatusSeverity(data.STATUS)} rounded />
                    <Tag
                      value={data.SUMBER_GAJI === "Override" ? "Gaji Override" : "Gaji Default Jabatan"}
                      severity={data.SUMBER_GAJI === "Override" ? "warning" : "info"}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-column align-items-end gap-2">
                <button onClick={onHide}
                  style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8,
                    width: 32, height: 32, cursor: "pointer", color: "white", fontSize: 18, lineHeight: "32px" }}>
                  ×
                </button>
                <div className="text-right">
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", marginBottom: 2 }}>PERIODE</div>
                  <div className="font-bold text-white">
                    {data.PERIODE
                      ? new Date(data.PERIODE).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
                      : "—"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", marginTop: 2 }}>
                    {data.KODE_PAYROLL}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4" style={{ background: "#f8fafc" }}>

            {/* ── Score & KPI ── */}
            <div className="surface-0 border-round-xl shadow-1 p-4 mb-3"
              style={{ border: "1px solid #e2e8f0" }}>
              <div className="flex align-items-center gap-2 mb-3">
                <i className="pi pi-chart-bar text-primary" />
                <span className="font-bold text-xs uppercase" style={{ color: "#475569", letterSpacing: "0.08em" }}>
                  Kinerja &amp; Kehadiran
                </span>
              </div>
              <div className="grid" style={{ gap: 0 }}>
                {/* Score */}
                <div className="col-12 md:col-3 pr-3">
                  <div className="flex flex-column align-items-center justify-content-center border-round-xl p-4 h-full"
                    style={{ background: scoreInfo.bg, border: `2px solid ${scoreInfo.text}22`,
                      boxShadow: `0 0 20px ${scoreInfo.glow}` }}>
                    <div className="text-xs font-bold uppercase mb-2" style={{ color: scoreInfo.text, letterSpacing: "0.08em" }}>
                      Performance Score
                    </div>
                    <div className="font-bold" style={{ fontSize: "3.5rem", color: scoreInfo.text, lineHeight: 1 }}>
                      {score.toFixed(0)}
                    </div>
                    <div className="font-bold mt-2 text-sm" style={{ color: scoreInfo.text }}>{scoreInfo.label}</div>
                    <div className="mt-1 text-xs" style={{ color: "#94a3b8" }}>
                      Bonus: {data.BONUS_PERSEN_DIPAKAI || 0}%
                    </div>
                  </div>
                </div>

                {/* KPI Grid */}
                <div className="col-12 md:col-9">
                  <div className="grid" style={{ gap: 0 }}>
                    <div className="col-6 md:col-4 p-1">
                      <KpiCard label="Hari Kerja"    value={data.HARI_KERJA_NORMAL || 0}
                        icon="pi pi-calendar" color="#6366f1" />
                    </div>
                    <div className="col-6 md:col-4 p-1">
                      <KpiCard label="Hadir"         value={data.HARI_HADIR || 0}
                        icon="pi pi-check-circle" color="#22c55e" />
                    </div>
                    <div className="col-6 md:col-4 p-1">
                      {/* FIX: pakai POTONGAN_ALPA langsung dari backend, bukan hitung ulang */}
                      <KpiCard label="Alpa"          value={data.HARI_ALPA || 0}
                        icon="pi pi-times-circle" color="#ef4444"
                        sub={data.HARI_ALPA > 0 ? `Potong: ${fmt(data.POTONGAN_ALPA)}` : null}
                        subColor="#ef4444" />
                    </div>
                    <div className="col-6 md:col-4 p-1">
                      <KpiCard label="Terlambat"     value={`${data.TOTAL_KEJADIAN_TERLAMBAT || 0}x`}
                        icon="pi pi-clock" color="#f59e0b"
                        sub={`${data.TOTAL_TERLAMBAT_MENIT || 0} menit`} />
                    </div>
                    <div className="col-6 md:col-4 p-1">
                      <KpiCard label="Total Logbook" value={data.TOTAL_LOGBOOK_APPROVED || 0}
                        icon="pi pi-book" color="#8b5cf6" sub="Disetujui" />
                    </div>
                    <div className="col-6 md:col-4 p-1">
                      <KpiCard label="Total Output"  value={parseFloat(data.TOTAL_OUTPUT || 0).toFixed(2)}
                        icon="pi pi-box" color="#0ea5e9"
                        sub={`${data.TOTAL_JAM_PRODUKTIF || 0} jam`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Komponen Gaji ── */}
            <div className="grid mb-3">
              {/* Pendapatan */}
              <div className="col-12 md:col-6 pr-2">
                <div className="surface-0 border-round-xl shadow-1 p-4 h-full"
                  style={{ border: "1px solid #e2e8f0", borderTop: "3px solid #22c55e" }}>
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-plus-circle text-green-500" />
                    <span className="font-bold text-xs uppercase" style={{ color: "#475569", letterSpacing: "0.08em" }}>
                      Komponen Pendapatan
                    </span>
                  </div>
                  <RpRow label="Gaji Pokok"          value={data.GAJI_POKOK} />
                  <RpRow label="Tunjangan Transport" value={data.TUNJANGAN_TRANSPORT} />
                  <RpRow label="Tunjangan Makan"     value={data.TUNJANGAN_MAKAN} />
                  <RpRow label="Tunjangan Jabatan"   value={data.TUNJANGAN_JABATAN} />
                  <RpRow label="Tunjangan Lainnya"   value={data.TUNJANGAN_LAINNYA} />
                  <RpRow label={`Bonus Kinerja (${data.BONUS_PERSEN_DIPAKAI || 0}%)`}
                    value={data.BONUS_KINERJA} color="#16a34a" />
                  <div className="flex justify-content-between align-items-center pt-3 mt-2"
                    style={{ borderTop: "2px solid #e2e8f0" }}>
                    <span className="font-bold text-sm" style={{ color: "#374151" }}>Total Pendapatan</span>
                    <span className="font-bold text-lg" style={{ color: "#16a34a" }}>{fmt(data.TOTAL_PENDAPATAN)}</span>
                  </div>
                </div>
              </div>

              {/* Potongan */}
              <div className="col-12 md:col-6 pl-2">
                <div className="surface-0 border-round-xl shadow-1 p-4 h-full"
                  style={{ border: "1px solid #e2e8f0", borderTop: "3px solid #ef4444" }}>
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-minus-circle text-red-500" />
                    <span className="font-bold text-xs uppercase" style={{ color: "#475569", letterSpacing: "0.08em" }}>
                      Komponen Potongan
                    </span>
                  </div>
                  <RpRow label={`Terlambat (${data.TOTAL_TERLAMBAT_MENIT || 0} mnt)`}
                    value={data.POTONGAN_TERLAMBAT} color="#ea580c" />
                  {/* FIX: label alpa pakai HARI_ALPA, value pakai POTONGAN_ALPA dari backend */}
                  <RpRow label={`Alpa (${data.HARI_ALPA || 0} hari)`}
                    value={data.POTONGAN_ALPA} color="#dc2626" />
                  <RpRow label="BPJS Kesehatan"  value={data.POTONGAN_BPJS_KESEHATAN} />
                  <RpRow label="BPJS TK"         value={data.POTONGAN_BPJS_TK} />
                  <RpRow label="PPh21"           value={data.POTONGAN_PPH21} />
                  <div className="flex justify-content-between align-items-center pt-3 mt-2"
                    style={{ borderTop: "2px solid #e2e8f0" }}>
                    <span className="font-bold text-sm" style={{ color: "#374151" }}>Total Potongan</span>
                    <span className="font-bold text-lg" style={{ color: "#dc2626" }}>{fmt(data.TOTAL_POTONGAN)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Take Home Pay ── */}
            <div className="border-round-xl p-4 mb-4 text-center"
              style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
                border: "2px solid #d4af37", boxShadow: "0 4px 24px rgba(212,175,55,0.15)" }}>
              <div className="font-bold uppercase mb-1"
                style={{ color: "#d4af37", fontSize: "0.7rem", letterSpacing: "0.15em" }}>
                Take Home Pay
              </div>
              <div className="font-bold text-white" style={{ fontSize: "2.4rem", letterSpacing: "-0.02em" }}>
                {fmt(data.TAKE_HOME_PAY)}
              </div>
              <div className="mt-1" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem" }}>
                {data.PERIODE
                  ? new Date(data.PERIODE).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
                  : "—"} · {data.NAMA}
              </div>
            </div>

            {/* ── Aksi ── */}
            <div className="flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="flex gap-2 flex-wrap">
                {data.STATUS === "Draft" && (
                  <Button label="Approve" icon="pi pi-check" severity="success"
                    onClick={() => onApprove(data)} />
                )}
                {data.STATUS === "Approved" && (
                  <Button label="Tandai Dibayar" icon="pi pi-wallet" severity="info"
                    onClick={() => onPaid(data)} />
                )}
                <Button label="Cetak Slip" icon="pi pi-print" severity="secondary" outlined
                  disabled={data.STATUS === "Draft"}
                  onClick={() => onPrint(data)} />
              </div>
              <Button label="Tutup" icon="pi pi-times" outlined severity="secondary" onClick={onHide} />
            </div>

          </div>
        </div>
      ) : null}
    </Dialog>
  );
};

export default DetailPayroll;
