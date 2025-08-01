// src/scripts/initializeFirebase.js
import { auth, db } from '../config/firebase.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';

const usuarios = [
  {
    email: 'juan.pablo@esm.com.ar',
    password: 'admin123',
    nombre: 'Juan Pablo Rúa',
    rol: 'admin_principal'
  },
  {
    email: 'luis.tello@esm.com.ar',
    password: 'socio123',
    nombre: 'Luis Tello',
    rol: 'socio_operador'
  },
  {
    email: 'eugenio.cavallaro@esm.com.ar',
    password: 'socio123',
    nombre: 'Eugenio Cavallaro',
    rol: 'socio_operador'
  },
  {
    email: 'noelia@esm.com.ar',
    password: 'conta123',
    nombre: 'Noelia',
    rol: 'contadora'
  }
];

const categorias = [
  { nombre: 'libreria', descripcion: 'Artículos de librería y papelería' },
  { nombre: 'supermercado', descripcion: 'Compras en supermercado' },
  { nombre: 'premios', descripcion: 'Premios y reconocimientos' },
  { nombre: 'cartas documento', descripcion: 'Envío de cartas documento' },
  { nombre: 'gabelas', descripcion: 'Gastos de gabelas' },
  { nombre: 'internet', descripcion: 'Servicios de internet' },
  { nombre: 'boletas sindicales', descripcion: 'Boletas y gastos sindicales' },
  { nombre: 'nómina', descripcion: 'Gastos relacionados con nómina' },
  { nombre: 'viáticos', descripcion: 'Gastos de viaje y movilidad' },
  { nombre: 'recargas chips', descripcion: 'Recargas de chips telefónicos' },
  { nombre: 'proveedores', descripcion: 'Pagos a proveedores' },
  { nombre: 'edemsa 914', descripcion: 'Servicios de Edemsa 914' },
  { nombre: 'otros', descripcion: 'Otros gastos no categorizados' }
];

const mediosPago = [
  { nombre: 'efectivo', activo: true, orden: 1 },
  { nombre: 'transferencia', activo: true, orden: 2 },
  { nombre: 'billetera', activo: true, orden: 3 },
  { nombre: 'tarjeta', activo: true, orden: 4 }
];

export async function initializeFirebase() {
  console.log('🚀 Iniciando configuración de Firebase...');
  
  try {
    // Crear usuarios
    console.log('👥 Creando usuarios...');
    for (const usuario of usuarios) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          usuario.email, 
          usuario.password
        );
        
        // Guardar datos adicionales en Firestore
        await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('✅ Usuario creado:', usuario.email);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log('⚠️ Usuario ya existe:', usuario.email);
        } else {
          console.error('❌ Error creando usuario:', usuario.email, error);
        }
      }
    }
    
    // Crear categorías
    console.log('\n📁 Creando categorías...');
    for (const categoria of categorias) {
      try {
        const docRef = doc(collection(db, 'categorias'));
        await setDoc(docRef, {
          ...categoria,
          createdAt: new Date()
        });
        console.log('✅ Categoría creada:', categoria.nombre);
      } catch (error) {
        console.error('❌ Error creando categoría:', categoria.nombre, error);
      }
    }
    
    // Crear medios de pago
    console.log('\n💳 Creando medios de pago...');
    for (const medio of mediosPago) {
      try {
        const docRef = doc(collection(db, 'mediosPago'));
        await setDoc(docRef, {
          ...medio,
          createdAt: new Date()
        });
        console.log('✅ Medio de pago creado:', medio.nombre);
      } catch (error) {
        console.error('❌ Error creando medio de pago:', medio.nombre, error);
      }
    }
    
    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n📌 Próximos pasos:');
    console.log('1. Ve a Firebase Console > Authentication');
    console.log('2. Habilita "Correo electrónico/contraseña" en Sign-in method');
    console.log('3. Ve a Firestore Database y crea la base de datos');
    console.log('4. Ve a Storage y crea el bucket');
    console.log('5. Aplica las reglas de seguridad del archivo FIREBASE_SETUP_GUIDE.md');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Para ejecutar desde la consola del navegador:
// import('./src/scripts/initializeFirebase.js').then(m => m.initializeFirebase())