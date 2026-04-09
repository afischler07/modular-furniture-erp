import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '../hooks/useApi';
import { db } from '../utils/api';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import { ArrowLeft } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, loading } = useQuery(() => db.orders.get(id), [id]);

  if (loading) return <div className="text-center py-8 text-gray-400">Laden...</div>;
  if (!order) return <div className="text-center py-8 text-red-500">Auftrag nicht gefunden</div>;

  const customer = order.customers;

  return (
    <div>
      <PageHeader
        title={`Auftrag ${order.order_number}`}
        breadcrumbs={[{ label: 'Aufträge', to: '/orders' }, { label: order.order_number }]}
        actions={
          <button onClick={() => navigate('/orders')} className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
            <ArrowLeft size={16} /> Zurück
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Auftrag</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-500">Status</dt><dd><StatusBadge status={order.status} /></dd></div>
            <div><dt className="text-gray-500">Typ</dt><dd><StatusBadge status={order.order_type} /></dd></div>
            <div><dt className="text-gray-500">Datum</dt><dd>{order.order_date ? new Date(order.order_date).toLocaleDateString('de-CH') : '–'}</dd></div>
            <div><dt className="text-gray-500">Lieferdatum</dt><dd>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('de-CH') : '–'}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Kunde</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-500">Name</dt><dd>{customer?.first_name} {customer?.last_name}</dd></div>
            {customer?.company_name && <div><dt className="text-gray-500">Firma</dt><dd>{customer.company_name}</dd></div>}
            {customer?.email && <div><dt className="text-gray-500">E-Mail</dt><dd>{customer.email}</dd></div>}
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Beträge</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-500">Zwischensumme</dt><dd>CHF {Number(order.subtotal || 0).toFixed(2)}</dd></div>
            <div><dt className="text-gray-500">MwSt. ({order.vat_rate}%)</dt><dd>CHF {Number(order.vat_amount || 0).toFixed(2)}</dd></div>
            {order.discount_amount > 0 && <div><dt className="text-gray-500">Rabatt</dt><dd>- CHF {Number(order.discount_amount).toFixed(2)}</dd></div>}
            <div className="pt-2 border-t"><dt className="text-gray-900 font-semibold">Total</dt><dd className="text-lg font-bold">CHF {Number(order.total || 0).toFixed(2)}</dd></div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Positionen</h2>
        {order.items?.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Typ</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Artikel</th>
                <th className="px-4 py-2 text-right font-medium text-gray-600">Menge</th>
                <th className="px-4 py-2 text-right font-medium text-gray-600">Stückpreis</th>
                <th className="px-4 py-2 text-right font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.items.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-2"><StatusBadge status={item.item_type} /></td>
                  <td className="px-4 py-2">
                    {item.systems?.name || item.articles?.name || item.components?.name || '–'}
                    {item.articles?.variant && <span className="text-gray-400 ml-1">({item.articles.variant})</span>}
                  </td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">CHF {Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right font-medium">CHF {Number(item.total_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400">Keine Positionen</p>
        )}
      </div>
    </div>
  );
}
