import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import StatsCard from '@/components/ui/StatsCard';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

interface InventoryItem {
  id: string;
  name: string;
  location: string;
  quantity: number;
  category: string;
  created_at: string;
  cost?: number;
  min_stock?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    locations: 0,
    recentTransactions: 0,
    inventoryValue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    
    fetchDashboardData();
    
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => fetchDashboardData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => fetchDashboardData()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);
  
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*');
      
      if (inventoryError) {
        console.error('Error fetching inventory:', inventoryError);
        toast({
          title: 'Error al cargar datos',
          description: 'No se pudieron cargar los datos del inventario',
          variant: 'destructive'
        });
        return;
      }
      
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        return;
      }
      
      let totalValue = 0;
      const lowItems = [];
      
      if (inventoryData) {
        const locations = new Set(inventoryData.map(item => item.location)).size;
        
        const totalItems = inventoryData.length;
        
        for (const item of inventoryData as InventoryItem[]) {
          const itemCost = item.cost || 0;
          
          const itemTotalValue = itemCost * item.quantity;
          totalValue += itemTotalValue;
          
          const minStock = item.min_stock || 5;
          
          const isLowStock = item.quantity < minStock;
          if (isLowStock) {
            lowItems.push({
              id: item.id,
              name: item.name,
              location: item.location,
              stock: item.quantity,
              min: minStock,
              status: item.quantity <= minStock / 2 ? 'Crítico' : 'Bajo',
              cost: itemCost,
              total: itemCost * item.quantity
            });
          }
        }
        
        setStats({
          totalItems,
          locations,
          recentTransactions: transactionsData?.length || 0,
          inventoryValue: totalValue
        });
      }
      
      const formattedTransactions = transactionsData?.map(transaction => ({
        id: transaction.id,
        item: transaction.item,
        location: transaction.location,
        type: transaction.type,
        quantity: transaction.quantity,
        date: transaction.date,
        user: transaction.user_name
      })) || [];
      
      setTotalInventoryValue(totalValue);
      setLowStockItems(lowItems);
      setRecentTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error in dashboard data fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
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
        <MotionContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              title="Total de Artículos" 
              value={stats.totalItems.toString()} 
              icon={<Package className="h-5 w-5" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard 
              title="Ubicaciones" 
              value={stats.locations.toString()}
              icon={<Map className="h-5 w-5" />}
            />
            <StatsCard 
              title="Transacciones (30d)" 
              value={stats.recentTransactions.toString()} 
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
            loading={isLoading}
            emptyState="No hay artículos con bajo stock"
          />
        </MotionContainer>
        
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
            loading={isLoading}
            emptyState="No hay transacciones recientes"
          />
        </MotionContainer>
      </div>
    </Layout>
  );
};

export default Dashboard;
