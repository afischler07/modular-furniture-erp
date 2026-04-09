import { useState } from 'react';
import { useQuery } from '../hooks/useApi';
import { db } from '../utils/api';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';

const columns = [
  { header: 'Rechnungs-Nr.', accessor: 'invoice_number' },
  { header: 'Kunde', accessor: row => {
    const c = row.customers;
    return c?.company_name || `${c?.first_name || ''} ${c?.last_name || ''}`.trim() || '–';
  }},
  { header: 'Datum', render: row => row.invoice_date ? new Date(row.invoice_date).toLocaleDateString('de-CH') : '–' },
  { header: 'Fällig', render: row => row.due_date ? new Date(row.due_date).toLocaleDateString('de-CH') : '–' },
  { header: 'Total', render: row => `CHF ${Number(row.total || 0).toLocaleString('de-CH', { minimumFractionDigits: 2 })}` },
  { header: 'MwSt.', render: row => `${row.vat_rate}%` },
  { header: 'Status', render: row => <StatusBadge status={row.status} /> },
];

export default function InvoicesPage() {
  const { data, loading } = useQuery(() => db.invoices.list(), []);
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = statusFilter
    ? (data || []).filter(i => i.status === statusFilter)
    : (data || []);

  return (
    <div>
      <PageHeader title="Rechnungen" subtitle="Rechnungsstellung und Zahlungen"
        actions={
          <div className="flex gap-2">
            {['', 'draft', 'sent', 'paid', 'overdue'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  statusFilter === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {s ? { draft: 'Entwurf', sent: 'Versendet', paid: 'Bezahlt', overdue: 'Überfällig' }[s] : 'Alle'}
              </button>
            ))}
          </div>
        }
      />
      {loading ? (
        <div className="text-center py-8 text-gray-400">Laden...</div>
      ) : (
        <DataTable columns={columns} data={filtered} searchPlaceholder="Rechnung suchen..." />
      )}
    </div>
  );
}
