"use client";

import { useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressBar } from "primereact/progressbar";
import { Divider } from "primereact/divider";

// ─── Helpers ────────────────────────────────────────────────

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

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const formatTime = (t) => (t ? String(t).substring(0, 5) : "-");

// ─── Sub-components ─────────────────────────────────────────

const StatBox = ({ label, value, color }) => (
  <div className="col-6 mb-2">
    <div
      className="flex align-items-center justify-content-between p-2 border-round"
      style={{ background: `${color}11`, border: `1px solid ${color}33` }}
    >
      <span className="text-600 text-sm">{label}</span>
      <span className="font-bold" style={{ color }}>
        {value ?? 0}
      </span>
    </div>
  </div>
);

const ProdRow = ({ icon, label, value, color }) => (
  <div
    className="flex align-items-center justify-content-between p-2 border-round border-1 surface-border mb-2"
    style={{ background: `${color}08` }}
  >
    <div className="flex align-items-center gap-2">
      <div
        className="flex align-items-center justify-content-center border-round"
        style={{
          width: 28,
          height: 28,
          background: `${color}22`,
        }}
      >
        <i className={`${icon} text-sm`} style={{ color }} />
      </div>
      <span className="text-600 text-sm">{label}</span>
    </div>
    <span className="font-bold text-900">{value ?? 0}</span>
  </div>
);

// ─── Attendance Badge Ring ───────────────────────────────────

