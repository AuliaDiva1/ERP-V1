"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Divider } from "primereact/divider";
import { ToggleButton } from "primereact/togglebutton";
import { Message } from "primereact/message";

const EMPTY_FORM = {
  JABATAN: "",
  DEPARTEMEN: "",
  GAJI_POKOK: 0,
  TUNJANGAN_TRANSPORT: 0,
  TUNJANGAN_MAKAN: 0,
  TUNJANGAN_JABATAN: 0,
  TUNJANGAN_LAINNYA: 0,
  POTONGAN_TERLAMBAT_PER_MENIT: 500,
  POTONGAN_ALPA_PER_HARI: 0,
  BPJS_KESEHATAN_PERSEN: 1.0,
  BPJS_TK_PERSEN: 2.0,
  IS_KENA_PPH21: false,
  BONUS_SCORE_90: 15,
  BONUS_SCORE_75: 10,
  BONUS_SCORE_60: 5,
  STATUS: "Aktif",
};

const DEPT_OPTS = [
  { label: "PRODUKSI",   value: "PRODUKSI"   },
  { label: "GUDANG",     value: "GUDANG"     },
  { label: "KEUANGAN",   value: "KEUANGAN"   },
  { label: "HR",         value: "HR"         },
  { label: "SUPERADMIN", value: "SUPERADMIN" },
];

const RpField = ({ label, fieldKey, required, form, setF }) => (
  <div className="col-12 md:col-6 field">
    <label className="font-medium text-sm text-700 mb-2 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <InputNumber
      value={form[fieldKey]}
      onValueChange={(e) => setF(fieldKey, e.value)}
      mode="currency"
      currency="IDR"
      locale="id-ID"
      className="w-full"
      minFractionDigits={0}
    />
  </div>
);

const PctField = ({ label, fieldKey, labelColor, form, setF }) => (
  <div className="col-12 md:col-4 field">
    <label className={`font-medium text-sm mb-2 block ${labelColor || "text-700"}`}>{label}</label>
    <InputNumber
      value={form[fieldKey]}
      onValueChange={(e) => setF(fieldKey, e.value)}
      suffix="%"
      minFractionDigits={2}
      className="w-full"
    />
  </div>
);

