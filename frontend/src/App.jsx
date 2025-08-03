import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegistroGastos from './pages/RegistroGastos';
import PanelControl from './pages/PanelControl';
import VistaGastos from './pages/VistaGastos';
import GestionUsuarios from './pages/GestionUsuarios';
import GestionFondos from './pages/GestionFondos';
import Notificaciones from './pages/Notificaciones';
import ClaudePresence from './components/ClaudePresence';
import ToastContainer from './components/notifications/ToastContainer';
import AuthDebugger from './components/AuthDebugger';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Usuario recuperado de localStorage:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error al parsear usuario de localStorage:', error);
        localStorage.removeItem('user');
      }
    }

    // Escuchar cambios en el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser && savedUser) {
        // Si Firebase no tiene sesión pero localStorage sí, limpiar localStorage
        console.log('Sesión de Firebase expirada, limpiando localStorage');
        localStorage.removeItem('user');
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    console.log('handleLogin llamado con:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      // Cerrar sesión en Firebase
      await signOut(auth);
      console.log('Sesión cerrada en Firebase');
    } catch (error) {
      console.error('Error al cerrar sesión en Firebase:', error);
    }
    
    // Limpiar estado local
    setUser(null);
    localStorage.removeItem('user');
    console.log('Sesión local limpiada');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-esm-gold text-xl animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              !user ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/registro-gastos" 
            element={
              user ? (
                <RegistroGastos user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/panel-control" 
            element={
              user && (user.role === 'admin_principal' || user.role === 'socio_operador') ? (
                <PanelControl user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          
          <Route 
            path="/vista-gastos" 
            element={
              user ? (
                <VistaGastos user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/usuarios" 
            element={
              user && (user.role === 'admin_principal' || user.role === 'socio_operador') ? (
                <GestionUsuarios user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          
          <Route 
            path="/fondos" 
            element={
              user && (user.role === 'admin_principal' || user.role === 'contadora') ? (
                <GestionFondos user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          
          <Route 
            path="/notificaciones" 
            element={
              user ? (
                <Notificaciones user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
          
      {/* Claude AI Presence Indicator */}
      <ClaudePresence />
      
      {/* Toast Notifications */}
      <ToastContainer />
      
      {/* Auth Debugger (solo en desarrollo) */}
      <AuthDebugger />
    </>
  );
}

export default App;