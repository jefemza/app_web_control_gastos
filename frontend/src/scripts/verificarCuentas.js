// Script para verificar la consistencia de cuentas entre fondos y gastos
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  getDocs,
  orderBy 
} from 'firebase/firestore';

export const verificarConsistenciaCuentas = async () => {
  try {
    console.log('🔍 Iniciando verificación de consistencia de cuentas...');
    
    // Obtener todos los fondos
    const fondosQuery = query(collection(db, 'fondos'), orderBy('createdAt', 'desc'));
    const fondosSnapshot = await getDocs(fondosQuery);
    const fondos = [];
    fondosSnapshot.forEach(doc => {
      fondos.push({ id: doc.id, ...doc.data() });
    });
    
    // Obtener todos los gastos
    const gastosQuery = query(collection(db, 'gastos'), orderBy('createdAt', 'desc'));
    const gastosSnapshot = await getDocs(gastosQuery);
    const gastos = [];
    gastosSnapshot.forEach(doc => {
      gastos.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('📊 Datos obtenidos:');
    console.log(`- Fondos: ${fondos.length} registros`);
    console.log(`- Gastos: ${gastos.length} registros`);
    
    // Análisis de fondos
    console.log('\n💰 ANÁLISIS DE FONDOS:');
    let totalIngresos = 0;
    let fondoActivo = null;
    
    fondos.forEach((fondo, index) => {
      const monto = parseFloat(fondo.monto || fondo.montoInicial || 0);
      const saldo = parseFloat(fondo.saldoActual || 0);
      const fecha = fondo.createdAt?.toDate?.() || new Date(fondo.createdAt) || new Date();
      
      console.log(`${index + 1}. Fondo ID: ${fondo.id}`);
      console.log(`   - Monto: $${monto.toLocaleString('es-AR')}`);
      console.log(`   - Saldo Actual: $${saldo.toLocaleString('es-AR')}`);
      console.log(`   - Activo: ${fondo.activo ? '✅ Sí' : '❌ No'}`);
      console.log(`   - Fecha: ${fecha.toLocaleString('es-AR')}`);
      console.log(`   - Usuario: ${fondo.usuarioNombre || 'N/A'}`);
      console.log(`   - Descripción: ${fondo.descripcion || 'N/A'}`);
      console.log('');
      
      totalIngresos += monto;
      if (fondo.activo) {
        fondoActivo = fondo;
      }
    });
    
    // Análisis de gastos
    console.log('💸 ANÁLISIS DE GASTOS:');
    let totalGastos = 0;
    let gastosAprobados = 0;
    let gastosPendientes = 0;
    let gastosRechazados = 0;
    
    gastos.forEach((gasto, index) => {
      const monto = parseFloat(gasto.monto || 0);
      const fecha = gasto.createdAt?.toDate?.() || new Date(gasto.createdAt) || new Date();
      
      console.log(`${index + 1}. Gasto ID: ${gasto.id}`);
      console.log(`   - Monto: $${monto.toLocaleString('es-AR')}`);
      console.log(`   - Estado: ${gasto.estado?.toUpperCase() || 'N/A'}`);
      console.log(`   - Categoría: ${gasto.categoria || 'N/A'}`);
      console.log(`   - Descripción: ${gasto.descripcion || 'N/A'}`);
      console.log(`   - Fecha: ${fecha.toLocaleString('es-AR')}`);
      console.log(`   - Usuario: ${gasto.usuarioNombre || 'N/A'}`);
      console.log('');
      
      totalGastos += monto;
      
      switch (gasto.estado) {
        case 'aprobado':
          gastosAprobados += monto;
          break;
        case 'pendiente':
          gastosPendientes += monto;
          break;
        case 'rechazado':
          gastosRechazados += monto;
          break;
      }
    });
    
    // Cálculo de balance
    console.log('📊 RESUMEN FINANCIERO:');
    console.log(`💰 Total Ingresos: $${totalIngresos.toLocaleString('es-AR')}`);
    console.log(`💸 Total Gastos: $${totalGastos.toLocaleString('es-AR')}`);
    console.log(`   - Aprobados: $${gastosAprobados.toLocaleString('es-AR')}`);
    console.log(`   - Pendientes: $${gastosPendientes.toLocaleString('es-AR')}`);
    console.log(`   - Rechazados: $${gastosRechazados.toLocaleString('es-AR')}`);
    
    const balanceCalculado = totalIngresos - gastosAprobados;
    console.log(`\n💡 Balance Calculado (Ingresos - Gastos Aprobados): $${balanceCalculado.toLocaleString('es-AR')}`);
    
    // Verificar consistencia con fondo activo
    if (fondoActivo) {
      const saldoFondoActivo = parseFloat(fondoActivo.saldoActual || 0);
      console.log(`💳 Saldo del Fondo Activo: $${saldoFondoActivo.toLocaleString('es-AR')}`);
      
      if (Math.abs(balanceCalculado - saldoFondoActivo) > 0.01) {
        console.log('⚠️  INCONSISTENCIA DETECTADA!');
        console.log(`   - Balance calculado: $${balanceCalculado.toLocaleString('es-AR')}`);
        console.log(`   - Saldo en fondo activo: $${saldoFondoActivo.toLocaleString('es-AR')}`);
        console.log(`   - Diferencia: $${(balanceCalculado - saldoFondoActivo).toLocaleString('es-AR')}`);
      } else {
        console.log('✅ CUENTAS CONSISTENTES');
      }
    } else {
      console.log('⚠️  No hay fondo activo configurado');
    }
    
    // Verificar gastos recientes de Noelia
    console.log('\n👤 GASTOS DE NOELIA (Últimos 7 días):');
    const sieteDiasAtras = new Date();
    sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);
    
    const gastosNoelia = gastos.filter(gasto => {
      const fechaGasto = gasto.createdAt?.toDate?.() || new Date(gasto.createdAt);
      return gasto.usuarioEmail === 'noeliaalbornoz1@gmail.com' && fechaGasto >= sieteDiasAtras;
    });
    
    if (gastosNoelia.length > 0) {
      gastosNoelia.forEach((gasto, index) => {
        const monto = parseFloat(gasto.monto || 0);
        const fecha = gasto.createdAt?.toDate?.() || new Date(gasto.createdAt);
        console.log(`${index + 1}. $${monto.toLocaleString('es-AR')} - ${gasto.descripcion} (${fecha.toLocaleDateString('es-AR')})`);
      });
    } else {
      console.log('No se encontraron gastos recientes de Noelia');
    }
    
    // Verificar fondos recientes de Noelia
    console.log('\n💰 FONDOS DE NOELIA (Últimos 7 días):');
    const fondosNoelia = fondos.filter(fondo => {
      const fechaFondo = fondo.createdAt?.toDate?.() || new Date(fondo.createdAt);
      return fondo.usuarioEmail === 'noeliaalbornoz1@gmail.com' && fechaFondo >= sieteDiasAtras;
    });
    
    if (fondosNoelia.length > 0) {
      fondosNoelia.forEach((fondo, index) => {
        const monto = parseFloat(fondo.monto || fondo.montoInicial || 0);
        const fecha = fondo.createdAt?.toDate?.() || new Date(fondo.createdAt);
        console.log(`${index + 1}. $${monto.toLocaleString('es-AR')} - ${fondo.descripcion} (${fecha.toLocaleDateString('es-AR')})`);
      });
    } else {
      console.log('No se encontraron fondos recientes de Noelia');
    }
    
    return {
      fondos,
      gastos,
      totalIngresos,
      totalGastos,
      gastosAprobados,
      gastosPendientes,
      gastosRechazados,
      balanceCalculado,
      fondoActivo,
      gastosNoelia,
      fondosNoelia
    };
    
  } catch (error) {
    console.error('❌ Error verificando consistencia:', error);
    throw error;
  }
};

// Función para ejecutar desde la consola del navegador
window.verificarCuentas = verificarConsistenciaCuentas;
