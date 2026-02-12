"use client";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FormBatch = ({ visible, onHide, selectedBatch, onSave }) => {
  const [formData, setFormData] = useState({
    nama_batch: "",
    jenis_batch: "Standar",
    kategori_produk: "",
    kode_produk: "",
    target_jumlah: 0,
    satuan: "",
    spesifikasi: "",
    tanggal_mulai: null,
    tanggal_target_selesai: null,
    estimasi_jam_kerja: 0,
    jumlah_karyawan_dibutuhkan: 0,
    status_batch: "Pending", // ✅ Default untuk update
    catatan: "",
  });

  const [satuanList, setSatuanList] = useState([]);
  const [loading, setLoading] = useState(false);

  const jenisBatchOptions = [
    { label: "Standar", value: "Standar" },
    { label: "Khusus", value: "Khusus" }
  ];

  const statusBatchOptions = [
    { label: "Pending", value: "Pending" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
    { label: "On Hold", value: "On Hold" },
    { label: "Cancelled", value: "Cancelled" }
  ];

  useEffect(() => {
    fetchSatuan();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      setFormData({
        nama_batch: selectedBatch.NAMA_BATCH || "",
        jenis_batch: selectedBatch.JENIS_BATCH || "Standar",
        kategori_produk: selectedBatch.KATEGORI_PRODUK || "",
        kode_produk: selectedBatch.KODE_PRODUK || "",
        target_jumlah: selectedBatch.TARGET_JUMLAH || 0,
        satuan: selectedBatch.SATUAN || "",
        spesifikasi: selectedBatch.SPESIFIKASI || "",
        tanggal_mulai: selectedBatch.TANGGAL_MULAI ? new Date(selectedBatch.TANGGAL_MULAI) : null,
        tanggal_target_selesai: selectedBatch.TANGGAL_TARGET_SELESAI ? new Date(selectedBatch.TANGGAL_TARGET_SELESAI) : null,
        estimasi_jam_kerja: selectedBatch.ESTIMASI_JAM_KERJA || 0,
        jumlah_karyawan_dibutuhkan: selectedBatch.JUMLAH_KARYAWAN_DIBUTUHKAN || 0,
        status_batch: selectedBatch.STATUS_BATCH || "Pending",
        catatan: selectedBatch.CATATAN || "",
      });
    } else {
      resetForm();
    }
  }, [selectedBatch, visible]);

  const fetchSatuan = async () => {
    try {
      const token = localStorage.getItem("TOKEN");
      const res = await axios.get(`${API_URL}/master-satuan-barang`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "00") {
        const options = res.data.data.map(s => ({
          label: `${s.NAMA_SATUAN} (${s.KODE_SATUAN})`,
          value: s.KODE_SATUAN
        }));
        setSatuanList(options);
      }
    } catch (err) {
      console.error("Error fetching satuan:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      nama_batch: "",
      jenis_batch: "Standar",
      kategori_produk: "",
      kode_produk: "",
      target_jumlah: 0,
      satuan: "",
      spesifikasi: "",
      tanggal_mulai: null,
      tanggal_target_selesai: null,
      estimasi_jam_kerja: 0,
      jumlah_karyawan_dibutuhkan: 0,
      status_batch: "Pending",
      catatan: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.nama_batch || !formData.jenis_batch || formData.target_jumlah <= 0) {
      alert("Nama batch, jenis batch, dan target jumlah wajib diisi!");
      return;
    }

    setLoading(true);

    const payload = {
      nama_batch: formData.nama_batch,
      jenis_batch: formData.jenis_batch,
      kategori_produk: formData.kategori_produk,
      kode_produk: formData.kode_produk,
      target_jumlah: formData.target_jumlah,
      satuan: formData.satuan,
      spesifikasi: formData.spesifikasi,
      tanggal_mulai: formData.tanggal_mulai 
        ? formData.tanggal_mulai.toISOString().split('T')[0] 
        : null,
      tanggal_target_selesai: formData.tanggal_target_selesai 
        ? formData.tanggal_target_selesai.toISOString().split('T')[0] 
        : null,
      estimasi_jam_kerja: formData.estimasi_jam_kerja,
      jumlah_karyawan_dibutuhkan: formData.jumlah_karyawan_dibutuhkan,
      catatan: formData.catatan,
    };

    // ✅ HANYA KIRIM STATUS SAAT UPDATE
    if (selectedBatch) {
      payload.status_batch = formData.status_batch;
    }
    // ✅ SAAT CREATE, STATUS TIDAK DIKIRIM (backend yang set "Pending")

    await onSave(payload);
    setLoading(false);
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
        label={selectedBatch ? "Update" : "Simpan"}
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header={selectedBatch ? "Edit Batch" : "Tambah Batch Baru"}
      visible={visible}
      style={{ width: "800px", maxWidth: "95vw" }}
      onHide={onHide}
      footer={dialogFooter}
      modal
      className="p-fluid"
    >
      <div className="grid">
        {/* ✅ INFO: Status otomatis saat CREATE */}
        {!selectedBatch && (
          <div className="col-12">
            <Message 
              severity="info" 
              text="Status batch akan otomatis di-set 'Pending' saat batch baru dibuat. Status akan berubah otomatis menjadi 'In Progress' saat ada logbook pertama yang di-approve, dan 'Completed' saat target tercapai."
              className="mb-3"
            />
          </div>
        )}

        {/* Nama Batch */}
        <div className="col-12">
          <label htmlFor="nama_batch" className="font-semibold">
            Nama Batch <span className="text-red-500">*</span>
          </label>
          <InputText
            id="nama_batch"
            value={formData.nama_batch}
            onChange={(e) => setFormData({ ...formData, nama_batch: e.target.value })}
            placeholder="Contoh: Batch Produksi Meja Kayu"
            className="mt-2"
          />
        </div>

        {/* Jenis Batch */}
        <div className="col-12 md:col-6">
          <label htmlFor="jenis_batch" className="font-semibold">
            Jenis Batch <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="jenis_batch"
            value={formData.jenis_batch}
            options={jenisBatchOptions}
            onChange={(e) => setFormData({ ...formData, jenis_batch: e.value })}
            placeholder="Pilih Jenis"
            className="mt-2"
          />
        </div>

        {/* ✅ STATUS BATCH - HANYA TAMPIL SAAT UPDATE */}
        {selectedBatch && (
          <div className="col-12 md:col-6">
            <label htmlFor="status_batch" className="font-semibold">
              Status Batch
            </label>
            <Dropdown
              id="status_batch"
              value={formData.status_batch}
              options={statusBatchOptions}
              onChange={(e) => setFormData({ ...formData, status_batch: e.value })}
              placeholder="Pilih Status"
              className="mt-2"
              disabled={selectedBatch?.STATUS_BATCH === "Completed"} // ✅ DISABLE JIKA COMPLETED
            />
            {selectedBatch?.STATUS_BATCH === "Completed" && (
              <small className="text-500 mt-1 block">
                <i className="pi pi-info-circle mr-1"></i>
                Batch sudah selesai, status tidak dapat diubah
              </small>
            )}
          </div>
        )}

        {/* Kategori Produk */}
        <div className="col-12 md:col-6">
          <label htmlFor="kategori_produk" className="font-semibold">
            Kategori Produk
          </label>
          <InputText
            id="kategori_produk"
            value={formData.kategori_produk}
            onChange={(e) => setFormData({ ...formData, kategori_produk: e.target.value })}
            placeholder="Contoh: Furniture"
            className="mt-2"
          />
        </div>

        {/* Kode Produk */}
        <div className="col-12 md:col-6">
          <label htmlFor="kode_produk" className="font-semibold">
            Kode Produk
          </label>
          <InputText
            id="kode_produk"
            value={formData.kode_produk}
            onChange={(e) => setFormData({ ...formData, kode_produk: e.target.value })}
            placeholder="Contoh: PRD-001"
            className="mt-2"
          />
        </div>

        {/* Target Jumlah */}
        <div className="col-12 md:col-6">
          <label htmlFor="target_jumlah" className="font-semibold">
            Target Jumlah <span className="text-red-500">*</span>
          </label>
          <InputNumber
            id="target_jumlah"
            value={formData.target_jumlah}
            onValueChange={(e) => setFormData({ ...formData, target_jumlah: e.value })}
            placeholder="0"
            min={0}
            className="mt-2"
          />
        </div>

        {/* Satuan */}
        <div className="col-12 md:col-6">
          <label htmlFor="satuan" className="font-semibold">
            Satuan
          </label>
          <Dropdown
            id="satuan"
            value={formData.satuan}
            options={satuanList}
            onChange={(e) => setFormData({ ...formData, satuan: e.value })}
            placeholder="Pilih Satuan"
            className="mt-2"
            showClear
            filter
          />
        </div>

        {/* Tanggal Mulai */}
        <div className="col-12 md:col-6">
          <label htmlFor="tanggal_mulai" className="font-semibold">
            Tanggal Mulai
          </label>
          <Calendar
            id="tanggal_mulai"
            value={formData.tanggal_mulai}
            onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.value })}
            dateFormat="dd/mm/yy"
            placeholder="Pilih Tanggal"
            className="mt-2"
            showIcon
          />
        </div>

        {/* Tanggal Target Selesai */}
        <div className="col-12 md:col-6">
          <label htmlFor="tanggal_target_selesai" className="font-semibold">
            Target Selesai
          </label>
          <Calendar
            id="tanggal_target_selesai"
            value={formData.tanggal_target_selesai}
            onChange={(e) => setFormData({ ...formData, tanggal_target_selesai: e.value })}
            dateFormat="dd/mm/yy"
            placeholder="Pilih Tanggal"
            className="mt-2"
            showIcon
          />
        </div>

        {/* Estimasi Jam Kerja */}
        <div className="col-12 md:col-6">
          <label htmlFor="estimasi_jam_kerja" className="font-semibold">
            Estimasi Jam Kerja
          </label>
          <InputNumber
            id="estimasi_jam_kerja"
            value={formData.estimasi_jam_kerja}
            onValueChange={(e) => setFormData({ ...formData, estimasi_jam_kerja: e.value })}
            placeholder="0"
            min={0}
            mode="decimal"
            minFractionDigits={2}
            maxFractionDigits={2}
            suffix=" jam"
            className="mt-2"
          />
        </div>

        {/* Jumlah Karyawan Dibutuhkan */}
        <div className="col-12 md:col-6">
          <label htmlFor="jumlah_karyawan_dibutuhkan" className="font-semibold">
            Jumlah Karyawan Dibutuhkan
          </label>
          <InputNumber
            id="jumlah_karyawan_dibutuhkan"
            value={formData.jumlah_karyawan_dibutuhkan}
            onValueChange={(e) => setFormData({ ...formData, jumlah_karyawan_dibutuhkan: e.value })}
            placeholder="0"
            min={0}
            suffix=" orang"
            className="mt-2"
          />
        </div>

        {/* Spesifikasi */}
        <div className="col-12">
          <label htmlFor="spesifikasi" className="font-semibold">
            Spesifikasi
          </label>
          <InputTextarea
            id="spesifikasi"
            value={formData.spesifikasi}
            onChange={(e) => setFormData({ ...formData, spesifikasi: e.target.value })}
            rows={3}
            placeholder="Deskripsi spesifikasi produk..."
            className="mt-2"
          />
        </div>

        {/* Catatan */}
        <div className="col-12">
          <label htmlFor="catatan" className="font-semibold">
            Catatan
          </label>
          <InputTextarea
            id="catatan"
            value={formData.catatan}
            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
            rows={2}
            placeholder="Catatan tambahan..."
            className="mt-2"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormBatch;