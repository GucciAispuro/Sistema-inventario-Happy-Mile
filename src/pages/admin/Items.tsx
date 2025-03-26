
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search,
  Filter,
  Edit,
  Trash2
} from 'lucide-react';

// Mock data for items
const items = [
  { id: 1, name: 'Office Chair', category: 'Furniture', description: 'Ergonomic office chair with adjustable height', min_stock: 5, lead_time: 14, unit: 'pieces' },
  { id: 2, name: 'Printer Paper', category: 'Office Supplies', description: 'A4 size printer paper, 500 sheets per pack', min_stock: 10, lead_time: 7, unit: 'packs' },
  { id: 3, name: 'Laptop', category: 'Electronics', description: 'Business laptop with i5 processor, 8GB RAM, 256GB SSD', min_stock: 3, lead_time: 21, unit: 'pieces' },
  { id: 4, name: 'Spare Tire', category: 'Vehicle Parts', description: 'Standard spare tire for company vehicles', min_stock: 8, lead_time: 10, unit: 'pieces' },
  { id: 5, name: 'Safety Vest', category: 'Safety Equipment', description: 'High visibility safety vest with reflective strips', min_stock: 5, lead_time: 5, unit: 'pieces' },
  { id: 6, name: 'Printer Toner', category: 'Office Supplies', description: 'Compatible toner cartridge for office printers', min_stock: 2, lead_time: 7, unit: 'pieces' },
  { id: 7, name: 'First Aid Kit', category: 'Safety Equipment', description: 'Standard first aid kit for emergency use', min_stock: 5, lead_time: 7, unit: 'kits' },
  { id: 8, name: 'Desk Lamp', category: 'Furniture', description: 'LED desk lamp with adjustable brightness', min_stock: 3, lead_time: 7, unit: 'pieces' },
];

const AdminItems = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  
  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Check admin role
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    setUserRole(role);
  }, [navigate]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery]);

  return (
    <Layout title="Item Management">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search items..." 
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
              { 
                key: 'description', 
                header: 'Description',
                cell: (item) => (
                  <div className="max-w-[250px] truncate text-muted-foreground">
                    {item.description}
                  </div>
                )
              },
              { 
                key: 'min_stock', 
                header: 'Min. Stock',
                cell: (item) => (
                  <div className="font-medium">{item.min_stock}</div>
                )
              },
              { 
                key: 'lead_time', 
                header: 'Lead Time',
                cell: (item) => (
                  <div>{item.lead_time} days</div>
                )
              },
              { key: 'unit', header: 'Unit' },
              { 
                key: 'actions', 
                header: '',
                cell: (item) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
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

export default AdminItems;
