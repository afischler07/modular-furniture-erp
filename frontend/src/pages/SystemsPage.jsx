import { useNavigate } from 'react-router-dom';
import { useQuery } from '../hooks/useApi';
import { db } from '../utils/api';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';

const columns = [
  { header: 'System-Nr.', accessor: 'system_number' },
  { header: 'Name', accessor: 'name' },
  { header: 'Kategorie', accessor: row => row.categories?.name || '–' },
  { header: 'Verkaufspreis', render: row => row.sale_price ? `CHF ${Number(row.sale_price).toFixed(2)}` : '–' },
  { header: 'Miete/Mt.', render: row => row.rental_price_monthly ? `CHF ${Number(row.rental_price_monthly).toFixed(2)}` : '–' },
  { header: 'Kauf', render: row => row.available_for_sale ? 'Ja' : 'Nein' },
  { header: 'Miete', render: row => row.available_for_rent ? 'Ja' : 'Nein' },
  { header: 'Status', render: row => <StatusBadge status={row.status} /> },
];

export default function SystemsPage() {
  const { data, loading } = useQuery(() => db.systems.list(), []);
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Systeme" subtitle="Modulare Möbelsysteme (Stufe 1)" />
      {loading ? (
        <div className="text-center py-8 text-gray-400">Laden...</div>
      ) : (
        <DataTable
          columns={columns}
          data={data || []}
          onRowClick={row => navigate(`/systems/${row.id}`)}
          searchPlaceholder="System suchen..."
        />
      )}
    </div>
  );
}
