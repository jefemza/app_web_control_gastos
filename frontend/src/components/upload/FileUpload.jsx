import { useState, useRef } from 'react';
import { Upload, X, File, Image as ImageIcon, Camera } from 'lucide-react';

export default function FileUpload({ onFileSelect, maxSize = 5, acceptedTypes = ['image/*', 'application/pdf'] }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const maxSizeInBytes = maxSize * 1024 * 1024; // Convertir MB a bytes

  const handleFile = (file) => {
    setError('');

    // Validar tamaño
    if (file.size > maxSizeInBytes) {
      setError(`El archivo es muy grande. Máximo ${maxSize}MB permitidos.`);
      return;
    }

    // Validar tipo
    const fileType = file.type;
    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';

    if (!isImage && !isPDF) {
      setError('Solo se permiten imágenes y archivos PDF.');
      return;
    }

    setSelectedFile(file);

    // Crear preview para imágenes
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    // Notificar al componente padre
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <>
          {/* Área de carga */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive 
                ? 'border-esm-gold bg-esm-gold/10' 
                : 'border-gray-600 hover:border-gray-500 bg-esm-gray/30'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleChange}
              accept={acceptedTypes.join(',')}
            />
            
            <input
              ref={cameraInputRef}
              type="file"
              className="hidden"
              onChange={handleChange}
              accept="image/*"
              capture="environment"
            />

            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            
            <p className="text-gray-300 mb-2">
              Arrastra y suelta tu archivo aquí, o
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-sm"
              >
                Seleccionar archivo
              </button>
              
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <Camera size={16} />
                Tomar foto
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Máximo {maxSize}MB • Formatos: JPG, PNG, PDF
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </>
      ) : (
        /* Preview del archivo */
        <div className="bg-esm-gray/50 rounded-lg p-4">
          <div className="flex items-start gap-4">
            {preview ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="w-24 h-24 object-cover rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-esm-gray rounded-lg flex items-center justify-center">
                {selectedFile.type === 'application/pdf' ? (
                  <File className="w-12 h-12 text-gray-400" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
            )}
            
            <div className="flex-1">
              <h4 className="text-gray-200 font-medium truncate">
                {selectedFile.name}
              </h4>
              <p className="text-gray-400 text-sm">
                {formatFileSize(selectedFile.size)}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {selectedFile.type || 'Tipo desconocido'}
              </p>
            </div>
            
            <button
              type="button"
              onClick={removeFile}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-sm"
            >
              Cambiar archivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}