'use client';

import { User } from '@/types/user';
import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';

const UserPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [addDialog, setAddDialog] = useState<boolean>(false);

    const fetchUser = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/users');
            const json = await res.json();

            setUsers(json.data.users);
        } catch (err) {
            console.error(`Failed to fetch: ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);
    return (
        <div className="card">
            <h3 className="text-xl font-semibold">Master User</h3>

            <div className="flex justify-content-end my-3">
                <Button label="Tambah User" icon="pi pi-plus" className="text-sm" onClick={() => setAddDialog(true)} />
            </div>

            <DataTable size="small" className="text-sm" value={users} paginator rows={10} loading={isLoading} scrollable>
                <Column field="name" header="Kode Mesin" filter />
                <Column field="email" header="Nama Mesin" />
                <Column field="role" header="Role" />
                <Column
                    header="Aksi"
                    body={(row: User) => (
                        <div className="flex gap-2">
                            <Button icon="pi pi-pencil text-sm" size="small" severity="warning" onClick={() => console.log('edit')} />
                            <Button icon="pi pi-trash text-sm" size="small" severity="danger" onClick={() => console.log('delete')} />
                        </div>
                    )}
                    style={{ width: '150px' }}
                />
            </DataTable>

            <Dialog header="Add Users" visible={addDialog} onHide={() => setAddDialog(false)}>
                <form>
                    <div className="mb-3">
                        <label htmlFor="kode-mesin">Nama User</label>
                        <InputText type="text" className="w-full mt-3" placeholder="Nama" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="nama-mesin">Nama Mesin</label>
                        <InputText type="email" className="w-full mt-3" placeholder="Email" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="nama-mesin">Password</label>
                        <InputText type="password" className="w-full mt-3" placeholder="Password" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="role">Role</label>
                        <Dropdown options={['admin', 'user']} className="w-full mt-3" placeholder="Role" />
                    </div>

                    <div className="flex justify-content-end">
                        <Button label="Submit" severity="success" icon="pi pi-save" />
                    </div>
                </form>
            </Dialog>
        </div>
    );
};

export default UserPage;
