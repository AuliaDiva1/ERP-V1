"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { Divider } from "primereact/divider";
import { InputTextarea } from "primereact/inputtextarea";

const FormPresensiPulang = ({
  visible,
  onHide,
  onSave,
  isLoading = false,
  userKaryawanId,
}) => {
  const toast = useRef(null);
  const fileInputRef = useRef(null);

  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [foto, setFoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingLokasi, setLoadingLokasi] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [keterangan, setKeterangan] = useState("Pulang Kerja");

  /* ---- Clock ---- */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("id-ID"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  /* ---- Reset saat dialog dibuka ---- */
  useEffect(() => {
    if (visible) {
      setFoto(null);
      setPreviewUrl(null);
      setCoords({ lat: null, lon: null });
      setGpsError(null);
      setKeterangan("Pulang Kerja");
      if (fileInputRef.current) fileInputRef.current.value = "";
      handleAmbilLokasi();
    }
  }, [visible, handleAmbilLokasi]);

  /* ---- Foto ---- */
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.current?.show({ severity: "warn", summary: "File Besar", detail: "Maksimal 5MB." });
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
    if (!userKaryawanId) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "ID Karyawan tidak ditemukan!" });
      return;
    }
    if (!coords.lat || !coords.lon) {
      toast.current?.show({ severity: "warn", summary: "GPS Belum Siap", detail: "Tunggu hingga lokasi terdeteksi." });
      return;
    }
    if (!foto) {
      toast.current?.show({ severity: "warn", summary: "Foto Wajib", detail: "Ambil foto bukti pulang!" });
      return;
    }

    const formData = new FormData();
    formData.append("KARYAWAN_ID", userKaryawanId);
    formData.append("TANGGAL", new Date().toISOString().split("T")[0]);
    formData.append("JAM_KELUAR", new Date().toLocaleTimeString("it-IT"));
    formData.append("LATITUDE", coords.lat);
    formData.append("LONGITUDE", coords.lon);
    formData.append("KETERANGAN", keterangan);
    formData.append("FOTO_KELUAR", foto);

    onSave(formData);
  };

  const headerElement = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-sign-out text-amber-600 text-xl"></i>
      <span className="text-xl font-bold text-slate-800">Konfirmasi Pulang</span>
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
      className="p-fluid shadow-6"
    >
      <Toast ref={toast} position="top-center" />

      <div className="flex flex-column gap-3 pt-2">

        {/* Info Karyawan & Waktu */}
        <div className="flex justify-content-between align-items-center bg-amber-50 p-3 border-round-xl border-1 border-amber-200">
          <div>
            <small className="text-500 font-bold uppercase block">ID Karyawan</small>
            <span className="text-lg font-bold text-indigo-700">{userKaryawanId || "---"}</span>
          </div>
          <div className="text-right">
            <small className="text-500 font-bold uppercase block">Jam Pulang</small>
            <span className="text-xl font-mono font-bold text-amber-700">{currentTime}</span>
          </div>
        </div>

        {/* GPS */}
        <div className="field mb-0">
          <label className="font-bold text-sm text-slate-600 mb-2 flex align-items-center gap-2">
            <i className="pi pi-map-marker"></i> Lokasi GPS
          </label>
          {loadingLokasi ? (
            <ProgressBar mode="indeterminate" style={{ height: "6px" }} className="border-round" />
          ) : (
            <div
              className={`p-3 border-round-lg flex align-items-center justify-content-between border-1 ${
                coords.lat ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              <span className="text-sm font-mono font-bold">
                {coords.lat
                  ? `${coords.lat}, ${coords.lon}`
                  : gpsError || "Mendeteksi lokasi..."}
              </span>
              <Button
                icon="pi pi-refresh"
                className="p-button-text p-button-sm"
                onClick={handleAmbilLokasi}
                disabled={loadingLokasi || isLoading}
                tooltip="Refresh GPS"
              />
            </div>
          )}
        </div>

        <Divider className="my-1" />

        {/* Foto Bukti Pulang */}
        <div className="field mb-0">
          <label className="font-bold text-sm text-slate-600 mb-2 flex align-items-center gap-2">
            <i className="pi pi-camera"></i> Foto Bukti Pulang
            <span className="text-red-500 text-xs">(Wajib)</span>
          </label>

          {!previewUrl ? (
            <div
              className="border-2 border-dashed border-300 border-round-xl p-4 flex flex-column align-items-center justify-content-center cursor-pointer hover:surface-100 transition-all"
              onClick={() => !isLoading && fileInputRef.current?.click()}
            >
              <i className="pi pi-camera text-4xl text-300 mb-2"></i>
              <span className="text-sm text-500">Klik untuk ambil / upload foto</span>
            </div>
          ) : (
            <div className="relative border-round-xl overflow-hidden shadow-3 border-2 border-amber-200">
              <img src={previewUrl} alt="Preview" className="w-full" style={{ maxHeight: "200px", objectFit: "cover" }} />
              <Button
                icon="pi pi-times"
                className="p-button-rounded p-button-danger absolute"
                style={{ top: "8px", right: "8px" }}
                onClick={resetFoto}
                tooltip="Hapus foto"
              />
              <Button
                icon="pi pi-refresh"
                className="p-button-rounded p-button-warning absolute"
                style={{ top: "8px", right: "52px" }}
                onClick={() => fileInputRef.current?.click()}
                tooltip="Ganti foto"
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
          <label className="font-bold text-sm text-slate-600 mb-2 block">
            <i className="pi pi-pencil mr-1"></i> Keterangan
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
            label={isLoading ? "Menyimpan..." : "KONFIRMASI SELESAI KERJA"}
            icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-check-circle"}
            onClick={handleSubmit}
            disabled={isLoading || loadingLokasi || !coords.lat}
            className="p-button-warning p-button-lg shadow-3 border-round-xl font-bold"
            style={{ height: "50px" }}
          />
          <Button
            label="Batal"
            icon="pi pi-times"
            onClick={onHide}
            disabled={isLoading}
            className="p-button-text p-button-secondary"
          />
        </div>

      </div>
    </Dialog>
  );
};

export default FormPresensiPulang;