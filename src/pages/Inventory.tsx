import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search,
  Filter,
  ArrowUpDown,
  Download
} from 'lucide-react';

// Mock data for inventory items
const inventoryItems = [
  { id: 1, name: 'Office Chair', category: 'Furniture', location: 'CDMX', quantity: 15, min_stock: 5, status: 'Normal' },
  { id: 2, name: 'Printer Paper', category: 'Office Supplies', location: 'CDMX', quantity: 8, min_stock: 10, status: 'Low' },
  { id: 3, name: 'Laptop', category: 'Electronics', location: 'CDMX', quantity: 12, min_stock: 3, status: 'Normal' },
  { id: 4, name: 'Office Chair', category: 'Furniture', location: 'Monterrey', quantity: 7, min_stock: 5, status: 'Normal' },
  { id: 5, name: 'Printer Paper', category: 'Office Supplies', location: 'Monterrey', quantity: 3, min_stock: 10, status: 'Critical' },
  { id: 6, name: 'Spare Tire', category: 'Vehicle Parts', location: 'Guadalajara', quantity: 5, min_stock: 8, status: 'Low' },
  { id: 7, name: 'Safety Vest', category: 'Safety Equipment', location: 'Culiacán', quantity: 4, min_stock: 5, status: 'Low' },
  { id: 8, name: 'Printer Toner', category: 'Office Supplies', location: 'Guadalajara', quantity: 9, min_stock: 2, status: 'Normal' },
  { id: 9, name: 'First Aid Kit', category: 'Safety Equipment', location: 'CDMX', quantity: 12, min_stock: 5, status: 'Normal' },
  { id: 10, name: 'Desk Lamp', category: 'Furniture', location: 'Culiacán', quantity: 6, min_stock: 3, status: 'Normal' },
];

const Inventory = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(inventoryItems);
  
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
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(inventoryItems);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = inventoryItems.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Low': return 'destructive';
      case 'Critical': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Layout title="Inventory">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search items, categories, locations..." 
                className="pl-9 subtle-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <DataTable 
            data={filteredItems}
            columns={[
              { key: 'name', header: 'Item Name' },
              { key: 'category', header: 'Category' },
              { key: 'location', header: 'Location' },
              { 
                key: 'quantity', 
                header: 'Quantity',
                cell: (item) => (
                  <div className="font-medium">{item.quantity}</div>
                )
              },
              { 
                key: 'min_stock', 
                header: 'Min. Required',
                cell: (item) => (
                  <div className="text-muted-foreground">{item.min_stock}</div>
                )
              },
              { 
                key: 'status', 
                header: 'Status',
                cell: (item) => (
                  <Badge variant={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                )
              },
              { 
                key: 'actions', 
                header: '',
                cell: (item) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <ArrowUpDown className="h-3 w-3 mr-1" />
                      Move
                    </Button>
                    {userRole === 'admin' && (
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    )}
                  </div>
                )
              },
            ]}
          />
        </MotionContainer>
      </div>
    </Layout>
  );
};

export default Inventory;
