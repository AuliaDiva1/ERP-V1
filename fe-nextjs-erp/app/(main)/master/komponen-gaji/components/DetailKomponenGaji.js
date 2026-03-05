"use client";

import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(n || 0);

const DEPT_COLOR = {
  PRODUKSI:   "#3b82f6",
  GUDANG:     "#22c55e",
  KEUANGAN:   "#8b5cf6",
  HR:         "#f59e0b",
  SUPERADMIN: "#ef4444",
};

/* Row komponen gaji */
const KomponenRow = ({ label, value, isOverride, mode = "currency", suffix }) => {
  const display = mode === "currency" ? fmt(value) : `${value ?? 0}${suffix || ""}`;
  return (
    <div className="flex align-items-center justify-content-between py-2 border-bottom-1 surface-border">
      <div className="flex align-items-center gap-2">
        <span className="text-700 text-sm">{label}</span>
        {isOverride && <Tag value="Override" severity="warning" className="text-xs" />}
      </div>
      <span className={`font-bold text-sm ${isOverride ? "text-yellow-700" : "text-900"}`}>
        {display}
      </span>
    </div>
  );
};

const DetailKomponenGaji = ({ visible, onHide, resolvedData, loading, onEdit }) => {
  const kar  = resolvedData?.karyawan         || {};
  const def  = resolvedData?.default_jabatan  || {};
  const ov   = resolvedData?.override_individu || {};

  const isOv = (field) => ov?.[field] != null;

  const pick = (field) => resolvedData?.[field] ?? def?.[field] ?? 0;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal
      header={
        <div className="flex align-items-center gap-3">
          <div className="p-2 border-round-xl shadow-2" style={{ background: "var(--primary-color)" }}>
            <i className="pi pi-user-edit text-white text-2xl" />
          </div>
          <div>
            <span className="font-bold text-2xl block text-900">Komponen Gaji Efektif</span>
            <span className="text-primary font-bold text-sm">
              {kar.NAMA || "—"} · {kar.JABATAN || "—"}
            </span>
          </div>
        </div>
      }
      style={{ width: "680px" }}
      breakpoints={{ "768px": "98vw" }}
      contentClassName="p-0 surface-200"
    >
      {loading ? (
        <div className="p-4 flex flex-column gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height="40px" className="border-round" />
          ))}
        </div>
      ) : resolvedData ? (
        <div className="p-4">

          {/* Profil */}
          <div
            className="surface-0 border-round-xl shadow-2 p-4 mb-4"
            style={{ borderTop: "4px solid var(--primary-color)" }}
          >
            <div className="flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <div className="font-bold text-xl text-900 mb-1">{kar.NAMA || "—"}</div>
                <div className="flex gap-3 text-sm text-600 flex-wrap">
                  <span className="flex align-items-center gap-1">
                    <i className="pi pi-id-card text-primary" />
                    {kar.KARYAWAN_ID}
                  </span>
                  <span className="flex align-items-center gap-1">
                    <i className="pi pi-briefcase text-primary" />
                    {kar.JABATAN || "—"}
                  </span>
                  {kar.DEPARTEMEN && (
                    <span
                      className="text-xs px-2 py-1 border-round font-medium"
                      style={{
                        background: `${DEPT_COLOR[kar.DEPARTEMEN] || "#94a3b8"}18`,
                        color:       DEPT_COLOR[kar.DEPARTEMEN] || "#64748b",
                      }}
                    >
                      {kar.DEPARTEMEN}
                    </span>
                  )}
                </div>
              </div>
              <Tag
                value={resolvedData.sumber_gaji === "Override" ? "Override Aktif" : "Default Jabatan"}
                severity={resolvedData.sumber_gaji === "Override" ? "warning" : "success"}
                icon={resolvedData.sumber_gaji === "Override" ? "pi pi-user-edit" : "pi pi-briefcase"}
              />
            </div>
          </div>

          <div className="grid">

            {/* Pendapatan */}
            <div className="col-12 md:col-6">
              <div className="surface-0 border-round-xl shadow-2 p-4 h-full">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-plus-circle text-green-500 text-lg" />
                  <span className="font-bold text-700 uppercase text-xs">Pendapatan</span>
                </div>
                <KomponenRow label="Gaji Pokok"          value={pick("GAJI_POKOK")}          isOverride={isOv("GAJI_POKOK")} />
                <KomponenRow label="Tunjangan Transport" value={pick("TUNJANGAN_TRANSPORT")} isOverride={isOv("TUNJANGAN_TRANSPORT")} />
                <KomponenRow label="Tunjangan Makan"     value={pick("TUNJANGAN_MAKAN")}     isOverride={isOv("TUNJANGAN_MAKAN")} />
                <KomponenRow label="Tunjangan Jabatan"   value={pick("TUNJANGAN_JABATAN")}   isOverride={isOv("TUNJANGAN_JABATAN")} />
                <KomponenRow label="Tunjangan Lainnya"   value={pick("TUNJANGAN_LAINNYA")}   isOverride={isOv("TUNJANGAN_LAINNYA")} />
                <Divider className="my-2" />
                <div className="flex justify-content-between align-items-center">
                  <span className="font-bold text-700">Total Pendapatan</span>
                  <span className="font-bold text-lg text-green-600">
                    {fmt(
                      [pick("GAJI_POKOK"), pick("TUNJANGAN_TRANSPORT"), pick("TUNJANGAN_MAKAN"), pick("TUNJANGAN_JABATAN"), pick("TUNJANGAN_LAINNYA")]
                        .reduce((s, v) => s + parseFloat(v || 0), 0)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Potongan & Bonus */}
            <div className="col-12 md:col-6">
              <div className="surface-0 border-round-xl shadow-2 p-4 h-full">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-minus-circle text-red-500 text-lg" />
                  <span className="font-bold text-700 uppercase text-xs">Potongan &amp; BPJS</span>
                </div>
                <KomponenRow label="Pot. Terlambat/Menit" value={pick("POTONGAN_TERLAMBAT_PER_MENIT")} isOverride={isOv("POTONGAN_TERLAMBAT_PER_MENIT")} />
                <KomponenRow label="Pot. Alpa/Hari"       value={pick("POTONGAN_ALPA_PER_HARI")}       isOverride={isOv("POTONGAN_ALPA_PER_HARI")} />
                <KomponenRow label="BPJS Kesehatan"       value={pick("BPJS_KESEHATAN_PERSEN")} isOverride={isOv("BPJS_KESEHATAN_PERSEN")} mode="decimal" suffix="%" />
                <KomponenRow label="BPJS TK"              value={pick("BPJS_TK_PERSEN")}        isOverride={isOv("BPJS_TK_PERSEN")}        mode="decimal" suffix="%" />

                <Divider className="my-2" />

                <div className="flex align-items-center gap-2 mb-3 mt-2">
                  <i className="pi pi-star text-yellow-500 text-lg" />
                  <span className="font-bold text-700 uppercase text-xs">Bonus Kinerja</span>
                </div>
                <KomponenRow label="Score ≥ 90" value={pick("BONUS_SCORE_90")} isOverride={isOv("BONUS_SCORE_90")} mode="decimal" suffix="%" />
                <KomponenRow label="Score ≥ 75" value={pick("BONUS_SCORE_75")} isOverride={isOv("BONUS_SCORE_75")} mode="decimal" suffix="%" />
                <KomponenRow label="Score ≥ 60" value={pick("BONUS_SCORE_60")} isOverride={isOv("BONUS_SCORE_60")} mode="decimal" suffix="%" />
              </div>
            </div>
          </div>

          {/* Catatan */}
          {ov?.CATATAN && (
            <div className="mt-4 surface-0 border-round-xl p-3 border-1 border-yellow-200" style={{ background: "#fefce8" }}>
              <div className="flex align-items-center gap-2 mb-1">
                <i className="pi pi-pencil text-yellow-600" />
                <span className="font-bold text-xs text-yellow-700 uppercase">Catatan Override</span>
              </div>
              <p className="m-0 text-700 text-sm italic">"{ov.CATATAN}"</p>
            </div>
          )}

          {/* Footer aksi */}
          <div className="flex justify-content-end gap-2 mt-4">
            <Button
              label="Edit Override"
              icon="pi pi-pencil"
              severity="warning"
              onClick={onEdit}
            />
            <Button label="Tutup" icon="pi pi-times" outlined severity="secondary" onClick={onHide} />
          </div>

        </div>
      ) : null}
    </Dialog>
  );
};

export default DetailKomponenGaji;
