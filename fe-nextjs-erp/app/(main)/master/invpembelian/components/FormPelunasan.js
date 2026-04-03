"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";

/**
 * FormPelunasan — support multi-payment (cicilan berkali-kali)
 *
 * Props:
 *   visible      {boolean}  - kontrol tampil modal
 *   onHide       {function} - tutup modal
 *   invoiceData  {object}   - data invoice terpilih (harus fresh agar SISA_TAGIHAN terkini)
 *   onSave       {function} - callback hit API
 */
export default function FormPelunasan({ visible, onHide, invoiceData, onSave }) {
  const [payload, setPayload] = useState({
    NO_KWITANSI: "",
    NO_INVOICE_BELI: "",
    NOMINAL_BAYAR: 0,
    TGL_BAYAR: new Date(),
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sinkronisasi data saat modal dibuka / invoiceData berubah (misal setelah cicilan pertama)
  useEffect(() => {
    if (invoiceData && visible) {
      setPayload({
        NO_KWITANSI: `KW-${Date.now()}`,
        NO_INVOICE_BELI: invoiceData.NO_INVOICE_BELI,
        NOMINAL_BAYAR: parseFloat(invoiceData.SISA_TAGIHAN) || 0,
        TGL_BAYAR: new Date(),
      });
      setError("");
    }
  }, [invoiceData, visible]);

  const sisaTagihan = parseFloat(invoiceData?.SISA_TAGIHAN || 0);
  const totalTagihan = parseFloat(invoiceData?.TOTAL_BAYAR || 0);
  const sudahDibayar = totalTagihan - sisaTagihan;

  const handleSubmit = async () => {
    setError("");

    // Validasi
    if (!payload.NO_KWITANSI.trim()) {
      setError("No. Kwitansi wajib diisi");
      return;
    }
    if (!payload.NOMINAL_BAYAR || payload.NOMINAL_BAYAR <= 0) {
      setError("Nominal bayar tidak boleh nol atau negatif");
      return;
    }
    if (payload.NOMINAL_BAYAR > sisaTagihan) {
      setError(
        `Nominal bayar (${new Intl.NumberFormat("id-ID").format(
          payload.NOMINAL_BAYAR
        )}) melebihi sisa tagihan (${new Intl.NumberFormat("id-ID").format(sisaTagihan)})`
      );
      return;
    }

    const formattedDate =
      payload.TGL_BAYAR instanceof Date
        ? payload.TGL_BAYAR.toISOString().split("T")[0]
        : payload.TGL_BAYAR;

    const finalData = {
      ...payload,
      NOMINAL_BAYAR: parseFloat(payload.NOMINAL_BAYAR),
      TGL_BAYAR: formattedDate,
    };

    setLoading(true);
    try {
      await onSave(finalData);
      // onSave di parent bertanggung jawab menutup modal & refresh data
    } finally {
      setLoading(false);
    }
  };

  // Hitung preview sisa setelah bayar
  const sisaSetelahBayar = Math.max(0, sisaTagihan - (payload.NOMINAL_BAYAR || 0));
  const akanLunas = payload.NOMINAL_BAYAR >= sisaTagihan;

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Batal"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text p-button-secondary"
        disabled={loading}
      />
      <Button
        label={akanLunas ? "Proses LUNAS" : "Proses Cicilan"}
        icon={akanLunas ? "pi pi-check-circle" : "pi pi-credit-card"}
        onClick={handleSubmit}
        severity={akanLunas ? "success" : "info"}
        raised
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-wallet text-primary" style={{ fontSize: "1.5rem" }}></i>
          <span>Pembayaran Hutang Vendor</span>
          {invoiceData && (
            <span className="text-500 text-sm font-normal ml-1">
              — {invoiceData.NO_INVOICE_BELI}
            </span>
          )}
        </div>
      }
      visible={visible}
      style={{ width: "480px" }}
      breakpoints={{ "960px": "75vw", "641px": "92vw" }}
      modal
      footer={footer}
      onHide={onHide}
      draggable={false}
    >
      <div className="flex flex-column gap-3 mt-2">

        {/* ERROR MESSAGE */}
        {error && (
          <Message severity="error" text={error} className="w-full" />
        )}

        {/* RINGKASAN HUTANG */}
        <div className="surface-50 border-round-lg p-3 border-1 border-300">
          <div className="grid m-0">
            <div className="col-4 text-center">
              <div className="text-500 text-xs mb-1">Total Tagihan</div>
              <div className="font-semibold text-sm">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalTagihan)}
              </div>
            </div>
            <div className="col-4 text-center border-x-1 border-300">
              <div className="text-500 text-xs mb-1">Sudah Dibayar</div>
              <div className="font-semibold text-sm text-green-600">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(sudahDibayar)}
              </div>
            </div>
            <div className="col-4 text-center">
              <div className="text-500 text-xs mb-1">Sisa Hutang</div>
              <div className="font-bold text-sm text-red-500">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(sisaTagihan)}
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-1" />

        {/* NO KWITANSI */}
        <div className="p-field">
          <label htmlFor="kwitansi" className="font-bold block mb-2">
            No. Kwitansi / Ref <span className="text-red-500">*</span>
          </label>
          <InputText
            id="kwitansi"
            value={payload.NO_KWITANSI}
            onChange={(e) => setPayload({ ...payload, NO_KWITANSI: e.target.value })}
            className="w-full"
            placeholder="Contoh: KW-12345"
          />
        </div>

        {/* NOMINAL BAYAR */}
        <div className="p-field">
          <label htmlFor="bayar" className="font-bold block mb-2 text-primary">
            Nominal yang Dibayar <span className="text-red-500">*</span>
          </label>
          <InputNumber
            id="bayar"
            value={payload.NOMINAL_BAYAR}
            onValueChange={(e) => setPayload({ ...payload, NOMINAL_BAYAR: e.value })}
            mode="currency"
            currency="IDR"
            locale="id-ID"
            className="w-full"
            autoFocus
            max={sisaTagihan}
            min={1}
          />
          {/* Preview status setelah bayar */}
          <div
            className={`mt-2 p-2 border-round text-sm font-semibold text-center ${
              akanLunas
                ? "bg-green-50 text-green-700 border-1 border-green-300"
                : "bg-blue-50 text-blue-700 border-1 border-blue-300"
            }`}
          >
            {akanLunas ? (
              <>
                <i className="pi pi-check-circle mr-1"></i>
                Status akan menjadi <strong>LUNAS</strong>
              </>
            ) : (
              <>
                <i className="pi pi-info-circle mr-1"></i>
                Status akan menjadi <strong>CICIL</strong> — sisa:{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(sisaSetelahBayar)}
              </>
            )}
          </div>
        </div>

        {/* TANGGAL BAYAR */}
        <div className="p-field">
          <label htmlFor="tgl" className="font-bold block mb-2">
            Tanggal Bayar
          </label>
          <Calendar
            id="tgl"
            value={payload.TGL_BAYAR}
            onChange={(e) => setPayload({ ...payload, TGL_BAYAR: e.value })}
            showIcon
            className="w-full"
            dateFormat="dd/mm/yy"
            maxDate={new Date()}
          />
        </div>

      </div>
    </Dialog>
  );
}
