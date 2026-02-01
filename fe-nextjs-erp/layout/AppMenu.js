"use client";
import React, { useContext, useState, useEffect } from "react";
import AppMenuitem from "./AppMenuitem";
import { LayoutContext } from "./context/layoutcontext";
import { MenuProvider } from "./context/menucontext";

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const roleFromLocalStorage = localStorage.getItem("ROLE");
            console.log("ROLE DI LOCALSTORAGE:", roleFromLocalStorage);
            setUserRole(roleFromLocalStorage);
        }
    }, []);

    if (!userRole) return null;

    let model = [];

    // =========================
    // 1. SUPERADMIN
    // =========================
    if (userRole === "SUPERADMIN") {
        model = [
            {
                label: "Dashboard",
                items: [
                    { label: "Dashboard Utama", icon: "pi pi-fw pi-home", to: "/superadmin/dashboard" }
                ]
            },
            {
                label: "Manajemen Sistem",
                icon: "pi pi-fw pi-cog",
                items: [
                    {
                        label: "User Management",
                        icon: "pi pi-fw pi-users",
                        items: [
                            { label: "Kelola User", icon: "pi pi-fw pi-user-plus", to: "/master/users" },
                            { label: "Role & Permission", icon: "pi pi-fw pi-shield", to: "/superadmin/roles" },
                            { label: "Activity Log", icon: "pi pi-fw pi-history", to: "/superadmin/logs" }
                        ]
                    },
                    {
                        label: "Master Data",
                        icon: "pi pi-fw pi-database",
                        items: [
                            { label: "Master Supplier", icon: "pi pi-fw pi-building", to: "/master/supplier" },
                            { label: "Master Customer", icon: "pi pi-fw pi-users", to: "/master/customer" },
                            { label: "Master Produk", icon: "pi pi-fw pi-box", to: "/master/produk" },
                            { label: "Master Bahan Baku", icon: "pi pi-fw pi-inbox", to: "/master/bahan-baku" },
                            { label: "Master Vendor", icon: "pi pi-fw pi-truck", to: "/master/vendor" },
                            { label: "Master Kategori", icon: "pi pi-fw pi-tags", to: "/master/kategori" },
                            { label: "Master Satuan", icon: "pi pi-fw pi-calculator", to: "/master/satuan" }
                        ]
                    },
                    {
                        label: "Pengaturan",
                        icon: "pi pi-fw pi-sliders-h",
                        items: [
                            { label: "Informasi Perusahaan", icon: "pi pi-fw pi-info-circle", to: "/settings/company" },
                            { label: "Backup & Restore", icon: "pi pi-fw pi-cloud-download", to: "/settings/backup" },
                            { label: "Email & Notifikasi", icon: "pi pi-fw pi-envelope", to: "/settings/notification" }
                        ]
                    }
                ]
            },
            {
                label: "Laporan & Analytics",
                icon: "pi pi-fw pi-chart-line",
                items: [
                    { label: "Dashboard Analytics", icon: "pi pi-fw pi-chart-bar", to: "/superadmin/analytics" },
                    { label: "Laporan Komprehensif", icon: "pi pi-fw pi-file-pdf", to: "/superadmin/reports" }
                ]
            }
        ];
    }

    // =========================
    // 2. GUDANG
    // =========================
    else if (userRole === "GUDANG") {
        model = [
            {
                label: "Dashboard Gudang",
                icon: "pi pi-fw pi-home",
                items: [
                    { label: "Beranda", icon: "pi pi-fw pi-home", to: "/gudang/dashboard" }
                ]
            },
            {
                label: "Manajemen Inventory",
                icon: "pi pi-fw pi-box",
                items: [
                    {
                        label: "Stok & Persediaan",
                        icon: "pi pi-fw pi-database",
                        items: [
                            { label: "Data Stok", icon: "pi pi-fw pi-list", to: "/gudang/stok" },
                            { label: "Stok Opname", icon: "pi pi-fw pi-search", to: "/gudang/stok-opname" },
                            { label: "Kartu Stok", icon: "pi pi-fw pi-id-card", to: "/gudang/kartu-stok" },
                            { label: "Minimum Stok Alert", icon: "pi pi-fw pi-exclamation-triangle", to: "/gudang/min-stok" }
                        ]
                    },
                    {
                        label: "Barang Masuk",
                        icon: "pi pi-fw pi-arrow-down",
                        items: [
                            { label: "Penerimaan Barang", icon: "pi pi-fw pi-download", to: "/gudang/barang-masuk" },
                            { label: "Retur Pembelian", icon: "pi pi-fw pi-replay", to: "/gudang/retur-pembelian" }
                        ]
                    },
                    {
                        label: "Barang Keluar",
                        icon: "pi pi-fw pi-arrow-up",
                        items: [
                            { label: "Pengiriman Barang", icon: "pi pi-fw pi-upload", to: "/gudang/barang-keluar" },
                            { label: "Retur Penjualan", icon: "pi pi-fw pi-replay", to: "/gudang/retur-penjualan" }
                        ]
                    }
                ]
            },
            {
                label: "Pembelian & Supplier",
                icon: "pi pi-fw pi-shopping-cart",
                items: [
                    { label: "Purchase Order", icon: "pi pi-fw pi-file-edit", to: "/gudang/purchase-order" },
                    { label: "Data Supplier", icon: "pi pi-fw pi-building", to: "/gudang/supplier" }
                ]
            },
            {
                label: "Laporan",
                icon: "pi pi-fw pi-chart-bar",
                items: [
                    { label: "Laporan Stok", icon: "pi pi-fw pi-chart-line", to: "/gudang/laporan-stok" },
                    { label: "Laporan Barang Masuk", icon: "pi pi-fw pi-file", to: "/gudang/laporan-masuk" },
                    { label: "Laporan Barang Keluar", icon: "pi pi-fw pi-file", to: "/gudang/laporan-keluar" }
                ]
            }
        ];
    }

    // =========================
    // 3. PRODUKSI
    // =========================
    else if (userRole === "PRODUKSI") {
        model = [
            {
                label: "Dashboard Produksi",
                icon: "pi pi-fw pi-home",
                items: [
                    { label: "Beranda", icon: "pi pi-fw pi-home", to: "/produksi/dashboard" }
                ]
            },
            {
                label: "Perencanaan Produksi",
                icon: "pi pi-fw pi-calendar",
                items: [
                    {
                        label: "Planning & Scheduling",
                        icon: "pi pi-fw pi-calendar-plus",
                        items: [
                            { label: "Rencana Produksi", icon: "pi pi-fw pi-list", to: "/produksi/rencana" },
                            { label: "Jadwal Produksi", icon: "pi pi-fw pi-calendar", to: "/produksi/jadwal" },
                            { label: "Kapasitas Produksi", icon: "pi pi-fw pi-chart-bar", to: "/produksi/kapasitas" }
                        ]
                    },
                    {
                        label: "BOM & Formula",
                        icon: "pi pi-fw pi-sitemap",
                        items: [
                            { label: "Bill of Materials", icon: "pi pi-fw pi-copy", to: "/produksi/bom" },
                            { label: "Formula Produk", icon: "pi pi-fw pi-table", to: "/produksi/formula" }
                        ]
                    }
                ]
            },
            {
                label: "Eksekusi Produksi",
                icon: "pi pi-fw pi-cog",
                items: [
                    {
                        label: "Work Order",
                        icon: "pi pi-fw pi-file-edit",
                        items: [
                            { label: "Buat Work Order", icon: "pi pi-fw pi-plus", to: "/produksi/work-order/create" },
                            { label: "Monitor Work Order", icon: "pi pi-fw pi-eye", to: "/produksi/work-order" },
                            { label: "Quality Control", icon: "pi pi-fw pi-check-circle", to: "/produksi/qc" }
                        ]
                    },
                    {
                        label: "Proses Produksi",
                        icon: "pi pi-fw pi-sync",
                        items: [
                            { label: "Input Produksi", icon: "pi pi-fw pi-pencil", to: "/produksi/input" },
                            { label: "Monitoring Real-time", icon: "pi pi-fw pi-desktop", to: "/produksi/monitoring" },
                            { label: "Hasil Produksi", icon: "pi pi-fw pi-box", to: "/produksi/hasil" }
                        ]
                    }
                ]
            },
            {
                label: "Mesin & Peralatan",
                icon: "pi pi-fw pi-wrench",
                items: [
                    { label: "Data Mesin", icon: "pi pi-fw pi-server", to: "/produksi/mesin" },
                    { label: "Maintenance Schedule", icon: "pi pi-fw pi-calendar-times", to: "/produksi/maintenance" },
                    { label: "Downtime Log", icon: "pi pi-fw pi-times-circle", to: "/produksi/downtime" }
                ]
            },
            {
                label: "Laporan",
                icon: "pi pi-fw pi-chart-line",
                items: [
                    { label: "Laporan Produksi", icon: "pi pi-fw pi-file", to: "/produksi/laporan" },
                    { label: "Efisiensi Produksi", icon: "pi pi-fw pi-chart-bar", to: "/produksi/efisiensi" },
                    { label: "Waste & Reject", icon: "pi pi-fw pi-trash", to: "/produksi/waste" }
                ]
            }
        ];
    }

    // =========================
    // 4. HR (Human Resources)
    // =========================
    else if (userRole === "HR") {
        model = [
            {
                label: "Dashboard HR",
                icon: "pi pi-fw pi-home",
                items: [
                    { label: "Beranda", icon: "pi pi-fw pi-home", to: "/hr/dashboard" }
                ]
            },
            {
                label: "Manajemen Karyawan",
                icon: "pi pi-fw pi-users",
                items: [
                    {
                        label: "Data Karyawan",
                        icon: "pi pi-fw pi-id-card",
                        items: [
                            { label: "Data Pegawai", icon: "pi pi-fw pi-users", to: "/hr/karyawan" },
                            { label: "Struktur Organisasi", icon: "pi pi-fw pi-sitemap", to: "/hr/struktur" },
                            { label: "Jabatan & Divisi", icon: "pi pi-fw pi-briefcase", to: "/hr/jabatan" }
                        ]
                    },
                    {
                        label: "Rekrutmen",
                        icon: "pi pi-fw pi-user-plus",
                        items: [
                            { label: "Lowongan Kerja", icon: "pi pi-fw pi-megaphone", to: "/hr/lowongan" },
                            { label: "Pelamar", icon: "pi pi-fw pi-users", to: "/hr/pelamar" },
                            { label: "Proses Seleksi", icon: "pi pi-fw pi-filter", to: "/hr/seleksi" }
                        ]
                    }
                ]
            },
            {
                label: "Absensi & Kehadiran",
                icon: "pi pi-fw pi-clock",
                items: [
                    { label: "Data Absensi", icon: "pi pi-fw pi-calendar-times", to: "/hr/absensi" },
                    { label: "Jadwal Kerja", icon: "pi pi-fw pi-calendar", to: "/hr/jadwal" },
                    { label: "Lembur", icon: "pi pi-fw pi-clock", to: "/hr/lembur" },
                    { label: "Cuti & Izin", icon: "pi pi-fw pi-calendar-minus", to: "/hr/cuti" }
                ]
            },
            {
                label: "Penggajian",
                icon: "pi pi-fw pi-money-bill",
                items: [
                    { label: "Slip Gaji", icon: "pi pi-fw pi-wallet", to: "/hr/slip-gaji" },
                    { label: "Komponen Gaji", icon: "pi pi-fw pi-list", to: "/hr/komponen-gaji" },
                    { label: "Payroll", icon: "pi pi-fw pi-credit-card", to: "/hr/payroll" },
                    { label: "THR & Bonus", icon: "pi pi-fw pi-gift", to: "/hr/thr" }
                ]
            },
            {
                label: "Pelatihan & Development",
                icon: "pi pi-fw pi-book",
                items: [
                    { label: "Program Pelatihan", icon: "pi pi-fw pi-graduation-cap", to: "/hr/pelatihan" },
                    { label: "Evaluasi Kinerja", icon: "pi pi-fw pi-star", to: "/hr/evaluasi" },
                    { label: "Career Path", icon: "pi pi-fw pi-arrow-up-right", to: "/hr/career" }
                ]
            },
            {
                label: "Laporan",
                icon: "pi pi-fw pi-chart-bar",
                items: [
                    { label: "Laporan Karyawan", icon: "pi pi-fw pi-file", to: "/hr/laporan-karyawan" },
                    { label: "Laporan Absensi", icon: "pi pi-fw pi-file-edit", to: "/hr/laporan-absensi" },
                    { label: "Laporan Penggajian", icon: "pi pi-fw pi-file-excel", to: "/hr/laporan-gaji" }
                ]
            }
        ];
    }

    // =========================
    // 5. KEUANGAN (Finance)
    // =========================
    else if (userRole === "KEUANGAN") {
        model = [
            {
                label: "Dashboard Keuangan",
                icon: "pi pi-fw pi-home",
                items: [
                    { label: "Beranda", icon: "pi pi-fw pi-home", to: "/keuangan/dashboard" },
                    { label: "Ringkasan Keuangan", icon: "pi pi-fw pi-chart-line", to: "/keuangan/ringkasan" }
                ]
            },
            {
                label: "Kas & Bank",
                icon: "pi pi-fw pi-wallet",
                items: [
                    {
                        label: "Transaksi Kas",
                        icon: "pi pi-fw pi-money-bill",
                        items: [
                            { label: "Kas Masuk", icon: "pi pi-fw pi-arrow-down", to: "/keuangan/kas-masuk" },
                            { label: "Kas Keluar", icon: "pi pi-fw pi-arrow-up", to: "/keuangan/kas-keluar" },
                            { label: "Mutasi Kas", icon: "pi pi-fw pi-sync", to: "/keuangan/mutasi-kas" }
                        ]
                    },
                    {
                        label: "Bank",
                        icon: "pi pi-fw pi-building",
                        items: [
                            { label: "Rekening Bank", icon: "pi pi-fw pi-credit-card", to: "/keuangan/bank" },
                            { label: "Mutasi Bank", icon: "pi pi-fw pi-list", to: "/keuangan/mutasi-bank" },
                            { label: "Rekonsiliasi", icon: "pi pi-fw pi-check-square", to: "/keuangan/rekonsiliasi" }
                        ]
                    }
                ]
            },
            {
                label: "Hutang & Piutang",
                icon: "pi pi-fw pi-file-edit",
                items: [
                    { label: "Hutang Supplier", icon: "pi pi-fw pi-arrow-right", to: "/keuangan/hutang" },
                    { label: "Piutang Customer", icon: "pi pi-fw pi-arrow-left", to: "/keuangan/piutang" },
                    { label: "Aging Analysis", icon: "pi pi-fw pi-chart-bar", to: "/keuangan/aging" }
                ]
            },
            {
                label: "Pembelian & Penjualan",
                icon: "pi pi-fw pi-shopping-cart",
                items: [
                    { label: "Faktur Pembelian", icon: "pi pi-fw pi-file", to: "/keuangan/faktur-beli" },
                    { label: "Faktur Penjualan", icon: "pi pi-fw pi-file-edit", to: "/keuangan/faktur-jual" },
                    { label: "Pembayaran", icon: "pi pi-fw pi-credit-card", to: "/keuangan/pembayaran" }
                ]
            },
            {
                label: "Biaya & Beban",
                icon: "pi pi-fw pi-calculator",
                items: [
                    { label: "Biaya Operasional", icon: "pi pi-fw pi-cog", to: "/keuangan/biaya-operasional" },
                    { label: "Beban Gaji", icon: "pi pi-fw pi-users", to: "/keuangan/beban-gaji" },
                    { label: "Kategori Biaya", icon: "pi pi-fw pi-tags", to: "/keuangan/kategori-biaya" }
                ]
            },
            {
                label: "Akuntansi",
                icon: "pi pi-fw pi-book",
                items: [
                    {
                        label: "Buku Besar",
                        icon: "pi pi-fw pi-database",
                        items: [
                            { label: "Chart of Account", icon: "pi pi-fw pi-sitemap", to: "/keuangan/coa" },
                            { label: "Jurnal Umum", icon: "pi pi-fw pi-file-edit", to: "/keuangan/jurnal" },
                            { label: "Buku Besar", icon: "pi pi-fw pi-book", to: "/keuangan/buku-besar" }
                        ]
                    },
                    {
                        label: "Penutupan & Audit",
                        icon: "pi pi-fw pi-lock",
                        items: [
                            { label: "Tutup Buku", icon: "pi pi-fw pi-lock", to: "/keuangan/tutup-buku" },
                            { label: "Adjustment Entry", icon: "pi pi-fw pi-pencil", to: "/keuangan/adjustment" }
                        ]
                    }
                ]
            },
            {
                label: "Laporan Keuangan",
                icon: "pi pi-fw pi-chart-line",
                items: [
                    { label: "Neraca", icon: "pi pi-fw pi-balance-scale", to: "/keuangan/neraca" },
                    { label: "Laba Rugi", icon: "pi pi-fw pi-chart-bar", to: "/keuangan/laba-rugi" },
                    { label: "Arus Kas", icon: "pi pi-fw pi-arrow-right-arrow-left", to: "/keuangan/arus-kas" },
                    { label: "Laporan Custom", icon: "pi pi-fw pi-file-pdf", to: "/keuangan/laporan-custom" }
                ]
            },
            {
                label: "Pajak",
                icon: "pi pi-fw pi-percentage",
                items: [
                    { label: "PPh", icon: "pi pi-fw pi-tag", to: "/keuangan/pph" },
                    { label: "PPN", icon: "pi pi-fw pi-tags", to: "/keuangan/ppn" },
                    { label: "Pelaporan Pajak", icon: "pi pi-fw pi-file", to: "/keuangan/laporan-pajak" }
                ]
            }
        ];
    }

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => (
                    <AppMenuitem item={item} root={true} index={i} key={i} />
                ))}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;