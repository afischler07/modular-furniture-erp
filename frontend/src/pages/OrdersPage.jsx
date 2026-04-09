import { useNavigate } from 'react-router-dom';
import { useQuery } from '../hooks/useApi';
import { db } from '../utils/api';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';

const columns = [
  { header: 'Auftrags-Nr.', accessor: 'order_number' },
  { header: 'Typ', render: row => <StatusBadge status={row.order_type} /> },
  { header: 'Kunde', accessor: row => {
    const c = row.customers;
    return c?.company_name || `${c?.first_name || ''} ${c?.last_name || ''}`.trim() || '–';
  }},
  { header: 'Datum', render: row => row.order_date ? new Date(row.order_date).toLocaleDateString('de-CH') : '–' },
  { header: 'Lieferung', render: row => row.delivery_date ? new Date(row.delivery_date).toLocaleDateString('de-CH') : '–' },
  { header: 'Total', render: row => row.total ? `CHF ${Number(row.total).toLocaleString('de-CH', { minimumFractionDigits: 2 })}` : '–' },
  { header: 'Status', render: row => <StatusBadge status={row.status} /> },
];

export default function OrdersPage() {
  const { data, loading } = useQuery(() => db.orders.list(), []);
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Aufträge" subtitle="Kauf- und Mietaufträge" />
      {loading ? (
        <div className="text-center py-8 text-gray-400">Laden...</div>
      ) : (
        <DataTable
          columns={columns}
          data={data || []}
          onRowClick={row => navigate(`/orders/${row.id}`)}
          searchPlaceholder="Auftrag suchen..."
        />
      )}
    </div>
  );
}
