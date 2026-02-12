"use client";

import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { ProgressBar } from "primereact/progressbar";

const BatchDetailDialog = ({ visible, onHide, batch }) => {
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

  const getStatusSeverity = (status) => {
    const map = {
      "Pending": "warning",
      "In Progress": "info",
      "Completed": "success",
      "On Hold": "warning",
      "Cancelled": "danger"
    };
    return map[status] || "secondary";
  };

  const calculateProgress = () => {
    if (!batch || batch.TARGET_JUMLAH <= 0) return 0;
    return ((batch.JUMLAH_SELESAI / batch.TARGET_JUMLAH) * 100).toFixed(0);
  };

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-3">
          <i className="pi pi-box text-primary text-2xl"></i>
          <div>
            <h3 className="m-0 text-xl font-bold text-900">Detail Batch</h3>
            <p className="m-0 text-sm text-600 mt-1">Informasi lengkap batch produksi</p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "900px", maxWidth: "95vw" }}
      modal
      draggable={false}
      onHide={onHide}
      className="p-fluid"
      dismissableMask
    >
      {batch ? (
        <div className="pb-2">
          {/* Header Section */}
          <div className="surface-card border-round-lg shadow-3 p-4 mb-4">
            <div className="flex align-items-center justify-content-between mb-3">
              <div>
                <h2 className="text-2xl font-bold text-900 mt-0 mb-2">
                  {batch.NAMA_BATCH}
                </h2>
                <div className="flex gap-2">
                  <Tag
                    value={batch.BATCH_ID}
                    severity="info"
                    icon="pi pi-hashtag"
                  />
                  <Tag
                    value={batch.JENIS_BATCH}
                    severity={batch.JENIS_BATCH === "Standar" ? "info" : "help"}
                  />
                  <Tag
                    value={batch.STATUS_BATCH}
                    severity={getStatusSeverity(batch.STATUS_BATCH)}
                  />
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-content-between mb-2">
                <span className="text-600 font-medium">Progress Produksi</span>
                <span className="text-900 font-bold">
                  {batch.JUMLAH_SELESAI} / {batch.TARGET_JUMLAH} {batch.SATUAN || "unit"}
                </span>
              </div>
              <ProgressBar 
                value={calculateProgress()} 
                showValue={true}
                style={{ height: '1.5rem' }}
              />
            </div>
          </div>

          <div className="grid">
            {/* Informasi Batch */}
            <div className="col-12 md:col-6">
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-info-circle text-blue-600 text-lg"></i>
                    <span className="font-semibold">Informasi Batch</span>
                  </div>
                }
                className="shadow-2 h-full"
              >
                <InfoItem 
                  label="Kode Batch" 
                  value={batch.BATCH_ID} 
                  icon="pi pi-hashtag" 
                />
                <InfoItem 
                  label="Nama Batch" 
                  value={batch.NAMA_BATCH} 
                  icon="pi pi-box" 
                />
                <InfoItem 
                  label="Jenis Batch" 
                  value={batch.JENIS_BATCH} 
                  icon="pi pi-tag" 
                />
                <InfoItem 
                  label="Kategori Produk" 
                  value={batch.KATEGORI_PRODUK} 
                  icon="pi pi-bookmark" 
                />
                <InfoItem 
                  label="Kode Produk" 
                  value={batch.KODE_PRODUK} 
                  icon="pi pi-qrcode" 
                />
                <InfoItem 
                  label="Status" 
                  value={batch.STATUS_BATCH} 
                  icon="pi pi-circle" 
                />
              </Card>
            </div>

            {/* Target & Progress */}
            <div className="col-12 md:col-6">
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-chart-bar text-orange-600 text-lg"></i>
                    <span className="font-semibold">Target & Progress</span>
                  </div>
                }
                className="shadow-2 mb-3"
              >
                <InfoItem 
                  label="Target Jumlah" 
                  value={`${batch.TARGET_JUMLAH} ${batch.NAMA_SATUAN || batch.SATUAN || "unit"}`}
                  icon="pi pi-flag" 
                />
                <InfoItem 
                  label="Jumlah Selesai" 
                  value={`${batch.JUMLAH_SELESAI} ${batch.NAMA_SATUAN || batch.SATUAN || "unit"} (${calculateProgress()}%)`}
                  icon="pi pi-check-circle" 
                />
                <InfoItem 
                  label="Estimasi Jam Kerja" 
                  value={batch.ESTIMASI_JAM_KERJA ? `${batch.ESTIMASI_JAM_KERJA} jam` : "-"}
                  icon="pi pi-clock" 
                />
                <InfoItem 
                  label="Karyawan Dibutuhkan" 
                  value={batch.JUMLAH_KARYAWAN_DIBUTUHKAN ? `${batch.JUMLAH_KARYAWAN_DIBUTUHKAN} orang` : "-"}
                  icon="pi pi-users" 
                />
              </Card>

              {/* Timeline */}
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-calendar text-purple-600 text-lg"></i>
                    <span className="font-semibold">Timeline</span>
                  </div>
                }
                className="shadow-2"
              >
                <InfoItem 
                  label="Tanggal Mulai" 
                  value={formatDate(batch.TANGGAL_MULAI)} 
                  icon="pi pi-calendar-plus" 
                />
                <InfoItem 
                  label="Target Selesai" 
                  value={formatDate(batch.TANGGAL_TARGET_SELESAI)} 
                  icon="pi pi-calendar-times" 
                />
                {batch.TANGGAL_SELESAI_AKTUAL && (
                  <InfoItem 
                    label="Selesai Aktual" 
                    value={formatDate(batch.TANGGAL_SELESAI_AKTUAL)} 
                    icon="pi pi-check" 
                  />
                )}
              </Card>
            </div>

            {/* Spesifikasi & Catatan */}
            <div className="col-12">
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-file-edit text-green-600 text-lg"></i>
                    <span className="font-semibold">Spesifikasi & Catatan</span>
                  </div>
                }
                className="shadow-2"
              >
                {batch.SPESIFIKASI && (
                  <div className="mb-3">
                    <div className="flex align-items-center gap-2 mb-1">
                      <i className="pi pi-list text-primary text-sm"></i>
                      <span className="text-600 text-sm font-medium">Spesifikasi</span>
                    </div>
                    <p className="text-900 text-sm m-0 line-height-3">
                      {batch.SPESIFIKASI}
                    </p>
                  </div>
                )}

                {batch.CATATAN && (
                  <div>
                    <div className="flex align-items-center gap-2 mb-1">
                      <i className="pi pi-comment text-primary text-sm"></i>
                      <span className="text-600 text-sm font-medium">Catatan</span>
                    </div>
                    <p className="text-900 text-sm m-0 line-height-3">
                      {batch.CATATAN}
                    </p>
                  </div>
                )}

                {!batch.SPESIFIKASI && !batch.CATATAN && (
                  <p className="text-500 text-sm">Tidak ada spesifikasi atau catatan</p>
                )}
              </Card>
            </div>

            {/* Audit Info */}
            <div className="col-12">
              <Card className="shadow-2">
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <InfoItem 
                      label="Dibuat Oleh" 
                      value={batch.CREATED_BY_NAMA || "-"} 
                      icon="pi pi-user" 
                    />
                  </div>
                  <div className="col-12 md:col-6">
                    <InfoItem 
                      label="Dibuat Pada" 
                      value={formatDate(batch.created_at)} 
                      icon="pi pi-calendar" 
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <i className="pi pi-spin pi-spinner text-6xl text-primary mb-4"></i>
          <p className="text-600 text-lg">Memuat data batch...</p>
        </div>
      )}
    </Dialog>
  );
};

export default BatchDetailDialog;