const FormGajiJabatan = ({ visible, onHide, onSave, editData, isLoading }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (visible) {
      if (editData) {
        setForm({
          JABATAN:                      editData.JABATAN || "",
          DEPARTEMEN:                   editData.DEPARTEMEN || "",
          GAJI_POKOK:                   parseFloat(editData.GAJI_POKOK) || 0,
          TUNJANGAN_TRANSPORT:          parseFloat(editData.TUNJANGAN_TRANSPORT) || 0,
          TUNJANGAN_MAKAN:              parseFloat(editData.TUNJANGAN_MAKAN) || 0,
          TUNJANGAN_JABATAN:            parseFloat(editData.TUNJANGAN_JABATAN) || 0,
          TUNJANGAN_LAINNYA:            parseFloat(editData.TUNJANGAN_LAINNYA) || 0,
          POTONGAN_TERLAMBAT_PER_MENIT: parseFloat(editData.POTONGAN_TERLAMBAT_PER_MENIT) || 500,
          POTONGAN_ALPA_PER_HARI:       parseFloat(editData.POTONGAN_ALPA_PER_HARI) || 0,
          BPJS_KESEHATAN_PERSEN:        parseFloat(editData.BPJS_KESEHATAN_PERSEN) || 1,
          BPJS_TK_PERSEN:               parseFloat(editData.BPJS_TK_PERSEN) || 2,
          IS_KENA_PPH21:                !!editData.IS_KENA_PPH21,
          BONUS_SCORE_90:               parseFloat(editData.BONUS_SCORE_90) || 15,
          BONUS_SCORE_75:               parseFloat(editData.BONUS_SCORE_75) || 10,
          BONUS_SCORE_60:               parseFloat(editData.BONUS_SCORE_60) || 5,
          STATUS:                       editData.STATUS || "Aktif",
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [visible, editData]);

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.JABATAN.trim()) return;
    onSave(form);
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button label="Batal" icon="pi pi-times" severity="secondary" outlined onClick={onHide} disabled={isLoading} />
      <Button
        label={isLoading ? "Menyimpan..." : editData ? "Update" : "Simpan"}
        icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-check"}
        onClick={handleSubmit}
        disabled={isLoading || !form.JABATAN.trim()}
      />
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-briefcase text-primary text-xl" />
          <span className="font-bold text-900">{editData ? "Edit Gaji Jabatan" : "Tambah Gaji Jabatan"}</span>
        </div>
      }
      visible={visible}
      style={{ width: "760px", maxWidth: "95vw" }}
      modal
      onHide={onHide}
      footer={footer}
      className="p-fluid"
    >
      <div className="grid pt-2">

        {/* Identitas */}
        <div className="col-12">
          <div className="text-500 text-xs font-bold uppercase mb-3 flex align-items-center gap-2 p-2 border-round surface-50">
            <i className="pi pi-briefcase text-blue-500" />
            <span>Identitas Jabatan</span>
          </div>
        </div>
        <div className="col-12 md:col-6 field">
          <label className="font-medium text-sm text-700 mb-2 block">
            Jabatan <span className="text-red-500">*</span>
          </label>
          <InputText
            value={form.JABATAN}
            onChange={(e) => setF("JABATAN", e.target.value)}
            placeholder="Contoh: Staff Produksi"
            className="w-full"
          />
        </div>
        <div className="col-12 md:col-6 field">
          <label className="font-medium text-sm text-700 mb-2 block">Departemen</label>
          <Dropdown
            value={form.DEPARTEMEN}
            options={DEPT_OPTS}
            onChange={(e) => setF("DEPARTEMEN", e.value)}
            placeholder="Pilih Departemen"
            className="w-full"
            showClear
          />
        </div>

        <div className="col-12"><Divider className="my-0" /></div>

        {/* Pendapatan */}
        <div className="col-12">
          <div className="text-500 text-xs font-bold uppercase mb-3 flex align-items-center gap-2 p-2 border-round surface-50">
            <i className="pi pi-plus-circle text-green-500" />
            <span>Komponen Pendapatan</span>
          </div>
        </div>
        <RpField label="Gaji Pokok"          fieldKey="GAJI_POKOK"          required form={form} setF={setF} />
        <RpField label="Tunjangan Transport" fieldKey="TUNJANGAN_TRANSPORT" form={form} setF={setF} />
        <RpField label="Tunjangan Makan"     fieldKey="TUNJANGAN_MAKAN"     form={form} setF={setF} />
        <RpField label="Tunjangan Jabatan"   fieldKey="TUNJANGAN_JABATAN"   form={form} setF={setF} />
        <RpField label="Tunjangan Lainnya"   fieldKey="TUNJANGAN_LAINNYA"   form={form} setF={setF} />

        <div className="col-12"><Divider className="my-0" /></div>

        {/* Potongan */}
        <div className="col-12">
          <div className="text-500 text-xs font-bold uppercase mb-3 flex align-items-center gap-2 p-2 border-round surface-50">
            <i className="pi pi-minus-circle text-red-500" />
            <span>Potongan &amp; BPJS</span>
          </div>
        </div>
        <RpField label="Potongan Terlambat / Menit" fieldKey="POTONGAN_TERLAMBAT_PER_MENIT" form={form} setF={setF} />
        <RpField label="Potongan Alpa / Hari"       fieldKey="POTONGAN_ALPA_PER_HARI"       form={form} setF={setF} />
        <PctField label="BPJS Kesehatan (%)" fieldKey="BPJS_KESEHATAN_PERSEN" form={form} setF={setF} />
        <PctField label="BPJS TK (%)"        fieldKey="BPJS_TK_PERSEN"        form={form} setF={setF} />
        <div className="col-12 md:col-4 field">
          <label className="font-medium text-sm text-700 mb-2 block">PPh21</label>
          <ToggleButton
            checked={form.IS_KENA_PPH21}
            onChange={(e) => setF("IS_KENA_PPH21", e.value)}
            onLabel="Kena PPh21" offLabel="Bebas PPh21"
            onIcon="pi pi-check" offIcon="pi pi-times"
            className="w-full"
          />
        </div>

        <div className="col-12"><Divider className="my-0" /></div>

        {/* Bonus */}
        <div className="col-12">
          <div className="text-500 text-xs font-bold uppercase mb-2 flex align-items-center gap-2 p-2 border-round surface-50">
            <i className="pi pi-star text-yellow-500" />
            <span>Bonus Kinerja (% dari Gaji Pokok)</span>
          </div>
          <Message severity="info" text="Bonus dihitung otomatis dari performance score rekapitulasi kinerja bulanan" className="w-full mb-3" />
        </div>
        <PctField label="Score ≥ 90 (Excellent)" fieldKey="BONUS_SCORE_90" labelColor="text-green-600"  form={form} setF={setF} />
        <PctField label="Score ≥ 75 (Good)"      fieldKey="BONUS_SCORE_75" labelColor="text-blue-600"   form={form} setF={setF} />
        <PctField label="Score ≥ 60 (Average)"   fieldKey="BONUS_SCORE_60" labelColor="text-yellow-600" form={form} setF={setF} />

        <div className="col-12"><Divider className="my-0" /></div>

        <div className="col-12 md:col-6 field">
          <label className="font-medium text-sm text-700 mb-2 block">Status</label>
          <Dropdown
            value={form.STATUS}
            options={[{ label: "Aktif", value: "Aktif" }, { label: "Nonaktif", value: "Nonaktif" }]}
            onChange={(e) => setF("STATUS", e.value)}
            className="w-full"
          />
        </div>

      </div>
    </Dialog>
  );
};

export default FormGajiJabatan;
