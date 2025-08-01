import { TrendingUp, TrendingDown, DollarSign, FileText, PieChart, Minus } from 'lucide-react';
import PropTypes from 'prop-types';

export default function ResumenEstadisticas({ estadisticas }) {
  const { 
    totalMesActual = 0, 
    totalMesAnterior = 0, 
    porcentajeCambio = 0,
    cantidadGastosMes = 0,
    promedioGasto = 0,
    categoriaMaxima = 'N/A',
    montoMaximoCategoria = 0
  } = estadisticas || {};

  const getTrendIcon = () => {
    if (porcentajeCambio > 0) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (porcentajeCambio < 0) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (porcentajeCambio > 0) return 'text-red-500';
    if (porcentajeCambio < 0) return 'text-green-500';
    return 'text-gray-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Mes Actual */}
      <div className="bg-esm-gray rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <DollarSign className="h-8 w-8 text-esm-gold" />
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-sm font-semibold ${getTrendColor()}`}>
              {Math.abs(porcentajeCambio).toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-2xl font-bold text-white">
          ${totalMesActual.toLocaleString('es-AR')}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Total este mes
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Mes anterior: ${totalMesAnterior.toLocaleString('es-AR')}
        </p>
      </div>

      {/* Cantidad de Gastos */}
      <div className="bg-esm-gray rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <FileText className="h-8 w-8 text-blue-500" />
        </div>
        <p className="text-2xl font-bold text-white">
          {cantidadGastosMes}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Gastos este mes
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Promedio: ${promedioGasto.toLocaleString('es-AR')}
        </p>
      </div>

      {/* Categoría Principal */}
      <div className="bg-esm-gray rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <PieChart className="h-8 w-8 text-purple-500" />
        </div>
        <p className="text-lg font-bold text-white capitalize">
          {categoriaMaxima}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Categoría principal
        </p>
        <p className="text-xs text-gray-500 mt-1">
          ${montoMaximoCategoria.toLocaleString('es-AR')} gastados
        </p>
      </div>

      {/* Tendencia */}
      <div className="bg-esm-gray rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          {porcentajeCambio >= 0 ? (
            <TrendingUp className="h-8 w-8 text-orange-500" />
          ) : (
            <TrendingDown className="h-8 w-8 text-green-500" />
          )}
        </div>
        <p className={`text-2xl font-bold ${getTrendColor()}`}>
          {porcentajeCambio >= 0 ? '+' : ''}{porcentajeCambio.toFixed(1)}%
        </p>
        <p className="text-sm text-gray-400 mt-1">
          vs. mes anterior
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {porcentajeCambio > 0 ? 'Aumentó' : porcentajeCambio < 0 ? 'Disminuyó' : 'Sin cambios'}
        </p>
      </div>
    </div>
  );
}

ResumenEstadisticas.propTypes = {
  estadisticas: PropTypes.shape({
    totalMesActual: PropTypes.number,
    totalMesAnterior: PropTypes.number,
    porcentajeCambio: PropTypes.number,
    cantidadGastosMes: PropTypes.number,
    promedioGasto: PropTypes.number,
    categoriaMaxima: PropTypes.string,
    montoMaximoCategoria: PropTypes.number
  })
};