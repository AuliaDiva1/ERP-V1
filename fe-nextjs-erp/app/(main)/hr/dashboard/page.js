'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import ToastNotifier from '@/app/components/ToastNotifier';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const toastRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('Super Admin');

  const stats = {
    totalUsers: 120,
    activeUsers: 108,
    inactiveUsers: 12,
    totalCompanies: 8,
    totalRoles: 6,
    totalModules: 14,
    usersByRole: {
      'Super Admin': 2,
      Admin: 10,
      Manager: 18,
      Staff: 90
    },
    usersByStatus: {
      Aktif: 108,
      Nonaktif: 12
    },
    activityByDay: {
      Senin: 22,
      Selasa: 30,
      Rabu: 25,
      Kamis: 18,
      Jumat: 15
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('TOKEN');
    const storedName = localStorage.getItem('USER_NAME');

    if (!token) {
      router.push('/login');
      return;
    }

    if (storedName) setName(storedName);

    setTimeout(() => {
      setLoading(false);
      toastRef.current?.showToast(
        '00',
        'Dashboard Super Admin berhasil dimuat'
      );
    }, 800);
  }, [router]);

  const getHariIndonesia = () => {
    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return hari[new Date().getDay()];
  };

  const roleChartData = {
    labels: Object.keys(stats.usersByRole),
    datasets: [
      {
        data: Object.values(stats.usersByRole),
        backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6']
      }
    ]
  };

  const statusChartData = {
    labels: Object.keys(stats.usersByStatus),
    datasets: [
      {
        data: Object.values(stats.usersByStatus),
        backgroundColor: ['#22c55e', '#ef4444']
      }
    ]
  };

  const chartOptions = {
    plugins: { legend: { position: 'bottom' } },
    maintainAspectRatio: false
  };

  if (loading) {
    return (
      <div className="grid">
        <div className="col-12">
          <Skeleton height="120px" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid p-fluid">
      <ToastNotifier ref={toastRef} />

      {/* WELCOME BANNER */}
      <div className="col-12">
        <div
          className="card mb-0"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #6366f1 100%)'
          }}
        >
          <div className="flex align-items-center">
            <div className="flex-1">
              <h3 className="text-white mb-2">
                Selamat Datang, {name}
              </h3>
              <p className="text-white text-sm mb-0 opacity-80">
                Super Administrator • {getHariIndonesia()},{' '}
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <i
                className="pi pi-shield text-white"
                style={{ fontSize: '3rem', opacity: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI */}
      {[
        { label: 'Total Users', value: stats.totalUsers, icon: 'pi pi-users', color: 'blue' },
        { label: 'Users Aktif', value: stats.activeUsers, icon: 'pi pi-check-circle', color: 'green' },
        { label: 'Companies', value: stats.totalCompanies, icon: 'pi pi-building', color: 'indigo' },
        { label: 'Modules', value: stats.totalModules, icon: 'pi pi-cog', color: 'purple' }
      ].map((item) => (
        <div key={item.label} className="col-12 md:col-6 xl:col-3">
          <div className="card mb-2">
            <div className="flex justify-content-between">
              <div>
                <span className="block text-500 font-medium mb-2">
                  {item.label}
                </span>
                <div className="text-900 font-medium text-xl">
                  {item.value}
                </div>
              </div>
              <div
                className={`flex align-items-center justify-content-center bg-${item.color}-100 border-round`}
                style={{ width: '3rem', height: '3rem' }}
              >
                <i className={`${item.icon} text-${item.color}-600 text-xl`} />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* CHART */}
      <div className="col-12 lg:col-6">
        <div className="card">
          <h5>Distribusi User per Role</h5>
          <div style={{ height: '300px' }}>
            <Chart type="doughnut" data={roleChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="col-12 lg:col-6">
        <div className="card">
          <h5>Status User</h5>
          <div style={{ height: '300px' }}>
            <Chart type="pie" data={statusChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
