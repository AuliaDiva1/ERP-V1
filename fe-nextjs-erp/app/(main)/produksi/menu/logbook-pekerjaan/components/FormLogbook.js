"use client";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FormLogbook = ({ visible, onHide, selectedLogbook, onSave }) => {
  const fileUploadRef = useRef(null);
  
  const [formData, setFormData] = useState({
    batch_id: "",
    tanggal: new Date(),
    jam_mulai: "",
    jam_selesai: "",
    aktivitas: "",
    deskripsi: "",
    jumlah_output: 0,
    kendala: "",
  });

  const [batchList, setBatchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchBatchList();
  }, []);

  useEffect(() => {
    if (selectedLogbook) {
      setFormData({
        batch_id: selectedLogbook.BATCH_ID || "",
        tanggal: selectedLogbook.TANGGAL ? new Date(selectedLogbook.TANGGAL) : new Date(),
        jam_mulai: selectedLogbook.JAM_MULAI || "",
        jam_selesai: selectedLogbook.JAM_SELESAI || "",
        aktivitas: selectedLogbook.AKTIVITAS || "",
        deskripsi: selectedLogbook.DESKRIPSI || "",
        jumlah_output: selectedLogbook.JUMLAH_OUTPUT || 0,
        kendala: selectedLogbook.KENDALA || "",
      });
    } else {
      resetForm();
    }
  }, [selectedLogbook, visible]);

  const fetchBatchList = async () => {
    try {
      const token = localStorage.getItem("TOKEN");
      const res = await axios.get(`${API_URL}/master-batch`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "00") {
        const options = res.data.data
          .filter(b => b.STATUS_BATCH === "In Progress" || b.STATUS_BATCH === "Pending")
          .map(b => ({
            label: `${b.BATCH_ID} - ${b.NAMA_BATCH}`,
            value: b.BATCH_ID
          }));
        setBatchList(options);
      }
    } catch (err) {
      console.error("Error fetching batch:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      batch_id: "",
      tanggal: new Date(),
      jam_mulai: "",
      jam_selesai: "",
      aktivitas: "",
      deskripsi: "",
      jumlah_output: 0,
      kendala: "",
    });
    setSelectedFile(null);
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  const handleSubmit = async () => {
    if (!formData.batch_id || !formData.tanggal || !formData.jam_mulai || !formData.aktivitas) {
      alert("Batch, Tanggal, Jam Mulai, dan Aktivitas wajib diisi!");
      return;
    }

    setLoading(true);

    const payload = new FormData();
    payload.append("batch_id", formData.batch_id);
    payload.append("tanggal", formData.tanggal.toISOString().split('T')[0]);
    payload.append("jam_mulai", formData.jam_mulai);
    payload.append("jam_selesai", formData.jam_selesai || "");
    payload.append("aktivitas", formData.aktivitas);
    payload.append("deskripsi", formData.deskripsi || "");
    payload.append("jumlah_output", formData.jumlah_output);
    payload.append("kendala", formData.kendala || "");
    
    if (selectedFile) {
      payload.append("foto_bukti", selectedFile);
    }

    await onSave(payload);
    setLoading(false);
  };

  const onFileSelect = (e) => {
    setSelectedFile(e.files[0]);
  };

  const dialogFooter = (
    <div>
      <Button
        label="Batal"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
        disabled={loading}
      />
      <Button
        label={selectedLogbook ? "Update" : "Simpan"}
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header={selectedLogbook ? "Edit Logbook" : "Tambah Logbook Baru"}
      visible={visible}
      style={{ width: "900px", maxWidth: "95vw" }}
      onHide={onHide}
      footer={dialogFooter}
      modal
      className="p-fluid"
    >
      <div className="grid">
        {/* Batch */}
        <div className="col-12 md:col-6">
          <label htmlFor="batch_id" className="font-semibold">
            Batch <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="batch_id"
            value={formData.batch_id}
            options={batchList}
            onChange={(e) => setFormData({ ...formData, batch_id: e.value })}
            placeholder="Pilih Batch"
            className="mt-2"
            filter
            filterBy="label"
            disabled={!!selectedLogbook}
          />
        </div>

        {/* Tanggal */}
        <div className="col-12 md:col-6">
          <label htmlFor="tanggal" className="font-semibold">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <Calendar
            id="tanggal"
            value={formData.tanggal}
            onChange={(e) => setFormData({ ...formData, tanggal: e.value })}
            dateFormat="dd/mm/yy"
            placeholder="Pilih Tanggal"
            className="mt-2"
            showIcon
          />
        </div>

        {/* Jam Mulai */}
        <div className="col-12 md:col-6">
          <label htmlFor="jam_mulai" className="font-semibold">
            Jam Mulai <span className="text-red-500">*</span>
          </label>
          <InputText
            id="jam_mulai"
            type="time"
            value={formData.jam_mulai}
            onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
            placeholder="HH:MM"
            className="mt-2"
          />
        </div>

        {/* Jam Selesai */}
        <div className="col-12 md:col-6">
          <label htmlFor="jam_selesai" className="font-semibold">
            Jam Selesai
          </label>
          <InputText
            id="jam_selesai"
            type="time"
            value={formData.jam_selesai}
            onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
            placeholder="HH:MM"
            className="mt-2"
          />
        </div>

        {/* Jumlah Output */}
        <div className="col-12 md:col-6">
          <label htmlFor="jumlah_output" className="font-semibold">
            Jumlah Output
          </label>
          <InputNumber
            id="jumlah_output"
            value={formData.jumlah_output}
            onValueChange={(e) => setFormData({ ...formData, jumlah_output: e.value })}
            placeholder="0"
            min={0}
            mode="decimal"
            minFractionDigits={0}
            maxFractionDigits={2}
            suffix=" unit"
            className="mt-2"
          />
        </div>

        {/* Foto Bukti */}
        <div className="col-12 md:col-6">
          <label htmlFor="foto_bukti" className="font-semibold">
            Foto Bukti (Opsional)
          </label>
          <FileUpload
            ref={fileUploadRef}
            name="foto_bukti"
            accept="image/*"
            maxFileSize={5000000}
            onSelect={onFileSelect}
            onClear={() => setSelectedFile(null)}
            chooseLabel="Pilih Foto"
            uploadLabel="Upload"
            cancelLabel="Batal"
            className="mt-2"
            auto={false}
            mode="basic"
          />
          {selectedLogbook?.FOTO_BUKTI && !selectedFile && (
            <small className="text-500 mt-1 block">
              Foto saat ini: {selectedLogbook.FOTO_BUKTI.split('/').pop()}
            </small>
          )}
        </div>

        {/* Aktivitas */}
        <div className="col-12">
          <label htmlFor="aktivitas" className="font-semibold">
            Aktivitas <span className="text-red-500">*</span>
          </label>
          <InputText
            id="aktivitas"
            value={formData.aktivitas}
            onChange={(e) => setFormData({ ...formData, aktivitas: e.target.value })}
            placeholder="Contoh: Assembling meja kayu"
            className="mt-2"
            maxLength={500}
          />
        </div>

        {/* Deskripsi */}
        <div className="col-12">
          <label htmlFor="deskripsi" className="font-semibold">
            Deskripsi Detail
          </label>
          <InputTextarea
            id="deskripsi"
            value={formData.deskripsi}
            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            rows={3}
            placeholder="Deskripsi detail pekerjaan yang dilakukan..."
            className="mt-2"
          />
        </div>

        {/* Kendala */}
        <div className="col-12">
          <label htmlFor="kendala" className="font-semibold">
            Kendala (jika ada)
          </label>
          <InputTextarea
            id="kendala"
            value={formData.kendala}
            onChange={(e) => setFormData({ ...formData, kendala: e.target.value })}
            rows={2}
            placeholder="Kendala atau hambatan yang dihadapi..."
            className="mt-2"
          />
        </div>
      </div>

      <div className="mt-3 p-3 surface-100 border-round">
        <p className="text-sm text-600 m-0">
          <i className="pi pi-info-circle mr-2"></i>
          <strong>Info:</strong> Jam kerja akan dihitung otomatis berdasarkan jam mulai dan jam selesai. 
          Setelah disimpan, logbook berstatus <strong>Draft</strong>. Klik tombol <strong>Submit</strong> untuk mengirim ke HR untuk validasi.
        </p>
      </div>
    </Dialog>
  );
};

export default FormLogbook;