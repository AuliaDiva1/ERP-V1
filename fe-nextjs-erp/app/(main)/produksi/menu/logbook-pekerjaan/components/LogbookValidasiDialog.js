"use client";

import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useState } from "react";

const LogbookValidasiDialog = ({ visible, onHide, logbook, onValidasi }) => {
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleValidasi = async (aksi) => {
    setLoading(true);
    await onValidasi(logbook?.LOGBOOK_ID, aksi, catatan);
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

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-3">
          <i className="pi pi-check-circle text-primary text-2xl"></i>
          <div>
            <h3 className="m-0 text-xl font-bold text-900">Validasi Logbook</h3>
            <p className="m-0 text-sm text-600 mt-1">Approve atau Reject logbook pekerjaan</p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "700px", maxWidth: "95vw" }}
      modal
      onHide={onHide}
      className="p-fluid"
    >
      {logbook ? (
        <div>
          {/* Info Logbook */}
          <div className="surface-100 border-round p-3 mb-4">
            <div className="grid">
              <div className="col-6">
                <div className="text-600 text-sm mb-1">Kode Logbook</div>
                <div className="text-900 font-bold">{logbook.LOGBOOK_ID}</div>
              </div>
              <div className="col-6">
                <div className="text-600 text-sm mb-1">Tanggal</div>
                <div className="text-900 font-bold">{formatDate(logbook.TANGGAL)}</div>
              </div>
              <div className="col-6">
                <div className="text-600 text-sm mb-1">Karyawan</div>
                <div className="text-900 font-bold">{logbook.NAMA_KARYAWAN}</div>
              </div>
              <div className="col-6">
                <div className="text-600 text-sm mb-1">Batch</div>
                <div className="text-900 font-bold">{logbook.NAMA_BATCH}</div>
              </div>
              <div className="col-6">
                <div className="text-600 text-sm mb-1">Jam Kerja</div>
                <div className="text-900 font-bold">{logbook.JAM_KERJA} jam</div>
              </div>
              <div className="col-6">
                <div className="text-600 text-sm mb-1">Output</div>
                <div className="text-900 font-bold">{logbook.JUMLAH_OUTPUT} unit</div>
              </div>
              <div className="col-12">
                <div className="text-600 text-sm mb-1">Aktivitas</div>
                <div className="text-900">{logbook.AKTIVITAS}</div>
              </div>
            </div>
          </div>

          {/* Form Catatan */}
          <div className="mb-4">
            <label htmlFor="catatan" className="font-semibold mb-2 block">
              Catatan Validasi
            </label>
            <InputTextarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={4}
              placeholder="Tambahkan catatan untuk karyawan (opsional)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-content-end">
            <Button
              label="Batal"
              icon="pi pi-times"
              className="p-button-text"
              onClick={onHide}
              disabled={loading}
            />
            <Button
              label="Reject"
              icon="pi pi-times-circle"
              className="p-button-danger"
              onClick={() => handleValidasi("Rejected")}
              loading={loading}
            />
            <Button
              label="Approve"
              icon="pi pi-check-circle"
              className="p-button-success"
              onClick={() => handleValidasi("Approved")}
              loading={loading}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
        </div>
      )}
    </Dialog>
  );
};

export default LogbookValidasiDialog;