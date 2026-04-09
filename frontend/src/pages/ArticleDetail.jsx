import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '../hooks/useApi';
import { db } from '../utils/api';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import { ArrowLeft } from 'lucide-react';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: article, loading } = useQuery(() => db.articles.get(id), [id]);

  if (loading) return <div className="text-center py-8 text-gray-400">Laden...</div>;
  if (!article) return <div className="text-center py-8 text-red-500">Artikel nicht gefunden</div>;

  return (
    <div>
      <PageHeader
        title={`${article.name}${article.variant ? ` (${article.variant})` : ''}`}
        subtitle={`Artikel ${article.article_number}`}
        breadcrumbs={[
          { label: 'Artikel', to: '/articles' },
          { label: article.name }
        ]}
        actions={
          <button onClick={() => navigate('/articles')} className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
            <ArrowLeft size={16} /> Zurück
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-gray-500">Status</dt><dd><StatusBadge status={article.status} /></dd></div>
            <div><dt className="text-gray-500">Variante</dt><dd>{article.variant || '–'}</dd></div>
            <div><dt className="text-gray-500">Beschreibung</dt><dd>{article.description || '–'}</dd></div>
            {article.width_cm && <div><dt className="text-gray-500">Masse (B x H x T)</dt><dd>{article.width_cm} x {article.height_cm} x {article.depth_cm} cm</dd></div>}
            {article.weight_kg && <div><dt className="text-gray-500">Gewicht</dt><dd>{article.weight_kg} kg</dd></div>}
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Preise</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-gray-500">Einkaufspreis</dt><dd>{article.purchase_price ? `CHF ${Number(article.purchase_price).toFixed(2)}` : '–'}</dd></div>
            <div><dt className="text-gray-500">Verkaufspreis</dt><dd>{article.sale_price ? `CHF ${Number(article.sale_price).toFixed(2)}` : '–'}</dd></div>
            <div><dt className="text-gray-500">Miete/Monat</dt><dd>{article.rental_price_monthly ? `CHF ${Number(article.rental_price_monthly).toFixed(2)}` : '–'}</dd></div>
            <div><dt className="text-gray-500">Miete/Woche</dt><dd>{article.rental_price_weekly ? `CHF ${Number(article.rental_price_weekly).toFixed(2)}` : '–'}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Verfügbarkeit</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-gray-500">Kauf</dt><dd>{article.available_for_sale ? 'Ja' : 'Nein'}</dd></div>
            <div><dt className="text-gray-500">Miete</dt><dd>{article.available_for_rent ? 'Ja' : 'Nein'}</dd></div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Stückliste (Komponenten)</h2>
        {article.bom?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Komp.-Nr.</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Bezeichnung</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Zusatz</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">L (mm)</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">B (mm)</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">H (mm)</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Menge</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {article.bom.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs">{item.components?.component_number}</td>
                    <td className="px-4 py-2">{item.components?.name}</td>
                    <td className="px-4 py-2 text-gray-500">{item.components?.additional_name || '–'}</td>
                    <td className="px-4 py-2 text-right">{item.components?.length_mm || '–'}</td>
                    <td className="px-4 py-2 text-right">{item.components?.width_mm || '–'}</td>
                    <td className="px-4 py-2 text-right">{item.components?.height_mm || '–'}</td>
                    <td className="px-4 py-2 text-right font-medium">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">Keine Komponenten zugeordnet</p>
        )}
      </div>
    </div>
  );
}
