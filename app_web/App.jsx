import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Calendar, DollarSign, FileText, Upload, Camera, LogOut, User, CheckCircle, XCircle, Edit, Download, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import esmLogo from './assets/esm_1.jpg'
import './App.css'

// Simulación de base de datos en memoria
const initialUsers = [
  { id: 1, name: 'Juan Pablo Rúa', email: 'juan.pablo@esm.com.ar', role: 'admin_principal' },
  { id: 2, name: 'Luis Tello', email: 'luis.tello@esm.com.ar', role: 'socio_operador' },
  { id: 3, name: 'Eugenio Cavallaro', email: 'eugenio.cavallaro@esm.com.ar', role: 'socio_operador' },
  { id: 4, name: 'Noelia', email: 'noelia@esm.com.ar', role: 'contadora' }
]

const initialGastos = [
  {
    id: 1,
    fecha: '2025-01-20',
    usuario_id: 2,
    monto: 15000,
    medio_pago: 'efectivo',
    categoria: 'viáticos',
    descripcion: 'Almuerzo con cliente',
    archivo_url: null,
    estado: 'pendiente',
    comentario_admin: '',
    created_at: '2025-01-20T10:30:00Z'
  },
  {
    id: 2,
    fecha: '2025-01-19',
    usuario_id: 3,
    monto: 8500,
    medio_pago: 'billetera',
    categoria: 'transporte',
    descripcion: 'Taxi al aeropuerto',
    archivo_url: null,
    estado: 'aprobado',
    comentario_admin: 'Aprobado - Viaje justificado',
    created_at: '2025-01-19T14:15:00Z'
  },
  {
    id: 3,
    fecha: '2025-01-18',
    usuario_id: 4,
    monto: 25000,
    medio_pago: 'transferencia',
    categoria: 'útiles',
    descripcion: 'Compra de material de oficina',
    archivo_url: null,
    estado: 'aprobado',
    comentario_admin: '',
    created_at: '2025-01-18T09:45:00Z'
  }
]

const categorias = ['libreria', 'supermercado', 'premios', 'cartas documento', 'gabelas', 'internet', 'boletas sindicales', 'nómina', 'viáticos', 'recargas chips', 'proveedores', 'edemsa 914', 'otros']
const mediosPago = ['efectivo', 'transferencia', 'billetera', 'tarjeta']

// Componente de Login
function LoginForm({ onLogin, users }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const user = users.find(u => u.email === email && u.password === 'password123')
    if (user) {
      onLogin(user)
    } else {
      alert('Credenciales incorrectas')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card glass-effect">
        <div className="logo-container">
          <img src={esmLogo} alt="ESM Argentina" className="hover-glow" />
          <h1 className="heading-primary text-3xl mt-4 mb-2">Control de Caja Chica</h1>
          <p className="text-muted">ESM Argentina</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-body text-sm font-medium mb-2 block">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@esm.com.ar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-crystal"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-body text-sm font-medium mb-2 block">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-crystal"
            />
          </div>
          <Button type="submit" className="btn-primary-crystal mt-6">
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  )
}
function Header({ user, onLogout }) {
  return (
    <header className="header-crystal">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src={esmLogo} alt="ESM Argentina" className="w-12 h-12 rounded-full border-2 border-accent-gold" />
          <div>
            <h1 className="heading-secondary text-xl">Control de Caja Chica</h1>
            <p className="text-muted text-sm">ESM Argentina</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-accent-gold" />
            <span className="text-body font-medium">{user.name}</span>
            <Badge className="badge-crystal bg-accent-gold text-bg-primary">
              {user.role === 'admin' ? 'Administrador' : 'Usuario'}
            </Badge>
          </div>
          <Button onClick={onLogout} className="btn-secondary-crystal">
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>
    </header>
  )
}

