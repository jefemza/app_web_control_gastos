// Ejemplo de Login actualizado para Firebase
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function LoginFirebase({ onLogin }) {
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
      // Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Obtener datos adicionales del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          ...userDoc.data()
        };
        
        // Guardar en localStorage si es necesario
        localStorage.setItem('user', JSON.stringify(userData));
        
        onLogin(userData);
      } else {
        setError('Usuario no encontrado en la base de datos');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      // Mensajes de error personalizados
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No existe una cuenta con este email');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta');
          break;
        case 'auth/invalid-email':
          setError('Email inválido');
          break;
        case 'auth/user-disabled':
          setError('Esta cuenta ha sido deshabilitada');
          break;
        default:
          setError('Error al iniciar sesión. Intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
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
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="input-esm"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="input-esm pr-10"
              disabled={isLoading}
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
            <p className="text-red-400 text-sm text-center animate-fade-in">
              {error}
            </p>
          )}

          <button 
            type="submit" 
            className="btn-esm"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Log In'}
          </button>
        </form>

        {/* Link de contraseña olvidada */}
        <div className="text-center mt-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <a 
            href="#" 
            className="text-gray-500 text-sm hover:text-esm-gold transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // Aquí podrías implementar recuperación de contraseña con Firebase
              alert('Función de recuperación de contraseña próximamente');
            }}
          >
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}