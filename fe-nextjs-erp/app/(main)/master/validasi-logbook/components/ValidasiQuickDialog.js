"use client";

import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { useState, useEffect } from "react";

const ValidasiQuickDialog = ({ visible, onHide, logbook, onValidasi, mode = "reject" }) => {
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setCatatan("");
    }
  }, [visible]);

  const handleApprove = async () => {
    setLoading(true);
    await onValidasi(logbook.LOGBOOK_ID, "Approved", catatan || "Approved by HR");
    setLoading(false);
    setCatatan("");
  };

  const handleReject = async () => {
    if (!catatan.trim()) {
      alert("Catatan wajib diisi untuk reject!");
      return;
    }
    setLoading(true);
    await onValidasi(logbook.LOGBOOK_ID, "Rejected", catatan);
    setLoading(false);
    setCatatan("");
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

  const dialogFooter = (
    <div className="flex justify-content-between">
      <Button
        label="Batal"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
        disabled={loading}
      />
      <div className="flex gap-2">
        {mode === "both" && (
          <Button
            label="Approve"
            icon="pi pi-check"
            onClick={handleApprove}
            className="p-button-success"
            loading={loading}
          />
        )}
        <Button
          label="Reject"
          icon="pi pi-times-circle"
          onClick={handleReject}
          className="p-button-danger"
          loading={loading}
        />
      </div>
    </div>
  );

  const getHeaderConfig = () => {
    if (mode === "reject") {
      return {
        title: "Reject Logbook",
        icon: "pi pi-times-circle text-red-500",
        cardClass: "bg-red-50"
      };
    }
    return {
      title: "Validasi Logbook",
      icon: "pi pi-check-circle text-orange-500",
      cardClass: "bg-orange-50"
    };
  };

  const headerConfig = getHeaderConfig();

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-2">
          <i className={headerConfig.icon}></i>
          <span>{headerConfig.title}</span>
        </div>
      }
      visible={visible}
      style={{ width: "700px", maxWidth: "95vw" }}
      onHide={onHide}
      footer={dialogFooter}
      modal
      className="p-fluid"
      dismissableMask
    >
      {logbook ? (
        <div>
          {/* Info Card */}
          <Card className={`mb-4 ${headerConfig.cardClass}`}>
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="mb-3">
                  <span className="text-600 text-sm block mb-1">Logbook ID:</span>
                  <div className="text-900 font-bold text-lg">{logbook.LOGBOOK_ID}</div>
                </div>
                <div className="mb-3">
                  <span className="text-600 text-sm block mb-1">Karyawan:</span>
                  <div className="text-900 font-semibold">{logbook.NAMA_KARYAWAN}</div>
                  <small className="text-500">{logbook.NIK}</small>
                </div>
                <div className="mb-3">
                  <span className="text-600 text-sm block mb-1">Departemen:</span>
                  <Tag value={logbook.DEPARTEMEN} severity="info" />
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div className="mb-3">
                  <span className="text-600 text-sm block mb-1">Batch:</span>
                  <div className="text-900 font-semibold">{logbook.BATCH_ID}</div>
                  <small className="text-500">{logbook.NAMA_BATCH}</small>
                </div>
                <div className="mb-3">
                  <span className="text-600 text-sm block mb-1">Tanggal:</span>
                  <div className="text-900 font-semibold">{formatDate(logbook.TANGGAL)}</div>
                </div>
                <div className="flex gap-4">
                <div className="mb-2">
                <span className="text-600 text-sm">Jam Kerja:</span>
                <div className="text-900 font-semibold">
                    {(() => {
                    if (!logbook.JAM_KERJA) return "-";
                    
                    const parts = logbook.JAM_KERJA.toString().split(':');
                    if (parts.length === 2) {
                        const hours = parseInt(parts[0]) || 0;
                        const minutes = parseInt(parts[1]) || 0;
                        
                        if (hours > 0 && minutes > 0) {
                        return `${hours} jam ${minutes} menit (${logbook.JAM_MULAI} - ${logbook.JAM_SELESAI || '-'})`;
                        } else if (hours > 0) {
                        return `${hours} jam (${logbook.JAM_MULAI} - ${logbook.JAM_SELESAI || '-'})`;
                        } else if (minutes > 0) {
                        return `${minutes} menit (${logbook.JAM_MULAI} - ${logbook.JAM_SELESAI || '-'})`;
                        }
                    }
                    
                    return `${logbook.JAM_MULAI} - ${logbook.JAM_SELESAI || '-'}`;
                    })()}
                </div>
                </div>

                <div className="mb-2">
                <span className="text-600 text-sm">Output:</span>
                <div className="text-900 font-semibold">{Math.floor(logbook.JUMLAH_OUTPUT || 0)} unit</div>
                </div>
                </div>
              </div>
            </div>
          </Card>

          <Divider />

          {/* Aktivitas */}
          <div className="mb-3">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-wrench text-primary"></i>
              <label className="font-semibold text-900">Aktivitas:</label>
            </div>
            <div className="surface-100 p-3 border-round">
              <p className="text-700 m-0 line-height-3">{logbook.AKTIVITAS}</p>
            </div>
          </div>

          {/* Deskripsi (jika ada) */}
          {logbook.DESKRIPSI && (
            <div className="mb-3">
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-align-left text-primary"></i>
                <label className="font-semibold text-900">Deskripsi:</label>
              </div>
              <div className="surface-100 p-3 border-round">
                <p className="text-700 m-0 line-height-3">{logbook.DESKRIPSI}</p>
              </div>
            </div>
          )}

          {/* Kendala (jika ada) */}
          {logbook.KENDALA && (
            <div className="mb-3">
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-exclamation-triangle text-orange-500"></i>
                <label className="font-semibold text-900">Kendala:</label>
              </div>
              <div className="bg-orange-50 p-3 border-round border-1 border-orange-200">
                <p className="text-700 m-0 line-height-3">{logbook.KENDALA}</p>
              </div>
            </div>
          )}

          <Divider />

          {/* Catatan Validasi */}
          <div className="mt-4">
            <label htmlFor="catatan" className="font-semibold text-900 mb-2 block">
              {mode === "reject" ? (
                <>
                  Alasan Reject <span className="text-red-500">*</span>
                </>
              ) : (
                "Catatan Validasi (opsional)"
              )}
            </label>
            <InputTextarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={4}
              placeholder={
                mode === "reject"
                  ? "Jelaskan alasan reject logbook ini..."
                  : "Tambahkan catatan (opsional)..."
              }
              className="w-full"
            />
            {mode === "reject" && (
              <small className="text-red-500 block mt-2">
                <i className="pi pi-info-circle mr-1"></i>
                Wajib diisi. Karyawan akan menerima notifikasi dengan alasan ini.
              </small>
            )}
            {mode === "both" && (
              <small className="text-500 block mt-2">
                <i className="pi pi-info-circle mr-1"></i>
                Catatan akan disimpan dalam history validasi logbook.
              </small>
            )}
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

export default ValidasiQuickDialog;