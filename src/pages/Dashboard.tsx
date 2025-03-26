
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
  AlertTriangle
} from 'lucide-react';

// Mock data
const lowStockItems = [
  { id: 1, name: 'Office Chair', location: 'CDMX', stock: 2, min: 5, status: 'Low' },
  { id: 2, name: 'Printer Paper', location: 'Monterrey', stock: 3, min: 10, status: 'Critical' },
  { id: 3, name: 'Spare Tire', location: 'Guadalajara', stock: 1, min: 3, status: 'Low' },
  { id: 4, name: 'Safety Vest', location: 'Culiacán', stock: 4, min: 5, status: 'Low' },
];

const recentTransactions = [
  { id: 1, item: 'Office Chair', location: 'CDMX', type: 'OUT', quantity: 1, date: '2023-06-01', user: 'Maria G.' },
  { id: 2, name: 'Printer Paper', location: 'Monterrey', type: 'IN', quantity: 25, date: '2023-05-30', user: 'Carlos R.' },
  { id: 3, name: 'Spare Tire', location: 'Guadalajara', type: 'OUT', quantity: 2, date: '2023-05-29', user: 'Juan P.' },
  { id: 4, name: 'Laptop', location: 'CDMX', type: 'IN', quantity: 5, date: '2023-05-28', user: 'Ana L.' },
  { id: 5, name: 'Safety Vest', location: 'Culiacán', type: 'OUT', quantity: 3, date: '2023-05-28', user: 'Diego M.' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  
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

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* Stats Overview */}
        <MotionContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              title="Total Items" 
              value="256" 
              icon={<Package className="h-5 w-5" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard 
              title="Locations" 
              value="4" 
              icon={<Map className="h-5 w-5" />}
            />
            <StatsCard 
              title="Transactions (30d)" 
              value="87" 
              icon={<ArrowUpDown className="h-5 w-5" />}
              trend={{ value: 4, isPositive: true }}
            />
            <StatsCard 
              title="Low Stock Alerts" 
              value="8" 
              icon={<AlertTriangle className="h-5 w-5" />}
              trend={{ value: 2, isPositive: false }}
              className="border-l-4 border-amber-400"
            />
          </div>
        </MotionContainer>
        
        {/* Low Stock Items */}
        <MotionContainer delay={100} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Low Stock Items</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
              View All Inventory
            </Button>
          </div>
          
          <DataTable 
            data={lowStockItems}
            columns={[
              { key: 'name', header: 'Item' },
              { key: 'location', header: 'Location' },
              { 
                key: 'stock', 
                header: 'Current Stock',
                cell: (item) => (
                  <div className="font-medium">{item.stock}</div>
                )
              },
              { 
                key: 'min', 
                header: 'Min. Required',
                cell: (item) => (
                  <div className="text-muted-foreground">{item.min}</div>
                )
              },
              { 
                key: 'status', 
                header: 'Status',
                cell: (item) => (
                  <Badge 
                    variant={item.status === 'Critical' ? 'danger' : 'warning'}
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
                    Restock
                  </Button>
                )
              },
            ]}
          />
        </MotionContainer>
        
        {/* Recent Transactions */}
        <MotionContainer delay={200} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Recent Transactions</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/transactions')}>
              View All Transactions
            </Button>
          </div>
          
          <DataTable 
            data={recentTransactions}
            columns={[
              { key: 'item', header: 'Item' },
              { key: 'location', header: 'Location' },
              { 
                key: 'type', 
                header: 'Type',
                cell: (item) => (
                  <div className="flex items-center">
                    {item.type === 'IN' ? (
                      <>
                        <ArrowDown className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">IN</span>
                      </>
                    ) : (
                      <>
                        <ArrowUp className="h-3 w-3 text-blue-600 mr-1" />
                        <span className="text-blue-600 font-medium">OUT</span>
                      </>
                    )}
                  </div>
                )
              },
              { 
                key: 'quantity', 
                header: 'Qty',
                cell: (item) => (
                  <div className="font-medium">{item.quantity}</div>
                )
              },
              { 
                key: 'date', 
                header: 'Date',
                cell: (item) => (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.date}
                  </div>
                )
              },
              { key: 'user', header: 'User' },
            ]}
          />
        </MotionContainer>
      </div>
    </Layout>
  );
};

export default Dashboard;
