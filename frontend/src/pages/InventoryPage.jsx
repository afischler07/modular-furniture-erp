import { useState } from 'react';
import { useQuery } from '../hooks/useApi';
import { db } from '../utils/api';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import { AlertTriangle } from 'lucide-react';

const columns = [
  { header: 'Typ', render: row => (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
      row.item_type === 'article' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
    }`}>{row.item_type === 'article' ? 'Artikel' : 'Komponente'}</span>
  )},
  { header: 'Bezeichnung', accessor: row =>
    row.articles?.name ? `${row.articles.article_number} – ${row.articles.name}${row.articles.variant ? ` (${row.articles.variant})` : ''}`
    : row.components?.name ? `${row.components.component_number} – ${row.components.name}`
    : '–'
  },
  { header: 'Lager', accessor: row => row.warehouses?.name || '–' },
  { header: 'Lagerplatz', accessor: 'location' },
  { header: 'Total', accessor: 'quantity_total' },
  { header: 'Verfügbar', render: row => (
    <span className={row.quantity_available <= row.min_stock ? 'text-red-600 font-medium' : ''}>
      {row.quantity_available}
      {row.quantity_available <= row.min_stock && <AlertTriangle size={14} className="inline ml-1" />}
    </span>
  )},
  { header: 'Reserviert', accessor: 'quantity_reserved' },
  { header: 'Vermietet', accessor: 'quantity_rented' },
  { header: 'Min.', accessor: 'min_stock' },
];

export default function InventoryPage() {
  const { data, loading } = useQuery(() => db.inventory.list(), []);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? (data || [])
    : filter === 'low' ? (data || []).filter(i => i.quantity_available <= i.min_stock)
    : (data || []).filter(i => i.item_type === filter);

  return (
    <div>
      <PageHeader title="Lagerverwaltung" subtitle="Bestand und Bewegungen"
        actions={
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Alle' },
              { key: 'article', label: 'Artikel' },
              { key: 'component', label: 'Komponenten' },
              { key: 'low', label: 'Unter Min.' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  filter === f.key ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>{f.label}</button>
            ))}
          </div>
        }
      />
      {loading ? (
        <div className="text-center py-8 text-gray-400">Laden...</div>
      ) : (
        <DataTable columns={columns} data={filtered} searchPlaceholder="Lagerbestand suchen..." />
      )}
    </div>
  );
}
