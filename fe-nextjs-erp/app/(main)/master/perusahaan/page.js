"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { TabView, TabPanel } from "primereact/tabview";
import { Timeline } from "primereact/timeline";

import ToastNotifier from "../../../components/ToastNotifier";
import FormMasterPerusahaan from "./components/FormMasterPerusahaan";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MasterPerusahaanPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [perusahaanData, setPerusahaanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchData();
    fetchLogs();
    return () => { isMounted.current = false; };
  }, []);

  // --- 1. READ ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-perusahaan`);
      if (res.data.status === "00" && res.data.data.length > 0) {
        setPerusahaanData(res.data.data[0]);
      } else {
        setPerusahaanData(null);
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal memuat profil perusahaan");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // --- 2. READ LOGS ---
  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/master-perusahaan/logs`);
      if (res.data.status === "00") {
        setAuditLogs(res.data.data || []);
      }
    } catch (err) {
      // Log endpoint optional, fail silently
    }
  };

  // --- 3. CREATE & UPDATE ---
  const handleSubmit = async (payload) => {
    try {
      let res;
      if (perusahaanData?.ID_PERUSAHAAN) {
        res = await axios.put(`${API_URL}/master-perusahaan/${perusahaanData.ID_PERUSAHAAN}`, payload);
      } else {
        res = await axios.post(`${API_URL}/master-perusahaan`, payload);
      }
      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Data profil berhasil disimpan");
        setDialogVisible(false);
        fetchData();
        fetchLogs();
      }
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Terjadi kesalahan server");
    }
  };

  // --- 4. DELETE ---
  const handleDelete = () => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus profil "${perusahaanData.NAMA_PERUSAHAAN}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const res = await axios.delete(`${API_URL}/master-perusahaan/${perusahaanData.ID_PERUSAHAAN}`);
          if (res.data.status === "00") {
            toastRef.current?.showToast("00", "Profil berhasil dihapus");
            setPerusahaanData(null);
            fetchData();
            fetchLogs();
          }
        } catch (err) {
          toastRef.current?.showToast("01", "Gagal menghapus profil");
        }
      }
    });
  };

  // --- KELENGKAPAN PROFIL ---
  const getCompleteness = (d) => {
    if (!d) return { pct: 0, items: [] };
    const checks = [
      { label: "Nama Perusahaan", ok: !!d.NAMA_PERUSAHAAN },
      { label: "Alamat Kantor", ok: !!d.ALAMAT_KANTOR },
      { label: "NPWP", ok: !!d.NPWP },
      { label: "Kontak (Telp/WA)", ok: !!(d.TELEPON || d.WA_HOTLINE) },
      { label: "Email", ok: !!d.EMAIL },
      { label: "Data Bank", ok: !!(d.NAMA_BANK && d.NOMOR_REKENING) },
      { label: "Pimpinan & Jabatan", ok: !!(d.NAMA_PIMPINAN && d.JABATAN_PIMPINAN) },
      { label: "GPS Kantor", ok: !!(d.LAT_KANTOR && d.LON_KANTOR) },
      { label: "Jam Kerja", ok: !!(d.JAM_MASUK_NORMAL && d.JAM_PULANG_NORMAL) },
      { label: "Logo", ok: !!d.LOGO_PATH },
    ];
    const done = checks.filter((c) => c.ok).length;
    return { pct: Math.round((done / checks.length) * 100), items: checks };
  };

  const completeness = getCompleteness(perusahaanData);

  // --- LOG SEVERITY ---
  const getLogSeverity = (action) => {
    if (action === "CREATE") return "success";
    if (action === "UPDATE") return "warning";
    if (action === "DELETE") return "danger";
    return "info";
  };

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      {/* HEADER */}
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold m-0">Pengaturan Profil Perusahaan</h3>
          <small className="text-gray-500">Kelola identitas resmi yang muncul pada dokumen & laporan</small>
        </div>
        <div className="flex gap-2">
          {perusahaanData && (
            <Button label="Hapus" icon="pi pi-trash" severity="danger" outlined onClick={handleDelete} />
          )}
          <Button
            label={perusahaanData ? "Edit Profil" : "Tambah Profil"}
            icon={perusahaanData ? "pi pi-pencil" : "pi pi-plus"}
            severity={perusahaanData ? "warning" : "success"}
            onClick={() => setDialogVisible(true)}
            loading={isLoading}
          />
        </div>
      </div>

      {/* MAIN TAB CARD */}
      <Card className="shadow-2 border-round-xl">
        {!perusahaanData ? (
          <div className="flex flex-column align-items-center justify-content-center p-8 bg-gray-50 border-round">
            <i className="pi pi-building text-6xl text-gray-300 mb-4"></i>
            <h4 className="m-0 text-gray-600">Profil Perusahaan Belum Diset</h4>
            <Button label="Lengkapi Sekarang" icon="pi pi-plus" severity="success" onClick={() => setDialogVisible(true)} className="mt-4" />
          </div>
        ) : (
          <TabView>
            {/* ===== TAB 1: PROFIL UTAMA ===== */}
            <TabPanel header="Profil Utama" leftIcon="pi pi-building mr-2">
              <div className="grid">
                <div className="col-12 md:col-2 flex justify-content-center align-items-start">
                  <div className="border-1 border-300 border-circle bg-gray-100 flex justify-content-center align-items-center" style={{ width: "130px", height: "130px", overflow: "hidden" }}>
                    {perusahaanData.LOGO_PATH ? (
                      <img src={perusahaanData.LOGO_PATH} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "10px" }} />
                    ) : (
                      <i className="pi pi-building text-5xl text-gray-400"></i>
                    )}
                  </div>
                </div>
                <div className="col-12 md:col-10">
                  <h2 className="m-0 text-primary uppercase font-bold">{perusahaanData.NAMA_PERUSAHAAN}</h2>
                  <p className="text-lg text-gray-700 m-0 mt-1">
                    <i className="pi pi-map-marker mr-2 text-primary"></i>{perusahaanData.ALAMAT_KANTOR}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm font-medium">
                    <span><i className="pi pi-phone mr-2 text-primary"></i>{perusahaanData.TELEPON || "-"}</span>
                    <span><i className="pi pi-whatsapp mr-2 text-green-500"></i>{perusahaanData.WA_HOTLINE || "-"}</span>
                    <span><i className="pi pi-envelope mr-2 text-primary"></i>{perusahaanData.EMAIL || "-"}</span>
                    <span><i className="pi pi-globe mr-2 text-primary"></i>{perusahaanData.WEBSITE || "-"}</span>
                  </div>
                  <Divider />
                  <div className="grid mt-2">
                    <div className="col-12 md:col-4">
                      <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Legalitas & Pajak</label>
                      <p className="m-0 font-semibold text-gray-800">NPWP: {perusahaanData.NPWP || "-"}</p>
                      <p className="m-0 text-sm">Kota Terbit: {perusahaanData.KOTA_TERBIT || "-"}</p>
                    </div>
                    <div className="col-12 md:col-4">
                      <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Rekening Pembayaran</label>
                      <p className="m-0 font-semibold text-gray-800">{perusahaanData.NAMA_BANK || "-"}</p>
                      <p className="m-0 text-sm font-bold text-primary">{perusahaanData.NOMOR_REKENING || "-"}</p>
                      <p className="m-0 text-xs text-gray-600">a/n {perusahaanData.ATAS_NAMA_BANK || "-"}</p>
                    </div>
                    <div className="col-12 md:col-4">
                      <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Penanggung Jawab (TTD)</label>
                      <p className="m-0 font-semibold text-gray-800">{perusahaanData.NAMA_PIMPINAN || "-"}</p>
                      <p className="m-0 text-sm text-primary italic font-bold">{perusahaanData.JABATAN_PIMPINAN || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* ===== TAB 2: OPERASIONAL & GPS ===== */}
            <TabPanel header="Operasional & GPS" leftIcon="pi pi-map mr-2">
              <div className="grid">
                {/* Alamat */}
                <div className="col-12 md:col-6">
                  <Card title="Detail Alamat" className="h-full">
                    <div className="mb-3">
                      <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Alamat Kantor</label>
                      <p className="text-gray-700 m-0">{perusahaanData.ALAMAT_KANTOR || "-"}</p>
                    </div>
                    <Divider />
                    <div className="flex align-items-start gap-3">
                      <i className="pi pi-truck text-2xl text-primary mt-1"></i>
                      <div>
                        <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Alamat Gudang Utama</label>
                        <p className="text-gray-600 m-0">{perusahaanData.ALAMAT_GUDANG || "Belum diatur"}</p>
                      </div>
                    </div>
                  </Card>
                </div>
                {/* GPS Geofencing */}
                <div className="col-12 md:col-6">
                  <Card title="Konfigurasi GPS & Geofencing" className="h-full">
                    <div className="flex align-items-center gap-2 mb-3">
                      <i className={`pi pi-circle-fill text-sm ${perusahaanData.LAT_KANTOR ? "text-green-500" : "text-gray-400"}`}></i>
                      <span className="text-sm text-gray-600">
                        {perusahaanData.LAT_KANTOR ? "GPS aktif & terkonfigurasi" : "GPS belum dikonfigurasi"}
                      </span>
                    </div>
                    <div className="flex flex-column gap-2">
                      {[
                        { label: "Latitude", value: perusahaanData.LAT_KANTOR },
                        { label: "Longitude", value: perusahaanData.LON_KANTOR },
                        { label: "Radius Geofence", value: perusahaanData.RADIUS_METER ? `${perusahaanData.RADIUS_METER} meter` : null },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-content-between align-items-center py-2 border-bottom-1 border-gray-200">
                          <span className="text-gray-500 text-sm">{label}</span>
                          <span className="font-medium text-sm">{value || "-"}</span>
                        </div>
                      ))}
                    </div>
                    {perusahaanData.LAT_KANTOR && perusahaanData.LON_KANTOR && (
                      <a
                        href={`https://www.google.com/maps?q=${perusahaanData.LAT_KANTOR},${perusahaanData.LON_KANTOR}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex align-items-center gap-2 text-primary text-sm"
                      >
                        <i className="pi pi-external-link"></i> Lihat di Google Maps
                      </a>
                    )}
                  </Card>
                </div>
                {/* Jam Kerja */}
                <div className="col-12 mt-3">
                  <Card title="Jam Kerja Default">
                    <div className="grid">
                      <div className="col-6 md:col-3">
                        <div className="text-center p-4 bg-blue-50 border-round-xl">
                          <i className="pi pi-sign-in text-2xl text-blue-500 mb-2 block"></i>
                          <p className="text-gray-500 text-xs uppercase font-bold m-0 mb-2">Jam Masuk</p>
                          <p className="text-3xl font-bold text-blue-600 m-0">{perusahaanData.JAM_MASUK_NORMAL || "08:00"}</p>
                        </div>
                      </div>
                      <div className="col-6 md:col-3">
                        <div className="text-center p-4 bg-orange-50 border-round-xl">
                          <i className="pi pi-sign-out text-2xl text-orange-500 mb-2 block"></i>
                          <p className="text-gray-500 text-xs uppercase font-bold m-0 mb-2">Jam Pulang</p>
                          <p className="text-3xl font-bold text-orange-600 m-0">{perusahaanData.JAM_PULANG_NORMAL || "17:00"}</p>
                        </div>
                      </div>
                      <div className="col-12 md:col-6 flex align-items-center">
                        <div className="p-3 bg-gray-50 border-round w-full">
                          <p className="text-gray-500 text-sm m-0">
                            <i className="pi pi-info-circle mr-2"></i>
                            Jam kerja ini digunakan sebagai acuan validasi keterlambatan dan pulang awal pada sistem absensi.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabPanel>

            {/* ===== TAB 3: METADATA & KELENGKAPAN ===== */}
            <TabPanel header="Metadata" leftIcon="pi pi-info-circle mr-2">
              <div className="grid">
                <div className="col-12 md:col-6">
                  <Card title="Info Sistem">
                    <div className="flex flex-column gap-3">
                      {[
                        { label: "Status Data", value: <Tag value="Aktif" severity="success" /> },
                        { label: "ID Sistem", value: <span className="font-medium text-primary">#{perusahaanData.ID_PERUSAHAAN}</span> },
                        {
                          label: "Dibuat Pada",
                          value: perusahaanData.created_at
                            ? new Date(perusahaanData.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
                            : "-",
                        },
                        {
                          label: "Terakhir Update",
                          value: perusahaanData.updated_at
                            ? new Date(perusahaanData.updated_at).toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "-",
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-content-between align-items-center border-bottom-1 border-gray-100 pb-2">
                          <span className="text-gray-500 text-sm">{label}</span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
                <div className="col-12 md:col-6">
                  <Card title="Kelengkapan Profil">
                    <div className="flex align-items-center gap-3 mb-4">
                      <div className="text-4xl font-bold text-primary">{completeness.pct}%</div>
                      <div className="flex-1">
                        <div className="h-1rem border-round overflow-hidden bg-gray-200">
                          <div
                            className="h-full bg-primary border-round"
                            style={{ width: `${completeness.pct}%`, transition: "width 0.5s ease" }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 m-0">
                          {completeness.items.filter((c) => c.ok).length} dari {completeness.items.length} bidang terisi
                        </p>
                      </div>
                    </div>
                    <div className="grid">
                      {completeness.items.map((item) => (
                        <div key={item.label} className="col-6 flex align-items-center gap-2 py-1">
                          <i className={`pi ${item.ok ? "pi-check-circle text-green-500" : "pi-circle text-gray-400"} text-sm`}></i>
                          <span className={`text-xs ${item.ok ? "text-gray-700" : "text-gray-400"}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </TabPanel>

            {/* ===== TAB 4: RIWAYAT PERUBAHAN (AUDIT LOG) ===== */}
            <TabPanel header={`Riwayat Perubahan${auditLogs.length ? ` (${auditLogs.length})` : ""}`} leftIcon="pi pi-history mr-2">
              {auditLogs.length === 0 ? (
                <div className="flex flex-column align-items-center justify-content-center p-6 bg-gray-50 border-round">
                  <i className="pi pi-history text-5xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500 m-0">Belum ada riwayat perubahan tercatat</p>
                </div>
              ) : (
                <Timeline
                  value={auditLogs}
                  opposite={(log) => (
                    <div className="text-xs text-gray-500">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "-"}
                    </div>
                  )}
                  content={(log) => (
                    <Card className="mb-3 shadow-1">
                      <div className="flex align-items-center gap-2 mb-2">
                        <Tag
                          value={log.action === "CREATE" ? "Buat Baru" : log.action === "UPDATE" ? "Edit" : "Hapus"}
                          severity={getLogSeverity(log.action)}
                        />
                        <span className="font-semibold text-sm">{log.user_name || "System"}</span>
                      </div>
                      {log.changes && log.changes.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-2">Perubahan:</p>
                          <div className="flex flex-column gap-1">
                            {log.changes.map((change, idx) => (
                              <div key={idx} className="flex align-items-center gap-2 text-xs bg-gray-50 border-round p-2">
                                <span className="font-bold text-gray-600 w-8rem">{change.field}</span>
                                <span className="text-red-500 line-through flex-1">{change.old_value || "-"}</span>
                                <i className="pi pi-arrow-right text-gray-400 text-xs"></i>
                                <span className="text-green-600 flex-1">{change.new_value || "-"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {log.note && <p className="text-xs text-gray-500 mt-2 mb-0 italic">{log.note}</p>}
                    </Card>
                  )}
                  marker={(log) => (
                    <span className={`flex w-2rem h-2rem align-items-center justify-content-center border-circle z-1 shadow-1 ${
                      log.action === "CREATE" ? "bg-green-500" : log.action === "UPDATE" ? "bg-yellow-500" : "bg-red-500"
                    }`}>
                      <i className={`pi ${log.action === "CREATE" ? "pi-plus" : log.action === "UPDATE" ? "pi-pencil" : "pi-trash"} text-white text-xs`}></i>
                    </span>
                  )}
                />
              )}
            </TabPanel>
          </TabView>
        )}
      </Card>

      <FormMasterPerusahaan
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        onSave={handleSubmit}
        selectedData={perusahaanData}
      />
    </div>
  );
}
