import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, DollarSign, Calculator } from 'lucide-react';
import { verificarConsistenciaCuentas } from '../scripts/verificarCuentas';

const VerificadorCuentas = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const ejecutarVerificacion = async () => {
    if (!user || user.role !== 'superadmin') {
      setError('Solo los SUPERADMIN pueden ejecutar esta verificación');
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const datos = await verificarConsistenciaCuentas();
      setResultado(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-400 text-center">
          ❌ Solo los SUPERADMIN pueden verificar la consistencia de cuentas
        </p>
      </div>
    );
  }

  return (
    <div className="bg-esm-gray rounded-xl p-6 border border-gray-700">
      <div className="flex items-center mb-6">
        <Calculator className="w-6 h-6 text-esm-gold mr-3" />
        <h3 className="text-lg font-medium text-white">
          🔍 Verificador de Consistencia de Cuentas
        </h3>
      </div>

      <div className="mb-6">
        <p className="text-gray-400 mb-4">
          Este verificador analiza la consistencia entre fondos y gastos para detectar posibles inconsistencias en la cuenta.
        </p>
        
        <button
          onClick={ejecutarVerificacion}
          disabled={loading}
          className="w-full px-4 py-3 bg-esm-gold text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              Verificando...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Ejecutar Verificación
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {resultado && (
        <div className="space-y-6">
          {/* Resumen General */}
          <div className="p-4 bg-black/20 rounded-lg">
            <h4 className="text-white font-medium mb-3 flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              Resumen General
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Fondos:</span>
                <p className="text-white font-medium">{resultado.fondos.length}</p>
              </div>
              <div>
                <span className="text-gray-400">Gastos:</span>
                <p className="text-white font-medium">{resultado.gastos.length}</p>
              </div>
              <div>
                <span className="text-gray-400">Total Ingresos:</span>
                <p className="text-green-400 font-medium">${resultado.totalIngresos.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <span className="text-gray-400">Total Gastos:</span>
                <p className="text-red-400 font-medium">${resultado.totalGastos.toLocaleString('es-AR')}</p>
              </div>
            </div>
          </div>

          {/* Análisis de Gastos */}
          <div className="p-4 bg-black/20 rounded-lg">
            <h4 className="text-white font-medium mb-3">Análisis de Gastos</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Aprobados:</span>
                <p className="text-green-400 font-medium">${resultado.gastosAprobados.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <span className="text-gray-400">Pendientes:</span>
                <p className="text-yellow-400 font-medium">${resultado.gastosPendientes.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <span className="text-gray-400">Rechazados:</span>
                <p className="text-red-400 font-medium">${resultado.gastosRechazados.toLocaleString('es-AR')}</p>
              </div>
            </div>
          </div>

          {/* Balance y Consistencia */}
          <div className="p-4 bg-black/20 rounded-lg">
            <h4 className="text-white font-medium mb-3">Balance y Consistencia</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Balance Calculado:</span>
                <span className="text-white font-medium">${resultado.balanceCalculado.toLocaleString('es-AR')}</span>
              </div>
              
              {resultado.fondoActivo && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saldo Fondo Activo:</span>
                    <span className="text-white font-medium">${parseFloat(resultado.fondoActivo.saldoActual || 0).toLocaleString('es-AR')}</span>
                  </div>
                  
                  {Math.abs(resultado.balanceCalculado - parseFloat(resultado.fondoActivo.saldoActual || 0)) > 0.01 ? (
                    <div className="flex items-center mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded">
                      <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                      <span className="text-red-400 text-sm">
                        ⚠️ Inconsistencia detectada: ${(resultado.balanceCalculado - parseFloat(resultado.fondoActivo.saldoActual || 0)).toLocaleString('es-AR')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-green-400 text-sm">✅ Cuentas consistentes</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Actividad Reciente de Noelia */}
          {(resultado.gastosNoelia.length > 0 || resultado.fondosNoelia.length > 0) && (
            <div className="p-4 bg-black/20 rounded-lg">
              <h4 className="text-white font-medium mb-3">Actividad Reciente de Noelia (Últimos 7 días)</h4>
              
              {resultado.fondosNoelia.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-green-400 text-sm mb-2">💰 Fondos:</h5>
                  <div className="space-y-1">
                    {resultado.fondosNoelia.map((fondo, index) => (
                      <div key={index} className="text-sm text-gray-300">
                        ${parseFloat(fondo.monto || fondo.montoInicial || 0).toLocaleString('es-AR')} - {fondo.descripcion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {resultado.gastosNoelia.length > 0 && (
                <div>
                  <h5 className="text-red-400 text-sm mb-2">💸 Gastos:</h5>
                  <div className="space-y-1">
                    {resultado.gastosNoelia.map((gasto, index) => (
                      <div key={index} className="text-sm text-gray-300">
                        ${parseFloat(gasto.monto || 0).toLocaleString('es-AR')} - {gasto.descripcion} ({gasto.estado})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instrucciones */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-2">📋 Instrucciones</h4>
            <div className="text-sm text-gray-400 space-y-1">
              <p>• Revisa la consola del navegador (F12) para ver el análisis detallado</p>
              <p>• Si hay inconsistencias, verifica los gastos aprobados vs el saldo del fondo activo</p>
              <p>• Los gastos pendientes no afectan el saldo hasta ser aprobados</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificadorCuentas;
