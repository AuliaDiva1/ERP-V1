"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormHari from "./components/FormHari";

export default function MasterHariPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [hariList, setHariList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHari, setSelectedHari] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [token, setToken] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) window.location.href = "/";
    else setToken(t);

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (token) fetchHari();
  }, [token]);

  const fetchHari = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-hari`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!isMounted.current) return;

      setHariList(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data hari");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      let url = `${API_URL}/master-hari`;
      let method = "POST";

      if (dialogMode === "edit" && selectedHari) {
        url = `${API_URL}/master-hari/${selectedHari.ID}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toastRef.current?.showToast("00", `Data berhasil disimpan`);
        await fetchHari();
        setDialogMode(null);
        setSelectedHari(null);
      } else {
        toastRef.current?.showToast("01", result.message || "Terjadi kesalahan");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menyimpan data");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Hapus data hari ${rowData.NAMA_HARI}?`,
      header: "Konfirmasi",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const res = await fetch(`${API_URL}/master-hari/${rowData.ID}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            toastRef.current?.showToast("00", "Data berhasil dihapus");
            await fetchHari();
          } else {
            toastRef.current?.showToast("01", "Gagal menghapus data");
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus data");
        }
      },
    });
  };

  const statusBodyTemplate = (rowData) => (
    <Tag value={rowData.STATUS} severity={rowData.STATUS === "Aktif" ? "success" : "danger"} />
  );

  const hariKerjaBodyTemplate = (rowData) => (
    <span>{rowData.IS_HARI_KERJA ? "Ya" : "Tidak"}</span>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 justify-content-center">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-warning p-button-sm"
        onClick={() => {
          setSelectedHari(rowData);
          setDialogMode("edit");
        }}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  const columns = [
    { field: "URUTAN", header: "No", style: { width: "80px", textAlign: "center" } },
    { field: "NAMA_HARI", header: "Nama Hari", style: { width: "150px" } },
    { field: "JAM_MASUK_DEFAULT", header: "Masuk", style: { width: "120px", textAlign: "center" } },
    { field: "JAM_PULANG_DEFAULT", header: "Pulang", style: { width: "120px", textAlign: "center" } },
    { header: "Hari Kerja", body: hariKerjaBodyTemplate, style: { width: "120px", textAlign: "center" } },
    { header: "Status", body: statusBodyTemplate, style: { width: "120px", textAlign: "center" } },
    { header: "Aksi", body: actionBodyTemplate, style: { width: "120px", textAlign: "center" } },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Master Hari</h3>

      <div className="flex justify-content-end mb-3">
        <Button
          label="Tambah Hari"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedHari(null);
          }}
        />
      </div>

      <CustomDataTable data={hariList} loading={isLoading} columns={columns} />

      <ConfirmDialog />

      <FormHari
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedHari(null);
        }}
        selectedHari={selectedHari}
        onSave={handleSubmit}
      />

      <ToastNotifier ref={toastRef} />
    </div>
  );
}