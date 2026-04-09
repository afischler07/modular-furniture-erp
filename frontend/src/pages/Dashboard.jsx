import { useQuery } from '../hooks/useApi';
import { db } from '../utils/api';
import { Box, Package, Puzzle, Users, ShoppingCart, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value ?? '–'}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading } = useQuery(() => db.dashboard.get(), []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Laden...</div>;

  const c = data?.counts || {};
  const f = data?.finance || {};

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Übersicht über das modulare Möbelsystem" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Box} label="Systeme" value={c.systems} color="bg-blue-500" />
        <StatCard icon={Package} label="Artikel" value={c.articles} color="bg-green-500" />
        <StatCard icon={Puzzle} label="Komponenten" value={c.components} color="bg-purple-500" />
        <StatCard icon={Users} label="Kunden" value={c.customers} color="bg-orange-500" />
        <StatCard icon={ShoppingCart} label="Aufträge" value={c.orders} color="bg-cyan-500" />
        <StatCard icon={TrendingUp} label="Aktive Mietverträge" value={c.active_rentals} color="bg-emerald-600" />
        <StatCard icon={FileText} label="Offene Rechnungen" value={f.open_invoices_count}
          color="bg-yellow-500"
          sub={f.open_invoices_amount ? `CHF ${Number(f.open_invoices_amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}` : null} />
        <StatCard icon={TrendingUp} label="Miet-Einkommen/Mt." color="bg-green-700"
          value={f.monthly_rental_income ? `CHF ${Number(f.monthly_rental_income).toLocaleString('de-CH', { minimumFractionDigits: 2 })}` : '–'} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Neuer Auftrag', href: '/orders', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
            { label: 'Kunde anlegen', href: '/customers', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { label: 'Lagerbestand', href: '/inventory', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            { label: 'Rechnung erstellen', href: '/invoices', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
          ].map(item => (
            <a key={item.href} href={item.href}
              className={`block px-4 py-3 rounded-lg text-center font-medium text-sm transition-colors ${item.color}`}>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
