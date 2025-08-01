import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import PropTypes from 'prop-types';

const COLORS = {
  libreria: '#3B82F6',
  supermercado: '#10B981',
  premios: '#F59E0B',
  'cartas documento': '#EF4444',
  gabelas: '#8B5CF6',
  internet: '#06B6D4',
  'boletas sindicales': '#EC4899',
  nómina: '#84CC16',
  viáticos: '#D4AF37',
  'recargas chips': '#F97316',
  proveedores: '#6366F1',
  'edemsa 914': '#A78BFA',
  otros: '#6B7280'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-esm-dark border border-esm-gold/20 p-3 rounded-lg shadow-lg">
        <p className="text-esm-gold font-semibold">{payload[0].name}</p>
        <p className="text-white">
          Monto: ${payload[0].value.toLocaleString('es-AR')}
        </p>
        <p className="text-gray-400 text-sm">
          {payload[0].payload.cantidad} gastos
        </p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.number,
    payload: PropTypes.shape({
      cantidad: PropTypes.number
    })
  }))
};

export default function PieChartGastos({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No hay datos para mostrar
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percent }) => 
              `${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name.toLowerCase()] || '#8B5CF6'} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px'
            }}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value}: ${entry.value.toLocaleString('es-AR')}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-2">
        <p className="text-sm text-gray-400">
          Total: <span className="text-esm-gold font-semibold">
            ${total.toLocaleString('es-AR')}
          </span>
        </p>
      </div>
    </div>
  );
}

PieChartGastos.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    cantidad: PropTypes.number
  }))
};