import { useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

export default function DataTable({ columns, data, onRowClick, searchPlaceholder = 'Suchen...' }) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const filtered = data?.filter(row =>
    !search || columns.some(col => {
      const val = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
      return String(val || '').toLowerCase().includes(search.toLowerCase());
    })
  ) || [];

  const sorted = sortCol !== null
    ? [...filtered].sort((a, b) => {
        const col = columns[sortCol];
        const va = typeof col.accessor === 'function' ? col.accessor(a) : a[col.accessor];
        const vb = typeof col.accessor === 'function' ? col.accessor(b) : b[col.accessor];
        const cmp = String(va || '').localeCompare(String(vb || ''), 'de', { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const toggleSort = (idx) => {
    if (sortCol === idx) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(idx); setSortDir('asc'); }
  };

  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    onClick={() => toggleSort(i)}
                    className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {sortCol === i && (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                    Keine Einträge gefunden
                  </td>
                </tr>
              ) : sorted.map((row, ri) => (
                <tr
                  key={row.id || ri}
                  onClick={() => onRowClick?.(row)}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-green-50' : ''} transition-colors`}
                >
                  {columns.map((col, ci) => (
                    <td key={ci} className="px-4 py-3">
                      {col.render
                        ? col.render(row)
                        : typeof col.accessor === 'function'
                          ? col.accessor(row)
                          : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t">
          {sorted.length} von {data?.length || 0} Einträgen
        </div>
      </div>
    </div>
  );
}
