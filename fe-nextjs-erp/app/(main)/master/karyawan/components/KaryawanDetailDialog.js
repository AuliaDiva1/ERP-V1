"use client";

import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { Image } from "primereact/image";

const KaryawanDetailDialog = ({ visible, onHide, karyawan }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Perbaikan URL foto
  const fotoUrl = karyawan?.FOTO
    ? `${API_URL.replace("/api", "")}${karyawan.FOTO}`
    : null;

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
      "Tetap": "success",
      "Kontrak": "warning",
      "Magang": "info"
    };
    return map[status] || "secondary";
  };

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-3">
          <div className="bg-primary-100 border-circle p-3">
            <i className="pi pi-id-card text-primary text-2xl"></i>
          </div>
          <div>
            <h3 className="m-0 text-xl font-bold text-900">Detail Karyawan</h3>
            <p className="m-0 text-sm text-600 mt-1">Informasi lengkap data karyawan</p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "1000px", maxWidth: "95vw" }}
      modal
      draggable={false}
      onHide={onHide}
      className="p-fluid"
      dismissableMask
    >
      {karyawan ? (
        <div className="pb-2">
          {/* ====== HEADER SECTION - FOTO & INFO UTAMA ====== */}
          <div className="surface-card border-round-lg shadow-3 p-4 mb-4">
            <div className="grid">
              {/* Kolom Foto */}
              <div className="col-12 md:col-4">
                <div className="text-center">
                  {fotoUrl ? (
                    <div className="inline-block">
                      <Image
                        src={fotoUrl}
                        alt={karyawan.NAMA}
                        width="200"
                        preview
                        imageClassName="border-round-lg shadow-4"
                        imageStyle={{
                          width: '200px',
                          height: '250px',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ) : (
                    <div 
                      className="border-round-lg shadow-4 flex align-items-center justify-content-center mx-auto"
                      style={{
                        width: '200px',
                        height: '250px',
                        backgroundColor: '#e3f2fd'
                      }}
                    >
                      <i className="pi pi-user text-6xl text-primary"></i>
                    </div>
                  )}
                  <div className="mt-3">
                    <Tag
                      value={karyawan.KARYAWAN_ID}
                      severity="info"
                      className="text-base font-bold px-3 py-2"
                      icon="pi pi-hashtag"
                    />
                  </div>
                </div>
              </div>

              {/* Kolom Info Utama */}
              <div className="col-12 md:col-8">
                <div className="pl-0 md:pl-4">
                  <h2 className="text-3xl font-bold text-900 mt-0 mb-2">
                    {karyawan.NAMA}
                  </h2>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Tag
                      value={karyawan.STATUS_AKTIF}
                      severity={karyawan.STATUS_AKTIF === "Aktif" ? "success" : "danger"}
                      icon={karyawan.STATUS_AKTIF === "Aktif" ? "pi pi-check-circle" : "pi pi-times-circle"}
                      className="px-3 py-2"
                    />
                    <Tag
                      value={karyawan.STATUS_KARYAWAN}
                      severity={getStatusSeverity(karyawan.STATUS_KARYAWAN)}
                      icon="pi pi-briefcase"
                      className="px-3 py-2"
                    />
                    <Tag
                      value={karyawan.GENDER === "L" ? "Laki-laki" : "Perempuan"}
                      severity={karyawan.GENDER === "L" ? "info" : "danger"}
                      icon={karyawan.GENDER === "L" ? "pi pi-mars" : "pi pi-venus"}
                      className="px-3 py-2"
                    />
                  </div>

                  <Divider className="my-3" />

                  <div className="grid">
                    <div className="col-12 md:col-6">
                      <InfoItem 
                        label="NIK" 
                        value={karyawan.NIK} 
                        icon="pi pi-id-card" 
                      />
                      <InfoItem 
                        label="Email" 
                        value={karyawan.EMAIL} 
                        icon="pi pi-envelope" 
                      />
                    </div>
                    <div className="col-12 md:col-6">
                      <InfoItem 
                        label="No. Telepon" 
                        value={karyawan.NO_TELP} 
                        icon="pi pi-phone" 
                      />
                      <InfoItem 
                        label="Tanggal Masuk" 
                        value={formatDate(karyawan.TANGGAL_MASUK)} 
                        icon="pi pi-calendar" 
                      />
                    </div>
                  </div>

                  <div className="surface-100 border-round p-3 mt-3">
                    <div className="grid">
                      <div className="col-6">
                        <div className="text-center">
                          <i className="pi pi-building text-primary text-2xl mb-2"></i>
                          <div className="text-600 text-sm mb-1">Departemen</div>
                          <div className="text-900 font-bold">{karyawan.DEPARTEMEN}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-center">
                          <i className="pi pi-briefcase text-primary text-2xl mb-2"></i>
                          <div className="text-600 text-sm mb-1">Jabatan</div>
                          <div className="text-900 font-bold">{karyawan.JABATAN}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid">
            {/* ====== DATA PRIBADI ====== */}
            <div className="col-12 md:col-6">
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-user text-blue-600"></i>
                    <span className="font-semibold">Data Pribadi</span>
                  </div>
                }
                className="shadow-2 h-full"
              >
                <InfoItem 
                  label="Nama Lengkap" 
                  value={karyawan.NAMA} 
                  icon="pi pi-user" 
                />
                <InfoItem 
                  label="Jenis Kelamin" 
                  value={karyawan.GENDER === "L" ? "Laki-laki" : "Perempuan"} 
                  icon="pi pi-users" 
                />
                <InfoItem 
                  label="Tempat Lahir" 
                  value={karyawan.TEMPAT_LAHIR} 
                  icon="pi pi-map-marker" 
                />
                <InfoItem 
                  label="Tanggal Lahir" 
                  value={formatDate(karyawan.TGL_LAHIR)} 
                  icon="pi pi-calendar" 
                />
                <InfoItem 
                  label="Pendidikan Terakhir" 
                  value={karyawan.PENDIDIKAN_TERAKHIR} 
                  icon="pi pi-book" 
                />
                <Divider />
                <InfoItem 
                  label="Alamat Lengkap" 
                  value={karyawan.ALAMAT} 
                  icon="pi pi-home" 
                />
              </Card>
            </div>

            {/* ====== DATA KEPEGAWAIAN ====== */}
            <div className="col-12 md:col-6">
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-briefcase text-orange-600"></i>
                    <span className="font-semibold">Data Kepegawaian</span>
                  </div>
                }
                className="shadow-2 mb-3"
              >
                <InfoItem 
                  label="Kode Karyawan" 
                  value={karyawan.KARYAWAN_ID} 
                  icon="pi pi-hashtag" 
                />
                <InfoItem 
                  label="NIK" 
                  value={karyawan.NIK} 
                  icon="pi pi-id-card" 
                />
                <InfoItem 
                  label="Departemen" 
                  value={karyawan.DEPARTEMEN} 
                  icon="pi pi-building" 
                />
                <InfoItem 
                  label="Jabatan" 
                  value={karyawan.JABATAN} 
                  icon="pi pi-briefcase" 
                />
                <InfoItem 
                  label="Status Karyawan" 
                  value={karyawan.STATUS_KARYAWAN} 
                  icon="pi pi-tag" 
                />
                <InfoItem 
                  label="Status Aktif" 
                  value={karyawan.STATUS_AKTIF} 
                  icon="pi pi-check-circle" 
                />
                <InfoItem 
                  label="Tanggal Masuk" 
                  value={formatDate(karyawan.TANGGAL_MASUK)} 
                  icon="pi pi-calendar-plus" 
                />
                {karyawan.SHIFT && (
                  <InfoItem 
                    label="Shift Kerja" 
                    value={karyawan.SHIFT} 
                    icon="pi pi-clock" 
                  />
                )}
              </Card>

              {/* ====== DATA AKUN SISTEM ====== */}
              <Card
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-cog text-purple-600"></i>
                    <span className="font-semibold">Data Akun Sistem</span>
                  </div>
                }
                className="shadow-2"
              >
                <InfoItem 
                  label="ID Sistem" 
                  value={karyawan.ID} 
                  icon="pi pi-database" 
                />
                <InfoItem 
                  label="Email Login" 
                  value={karyawan.EMAIL} 
                  icon="pi pi-envelope" 
                />
                <InfoItem 
                  label="Role Sistem" 
                  value={karyawan.user_role || karyawan.DEPARTEMEN} 
                  icon="pi pi-shield" 
                />
                
                <Divider />
                
                <div className="grid">
                  <div className="col-6">
                    <div className="text-center p-3 surface-100 border-round">
                      <i className="pi pi-calendar-plus text-green-500 text-xl mb-2"></i>
                      <div className="text-600 text-xs mb-1">Dibuat</div>
                      <div className="text-900 font-semibold text-sm">
                        {formatDate(karyawan.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 surface-100 border-round">
                      <i className="pi pi-calendar-times text-orange-500 text-xl mb-2"></i>
                      <div className="text-600 text-xs mb-1">Diupdate</div>
                      <div className="text-900 font-semibold text-sm">
                        {formatDate(karyawan.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <i className="pi pi-spin pi-spinner text-6xl text-primary mb-4"></i>
          <p className="text-600 text-lg">Memuat data karyawan...</p>
        </div>
      )}
    </Dialog>
  );
};

export default KaryawanDetailDialog;