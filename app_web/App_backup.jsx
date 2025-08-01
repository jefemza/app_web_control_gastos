import { useState, useEffect } from 'react'
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
  }
]

const mediosPago = ['efectivo', 'transferencia', 'billetera', 'tarjeta']
const categorias = ['libreria', 'supermercado', 'premios', 'cartas documento', 'gabelas', 'internet', 'boletas sindicales', 'nómina', 'viáticos', 'recargas chips', 'proveedores', 'edemsa 914', 'otros']

function App() {
  const [user, setUser] = useState(null)
  const [gastos, setGastos] = useState(initialGastos)
  const [activeTab, setActiveTab] = useState('registro')

  // Auto-login para pruebas
  useEffect(() => {
    setUser(initialUsers[0]) // Juan Pablo Rúa como admin
  }, [])

  const handleLogout = () => {
    setUser(null)
    setActiveTab('registro')
  }

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card glass-effect">
          <div className="logo-container">
            <img src={esmLogo} alt="ESM Argentina" className="hover-glow" />
            <h1 className="heading-primary text-3xl mt-4 mb-2">Control de Caja Chica</h1>
            <p className="text-muted">ESM Argentina</p>
          </div>
          <Button onClick={() => setUser(initialUsers[0])} className="btn-primary-crystal w-full">
            Iniciar Sesión (Demo)
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container min-h-screen">
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
                {user.role === 'admin_principal' ? 'Administrador' : 'Usuario'}
              </Badge>
            </div>
            <Button onClick={handleLogout} className="btn-secondary-crystal">
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <div className="nav-tabs-crystal">
          <button 
            className={`nav-tab-crystal ${activeTab === 'registro' ? 'active' : ''}`}
            onClick={() => setActiveTab('registro')}
          >
            Registrar Gasto
          </button>
          <button 
            className={`nav-tab-crystal ${activeTab === 'gastos' ? 'active' : ''}`}
            onClick={() => setActiveTab('gastos')}
          >
            Mis Gastos
          </button>
          <button 
            className={`nav-tab-crystal ${activeTab === 'panel' ? 'active' : ''}`}
            onClick={() => setActiveTab('panel')}
          >
            Panel de Control
          </button>
        </div>

        {activeTab === 'registro' && (
          <div className="max-w-4xl mx-auto">
            <Card className="card-crystal">
              <CardHeader>
                <CardTitle className="heading-secondary flex items-center">
                  <DollarSign className="w-6 h-6 mr-2 text-accent-gold" />
                  Registrar Nuevo Gasto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-body font-medium mb-2 block">Fecha del Gasto</Label>
                      <Input type="date" className="input-crystal" />
                    </div>
                    <div>
                      <Label className="text-body font-medium mb-2 block">Monto ($)</Label>
                      <Input type="number" placeholder="0.00" className="input-crystal" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-body font-medium mb-2 block">Medio de Pago</Label>
                      <select className="select-crystal">
                        <option value="">Seleccionar medio de pago</option>
                        {mediosPago.map(medio => (
                          <option key={medio} value={medio}>
                            {medio.charAt(0).toUpperCase() + medio.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-body font-medium mb-2 block">Categoría</Label>
                      <select className="select-crystal">
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
                    <Label className="text-body font-medium mb-2 block">Descripción</Label>
                    <Textarea placeholder="Descripción del gasto..." className="input-crystal min-h-[100px]" />
                  </div>
                  <Button className="btn-primary-crystal w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Guardar Gasto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'gastos' && (
          <div className="space-y-6">
            <Card className="card-crystal">
              <CardHeader>
                <CardTitle className="heading-secondary">Lista de Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="table-crystal">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-4">Fecha</th>
                        <th className="text-left p-4">Monto</th>
                        <th className="text-left p-4">Categoría</th>
                        <th className="text-left p-4">Estado</th>
                        <th className="text-left p-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastos.map(gasto => (
                        <tr key={gasto.id}>
                          <td className="p-4">{gasto.fecha}</td>
                          <td className="p-4">${gasto.monto.toLocaleString()}</td>
                          <td className="p-4">{gasto.categoria}</td>
                          <td className="p-4">
                            <Badge className={`badge-${gasto.estado}`}>
                              {gasto.estado}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Button className="btn-secondary-crystal">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'panel' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-crystal chart-container">
                <CardHeader>
                  <CardTitle className="heading-secondary">Gastos por Usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[{name: 'Luis', value: 15000}, {name: 'Eugenio', value: 8500}]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="#FFD700" />
                      <YAxis stroke="#FFD700" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#2A2A2A',
                          border: '1px solid #FFD700',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" fill="#FFD700" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="card-crystal chart-container">
                <CardHeader>
                  <CardTitle className="heading-secondary">Gastos por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {name: 'Viáticos', value: 15000},
                          {name: 'Transporte', value: 8500}
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#FFD700"
                        dataKey="value"
                      >
                        <Cell fill="#FFD700" />
                        <Cell fill="#007FFF" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#2A2A2A',
                          border: '1px solid #FFD700',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

