"use client";

import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FormBatchKaryawan = ({ visible, onHide, onSave }) => {
  const [formData, setFormData] = useState({
    batch_id: "",
    karyawan_id: "",
    role_dalam_batch: "Member",
  });

  const [batchList, setBatchList] = useState([]);
  const [karyawanList, setKaryawanList] = useState([]);
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { label: "Leader", value: "Leader" },
    { label: "Member", value: "Member" }
  ];

  useEffect(() => {
    if (visible) {
      fetchBatchList();
      fetchKaryawanList();
    }
  }, [visible]);

  const fetchBatchList = async () => {
    try {
      const token = localStorage.getItem("TOKEN");
      const res = await axios.get(`${API_URL}/master-batch`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "00") {
        const options = res.data.data
          .filter(b => b.STATUS_BATCH !== "Completed" && b.STATUS_BATCH !== "Cancelled")
          .map(b => ({
            label: `${b.BATCH_ID} - ${b.NAMA_BATCH} (${b.STATUS_BATCH})`,
            value: b.BATCH_ID
          }));
        setBatchList(options);
      }
    } catch (err) {
      console.error("Error fetching batch:", err);
    }
  };

  const fetchKaryawanList = async () => {
    try {
      const token = localStorage.getItem("TOKEN");
      const res = await axios.get(`${API_URL}/master-karyawan`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "00") {
        const options = res.data.data
          .filter(k => k.STATUS_AKTIF === "Aktif")
          .map(k => ({
            label: `${k.KARYAWAN_ID} - ${k.NAMA} (${k.DEPARTEMEN})`,
            value: k.KARYAWAN_ID
          }));
        setKaryawanList(options);
      }
    } catch (err) {
      console.error("Error fetching karyawan:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      batch_id: "",
      karyawan_id: "",
      role_dalam_batch: "Member",
    });
  };

  const handleSubmit = async () => {
    if (!formData.batch_id || !formData.karyawan_id) {
      alert("Batch dan Karyawan wajib dipilih!");
      return;
    }

    setLoading(true);
    await onSave(formData);
    setLoading(false);
    resetForm();
  };

  const dialogFooter = (
    <div>
      <Button
        label="Batal"
        icon="pi pi-times"
        onClick={() => {
          onHide();
          resetForm();
        }}
        className="p-button-text"
        disabled={loading}
      />
      <Button
        label="Simpan"
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header="Assign Karyawan ke Batch"
      visible={visible}
      style={{ width: "600px", maxWidth: "95vw" }}
      onHide={() => {
        onHide();
        resetForm();
      }}
      footer={dialogFooter}
      modal
      className="p-fluid"
    >
      <div className="grid">
        {/* Batch */}
        <div className="col-12">
          <label htmlFor="batch_id" className="font-semibold">
            Batch <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="batch_id"
            value={formData.batch_id}
            options={batchList}
            onChange={(e) => setFormData({ ...formData, batch_id: e.value })}
            placeholder="Pilih Batch"
            className="mt-2"
            filter
            filterBy="label"
          />
        </div>

        {/* Karyawan */}
        <div className="col-12">
          <label htmlFor="karyawan_id" className="font-semibold">
            Karyawan <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="karyawan_id"
            value={formData.karyawan_id}
            options={karyawanList}
            onChange={(e) => setFormData({ ...formData, karyawan_id: e.value })}
            placeholder="Pilih Karyawan"
            className="mt-2"
            filter
            filterBy="label"
          />
        </div>

        {/* Role */}
        <div className="col-12">
          <label htmlFor="role_dalam_batch" className="font-semibold">
            Role dalam Batch <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="role_dalam_batch"
            value={formData.role_dalam_batch}
            options={roleOptions}
            onChange={(e) => setFormData({ ...formData, role_dalam_batch: e.value })}
            placeholder="Pilih Role"
            className="mt-2"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormBatchKaryawan;