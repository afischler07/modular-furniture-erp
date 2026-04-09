import { useState } from 'react';
import { useQuery } from '../hooks/useApi';
import { db } from '../utils/api';

import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import { Plus, X } from 'lucide-react';

const columns = [
  { header: 'Kunden-Nr.', accessor: 'customer_number' },
  { header: 'Typ', render: row => <StatusBadge status={row.customer_type} /> },
  { header: 'Firma', accessor: 'company_name', render: row => row.company_name || '–' },
  { header: 'Name', accessor: row => `${row.first_name} ${row.last_name}` },
  { header: 'E-Mail', accessor: 'email' },
  { header: 'Telefon', accessor: 'phone' },
  { header: 'Ort', acessor: row => row.city ? `${row.zip_code} ${row.city}` : '–' },
  { header: 'Status', render: row => <StatusBadge status={row.status} /> },
];

export default function CustomersPage() {
  const { data, loading, reload } = useQuery(() => db.customers.list(), []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customer_number: '', customer_type: 'private', company_name: '',
    first_name: '', last_name: '', email: '', phone: '',
    street: '', zip_code: '', city: '', country: 'Schweiz'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await db.customers.create(form);
    setShowForm(false);
    setForm({ customer_number: '', customer_type: 'private', company_name: '',
      first_name: '', last_name: '', email: '', phone: '',
      street: '', zip_code: '', city: '', country: 'Schweiz' });
    reload();
  };

  return (
    <div>
      <PageHeader title="Kunden" subtitle="Kundenverwaltung"
        actions={
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Abbrechen' : 'Neuer Kunde'}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kunden-Nr. *</label>
              <input required value={form.customer_number} onChange={e => setForm({...form, customer_number: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
              <select value={form.customer_type} onChange={e => setForm({...form, customer_type: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="private">Privat</option>
                <option value="business">Geschäft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
              <input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
              <input required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
              <input required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
              <input value={form.zip_code} onChange={e => setForm({...form, zip_code: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
              <input value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <button type="submit" className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Kunde speichern
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Laden...</div>
      ) : (
        <DataTable columns={columns} data={data || []} searchPlaceholder="Kunde suchen..." />
      )}
    </div>
  );
}
