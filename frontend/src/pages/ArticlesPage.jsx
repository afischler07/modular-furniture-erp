import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../hooks/useApi';
import { db } from '../utils/api';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';

const columns = [
  { header: 'Art.-Nr.', accessor: 'article_number' },
  { header: 'Artikelname', accessor: 'name' },
  { header: 'Variante', render: row => row.variant ? (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
      row.variant === 'Fichte' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'
    }`}>{row.variant}</span>
  ) : '–' },
  { header: 'Verkaufspreis', render: row => row.sale_price ? `CHF ${Number(row.sale_price).toFixed(2)}` : '–' },
  { header: 'Miete/Mt.', render: row => row.rental_price_monthly ? `CHF ${Number(row.rental_price_monthly).toFixed(2)}` : '–' },
  { header: 'Status', render: row => <StatusBadge status={row.status} /> },
];

export default function ArticlesPage() {
  const [variantFilter, setVariantFilter] = useState('');
  const { data, loading } = useQuery(() => db.articles.list(), []);
  const navigate = useNavigate();

  const filtered = variantFilter
    ? (data || []).filter(a => a.variant === variantFilter)
    : (data || []);

  return (
    <div>
      <PageHeader title="Artikel" subtitle="Einzelne Möbelstücke (Stufe 2)"
        actions={
          <div className="flex gap-2">
            {['', 'Fichte', 'Lärche'].map(v => (
              <button key={v}
                onClick={() => setVariantFilter(v)}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  variantFilter === v ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {v || 'Alle'}
              </button>
            ))}
          </div>
        }
      />
      {loading ? (
        <div className="text-center py-8 text-gray-400">Laden...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={row => navigate(`/articles/${row.id}`)}
          searchPlaceholder="Artikel suchen..."
        />
      )}
    </div>
  );
}
