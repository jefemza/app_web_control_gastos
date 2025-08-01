import { createGasto } from '../services/gastosService';

// Gastos de ejemplo para testing
const gastosEjemplo = [
  {
    fecha: '2025-01-28',
    monto: 15000,
    medioPago: 'efectivo',
    categoria: 'viáticos',
    descripcion: 'Almuerzo con cliente importante',
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
    descripcion: 'Taxi al aeropuerto para reunión',
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
    descripcion: 'Compra de material de oficina mensual',
    usuario: 'Noelia',
    usuarioId: 'noelia_uid',
    usuarioEmail: 'noelia@esm.com.ar',
    archivos: []
  },
  {
    fecha: '2025-01-25',
    monto: 5000,
    medioPago: 'efectivo',
    categoria: 'alimentación',
    descripcion: 'Café con equipo de desarrollo',
    usuario: 'Luis Tello',
    usuarioId: 'luis_uid',
    usuarioEmail: 'luis.tello@esm.com.ar',
    archivos: []
  },
  {
    fecha: '2025-01-24',
    monto: 35000,
    medioPago: 'tarjeta',
    categoria: 'mantenimiento',
    descripcion: 'Reparación de equipo de oficina',
    usuario: 'Juan Pablo Rúa',
    usuarioId: 'juan_uid',
    usuarioEmail: 'juan.pablo@esm.com.ar',
    archivos: []
  }
];

export const inicializarGastosPrueba = async () => {
  console.log('🚀 Iniciando creación de gastos de prueba...');
  
  try {
    for (const gasto of gastosEjemplo) {
      await createGasto(gasto);
      console.log(`✅ Gasto creado: ${gasto.descripcion}`);
    }
    
    console.log('🎉 ¡Todos los gastos de prueba creados exitosamente!');
    return true;
  } catch (error) {
    console.error('❌ Error al crear gastos de prueba:', error);
    return false;
  }
};

// Script para ejecutar desde la consola del navegador
window.inicializarGastosPrueba = inicializarGastosPrueba;