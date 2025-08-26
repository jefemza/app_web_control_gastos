// ========================================
// 📊 Componente de Importación/Exportación - ESM Argentina
// ========================================
// Desarrollado por: Claude AI Assistant
// "Siempre aquí para ayudar y resolver problemas técnicos"
// Última actualización: 2025-08-26
// ========================================

import { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import importExportService from '../services/importExportService';
import { CATEGORIAS_GASTOS, MEDIOS_PAGO } from '../constants/categorias';

const ImportExportGastos = ({ user }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [file, setFile] = useState(null);
  const [validation, setValidation] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  // Solo ADMIN y SUPERADMIN pueden usar esta funcionalidad
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null;
  }

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Por favor selecciona un archivo CSV');
      return;
    }

    setFile(selectedFile);
    setValidation(null);
    setImportResults(null);

    try {
      const data = await importExportService.processCSVFile(selectedFile);
      const validationResult = importExportService.validateImportData(data);
      setValidation(validationResult);
    } catch (error) {
      alert('Error procesando archivo: ' + error.message);
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!validation || !validation.valid) {
      alert('Por favor corrige los errores antes de importar');
      return;
    }

    setImporting(true);
    try {
      const results = await importExportService.importGastos(validation.validData, user);
      setImportResults(results);
      alert(`Importación completada: ${results.success} exitosos, ${results.errors} errores`);
    } catch (error) {
      alert('Error en la importación: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = importExportService.exportGastosForImport();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_gastos_esm.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFile(null);
    setValidation(null);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-esm-gray rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-medium text-white flex items-center mb-6">
        <FileText className="w-6 h-6 mr-3 text-esm-gold" />
        Importación/Exportación Masiva de Gastos
      </h3>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-black/20 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'export'
              ? 'bg-esm-gold text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📄 Descargar Template
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'import'
              ? 'bg-esm-gold text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📤 Importar Gastos
        </button>
      </div>

      {activeTab === 'export' && (
        <div className="space-y-4">
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">📋 Template de Importación</h4>
            <p className="text-gray-400 text-sm mb-4">
              Descarga el template CSV con el formato correcto para importar gastos masivamente.
            </p>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h5 className="text-white font-medium mb-2">📝 Formato del archivo:</h5>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>fecha:</strong> YYYY-MM-DD (ej: 2025-01-15)</p>
                <p><strong>monto:</strong> Número decimal (ej: 1500.00)</p>
                <p><strong>categoria:</strong> {CATEGORIAS_GASTOS.join(', ')}</p>
                <p><strong>descripcion:</strong> Descripción del gasto</p>
                <p><strong>medioPago:</strong> {MEDIOS_PAGO.join(', ')}</p>
                <p><strong>comprobante:</strong> Número de factura/comprobante (opcional)</p>
              </div>
            </div>

            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-esm-gold text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Template CSV</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="space-y-4">
          {/* Selección de archivo */}
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">📁 Seleccionar Archivo CSV</h4>
            <p className="text-gray-400 text-sm mb-4">
              Selecciona un archivo CSV con el formato correcto para importar gastos.
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-esm-gold file:text-black hover:file:bg-yellow-400"
            />
          </div>

          {/* Validación */}
          {validation && (
            <div className="bg-black/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">✅ Validación de Datos</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-500/20 rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    <span className="text-green-400 font-medium">{validation.validRows}</span>
                  </div>
                  <p className="text-green-300 text-sm">Válidos</p>
                </div>
                
                <div className="bg-red-500/20 rounded-lg p-3">
                  <div className="flex items-center">
                    <X className="w-5 h-5 text-red-400 mr-2" />
                    <span className="text-red-400 font-medium">{validation.errorRows}</span>
                  </div>
                  <p className="text-red-300 text-sm">Con errores</p>
                </div>
                
                <div className="bg-yellow-500/20 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="text-yellow-400 font-medium">{validation.warnings.length}</span>
                  </div>
                  <p className="text-yellow-300 text-sm">Advertencias</p>
                </div>
              </div>

              {/* Errores */}
              {validation.errors.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-red-400 font-medium mb-2">❌ Errores encontrados:</h5>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {validation.errors.map((error, index) => (
                      <div key={index} className="bg-red-500/10 border border-red-500/30 rounded p-2">
                        <p className="text-red-400 text-sm font-medium">Fila {error.row}:</p>
                        <ul className="text-red-300 text-sm ml-4">
                          {error.errors.map((err, i) => (
                            <li key={i}>• {err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advertencias */}
              {validation.warnings.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-yellow-400 font-medium mb-2">⚠️ Advertencias:</h5>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                        <p className="text-yellow-400 text-sm font-medium">Fila {warning.row}:</p>
                        <ul className="text-yellow-300 text-sm ml-4">
                          {warning.warnings.map((warn, i) => (
                            <li key={i}>• {warn}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex space-x-3">
                <button
                  onClick={handleImport}
                  disabled={!validation.valid || importing}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{importing ? 'Importando...' : 'Importar Gastos'}</span>
                </button>
                
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {/* Resultados de importación */}
          {importResults && (
            <div className="bg-black/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">📊 Resultados de Importación</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-500/20 rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    <span className="text-green-400 font-medium">{importResults.success}</span>
                  </div>
                  <p className="text-green-300 text-sm">Importados exitosamente</p>
                </div>
                
                <div className="bg-red-500/20 rounded-lg p-3">
                  <div className="flex items-center">
                    <X className="w-5 h-5 text-red-400 mr-2" />
                    <span className="text-red-400 font-medium">{importResults.errors}</span>
                  </div>
                  <p className="text-red-300 text-sm">Con errores</p>
                </div>
              </div>

              {importResults.details.length > 0 && (
                <div className="max-h-40 overflow-y-auto">
                  <h5 className="text-white font-medium mb-2">Detalles:</h5>
                  {importResults.details.map((detail, index) => (
                    <div key={index} className={`p-2 rounded mb-1 ${
                      detail.status === 'success' 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                      <p className={`text-sm ${
                        detail.status === 'success' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {detail.gasto.descripcion} - {detail.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportExportGastos;
