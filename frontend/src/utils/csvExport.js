// Utilidad para exportar datos a CSV
export const exportToCSV = (data, headers, filename) => {
  // Validar datos
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Preparar contenido CSV
  const csvRows = [
    headers.join(','), // Encabezados
    ...data.map(row => 
      headers.map(header => {
        const value = row[header.key];
        // Escapar valores que contengan comas o comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value !== undefined && value !== null ? value : '';
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  
  // Agregar BOM para compatibilidad con Excel (caracteres especiales)
  const BOM = '\uFEFF';
  const csvContentWithBOM = BOM + csvContent;
  
  // Crear blob y descargar
  const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpiar
  URL.revokeObjectURL(url);
  
  return true;
};

// Utilidad para formatear datos de gastos para CSV
export const formatGastosForCSV = (gastos) => {
  return gastos.map(gasto => ({
    fecha: new Date(gasto.fecha).toLocaleDateString('es-AR'),
    usuario: gasto.usuario,
    monto: gasto.monto,
    medioPago: gasto.medioPago,
    categoria: gasto.categoria,
    descripcion: gasto.descripcion,
    estado: gasto.estado,
    comentarioAdmin: gasto.comentarioAdmin || ''
  }));
};

// Headers para exportación de gastos
export const gastosCSVHeaders = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'usuario', label: 'Usuario' },
  { key: 'monto', label: 'Monto' },
  { key: 'medioPago', label: 'Medio de Pago' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'estado', label: 'Estado' },
  { key: 'comentarioAdmin', label: 'Comentario Admin' }
];
