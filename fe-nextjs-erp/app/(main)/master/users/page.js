'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import ToastNotifier from '../../../components/ToastNotifier';
import HeaderBar from '../../../components/headerbar'; // ✅ Import HeaderBar
import UserFormModal from './components/UserFormModal';
import { getUsers, createUser, updateUser, deleteUser } from './utils/api';
import CustomDataTable from '../../../components/DataTable';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();
  const toastRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [originalData, setOriginalData] = useState([]); // ✅ Tambahkan untuk search
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('TOKEN');
    const role = localStorage.getItem('ROLE');
    
    if (!t) {
      router.push('/');
      return;
    }
    
    if (role !== 'SUPERADMIN') {
      toastRef.current?.showToast('01', 'Anda tidak memiliki akses ke halaman ini');
      router.push('/');
      return;
    }
    
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getUsers(token);
      setUsers(res || []);
      setOriginalData(res || []); // ✅ Simpan data original untuk search
    } catch (err) {
      console.error('Error fetching users:', err);
      toastRef.current?.showToast('01', err.message || 'Gagal memuat data user');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Search handler
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
      fetchUsers();
      setDialogMode(null);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error submitting user:', err);
      toastRef.current?.showToast('01', err.message || 'Gagal menyimpan user');
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
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
          setOriginalData((prev) => prev.filter((u) => u.id !== user.id));
        } catch (err) {
          console.error('Error deleting user:', err);
          toastRef.current?.showToast('01', err.message || 'Gagal menghapus user');
        }
      },
    });
  };

  // Template untuk role dengan color coding
  const roleBodyTemplate = (rowData) => {
    const roleColors = {
      SUPERADMIN: 'danger',
      GUDANG: 'info',
      PRODUKSI: 'warning',
      HR: 'success',
      KEUANGAN: 'primary',
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
      filter: true,
      sortable: true
    },
    { 
      field: 'email', 
      header: 'Email', 
      filter: true,
      sortable: true
    },
    { 
      field: 'role', 
      header: 'Role',
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

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Manajemen User</h3>

      {/* ✅ HeaderBar dengan Search dan Tambah */}
      <div className="mb-4">
        <HeaderBar
          title=""
          placeholder="Cari user (Nama, Email, Role)"
          onSearch={handleSearch}
          onAddClick={() => {
            setSelectedUser(null);
            setDialogMode('add');
          }}
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