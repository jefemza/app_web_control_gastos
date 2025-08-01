import { useState } from 'react';
import { Eye, EyeOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import userService from '../services/userService';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validaciones básicas
      if (!email || !password) {
        throw new Error('Por favor complete todos los campos');
      }

      if (!email.includes('@')) {
        throw new Error('Por favor ingrese un email válido');
      }

      console.log('Intentando autenticar usuario:', email);

      // Autenticar con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Autenticación exitosa:', userCredential.user.uid);
      
      // Obtener datos completos del usuario desde Firestore
      const userData = await userService.getUserById(userCredential.user.uid);
      
      if (userData) {
        console.log('Datos de usuario obtenidos:', userData);
        
        // Verificar que el usuario esté activo
        if (userData.estado === 'inactivo') {
          throw new Error('Su cuenta ha sido desactivada. Contacte al administrador.');
        }

        // Preparar datos del usuario para la sesión
        const sessionUser = {
          id: userData.id,
          uid: userData.uid || userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          estado: userData.estado,
          fechaUltimoAcceso: new Date()
        };

        // Actualizar último acceso
        try {
          await userService.updateUser(userData.id, {
            fechaUltimoAcceso: new Date()
          });
        } catch (updateError) {
          console.warn('No se pudo actualizar fecha de último acceso:', updateError);
        }

        console.log('Login exitoso para:', sessionUser);
        onLogin(sessionUser);

      } else {
        // Intentar buscar por email como fallback
        console.log('Usuario no encontrado por UID, buscando por email...');
        const userByEmail = await userService.getUserByEmail(email);
        
        if (userByEmail) {
          console.log('Usuario encontrado por email:', userByEmail);
          
          // Verificar que el usuario esté activo
          if (userByEmail.estado === 'inactivo') {
            throw new Error('Su cuenta ha sido desactivada. Contacte al administrador.');
          }

          const sessionUser = {
            id: userByEmail.id,
            uid: userByEmail.uid || userByEmail.id,
            email: userByEmail.email,
            name: userByEmail.name,
            role: userByEmail.role,
            estado: userByEmail.estado,
            fechaUltimoAcceso: new Date()
          };

          onLogin(sessionUser);
        } else {
          throw new Error('Usuario no encontrado en la base de datos. Contacte al administrador.');
        }
      }

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      // Mensajes de error personalizados y amigables
      let errorMessage = 'Error al iniciar sesión. Intente nuevamente.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del email no es válido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Email o contraseña incorrectos';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intente más tarde.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifique su internet.';
          break;
        default:
          // Si es un error personalizado (con message), usarlo
          if (error.message && !error.code) {
            errorMessage = error.message;
          }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <div className="form-container animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-12 animate-slide-up">
          <img 
            src="/logo_ESM Argentina.png" 
            alt="ESM Argentina" 
            className="w-32 h-32 mx-auto mb-8 logo-hover logo-glow"
          />
          <h1 className="text-3xl font-light tracking-wider text-gray-200 uppercase">
            Control de Caja Chica
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Sistema de Gestión ESM Argentina
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={handleInputChange(setEmail)}
              placeholder="Email corporativo"
              required
              className="input-esm"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handleInputChange(setPassword)}
              placeholder="Contraseña"
              required
              className="input-esm pr-10"
              disabled={isLoading}
              autoComplete="current-password"
              minLength="6"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-esm flex items-center justify-center space-x-2"
            disabled={isLoading}
          >
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>{isLoading ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
          </button>
        </form>

        {/* Link de contraseña olvidada */}
        <div className="text-center mt-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <button 
            className="text-gray-500 text-sm hover:text-esm-gold transition-colors"
            onClick={() => {
              alert('Para restablecer su contraseña, contacte al administrador del sistema:\n\nadmin@esm.com.ar');
            }}
            disabled={isLoading}
          >
            ¿Olvidó su contraseña?
          </button>
        </div>

        {/* Información del sistema */}
        <div className="mt-8 p-4 bg-esm-gray/30 rounded-lg text-xs text-gray-400 animate-fade-in" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 font-semibold">Sistema Conectado</span>
          </div>
          
          <div className="space-y-1">
            <p className="font-semibold text-esm-gold">Credenciales de Prueba:</p>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <p><strong>Admin:</strong> juan.pablo@esm.com.ar / admin123</p>
              <p><strong>Contadora:</strong> noelia@esm.com.ar / conta123</p>
              <p><strong>Socio:</strong> luis.tello@esm.com.ar / socio123</p>
              <p><strong>Socio:</strong> eugenio.cavallaro@esm.com.ar / socio123</p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-600">
            <p className="text-xs text-gray-500">
              🔐 Autenticación segura con Firebase
            </p>
          </div>
        </div>

        {/* Información de versión */}
        <div className="text-center mt-4 text-xs text-gray-600">
          <p>ESM Control de Gastos v2.1.0</p>
          <p>© 2025 ESM Argentina</p>
        </div>
      </div>
    </div>
  );
}