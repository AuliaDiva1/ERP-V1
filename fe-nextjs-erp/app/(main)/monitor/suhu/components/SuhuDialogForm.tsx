import { Mesin } from '@/types/mesin';
import { MonitorSuhu, MonitorSuhuPayload } from '@/types/monitor-suhu';
import { ErrorMessage, Form, Formik } from 'formik';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import * as Yup from 'yup';

type Props = {
    visible: boolean;
    mode: 'add' | 'edit' | null;
    mesin: Mesin[];
    initialData?: MonitorSuhu | null;
    onHide: () => void;
    onSubmit: (data: MonitorSuhu) => void;
};

const defaultValues: MonitorSuhu = {
    // id: 0,
    id_mesin: 0,
    tanggal_input: new Date(),
    // waktu_input: new Date().toTimeString(),
    keterangan_suhu: 0
};

const validationSchema = Yup.object({
    id_mesin: Yup.number().required('Kode Mesin wajib diisi'),
    tanggal_input: Yup.date().required('Tanggal Input wajib diisi'),
    // waktu_input: Yup.date().required('Waktu Input wajib diisi'),
    keterangan_suhu: Yup.number().typeError('Suhu harus berupa angka').required('Suhu Maksimal wajib diisi')
});

const SuhuDialogForm = ({ visible, mode, mesin, initialData, onHide, onSubmit }: Props) => {
    const isEdit = mode === 'edit';
    const title = isEdit ? `Edit Data ${initialData?.id_mesin}` : 'Tambah Data Monitor Suhu';

    return (
        <Dialog style={{ minWidth: '70vw' }} header={title} visible={visible} onHide={onHide}>
            <Formik
                initialValues={initialData ?? defaultValues}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={(values, actions) => {
                    // const tanggal = values.tanggal_input.split('T')[0];
                    // const waktu = values.waktu_input.split(' ')[0];
                    onSubmit(values);
                    actions.setSubmitting(false);
                }}
            >
                {({ values, handleChange, setFieldValue, isSubmitting }) => (
                    <Form>
                        <div className="mb-3">
                            <label htmlFor="kode-mesin">Kode Mesin</label>
                            <Dropdown className="w-full mt-3" value={values.id_mesin} onChange={(e) => setFieldValue('id_mesin', e.value || '')} options={mesin} optionLabel="kode_mesin" optionValue="id" placeholder="Kode Mesin" filter />

                            <ErrorMessage name="id_mesin" component="small" className="p-error" />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="tanggal_input">Tanggal Input</label>
                            <Calendar className="w-full mt-3" value={new Date(values.tanggal_input)} onChange={handleChange} showTime showIcon placeholder="Tanggal Input" />
                            <ErrorMessage name="tanggal_input" component="small" className="p-error" />
                            {/*
<div className="col-12 md:col-6">

                            </div>
<div className="col-12 md:col-6">
                                <label htmlFor="waktu_input">Waktu Input</label>
                                <Calendar className="w-full mt-3" value={values.waktu_input} onChange={handleChange} placeholder="Wakut Input" showTime timeOnly hourFormat="24" />
                                <ErrorMessage name="waktu_input" component="small" className="p-error" />
                            </div>
                            */}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="suhu-maksiaml">Suhu Mesin</label>
                            <div className="p-inputgroup mt-3">
                                <InputNumber value={values.keterangan_suhu} onValueChange={(e) => setFieldValue('keterangan_suhu', e.value ?? 0)} placeholder="Suhu Mesin" useGrouping={false} />
                                <span className="p-inputgroup-addon">°C</span>
                            </div>
                            <ErrorMessage name="keterangan_suhu" component="small" className="p-error" />
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

export default SuhuDialogForm;