// Componente de Registro de Gastos
function RegistroGastos({ user, gastos, setGastos }) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    monto: '',
    medio_pago: '',
    categoria: '',
    descripcion: '',
    archivo: null
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }

    const nuevoGasto = {
      id: gastos.length + 1,
      fecha: formData.fecha,
      usuario_id: user.id,
      monto: parseFloat(formData.monto),
      medio_pago: formData.medio_pago,
      categoria: formData.categoria,
      descripcion: formData.descripcion,
      archivo_url: formData.archivo ? URL.createObjectURL(formData.archivo) : null,
      estado: 'pendiente',
      comentario_admin: '',
      created_at: new Date().toISOString()
    }

    setGastos([...gastos, nuevoGasto])
    
    // Reset form
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      monto: '',
      medio_pago: '',
      categoria: '',
      descripcion: '',
      archivo: null
    })

    alert('Gasto registrado exitosamente')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFormData({ ...formData, archivo: file })
  }

  const montoAlert = formData.monto && parseFloat(formData.monto) > 10000

  return (
    <div className="app-container p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="card-crystal">
          <CardHeader>
            <CardTitle className="heading-secondary flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-accent-gold" />
              Registrar Nuevo Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fecha" className="text-body font-medium mb-2 block">Fecha del Gasto</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    className="input-crystal"
                  />
                </div>
                <div>
                  <Label htmlFor="monto" className="text-body font-medium mb-2 block">Monto ($)</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    placeholder="0.00"
                    required
                    className="input-crystal"
                  />
                  {montoAlert && (
                    <p className="text-warning text-sm mt-1 flex items-center">
                      ⚠️ Monto elevado - Se recomienda adjuntar comprobante
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="medio_pago" className="text-body font-medium mb-2 block">Medio de Pago</Label>
                  <select 
                    value={formData.medio_pago} 
                    onChange={(e) => setFormData({ ...formData, medio_pago: e.target.value })}
                    className="select-crystal"
                    required
                  >
                    <option value="">Seleccionar medio de pago</option>
                    {mediosPago.map(medio => (
                      <option key={medio} value={medio}>
                        {medio.charAt(0).toUpperCase() + medio.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="categoria" className="text-body font-medium mb-2 block">Categoría</Label>
                  <select 
                    value={formData.categoria} 
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="select-crystal"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion" className="text-body font-medium mb-2 block">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción del gasto..."
                  rows={3}
                  className="input-crystal"
                />
              </div>

              <div>
                <Label htmlFor="archivo" className="text-body font-medium mb-2 block">Comprobante (Opcional)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Input
                    id="archivo"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="input-crystal flex-1"
                  />
                  <Button type="button" className="btn-secondary-crystal">
                    <Camera className="w-4 h-4 mr-2" />
                    Cámara
                  </Button>
                </div>
              </div>

              <Button type="submit" className="btn-primary-crystal w-full">
                <FileText className="w-4 h-4 mr-2" />
                Guardar Gasto
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente de Panel de Control (Juan Pablo Rúa)
function PanelControl({ user, gastos, setGastos, usuarios }) {
  const [filtros, setFiltros] = useState({
    usuario: '',
    categoria: '',
    estado: '',
    fechaInicio: '',
    fechaFin: ''
  })
  const [gastoEditando, setGastoEditando] = useState(null)

  const gastosFiltrados = gastos.filter(gasto => {
    const usuario = usuarios.find(u => u.id === gasto.usuario_id)
    return (
      (!filtros.usuario || gasto.usuario_id.toString() === filtros.usuario) &&
      (!filtros.categoria || gastos.find(g => g.id === gasto.id)?.categoria === filtros.categoria) &&
      (!filtros.estado || gasto.estado === filtros.estado) &&
      (!filtros.fechaInicio || gasto.fecha >= filtros.fechaInicio) &&
      (!filtros.fechaFin || gasto.fecha <= filtros.fechaFin)
    )
  })

  const actualizarEstado = (gastoId, nuevoEstado, comentario = '') => {
    setGastos(gastos.map(gasto => 
      gasto.id === gastoId 
        ? { ...gasto, estado: nuevoEstado, comentario_admin: comentario }
        : gasto
    ))
  }

  const exportarCSV = () => {
    const headers = ['Fecha', 'Usuario', 'Monto', 'Medio de Pago', 'Categoría', 'Descripción', 'Estado', 'Comentario Admin']
    const rows = gastosFiltrados.map(gasto => {
      const usuario = usuarios.find(u => u.id === gasto.usuario_id)
      return [
        gasto.fecha,
        usuario?.name || '',
        gasto.monto,
        gasto.medio_pago,
        gasto.categoria,
        gasto.descripcion,
        gasto.estado,
        gasto.comentario_admin
      ]
    })

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gastos_caja_chica_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Datos para gráficos
  const gastosPorUsuario = usuarios.map(usuario => ({
    name: usuario.name.split(' ')[0],
    total: gastos
      .filter(g => g.usuario_id === usuario.id && g.estado === 'aprobado')
      .reduce((sum, g) => sum + g.monto, 0)
  }))

  const dataPorCategoria = categorias.map(categoria => ({
    name: categoria,
    value: gastos
      .filter(g => g.categoria === categoria && g.estado === 'aprobado')
      .reduce((sum, g) => sum + g.monto, 0)
  }))

  // Colores para gráficos - Tema Cristal Noir
  const COLORS = ['#FFD700', '#007FFF', '#00A86B', '#9966CC', '#FFA500', '#C0C0C0']

  return (
    <div className="space-y-6">
      {/* Resumen y Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gastosPorUsuario}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Total']} />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Total']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select 
              value={filtros.usuario} 
              onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Todos los usuarios</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id.toString()}>
                  {usuario.name}
                </option>
              ))}
            </select>

            <select 
              value={filtros.categoria} 
              onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select 
              value={filtros.estado} 
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>

            <Input
              type="date"
              placeholder="Fecha inicio"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
            />

            <Input
              type="date"
              placeholder="Fecha fin"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={() => setFiltros({ usuario: '', categoria: '', estado: '', fechaInicio: '', fechaFin: '' })}>
              Limpiar Filtros
            </Button>
            <Button onClick={exportarCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Gastos */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos Registrados ({gastosFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Medio</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gastosFiltrados.map(gasto => {
                  const usuario = usuarios.find(u => u.id === gasto.usuario_id)
                  return (
                    <TableRow key={gasto.id}>
                      <TableCell>{gasto.fecha}</TableCell>
                      <TableCell>{usuario?.name || 'Usuario desconocido'}</TableCell>
                      <TableCell>${gasto.monto.toLocaleString()}</TableCell>
                      <TableCell>{gasto.medio_pago}</TableCell>
                      <TableCell>{gasto.categoria}</TableCell>
                      <TableCell className="max-w-xs truncate">{gasto.descripcion}</TableCell>
                      <TableCell>
                        <Badge variant={
                          gasto.estado === 'aprobado' ? 'default' :
                          gasto.estado === 'rechazado' ? 'destructive' : 'secondary'
                        }>
                          {gasto.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {gasto.estado === 'pendiente' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => actualizarEstado(gasto.id, 'aprobado')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const comentario = prompt('Comentario (opcional):')
                                  actualizarEstado(gasto.id, 'rechazado', comentario || '')
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setGastoEditando(gasto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de Vista de Gastos (para socios y contadora)
function VistaGastos({ user, gastos, usuarios }) {
  const gastosUsuario = user.role === 'contadora' 
    ? gastos 
    : gastos.filter(gasto => gasto.usuario_id === user.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {user.role === 'contadora' ? 'Todos los Gastos' : 'Mis Gastos'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                {user.role === 'contadora' && <TableHead>Usuario</TableHead>}
                <TableHead>Monto</TableHead>
                <TableHead>Medio</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Comentario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gastosUsuario.map(gasto => {
                const usuario = usuarios.find(u => u.id === gasto.usuario_id)
                return (
                  <TableRow key={gasto.id}>
                    <TableCell>{gasto.fecha}</TableCell>
                    {user.role === 'contadora' && (
                      <TableCell>{usuario?.name || 'Usuario desconocido'}</TableCell>
                    )}
                    <TableCell>${gasto.monto.toLocaleString()}</TableCell>
                    <TableCell>{gasto.medio_pago}</TableCell>
                    <TableCell>{gasto.categoria}</TableCell>
                    <TableCell className="max-w-xs truncate">{gasto.descripcion}</TableCell>
                    <TableCell>
                      <Badge variant={
                        gasto.estado === 'aprobado' ? 'default' :
                        gasto.estado === 'rechazado' ? 'destructive' : 'secondary'
                      }>
                        {gasto.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{gasto.comentario_admin}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente principal de la aplicación
function App() {
  const [user, setUser] = useState(null)
  const [gastos, setGastos] = useState(initialGastos)
  const [activeTab, setActiveTab] = useState('registro')

  const handleLogin = (userData) => {
    setUser(userData)
    if (userData.role === 'admin_principal') {
      setActiveTab('panel')
    }
  }

  const handleLogout = () => {
    setUser(null)
    setActiveTab('registro')
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} users={initialUsers} />
  }


    return (
    <div className="min-h-screen bg-background dark">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>

    </div>
  )
}

export default App

