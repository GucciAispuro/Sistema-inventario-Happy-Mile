
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import StatsCard from '@/components/ui/StatsCard';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BoxIcon, 
  Package, 
  Map, 
  ArrowUpDown, 
  ArrowDown, 
  ArrowUp,
  Clock,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

// Mock data with cost
const lowStockItems = [
  { id: 1, name: 'Silla de Oficina', location: 'CDMX', stock: 2, min: 5, status: 'Bajo', cost: 1200, total: 2400 },
  { id: 2, name: 'Papel para Impresora', location: 'Monterrey', stock: 3, min: 10, status: 'Crítico', cost: 120, total: 360 },
  { id: 3, name: 'Llanta de Repuesto', location: 'Guadalajara', stock: 1, min: 3, status: 'Bajo', cost: 2500, total: 2500 },
  { id: 4, name: 'Chaleco de Seguridad', location: 'Culiacán', stock: 4, min: 5, status: 'Bajo', cost: 350, total: 1400 },
];

const recentTransactions = [
  { id: 1, item: 'Silla de Oficina', location: 'CDMX', type: 'OUT', quantity: 1, date: '2023-06-01', user: 'María G.' },
  { id: 2, name: 'Papel para Impresora', location: 'Monterrey', type: 'IN', quantity: 25, date: '2023-05-30', user: 'Carlos R.' },
  { id: 3, name: 'Llanta de Repuesto', location: 'Guadalajara', type: 'OUT', quantity: 2, date: '2023-05-29', user: 'Juan P.' },
  { id: 4, name: 'Laptop', location: 'CDMX', type: 'IN', quantity: 5, date: '2023-05-28', user: 'Ana L.' },
  { id: 5, name: 'Chaleco de Seguridad', location: 'Culiacán', type: 'OUT', quantity: 3, date: '2023-05-28', user: 'Diego M.' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [totalInventoryValue, setTotalInventoryValue] = useState(239320); // Valor total del inventario
  
  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Get user role
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, [navigate]);

  // Find the function that defines badge variants and update it
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Bajo': return 'destructive';
      case 'Crítico': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* Stats Overview */}
        <MotionContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              title="Total de Artículos" 
              value="256" 
              icon={<Package className="h-5 w-5" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard 
              title="Ubicaciones" 
              value="4" 
              icon={<Map className="h-5 w-5" />}
            />
            <StatsCard 
              title="Transacciones (30d)" 
              value="87" 
              icon={<ArrowUpDown className="h-5 w-5" />}
              trend={{ value: 4, isPositive: true }}
            />
            <StatsCard 
              title="Valor de Inventario" 
              value={formatCurrency(totalInventoryValue)} 
              icon={<DollarSign className="h-5 w-5" />}
              trend={{ value: 5, isPositive: true }}
              className="border-l-4 border-green-400"
            />
          </div>
        </MotionContainer>
        
        {/* Low Stock Items */}
        <MotionContainer delay={100} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Artículos con Bajo Stock</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
              Ver Todo el Inventario
            </Button>
          </div>
          
          <DataTable 
            data={lowStockItems}
            columns={[
              { key: 'name', header: 'Artículo' },
              { key: 'location', header: 'Ubicación' },
              { 
                key: 'stock', 
                header: 'Stock Actual',
                cell: (item) => (
                  <div className="font-medium">{item.stock}</div>
                )
              },
              { 
                key: 'min', 
                header: 'Mín. Requerido',
                cell: (item) => (
                  <div className="text-muted-foreground">{item.min}</div>
                )
              },
              { 
                key: 'cost', 
                header: 'Costo Unitario',
                cell: (item) => (
                  <div className="text-green-700">{formatCurrency(item.cost)}</div>
                )
              },
              { 
                key: 'total', 
                header: 'Valor Total',
                cell: (item) => (
                  <div className="text-green-700">{formatCurrency(item.total)}</div>
                )
              },
              { 
                key: 'status', 
                header: 'Estado',
                cell: (item) => (
                  <Badge 
                    variant={getStatusBadgeVariant(item.status)}
                  >
                    {item.status}
                  </Badge>
                )
              },
              { 
                key: 'actions', 
                header: '',
                cell: () => (
                  <Button variant="ghost" size="sm">
                    Reabastecer
                  </Button>
                )
              },
            ]}
          />
        </MotionContainer>
        
        {/* Recent Transactions */}
        <MotionContainer delay={200} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Transacciones Recientes</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/transactions')}>
              Ver Todas las Transacciones
            </Button>
          </div>
          
          <DataTable 
            data={recentTransactions}
            columns={[
              { key: 'item', header: 'Artículo' },
              { key: 'location', header: 'Ubicación' },
              { 
                key: 'type', 
                header: 'Tipo',
                cell: (item) => (
                  <div className="flex items-center">
                    {item.type === 'IN' ? (
                      <>
                        <ArrowDown className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">ENTRADA</span>
                      </>
                    ) : (
                      <>
                        <ArrowUp className="h-3 w-3 text-blue-600 mr-1" />
                        <span className="text-blue-600 font-medium">SALIDA</span>
                      </>
                    )}
                  </div>
                )
              },
              { 
                key: 'quantity', 
                header: 'Cant.',
                cell: (item) => (
                  <div className="font-medium">{item.quantity}</div>
                )
              },
              { 
                key: 'date', 
                header: 'Fecha',
                cell: (item) => (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.date}
                  </div>
                )
              },
              { key: 'user', header: 'Usuario' },
            ]}
          />
        </MotionContainer>
      </div>
    </Layout>
  );
};

export default Dashboard;
