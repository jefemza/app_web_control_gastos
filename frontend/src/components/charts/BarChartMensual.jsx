import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-esm-dark border border-esm-gold/20 p-3 rounded-lg shadow-lg">
        <p className="text-esm-gold font-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString('es-AR')}
          </p>
        ))}
        <p className="text-white font-semibold mt-1 pt-1 border-t border-gray-600">
          Total: ${payload.reduce((sum, entry) => sum + entry.value, 0).toLocaleString('es-AR')}
        </p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string
};

export default function BarChartMensual({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No hay datos para mostrar
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toLocaleString('es-AR')}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="aprobado" stackId="a" fill="#10B981" name="Aprobados" />
          <Bar dataKey="pendiente" stackId="a" fill="#D4AF37" name="Pendientes" />
          <Bar dataKey="rechazado" stackId="a" fill="#EF4444" name="Rechazados" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

BarChartMensual.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    pendiente: PropTypes.number.isRequired,
    aprobado: PropTypes.number.isRequired,
    rechazado: PropTypes.number.isRequired,
    total: PropTypes.number
  }))
};