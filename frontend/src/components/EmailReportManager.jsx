import { useState, useEffect } from 'react';
import { Mail, Clock, Users, Send, Settings, Eye, Calendar } from 'lucide-react';
import { 
  enviarReporteDiario, 
  programarReporteAutomatico, 
  obtenerEstadisticasReportes,
  verificarEstadoCronJob,
  EMAIL_CONFIG 
} from '../services/emailReportService';
import { getCurrentDateArgentina } from '../utils/formatters';

const EmailReportManager = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [destinatarios, setDestinatarios] = useState([
    'luistelloiphone@gmail.com',     // Luis Sergio Tello (SUPERADMIN)
    'pablorua@hotmail.com',          // Juan Pablo Rúa (SOCIO)
    'eugenion.cavallaro@gmail.com'   // Eugenio Cavallaro (SOCIO)
  ]);
  const [horaEnvio, setHoraEnvio] = useState('21:00');
  const [fechaReporte, setFechaReporte] = useState(getCurrentDateArgentina());
  const [estadisticas, setEstadisticas] = useState(null);
  const [estadoCronJob, setEstadoCronJob] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Verificar permisos
  const canManageReports = user?.role === 'superadmin' || user?.role === 'admin';

  useEffect(() => {
    if (canManageReports) {
      cargarEstadisticas();
      cargarEstadoCronJob();
    }
  }, [canManageReports]);

  const cargarEstadisticas = async () => {
    try {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 30); // Últimos 30 días
      const fechaFin = new Date();
      
      const stats = await obtenerEstadisticasReportes(fechaInicio, fechaFin);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const cargarEstadoCronJob = async () => {
    try {
      const estado = await verificarEstadoCronJob();
      setEstadoCronJob(estado);
    } catch (error) {
      console.error('Error cargando estado del cron job:', error);
    }
  };

  const handleEnviarReporte = async () => {
    if (!canManageReports) {
      setMessage('❌ No tienes permisos para enviar reportes');
      return;
    }

    if (destinatarios.length === 0) {
      setMessage('❌ Debes especificar al menos un destinatario');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const fecha = new Date(fechaReporte);
      const resultado = await enviarReporteDiario(destinatarios, fecha);
      
      setMessage(`✅ ${resultado.message}. Enviado a ${resultado.destinatarios} destinatarios.`);
      
      // Recargar estadísticas
      await cargarEstadisticas();
      
    } catch (error) {
      setMessage(`❌ Error enviando reporte: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramarAutomatico = async () => {
    if (!canManageReports) {
      setMessage('❌ No tienes permisos para programar reportes');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const resultado = await programarReporteAutomatico(destinatarios, horaEnvio);
      setMessage(`✅ ${resultado.message} para las ${resultado.horaEnvio}`);
    } catch (error) {
      setMessage(`❌ Error programando reporte: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const agregarDestinatario = () => {
    const nuevoEmail = prompt('Ingresa el email del destinatario:');
    if (nuevoEmail && nuevoEmail.includes('@')) {
      setDestinatarios([...destinatarios, nuevoEmail]);
    }
  };

  const removerDestinatario = (index) => {
    setDestinatarios(destinatarios.filter((_, i) => i !== index));
  };

  if (!canManageReports) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-400 text-center">
          ❌ Solo los administradores pueden gestionar reportes por email
        </p>
      </div>
    );
  }

  return (
    <div className="bg-esm-gray rounded-xl p-6 border border-gray-700">
      <div className="flex items-center mb-6">
        <Mail className="w-6 h-6 text-esm-gold mr-3" />
        <h3 className="text-lg font-medium text-white">
          📧 Gestión de Reportes por Email
        </h3>
      </div>

      {/* Configuración del email */}
      <div className="mb-6 p-4 bg-black/20 rounded-lg">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Configuración del Email Oficial
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Remitente:</span>
            <p className="text-white font-mono">{EMAIL_CONFIG.from}</p>
          </div>
          <div>
            <span className="text-gray-400">Empresa:</span>
            <p className="text-white">{EMAIL_CONFIG.companyName}</p>
          </div>
        </div>
      </div>

      {/* Destinatarios */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
                     <h4 className="text-white font-medium flex items-center">
             <Users className="w-4 h-4 mr-2" />
             Destinatarios (Los Tres Socios)
           </h4>
          <button
            onClick={agregarDestinatario}
            className="px-3 py-1 bg-esm-gold text-black text-sm rounded hover:bg-yellow-400 transition-colors"
          >
            + Agregar
          </button>
        </div>
        
        <div className="space-y-2">
          {destinatarios.map((email, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
              <span className="text-white text-sm">{email}</span>
              <button
                onClick={() => removerDestinatario(index)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Envío manual */}
      <div className="mb-6 p-4 bg-black/20 rounded-lg">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <Send className="w-4 h-4 mr-2" />
          Envío Manual de Reporte
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Fecha del reporte:</label>
            <input
              type="date"
              value={fechaReporte}
              onChange={(e) => setFechaReporte(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-esm-gold focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleEnviarReporte}
              disabled={loading}
              className="w-full px-4 py-2 bg-esm-gold text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Reporte
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Programación automática */}
      <div className="mb-6 p-4 bg-black/20 rounded-lg">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Programación Automática
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Hora de envío diario:</label>
            <input
              type="time"
              value={horaEnvio}
              onChange={(e) => setHoraEnvio(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-esm-gold focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleProgramarAutomatico}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Programando...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Programar Automático
                </>
              )}
            </button>
          </div>
        </div>
        
                 <p className="text-gray-400 text-sm">
           ⏰ Los reportes se enviarán automáticamente todos los días a las {horaEnvio} (hora Argentina)
         </p>
                  <p className="text-gray-400 text-xs mt-1">
           🌍 Zona horaria: America/Argentina/Buenos_Aires
         </p>
         
         {/* Estado del Cron Job */}
         {estadoCronJob && (
           <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
             <h5 className="text-blue-400 font-medium mb-2 flex items-center">
               <Clock className="w-4 h-4 mr-2" />
               Estado del Envío Automático
             </h5>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
               <div>
                 <span className="text-gray-400">Estado:</span>
                 <span className={`ml-2 ${estadoCronJob.active ? 'text-green-400' : 'text-red-400'}`}>
                   {estadoCronJob.active ? '✅ Activo' : '❌ Inactivo'}
                 </span>
               </div>
               <div>
                 <span className="text-gray-400">Próximo envío:</span>
                 <span className="ml-2 text-white">
                   {new Date(estadoCronJob.nextRun).toLocaleString('es-AR')}
                 </span>
               </div>
               <div>
                 <span className="text-gray-400">Último envío:</span>
                 <span className="ml-2 text-white">
                   {new Date(estadoCronJob.lastRun).toLocaleString('es-AR')}
                 </span>
               </div>
               <div>
                 <span className="text-gray-400">Programación:</span>
                 <span className="ml-2 text-white">
                   {estadoCronJob.schedule} ({estadoCronJob.timezone})
                 </span>
               </div>
             </div>
           </div>
         )}
       </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="mb-6 p-4 bg-black/20 rounded-lg">
          <h4 className="text-white font-medium mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Estadísticas de Reportes (Últimos 30 días)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-esm-gold">{estadisticas.totalEnviados}</div>
              <div className="text-gray-400 text-sm">Total Enviados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{estadisticas.exitosos}</div>
              <div className="text-gray-400 text-sm">Exitosos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{estadisticas.fallidos}</div>
              <div className="text-gray-400 text-sm">Fallidos</div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de estado */}
      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.includes('✅') 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message}
        </div>
      )}

             {/* Información adicional */}
       <div className="text-gray-400 text-sm space-y-2">
         <p>📧 <strong>Email oficial:</strong> {EMAIL_CONFIG.from}</p>
         <p>👥 <strong>Destinatarios:</strong> Los tres socios de ESM Argentina</p>
         <ul className="ml-4 space-y-1 text-xs">
           <li>• Luis Sergio Tello (SUPERADMIN)</li>
           <li>• Juan Pablo Rúa (SOCIO)</li>
           <li>• Eugenio Cavallaro (SOCIO)</li>
         </ul>
         <p>📊 <strong>Contenido:</strong> Resumen diario de gastos, fondos y balance</p>
         <p>⏰ <strong>Frecuencia:</strong> Diario a las 21:00 hs (hora Argentina)</p>
         <p>🌍 <strong>Zona horaria:</strong> America/Argentina/Buenos_Aires</p>
       </div>
    </div>
  );
};

export default EmailReportManager;
