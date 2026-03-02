"use client";

import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Timeline } from "primereact/timeline";
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

  const customizedMarker = (item) => {
    return (
      <span className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2" style={{ backgroundColor: '#FF9800' }}>
        <i className="pi pi-refresh"></i>
      </span>
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

        {item.DATA_SEBELUM && (
          <div className="mt-3">
            <small className="text-600 font-semibold">Data Sebelum Revisi:</small>
            <pre className="surface-100 p-2 border-round text-sm mt-1" style={{ maxHeight: '200px', overflow: 'auto' }}>
              {JSON.stringify(JSON.parse(item.DATA_SEBELUM), null, 2)}
            </pre>
          </div>
        )}
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
      style={{ width: "800px", maxWidth: "95vw" }}
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