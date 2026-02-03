/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useRouter } from 'next/navigation';
import { Divider } from 'primereact/divider';

export default function LandingERP() {
  const router = useRouter();

  const features = [
    { title: 'Terintegrasi', desc: 'Satu sumber data untuk seluruh departemen perusahaan.', icon: 'pi-sync' },
    { title: 'Keamanan Data', desc: 'Proteksi data tingkat tinggi dengan enkripsi end-to-end.', icon: 'pi-shield' },
    { title: 'Analisis Realtime', desc: 'Dashboard interaktif yang diperbarui secara instan.', icon: 'pi-bolt' },
    { title: 'Skalabilitas', desc: 'Tumbuh bersama bisnis Anda tanpa hambatan sistem.', icon: 'pi-up-right' }
  ];

  const modules = [
    { label: 'Finance & Accounting', icon: 'pi-wallet', color: 'blue' },
    { label: 'Human Resource', icon: 'pi-users', color: 'purple' },
    { label: 'Supply Chain', icon: 'pi-box', color: 'orange' },
    { label: 'Procurement', icon: 'pi-shopping-cart', color: 'cyan' },
    { label: 'Business Intelligence', icon: 'pi-chart-bar', color: 'indigo' },
    { label: 'System Admin', icon: 'pi-sliders-h', color: 'slate' }
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', color: '#1e293b' }}>
      
        {/* ================= NAVBAR ================= */}
        <nav className="sticky top-0 z-5 border-bottom-1 surface-border bg-white-alpha-90 backdrop-blur-sm px-4 md:px-8 py-3 flex align-items-center justify-content-between">
        <div className="flex align-items-center gap-3">
            <div className="flex align-items-center justify-content-center">
            <img 
                src={`/layout/images/logo-dark.svg`} // Menggunakan logo-dark sebagai default
                width="47.22px" 
                height="35px" 
                alt="logo" 
                style={{ 
                /* Trik filter untuk mengubah logo hitam menjadi Indigo #4f46e5 */
                filter: 'invert(26%) sepia(89%) saturate(1535%) hue-rotate(227deg) brightness(96%) contrast(92%)' 
                }}
            />
            </div>
            <span className="text-xl font-bold tracking-tight text-900 uppercase">
            Nexa<span className="text-indigo-600">Erp</span>
            </span>
        </div>

        <div className="hidden md:flex align-items-center gap-4">
            <Button label="Fitur" text className="text-600 font-medium" />
            <Button label="Solusi" text className="text-600 font-medium" />
            <Button label="Harga" text className="text-600 font-medium" />
            <Button label="Login" text className="font-bold text-indigo-600" onClick={() => router.push('/auth/login')} />
            <Button label="Mulai Gratis" className="p-button-indigo border-round-xl" />
        </div>
        </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden px-4 md:px-8 py-8 lg:py-12">
        <div className="grid align-items-center max-w-screen-xl mx-auto">
          <div className="col-12 lg:col-6 text-center lg:text-left z-1">
            <div className="inline-flex align-items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm mb-4">
              <span className="mr-2">✨</span> New: AI-Powered Analytics Dashboard
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-900 line-height-1 mb-4 tracking-tight">
              Kendalikan Bisnis <br />
              <span className="text-indigo-600">Tanpa Batas.</span>
            </h1>
            <p className="text-xl text-600 line-height-3 mb-6 max-w-30rem mx-auto lg:mx-0">
              Satu-satunya platform ERP yang memberikan fleksibilitas penuh untuk mengelola operasional, keuangan, dan SDM secara presisi.
            </p>
            <div className="flex flex-column sm:flex-row gap-3 justify-content-center lg:justify-content-start">
              <Button 
                label="Coba Demo Sekarang" 
                icon="pi pi-play" 
                className="p-button-lg p-button-indigo shadow-lg border-round-xl"
              />
              <Button 
                label="Konsultasi Gratis" 
                icon="pi pi-phone" 
                className="p-button-lg p-button-outlined p-button-secondary border-round-xl"
              />
            </div>
          </div>
          <div className="col-12 lg:col-6 mt-6 lg:mt-0 relative">
            <div className="surface-card p-2 border-round-2xl shadow-8">
              <img 
                src="https://www.primefaces.org/static/social/primereact-preview.jpg" 
                alt="Dashboard Preview" 
                className="w-full border-round-xl block"
              />
            </div>
            {/* Dekorasi Aksen */}
            <div className="absolute -top-4 -right-4 w-12rem h-12rem bg-indigo-100 border-circle -z-1 opacity-50" />
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-8 bg-slate-50 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid">
            {features.map((f, i) => (
              <div key={i} className="col-12 md:col-6 lg:col-3">
                <div className="p-4 bg-white border-round-xl shadow-sm hover:shadow-md transition-all transition-duration-300 h-full border-1 border-transparent hover:border-indigo-200">
                  <div className="w-3rem h-3rem bg-indigo-50 border-round-lg flex align-items-center justify-content-center mb-4">
                    <i className={`pi ${f.icon} text-indigo-600 text-xl`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-900">{f.title}</h3>
                  <p className="text-600 line-height-3 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MODULES GRID ================= */}
      <section className="py-8 px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-900 mb-3">Modul Terintegrasi</h2>
            <p className="text-600 max-w-2xl mx-auto">Dirancang untuk skalabilitas, modul kami bekerja selaras untuk menghilangkan silo data di organisasi Anda.</p>
          </div>
          <div className="grid">
            {modules.map((m, i) => (
              <div key={i} className="col-12 sm:col-6 lg:col-4 p-3">
                <Card className="border-none shadow-1 hover:shadow-4 transition-all transition-duration-300 border-round-xl overflow-hidden cursor-pointer">
                  <div className="flex align-items-start gap-4">
                    <div className={`p-3 border-round-xl bg-${m.color}-50`}>
                      <i className={`pi ${m.icon} text-${m.color}-600 text-2xl`} />
                    </div>
                    <div>
                      <h4 className="m-0 mb-2 font-bold text-900">{m.label}</h4>
                      <p className="text-sm text-500 m-0 line-height-3">Manajemen {m.label.toLowerCase()} yang efisien dengan otomatisasi alur kerja.</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SOCIAL PROOF / METRICS ================= */}
      <section className="py-8 bg-indigo-900 text-white px-4">
        <div className="grid max-w-screen-xl mx-auto text-center">
          {[
            ['1,200+', 'User Aktif'],
            ['45+', 'Korporasi'],
            ['10K+', 'Transaksi Harian'],
            ['99.9%', 'Uptime Server']
          ].map(([val, label]) => (
            <div key={label} className="col-6 lg:col-3 mb-4 lg:mb-0">
              <div className="text-5xl font-bold mb-2">{val}</div>
              <div className="text-indigo-200 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

{/* ================= CTA ================= */}
      <section className="py-8 px-4">
        <div className="max-w-screen-lg mx-auto bg-indigo-600 border-round-3xl p-6 md:p-8 text-center shadow-8 relative overflow-hidden">
            <div className="relative z-1">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Siap Bertransformasi Digital?</h2>
                <p className="text-indigo-100 text-lg mb-6 max-w-2xl mx-auto">Gabung dengan puluhan perusahaan yang telah meningkatkan efisiensi hingga 40% menggunakan NexaERP.</p>
                <div className="flex flex-wrap justify-content-center gap-3">
                    {/* Button Primary: Putih Bersih dengan teks Indigo */}
                    <Button 
                      label="Daftar Sekarang" 
                      className="p-button-white px-6 py-3 border-round-xl font-bold shadow-4" 
                      style={{ backgroundColor: '#ffffff', color: '#4f46e5', border: 'none' }}
                    />
                    {/* Button Secondary: Transparan dengan Border Putih */}
                    <Button 
                      label="Hubungi Sales" 
                      outlined 
                      className="px-6 py-3 border-round-xl font-bold text-white border-white hover:bg-white-alpha-10" 
                    />
                </div>
            </div>
            
            {/* Dekorasi Background agar tidak flat */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-20 -left-20 w-30rem h-30rem bg-white border-circle" />
                <div className="absolute -bottom-20 -right-20 w-20rem h-20rem bg-indigo-400 border-circle" />
            </div>
        </div>
      </section>

{/* ================= FOOTER ================= */}
      <footer className="bg-white pt-8 pb-4 border-top-1 surface-border px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid mb-6">
            <div className="col-12 lg:col-4 mb-4 lg:mb-0">
                <div className="flex align-items-center gap-3 mb-4">
                    <img 
                        src={`/layout/images/logo-dark.svg`} 
                        width="40px" 
                        height="30px" 
                        alt="logo" 
                        style={{ 
                            filter: 'invert(26%) sepia(89%) saturate(1535%) hue-rotate(227deg) brightness(96%) contrast(92%)' 
                        }}
                    />
                    <span className="text-xl font-bold tracking-tight text-900 uppercase">
                        Nexa<span className="text-indigo-600">Erp</span>
                    </span>
                </div>
                <p className="text-600 line-height-3 pr-4">
                  Solusi manajemen bisnis terpadu dari <strong>PT. Garapan Indonesia Sukses</strong> untuk efisiensi operasional dan pertumbuhan berkelanjutan di era digital.
                </p>
            </div>
            <div className="col-6 lg:col-2">
                <h5 className="font-bold mb-4 text-900">Produk</h5>
                <ul className="list-none p-0 m-0 flex flex-column gap-3 text-600">
                    <li className="cursor-pointer hover:text-indigo-600 transition-colors">Fitur</li>
                    <li className="cursor-pointer hover:text-indigo-600 transition-colors">Modul</li>
                    <li className="cursor-pointer hover:text-indigo-600 transition-colors">Update</li>
                </ul>
            </div>
            <div className="col-6 lg:col-2">
                <h5 className="font-bold mb-4 text-900">Perusahaan</h5>
                <ul className="list-none p-0 m-0 flex flex-column gap-3 text-600">
                    <li className="cursor-pointer hover:text-indigo-600 transition-colors">Tentang Kami</li>
                    <li className="cursor-pointer hover:text-indigo-600 transition-colors">Kontak</li>
                    <li className="cursor-pointer hover:text-indigo-600 transition-colors">Karir</li>
                </ul>
            </div>
            <div className="col-12 lg:col-4">
                <h5 className="font-bold mb-4 text-900">Berlangganan Newsletter</h5>
                <div className="p-inputgroup border-round-xl overflow-hidden">
                    <input type="text" placeholder="Email Anda" className="p-inputtext p-component p-3 border-indigo-100" />
                    <Button icon="pi pi-send" className="p-button-indigo" />
                </div>
            </div>
          </div>
          
          <Divider />
          
          <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-4 mt-4 text-500 text-sm">
            {/* COPYRIGHT UPDATE */}
            <span>Copyright © 2026 <strong>PT. Garapan Indonesia Sukses</strong>. All rights reserved.</span>
            
            <div className="flex gap-4">
                <i className="pi pi-twitter hover:text-indigo-600 cursor-pointer transition-colors" />
                <i className="pi pi-linkedin hover:text-indigo-600 cursor-pointer transition-colors" />
                <i className="pi pi-github hover:text-indigo-600 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>

      {/* Styles for extra polish */}
      <style jsx global>{`
        .p-button-indigo { background: #4f46e5 !important; border-color: #4f46e5 !important; }
        .p-button-indigo:hover { background: #4338ca !important; border-color: #4338ca !important; }
        .backdrop-blur-sm { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
        .shadow-8 { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important; }
      `}</style>
    </div>
  );
}