"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

/**
 * Komponen Form Pelunasan / Cicilan Hutang
 * @param {boolean} visible - Kontrol tampilan modal
 * @param {function} onHide - Fungsi untuk menutup modal
 * @param {object} invoiceData - Data invoice yang dipilih dari tabel
 * @param {function} onSave - Fungsi callback untuk hit API ke backend
 */
export default function FormPelunasan({ visible, onHide, invoiceData, onSave }) {
  const [payload, setPayload] = useState({
    NO_KWITANSI: "",
    NO_INVOICE_BELI: "",
    NOMINAL_BAYAR: 0,
    TGL_BAYAR: new Date(),
  });

  // Sinkronisasi data saat modal dibuka
  useEffect(() => {
    if (invoiceData && visible) {
      setPayload({
        NO_KWITANSI: `KW-${Date.now()}`, // Generate default kwitansi
        NO_INVOICE_BELI: invoiceData.NO_INVOICE_BELI,
        NOMINAL_BAYAR: parseFloat(invoiceData.SISA_TAGIHAN) || 0,
        TGL_BAYAR: new Date(),
      });
    }
  }, [invoiceData, visible]);

  const handleSubmit = () => {
    // 1. Validasi nominal tidak nol
    if (payload.NOMINAL_BAYAR <= 0) {
      alert("Nominal bayar tidak boleh nol atau negatif");
      return;
    }

    // 2. Validasi nominal tidak melebihi sisa (Double check frontend)
    if (payload.NOMINAL_BAYAR > parseFloat(invoiceData.SISA_TAGIHAN)) {
      alert("Nominal bayar melebihi sisa tagihan!");
      return;
    }

    // 3. Formatting Tanggal ke YYYY-MM-DD (ISO Format) agar diterima Knex/MySQL
    const formattedDate = payload.TGL_BAYAR instanceof Date 
      ? payload.TGL_BAYAR.toISOString().split('T')[0] 
      : payload.TGL_BAYAR;

    const finalData = {
      ...payload,
      NOMINAL_BAYAR: parseFloat(payload.NOMINAL_BAYAR),
      TGL_BAYAR: formattedDate
    };

    onSave(finalData);
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button 
        label="Batal" 
        icon="pi pi-times" 
        onClick={onHide} 
        className="p-button-text p-button-secondary" 
      />
      <Button 
        label="Proses Pembayaran" 
        icon="pi pi-check" 
        onClick={handleSubmit} 
        severity="success" 
        raised
      />
    </div>
  );

  return (
    <Dialog 
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-wallet text-primary" style={{ fontSize: '1.5rem' }}></i>
          <span>Pelunasan Hutang Vendor</span>
        </div>
      } 
      visible={visible} 
      style={{ width: "450px" }} 
      breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      modal 
      footer={footer} 
      onHide={onHide}
      draggable={false}
    >
      <div className="flex flex-column gap-3 mt-3">
        
        {/* FIELD: NO INVOICE (READ ONLY) */}
        <div className="p-field">
          <label htmlFor="no_inv" className="font-bold block mb-2">No. Invoice</label>
          <InputText 
            id="no_inv"
            value={payload.NO_INVOICE_BELI} 
            disabled 
            className="w-full bg-gray-100 font-semibold" 
          />
        </div>

        {/* FIELD: SISA TAGIHAN (READ ONLY) */}
        <div className="p-field">
          <label htmlFor="sisa" className="font-bold block mb-2 text-red-600">Sisa Hutang Saat Ini</label>
          <InputNumber 
            id="sisa"
            value={invoiceData?.SISA_TAGIHAN || 0} 
            mode="currency" 
            currency="IDR" 
            locale="id-ID" 
            disabled 
            className="w-full" 
            inputClassName="text-red-600 bg-red-50 font-bold" 
          />
        </div>

        <hr className="surface-border" />

        {/* FIELD: NOMINAL BAYAR (EDITABLE) */}
        <div className="p-field">
          <label htmlFor="bayar" className="font-bold block mb-2 text-primary">Nominal yang Dibayar</label>
          <InputNumber 
            id="bayar"
            value={payload.NOMINAL_BAYAR} 
            onValueChange={(e) => setPayload({ ...payload, NOMINAL_BAYAR: e.value })}
            mode="currency" 
            currency="IDR" 
            locale="id-ID" 
            className="w-full" 
            autoFocus
            max={parseFloat(invoiceData?.SISA_TAGIHAN || 0)}
          />
          <small className="text-gray-500 mt-1 block">
            {payload.NOMINAL_BAYAR < parseFloat(invoiceData?.SISA_TAGIHAN) 
              ? "*Status akan menjadi CICIL" 
              : "*Status akan menjadi LUNAS"}
          </small>
        </div>

        {/* FIELD: TANGGAL BAYAR */}
        <div className="p-field">
          <label htmlFor="tgl" className="font-bold block mb-2">Tanggal Bayar</label>
          <Calendar 
            id="tgl"
            value={payload.TGL_BAYAR} 
            onChange={(e) => setPayload({ ...payload, TGL_BAYAR: e.value })} 
            showIcon 
            className="w-full" 
            dateFormat="yy-mm-dd"
            maxDate={new Date()}
          />
        </div>

        {/* FIELD: NO KWITANSI */}
        <div className="p-field">
          <label htmlFor="kwitansi" className="font-bold block mb-2">No. Kwitansi / Ref</label>
          <InputText 
            id="kwitansi"
            value={payload.NO_KWITANSI} 
            onChange={(e) => setPayload({ ...payload, NO_KWITANSI: e.target.value })} 
            className="w-full" 
            placeholder="Contoh: KW-12345"
          />
        </div>

      </div>
    </Dialog>
  );
}