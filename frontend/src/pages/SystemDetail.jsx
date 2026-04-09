import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '../hooks/useApi';
import { db } from '../utils/api';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import { ArrowLeft } from 'lucide-react';

export default function SystemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: system, loading } = useQuery(() => db.systems.get(id), [id]);

  if (loading) return <div className="text-center py-8 text-gray-400">Laden...</div>;
  if (!system) return <div className="text-center py-8 text-red-500">System nicht gefunden</div>;

  return (
    <div>
      <PageHeader
        title={system.name}
        subtitle={`System ${system.system_number}`}
        breadcrumbs={[
          { label: 'Systeme', to: '/systems' },
          { label: system.name }
        ]}
        actions={
          <button onClick={() => navigate('/systems')} className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
            <ArrowLeft size={16} /> Zurück
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-gray-500">Status</dt><dd><StatusBadge status={system.status} /></dd></div>
            <div><dt className="text-gray-500">Verkaufspreis</dt><dd>{system.sale_price ? `CHF ${Number(system.sale_price).toFixed(2)}` : '–'}</dd></div>
            <div><dt className="text-gray-500">Miete/Monat</dt><dd>{system.rental_price_monthly ? `CHF ${Number(system.rental_price_monthly).toFixed(2)}` : '–'}</dd></div>
            <div><dt className="text-gray-500">Verfügbar für Kauf</dt><dd>{system.available_for_sale ? 'Ja' : 'Nein'}</dd></div>
            <div><dt className="text-gray-500">Verfügbar für Miete</dt><dd>{system.available_for_rent ? 'Ja' : 'Nein'}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Stückliste (Artikel)</h2>
          {system.bom?.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Art.-Nr.</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Artikelname</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Variante</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Menge</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {system.bom.map(item => (
                  <tr key={item.id} className="hover:bg-green-50 cursor-pointer"
                    onClick={() => item.articles && navigate(`/articles/${item.articles.id}`)}>
                    <td className="px-4 py-2 font-mono">{item.articles?.article_number}</td>
                    <td className="px-4 py-2">{item.articles?.name}</td>
                    <td className="px-4 py-2">{item.articles?.variant || '–'}</td>
                    <td className="px-4 py-2 text-right font-medium">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400">Keine Artikel zugeordnet</p>
          )}
        </div>
      </div>
    </div>
  );
}
