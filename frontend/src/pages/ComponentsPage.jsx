import { useQuery } from '../hooks/useApi';
import { db } from '../utils/api';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';

const columns = [
  { header: 'Komp.-Nr.', accessor: 'component_number' },
  { header: 'Bezeichnung', accessor: 'name', render: row => (
    <span className="max-w-xs truncate block" title={row.name}>{row.name}</span>
  )},
  { header: 'Zusatz', accessor: 'additional_name' },
  { header: 'L (mm)', accessor: 'length_mm', render: row => row.length_mm || '–' },
  { header: 'B (mm)', accessor: 'width_mm', render: row => row.width_mm || '–' },
  { header: 'H (mm)', accessor: 'height_mm', render: row => row.height_mm || '–' },
  { header: 'Einheit', accessor: 'unit' },
  { header: 'Basismaterial', accessor: 'base_material_code', render: row => row.base_material_code ? (
    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">{row.base_material_code}</span>
  ) : '–' },
  { header: 'Kalkulation', accessor: 'calculation_type' },
];

export default function ComponentsPage() {
  const { data, loading } = useQuery(() => db.components.list(), []);

  return (
    <div>
      <PageHeader title="Komponenten" subtitle="Einzelteile und Zubehör (Stufe 3)" />
      {loading ? (
        <div className="text-center py-8 text-gray-400">Laden...</div>
      ) : (
        <DataTable columns={columns} data={data || []} searchPlaceholder="Komponente suchen..." />
      )}
    </div>
  );
}
