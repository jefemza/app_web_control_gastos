/**
 * Utilidades para formateo y validaciones
 */

// Formatear moneda argentina
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }
  
  const number = parseFloat(amount);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

// Formatear fecha
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  let dateObj = date;
  
  // Manejar diferentes tipos de fecha
  if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate(); // Firestore Timestamp
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  }
  
  if (isNaN(dateObj)) return 'Fecha inválida';
  
  return dateObj.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Formatear fecha y hora
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  let dateObj = date;
  
  if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  }
  
  if (isNaN(dateObj)) return 'Fecha inválida';
  
  return dateObj.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar contraseña
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Obtener iniciales del nombre
export const getInitials = (name) => {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

// Capitalizar primera letra
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncar texto
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generar color para avatar basado en el nombre
export const getAvatarColor = (name) => {
  if (!name) return 'bg-gray-500';
  
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500'
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Validar archivo
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB por defecto
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  } = options;
  
  const errors = [];
  
  if (!file) {
    errors.push('No se ha seleccionado ningún archivo');
    return errors;
  }
  
  if (file.size > maxSize) {
    errors.push(`El archivo es demasiado grande. Máximo: ${formatFileSize(maxSize)}`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`);
  }
  
  return errors;
};

// Formatear tamaño de archivo
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generar ID único
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Debounce función
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Manejar errores de Firebase
export const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error);
  
  const errorMessages = {
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-email': 'Email inválido',
    'auth/user-disabled': 'Usuario deshabilitado',
    'auth/email-already-in-use': 'El email ya está registrado',
    'auth/weak-password': 'La contraseña es muy débil',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/too-many-requests': 'Demasiados intentos fallidos',
    'auth/network-request-failed': 'Error de conexión',
    'permission-denied': 'Sin permisos para esta operación',
    'unavailable': 'Servicio no disponible temporalmente',
    'deadline-exceeded': 'Tiempo de espera agotado',
    'not-found': 'Documento no encontrado',
    'already-exists': 'El documento ya existe',
    'resource-exhausted': 'Límite de recursos excedido',
    'failed-precondition': 'Condiciones previas no cumplidas',
    'aborted': 'Operación cancelada',
    'out-of-range': 'Valor fuera de rango',
    'unimplemented': 'Operación no implementada',
    'internal': 'Error interno del servidor',
    'data-loss': 'Pérdida de datos detectada'
  };
  
  return errorMessages[error.code] || error.message || 'Error desconocido';
};

// Validar datos de usuario
export const validateUserData = (userData) => {
  const errors = [];
  
  if (!userData.name || userData.name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }
  
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push('El email no es válido');
  }
  
  if (!userData.role || !['admin_principal', 'contadora', 'socio_operador'].includes(userData.role)) {
    errors.push('Debe seleccionar un rol válido');
  }
  
  if (userData.password && !isValidPassword(userData.password)) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  return errors;
};

// Validar datos de gasto
export const validateExpenseData = (expenseData) => {
  const errors = [];
  
  if (!expenseData.descripcion || expenseData.descripcion.trim().length < 3) {
    errors.push('La descripción debe tener al menos 3 caracteres');
  }
  
  if (!expenseData.monto || expenseData.monto <= 0) {
    errors.push('El monto debe ser mayor a 0');
  }
  
  if (!expenseData.categoria) {
    errors.push('Debe seleccionar una categoría');
  }
  
  if (!expenseData.medioPago) {
    errors.push('Debe seleccionar un medio de pago');
  }
  
  if (!expenseData.fecha) {
    errors.push('Debe especificar una fecha');
  }
  
  return errors;
};

// Sanitizar entrada de texto
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres básicos de XSS
    .substring(0, 1000); // Limitar longitud
};

// Formatear número para input
export const formatNumberInput = (value) => {
  if (!value) return '';
  
  // Remover caracteres no numéricos excepto punto decimal
  const cleaned = value.toString().replace(/[^\d.]/g, '');
  
  // Asegurar solo un punto decimal
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  return cleaned;
};

// Obtener texto del estado
export const getStatusText = (status) => {
  const statusTexts = {
    'pendiente': 'Pendiente',
    'aprobado': 'Aprobado',
    'rechazado': 'Rechazado',
    'activo': 'Activo',
    'inactivo': 'Inactivo'
  };
  
  return statusTexts[status] || status;
};

// Obtener color del estado
export const getStatusColor = (status) => {
  const statusColors = {
    'pendiente': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50',
    'aprobado': 'text-green-400 bg-green-500/20 border-green-500/50',
    'rechazado': 'text-red-400 bg-red-500/20 border-red-500/50',
    'activo': 'text-green-400 bg-green-500/20 border-green-500/50',
    'inactivo': 'text-red-400 bg-red-500/20 border-red-500/50'
  };
  
  return statusColors[status] || 'text-gray-400 bg-gray-500/20 border-gray-500/50';
};

// Calcular tiempo transcurrido
export const getTimeAgo = (date) => {
  if (!date) return 'N/A';
  
  let dateObj = date;
  if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  }
  
  const now = new Date();
  const diffMs = now - dateObj;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) {
    return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  } else if (diffMinutes > 0) {
    return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  } else {
    return 'hace un momento';
  }
};

// Verificar si es móvil
export const isMobile = () => {
  return window.innerWidth < 768;
};

// Copiar texto al portapapeles
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback para navegadores más antiguos
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Exportar datos a CSV
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar');
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar valores que contengan comas o comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Validar permisos de usuario
export const checkUserPermission = (user, permission) => {
  if (!user || !user.role) return false;
  
  const permissions = {
    admin_principal: [
      'canManageUsers',
      'canApproveExpenses', 
      'canViewAllExpenses',
      'canManageFunds',
      'canExportReports',
      'canViewDashboard'
    ],
    contadora: [
      'canViewAllExpenses',
      'canManageFunds',
      'canExportReports',
      'canViewDashboard'
    ],
    socio_operador: [
      'canViewDashboard'
    ]
  };
  
  const userPermissions = permissions[user.role] || [];
  return userPermissions.includes(permission);
};

// Configuración por defecto de la aplicación
export const APP_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  CURRENCY: 'ARS',
  LOCALE: 'es-AR',
  PAGINATION_SIZE: 10,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000
};

// Constantes de la aplicación
export const EXPENSE_CATEGORIES = [
  'Combustible',
  'Peajes',
  'Estacionamiento',
  'Comidas',
  'Materiales de oficina',
  'Transporte público',
  'Taxi/Uber',
  'Hospedaje',
  'Comunicaciones',
  'Materiales de construcción',
  'Herramientas',
  'Servicios profesionales',
  'Otros'
];

export const PAYMENT_METHODS = [
  'Efectivo',
  'Tarjeta de débito',
  'Tarjeta de crédito',
  'Transferencia',
  'Cheque'
];

export const USER_ROLES = [
  { value: 'admin_principal', label: 'Admin Principal' },
  { value: 'contadora', label: 'Contadora' },
  { value: 'socio_operador', label: 'Socio Operador' }
];

export const EXPENSE_STATUS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' }
];

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  isValidEmail,
  isValidPassword,
  getInitials,
  capitalize,
  truncateText,
  getAvatarColor,
  validateFile,
  formatFileSize,
  generateId,
  debounce,
  handleFirebaseError,
  validateUserData,
  validateExpenseData,
  sanitizeInput,
  formatNumberInput,
  getStatusText,
  getStatusColor,
  getTimeAgo,
  isMobile,
  copyToClipboard,
  exportToCSV,
  checkUserPermission,
  APP_CONFIG,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  USER_ROLES,
  EXPENSE_STATUS
};