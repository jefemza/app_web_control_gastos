import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { testAuthFlow } from '../utils/testAuthFlow';

export default function AuthDebugger() {
  const [authState, setAuthState] = useState({
    firebaseUser: null,
    localStorageUser: null,
    isAuthenticated: false
  });

  useEffect(() => {
    // Verificar estado de Firebase Auth
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const localUser = localStorage.getItem('user');
      
      setAuthState({
        firebaseUser: user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        } : null,
        localStorageUser: localUser ? JSON.parse(localUser) : null,
        isAuthenticated: !!user && !!localUser
      });
    });

    // Ejecutar test inicial
    testAuthFlow();

    return () => unsubscribe();
  }, []);

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin_principal': return 'bg-red-500';
      case 'contadora': return 'bg-blue-500';
      case 'socio_operador': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-xl max-w-sm z-50 text-xs">
      <h3 className="font-bold mb-2 text-yellow-400">🔍 Auth Debugger</h3>
      
      <div className="space-y-2">
        <div>
          <span className="font-semibold">Firebase Auth:</span>
          {authState.firebaseUser ? (
            <div className="ml-2 text-green-400">
              ✅ {authState.firebaseUser.email}
            </div>
          ) : (
            <div className="ml-2 text-red-400">❌ No autenticado</div>
          )}
        </div>

        <div>
          <span className="font-semibold">LocalStorage:</span>
          {authState.localStorageUser ? (
            <div className="ml-2">
              <div className="text-green-400">✅ {authState.localStorageUser.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <span>Rol:</span>
                <span className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(authState.localStorageUser.role)}`}>
                  {authState.localStorageUser.role}
                </span>
              </div>
            </div>
          ) : (
            <div className="ml-2 text-red-400">❌ No hay sesión</div>
          )}
        </div>

        <div className="pt-2 border-t border-gray-700">
          <span className="font-semibold">Estado:</span>
          <div className={`ml-2 ${authState.isAuthenticated ? 'text-green-400' : 'text-yellow-400'}`}>
            {authState.isAuthenticated ? '✅ Autenticado correctamente' : '⚠️ Estado inconsistente'}
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          console.clear();
          testAuthFlow();
        }}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
      >
        Ejecutar Test
      </button>
    </div>
  );
}