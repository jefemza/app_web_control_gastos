import { useState } from 'react';
import { createGasto } from '../services/gastosService';
import { RefreshCw, Plus } from 'lucide-react';

export default function TestDataButton({ user }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const gastosEjemplo = [
    {
      fecha: '2025-01-28',
      monto: 15000,
      medioPago: 'efectivo',
      categoria: 'viáticos',
      descripcion: 'Almuerzo con cliente importante - PENDIENTE DE APROBACIÓN',
      usuario: 'Luis Tello',
      usuarioId: 'luis_uid',
      usuarioEmail: 'luis.tello@esm.com.ar',
      archivos: []
    },
    {
      fecha: '2025-01-27',
      monto: 8500,
      medioPago: 'billetera',
      categoria: 'transporte',
      descripcion: 'Taxi al aeropuerto para reunión - PENDIENTE',
      usuario: 'Eugenio Cavallaro',
      usuarioId: 'eugenio_uid',
      usuarioEmail: 'eugenio.cavallaro@esm.com.ar',
      archivos: []
    },
    {
      fecha: '2025-01-26',
      monto: 25000,
      medioPago: 'transferencia',
      categoria: 'útiles',
      descripcion: 'Compra de material de oficina mensual - PENDIENTE',
      usuario: 'Noelia',
      usuarioId: 'noelia_uid',
      usuarioEmail: 'noelia@esm.com.ar',
      archivos: []
    }
  ];

  const handleCreateTestData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      let created = 0;
      for (const gasto of gastosEjemplo) {
        await createGasto(gasto);
        created++;
      }
      
      setMessage(`✅ ${created} gastos de prueba creados exitosamente`);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error al crear gastos de prueba');
    } finally {
      setLoading(false);
    }
  };

  // Solo mostrar para admin
  if (user.role !== 'admin_principal') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={handleCreateTestData}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Creando...</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span>Agregar Gastos de Prueba</span>
          </>
        )}
      </button>
      
      {message && (
        <div className={`mt-2 p-2 rounded-lg text-sm ${
          message.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}