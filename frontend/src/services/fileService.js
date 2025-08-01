/**
 * Servicio para manejo de archivos
 * En desarrollo: usa localStorage
 * En producción: usará Supabase Storage
 */

// Configuración
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

/**
 * Valida un archivo antes de cargarlo
 */
export const validateFile = (file) => {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo es muy grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Validar tipo
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, WEBP, PDF');
  }

  // Validar extensión
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error('Extensión de archivo no válida');
  }

  return true;
};

/**
 * Convierte un archivo a base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Guarda un archivo (simulado en localStorage para desarrollo)
 */
export const uploadFile = async (file, gastoId) => {
  try {
    // Validar archivo
    validateFile(file);

    // Convertir a base64
    const base64 = await fileToBase64(file);

    // Crear metadata del archivo
    const fileData = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      gastoId: gastoId,
      base64: base64
    };

    // Guardar en localStorage (temporal)
    const files = getStoredFiles();
    files.push(fileData);
    localStorage.setItem('esm_files', JSON.stringify(files));

    // Retornar URL simulada
    return {
      url: `local://files/${fileData.id}`,
      id: fileData.id,
      name: file.name
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene archivos guardados
 */
export const getStoredFiles = () => {
  const files = localStorage.getItem('esm_files');
  return files ? JSON.parse(files) : [];
};

/**
 * Obtiene un archivo específico
 */
export const getFile = (fileId) => {
  const files = getStoredFiles();
  return files.find(f => f.id === fileId);
};

/**
 * Obtiene archivos de un gasto
 */
export const getFilesByGasto = (gastoId) => {
  const files = getStoredFiles();
  return files.filter(f => f.gastoId === gastoId);
};

/**
 * Elimina un archivo
 */
export const deleteFile = (fileId) => {
  const files = getStoredFiles();
  const filtered = files.filter(f => f.id !== fileId);
  localStorage.setItem('esm_files', JSON.stringify(filtered));
};

/**
 * Comprime una imagen antes de subirla
 */
export const compressImage = async (file, maxWidth = 1200) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        }, 'image/jpeg', 0.8);
      };
    };
  });
};

/**
 * Captura imagen desde cámara (para móviles)
 */
export const captureFromCamera = async () => {
  try {
    // Verificar soporte
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('La cámara no está disponible en este dispositivo');
    }

    // Solicitar permisos (esto abrirá la cámara nativa en móviles)
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment' // Cámara trasera
      } 
    });

    // Crear video temporal
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    // Esperar a que el video esté listo
    await new Promise(resolve => {
      video.onloadedmetadata = resolve;
    });

    // Crear canvas para capturar
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Detener stream
    stream.getTracks().forEach(track => track.stop());

    // Convertir a blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });

    // Crear archivo
    const file = new File([blob], `captura_${Date.now()}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    return file;
  } catch (error) {
    throw error;
  }
};
