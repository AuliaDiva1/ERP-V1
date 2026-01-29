import { Column, ColumnProps } from 'primereact/column';
import { DataTable, DataTableValue } from 'primereact/datatable';
import { DataTableProps } from '@/types/datatable';

const CustomDataTable = <T extends DataTableValue>({ data, loading = false, columns }: DataTableProps<T>) => (
    <DataTable value={data} loading={loading} rows={10} rowsPerPageOptions={[10, 20, 30]} paginator>
        {columns.map((col, index) => (
            <Column key={index} field={col.field as string} header={col.header} filter={col.filter} body={col.body} style={col.style} />
        ))}
    </DataTable>
);

export default CustomDataTable;
