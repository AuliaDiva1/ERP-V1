'use client';

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const roles = [
  { label: 'SUPERADMIN', value: 'SUPERADMIN' },
  { label: 'GUDANG', value: 'GUDANG' },
  { label: 'PRODUKSI', value: 'PRODUKSI' },
  { label: 'HR', value: 'HR' },
  { label: 'KEUANGAN', value: 'KEUANGAN' },
];

const UserFormModal = ({ isOpen, onClose, onSubmit, user, mode }) => {
  const isEdit = mode === 'edit';

  const defaultValues = {
    name: '',
    email: '',
    role: 'GUDANG',
    password: '',
  };

  const initialValues = user ? { ...defaultValues, ...user, password: '' } : defaultValues;

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, 'Nama minimal 3 karakter')
      .required('Nama wajib diisi'),
    email: Yup.string()
      .email('Email tidak valid')
      .required('Email wajib diisi'),
    role: Yup.string()
      .required('Role wajib dipilih'),
    password: !isEdit 
      ? Yup.string()
          .min(8, 'Password minimal 8 karakter')
          .required('Password wajib diisi')
      : Yup.string()
          .min(8, 'Password minimal 8 karakter'),
  });

  const title = isEdit ? `Edit User: ${user?.name || ''}` : 'Tambah User Baru';

  return (
    <Dialog 
      style={{ minWidth: '500px', maxWidth: '600px' }} 
      header={title} 
      visible={isOpen} 
      onHide={onClose}
      draggable={false}
      dismissableMask
    >
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={(values, actions) => {
          const payload = {
            name: values.name,
            email: values.email,
            role: values.role,
          };

          if (values.password && values.password.trim() !== '') {
            payload.password = values.password;
          }

          onSubmit(payload);
          actions.setSubmitting(false);
        }}
      >
        {({ values, handleChange, setFieldValue, isSubmitting }) => (
          <Form>
            {/* Nama */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-900 font-medium mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <InputText
                id="name"
                name="name"
                className="w-full"
                value={values.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
              />
              <ErrorMessage name="name" component="small" className="p-error block mt-1" />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-900 font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <InputText
                id="email"
                name="email"
                type="email"
                className="w-full"
                value={values.email}
                onChange={handleChange}
                placeholder="nama@gmail.com"
                disabled={isEdit} 
              />
              <ErrorMessage name="email" component="small" className="p-error block mt-1" />
            </div>

            {/* Role */}
            <div className="mb-4">
              <label htmlFor="role" className="block text-900 font-medium mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <Dropdown
                id="role"
                name="role"
                value={values.role}
                options={roles}
                onChange={(e) => setFieldValue('role', e.value)}
                className="w-full"
                placeholder="Pilih Role"
              />
              <ErrorMessage name="role" component="small" className="p-error block mt-1" />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-900 font-medium mb-2">
                Password {!isEdit && <span className="text-red-500">*</span>}
                {isEdit && <span className="text-500 text-sm"> (Kosongkan jika tidak ingin mengubah)</span>}
              </label>
              <InputText
                id="password"
                name="password"
                type="password"
                className="w-full"
                value={values.password}
                onChange={handleChange}
                placeholder={isEdit ? "Masukkan password baru" : "Minimal 8 karakter"}
              />
              <ErrorMessage name="password" component="small" className="p-error block mt-1" />
            </div>

            {/* Action Buttons - HANYA WARNA YANG DIUBAH */}
            <div className="flex justify-content-end gap-2 mt-5 pt-4 border-top-1 surface-border">
              <Button 
                label="Batal" 
                icon="pi pi-times" // Icon asli Batal Anda
                className="p-button-text" 
                onClick={onClose}
                type="button"
              />
              <Button
                label={isEdit ? 'Update User' : 'Tambah User'}
                type="submit"
                // Severity dihapus agar warna sinkron dengan tombol primer tema Anda
                disabled={isSubmitting}
                icon={isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-save'} // Icon asli Simpan Anda
                loading={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default UserFormModal;