"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { Image } from "primereact/image";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE   = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api").replace(/\/+$/g, "");
const ASSET_BASE = API_BASE.replace(/\/api$/i, "");
const COMPANY    = process.env.NEXT_PUBLIC_COMPANY_NAME || "PT. Perusahaan Indonesia";

const DetailPresensiKaryawan = ({ visible, onHide, data }) => {
  const [karyawan, setKaryawan] = useState(null);
  const [loading, setLoading]   = useState(true);
  const cancelSourceRef         = useRef(null);

  useEffect(() => {
    if (visible && data?.KARYAWAN_ID) {
      fetchKaryawan(data.KARYAWAN_ID);
    } else if (!visible) {
      setKaryawan(null);
      setLoading(true);
    }
    return () => cancelSourceRef.current?.cancel();
  }, [visible, data?.KARYAWAN_ID]);

  const fetchKaryawan = async (id) => {
    setLoading(true);
    cancelSourceRef.current = axios.CancelToken.source();
    try {
      const resp = await axios.get(`${API_BASE}/master-presensi/karyawan-info`, {
        params: { id },
        cancelToken: cancelSourceRef.current.token,
      });
      const resData = resp?.data?.data || null;
      setKaryawan(resData || { NAMA: data?.KARYAWAN_ID, FOTO: null });
    } catch (err) {
      if (!axios.isCancel(err))
        setKaryawan({ NAMA: data?.KARYAWAN_ID || "Unknown", FOTO: null });
    } finally {
      setLoading(false);
    }
  };

  const getFullUrl = (path) => {
    if (!path || path === "NULL" || path === "-" || path === "null") return null;
    if (path.startsWith("data:image") || /^https?:\/\//i.test(path)) return path;
    return `${ASSET_BASE}${path.startsWith("/") ? path : "/" + path}`;
  };

  const getGoogleMapsEmbed = (coords) => {
    if (!coords || coords === "NULL" || typeof coords !== "string") return "";
    return `https://maps.google.com/maps?q=${coords.trim().replace(/\s/g, "")}&z=15&output=embed`;
  };

  const isManual = (lokasi) =>
    !lokasi || lokasi === "Input Admin" || lokasi === "null" || lokasi === "NULL";

  /* ── PRINT SLIP PDF ─────────────────────────────────── */
  const handlePrintSlip = () => {
    if (!data) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "A5" });
    const W   = doc.internal.pageSize.width;
    const H   = doc.internal.pageSize.height;
    const mL  = 12, mR = 12;

    doc.setFillColor(26, 54, 93);
    doc.rect(0, 0, W, 28, "F");
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 28, W, 1.5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("SLIP PRESENSI KARYAWAN", W / 2, 11, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 210, 255);
    doc.text(COMPANY.toUpperCase(), W / 2, 18, { align: "center" });

    doc.setFontSize(7.5);
    doc.text(`Kode: ${data.KODE_PRESENSI || "-"}`, W / 2, 24, { align: "center" });

    const nama  = karyawan?.NAMA       || data.KARYAWAN_ID || "-";
    const jabat = karyawan?.JABATAN    || "-";
    const dept  = karyawan?.DEPARTEMEN || "-";
    const tgl   = data.TANGGAL
      ? new Date(data.TANGGAL).toLocaleDateString("id-ID", {
          weekday: "long", day: "2-digit", month: "long", year: "numeric",
        })
      : "-";

    let y = 35;
    doc.setFillColor(245, 247, 255);
    doc.roundedRect(mL, y, W - mL - mR, 24, 2, 2, "F");
    doc.setDrawColor(200, 210, 230);
    doc.setLineWidth(0.3);
    doc.roundedRect(mL, y, W - mL - mR, 24, 2, 2, "S");

    doc.setTextColor(26, 54, 93);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(nama, mL + 3, y + 8);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 90, 110);
    doc.text(`ID: ${data.KARYAWAN_ID}`, mL + 3, y + 14);
    doc.text(`${jabat} | ${dept}`, mL + 3, y + 19);
    doc.text(tgl, W - mR - 3, y + 19, { align: "right" });

    const statusMasuk  = data.IS_TERLAMBAT == 1   ? "TERLAMBAT"   : "TEPAT WAKTU";
    const statusPulang = data.IS_PULANG_AWAL == 1 ? "PULANG AWAL" : "NORMAL";

    y += 28;
    autoTable(doc, {
      startY: y,
      margin: { left: mL, right: mR },
      head: [["Keterangan", "Detail"]],
      body: [
        ["Status Kehadiran",  data.STATUS || "-"],
        ["Jam Masuk",         data.JAM_MASUK?.substring(0, 5)  || "--:--"],
        ["Lokasi Masuk",      isManual(data.LOKASI_MASUK)  ? "Input Manual" : (data.LOKASI_MASUK  || "-")],
        ["Ketepatan Masuk",   statusMasuk],
        ["Jam Pulang",        data.JAM_KELUAR?.substring(0, 5) || "Belum Pulang"],
        ["Lokasi Pulang",     isManual(data.LOKASI_KELUAR) ? "Input Manual" : (data.LOKASI_KELUAR || "Belum tersedia")],
        ["Status Pulang",     statusPulang],
        ["Keterangan",        data.KETERANGAN || "-"],
        ["Dicatat Pada",      data.created_at ? new Date(data.created_at).toLocaleString("id-ID") : "-"],
      ],
      headStyles: { fillColor: [26, 54, 93], textColor: 255, fontStyle: "bold", fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 255] },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [240, 244, 255] },
        1: { cellWidth: "auto" },
      },
      didParseCell(d) {
        if (d.section === "body" && d.column.index === 1) {
          const raw = String(d.cell.raw);
          if (raw === "TERLAMBAT" || raw === "PULANG AWAL") {
            d.cell.styles.textColor = [192, 57, 43];
            d.cell.styles.fontStyle = "bold";
          }
          if (raw === "TEPAT WAKTU" || raw === "NORMAL") {
            d.cell.styles.textColor = [39, 174, 96];
            d.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    const afterTable = doc.lastAutoTable.finalY + 6;
    if (data.JAM_MASUK && data.JAM_KELUAR) {
      const [hM, mMin] = data.JAM_MASUK.split(":").map(Number);
      const [hK, mK]   = data.JAM_KELUAR.split(":").map(Number);
      const total = hK * 60 + mK - (hM * 60 + mMin);
      if (total > 0) {
        doc.setFillColor(39, 174, 96);
        doc.roundedRect(mL, afterTable, W - mL - mR, 12, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(
          `Total Durasi Kerja: ${Math.floor(total / 60)} jam ${total % 60} menit`,
          W / 2, afterTable + 7.5, { align: "center" }
        );
      }
    }

    const signY = H - 42;
    if (doc.lastAutoTable.finalY + 30 < signY) {
      doc.setDrawColor(180);
      doc.setLineWidth(0.3);
      doc.rect(W - mR - 52, signY, 52, 28, "S");
      doc.setTextColor(80);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Mengetahui,", W - mR - 26, signY + 6, { align: "center" });
      doc.text("HRD Department", W - mR - 26, signY + 22, { align: "center" });
      doc.setLineWidth(0.4);
      doc.line(W - mR - 48, signY + 23, W - mR - 4, signY + 23);
    }

    doc.setFillColor(26, 54, 93);
    doc.rect(0, H - 10, W, 10, "F");
    doc.setTextColor(180, 210, 255);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, mL, H - 4);
    doc.text("Dokumen dicetak otomatis oleh sistem.", W - mR, H - 4, { align: "right" });

    window.open(URL.createObjectURL(doc.output("blob")), "_blank");
  };

  /* ── SUB KOMPONEN ───────────────────────────────────── */
  const LogHeader = ({ title, icon }) => (
    <div className="p-3 flex align-items-center justify-content-between text-white border-round-top-xl"
         style={{ background: "var(--primary-color)" }}>
      <div className="flex align-items-center gap-2">
        <i className={`${icon} text-xl`}></i>
        <span className="font-bold uppercase">{title}</span>
      </div>
      <Badge value="VERIFIED" severity="contrast" />
    </div>
  );

  const fotoKaryawan = getFullUrl(karyawan?.FOTO) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(karyawan?.NAMA || data?.KARYAWAN_ID || "K")}&background=4f46e5&color=fff&size=128&bold=true`;

  /* ── RENDER ─────────────────────────────────────────── */
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal
      header={
        <div className="flex align-items-center gap-3">
          <div className="p-2 border-round-xl shadow-2" style={{ background: "var(--primary-color)" }}>
            <i className="pi pi-eye text-white text-2xl"></i>
          </div>
          <div>
            <span className="font-bold text-2xl block text-900">Detail Presensi</span>
            <span className="text-primary font-bold text-sm">{data?.KODE_PRESENSI}</span>
          </div>
        </div>
      }
      style={{ width: "950px" }}
      breakpoints={{ "960px": "98vw" }}
      contentClassName="p-0 surface-200"
    >
      {data ? (
        <div className="p-3 md:p-5">

          {/* ===== PROFIL KARYAWAN ===== */}
          <div className="surface-0 border-round-2xl shadow-3 p-4 mb-4"
               style={{ borderTop: "4px solid var(--primary-color)" }}>
            <div className="grid align-items-center">

              <div className="col-12 md:col-auto flex justify-content-center">
                {loading ? (
                  <Skeleton width="100px" height="100px" className="border-round-xl" />
                ) : (
                  <img
                    src={fotoKaryawan}
                    alt={karyawan?.NAMA || "foto"}
                    className="shadow-3 border-round-xl border-1 border-200"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                )}
              </div>

              <div className="col-12 md:col text-center md:text-left">
                <div className="flex flex-column md:flex-row md:align-items-center gap-2 mb-2 justify-content-center md:justify-content-start">
                  <h1 className="m-0 text-2xl font-bold text-900">
                    {loading
                      ? <Skeleton width="200px" height="1.8rem" />
                      : (karyawan?.NAMA || data.KARYAWAN_ID)
                    }
                  </h1>
                  <Tag
                    value={data.STATUS}
                    severity={
                      data.STATUS === "Hadir" ? "success" :
                      data.STATUS === "Sakit" ? "warning" :
                      data.STATUS === "Izin"  ? "info" : "danger"
                    }
                    rounded
                  />
                </div>
                <div className="flex flex-wrap justify-content-center md:justify-content-start gap-3 text-sm text-600">
                  <span className="flex align-items-center gap-1">
                    <i className="pi pi-id-card text-primary"></i>
                    <span>{data.KARYAWAN_ID}</span>
                  </span>
                  {karyawan?.JABATAN && (
                    <span className="flex align-items-center gap-1 border-left-1 border-300 pl-3">
                      <i className="pi pi-briefcase text-primary"></i> {karyawan.JABATAN}
                    </span>
                  )}
                  {karyawan?.DEPARTEMEN && (
                    <span className="flex align-items-center gap-1 border-left-1 border-300 pl-3">
                      <i className="pi pi-building text-primary"></i> {karyawan.DEPARTEMEN}
                    </span>
                  )}
                  <span className="flex align-items-center gap-1 border-left-1 border-300 pl-3">
                    <i className="pi pi-calendar text-primary"></i>
                    {new Date(data.TANGGAL).toLocaleDateString("id-ID", {
                      weekday: "long", year: "numeric", month: "long", day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="col-12 md:col-auto flex flex-row md:flex-column gap-2 justify-content-center">
                <Button
                  icon="pi pi-print"
                  label="Cetak Slip"
                  outlined
                  severity="secondary"
                  onClick={handlePrintSlip}
                  tooltip="Cetak slip presensi PDF"
                  tooltipOptions={{ position: "top" }}
                />
              </div>

            </div>
          </div>

          {/* ===== CHECK-IN & CHECK-OUT ===== */}
          <div className="grid pb-4">

            {/* CHECK-IN */}
            <div className="col-12 md:col-6">
              <div className="surface-0 border-round-xl shadow-3 h-full flex flex-column overflow-hidden border-1 border-200">
                <LogHeader title="Check-In Masuk" icon="pi pi-sign-in" />
                <div className="p-4 flex-grow-1">
                  <div className="flex justify-content-between align-items-start mb-4">
                    <div>
                      <small className="text-500 font-bold uppercase block mb-1">Jam Masuk</small>
                      <div className="text-4xl font-bold text-primary font-mono">{data.JAM_MASUK || "--:--"}</div>
                      <Tag
                        className="mt-2"
                        icon={data.IS_TERLAMBAT ? "pi pi-exclamation-circle" : "pi pi-check-circle"}
                        severity={data.IS_TERLAMBAT ? "danger" : "success"}
                        value={data.IS_TERLAMBAT ? "TERLAMBAT" : "TEPAT WAKTU"}
                      />
                    </div>
                    <div>
                      <small className="text-500 font-bold uppercase block mb-1 text-right">Foto Masuk</small>
                      {getFullUrl(data.FOTO_MASUK) ? (
                        <Image
                          src={getFullUrl(data.FOTO_MASUK)}
                          width="90"
                          preview
                          imageClassName="border-round-xl shadow-3 border-1 border-200"
                        />
                      ) : (
                        <div className="w-5rem h-5rem surface-100 border-round-xl flex flex-column align-items-center justify-content-center text-400 border-1 border-200">
                          <i className="pi pi-camera text-xl mb-1"></i>
                          <small className="text-xs">No Image</small>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 surface-100 border-round-xl border-1 border-200">
                    <div className="flex justify-content-between align-items-center mb-2">
                      <span className="text-xs font-bold text-600 uppercase">Lokasi GPS Masuk</span>
                      <i className="pi pi-map-marker text-primary"></i>
                    </div>
                    <code className="text-xs text-800 block mb-3 bg-white p-2 border-round border-1 border-200">
                      {data.LOKASI_MASUK || "Tidak tersedia"}
                    </code>
                    {!isManual(data.LOKASI_MASUK) ? (
                      <iframe
                        src={getGoogleMapsEmbed(data.LOKASI_MASUK)}
                        width="100%" height="170"
                        style={{ border: 0, borderRadius: "10px" }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-6rem bg-white border-round-xl flex align-items-center justify-content-center border-1 border-200">
                        <span className="text-400 text-xs italic">Input Manual — GPS tidak tersedia</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CHECK-OUT */}
            <div className="col-12 md:col-6">
              <div className="surface-0 border-round-xl shadow-3 h-full flex flex-column overflow-hidden border-1 border-200">
                <LogHeader title="Check-Out Pulang" icon="pi pi-sign-out" />
                <div className="p-4 flex-grow-1">
                  <div className="flex justify-content-between align-items-start mb-4">
                    <div>
                      <small className="text-500 font-bold uppercase block mb-1">Jam Pulang</small>
                      <div className="text-4xl font-bold text-primary font-mono">{data.JAM_KELUAR || "--:--"}</div>
                      <Tag
                        className="mt-2"
                        icon={data.IS_PULANG_AWAL ? "pi pi-exclamation-triangle" : "pi pi-check-square"}
                        severity={data.IS_PULANG_AWAL ? "warning" : "info"}
                        value={data.IS_PULANG_AWAL ? "PULANG AWAL" : "NORMAL / OVERTIME"}
                      />
                    </div>
                    <div>
                      <small className="text-500 font-bold uppercase block mb-1 text-right">Foto Pulang</small>
                      {getFullUrl(data.FOTO_KELUAR) ? (
                        <Image
                          src={getFullUrl(data.FOTO_KELUAR)}
                          width="90"
                          preview
                          imageClassName="border-round-xl shadow-3 border-1 border-200"
                        />
                      ) : (
                        <div className="w-5rem h-5rem surface-100 border-round-xl flex flex-column align-items-center justify-content-center text-400 border-1 border-200">
                          <i className="pi pi-camera text-xl mb-1"></i>
                          <small className="text-xs">No Image</small>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 surface-100 border-round-xl border-1 border-200">
                    <div className="flex justify-content-between align-items-center mb-2">
                      <span className="text-xs font-bold text-600 uppercase">Lokasi GPS Pulang</span>
                      <i className="pi pi-map-marker text-primary"></i>
                    </div>
                    <code className="text-xs text-800 block mb-3 bg-white p-2 border-round border-1 border-200">
                      {data.LOKASI_KELUAR || "Menunggu data..."}
                    </code>
                    {!isManual(data.LOKASI_KELUAR) ? (
                      <iframe
                        src={getGoogleMapsEmbed(data.LOKASI_KELUAR)}
                        width="100%" height="170"
                        style={{ border: 0, borderRadius: "10px" }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-6rem bg-white border-round-xl flex align-items-center justify-content-center border-1 border-200">
                        {data.JAM_KELUAR ? (
                          <span className="text-400 text-xs italic">Input Manual — GPS tidak tersedia</span>
                        ) : (
                          <div className="text-center">
                            <i className="pi pi-spin pi-spinner text-400 text-2xl mb-2 block"></i>
                            <span className="text-500 text-xs italic">Menunggu absen pulang...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== BANNER DURASI ===== */}
          {data.JAM_MASUK && data.JAM_KELUAR && (() => {
            const [hM, mM] = data.JAM_MASUK.split(":").map(Number);
            const [hK, mK] = data.JAM_KELUAR.split(":").map(Number);
            const total = hK * 60 + mK - (hM * 60 + mM);
            if (total <= 0) return null;
            return (
              <div className="text-white p-3 border-round-xl shadow-2 mb-4 flex align-items-center justify-content-center gap-3"
                   style={{ background: "var(--primary-color)" }}>
                <i className="pi pi-clock text-2xl"></i>
                <div className="text-center">
                  <div className="text-xs font-bold uppercase opacity-80 mb-1">Total Durasi Kerja</div>
                  <div className="text-2xl font-bold">
                    {Math.floor(total / 60)} jam {total % 60} menit
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ===== FOOTER KETERANGAN ===== */}
          <div className="surface-900 text-white p-4 border-round-2xl shadow-4">
            <div className="grid">
              <div className="col-12 md:col-8">
                <div className="flex align-items-center gap-2 mb-2 text-primary">
                  <i className="pi pi-comments"></i>
                  <span className="font-bold uppercase text-xs">Catatan Karyawan</span>
                </div>
                <p className="m-0 text-gray-100 line-height-3 italic">
                  "{data.KETERANGAN || "Tidak ada catatan tambahan untuk presensi hari ini."}"
                </p>
              </div>
              <div className="col-12 md:col-4 md:text-right flex flex-column justify-content-end">
                <small className="text-500 uppercase block mb-1">Dicatat Pada</small>
                <span className="font-mono text-primary font-bold text-sm">
                  {data.created_at ? new Date(data.created_at).toLocaleString("id-ID") : "-"}
                </span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="p-8 text-center">
          <i className="pi pi-spin pi-spinner text-6xl text-primary mb-4 block"></i>
          <h3 className="text-400 font-light m-0 uppercase">Memuat data...</h3>
        </div>
      )}
    </Dialog>
  );
};

export default DetailPresensiKaryawan;