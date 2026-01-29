'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Mesin } from '@/types/mesin';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import MesinDialogForm from '@/app/(main)/master/mesin/components/MesinDialogForm';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ToastNotifier, { ToastNotifierHandle } from '@/app/components/ToastNotifier';

const MesinPage = () => {
    const toastRef = useRef<ToastNotifierHandle>(null);
    const [addDialog, setAddDialog] = useState<boolean>(false);
    const [editDialog, setEditDialog] = useState<boolean>(false);
    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

    const [mesin, setMesin] = useState<Mesin[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedMesin, setSelectedMesin] = useState<Mesin | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);

    // const [input, setInput] = useState<Mesin | object>({});

    const fetchMesin = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/mesin');
            const json = await res.json();
            const body = json.data;

            if (body.status === '00') {
                toastRef.current?.showToast(body.status, body.message);
                setMesin(json.data.master_mesin);
            } else {
                toastRef.current?.showToast(body.status, body.message);
            }
        } catch (err) {
            console.error(`Failed to fetch: ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (data: Mesin) => {
        let updated: Mesin;

        if (dialogMode === 'add') {
            const res = await fetch('/api/mesin', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            const json = await res.json();
            const body = json.data;

            if (body.status === '00') {
                toastRef.current?.showToast(body.status, body.message);
                updated = body.master_mesin;
                setMesin((prev) => [...prev, updated]);
            } else {
                toastRef.current?.showToast(body.status, body.message);
            }
        } else if (dialogMode === 'edit' && selectedMesin) {
            const res = await fetch(`/api/mesin/${selectedMesin.id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            const json = await res.json();
            const body = json.data;

            if (body.status === '00') {
                toastRef.current?.showToast(body.status, body.message);
                updated = body.master_mesin;
                setMesin((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            } else {
                toastRef.current?.showToast(body.status, body.message);
            }
        }

        setDialogMode(null);
        setSelectedMesin(null);
        // fetchMesin();
    };

    const add = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log();
    };

    useEffect(() => {
        fetchMesin();
    }, []);

    return (
        <div className="card">
            <h3 className="text-xl font-semibold">Master Mesin</h3>

            <div className="flex justify-content-end my-3">
                <Button
                    label="Tambah Mesin"
                    icon="pi pi-plus"
                    onClick={() => {
                        // setAddDialog(true)
                        setDialogMode('add');
                        setSelectedMesin(null);
                    }}
                />
            </div>

            <DataTable size="small" className="text-sm" value={mesin} paginator rows={10} loading={isLoading} scrollable>
                <Column field="kode_mesin" header="Kode Mesin" filter />
                <Column field="nama_mesin" header="Nama Mesin" filter />
                <Column header="Suhu Maksimal" field="suhu_maksimal" body={(row) => `${row.suhu_maksimal}°C`} />
                <Column
                    header="Aksi"
                    body={(row: Mesin) => (
                        <div className="flex gap-2">
                            <Button
                                icon="pi pi-pencil text-sm"
                                size="small"
                                severity="warning"
                                onClick={() => {
                                    setSelectedMesin(row);
                                    setDialogMode('edit');
                                    // setEditDialog(true);
                                }}
                            />
                            <Button
                                icon="pi pi-trash text-sm"
                                size="small"
                                severity="danger"
                                onClick={() => {
                                    // setSelectedMesin(row);
                                    // setDialogMode('add');
                                    // setDeleteDialog(true);
                                    confirmDialog({
                                        message: `Yakin ingin menghapus mesin "${row.nama_mesin}" (${row.kode_mesin})?`,
                                        header: 'Konfirmasi Hapus',
                                        icon: 'pi pi-exclamation-triangle',
                                        acceptLabel: 'Hapus',
                                        rejectLabel: 'Batal',
                                        acceptClassName: 'p-button-danger',
                                        accept: async () => {
                                            try {
                                                console.log(row.id);
                                                const res = await fetch(`/api/mesin/${row.id}`, {
                                                    method: 'DELETE'
                                                });

                                                if (!res.ok) throw new Error('Gagal menghapus mesin');

                                                setMesin((prev) => prev.filter((item) => item.id !== row.id));
                                            } catch (err) {
                                                console.error(err);
                                                // optional: show toast error
                                            }
                                        }
                                    });
                                }}
                            />
                        </div>
                    )}
                    style={{ width: '150px' }}
                />
            </DataTable>

            <ConfirmDialog />

            <Dialog
                header={`Hapus Data ${selectedMesin?.kode_mesin}`}
                visible={deleteDialog}
                onHide={() => {
                    setSelectedMesin(null);
                    setDeleteDialog(false);
                }}
            >
                <div className="flex flex-col gap-4">
                    <p>
                        Yakin ingin menghapus mesin <strong>{selectedMesin?.nama_mesin}</strong>?
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button label="Batal" onClick={() => setDeleteDialog(false)} />
                        <Button
                            label="Hapus"
                            icon="pi pi-trash"
                            severity="danger"
                            onClick={async () => {
                                await fetch(`/api/mesin/`, { method: 'DELETE' });
                            }}
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog header={`Update Data ${selectedMesin?.kode_mesin}`} visible={editDialog} onHide={() => setEditDialog(false)}>
                <form>
                    <div className="mb-3">
                        <label htmlFor="kode-mesin">Kode Mesin</label>
                        <InputText value={selectedMesin?.kode_mesin} type="text" className="w-full mt-3" placeholder="Kode Mesin" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="nama-mesin">Nama Mesin</label>
                        <InputText value={selectedMesin?.nama_mesin} type="text" className="w-full mt-3" placeholder="Nama Mesin" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="suhu-maksiaml">Suhu Maksimal Mesin</label>
                        <div className="p-inputgroup mt-3">
                            <InputNumber value={selectedMesin?.suhu_maksimal} placeholder="Suhu Maksimal Mesin" useGrouping={false} />
                            <span className="p-inputgroup-addon">°C</span>
                        </div>
                    </div>

                    <div className="flex justify-content-end">
                        <Button label="Submit" severity="success" icon="pi pi-save" />
                    </div>
                </form>
            </Dialog>

            <MesinDialogForm
                visible={dialogMode !== null}
                mode={dialogMode}
                initialData={selectedMesin}
                onHide={() => {
                    setDialogMode(null);
                    setSelectedMesin(null);
                }}
                onSubmit={handleSubmit}
            />

            <Dialog header="Tambah Data Master Mesin" visible={addDialog} onHide={() => setAddDialog(false)}>
                <form>
                    <div className="mb-3">
                        <label htmlFor="kode-mesin">Kode Mesin</label>
                        <InputText type="text" className="w-full mt-3" placeholder="Kode Mesin" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="nama-mesin">Nama Mesin</label>
                        <InputText type="text" className="w-full mt-3" placeholder="Nama Mesin" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="suhu-maksiaml">Suhu Maksimal Mesin</label>
                        <div className="p-inputgroup mt-3">
                            <InputNumber type="text" placeholder="Suhu Maksimal Mesin" useGrouping={false} />
                            <span className="p-inputgroup-addon">°C</span>
                        </div>
                    </div>

                    <div className="flex justify-content-end">
                        <Button label="Submit" severity="success" icon="pi pi-save" />
                    </div>
                </form>
            </Dialog>

            <ToastNotifier ref={toastRef} />
        </div>
    );
};

export default MesinPage;
