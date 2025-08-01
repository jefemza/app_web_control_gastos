import { useState } from 'react';
import { X, Download, Eye, FileText, Image as ImageIcon } from 'lucide-react';

export default function FilePreview({ archivos = [] }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!archivos || archivos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay archivos adjuntos</p>
      </div>
    );
  }

  const handlePreview = (archivo) => {
    if (archivo.type && archivo.type.startsWith('image/')) {
      setPreviewUrl(archivo.url);
      setShowPreview(true);
    } else {
      // Para PDFs y otros archivos, abrir en nueva pestaña
      window.open(archivo.url, '_blank');
    }
  };

  const handleDownload = async (archivo) => {
    try {
      const response = await fetch(archivo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = archivo.name || 'archivo';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar:', error);
    }
  };

  const getFileIcon = (archivo) => {
    if (archivo.type && archivo.type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (size) => {
    if (!size) return 'N/A';
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <>
      <div className="space-y-2">
        {archivos.map((archivo, index) => (
          <div
            key={archivo.id || index}
            className="bg-gray-700/30 rounded-lg p-3 flex items-center justify-between group hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="text-gray-400">
                {getFileIcon(archivo)}
              </div>
              <div>
                <p className="text-sm text-white">{archivo.name || 'Archivo sin nombre'}</p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(archivo.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handlePreview(archivo)}
                className="p-2 text-blue-400 hover:bg-gray-600 rounded-lg transition-colors"
                title="Ver archivo"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDownload(archivo)}
                className="p-2 text-green-400 hover:bg-gray-600 rounded-lg transition-colors"
                title="Descargar"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de vista previa para imágenes */}
      {showPreview && previewUrl && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-10 right-0 text-white hover:text-yellow-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={previewUrl}
              alt="Vista previa"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}