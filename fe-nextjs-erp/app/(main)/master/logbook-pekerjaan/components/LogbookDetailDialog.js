"use client";

import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { Image } from "primereact/image";
import { Button } from "primereact/button";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LogbookDetailDialog = ({ visible, onHide, logbook }) => {
  const [validasiHistory, setValidasiHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (visible && logbook) {
      fetchValidasiHistory();
    }
  }, [visible, logbook]);

  const fetchValidasiHistory = async () => {
    if (!logbook?.LOGBOOK_ID) return;
    
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("TOKEN");
      const res = await axios.get(
        `${API_URL}/logbook-pekerjaan/${logbook.LOGBOOK_ID}/validasi`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === "00") {
        setValidasiHistory(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching validasi history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const InfoItem = ({ label, value, icon }) => (
    <div className="mb-3">
      <div className="flex align-items-center gap-2 mb-1">
        {icon && <i className={`${icon} text-primary text-sm`}></i>}
        <span className="text-600 text-sm font-medium">{label}</span>
      </div>
      <span className="text-900 font-semibold text-base">{value || "-"}</span>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusSeverity = (status) => {
    const map = {
      "Draft": "secondary",
      "Submitted": "warning",
      "Approved": "success",
      "Rejected": "danger"
    };
    return map[status] || "secondary";
  };

  const fotoUrl = logbook?.FOTO_BUKTI
    ? `${API_URL.replace("/api", "")}${logbook.FOTO_BUKTI}`
    : null;

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-3">
          <i className="pi pi-book text-primary text-2xl"></i>
          <div>
            <h3 className="m-0 text-xl font-bold text-900">Detail Logbook</h3>
            <p className="m-0 text-sm text-600 mt-1">Informasi lengkap logbook pekerjaan</p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "1000px", maxWidth: "95vw" }}
      modal
      draggable={false}
      onHide={onHide}
      className="p-fluid"
      dismissableMask
    >
      {logbook ? (
        <div className="pb-2">
          {/* Header Section */}
          <div className="surface-card border-round-lg shadow-3 p-4 mb-4">
            <div className="flex align-items-center justify-content-between mb-3">
              <div>
                <h2 className="text-2xl font-bold text-900 mt-0 mb-2">
                  {logbook.LOGBOOK_ID}
                </h2>
                <div className="flex gap-2">
                  <Tag
                    value={logbook.STATUS}
                    severity={getStatusSeverity(logbook.STATUS)}
                  />
                  <Tag
                    value={logbook.BATCH_ID}
                    severity="info"
                    icon="pi pi-box"
                  />
                  <Tag
                    value={formatDate(logbook.TANGGAL)}
                    severity="secondary"
                    icon="pi pi-calendar"
                  />
                </div>
              </div>
            </div>

            {/* Info Ringkas */}
            <div className="grid mt-3">
              <div className="col-12 md:col-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-clock text-primary text-2xl mb-2"></i>
                  <div className="text-600 text-xs mb-1">Jam Kerja</div>
                  <div className="text-900 font-bold">{logbook.JAM_KERJA} jam</div>
                </div>
              </div>
              <div className="col-12 md:col-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-box text-orange-500 text-2xl mb-2"></i>
                  <div className="text-600 text-xs mb-1">Output</div>
                  <div className="text-900 font-bold">{logbook.JUMLAH_OUTPUT} unit</div>
                </div>
              </div>
              <div className="col-12 md:col-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-user text-blue-500 text-2xl mb-2"></i>
                  <div className="text-600 text-xs mb-1">Karyawan</div>
                  <div className="text-900 font-bold text-sm">{logbook.NAMA_KARYAWAN}</div>
                </div>
              </div>
              <div className="col-12 md:col-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-building text-purple-500 text-2xl mb-2"></i>
                  <div className="text-600 text-xs mb-1">Departemen</div>
                  <div className="text-900 font-bold">{logbook.DEPARTEMEN}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid">
            {/* Informasi Batch & Waktu */}
            <div className="col-12 md:col-6">
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-info-circle text-blue-600 text-lg"></i>
                    <span className="font-semibold">Informasi Batch & Waktu</span>
                  </div>
                }
                className="shadow-2 h-full"
              >
                <InfoItem 
                  label="Kode Logbook" 
                  value={logbook.LOGBOOK_ID} 
                  icon="pi pi-hashtag" 
                />
                <InfoItem 
                  label="Batch" 
                  value={`${logbook.BATCH_ID} - ${logbook.NAMA_BATCH}`}
                  icon="pi pi-box" 
                />
                <InfoItem 
                  label="Kategori Produk" 
                  value={logbook.KATEGORI_PRODUK} 
                  icon="pi pi-bookmark" 
                />
                <InfoItem 
                  label="Tanggal" 
                  value={formatDate(logbook.TANGGAL)} 
                  icon="pi pi-calendar" 
                />
                <InfoItem 
                  label="Jam Mulai" 
                  value={logbook.JAM_MULAI} 
                  icon="pi pi-clock" 
                />
                <InfoItem 
                  label="Jam Selesai" 
                  value={logbook.JAM_SELESAI} 
                  icon="pi pi-clock" 
                />
                <InfoItem
                label="Jam Kerja"
                value={(() => {
                    if (!logbook.JAM_KERJA) return "-";
                    
                    const parts = logbook.JAM_KERJA.toString().split(':');
                    if (parts.length === 2) {
                    const hours = parseInt(parts[0]) || 0;
                    const minutes = parseInt(parts[1]) || 0;
                    
                    if (hours > 0 && minutes > 0) {
                        return `${hours} jam ${minutes} menit (${logbook.JAM_MULAI} - ${logbook.JAM_SELESAI || 'Belum selesai'})`;
                    } else if (hours > 0) {
                        return `${hours} jam (${logbook.JAM_MULAI} - ${logbook.JAM_SELESAI || 'Belum selesai'})`;
                    } else if (minutes > 0) {
                        return `${minutes} menit (${logbook.JAM_MULAI} - ${logbook.JAM_SELESAI || 'Belum selesai'})`;
                    }
                    }
                    
                    // Fallback
                    const decimal = parseFloat(logbook.JAM_KERJA);
                    if (!isNaN(decimal)) {
                    const h = Math.floor(decimal);
                    const m = Math.round((decimal - h) * 60);
                    const formatted = m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
                    return `${formatted} (${logbook.JAM_MULAI} - ${logbook.JAM_SELESAI || 'Belum selesai'})`;
                    }
                    
                    return `${logbook.JAM_MULAI} - ${logbook.JAM_SELESAI || 'Belum selesai'}`;
                })()}
                icon="pi pi-clock"
                />
              </Card>
            </div>

            {/* Informasi Karyawan */}
            <div className="col-12 md:col-6">
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-user text-orange-600 text-lg"></i>
                    <span className="font-semibold">Informasi Karyawan</span>
                  </div>
                }
                className="shadow-2 mb-3"
              >
                <InfoItem 
                  label="Kode Karyawan" 
                  value={logbook.KARYAWAN_ID} 
                  icon="pi pi-id-card" 
                />
                <InfoItem 
                  label="NIK" 
                  value={logbook.NIK} 
                  icon="pi pi-hashtag" 
                />
                <InfoItem 
                  label="Nama Karyawan" 
                  value={logbook.NAMA_KARYAWAN} 
                  icon="pi pi-user" 
                />
                <InfoItem 
                  label="Email" 
                  value={logbook.EMAIL} 
                  icon="pi pi-envelope" 
                />
                <InfoItem 
                  label="Departemen" 
                  value={logbook.DEPARTEMEN} 
                  icon="pi pi-building" 
                />
                <InfoItem 
                  label="Jabatan" 
                  value={logbook.JABATAN} 
                  icon="pi pi-briefcase" 
                />
              </Card>

              {/* Progress */}
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-chart-bar text-green-600 text-lg"></i>
                    <span className="font-semibold">Progress Pekerjaan</span>
                  </div>
                }
                className="shadow-2"
              >
                <InfoItem
                label="Output"
                value={`${Math.floor(logbook.JUMLAH_OUTPUT || 0)} unit`}
                icon="pi pi-chart-bar"
                />
                <InfoItem 
                  label="Status" 
                  value={logbook.STATUS} 
                  icon="pi pi-circle" 
                />
              </Card>
            </div>

            {/* Aktivitas & Detail */}
            <div className="col-12 md:col-6">
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-file-edit text-purple-600 text-lg"></i>
                    <span className="font-semibold">Aktivitas & Detail</span>
                  </div>
                }
                className="shadow-2"
              >
                <div className="mb-3">
                  <div className="flex align-items-center gap-2 mb-1">
                    <i className="pi pi-wrench text-primary text-sm"></i>
                    <span className="text-600 text-sm font-medium">Aktivitas</span>
                  </div>
                  <p className="text-900 text-sm m-0 line-height-3">
                    {logbook.AKTIVITAS}
                  </p>
                </div>

                {logbook.DESKRIPSI && (
                  <div className="mb-3">
                    <div className="flex align-items-center gap-2 mb-1">
                      <i className="pi pi-align-left text-primary text-sm"></i>
                      <span className="text-600 text-sm font-medium">Deskripsi Detail</span>
                    </div>
                    <p className="text-900 text-sm m-0 line-height-3">
                      {logbook.DESKRIPSI}
                    </p>
                  </div>
                )}

                {logbook.KENDALA && (
                  <div className="mb-3">
                    <div className="flex align-items-center gap-2 mb-1">
                      <i className="pi pi-exclamation-triangle text-orange-500 text-sm"></i>
                      <span className="text-600 text-sm font-medium">Kendala</span>
                    </div>
                    <p className="text-900 text-sm m-0 line-height-3 surface-100 p-3 border-round">
                      {logbook.KENDALA}
                    </p>
                  </div>
                )}

                {!logbook.DESKRIPSI && !logbook.KENDALA && (
                  <p className="text-500 text-sm">Tidak ada deskripsi atau kendala tambahan</p>
                )}
              </Card>
            </div>

            {/* Foto Bukti */}
            <div className="col-12 md:col-6">
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-image text-pink-600 text-lg"></i>
                    <span className="font-semibold">Foto Bukti</span>
                  </div>
                }
                className="shadow-2"
              >
                {fotoUrl ? (
                  <div className="text-center">
                    <Image
                      src={fotoUrl}
                      alt="Foto Bukti"
                      width="300"
                      preview
                      imageClassName="border-round-lg shadow-4"
                      imageStyle={{
                        maxWidth: '100%',
                        height: 'auto',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="pi pi-image text-6xl text-300 mb-3"></i>
                    <p className="text-500">Tidak ada foto bukti</p>
                  </div>
                )}
              </Card>
            </div>

            {/* History Validasi */}
            <div className="col-12">
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-history text-indigo-600 text-lg"></i>
                    <span className="font-semibold">History Validasi</span>
                  </div>
                }
                className="shadow-2"
              >
                {loadingHistory ? (
                  <div className="text-center py-4">
                    <i className="pi pi-spin pi-spinner text-3xl text-primary"></i>
                  </div>
                ) : validasiHistory.length > 0 ? (
                  <div>
                    {validasiHistory.map((val, idx) => (
                      <div key={idx} className="mb-3 p-3 surface-100 border-round">
                        <div className="flex justify-content-between align-items-start mb-2">
                          <div>
                            <Tag
                              value={val.AKSI}
                              severity={val.AKSI === "Approved" ? "success" : "danger"}
                              className="mb-2"
                            />
                            <div className="text-900 font-semibold">{val.VALIDATOR_NAMA}</div>
                            <div className="text-600 text-sm">{val.VALIDATOR_JABATAN}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-600 text-sm">{formatDateTime(val.created_at)}</div>
                          </div>
                        </div>
                        {val.CATATAN && (
                          <div className="mt-2 p-2 surface-200 border-round">
                            <span className="text-600 text-sm font-medium">Catatan: </span>
                            <span className="text-900 text-sm">{val.CATATAN}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-500 text-center">Belum ada history validasi</p>
                )}
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <i className="pi pi-spin pi-spinner text-6xl text-primary mb-4"></i>
          <p className="text-600 text-lg">Memuat data logbook...</p>
        </div>
      )}
    </Dialog>
  );
};

export default LogbookDetailDialog;