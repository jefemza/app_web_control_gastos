import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import { useToast } from '../components/ui/Toast';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    porRol: {}
  });

  const { success, error: showError } = useToast();

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersData, statsData] = await Promise.all([
        userService.getAllUsers(),
        userService.getUserStats()
      ]);
      
      setUsers(usersData);
      setStats(statsData);
      
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setError(error.message);
      showError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Crear usuario
  const createUser = useCallback(async (userData) => {
    try {
      setError(null);
      const newUser = await userService.createUser(userData);
      
      // Actualizar la lista local
      setUsers(prev => [newUser, ...prev]);
      
      // Actualizar estadísticas
      await loadStats();
      
      success('Usuario creado exitosamente');
      return newUser;
      
    } catch (error) {
      console.error('Error creando usuario:', error);
      setError(error.message);
      showError(error.message);
      throw error;
    }
  }, [success, showError]);

  // Actualizar usuario
  const updateUser = useCallback(async (userId, updateData) => {
    try {
      setError(null);
      const updatedUser = await userService.updateUser(userId, updateData);
      
      // Actualizar la lista local
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      
      success('Usuario actualizado exitosamente');
      return updatedUser;
      
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      setError(error.message);
      showError(error.message);
      throw error;
    }
  }, [success, showError]);

  // Desactivar usuario
  const deactivateUser = useCallback(async (userId) => {
    try {
      setError(null);
      await userService.deactivateUser(userId);
      
      // Actualizar la lista local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, estado: 'inactivo' } : user
      ));
      
      // Actualizar estadísticas
      await loadStats();
      
      success('Usuario desactivado exitosamente');
      
    } catch (error) {
      console.error('Error desactivando usuario:', error);
      setError(error.message);
      showError(error.message);
      throw error;
    }
  }, [success, showError]);

  // Eliminar usuario
  const deleteUser = useCallback(async (userId) => {
    try {
      setError(null);
      await userService.deleteUser(userId);
      
      // Remover de la lista local
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // Actualizar estadísticas
      await loadStats();
      
      success('Usuario eliminado exitosamente');
      
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      setError(error.message);
      showError(error.message);
      throw error;
    }
  }, [success, showError]);

  // Cargar solo estadísticas
  const loadStats = useCallback(async () => {
    try {
      const statsData = await userService.getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, []);

  // Buscar usuarios
  const searchUsers = useCallback((searchTerm) => {
    if (!searchTerm) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(user =>
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
  }, [users]);

  // Filtrar usuarios por rol
  const filterByRole = useCallback((role) => {
    if (!role) return users;
    return users.filter(user => user.role === role);
  }, [users]);

  // Filtrar usuarios por estado
  const filterByStatus = useCallback((status) => {
    if (!status) return users;
    return users.filter(user => user.estado === status);
  }, [users]);

  // Verificar si un usuario tiene permisos
  const hasPermission = useCallback((user, permission) => {
    return userService.hasPermission(user, permission);
  }, []);

  // Obtener usuario por ID
  const getUserById = useCallback((userId) => {
    return users.find(user => user.id === userId);
  }, [users]);

  // Validar email único
  const isEmailUnique = useCallback((email, excludeUserId = null) => {
    return !users.some(user => 
      user.email === email && user.id !== excludeUserId
    );
  }, [users]);

  // Suscribirse a cambios en tiempo real
  const subscribeToUsers = useCallback(() => {
    return userService.subscribeToUsers((usersData) => {
      setUsers(usersData);
      // También actualizar estadísticas cuando cambien los datos
      loadStats();
    });
  }, [loadStats]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Estadísticas derivadas
  const derivedStats = {
    ...stats,
    recentUsers: users.filter(user => {
      if (!user.fechaCreacion) return false;
      const createdDate = user.fechaCreacion.toDate ? user.fechaCreacion.toDate() : new Date(user.fechaCreacion);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return createdDate > oneWeekAgo;
    }).length,
    
    activeAdmins: users.filter(u => u.role === 'admin_principal' && u.estado === 'activo').length,
    activeContadoras: users.filter(u => u.role === 'contadora' && u.estado === 'activo').length,
    activeSocios: users.filter(u => u.role === 'socio_operador' && u.estado === 'activo').length
  };

  return {
    // Datos
    users,
    stats: derivedStats,
    loading,
    error,
    
    // Operaciones CRUD
    loadUsers,
    createUser,
    updateUser,
    deactivateUser,
    deleteUser,
    
    // Utilidades
    searchUsers,
    filterByRole,
    filterByStatus,
    hasPermission,
    getUserById,
    isEmailUnique,
    subscribeToUsers,
    
    // Funciones de estado
    clearError: () => setError(null),
    refreshStats: loadStats
  };
};

export default useUsers;