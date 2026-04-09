const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  discontinued: 'bg-red-100 text-red-800',
  blocked: 'bg-red-100 text-red-800',
  draft: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_delivery: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  credited: 'bg-gray-100 text-gray-800',
  paused: 'bg-yellow-100 text-yellow-800',
  terminated: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  active: 'Aktiv', inactive: 'Inaktiv', discontinued: 'Auslaufend',
  blocked: 'Gesperrt', draft: 'Entwurf', confirmed: 'Bestätigt',
  in_delivery: 'In Lieferung', delivered: 'Geliefert', completed: 'Abgeschlossen',
  cancelled: 'Storniert', sent: 'Versendet', paid: 'Bezahlt',
  overdue: 'Überfällig', credited: 'Gutgeschrieben',
  paused: 'Pausiert', terminated: 'Gekündigt', expired: 'Abgelaufen',
  purchase: 'Kauf', rental: 'Miete',
  private: 'Privat', business: 'Geschäft',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusLabels[status] || status}
    </span>
  );
}
