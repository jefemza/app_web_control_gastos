import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Función para comprimir imágenes antes de subir
const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo el aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }));
            } else {
              reject(new Error('Error al comprimir la imagen'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
  });
};

// Subir archivo a Firebase Storage
export const uploadFile = async (file, path) => {
  try {
    let fileToUpload = file;

    // Si es una imagen, comprimir antes de subir
    if (file.type.startsWith('image/')) {
      try {
        fileToUpload = await compressImage(file);
        console.log(`Imagen comprimida: ${file.size} bytes -> ${fileToUpload.size} bytes`);
      } catch (error) {
        console.warn('No se pudo comprimir la imagen, subiendo original:', error);
      }
    }

    // Crear referencia única para el archivo
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `${path}/${fileName}`);

    // Subir archivo
    const snapshot = await uploadBytes(storageRef, fileToUpload, {
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        size: fileToUpload.size.toString(),
      }
    });

    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
      name: file.name,
      size: fileToUpload.size,
      type: file.type,
    };
  } catch (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }
};

// Subir múltiples archivos
export const uploadMultipleFiles = async (files, path, onProgress) => {
  const uploadPromises = files.map((file, index) => 
    uploadFile(file, path).then(result => {
      if (onProgress) {
        onProgress(index, 100); // Notificar que el archivo se subió completamente
      }
      return result;
    })
  );

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error al subir múltiples archivos:', error);
    throw error;
  }
};

// Eliminar archivo de Firebase Storage
export const deleteFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    if (error.code === 'storage/object-not-found') {
      console.warn('El archivo no existe en Storage');
      return true; // No es un error si el archivo no existe
    }
    throw error;
  }
};

// Obtener URL de descarga de un archivo
export const getFileDownloadURL = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Error al obtener URL de descarga:', error);
    throw error;
  }
};

// Validar archivo antes de subir
export const validateFile = (file, maxSizeMB = 5) => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convertir MB a bytes
  
  if (file.size > maxSize) {
    throw new Error(`El archivo es demasiado grande. Máximo permitido: ${maxSizeMB}MB`);
  }

  // Tipos de archivo permitidos
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP) y PDFs.');
  }

  return true;
};

// Función helper para manejar archivos desde input o cámara
export const handleFileSelection = async (files, maxFiles = 3) => {
  if (!files || files.length === 0) {
    throw new Error('No se seleccionaron archivos');
  }

  if (files.length > maxFiles) {
    throw new Error(`Máximo ${maxFiles} archivos permitidos`);
  }

  // Validar cada archivo
  const validFiles = [];
  for (const file of files) {
    try {
      validateFile(file);
      validFiles.push(file);
    } catch (error) {
      console.error(`Error con archivo ${file.name}:`, error.message);
      throw error;
    }
  }

  return validFiles;
};

// Función para capturar imagen desde la cámara
export const captureFromCamera = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Usar cámara trasera por defecto

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          validateFile(file);
          resolve(file);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error('No se capturó ninguna imagen'));
      }
    };

    input.click();
  });
};