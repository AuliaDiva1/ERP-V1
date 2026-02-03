'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import ToastNotifier from '../../../components/ToastNotifier';
import HeaderBar from '../../../components/headerbar';
import UserFormModal from './components/UserFormModal';
import { getUsers, createUser, updateUser, deleteUser } from './utils/api';
import CustomDataTable from '../../../components/DataTable';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [users, setUsers] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [token, setToken] = useState('');
  
  // State untuk track permission dari backend
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('TOKEN');
    
    if (!t) {
      router.push('/');
      return;
    }
    
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getUsers(token);
      
      if (!isMounted.current) return;
      
      setUsers(res || []);
      setOriginalData(res || []);
      setHasAccess(true); // User punya akses
    } catch (err) {
      console.error('Error fetching users:', err);
      
      if (!isMounted.current) return;
      
      // Jika error 403 atau 401, berarti tidak punya akses
      if (err.response?.status === 403 || err.response?.status === 401) {
        setHasAccess(false);
        toastRef.current?.showToast('01', 'Anda tidak memiliki akses ke halaman ini');
        // Redirect ke dashboard atau halaman lain
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        toastRef.current?.showToast('01', err.message || 'Gagal memuat data user');
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Search handler
  const handleSearch = (keyword) => {
    if (!keyword) {
      setUsers(originalData);
    } else {
      const lowerKeyword = keyword.toLowerCase();
      const filtered = originalData.filter(
        (user) =>
          user.name?.toLowerCase().includes(lowerKeyword) ||
          user.email?.toLowerCase().includes(lowerKeyword) ||
          user.role?.toLowerCase().includes(lowerKeyword)
      );
      setUsers(filtered);
    }
  };

  const handleSubmit = async (data) => {
    if (!dialogMode) return;

    try {
      if (dialogMode === 'add') {
        await createUser(token, data);
        toastRef.current?.showToast('00', 'User berhasil ditambahkan');
      } else if (dialogMode === 'edit' && selectedUser) {
        await updateUser(token, selectedUser.id, data);
        toastRef.current?.showToast('00', 'User berhasil diupdate');
      }
      
      if (isMounted.current) {
        await fetchUsers();
        setDialogMode(null);
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('Error submitting user:', err);
      
      // Handle error dari backend
      if (err.response?.status === 403) {
        toastRef.current?.showToast('01', 'Anda tidak memiliki izin untuk melakukan aksi ini');
      } else if (err.response?.status === 409) {
        toastRef.current?.showToast('01', 'Email sudah terdaftar');
      } else {
        toastRef.current?.showToast('01', err.response?.data?.message || err.message || 'Gagal menyimpan user');
      }
    }
  };

  const handleDelete = (user) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus user "${user.name}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deleteUser(token, user.id);
          toastRef.current?.showToast('00', 'User berhasil dihapus');
          
          if (isMounted.current) {
            await fetchUsers();
          }
        } catch (err) {
          console.error('Error deleting user:', err);
          
          // Handle error dari backend
          if (err.response?.status === 403) {
            toastRef.current?.showToast('01', 'Anda tidak memiliki izin untuk menghapus user');
          } else if (err.response?.status === 400) {
            toastRef.current?.showToast('01', 'Tidak dapat menghapus user ini');
          } else {
            toastRef.current?.showToast('01', err.response?.data?.message || err.message || 'Gagal menghapus user');
          }
        }
      },
    });
  };

  // Template untuk role dengan color coding
  const roleBodyTemplate = (rowData) => {
    const roleColors = {
      SUPERADMIN: 'danger',
      ADMIN: 'warning',
      GUDANG: 'info',
      PRODUKSI: 'primary',
      HR: 'success',
      KEUANGAN: 'help',
      MANAGER: 'warning',
      USER: 'secondary',
      STAFF: 'info',
    };

    return (
      <Tag 
        value={rowData.role} 
        severity={roleColors[rowData.role] || 'secondary'}
      />
    );
  };

  // Template untuk action buttons
  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        size="small"
        severity="warning"
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
        onClick={() => {
          setSelectedUser(rowData);
          setDialogMode('edit');
        }}
      />
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        tooltip="Hapus"
        tooltipOptions={{ position: 'top' }}
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  // Definisi kolom untuk CustomDataTable
  const userColumns = [
    { 
      field: 'id', 
      header: 'ID', 
      style: { width: '80px' },
      sortable: true
    },
    { 
      field: 'name', 
      header: 'Nama', 
      style: { minWidth: '200px' },
      filter: true,
      sortable: true
    },
    { 
      field: 'email', 
      header: 'Email', 
      style: { minWidth: '250px' },
      filter: true,
      sortable: true
    },
    { 
      field: 'role', 
      header: 'Role',
      style: { minWidth: '140px' },
      body: roleBodyTemplate,
      filter: true,
      sortable: true
    },
    {
      field: 'created_at',
      header: 'Dibuat Pada',
      body: (row) => row.created_at 
        ? new Date(row.created_at).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) 
        : '-',
      sortable: true,
      style: { width: '180px' }
    },
    {
      header: 'Aksi',
      body: actionBodyTemplate,
      style: { width: '120px' },
    },
  ];

  // Jika tidak punya akses, tampilkan pesan
  if (!hasAccess) {
    return (
      <div className="card p-4">
        <ToastNotifier ref={toastRef} />
        <div className="text-center py-8">
          <i className="pi pi-lock text-6xl text-500 mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">Akses Ditolak</h3>
          <p className="text-500 mb-4">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <Button 
            label="Kembali ke Dashboard" 
            icon="pi pi-home"
            onClick={() => router.push('/dashboard')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Manajemen User</h3>

      {/* HeaderBar dengan Search dan Tambah */}
      <div className="mb-4">
        <HeaderBar
          title=""
          placeholder="Cari user (Nama, Email, Role)"
          onSearch={handleSearch}
          onAddClick={() => {
            setSelectedUser(null);
            setDialogMode('add');
          }}
          showAddButton={true}
        />
      </div>

      {/* Data Table */}
      <CustomDataTable 
        data={users} 
        loading={isLoading} 
        columns={userColumns}
        emptyMessage="Belum ada data user"
      />

      {/* Form Modal */}
      <UserFormModal
        isOpen={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={handleSubmit}
        mode={dialogMode}
      />
    </div>
  );
}