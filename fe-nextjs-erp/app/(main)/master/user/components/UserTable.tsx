'use client';

import { User } from '@/types/user';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

interface Props {
    data: User[];
    loading: boolean;
    onEdit: (item: User) => void;
    onDelete: (item: User) => void;
}

const UserTable = ({ data, loading, onEdit, onDelete }: Props) => {
    return (
        <DataTable size="small" className="text-sm" value={data} paginator rows={10} loading={loading} scrollable>
            <Column field="name" header="Name" filter />
            <Column field="email" header="Email" filter />
            <Column field="role" header="Role" />
            <Column
                header="Aksi"
                body={(row: User) => (
                    <div className="flex gap-2">
                        <Button icon="pi pi-pencil text-sm" size="small" severity="warning" onClick={() => onEdit(row)} />
                        <Button icon="pi pi-trash text-sm" size="small" severity="danger" onClick={() => onDelete(row)} />
                    </div>
                )}
                style={{ width: '150px' }}
            />
        </DataTable>
    );
};

export default UserTable;
