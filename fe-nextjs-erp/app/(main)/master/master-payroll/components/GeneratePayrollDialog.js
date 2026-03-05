"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";

const GeneratePayrollDialog = ({
  visible,
  onHide,
  karyawanList = [],
  onGenerate,
  isLoading,
  generateResult,
}) => {
  const [mode,       setMode]       = useState("bulk");
  const [karyawanId, setKaryawanId] = useState(null);
  const [bulan,      setBulan]      = useState(null); // Date object, view="month"

  const modeOptions = [
    { label: "Semua Karyawan", value: "bulk",   icon: "pi pi-users" },
    { label: "Per Karyawan",   value: "single", icon: "pi pi-user"  },
  ];

  // Otomatis hitung start & end dari bulan yang dipilih
  const getDateRange = (date) => {
    if (!date) return { startDate: null, endDate: null, label: null };
    const d         = new Date(date);
    const year      = d.getFullYear();
    const month     = d.getMonth(); // 0-based
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    // Hari terakhir bulan
    const lastDay   = new Date(year, month + 1, 0).getDate();
    const endDate   = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const label     = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    return { startDate, endDate, label };
  };

  const { startDate, endDate, label } = getDateRange(bulan);

  const canSubmit = bulan && (mode === "bulk" || karyawanId);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onGenerate({ mode, karyawanId, startDate, endDate });
  };

  // Reset state saat dialog dibuka ulang
  const handleHide = () => {
    if (!isLoading) {
      setMode("bulk");
      setKaryawanId(null);
      setBulan(null);
      onHide();
    }
  };

  const berhasil = generateResult?.filter((r) => r.status === "success").length || 0;
  const dilewati = generateResult?.filter((r) => r.status === "skipped").length  || 0;

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      modal
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-cog text-primary text-xl" />
          <span className="font-bold text-900">Generate Payroll</span>
        </div>
      }
      style={{ width: "560px" }}
      className="p-fluid"
      footer={
        !generateResult ? (
          <div className="flex justify-content-end gap-2">
            <Button
              label="Batal"
              icon="pi pi-times"
              outlined
              severity="secondary"
              onClick={handleHide}
              disabled={isLoading}
            />
            <Button
              label={isLoading ? "Memproses..." : "Generate Payroll"}
              icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-play"}
              onClick={handleSubmit}
              disabled={!canSubmit || isLoading}
            />
          </div>
        ) : (
          <div className="flex justify-content-end">
            <Button
              label="Tutup"
              icon="pi pi-times"
              outlined
              severity="secondary"
              onClick={handleHide}
            />
          </div>
        )
      }
    >
      {/* ── Hasil Generate ── */}
      {generateResult ? (
        <div className="pt-2">
          <div className="flex flex-column align-items-center p-4 surface-50 border-round-xl mb-4">
            <i className="pi pi-check-circle text-green-500 mb-2" style={{ fontSize: "3rem" }} />
            <div className="font-bold text-xl text-900 mb-1">Generate Selesai!</div>
            <div className="text-500 text-sm">Payroll {label || "bulan ini"} telah diproses</div>
          </div>

          <div className="grid mb-4">
            <div className="col-6">
              <div className="surface-0 border-round-xl p-3 shadow-1 text-center" style={{ borderLeft: "4px solid #22c55e" }}>
                <div className="font-bold text-2xl text-green-600">{berhasil}</div>
                <div className="text-xs text-500 mt-1 font-medium">Berhasil Dibuat</div>
              </div>
            </div>
            <div className="col-6">
              <div className="surface-0 border-round-xl p-3 shadow-1 text-center" style={{ borderLeft: "4px solid #f59e0b" }}>
                <div className="font-bold text-2xl text-yellow-600">{dilewati}</div>
                <div className="text-xs text-500 mt-1 font-medium">Dilewati / Sudah Ada</div>
              </div>
            </div>
          </div>

          <div className="max-h-15rem overflow-y-auto">
            {generateResult.map((r) => (
              <div
                key={r.karyawan_id || r.nama}
                className="flex align-items-center justify-content-between p-2 border-round mb-1"
                style={{ background: r.status === "success" ? "#f0fdf4" : "#fefce8" }}
              >
                <div className="flex align-items-center gap-2">
                  <i className={`pi ${r.status === "success" ? "pi-check text-green-500" : "pi-info-circle text-yellow-500"}`} />
                  <span className="text-sm text-900 font-medium">{r.nama}</span>
                </div>
                {r.status === "skipped"
                  ? <span className="text-xs text-yellow-600">{r.reason?.includes("sudah ada") ? "Sudah ada" : r.reason}</span>
                  : <Tag value="Dibuat" severity="success" className="text-xs" />
                }
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-2">

          {/* Mode */}
          <div className="field mb-4">
            <label className="font-bold text-sm text-700 mb-2 block">Mode Generate</label>
            <div className="flex gap-2">
              {modeOptions.map((opt) => (
                <div
                  key={opt.value}
                  className="flex-1 p-3 border-round-xl border-2 cursor-pointer text-center transition-all transition-duration-200"
                  style={{
                    borderColor: mode === opt.value ? "var(--primary-color)" : "var(--surface-border)",
                    background:  mode === opt.value ? "var(--primary-color)11" : "var(--surface-card)",
                  }}
                  onClick={() => { setMode(opt.value); setKaryawanId(null); }}
                >
                  <i
                    className={`${opt.icon} block text-xl mb-1`}
                    style={{ color: mode === opt.value ? "var(--primary-color)" : "var(--text-color-secondary)" }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: mode === opt.value ? "var(--primary-color)" : "var(--text-color)" }}
                  >
                    {opt.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Karyawan (jika single) */}
          {mode === "single" && (
            <div className="field mb-4">
              <label className="font-bold text-sm text-700 mb-2 block">
                Karyawan <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={karyawanId}
                options={karyawanList}
                onChange={(e) => setKaryawanId(e.value)}
                placeholder="Pilih karyawan..."
                filter
                showClear
                className="w-full"
              />
            </div>
          )}

          {/* Pilih Bulan — otomatis hitung start & end */}
          <div className="field mb-4">
            <label className="font-bold text-sm text-700 mb-2 block">
              Bulan Penggajian <span className="text-red-500">*</span>
            </label>
            <Calendar
              value={bulan}
              onChange={(e) => setBulan(e.value)}
              view="month"           // ← pilih bulan saja, tidak perlu range manual
              dateFormat="MM yy"
              showIcon
              placeholder="Pilih bulan..."
              className="w-full"
              showButtonBar
            />
            {/* Preview otomatis start - end */}
            {bulan && (
              <div className="mt-2 p-3 surface-50 border-round border-1 border-200">
                <div className="flex align-items-center gap-2 mb-1">
                  <i className="pi pi-calendar text-primary text-sm" />
                  <span className="text-sm font-bold text-700">{label}</span>
                </div>
                <div className="text-xs text-500">
                  Periode: <strong>{startDate}</strong> s/d <strong>{endDate}</strong>
                </div>
              </div>
            )}
          </div>

          <Message
            severity="info"
            className="w-full"
            text={
              mode === "bulk"
                ? "Generate akan memproses semua karyawan aktif. Payroll yang sudah ada di bulan ini akan dilewati."
                : "Generate untuk satu karyawan. Jika sudah ada di bulan ini, proses akan dibatalkan."
            }
          />
        </div>
      )}
    </Dialog>
  );
};

export default GeneratePayrollDialog;
