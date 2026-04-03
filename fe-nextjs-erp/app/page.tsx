/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useRouter } from 'next/navigation';

export default function LandingERP() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'biannual' | 'annual'>('monthly');
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { title: 'Terintegrasi Penuh', desc: 'Satu sumber data tunggal untuk seluruh departemen. Tidak ada lagi data yang tersebar.', icon: 'pi-sync' },
    { title: 'Keamanan Enterprise', desc: 'Enkripsi end-to-end dengan audit log lengkap. Data Anda aman di tangan kami.', icon: 'pi-shield' },
    { title: 'Analisis Realtime', desc: 'Dashboard interaktif diperbarui setiap detik. Ambil keputusan berbasis data, bukan asumsi.', icon: 'pi-bolt' },
    { title: 'Skalabilitas Tinggi', desc: 'Sistem yang tumbuh bersama bisnis Anda. Dari 5 hingga 5.000 karyawan, kami siap.', icon: 'pi-chart-line' }
  ];

  const modules = [
    { label: 'Finance & Accounting', icon: 'pi-wallet', desc: 'Pembukuan otomatis, laporan keuangan real-time, dan rekonsiliasi bank.', color: 'blue' },
    { label: 'Human Resource', icon: 'pi-users', desc: 'Manajemen karyawan, absensi digital, dan penggajian otomatis setiap bulan.', color: 'purple' },
    { label: 'Supply Chain', icon: 'pi-box', desc: 'Pantau stok, kelola gudang, dan optimalkan rantai distribusi Anda.', color: 'orange' },
    { label: 'Procurement', icon: 'pi-shopping-cart', desc: 'Purchase order, approval workflow, dan negosiasi vendor dalam satu tempat.', color: 'cyan' },
    { label: 'Business Intelligence', icon: 'pi-chart-bar', desc: 'Laporan mendalam dan visualisasi data untuk eksekutif dan manajer.', color: 'indigo' },
    { label: 'System Admin', icon: 'pi-sliders-h', desc: 'Kelola hak akses, role pengguna, dan konfigurasi sistem dengan mudah.', color: 'teal' }
  ];

  const testimonials = [
    {
      name: 'Budi Santoso',
      role: 'CEO · PT Maju Bersama',
      avatar: 'BS',
      text: 'Sejak pakai RINTISKU, laporan keuangan kami yang dulu makan 3 hari kini selesai dalam 2 jam. Transformasi yang luar biasa.',
      rating: 5,
      color: '#4f46e5'
    },
    {
      name: 'Sari Dewi',
      role: 'Finance Manager · CV Berkah Jaya',
      avatar: 'SD',
      text: 'Integrasi antara HR dan Finance-nya seamless banget. Penggajian 80 karyawan kini cukup 1 klik. Tim saya sangat terbantu.',
      rating: 5,
      color: '#7c3aed'
    },
    {
      name: 'Rizky Pratama',
      role: 'Owner · Toko Sembako Makmur',
      avatar: 'RP',
      text: 'Saya pikir ERP hanya untuk perusahaan besar. Ternyata paket Essential-nya cocok banget buat UMKM saya. Harganya juga terjangkau!',
      rating: 5,
      color: '#0891b2'
    }
  ];

  const faqs = [
    {
      q: 'Apakah ada masa percobaan gratis?',
      a: 'Ya! Kami menyediakan demo gratis yang bisa diakses tanpa kartu kredit. Anda juga bisa konsultasi langsung dengan tim kami untuk trial terbimbing selama 14 hari.'
    },
    {
      q: 'Apakah data saya aman jika saya berhenti berlangganan?',
      a: 'Data Anda tetap menjadi milik Anda. Kami menyediakan ekspor data penuh dalam format Excel/CSV kapan saja Anda butuhkan, bahkan setelah langganan berakhir.'
    },
    {
      q: 'Bisakah saya upgrade atau downgrade paket kapan saja?',
      a: 'Tentu! Anda bisa upgrade paket kapan saja dan perbedaan biaya akan dihitung secara prorata. Downgrade berlaku di awal siklus tagihan berikutnya.'
    },
    {
      q: 'Berapa lama proses implementasi dan onboarding?',
      a: 'Rata-rata 3–7 hari kerja tergantung kompleksitas bisnis Anda. Sudah termasuk sesi pelatihan gratis, migrasi data dasar, dan pendampingan hingga tim Anda mandiri.'
    },
    {
      q: 'Apakah RINTISKU bisa diintegrasikan dengan aplikasi lain?',
      a: 'Ya, kami mendukung integrasi dengan berbagai platform populer seperti marketplace (Tokopedia, Shopee), sistem kasir, dan dapat terhubung via API untuk kebutuhan kustom.'
    }
  ];

  const billingOptions: { key: 'monthly' | 'biannual' | 'annual'; label: string; badge: string | null }[] = [
    { key: 'monthly', label: 'Bulanan', badge: null },
    { key: 'biannual', label: '6 Bulan', badge: 'Hemat 4%' },
    { key: 'annual', label: '1 Tahun', badge: 'Hemat 8%' },
  ];

  const plans = [
    {
      name: 'Essential',
      tagColor: 'indigo',
      highlight: false,
      desc: 'Untuk UMKM yang baru mulai go-digital. Fondasi pencatatan yang kuat.',
      prices: { monthly: 'Rp 75.000', biannual: 'Rp 430.000', annual: 'Rp 828.000' },
      perLabel: { monthly: '/bulan', biannual: '/6 bulan', annual: '/tahun' },
      features: [
        'HR & Penggajian Otomatis',
        'Inventory (Inbound & Outbound)',
        'Laporan Laba Rugi',
        'Multiple User Account',
        '1x Pelatihan Gratis',
        'Buku Panduan Digital',
      ],
      cta: 'Mulai Sekarang',
    },
    {
      name: 'Intermediate',
      tagColor: 'purple',
      highlight: false,
      desc: 'Untuk UMKM yang siap scale-up dengan kontrol produksi lebih ketat.',
      prices: { monthly: 'Rp 89.000', biannual: 'Rp 511.000', annual: 'Rp 982.000' },
      perLabel: { monthly: '/bulan', biannual: '/6 bulan', annual: '/tahun' },
      features: [
        'Semua fitur Essential',
        'Produksi (Batch Number)',
        'Product Movement Tracking',
        'Multiple User Account',
        '1x Pelatihan Gratis',
        'Buku Panduan Digital',
      ],
      cta: 'Mulai Sekarang',
    },
    {
      name: 'Intermediate Executive',
      tagColor: 'blue',
      highlight: true,
      badge: 'Terpopuler',
      desc: 'Paket terfavorit. Fitur lengkap dengan laporan analitik penjualan mendalam.',
      prices: { monthly: 'Rp 129.000', biannual: 'Rp 741.000', annual: 'Rp 1.424.000' },
      perLabel: { monthly: '/bulan', biannual: '/6 bulan', annual: '/tahun' },
      features: [
        'Semua fitur Intermediate',
        'Laporan Penjualan Produk',
        'Laporan Profitabilitas Pelanggan',
        'Multiple User Account',
        '1x Pelatihan Gratis',
        'Buku Panduan Digital',
      ],
      cta: 'Pilih Paket Ini',
    },
    {
      name: 'Enterprise',
      tagColor: 'orange',
      highlight: false,
      desc: 'Operasional dan penjualan dalam satu ekosistem. Siap dominasi pasar.',
      prices: { monthly: 'Rp 159.000', biannual: 'Rp 913.000', annual: 'Rp 1.751.000' },
      perLabel: { monthly: '/bulan', biannual: '/6 bulan', annual: '/tahun' },
      features: [
        'Semua fitur Int. Executive',
        'Modul Marketing & Sales',
        'Multiple User Account',
        '2x Pelatihan Gratis',
        'Buku Panduan Digital',
        'Prioritas Support',
      ],
      cta: 'Mulai Sekarang',
    },
    {
      name: 'Enterprise Exclusive',
      tagColor: 'slate',
      highlight: false,
      isCustom: true,
      desc: 'Solusi fully custom untuk bisnis besar dengan kebutuhan spesifik dan kompleks.',
      prices: { monthly: 'Custom', biannual: 'Custom', annual: 'Custom' },
      perLabel: { monthly: '', biannual: '', annual: '' },
      features: [
        'Semua Fitur Fully Custom',
        'Dedicated Account Manager',
        'Integrasi API Kustom',
        'Pelatihan Intensif Tim',
        'SLA & Dukungan 24/7',
        'Keamanan Level Enterprise',
      ],
      cta: 'Hubungi Sales',
    },
  ];

  const colorMap: Record<string, { border: string; tag: string; tagText: string; check: string }> = {
    indigo: { border: '#4f46e5', tag: '#eef2ff', tagText: '#4f46e5', check: '#4f46e5' },
    purple: { border: '#7c3aed', tag: '#f5f3ff', tagText: '#7c3aed', check: '#7c3aed' },
    blue:   { border: '#2563eb', tag: '#eff6ff', tagText: '#2563eb', check: '#2563eb' },
    orange: { border: '#ea580c', tag: '#fff7ed', tagText: '#ea580c', check: '#ea580c' },
    slate:  { border: '#475569', tag: '#f1f5f9', tagText: '#475569', check: '#475569' },
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Outfit', 'Inter', sans-serif", backgroundColor: '#ffffff', color: '#1e293b' }}>

      {/* ========== GOOGLE FONTS ========== */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');

        * { box-sizing: border-box; }

        body { overflow-x: hidden; }

        .erp-nav-scrolled {
          box-shadow: 0 2px 20px rgba(0,0,0,0.08) !important;
          background: rgba(255,255,255,0.97) !important;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .hero-title { animation: fadeUp 0.7s ease forwards; }
        .hero-sub { animation: fadeUp 0.7s 0.15s ease forwards; opacity: 0; animation-fill-mode: forwards; }
        .hero-cta { animation: fadeUp 0.7s 0.3s ease forwards; opacity: 0; animation-fill-mode: forwards; }
        .hero-img { animation: fadeUp 0.7s 0.2s ease forwards; opacity: 0; animation-fill-mode: forwards; }

        .float-card { animation: float 5s ease-in-out infinite; }
        .float-card-2 { animation: float 7s 1s ease-in-out infinite; }

        .stat-card:hover { transform: translateY(-4px); }
        .stat-card { transition: transform 0.3s, box-shadow 0.3s; }

        .module-card:hover .module-icon { transform: scale(1.1) rotate(-3deg); }
        .module-icon { transition: transform 0.3s; }

        .faq-item { transition: background 0.2s; }
        .faq-item:hover { background: #f8faff; }

        .plan-card:hover { transform: translateY(-6px); }
        .plan-card { transition: transform 0.25s, box-shadow 0.25s; }

        .shimmer-btn {
          background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 40%, #4f46e5 100%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        .shimmer-btn:hover { animation-play-state: paused; filter: brightness(1.08); }

        .p-button-indigo { background: #4f46e5 !important; border-color: #4f46e5 !important; }
        .p-button-indigo:hover { background: #4338ca !important; border-color: #4338ca !important; }
        .backdrop-blur-sm { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

        .grid-pattern {
          background-image: 
            linear-gradient(rgba(79,70,229,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,70,229,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .mobile-menu { 
          max-height: 0; overflow: hidden; transition: max-height 0.3s ease;
        }
        .mobile-menu.open { max-height: 300px; }
      `}</style>

      {/* ================= NAVBAR ================= */}
      <nav
        className={`erp-nav sticky top-0 z-5 px-4 md:px-8 py-3 flex align-items-center justify-content-between flex-wrap gap-2 backdrop-blur-sm ${scrolled ? 'erp-nav-scrolled' : ''}`}
        style={{
          background: 'rgba(255,255,255,0.88)',
          borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
          transition: 'all 0.3s'
        }}
      >
        <div className="flex align-items-center gap-3">
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79,70,229,0.35)'
            }}
          >
            <i className="pi pi-prime text-white" style={{ fontSize: '1rem' }} />
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.35rem', color: '#1e293b', letterSpacing: '-0.02em' }}>
            RINTISKU<span style={{ color: '#4f46e5' }}>.</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex align-items-center gap-1">
          {['Fitur', 'Modul', 'Harga', 'Testimoni'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                padding: '8px 16px', borderRadius: 8, fontWeight: 500,
                color: '#64748b', textDecoration: 'none', fontSize: '0.9rem',
                transition: 'color 0.2s, background 0.2s'
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = '#4f46e5'; (e.target as HTMLElement).style.background = '#f0f0ff'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = '#64748b'; (e.target as HTMLElement).style.background = 'transparent'; }}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex align-items-center gap-2">
          <button
            onClick={() => router.push('/auth/login')}
            style={{
              padding: '8px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0',
              background: 'transparent', fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer', color: '#374151', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#4f46e5'; (e.target as HTMLElement).style.color = '#4f46e5'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = '#e2e8f0'; (e.target as HTMLElement).style.color = '#374151'; }}
          >
            Masuk
          </button>
          <button
            className="shimmer-btn"
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', color: '#fff',
            }}
          >
            Coba Gratis ✨
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="flex md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
        >
          <i className={`pi ${mobileMenuOpen ? 'pi-times' : 'pi-bars'} text-700 text-xl`} />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
        style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: mobileMenuOpen ? '12px 24px 16px' : '0 24px' }}
      >
        {['Fitur', 'Modul', 'Harga', 'Testimoni'].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`}
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'block', padding: '10px 0', color: '#374151', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}
          >
            {item}
          </a>
        ))}
        <button className="shimmer-btn mt-3" style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          Coba Gratis ✨
        </button>
      </div>

      {/* ================= HERO ================= */}
      <section
        id="fitur"
        className="relative overflow-hidden grid-pattern"
        style={{ padding: '80px 24px 80px', minHeight: '90vh', display: 'flex', alignItems: 'center' }}
      >
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div className="grid align-items-center">
            <div className="col-12 lg:col-6 text-center lg:text-left" style={{ position: 'relative', zIndex: 1 }}>
              <div
                className="inline-flex align-items-center gap-2 mb-5"
                style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: 99, padding: '6px 16px' }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', display: 'inline-block' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4f46e5' }}>Baru: AI-Powered Analytics Dashboard</span>
              </div>

              <h1
                className="hero-title"
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 'clamp(2.8rem, 6vw, 4.2rem)',
                  lineHeight: 1.1,
                  marginBottom: 24,
                  letterSpacing: '-0.03em',
                  color: '#0f172a'
                }}
              >
                Kendalikan Bisnis<br />
                <span style={{
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Tanpa Batas.
                </span>
              </h1>

              <p
                className="hero-sub"
                style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}
              >
                Platform ERP pertama yang dirancang khusus untuk UMKM Indonesia. Satu platform, semua kebutuhan operasional Anda.
              </p>

              <div className="hero-cta flex flex-column sm:flex-row gap-3 justify-content-center lg:justify-content-start">
                <button
                  className="shimmer-btn"
                  style={{ padding: '14px 28px', borderRadius: 12, border: 'none', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <i className="pi pi-play-circle" /> Coba Demo Gratis
                </button>
                <button
                  style={{
                    padding: '14px 28px', borderRadius: 12, border: '2px solid #e2e8f0',
                    background: '#fff', fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                    color: '#374151', display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4f46e5'; (e.currentTarget as HTMLElement).style.color = '#4f46e5'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}
                >
                  <i className="pi pi-phone" /> Konsultasi Gratis
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex align-items-center gap-4 mt-6 justify-content-center lg:justify-content-start">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.85rem' }}>
                  <i className="pi pi-check-circle" style={{ color: '#10b981' }} />
                  Tanpa kartu kredit
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.85rem' }}>
                  <i className="pi pi-check-circle" style={{ color: '#10b981' }} />
                  Setup dalam 1 hari
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.85rem' }}>
                  <i className="pi pi-check-circle" style={{ color: '#10b981' }} />
                  Batalkan kapan saja
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="col-12 lg:col-6 mt-6 lg:mt-0 hero-img" style={{ position: 'relative' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0f4ff, #faf5ff)',
                borderRadius: 24,
                padding: 16,
                boxShadow: '0 30px 80px rgba(79,70,229,0.18)',
                border: '1px solid rgba(79,70,229,0.1)',
                position: 'relative'
              }}>
                <img
                  src="https://www.primefaces.org/static/social/primereact-preview.jpg"
                  alt="Dashboard Preview"
                  style={{ width: '100%', borderRadius: 16, display: 'block' }}
                />
                {/* Floating stat cards */}
                <div
                  className="float-card"
                  style={{
                    position: 'absolute', bottom: -20, left: -20,
                    background: '#fff', borderRadius: 14, padding: '12px 18px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    border: '1px solid #e2e8f0', minWidth: 160
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>PENDAPATAN BULAN INI</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Rp 248 Jt</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>▲ 18% vs bulan lalu</div>
                </div>
                <div
                  className="float-card-2"
                  style={{
                    position: 'absolute', top: -16, right: -16,
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 14, padding: '12px 18px',
                    boxShadow: '0 8px 30px rgba(79,70,229,0.35)', minWidth: 140
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 4 }}>STOK KRITIS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>3 Item</div>
                  <div style={{ fontSize: '0.75rem', color: '#fde68a', fontWeight: 600 }}>⚠ Perlu restock</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ================= FEATURES ================= */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#f0f4ff', color: '#4f46e5', borderRadius: 8, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Mengapa RINTISKU?
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#0f172a', marginBottom: 16, letterSpacing: '-0.03em' }}>
              Dibangun untuk Pertumbuhan
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>
              Setiap fitur dirancang dengan satu tujuan: membuat bisnis Anda lebih efisien.
            </p>
          </div>
          <div className="grid">
            {features.map((f, i) => (
              <div key={i} className="col-12 md:col-6 lg:col-3 p-2">
                <div
                  style={{
                    padding: '28px 24px', borderRadius: 16, background: '#fff',
                    border: '1px solid #e2e8f0', height: '100%',
                    transition: 'all 0.3s', cursor: 'default'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4f46e5'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(79,70,229,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <i className={`pi ${f.icon}`} style={{ color: '#4f46e5', fontSize: '1.3rem' }} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 10, color: '#0f172a' }}>{f.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MODULES ================= */}
      <section id="modul" style={{ padding: '80px 24px', background: '#f8faff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#f0f4ff', color: '#4f46e5', borderRadius: 8, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Modul Lengkap
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#0f172a', marginBottom: 16, letterSpacing: '-0.03em' }}>
              Satu Platform, Semua Kebutuhan
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
              Modul kami bekerja selaras satu sama lain, menghilangkan silo data di seluruh organisasi Anda.
            </p>
          </div>
          <div className="grid">
            {modules.map((m, i) => (
              <div key={i} className="col-12 sm:col-6 lg:col-4 p-2">
                <div
                  className="module-card"
                  style={{
                    padding: '24px', borderRadius: 16, background: '#fff',
                    border: '1px solid #e2e8f0', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLElement).style.borderColor = '#c7d2fe'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}
                >
                  <div className="flex align-items-start gap-3">
                    <div
                      className="module-icon"
                      style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        background: `var(--${m.color}-50, #eef2ff)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <i className={`pi ${m.icon}`} style={{ fontSize: '1.25rem', color: `var(--${m.color}-600, #4f46e5)` }} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{m.label}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>{m.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ================= TESTIMONIALS ================= */}
      <section id="testimoni" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#f0f4ff', color: '#4f46e5', borderRadius: 8, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Testimonial
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#0f172a', marginBottom: 16, letterSpacing: '-0.03em' }}>
              Apa Kata Mereka?
            </h2>
          </div>
          <div className="grid">
            {testimonials.map((t, i) => (
              <div key={i} className="col-12 md:col-4 p-2">
                <div
                  style={{
                    padding: '28px 24px', borderRadius: 16, background: '#fff',
                    border: '1px solid #e2e8f0', height: '100%',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    transition: 'transform 0.3s, box-shadow 0.3s'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
                >
                  {/* Stars */}
                  <div style={{ marginBottom: 16 }}>
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <i key={si} className="pi pi-star-fill" style={{ color: '#fbbf24', fontSize: '0.85rem', marginRight: 2 }} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p style={{ color: '#374151', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>
                    "{t.text}"
                  </p>
                  {/* Author */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0
                    }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{t.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section id="harga" style={{ padding: '80px 24px', background: 'linear-gradient(180deg, #f8faff 0%, #fff 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#f0f4ff', color: '#4f46e5', borderRadius: 8, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Harga Transparan
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#0f172a', marginBottom: 16, letterSpacing: '-0.03em' }}>
              Pay as You <span style={{ color: '#4f46e5' }}>Grow</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto' }}>
              Harga yang tumbuh bersama bisnis Anda. Tidak ada biaya tersembunyi.
            </p>
          </div>

          {/* Billing Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 14, padding: 4, gap: 2, border: '1px solid #e2e8f0' }}>
              {billingOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setBillingCycle(opt.key)}
                  style={{
                    border: 'none', cursor: 'pointer', borderRadius: 10,
                    padding: '8px 22px', fontWeight: 600, fontSize: '0.875rem',
                    transition: 'all 0.25s', position: 'relative', whiteSpace: 'nowrap',
                    background: billingCycle === opt.key ? '#4f46e5' : 'transparent',
                    color: billingCycle === opt.key ? '#fff' : '#64748b',
                    boxShadow: billingCycle === opt.key ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
                  }}
                >
                  {opt.label}
                  {opt.badge && (
                    <span style={{
                      position: 'absolute', top: -10, right: -6,
                      background: '#10b981', color: '#fff', fontSize: '0.6rem',
                      fontWeight: 700, padding: '2px 7px', borderRadius: 99, whiteSpace: 'nowrap',
                    }}>
                      {opt.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid">
            {plans.map((plan, i) => {
              const c = colorMap[plan.tagColor] || colorMap.indigo;
              return (
                <div key={i} className="col-12 sm:col-6 lg:col-4 p-2">
                  <div
                    className="plan-card"
                    style={{
                      borderRadius: 20, height: '100%', display: 'flex', flexDirection: 'column',
                      padding: '28px 24px', position: 'relative',
                      border: plan.highlight ? `2px solid #4f46e5` : '1px solid #e2e8f0',
                      background: plan.highlight ? 'linear-gradient(145deg, #4f46e5 0%, #6d28d9 100%)' : '#fff',
                      color: plan.highlight ? '#fff' : '#1e293b',
                      boxShadow: plan.highlight ? '0 20px 60px rgba(79,70,229,0.28)' : '0 2px 12px rgba(0,0,0,0.05)',
                    }}
                  >
                    {plan.badge && (
                      <div style={{
                        position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#78350f',
                        fontSize: '0.72rem', fontWeight: 700, padding: '4px 18px', borderRadius: 99, whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(245,158,11,0.4)'
                      }}>
                        ⭐ {plan.badge}
                      </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                      <span style={{
                        display: 'inline-block', borderRadius: 8, padding: '3px 12px',
                        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                        background: plan.highlight ? 'rgba(255,255,255,0.2)' : c.tag,
                        color: plan.highlight ? '#fff' : c.tagText,
                        marginBottom: 10
                      }}>
                        {plan.name}
                      </span>
                      <p style={{ fontSize: '0.85rem', opacity: 0.75, margin: 0, lineHeight: 1.55 }}>{plan.desc}</p>
                    </div>

                    <div style={{ borderBottom: `1px solid ${plan.highlight ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}`, paddingBottom: 20, marginBottom: 20 }}>
                      {plan.isCustom ? (
                        <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>Hubungi CS</div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>{plan.prices[billingCycle]}</span>
                            <span style={{ fontSize: '0.85rem', opacity: 0.7, paddingBottom: 4 }}>{plan.perLabel[billingCycle]}</span>
                          </div>
                          {billingCycle !== 'monthly' && (
                            <div style={{ fontSize: '0.75rem', marginTop: 4, color: plan.highlight ? '#a5f3fc' : '#10b981', fontWeight: 600 }}>
                              ✓ Hemat dibanding tagihan bulanan
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
                      {plan.features.map((feat, fi) => (
                        <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 11, fontSize: '0.875rem' }}>
                          <i className="pi pi-check-circle" style={{
                            color: plan.highlight ? '#a5f3fc' : c.check,
                            fontSize: '0.9rem', marginTop: 1, flexShrink: 0
                          }} />
                          <span style={{ opacity: 0.9, lineHeight: 1.5 }}>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      style={{
                        width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                        border: plan.highlight ? '2px solid rgba(255,255,255,0.4)' : `2px solid ${c.border}`,
                        background: plan.highlight ? 'rgba(255,255,255,0.18)' : c.border,
                        color: '#fff', transition: 'all 0.2s',
                        backdropFilter: plan.highlight ? 'blur(4px)' : 'none',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                    >
                      {plan.cta} <i className="pi pi-arrow-right ml-2" style={{ fontSize: '0.8rem' }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bonus Banner */}
          <div style={{ marginTop: 32, padding: '20px 24px', borderRadius: 16, background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fcd34d', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>🎁</div>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#92400e', fontSize: '0.95rem' }}>Bonus Untuk Setiap Pembelian Paket</p>
              <p style={{ margin: 0, color: '#b45309', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Setiap paket sudah termasuk <strong>1x pelatihan gratis</strong> dan <strong>buku panduan digital</strong> yang diberikan di awal pembelian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#f0f4ff', color: '#4f46e5', borderRadius: 8, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              FAQ
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 4vw, 2.6rem)', color: '#0f172a', letterSpacing: '-0.03em' }}>
              Pertanyaan Umum
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="faq-item"
                style={{ borderRadius: 14, border: `1.5px solid ${openFaq === i ? '#4f46e5' : '#e2e8f0'}`, overflow: 'hidden', transition: 'border-color 0.25s' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontWeight: 600, fontSize: '0.95rem', color: '#0f172a', textAlign: 'left', gap: 12
                  }}
                >
                  <span>{faq.q}</span>
                  <i
                    className={`pi ${openFaq === i ? 'pi-minus' : 'pi-plus'}`}
                    style={{ color: '#4f46e5', flexShrink: 0, fontSize: '0.9rem', transition: 'transform 0.2s' }}
                  />
                </button>
                <div style={{
                  maxHeight: openFaq === i ? 200 : 0,
                  overflow: 'hidden', transition: 'max-height 0.3s ease',
                  padding: openFaq === i ? '0 20px 18px' : '0 20px'
                }}>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section style={{ padding: '48px 24px 80px' }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #7c3aed 100%)',
          borderRadius: 28, padding: 'clamp(40px, 6vw, 72px) clamp(24px, 5vw, 64px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(79,70,229,0.3)'
        }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#fff', marginBottom: 16, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Siap Bertransformasi Digital?
            </h2>
            <p style={{ color: 'rgba(199,210,254,0.9)', fontSize: '1.1rem', marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
              Bergabung dengan lebih dari 1.200 bisnis yang telah meningkatkan efisiensi operasional hingga 40% dengan RINTISKU.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                padding: '14px 32px', borderRadius: 12, border: 'none',
                background: '#fff', color: '#4f46e5', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                Daftar Sekarang — Gratis ✨
              </button>
              <button style={{
                padding: '14px 28px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: '1rem',
                cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'background 0.2s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
              >
                <i className="pi pi-whatsapp mr-2" /> Hubungi Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '64px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="grid mb-6">
            <div className="col-12 lg:col-4 mb-6 lg:mb-0">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="pi pi-prime text-white" style={{ fontSize: '1rem' }} />
                </div>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.35rem', color: '#fff', letterSpacing: '-0.02em' }}>
                  RINTISKU<span style={{ color: '#818cf8' }}>.</span>
                </span>
              </div>
              <p style={{ lineHeight: 1.8, maxWidth: 280, fontSize: '0.9rem', marginBottom: 24 }}>
                Solusi manajemen bisnis terpadu dari <span style={{ color: '#e2e8f0', fontWeight: 600 }}>PT. Garapan Indonesia Sukses</span> untuk efisiensi dan pertumbuhan di era digital.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['pi-twitter', 'pi-linkedin', 'pi-instagram', 'pi-github'].map(icon => (
                  <div key={icon} style={{
                    width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s'
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#4f46e5'; (e.currentTarget as HTMLElement).style.borderColor = '#4f46e5'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    <i className={`pi ${icon}`} style={{ fontSize: '0.85rem', color: '#94a3b8' }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="col-4 lg:col-2">
              <h5 style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 20, fontSize: '0.9rem' }}>Produk</h5>
              {['Fitur', 'Modul', 'Harga', 'Update'].map(item => (
                <div key={item} style={{ marginBottom: 12, cursor: 'pointer', fontSize: '0.875rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = '#818cf8'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = '#94a3b8'; }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="col-4 lg:col-2">
              <h5 style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 20, fontSize: '0.9rem' }}>Perusahaan</h5>
              {['Tentang Kami', 'Blog', 'Karir', 'Kontak'].map(item => (
                <div key={item} style={{ marginBottom: 12, cursor: 'pointer', fontSize: '0.875rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = '#818cf8'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = '#94a3b8'; }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="col-12 md:col-4">
              <h5 style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 20, fontSize: '0.9rem' }}>Newsletter</h5>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 16 }}>Dapatkan tips bisnis & update terbaru langsung di inbox Anda.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  placeholder="Email Anda"
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#e2e8f0', fontSize: '0.875rem', outline: 'none'
                  }}
                />
                <button className="shimmer-btn" style={{ padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                  <i className="pi pi-send" style={{ color: '#fff' }} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ fontSize: '0.8rem' }}>© 2026 <span style={{ color: '#e2e8f0', fontWeight: 600 }}>PT. Garapan Indonesia Sukses</span>. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 20, fontSize: '0.8rem' }}>
              {['Kebijakan Privasi', 'Syarat & Ketentuan', 'Cookie'].map(item => (
                <span key={item} style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = '#818cf8'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = '#94a3b8'; }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}