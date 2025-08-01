import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import PropTypes from 'prop-types';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-esm-dark border border-esm-gold/20 p-3 rounded-lg shadow-lg">
        <p className="text-esm-gold font-semibold mb-1">Día {label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString('es-AR')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default function LineChartTendencia({ data }) {
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
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPromedio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="dia" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toLocaleString('es-AR')}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="monto" 
            stroke="#D4AF37" 
            fillOpacity={1} 
            fill="url(#colorMonto)"
            name="Gasto diario"
          />
          <Line 
            type="monotone" 
            dataKey="promedio" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={false}
            name="Promedio móvil (7 días)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

LineChartTendencia.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    fecha: PropTypes.string.isRequired,
    monto: PropTypes.number.isRequired,
    promedio: PropTypes.number.isRequired,
    dia: PropTypes.number.isRequired
  }))
};