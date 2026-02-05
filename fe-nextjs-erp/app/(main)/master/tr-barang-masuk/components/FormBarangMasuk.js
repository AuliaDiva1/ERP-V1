"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormBarangMasuk = ({
  visible,
  onHide,
  onSave,
  masterBarang, // List barang dari API
  masterGudang, // List gudang
  masterRak,    // List rak
  barangMasukList, // Untuk generate NO_MASUK otomatis
}) => {
  const [noMasuk, setNoMasuk] = useState("");
  const [barangKode, setBarangKode] = useState(null);
  const [kodeGudang, setKodeGudang] = useState(null);
  const [kodeRak, setKodeRak] = useState(null);
  const [qty, setQty] = useState(0);
  const [batchNo, setBatchNo] = useState("");
  const [tglKadaluarsa, setTglKadaluarsa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Generate Nomor Masuk Otomatis: IN-YYYYMMDD-0001
  const generateNoMasuk = () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    
    if (!barangMasukList || barangMasukList.length === 0) {
      return `IN-${dateStr}-0001`;
    }

    const lastEntry = barangMasukList[0]; // Asumsi data terbaru ada di index 0
    const lastNo = lastEntry?.NO_MASUK || `IN-${dateStr}-0000`;
    const lastNum = parseInt(lastNo.split("-")[2], 10);
    const nextNum = isNaN(lastNum) ? 1 : lastNum + 1;

    return `IN-${dateStr}-${nextNum.toString().padStart(4, "0")}`;
  };

  useEffect(() => {
    if (visible) {
      setNoMasuk(generateNoMasuk());
      resetFields();
    }
  }, [visible]);

  const resetFields = () => {
    setBarangKode(null);
    setKodeGudang(null);
    setKodeRak(null);
    setQty(0);
    setBatchNo("");
    setTglKadaluarsa(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!barangKode) newErrors.barangKode = "Pilih barang terlebih dahulu";
    if (!kodeGudang) newErrors.kodeGudang = "Pilih gudang";
    if (!qty || qty <= 0) newErrors.qty = "Jumlah (Qty) harus lebih dari 0";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      NO_MASUK: noMasuk,
      BARANG_KODE: barangKode,
      KODE_GUDANG: kodeGudang,
      KODE_RAK: kodeRak,
      QTY: qty,
      BATCH_NO: batchNo.trim() || null,
      TGL_KADALUARSA: tglKadaluarsa ? tglKadaluarsa.toISOString().split('T')[0] : null,
    };

    setLoading(true);
    await onSave(payload);
    setLoading(false);
    onHide();
  };

  return (
    <Dialog
      header="Catat Barang Masuk (Manual/Bonus/Produksi)"
      visible={visible}
      style={{ width: "50vw" }}
      modal
      onHide={onHide}
      draggable={false}
    >
      <div className="p-fluid grid">
        {/* No. Masuk */}
        <div className="field col-12 md:col-6 mb-4">
          <label className="font-bold block mb-2">No. Transaksi Masuk</label>
          <InputText value={noMasuk} disabled className="p-disabled" />
        </div>

        {/* Pilih Barang */}
        <div className="field col-12 md:col-6 mb-4">
          <label className="font-bold block mb-2">Barang <span className="text-red-500">*</span></label>
          <Dropdown
            value={barangKode}
            options={masterBarang}
            optionLabel="NAMA_BARANG"
            optionValue="BARANG_KODE"
            onChange={(e) => setBarangKode(e.value)}
            placeholder="Pilih Barang"
            filter
            className={errors.barangKode ? "p-invalid" : ""}
          />
          {errors.barangKode && <small className="p-error">{errors.barangKode}</small>}
        </div>

        {/* Qty */}
        <div className="field col-12 md:col-6 mb-4">
          <label className="font-bold block mb-2">Jumlah (QTY) <span className="text-red-500">*</span></label>
          <InputNumber
            value={qty}
            onValueChange={(e) => setQty(e.value)}
            mode="decimal"
            minFractionDigits={2}
            placeholder="0.00"
            className={errors.qty ? "p-invalid" : ""}
          />
          {errors.qty && <small className="p-error">{errors.qty}</small>}
        </div>

        {/* Batch No */}
        <div className="field col-12 md:col-6 mb-4">
          <label className="font-bold block mb-2">Nomor Batch (Batch No)</label>
          <InputText
            value={batchNo}
            onChange={(e) => setBatchNo(e.target.value)}
            placeholder="Contoh: BCH-2026-001"
          />
        </div>

        {/* Gudang */}
        <div className="field col-12 md:col-4 mb-4">
          <label className="font-bold block mb-2">Gudang <span className="text-red-500">*</span></label>
          <Dropdown
            value={kodeGudang}
            options={masterGudang}
            optionLabel="NAMA_GUDANG"
            optionValue="KODE_GUDANG"
            onChange={(e) => setKodeGudang(e.value)}
            placeholder="Pilih Gudang"
            className={errors.kodeGudang ? "p-invalid" : ""}
          />
        </div>

        {/* Rak */}
        <div className="field col-12 md:col-4 mb-4">
          <label className="font-bold block mb-2">Rak (Opsional)</label>
          <Dropdown
            value={kodeRak}
            options={masterRak?.filter(r => r.KODE_GUDANG === kodeGudang)} // Filter rak berdasarkan gudang
            optionLabel="NAMA_RAK"
            optionValue="KODE_RAK"
            onChange={(e) => setKodeRak(e.value)}
            placeholder="Pilih Rak"
            disabled={!kodeGudang}
          />
        </div>

        {/* Tgl Kadaluarsa */}
        <div className="field col-12 md:col-4 mb-4">
          <label className="font-bold block mb-2">Tgl. Kadaluarsa</label>
          <Calendar
            value={tglKadaluarsa}
            onChange={(e) => setTglKadaluarsa(e.value)}
            dateFormat="dd/mm/yy"
            showIcon
            placeholder="Pilih Tanggal"
          />
        </div>

        {/* Footer Buttons */}
        <div className="col-12 flex justify-content-end gap-2 mt-4">
          <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button 
            label="Simpan Barang Masuk" 
            icon="pi pi-check" 
            loading={loading} 
            onClick={handleSubmit} 
            className="p-button-success"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormBarangMasuk;