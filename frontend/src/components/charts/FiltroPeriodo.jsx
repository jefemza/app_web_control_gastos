import { Calendar } from 'lucide-react';
import PropTypes from 'prop-types';

export default function FiltroPeriodo({ periodo, onChange }) {
  const periodos = [
    { value: 'mes', label: 'Este mes' },
    { value: 'trimestre', label: 'Trimestre' },
    { value: 'semestre', label: 'Semestre' },
    { value: 'año', label: 'Este año' }
  ];

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-5 w-5 text-gray-400" />
      <select
        value={periodo}
        onChange={(e) => onChange(e.target.value)}
        className="bg-esm-gray border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-esm-gold transition-colors"
      >
        {periodos.map(p => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}

FiltroPeriodo.propTypes = {
  periodo: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};