import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
    </>
  );
}

export default App;