"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { InputMask } from "primereact/inputmask";
import { InputSwitch } from "primereact/inputswitch";

const FormHari = ({ visible, onHide, onSave, selectedHari }) => {
  const [hariId, setHariId] = useState(null);
  const [namaHari, setNamaHari] = useState("");
  const [urutan, setUrutan] = useState(1);
  const [jamMasuk, setJamMasuk] = useState("08:00:00");
  const [jamPulang, setJamPulang] = useState("17:00:00");
  const [isHariKerja, setIsHariKerja] = useState(true);
  const [status, setStatus] = useState("Aktif");

  useEffect(() => {
    if (selectedHari) {
      setHariId(selectedHari.HARI_ID || null);
      setNamaHari(selectedHari.NAMA_HARI || "");
      setUrutan(selectedHari.URUTAN || 1);
      setJamMasuk(selectedHari.JAM_MASUK_DEFAULT || "08:00:00");
      setJamPulang(selectedHari.JAM_PULANG_DEFAULT || "17:00:00");
      setIsHariKerja(selectedHari.IS_HARI_KERJA ?? true);
      setStatus(selectedHari.STATUS || "Aktif");
    } else {
      setHariId(null);
      setNamaHari("");
      setUrutan(1);
      setJamMasuk("08:00:00");
      setJamPulang("17:00:00");
      setIsHariKerja(true);
      setStatus("Aktif");
    }
  }, [selectedHari, visible]);

  const handleSubmit = () => {
    if (hariId === null) return alert("Kode Hari wajib diisi");
    if (!namaHari) return alert("Nama Hari wajib diisi");
    
    onSave({
      HARI_ID: hariId,
      NAMA_HARI: namaHari,
      URUTAN: urutan,
      JAM_MASUK_DEFAULT: jamMasuk,
      JAM_PULANG_DEFAULT: jamPulang,
      IS_HARI_KERJA: isHariKerja,
      STATUS: status,
    });
  };

  return (
    <Dialog
      header={selectedHari ? "Edit Data Hari" : "Tambah Data Hari"}
      visible={visible}
      style={{ width: "35vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid grid">
        <div className="field col-12">
          <label htmlFor="hariId" className="font-medium">Kode Hari</label>
          <InputNumber
            id="hariId"
            value={hariId}
            onValueChange={(e) => setHariId(e.value)}
            placeholder="Input kode numerik"
            useGrouping={false}
          />
        </div>

        <div className="field col-12">
          <label htmlFor="namaHari" className="font-medium">Nama Hari</label>
          <InputText
            id="namaHari"
            value={namaHari}
            onChange={(e) => setNamaHari(e.target.value)}
            placeholder="Contoh: Senin"
          />
        </div>

        <div className="field col-6">
          <label htmlFor="urutan" className="font-medium">Urutan Tampil</label>
          <InputNumber id="urutan" value={urutan} onValueChange={(e) => setUrutan(e.value)} min={1} />
        </div>

        <div className="field col-6 flex flex-column align-items-center justify-content-center">
          <label htmlFor="isHariKerja" className="font-medium mb-2">Hari Kerja</label>
          <InputSwitch id="isHariKerja" checked={isHariKerja} onChange={(e) => setIsHariKerja(e.value)} />
        </div>

        <div className="field col-6">
          <label htmlFor="jamMasuk" className="font-medium">Jam Masuk Default</label>
          <InputMask id="jamMasuk" value={jamMasuk} mask="99:99:99" onChange={(e) => setJamMasuk(e.value)} />
        </div>

        <div className="field col-6">
          <label htmlFor="jamPulang" className="font-medium">Jam Pulang Default</label>
          <InputMask id="jamPulang" value={jamPulang} mask="99:99:99" onChange={(e) => setJamPulang(e.value)} />
        </div>

        <div className="field col-12">
          <label htmlFor="status" className="font-medium">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={["Aktif", "Tidak Aktif"].map((s) => ({ label: s, value: s }))}
            onChange={(e) => setStatus(e.value)}
          />
        </div>

        <div className="col-12 flex justify-content-end gap-2 mt-3">
          <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
};

export default FormHari;