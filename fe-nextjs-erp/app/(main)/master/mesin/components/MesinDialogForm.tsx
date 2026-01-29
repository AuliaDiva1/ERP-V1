'use client';

import { Mesin } from '@/types/mesin';
import { ErrorMessage, Form, Formik } from 'formik';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import * as Yup from 'yup';

type Props = {
    visible: boolean;
    mode: 'add' | 'edit' | null;
    initialData?: Mesin | null;
    onHide: () => void;
    onSubmit: (data: Mesin) => void;
};

const defaultValues: Mesin = {
    kode_mesin: '',
    nama_mesin: '',
    suhu_maksimal: 0
};

const validationSchema = Yup.object({
    kode_mesin: Yup.string().required('Kode Mesin wajib diisi'),
    nama_mesin: Yup.string().required('Nama Mesin wajib diisi'),
    suhu_maksimal: Yup.number().typeError('Suhu harus berupa angka').required('Suhu Maksimal wajib diisi')
});

const MesinDialogForm = ({ visible, mode, initialData, onHide, onSubmit }: Props) => {
    const isEdit = mode === 'edit';
    const title = isEdit ? `Edit Data ${initialData?.kode_mesin}` : 'Tambah Data Master Mesin';

    return (
        <Dialog style={{ minWidth: '70vw' }} header={title} visible={visible} onHide={onHide}>
            <Formik
                initialValues={initialData ?? defaultValues}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={(values, actions) => {
                    onSubmit(values);
                    actions.setSubmitting(false);
                }}
            >
                {({ values, handleChange, setFieldValue, isSubmitting }) => (
                    <Form>
                        <div className="mt-3">
                            <label htmlFor="kode_mesin">Kode Mesin</label>
                            <InputText id="kode_mesin" name="kode_mesin" className="w-full mt-2" value={values.kode_mesin} onChange={handleChange} disabled={isEdit} />
                            <ErrorMessage name="kode_mesin" component="small" className="p-error" />
                        </div>

                        <div className="mt-3">
                            <label htmlFor="nama_mesin">Nama Mesin</label>
                            <InputText id="nama_mesin" name="nama_mesin" className="w-full mt-2" value={values.nama_mesin} onChange={handleChange} />
                            <ErrorMessage name="nama_mesin" component="small" className="p-error" />
                        </div>

                        <div className="mt-3">
                            <label htmlFor="suhu_maksimal">Suhu Maksimal</label>
                            <div className="p-inputgroup mt-2">
                                <InputNumber id="suhu_maksimal" name="suhu_maksimal" useGrouping={false} value={values.suhu_maksimal} onValueChange={(e) => setFieldValue('suhu_maksimal', e.value ?? 0)} />
                                <span className="p-inputgroup-addon">°C</span>
                            </div>
                            <ErrorMessage name="suhu_maksimal" component="small" className="p-error" />
                        </div>

                        <div className="flex justify-content-end gap-2 mt-3">
                            <Button label={isEdit ? 'Update' : 'Simpan'} icon="pi pi-save" type="submit" severity="success" disabled={isSubmitting} />
                        </div>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default MesinDialogForm;
