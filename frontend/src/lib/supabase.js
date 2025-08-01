import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funciones de autenticación
export const auth = {
  // Login
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Obtener usuario actual
  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Escuchar cambios de autenticación
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  }
}

// Funciones para gastos
export const gastos = {
  // Obtener todos los gastos
  getAll: async () => {
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .order('fecha', { ascending: false })
    return { data, error }
  },

  // Obtener gastos del usuario
  getByUser: async (userId) => {
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .eq('usuario_id', userId)
      .order('fecha', { ascending: false })
    return { data, error }
  },

  // Crear nuevo gasto
  create: async (gasto) => {
    const { data, error } = await supabase
      .from('gastos')
      .insert([gasto])
      .select()
    return { data, error }
  },

  // Actualizar gasto
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('gastos')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Subir archivo
  uploadFile: async (file, gastoId) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${gastoId}.${fileExt}`
    const filePath = `comprobantes/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('gastos-archivos')
      .upload(filePath, file)

    if (uploadError) return { error: uploadError }

    const { data: { publicUrl } } = supabase.storage
      .from('gastos-archivos')
      .getPublicUrl(filePath)

    return { publicUrl, error: null }
  }
}

// Funciones para usuarios (si no usas Supabase Auth)
export const usuarios = {
  // Obtener todos los usuarios
  getAll: async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('name')
    return { data, error }
  },

  // Crear usuario
  create: async (usuario) => {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([usuario])
      .select()
    return { data, error }
  },

  // Actualizar usuario
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Eliminar usuario
  delete: async (id) => {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)
    return { error }
  }
}