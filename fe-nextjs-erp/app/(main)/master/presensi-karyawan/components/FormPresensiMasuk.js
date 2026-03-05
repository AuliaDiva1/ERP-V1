"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { Divider } from "primereact/divider";

const STATUS_OPTIONS = [
  { label: "Hadir", value: "Hadir" },
  { label: "Izin", value: "Izin" },
  { label: "Sakit", value: "Sakit" },
  { label: "Dinas Luar", value: "Dinas Luar" },
];

const FormPresensiMasuk = ({
  visible,
  onHide,
  onSave,
  isLoading = false,
  karyawanOptions = [],
}) => {
  const toast = useRef(null);
  const fileInputRef = useRef(null);

  const [selectedKaryawanId, setSelectedKaryawanId] = useState(null);
  const [status, setStatus] = useState("Hadir");
  const [keterangan, setKeterangan] = useState("Masuk Pagi");
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [foto, setFoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingLokasi, setLoadingLokasi] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [currentTime, setCurrentTime] = useState("");

  /* ---- Clock ---- */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("id-ID"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ---- Reset saat dialog dibuka ---- */
  useEffect(() => {
    if (visible) {
      setSelectedKaryawanId(null);
      setStatus("Hadir");
      setKeterangan("Masuk Pagi");
      setCoords({ lat: null, lon: null });
      setFoto(null);
      setPreviewUrl(null);
      setGpsError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      handleAmbilLokasi();
    }
  }, [visible]);

  /* ---- GPS ---- */
  const handleAmbilLokasi = useCallback(() => {
    setLoadingLokasi(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Browser tidak mendukung GPS.");
      setLoadingLokasi(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(7),
          lon: pos.coords.longitude.toFixed(7),
        });
        setLoadingLokasi(false);
      },
      (err) => {
        const msg = err.code === 1 ? "Izin lokasi ditolak." : "Gagal verifikasi GPS.";
        setGpsError(msg);
        setLoadingLokasi(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /* ---- Foto ---- */
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.current?.show({ severity: "warn", summary: "File Terlalu Besar", detail: "Maksimal ukuran foto 5MB." });
      return;
    }
    setFoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const resetFoto = () => {
    setFoto(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---- Submit ---- */
  const handleSubmit = () => {
    if (!selectedKaryawanId) {
      toast.current?.show({ severity: "error", summary: "Validasi", detail: "Pilih karyawan terlebih dahulu!" });
      return;
    }
    if (!coords.lat || !coords.lon) {
      toast.current?.show({ severity: "warn", summary: "GPS Belum Siap", detail: "Tunggu hingga lokasi terdeteksi." });
      return;
    }
    if (status === "Hadir" && !foto) {
      toast.current?.show({ severity: "warn", summary: "Foto Wajib", detail: "Ambil foto selfie untuk status Hadir." });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const jamSekarang = new Date().toLocaleTimeString("it-IT");

    const formData = new FormData();
    formData.append("KARYAWAN_ID", selectedKaryawanId);
    formData.append("TANGGAL", today);
    formData.append("JAM_MASUK", jamSekarang);
    formData.append("STATUS", status);
    formData.append("KETERANGAN", keterangan);
    formData.append("LATITUDE", coords.lat);
    formData.append("LONGITUDE", coords.lon);
    if (foto) formData.append("FOTO_MASUK", foto);

    onSave(formData);
  };

  /* ---- Template Dropdown Karyawan ---- */
  const karyawanItemTemplate = (option) => (
    <div className="flex flex-column gap-1 py-1">
      <span className="font-semibold text-sm text-900">{option.label}</span>
      <span className="text-xs text-500">{option.value}</span>
    </div>
  );

  const headerElement = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-sign-in text-primary text-xl" />
      <span className="text-xl font-bold text-900">Catat Absen Masuk</span>
    </div>
  );

  return (
    <Dialog
      header={headerElement}
      visible={visible}
      style={{ width: "95vw", maxWidth: "460px" }}
      modal
      onHide={onHide}
      closable={!isLoading}
      className="p-fluid"
    >
      <Toast ref={toast} position="top-center" />

      <div className="flex flex-column gap-3 pt-2">

        {/* Info Waktu */}
        <div className="surface-50 border-1 surface-border border-round-lg p-3 flex justify-content-between align-items-center">
          <div>
            <small className="text-500 text-xs font-medium uppercase block mb-1">Tanggal</small>
            <span className="font-semibold text-800 text-sm">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          <div className="text-right">
            <small className="text-500 text-xs font-medium uppercase block mb-1">Jam Masuk</small>
            <span className="font-mono font-bold text-primary text-xl">{currentTime}</span>
          </div>
        </div>

        {/* Pilih Karyawan */}
        <div className="field mb-0">
          <label className="font-medium text-sm text-700 mb-2 block">
            <i className="pi pi-user mr-1" /> Karyawan
          </label>
          <Dropdown
            value={selectedKaryawanId}
            options={karyawanOptions}
            onChange={(e) => setSelectedKaryawanId(e.value)}
            placeholder="Ketik nama atau ID karyawan..."
            filter
            showClear
            itemTemplate={karyawanItemTemplate}
            className="w-full"
            disabled={isLoading}
          />
        </div>

        {/* Status */}
        <div className="field mb-0">
          <label className="font-medium text-sm text-700 mb-2 block">
            <i className="pi pi-tag mr-1" /> Status Kehadiran
          </label>
          <Dropdown
            value={status}
            options={STATUS_OPTIONS}
            onChange={(e) => setStatus(e.value)}
            className="w-full"
            disabled={isLoading}
          />
        </div>

        <Divider className="my-1" />

        {/* GPS */}
        <div className="field mb-0">
          <label className="font-medium text-sm text-700 mb-2 flex align-items-center gap-2">
            <i className="pi pi-map-marker" /> Lokasi GPS
          </label>
          {loadingLokasi ? (
            <ProgressBar mode="indeterminate" style={{ height: "6px" }} className="border-round" />
          ) : (
            <div className={`p-3 border-round border-1 flex align-items-center justify-content-between ${
              coords.lat ? "surface-50 surface-border" : "bg-red-50 border-red-200"
            }`}>
              <span className="text-sm font-mono text-700">
                {coords.lat
                  ? `${coords.lat}, ${coords.lon}`
                  : gpsError || "Mendeteksi lokasi..."}
              </span>
              <Button
                icon="pi pi-refresh"
                text
                size="small"
                onClick={handleAmbilLokasi}
                disabled={loadingLokasi || isLoading}
                tooltip="Refresh GPS"
                tooltipOptions={{ position: "top" }}
              />
            </div>
          )}
        </div>

        {/* Foto Selfie */}
        <div className="field mb-0">
          <label className="font-medium text-sm text-700 mb-2 flex align-items-center gap-2">
            <i className="pi pi-camera" /> Foto Selfie
            {status === "Hadir" && <span className="text-red-500 text-xs">(Wajib)</span>}
          </label>

          {!previewUrl ? (
            <div
              className="border-2 border-dashed border-300 border-round p-4 flex flex-column align-items-center justify-content-center cursor-pointer hover:surface-100 transition-all"
              onClick={() => !isLoading && fileInputRef.current?.click()}
            >
              <i className="pi pi-camera text-3xl text-300 mb-2" />
              <span className="text-sm text-500">Klik untuk ambil / upload foto</span>
            </div>
          ) : (
            <div className="relative border-round overflow-hidden border-1 surface-border">
              <img src={previewUrl} alt="Preview" className="w-full" style={{ maxHeight: "200px", objectFit: "cover" }} />
              <Button
                icon="pi pi-times"
                rounded
                severity="danger"
                className="absolute"
                style={{ top: "8px", right: "8px" }}
                onClick={resetFoto}
                tooltip="Hapus foto"
                tooltipOptions={{ position: "top" }}
              />
              <Button
                icon="pi pi-refresh"
                rounded
                severity="secondary"
                className="absolute"
                style={{ top: "8px", right: "52px" }}
                onClick={() => fileInputRef.current?.click()}
                tooltip="Ganti foto"
                tooltipOptions={{ position: "top" }}
              />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        {/* Keterangan */}
        <div className="field mb-0">
          <label className="font-medium text-sm text-700 mb-2 block">
            <i className="pi pi-pencil mr-1" /> Keterangan
          </label>
          <InputTextarea
            rows={2}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Catatan tambahan..."
            disabled={isLoading}
            autoResize
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-column gap-2 mt-2">
          <Button
            label={isLoading ? "Menyimpan..." : "Submit Absen Masuk"}
            icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
            onClick={handleSubmit}
            disabled={isLoading || loadingLokasi}
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
    </Dialog>
  );
};

export default FormPresensiMasuk;