'use client';

import SuhuDialogForm from '@/app/(main)/monitor/suhu/components/SuhuDialogForm';
import { Mesin } from '@/types/mesin';
import { MonitorSuhu } from '@/types/monitor-suhu';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { useEffect, useRef, useState } from 'react';
import { formatISODate } from '@/utils/format-iso-date';
import { FileUpload } from 'primereact/fileupload';
import ToastNotifier, { ToastNotifierHandle } from '@/app/components/ToastNotifier';

const SuhuPage = () => {
    const toastRef = useRef<ToastNotifierHandle>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [monitorSuhu, setMonitorSuhu] = useState<MonitorSuhu[]>([]);
    const [mesin, setMesin] = useState<Mesin[]>([]);
    const [selectedMonitorSuhu, setSelectedMonitorSuhu] = useState<MonitorSuhu | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
    const [fileUploadDialog, setFileUploadDialog] = useState<boolean>(false);

    const fetchMasterMesin = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/mesin');
            const json = await res.json();

            setMesin(json.data.master_mesin);
        } catch (err) {
            console.error(`Failed to fetch: ${(err as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMonitorSuhu = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/monitor-suhu');
            const json = await res.json();

            console.log(json);

            if (json.data.status !== '03') {
                setMonitorSuhu(json.data.monitor_suhu);
            }
        } catch (err) {
            console.error(`Failed to fetch: ${(err as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (data: MonitorSuhu) => {
        let updated: MonitorSuhu;

        if (dialogMode === 'add') {
            const res = await fetch('/api/monitor-suhu', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            const json = await res.json();
            updated = json.data.monitor_suhu;
            setMonitorSuhu((prev) => [...prev, updated]);
        } else if (dialogMode === 'edit' && selectedMonitorSuhu) {
            const res = await fetch(`/api/monitor-suhu/${selectedMonitorSuhu.id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            const json = await res.json();
            updated = json.data.monitor_suhu;
            console.log(updated);
            setMonitorSuhu((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        }

        setDialogMode(null);
        setSelectedMonitorSuhu(null);
    };

    useEffect(() => {
        fetchMonitorSuhu();
        fetchMasterMesin();
    }, []);

    return (
        <div className="card">
            <h3 className="text-xl font-semibold">Update Suhu Mesin</h3>
            <div className="flex justify-content-end gap-3 my-3">
                <Button className="text-sm" label="Import excel" icon="pi pi-file" onClick={() => setFileUploadDialog(true)} size="small" />
                <Button
                    className="text-sm"
                    label="Tambah Data"
                    icon="pi pi-plus"
                    onClick={() => {
                        // setAddDialog(true)
                        setDialogMode('add');
                        setSelectedMonitorSuhu(null);
                    }}
                    size="small"
                />
            </div>
            <DataTable size="small" className="text-sm" value={monitorSuhu} paginator rows={10} loading={isLoading} scrollable>
                <Column field="kode_mesin" header="Kode Mesin" filter />
                <Column
                    field="tanggal_input"
                    header="Tanggal Input"
                    body={(row) => {
                        // `${new Date(row.tanggal_input)}`
                        return formatISODate(row.tanggal_input);
                    }}
                    sortable
                />
                <Column field="keterangan_suhu" header="Keterangan Suhu" body={(row) => `${row.keterangan_suhu}°C`} />

                <Column
                    header="Aksi"
                    body={(row: MonitorSuhu) => (
                        <div className="flex gap-2">
                            <Button
                                icon="pi pi-pencil text-sm"
                                size="small"
                                severity="warning"
                                onClick={() => {
                                    // setEditDialog(true);
                                    setSelectedMonitorSuhu(row);
                                    setDialogMode('edit');
                                }}
                            />
                            <Button
                                icon="pi pi-trash text-sm"
                                size="small"
                                severity="danger"
                                onClick={() => {
                                    // setDeleteDialog(true);
                                    confirmDialog({
                                        message: `Yakin ingin menghapus data ${row.id_mesin}`,
                                        header: 'Konfirmasi Hapus',
                                        acceptLabel: 'Hapus',
                                        rejectLabel: 'Batal',
                                        acceptClassName: 'p-button-danger',
                                        accept: async () => {
                                            try {
                                                const res = await fetch(`/api/monitor-suhu/${row.id}`, {
                                                    method: 'DELETE'
                                                });

                                                if (!res.ok) throw new Error('Gagal menghapus data monitor suhu');

                                                setMonitorSuhu((prev) => prev.filter((item) => item.id !== row.id));
                                            } catch (err) {
                                                console.error((err as Error).message);
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
            <SuhuDialogForm
                visible={dialogMode !== null}
                mode={dialogMode}
                initialData={selectedMonitorSuhu}
                mesin={mesin}
                onHide={() => {
                    setDialogMode(null);
                    setSelectedMonitorSuhu(null);
                }}
                onSubmit={handleSubmit}
            />
            <Dialog style={{ minWidth: '70vw' }} header="Import Data" visible={fileUploadDialog} onHide={() => setFileUploadDialog(false)}>
                <FileUpload
                    name="file"
                    url="/api/monitor-suhu/import"
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    chooseLabel="Upload Excel"
                    customUpload
                    uploadHandler={async (event) => {
                        const file = event.files[0];
                        const formData = new FormData();
                        formData.append('file', file);

                        try {
                            const res = await fetch('/api/monitor-suhu/import', {
                                method: 'POST',
                                body: formData
                            });

                            const json = await res.json();
                            if (!res.ok) {
                                throw new Error(json.message || 'Import failed');
                            }

                            if (json.data.status === '00') {
                                toastRef.current?.showToast(json.data.status, json.data.message);
                                await fetchMonitorSuhu();
                                setFileUploadDialog(false);
                            } else {
                                toastRef.current?.showToast(json.data.status, json.data.message);
                            }
                        } catch (err) {
                            console.error(`Import Error: ${(err as Error).message}`);
                        }
                    }}
                />
            </Dialog>
            <ToastNotifier />;
        </div>
    );
};

export default SuhuPage;
