"use client";

import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Timeline } from "primereact/timeline";
import { Divider } from "primereact/divider";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LogbookRevisiDialog = ({ visible, onHide, logbook }) => {
  const [revisiHistory, setRevisiHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && logbook) {
      fetchRevisiHistory();
    }
  }, [visible, logbook]);

  const fetchRevisiHistory = async () => {
    if (!logbook?.LOGBOOK_ID) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("TOKEN");
      const res = await axios.get(
        `${API_URL}/logbook-pekerjaan/${logbook.LOGBOOK_ID}/revisi`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === "00") {
        setRevisiHistory(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching revisi history:", err);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString.substring(0, 5);
  };

  const formatJamKerja = (jamKerja) => {
    if (!jamKerja) return "-";
    
    const parts = jamKerja.toString().split(':');
    if (parts.length === 2) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      
      if (hours > 0 && minutes > 0) {
        return `${hours} jam ${minutes} menit`;
      } else if (hours > 0) {
        return `${hours} jam`;
      } else if (minutes > 0) {
        return `${minutes} menit`;
      }
    }
    
    return jamKerja;
  };

  const customizedMarker = (item) => {
    return (
      <span className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2" style={{ backgroundColor: '#FF9800' }}>
        <i className="pi pi-refresh"></i>
      </span>
    );
  };

  const renderComparison = (item) => {
    if (!item.DATA_SEBELUM) return null;

    const sebelum = JSON.parse(item.DATA_SEBELUM);
    const sesudah = item.DATA_SESUDAH ? JSON.parse(item.DATA_SESUDAH) : null;

    // ✅ Compare fields yang berubah
    const changes = [];

    if (sesudah) {
      if (sebelum.TANGGAL !== sesudah.TANGGAL) {
        changes.push({
          field: "Tanggal",
          before: formatDate(sebelum.TANGGAL),
          after: formatDate(sesudah.TANGGAL)
        });
      }

      if (sebelum.JAM_MULAI !== sesudah.JAM_MULAI) {
        changes.push({
          field: "Jam Mulai",
          before: formatTime(sebelum.JAM_MULAI),
          after: formatTime(sesudah.JAM_MULAI)
        });
      }

      if (sebelum.JAM_SELESAI !== sesudah.JAM_SELESAI) {
        changes.push({
          field: "Jam Selesai",
          before: formatTime(sebelum.JAM_SELESAI),
          after: formatTime(sesudah.JAM_SELESAI)
        });
      }

      if (sebelum.JAM_KERJA !== sesudah.JAM_KERJA) {
        changes.push({
          field: "Jam Kerja",
          before: formatJamKerja(sebelum.JAM_KERJA),
          after: formatJamKerja(sesudah.JAM_KERJA)
        });
      }

      if (sebelum.AKTIVITAS !== sesudah.AKTIVITAS) {
        changes.push({
          field: "Aktivitas",
          before: sebelum.AKTIVITAS,
          after: sesudah.AKTIVITAS
        });
      }

      if (sebelum.DESKRIPSI !== sesudah.DESKRIPSI) {
        changes.push({
          field: "Deskripsi",
          before: sebelum.DESKRIPSI || "-",
          after: sesudah.DESKRIPSI || "-"
        });
      }

      if (sebelum.JUMLAH_OUTPUT !== sesudah.JUMLAH_OUTPUT) {
        changes.push({
          field: "Jumlah Output",
          before: `${Math.floor(sebelum.JUMLAH_OUTPUT || 0)} unit`,
          after: `${Math.floor(sesudah.JUMLAH_OUTPUT || 0)} unit`
        });
      }

      if (sebelum.KENDALA !== sesudah.KENDALA) {
        changes.push({
          field: "Kendala",
          before: sebelum.KENDALA || "-",
          after: sesudah.KENDALA || "-"
        });
      }
    }

    return (
      <div className="mt-3">
        {!sesudah ? (
          // ✅ Jika belum submit ulang
          <div className="surface-100 p-3 border-round">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-info-circle text-orange-500"></i>
              <span className="text-600 font-semibold">Status: Belum Submit Ulang</span>
            </div>
            <small className="text-500">
              Logbook sudah direvisi tapi belum di-submit ulang. 
              Data setelah revisi akan muncul setelah submit.
            </small>
          </div>
        ) : changes.length > 0 ? (
          // ✅ Jika ada perubahan
          <div>
            <div className="flex align-items-center gap-2 mb-3">
              <i className="pi pi-sync text-primary"></i>
              <span className="text-600 font-semibold">Perubahan yang Dilakukan:</span>
            </div>
            
            {changes.map((change, idx) => (
              <div key={idx} className="mb-3 p-3 surface-50 border-round">
                <div className="font-semibold text-primary mb-2">{change.field}</div>
                <div className="grid">
                  <div className="col-6">
                    <small className="text-600">Sebelum:</small>
                    <div className="surface-100 p-2 border-round mt-1">
                      <span className="text-red-600 line-through">{change.before}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <small className="text-600">Sesudah:</small>
                    <div className="surface-100 p-2 border-round mt-1">
                      <span className="text-green-600 font-semibold">{change.after}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ✅ Jika tidak ada perubahan (hanya submit ulang tanpa edit)
          <div className="surface-100 p-3 border-round">
            <div className="flex align-items-center gap-2">
              <i className="pi pi-check-circle text-green-500"></i>
              <span className="text-600">Tidak ada perubahan data (submit ulang tanpa edit)</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const customizedContent = (item) => {
    return (
      <Card className="shadow-2 mt-3 mb-3">
        <div className="flex justify-content-between align-items-start mb-2">
          <div>
            <div className="text-xl font-bold text-900 mb-2">Revisi ke-{item.REVISI_KE}</div>
            <div className="flex gap-2 mb-2">
              <Tag value={item.STATUS_SEBELUM} severity="danger" icon="pi pi-times-circle" />
              <i className="pi pi-arrow-right text-500"></i>
              <Tag value={item.STATUS_SESUDAH} severity="secondary" icon="pi pi-file-edit" />
            </div>
          </div>
        </div>

        <div className="grid mt-3">
          <div className="col-12 md:col-6">
            <small className="text-600">Direvisi Oleh:</small>
            <div className="font-semibold">{item.REVISED_BY_NAMA}</div>
            <small className="text-500">{item.REVISED_BY_JABATAN}</small>
          </div>
          <div className="col-12 md:col-6">
            <small className="text-600">Tanggal Revisi:</small>
            <div className="font-semibold">{formatDateTime(item.created_at)}</div>
          </div>
        </div>

        {item.ALASAN_REVISI && (
          <div className="mt-3 p-3 surface-100 border-round">
            <small className="text-600 font-semibold">Alasan Revisi:</small>
            <p className="text-900 m-0 mt-1">{item.ALASAN_REVISI}</p>
          </div>
        )}

        <Divider />

        {/* ✅ Comparison Before vs After */}
        {renderComparison(item)}
      </Card>
    );
  };

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-3">
          <i className="pi pi-history text-primary text-2xl"></i>
          <div>
            <h3 className="m-0 text-xl font-bold text-900">Riwayat Revisi</h3>
            <p className="m-0 text-sm text-600 mt-1">History revisi logbook {logbook?.LOGBOOK_ID}</p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "1000px", maxWidth: "95vw" }}
      modal
      draggable={false}
      onHide={onHide}
      className="p-fluid"
    >
      {loading ? (
        <div className="text-center py-4">
          <i className="pi pi-spin pi-spinner text-3xl text-primary"></i>
        </div>
      ) : revisiHistory.length > 0 ? (
        <Timeline 
          value={revisiHistory} 
          opposite={(item) => formatDateTime(item.created_at)}
          marker={customizedMarker}
          content={customizedContent}
        />
      ) : (
        <div className="text-center py-8">
          <i className="pi pi-inbox text-6xl text-300 mb-3"></i>
          <p className="text-500">Belum ada riwayat revisi</p>
        </div>
      )}
    </Dialog>
  );
};

export default LogbookRevisiDialog;