const AttendanceRing = ({ hadir, alpa, izin, sakit, cuti, total }) => {
  const segments = [
    { label: "Hadir", value: hadir, color: "#22c55e" },
    { label: "Alpa", value: alpa, color: "#ef4444" },
    { label: "Izin", value: izin, color: "#3b82f6" },
    { label: "Sakit", value: sakit, color: "#f59e0b" },
    { label: "Cuti", value: cuti, color: "#8b5cf6" },
  ];

  return (
    <div className="flex flex-column gap-2 mt-3">
      {segments.map((seg) => (
        <div key={seg.label}>
          <div className="flex justify-content-between align-items-center mb-1">
            <div className="flex align-items-center gap-2">
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: seg.color,
                }}
              />
              <span className="text-600 text-xs">{seg.label}</span>
            </div>
            <span className="font-bold text-sm" style={{ color: seg.color }}>
              {seg.value ?? 0}
            </span>
          </div>
          <ProgressBar
            value={total ? Math.round(((seg.value ?? 0) / total) * 100) : 0}
            showValue={false}
            style={{ height: 6, borderRadius: 4 }}
            pt={{
              value: {
                style: { background: seg.color, borderRadius: 4 },
              },
            }}
          />
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────

/**
 * RekapDetailDialog
 *
 * Props:
 *  - visible: boolean
 *  - onHide: () => void
 *  - isLoading: boolean
 *  - selectedDetail: object | null  (shape dari API /rekapitulasi-kinerja/karyawan/:id)
 *  - onExport: (detail) => void     (trigger export dialog)
 */
export default function RekapDetailDialog({
  visible,
  onHide,
  isLoading,
  selectedDetail,
  onExport,
}) {
  const score = selectedDetail?.summary?.performance_score ?? 0;
  const scoreColor = getScoreColor(score);
  const scoreInfo = getScoreLabel(score);

  const headerContent = selectedDetail ? (
    <div className="flex align-items-center gap-3">
      <Avatar
        label={selectedDetail.karyawan?.NAMA?.charAt(0)}
        size="large"
        shape="circle"
        style={{
          background: `${scoreColor}22`,
          color: scoreColor,
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      />
      <div>
        <div className="font-bold text-900 text-lg">
          {selectedDetail.karyawan?.NAMA}
        </div>
        <div className="text-500 text-xs mt-1">
          {selectedDetail.karyawan?.DEPARTEMEN} ·{" "}
          {selectedDetail.karyawan?.JABATAN}
        </div>
      </div>
    </div>
  ) : (
    <span>Memuat...</span>
  );

  const footerContent = selectedDetail && (
    <div className="flex justify-content-between align-items-center">
      <span className="text-500 text-xs">
        Periode: {formatDate(selectedDetail.periode?.start)} –{" "}
        {formatDate(selectedDetail.periode?.end)}
      </span>
      <div className="flex gap-2">
        <Button
          label="Export Excel"
          icon="pi pi-file-excel"
          severity="success"
          size="small"
          outlined
          onClick={() => onExport?.(selectedDetail, "excel")}
        />
        <Button
          label="Cetak PDF"
          icon="pi pi-file-pdf"
          severity="danger"
          size="small"
          outlined
          onClick={() => onExport?.(selectedDetail, "pdf")}
        />
        <Button
          label="Tutup"
          icon="pi pi-times"
          severity="secondary"
          size="small"
          onClick={onHide}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      header={headerContent}
      footer={footerContent}
      visible={visible}
      style={{ width: "980px", maxWidth: "95vw" }}
      modal
      onHide={onHide}
      dismissableMask
      className="rekap-detail-dialog"
    >
      {/* Loading */}
      {isLoading && (
        <div className="flex flex-column align-items-center justify-content-center py-8 gap-3">
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "4px solid var(--primary-color)",
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p className="text-500 text-sm">Memuat data karyawan...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Content */}
      {!isLoading && selectedDetail && (
        <div className="pb-2">
          {/* Score Hero Banner */}
          <div
            className="border-round-xl p-4 mb-4 flex align-items-center justify-content-between flex-wrap gap-3"
            style={{
              background: `linear-gradient(135deg, ${scoreColor}18 0%, ${scoreColor}08 100%)`,
              border: `1.5px solid ${scoreColor}33`,
            }}
          >
            <div className="flex gap-2 flex-wrap">
              <Chip
                label={selectedDetail.karyawan?.NIK}
                icon="pi pi-id-card"
                className="text-xs"
              />
              <Chip
                label={selectedDetail.karyawan?.EMAIL}
                icon="pi pi-envelope"
                className="text-xs"
              />
              {selectedDetail.karyawan?.SHIFT && (
                <Chip
                  label={`Shift: ${selectedDetail.karyawan.SHIFT}`}
                  icon="pi pi-clock"
                  className="text-xs"
                />
              )}
              <Chip
                label={`${selectedDetail.periode?.total_hari ?? 0} hari`}
                icon="pi pi-calendar"
                className="text-xs"
              />
            </div>

            {/* Score display */}
            <div className="flex align-items-center gap-4">
              {/* Attendance ratio */}
              <div className="text-center hidden md:block">
                <div className="text-500 text-xs mb-1">Tingkat Kehadiran</div>
                <div className="font-bold text-2xl text-900">
                  {selectedDetail.summary?.presensi?.total_hari_kerja
                    ? Math.round(
                        ((selectedDetail.summary.presensi.hadir ?? 0) /
                          selectedDetail.summary.presensi.total_hari_kerja) *
                          100
                      )
                    : 0}
                  %
                </div>
              </div>

              <Divider layout="vertical" className="hidden md:block" />

              <div className="text-center">
                <div className="text-500 text-xs mb-1 font-medium uppercase tracking-widest">
                  Performance Score
                </div>
                <div
                  className="font-black"
                  style={{
                    fontSize: "3.5rem",
                    color: scoreColor,
                    lineHeight: 1,
                    textShadow: `0 4px 24px ${scoreColor}44`,
                  }}
                >
                  {score}
                </div>
                <Tag
                  value={scoreInfo.label}
                  severity={scoreInfo.severity}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid mb-4">
            {[
              {
                icon: "pi pi-check-circle",
                color: "#22c55e",
                label: "Hari Hadir",
                value: selectedDetail.summary?.presensi?.hadir ?? 0,
              },
              {
                icon: "pi pi-times-circle",
                color: "#ef4444",
                label: "Alpa",
                value: selectedDetail.summary?.presensi?.alpa ?? 0,
              },
              {
                icon: "pi pi-box",
                color: "#f59e0b",
                label: "Total Output",
                value: `${selectedDetail.summary?.produktivitas?.total_output ?? 0} unit`,
              },
              {
                icon: "pi pi-book",
                color: "#8b5cf6",
                label: "Logbook Approved",
                value:
                  selectedDetail.summary?.produktivitas
                    ?.total_logbook_approved ?? 0,
              },
              {
                icon: "pi pi-clock",
                color: "#3b82f6",
                label: "Jam Produktif",
                value: `${selectedDetail.summary?.produktivitas?.total_jam_produktif?.toFixed(1) ?? 0} jam`,
              },
              {
                icon: "pi pi-stopwatch",
                color: "#f97316",
                label: "Terlambat",
                value: selectedDetail.summary?.presensi?.terlambat ?? 0,
              },
            ].map((kpi) => (
              <div key={kpi.label} className="col-6 md:col-4 lg:col-2">
                <div
                  className="border-round-lg p-3 text-center"
                  style={{
                    background: `${kpi.color}0d`,
                    border: `1px solid ${kpi.color}2a`,
                  }}
                >
                  <i
                    className={`${kpi.icon} text-xl mb-2 block`}
                    style={{ color: kpi.color }}
                  />
                  <div
                    className="font-bold text-xl"
                    style={{ color: kpi.color }}
                  >
                    {kpi.value}
                  </div>
                  <div className="text-500 text-xs mt-1">{kpi.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Cards */}
          <div className="grid mb-3">
            {/* Presensi Detail */}
            <div className="col-12 md:col-5">
              <Card
                title={
                  <div className="flex align-items-center gap-2 text-base">
                    <i
                      className="pi pi-calendar-times"
                      style={{ color: "#3b82f6" }}
                    />
                    <span>Detail Presensi</span>
                  </div>
                }
                className="shadow-2 h-full"
              >
                <div className="grid">
                  <StatBox
                    label="Hadir"
                    value={selectedDetail.summary?.presensi?.hadir}
                    color="#22c55e"
                  />
                  <StatBox
                    label="Alpa"
                    value={selectedDetail.summary?.presensi?.alpa}
                    color="#ef4444"
                  />
                  <StatBox
                    label="Izin"
                    value={selectedDetail.summary?.presensi?.izin}
                    color="#3b82f6"
                  />
                  <StatBox
                    label="Sakit"
                    value={selectedDetail.summary?.presensi?.sakit}
                    color="#f59e0b"
                  />
                  <StatBox
                    label="Cuti"
                    value={selectedDetail.summary?.presensi?.cuti}
                    color="#8b5cf6"
                  />
                  <StatBox
                    label="Dinas Luar"
                    value={selectedDetail.summary?.presensi?.dinas_luar}
                    color="#06b6d4"
                  />
                  <StatBox
                    label="Terlambat"
                    value={selectedDetail.summary?.presensi?.terlambat}
                    color="#f97316"
                  />
                  <StatBox
                    label="Pulang Awal"
                    value={selectedDetail.summary?.presensi?.pulang_awal}
                    color="#ec4899"
                  />
                </div>

                <div
                  className="flex align-items-center justify-content-between p-3 border-round mt-1"
                  style={{
                    background: "var(--surface-100)",
                    borderTop: "2px solid var(--surface-200)",
                  }}
                >
                  <span className="text-600 text-sm font-semibold">
                    Total Jam Kerja
                  </span>
                  <span className="font-bold text-900">
                    {selectedDetail.summary?.presensi?.total_jam_kerja ?? 0} jam
                  </span>
                </div>

                <AttendanceRing
                  hadir={selectedDetail.summary?.presensi?.hadir}
                  alpa={selectedDetail.summary?.presensi?.alpa}
                  izin={selectedDetail.summary?.presensi?.izin}
                  sakit={selectedDetail.summary?.presensi?.sakit}
                  cuti={selectedDetail.summary?.presensi?.cuti}
                  total={selectedDetail.summary?.presensi?.total_hari_kerja}
                />
              </Card>
            </div>

            {/* Produktivitas */}
            <div className="col-12 md:col-7">
              <Card
                title={
                  <div className="flex align-items-center gap-2 text-base">
                    <i
                      className="pi pi-chart-line"
                      style={{ color: "#8b5cf6" }}
                    />
                    <span>Produktivitas</span>
                  </div>
                }
                className="shadow-2 h-full"
              >
                <ProdRow
                  icon="pi pi-check-circle"
                  label="Logbook Approved"
                  value={
                    selectedDetail.summary?.produktivitas
                      ?.total_logbook_approved
                  }
                  color="#8b5cf6"
                />
                <ProdRow
                  icon="pi pi-box"
                  label="Total Output"
                  value={`${selectedDetail.summary?.produktivitas?.total_output ?? 0} unit`}
                  color="#f59e0b"
                />
                <ProdRow
                  icon="pi pi-clock"
                  label="Total Jam Produktif"
                  value={`${selectedDetail.summary?.produktivitas?.total_jam_produktif?.toFixed(1) ?? 0} jam`}
                  color="#22c55e"
                />
                <ProdRow
                  icon="pi pi-th-large"
                  label="Batch Dikerjakan"
                  value={
                    selectedDetail.summary?.produktivitas?.batch_dikerjakan
                  }
                  color="#3b82f6"
                />

                {/* Batch list */}
                {selectedDetail.summary?.produktivitas?.batch_list?.length >
                  0 && (
                  <>
                    <Divider className="my-2" />
                    <div className="text-600 text-xs font-semibold mb-2 uppercase">
                      Batch Dikerjakan
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedDetail.summary.produktivitas.batch_list.map(
                        (b) => (
                          <Tag
                            key={b}
                            value={b}
                            severity="secondary"
                            className="text-xs"
                          />
                        )
                      )}
                    </div>
                  </>
                )}

                {/* Score Breakdown */}
                <Divider className="my-3" />
                <div className="text-600 text-xs font-semibold mb-3 uppercase">
                  Komponen Score
                </div>
                <div className="flex flex-column gap-2">
                  {[
                    {
                      label: "Base Score",
                      value: 100,
                      color: "#3b82f6",
                      max: 100,
                    },
                    {
                      label: `Pengurangan Alpa (×10)`,
                      value: -(
                        (selectedDetail.summary?.presensi?.alpa ?? 0) * 10
                      ),
                      color: "#ef4444",
                      max: 100,
                    },
                    {
                      label: `Pengurangan Terlambat (×2)`,
                      value: -(
                        (selectedDetail.summary?.presensi?.terlambat ?? 0) * 2
                      ),
                      color: "#f97316",
                      max: 100,
                    },
                    {
                      label: `Pengurangan Pulang Awal (×1)`,
                      value: -(
                        selectedDetail.summary?.presensi?.pulang_awal ?? 0
                      ),
                      color: "#ec4899",
                      max: 100,
                    },
                    {
                      label: "Score Akhir",
                      value: score,
                      color: scoreColor,
                      max: 100,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex align-items-center gap-2"
                    >
                      <span className="text-500 text-xs w-10rem flex-shrink-0">
                        {item.label}
                      </span>
                      <span
                        className="font-bold text-sm w-3rem text-right flex-shrink-0"
                        style={{ color: item.color }}
                      >
                        {item.value > 0 ? `+${item.value}` : item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Daily Data Table */}
          {selectedDetail.daily_data?.length > 0 && (
            <Card
              title={
                <div className="flex align-items-center gap-2 text-base">
                  <i
                    className="pi pi-table"
                    style={{ color: "#06b6d4" }}
                  />
                  <span>Data Harian</span>
                  <Tag
                    value={`${selectedDetail.daily_data.length} hari`}
                    severity="secondary"
                    className="text-xs ml-1"
                  />
                </div>
              }
              className="shadow-2"
            >
              <DataTable
                value={selectedDetail.daily_data}
                paginator
                rows={7}
                rowsPerPageOptions={[7, 14, 31]}
                size="small"
                stripedRows
                scrollable
                scrollHeight="320px"
              >
                <Column
                  header="Tanggal"
                  body={(row) => (
                    <span className="text-sm font-medium">
                      {formatDate(row.tanggal)}
                    </span>
                  )}
                  style={{ minWidth: "110px" }}
                />
                <Column
                  header="Status"
                  body={(row) => {
                    const s = row.presensi?.STATUS;
                    const map = {
                      Hadir: "success",
                      Alpa: "danger",
                      Izin: "info",
                      Sakit: "warning",
                      Cuti: "help",
                      "Dinas Luar": "secondary",
                    };
                    return s ? (
                      <Tag value={s} severity={map[s] || "secondary"} />
                    ) : (
                      <span className="text-400">—</span>
                    );
                  }}
                  style={{ minWidth: "90px" }}
                />
                <Column
                  header="Masuk"
                  body={(row) => (
                    <span className="text-sm text-700">
                      {formatTime(row.presensi?.JAM_MASUK)}
                    </span>
                  )}
                  style={{ minWidth: "70px" }}
                />
                <Column
                  header="Keluar"
                  body={(row) => (
                    <span className="text-sm text-700">
                      {formatTime(row.presensi?.JAM_KELUAR)}
                    </span>
                  )}
                  style={{ minWidth: "70px" }}
                />
                <Column
                  header="Terlambat"
                  body={(row) =>
                    row.presensi?.IS_TERLAMBAT ? (
                      <Tag value="Ya" severity="warning" />
                    ) : (
                      <Tag value="Tidak" severity="success" />
                    )
                  }
                  style={{ minWidth: "90px" }}
                />
                <Column
                  header="Pulang Awal"
                  body={(row) =>
                    row.presensi?.IS_PULANG_AWAL ? (
                      <Tag value="Ya" severity="danger" />
                    ) : (
                      <Tag value="Tidak" severity="success" />
                    )
                  }
                  style={{ minWidth: "100px" }}
                />
                <Column
                  header="Logbook"
                  body={(row) => (
                    <span className="font-bold text-purple-600">
                      {row.summary?.jumlah_logbook ?? 0}
                    </span>
                  )}
                  style={{ minWidth: "80px" }}
                />
                <Column
                  header="Output"
                  body={(row) => (
                    <span className="font-bold text-yellow-700">
                      {row.summary?.total_output
                        ? `${row.summary.total_output} unit`
                        : "—"}
                    </span>
                  )}
                  style={{ minWidth: "90px" }}
                />
                <Column
                  header="Jam Produktif"
                  body={(row) => (
                    <span className="text-green-700 font-semibold">
                      {row.summary?.jam_produktif
                        ? `${parseFloat(row.summary.jam_produktif).toFixed(1)} jam`
                        : "—"}
                    </span>
                  )}
                  style={{ minWidth: "110px" }}
                />
                <Column
                  header="Jam Kerja"
                  body={(row) => (
                    <span className="text-sm text-600">
                      {row.summary?.jam_kerja_presensi
                        ? `${parseFloat(row.summary.jam_kerja_presensi).toFixed(1)} jam`
                        : "—"}
                    </span>
                  )}
                  style={{ minWidth: "90px" }}
                />
              </DataTable>
            </Card>
          )}
        </div>
      )}
    </Dialog>
  );
}