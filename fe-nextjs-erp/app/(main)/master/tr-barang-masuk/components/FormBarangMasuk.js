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
  masterBarang = [],
  masterGudang = [],
  masterRak = [],
  barangMasukList = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Inisialisasi sesuai struktur tabel DB (tanpa ID_MASUK karena Auto Increment)
  const [formData, setFormData] = useState({
    NO_MASUK: "",
    BARANG_KODE: null,
    KODE_GUDANG: null,
    KODE_RAK: null,
    QTY: 0.00,
    BATCH_NO: "",
    TGL_KADALUARSA: null,
  });

  // Generator No Masuk: IN-YYYYMMDD-0001
  const generateNoMasuk = () => {
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                    (today.getMonth() + 1).toString().padStart(2, '0') + 
                    today.getDate().toString().padStart(2, '0');
    
    let nextNum = 1;
    if (barangMasukList && barangMasukList.length > 0) {
      const lastNo = barangMasukList[0]?.NO_MASUK || "";
      if (lastNo.includes(dateStr)) {
        const lastSeq = parseInt(lastNo.split("-")[2], 10);
        nextNum = isNaN(lastSeq) ? 1 : lastSeq + 1;
      }
    }
    return `IN-${dateStr}-${nextNum.toString().padStart(4, "0")}`;
  };

  useEffect(() => {
    if (visible) {
      setFormData({
        NO_MASUK: generateNoMasuk(),
        BARANG_KODE: null,
        KODE_GUDANG: null,
        KODE_RAK: null,
        QTY: 0,
        BATCH_NO: "",
        TGL_KADALUARSA: null,
      });
      setErrors({});
    }
  }, [visible]);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.BARANG_KODE) newErrors.BARANG_KODE = "Wajib diisi";
    if (!formData.KODE_GUDANG) newErrors.KODE_GUDANG = "Wajib diisi";
    if (!formData.QTY || formData.QTY <= 0) newErrors.QTY = "Qty minimal 0.01";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Mapping ke format yang diterima MySQL
      const payload = {
        NO_MASUK: formData.NO_MASUK,
        BARANG_KODE: formData.BARANG_KODE,
        KODE_GUDANG: formData.KODE_GUDANG,
        KODE_RAK: formData.KODE_RAK || null, // NULL jika tidak dipilih
        QTY: parseFloat(formData.QTY), // Sesuai float(8,2)
        BATCH_NO: formData.BATCH_NO?.trim() || null,
        // Format YYYY-MM-DD untuk SQL Date
        TGL_KADALUARSA: formData.TGL_KADALUARSA 
          ? formData.TGL_KADALUARSA.toLocaleDateString('en-CA') 
          : null,
      };
      
      await onSave(payload);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Input Barang Masuk"
      visible={visible}
      style={{ width: "500px" }}
      modal
      onHide={onHide}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Batal" icon="pi pi-times" text onClick={onHide} disabled={loading} />
          <Button label="Simpan" icon="pi pi-check" loading={loading} onClick={handleSubmit} severity="success" />
        </div>
      }
    >
      <div className="p-fluid grid mt-1">
        <div className="field col-12">
          <label className="font-bold text-sm">No. Masuk</label>
          <InputText value={formData.NO_MASUK} disabled className="p-disabled bg-gray-100" />
        </div>

        <div className="field col-12">
          <label className="font-bold text-sm">Barang <span className="text-red-500">*</span></label>
          <Dropdown
            value={formData.BARANG_KODE}
            options={masterBarang}
            optionLabel="NAMA_BARANG"
            optionValue="BARANG_KODE"
            onChange={(e) => setFormData({...formData, BARANG_KODE: e.value})}
            placeholder="Cari Barang..."
            filter
            className={errors.BARANG_KODE ? "p-invalid" : ""}
          />
        </div>

        <div className="field col-6">
          <label className="font-bold text-sm">QTY <span className="text-red-500">*</span></label>
          <InputNumber
            value={formData.QTY}
            onValueChange={(e) => setFormData({...formData, QTY: e.value})}
            minFractionDigits={2}
            maxFractionDigits={2}
            placeholder="0.00"
            className={errors.QTY ? "p-invalid" : ""}
          />
        </div>

        <div className="field col-6">
          <label className="font-bold text-sm">Batch No</label>
          <InputText
            value={formData.BATCH_NO}
            onChange={(e) => setFormData({...formData, BATCH_NO: e.target.value})}
            placeholder="No. Produksi"
          />
        </div>

        <div className="field col-6">
          <label className="font-bold text-sm">Gudang <span className="text-red-500">*</span></label>
          <Dropdown
            value={formData.KODE_GUDANG}
            options={masterGudang}
            optionLabel="NAMA_GUDANG"
            optionValue="KODE_GUDANG"
            onChange={(e) => setFormData({...formData, KODE_GUDANG: e.value, KODE_RAK: null})}
            placeholder="Pilih Gudang"
          />
        </div>

        <div className="field col-6">
          <label className="font-bold text-sm">Rak (Opsional)</label>
          <Dropdown
            value={formData.KODE_RAK}
            options={masterRak?.filter(r => r.KODE_GUDANG === formData.KODE_GUDANG)}
            optionLabel="NAMA_RAK"
            optionValue="KODE_RAK"
            onChange={(e) => setFormData({...formData, KODE_RAK: e.value})}
            placeholder="Pilih Rak"
            disabled={!formData.KODE_GUDANG}
            showClear
          />
        </div>

        <div className="field col-12">
          <label className="font-bold text-sm">Tgl Kadaluarsa</label>
          <Calendar
            value={formData.TGL_KADALUARSA}
            onChange={(e) => setFormData({...formData, TGL_KADALUARSA: e.value})}
            dateFormat="dd/mm/yy"
            showIcon
            placeholder="Pilih Tanggal"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormBarangMasuk;