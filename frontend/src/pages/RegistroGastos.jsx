import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Upload, Camera, Calendar, FileText, X, AlertCircle, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import { uploadMultipleFiles, validateFile, captureFromCamera } from '../services/storageService';
import { createGasto } from '../services/gastosService';
import { showToast } from '../components/notifications/ToastContainer';
import { formatCurrency } from '../utils/formatters';
import { CATEGORIAS_GASTOS, MEDIOS_PAGO } from '../constants/categorias';
import PropTypes from 'prop-types';

export default function RegistroGastos({ user, onLogout }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    monto: '',
    medioPago: '',
    categoria: '',
    descripcion: '',
    archivos: []
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');


  // Manejar selección de archivos
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    
    for (const file of files) {
      try {
        validateFile(file);
        const preview = URL.createObjectURL(file);
        validFiles.push({
          file: file,
          preview: preview,
          name: file.name,
          size: file.size,
          type: file.type
        });
      } catch (error) {
        setError(error.message);
        showToast('error', error.message);
        return;
      }
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError('');
  };

  // Capturar desde cámara
  const handleCameraCapture = async () => {
    try {
      const file = await captureFromCamera();
      const preview = URL.createObjectURL(file);
      setSelectedFiles(prev => [...prev, {
        file: file,
        preview: preview,
        name: file.name,
        size: file.size,
        type: file.type
      }]);
    } catch (error) {
      setError(error.message);
      showToast('error', error.message);
    }
  };

  // Eliminar archivo seleccionado
  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.monto || !formData.medioPago || !formData.categoria) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    setIsLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Generar ID temporal para el gasto
      const tempGastoId = `temp_${Date.now()}_${user.uid}`;
      
      // Subir archivos a Firebase Storage si hay archivos seleccionados
      let uploadedFiles = [];
      if (selectedFiles.length > 0) {
        setUploadProgress(20);
        uploadedFiles = await uploadMultipleFiles(
          selectedFiles.map(f => f.file),
          tempGastoId,
          (progress) => setUploadProgress(20 + progress * 0.6)
        );
      }

      setUploadProgress(80);

      // Preparar datos del gasto
      const gastoData = {
        fecha: formData.fecha,
        monto: parseFloat(formData.monto),
        medioPago: formData.medioPago,
        categoria: formData.categoria,
        descripcion: formData.descripcion,
        nombreUsuario: user.name,
        usuarioId: user.id || user.uid,
        archivos: uploadedFiles
      };

      // Crear gasto en Firestore
      await createGasto(gastoData);
      
      setUploadProgress(100);
      showToast('success', 'Gasto registrado exitosamente');
      setTimeout(() => navigate('/vista-gastos'), 1500);
      
    } catch (error) {
      console.error('Error al registrar gasto:', error);
      setError(error.message || 'Error al registrar el gasto');
      showToast('error', error.message || 'Error al registrar el gasto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header user={user} onLogout={onLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Dashboard</span>
        </button>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-yellow-400" />
            <span>Registrar Nuevo Gasto</span>
          </h2>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Monto *
                </label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                  required
                />
                {formData.monto > 10000 && (
                  <p className="text-yellow-400 text-xs mt-1">
                    ⚠️ Monto elevado - Requiere aprobación especial
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Medio de Pago *
                </label>
                <select
                  name="medioPago"
                  value={formData.medioPago}
                  onChange={handleChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {MEDIOS_PAGO.map(medio => (
                    <option key={medio} value={medio}>
                      {medio.charAt(0).toUpperCase() + medio.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoría *
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {CATEGORIAS_GASTOS.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                placeholder="Detalle del gasto..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-400 focus:outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comprobantes
              </label>
              
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Cargar archivo</span>
                </button>

                <button
                  type="button"
                  onClick={handleCameraCapture}
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Tomar foto</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept="image/*,.pdf"
                multiple
                className="hidden"
              />

              <input
                ref={cameraInputRef}
                type="file"
                onChange={handleFileSelect}
                accept="image/*"
                capture="camera"
                className="hidden"
              />

              {/* Vista previa de archivos */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-white">{file.name}</p>
                          <p className="text-xs text-gray-400">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-2">
                Formatos: JPG, PNG, PDF. Máximo 5MB por archivo.
              </p>
            </div>

            {/* Barra de progreso */}
            {isLoading && uploadProgress > 0 && (
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Subiendo archivos...</span>
                  <span className="text-sm text-yellow-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    <span>Registrar Gasto</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

RegistroGastos.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    uid: PropTypes.string,
    name: PropTypes.string.isRequired
  }).isRequired,
  onLogout: PropTypes.func.isRequired
};