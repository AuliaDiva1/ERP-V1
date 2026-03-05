"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(n || 0);

/* ── Field dengan indikator Override / Default ── */
const OverrideField = ({ label, fieldKey, mode = "currency", suffix, defaultVal, form, setF }) => {
  const isOverridden = form[fieldKey] != null;
  const defLabel =
    mode === "currency"
      ? fmt(defaultVal || 0)
      : `${defaultVal ?? 0}${suffix || ""}`;

  return (
    <div className="col-12 md:col-6 field">
      <div className="flex align-items-center justify-content-between mb-2">
        <label className="font-medium text-sm text-700">{label}</label>
        <div className="flex align-items-center gap-1">
          {isOverridden ? (
            <>
              <Tag value="Override" severity="warning" className="text-xs" />
              <Button
                icon="pi pi-times"
                text
                size="small"
                severity="secondary"
                tooltip="Reset ke default jabatan"
                tooltipOptions={{ position: "top" }}
                onClick={() => setF(fieldKey, null)}
                style={{ width: 22, height: 22, padding: 0 }}
              />
            </>
          ) : (
            <span
              className="text-xs text-500 font-medium border-1 border-300 border-round px-2 py-1"
              style={{ maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              Default: {defLabel}
            </span>
          )}
        </div>
      </div>
      <InputNumber
        value={form[fieldKey]}
        onValueChange={(e) => setF(fieldKey, e.value ?? null)}
        placeholder={`Default: ${defLabel}`}
        mode={mode === "currency" ? "currency" : "decimal"}
        currency={mode === "currency" ? "IDR" : undefined}
        locale={mode === "currency" ? "id-ID" : undefined}
        suffix={mode !== "currency" ? suffix : undefined}
        minFractionDigits={mode === "currency" ? 0 : 2}
        className="w-full"
        pt={{
          input: {
            style: {
              background:  isOverridden ? "#fef9c322" : undefined,
              borderColor: isOverridden ? "#eab308"   : undefined,
            },
          },
        }}
      />
    </div>
  );
};

const FormOverrideGaji = ({
  visible,
  onHide,
  onSave,
  isLoading = false,
  resolvedData = null,
  loadingResolve = false,
}) => {
  const toast = useRef(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (visible && resolvedData) {
      const ov = resolvedData.override_individu || {};
      setForm({
        GAJI_POKOK:                   ov.GAJI_POKOK                   ?? null,
        TUNJANGAN_TRANSPORT:          ov.TUNJANGAN_TRANSPORT          ?? null,
        TUNJANGAN_MAKAN:              ov.TUNJANGAN_MAKAN              ?? null,
        TUNJANGAN_JABATAN:            ov.TUNJANGAN_JABATAN            ?? null,
        TUNJANGAN_LAINNYA:            ov.TUNJANGAN_LAINNYA            ?? null,
        POTONGAN_TERLAMBAT_PER_MENIT: ov.POTONGAN_TERLAMBAT_PER_MENIT ?? null,
        POTONGAN_ALPA_PER_HARI:       ov.POTONGAN_ALPA_PER_HARI       ?? null,
        BPJS_KESEHATAN_PERSEN:        ov.BPJS_KESEHATAN_PERSEN        ?? null,
        BPJS_TK_PERSEN:               ov.BPJS_TK_PERSEN               ?? null,
        BONUS_SCORE_90:               ov.BONUS_SCORE_90               ?? null,
        BONUS_SCORE_75:               ov.BONUS_SCORE_75               ?? null,
        BONUS_SCORE_60:               ov.BONUS_SCORE_60               ?? null,
        CATATAN:                      ov.CATATAN                      || "",
      });
    }
  }, [visible, resolvedData]);

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const countOverrides = Object.keys(form).filter(
    (k) => !["CATATAN"].includes(k) && form[k] != null
  ).length;

  const def = resolvedData?.default_jabatan || {};
  const kar = resolvedData?.karyawan        || {};

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-user-edit text-primary text-xl" />
          <div>
            <span className="font-bold text-900 block">Override Komponen Gaji</span>
            {kar.NAMA && (
              <span className="text-500 text-xs block">
                {kar.NAMA} — {kar.JABATAN} · {kar.DEPARTEMEN}
              </span>
            )}
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "95vw", maxWidth: "780px" }}
      modal
      onHide={onHide}
      closable={!isLoading}
      className="p-fluid"
    >
      <Toast ref={toast} position="top-center" />

      {loadingResolve ? (
        <div className="flex flex-column gap-3 py-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="48px" className="border-round" />
          ))}
        </div>
      ) : resolvedData ? (
        <div className="grid pt-2">

          {/* Info banner */}
          <div className="col-12">
            <div className="surface-50 border-1 surface-border border-round p-3 flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
              <div className="flex align-items-center gap-2 text-sm text-600">
                <i className="pi pi-info-circle text-blue-500" />
                <span>
                  Sumber gaji saat ini:{" "}
                  <strong>{resolvedData.sumber_gaji}</strong>
                </span>
                {resolvedData.default_jabatan ? (
                  <Tag
                    value={`Default jabatan: ${fmt(resolvedData.default_jabatan.GAJI_POKOK)}`}
                    severity="secondary"
                    className="text-xs"
                  />
                ) : (
                  <Tag value="Belum ada di master jabatan" severity="danger" className="text-xs" />
                )}
              </div>
              {countOverrides > 0 && (
                <Tag value={`${countOverrides} field di-override`} severity="warning" />
              )}
            </div>
            <Message
              severity="warn"
              className="w-full mb-1"
              text={`Field yang dikosongkan (NULL) otomatis menggunakan default jabatan "${kar.JABATAN}". Isi hanya field yang ingin di-override.`}
            />
          </div>

          {/* Pendapatan */}
          <div className="col-12">
            <div className="text-500 text-xs font-bold uppercase mb-3 mt-1 flex align-items-center gap-2 p-2 border-round surface-50">
              <i className="pi pi-plus-circle text-green-500" />
              <span>Override Pendapatan</span>
            </div>
          </div>
          <OverrideField label="Gaji Pokok"           fieldKey="GAJI_POKOK"          mode="currency" defaultVal={def.GAJI_POKOK}          form={form} setF={setF} />
          <OverrideField label="Tunjangan Transport"  fieldKey="TUNJANGAN_TRANSPORT" mode="currency" defaultVal={def.TUNJANGAN_TRANSPORT} form={form} setF={setF} />
          <OverrideField label="Tunjangan Makan"      fieldKey="TUNJANGAN_MAKAN"     mode="currency" defaultVal={def.TUNJANGAN_MAKAN}     form={form} setF={setF} />
          <OverrideField label="Tunjangan Jabatan"    fieldKey="TUNJANGAN_JABATAN"   mode="currency" defaultVal={def.TUNJANGAN_JABATAN}   form={form} setF={setF} />
          <OverrideField label="Tunjangan Lainnya"    fieldKey="TUNJANGAN_LAINNYA"   mode="currency" defaultVal={def.TUNJANGAN_LAINNYA}   form={form} setF={setF} />

          <div className="col-12"><Divider className="my-0" /></div>

          {/* Potongan */}
          <div className="col-12">
            <div className="text-500 text-xs font-bold uppercase mb-3 flex align-items-center gap-2 p-2 border-round surface-50">
              <i className="pi pi-minus-circle text-red-500" />
              <span>Override Potongan &amp; BPJS</span>
            </div>
          </div>
          <OverrideField label="Potongan Terlambat/Menit" fieldKey="POTONGAN_TERLAMBAT_PER_MENIT" mode="currency" defaultVal={def.POTONGAN_TERLAMBAT_PER_MENIT} form={form} setF={setF} />
          <OverrideField label="Potongan Alpa/Hari"       fieldKey="POTONGAN_ALPA_PER_HARI"       mode="currency" defaultVal={def.POTONGAN_ALPA_PER_HARI}       form={form} setF={setF} />
          <OverrideField label="BPJS Kesehatan (%)"       fieldKey="BPJS_KESEHATAN_PERSEN"        mode="decimal"  suffix="%"  defaultVal={def.BPJS_KESEHATAN_PERSEN}        form={form} setF={setF} />
          <OverrideField label="BPJS TK (%)"              fieldKey="BPJS_TK_PERSEN"               mode="decimal"  suffix="%"  defaultVal={def.BPJS_TK_PERSEN}               form={form} setF={setF} />

          <div className="col-12"><Divider className="my-0" /></div>

          {/* Bonus */}
          <div className="col-12">
            <div className="text-500 text-xs font-bold uppercase mb-3 flex align-items-center gap-2 p-2 border-round surface-50">
              <i className="pi pi-star text-yellow-500" />
              <span>Override Bonus Kinerja (%)</span>
            </div>
          </div>
          <OverrideField label="Bonus Score ≥ 90" fieldKey="BONUS_SCORE_90" mode="decimal" suffix="%" defaultVal={def.BONUS_SCORE_90} form={form} setF={setF} />
          <OverrideField label="Bonus Score ≥ 75" fieldKey="BONUS_SCORE_75" mode="decimal" suffix="%" defaultVal={def.BONUS_SCORE_75} form={form} setF={setF} />
          <OverrideField label="Bonus Score ≥ 60" fieldKey="BONUS_SCORE_60" mode="decimal" suffix="%" defaultVal={def.BONUS_SCORE_60} form={form} setF={setF} />

          <div className="col-12"><Divider className="my-0" /></div>

          {/* Catatan */}
          <div className="col-12 field">
            <label className="font-medium text-sm text-700 mb-2 block">
              <i className="pi pi-pencil mr-1" /> Catatan Override
            </label>
            <InputTextarea
              value={form.CATATAN || ""}
              onChange={(e) => setF("CATATAN", e.target.value)}
              rows={2}
              className="w-full"
              placeholder="Alasan override / catatan tambahan..."
              autoResize
            />
          </div>

          {/* Tombol */}
          <div className="col-12">
            <div className="flex flex-column gap-2 mt-1">
              <Button
                label={isLoading ? "Menyimpan..." : "Simpan Override"}
                icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                severity="warning"
                onClick={() => onSave(form)}
                disabled={isLoading}
                style={{ height: "44px" }}
              />
              <Button
                label="Batal"
                icon="pi pi-times"
                onClick={onHide}
                disabled={isLoading}
                outlined
                severity="secondary"
              />
            </div>
          </div>

        </div>
      ) : null}
    </Dialog>
  );
};

export default FormOverrideGaji;
