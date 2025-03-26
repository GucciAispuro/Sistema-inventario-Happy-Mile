import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AddItemDialog from '@/components/inventory/AddItemDialog';
import { 
  Plus, 
  Search,
  Filter,
  ArrowUpDown,
  Download,
  DollarSign,
  MapPin,
  Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialInventoryItems = [
  { id: 1, name: 'Silla de Oficina', category: 'Mobiliario', location: 'CDMX', quantity: 15, min_stock: 5, status: 'Normal', cost: 1200, total_value: 18000, delivery_time: 7 },
  { id: 2, name: 'Papel para Impresora', category: 'Material de Oficina', location: 'CDMX', quantity: 8, min_stock: 10, status: 'Bajo', cost: 120, total_value: 960, delivery_time: 2 },
  { id: 3, name: 'Laptop', category: 'Electrónicos', location: 'CDMX', quantity: 12, min_stock: 3, status: 'Normal', cost: 15000, total_value: 180000, delivery_time: 14 },
  { id: 4, name: 'Silla de Oficina', category: 'Mobiliario', location: 'Monterrey', quantity: 7, min_stock: 5, status: 'Normal', cost: 1200, total_value: 8400, delivery_time: 7 },
  { id: 5, name: 'Papel para Impresora', category: 'Material de Oficina', location: 'Monterrey', quantity: 3, min_stock: 10, status: 'Crítico', cost: 120, total_value: 360, delivery_time: 2 },
  { id: 6, name: 'Llanta de Repuesto', category: 'Piezas de Vehículo', location: 'Guadalajara', quantity: 5, min_stock: 8, status: 'Bajo', cost: 2500, total_value: 12500, delivery_time: 5 },
  { id: 7, name: 'Chaleco de Seguridad', category: 'Equipo de Seguridad', location: 'Culiacán', quantity: 4, min_stock: 5, status: 'Bajo', cost: 350, total_value: 1400, delivery_time: 3 },
  { id: 8, name: 'Tóner para Impresora', category: 'Material de Oficina', location: 'Guadalajara', quantity: 9, min_stock: 2, status: 'Normal', cost: 800, total_value: 7200, delivery_time: 4 },
  { id: 9, name: 'Kit de Primeros Auxilios', category: 'Equipo de Seguridad', location: 'CDMX', quantity: 12, min_stock: 5, status: 'Normal', cost: 650, total_value: 7800, delivery_time: 3 },
  { id: 10, name: 'Lámpara de Escritorio', category: 'Mobiliario', location: 'Culiacán', quantity: 6, min_stock: 3, status: 'Normal', cost: 450, total_value: 2700, delivery_time: 6 },
];

const Inventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [inventoryItems, setInventoryItems] = useState(initialInventoryItems);
  const [filteredItems, setFilteredItems] = useState(initialInventoryItems);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  
  const locations = Array.from(new Set(inventoryItems.map(item => item.location)));
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, [navigate]);
  
  useEffect(() => {
    let filtered = inventoryItems;
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }
    
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.location === selectedLocation);
    }
    
    setFilteredItems(filtered);
    
    const total = filtered.reduce((sum, item) => sum + item.total_value, 0);
    setTotalInventoryValue(total);
  }, [searchQuery, selectedLocation, inventoryItems]);

  const handleAddItem = (newItem) => {
    setInventoryItems([...inventoryItems, newItem]);
    
    toast({
      title: "Artículo añadido",
      description: `${newItem.name} ha sido añadido al inventario`,
    });
  };

  const getStatusVariant = (status: string) => {
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
    <Layout title="Inventario">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar artículos, categorías, ubicaciones..." 
                className="pl-9 subtle-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-secondary/80 px-3 py-1.5 rounded-md flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                <span className="text-sm font-medium">
                  Valor Total: {formatCurrency(totalInventoryValue)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por ubicación" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ubicaciones</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Button size="sm" onClick={() => setShowAddItemDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Artículo
              </Button>
            </div>
          </div>
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <DataTable 
            data={filteredItems}
            columns={[
              { key: 'name', header: 'Nombre del Artículo' },
              { key: 'category', header: 'Categoría' },
              { 
                key: 'location', 
                header: 'Ubicación',
                cell: (item) => (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-primary" />
                    {item.location}
                  </div>
                )
              },
              { 
                key: 'quantity', 
                header: 'Cantidad',
                cell: (item) => (
                  <div className="font-medium">{item.quantity}</div>
                )
              },
              { 
                key: 'cost', 
                header: 'Costo Unitario',
                cell: (item) => (
                  <div className="font-medium text-green-700">{formatCurrency(item.cost)}</div>
                )
              },
              { 
                key: 'total_value', 
                header: 'Valor Total',
                cell: (item) => (
                  <div className="font-medium text-green-700">{formatCurrency(item.total_value)}</div>
                )
              },
              { 
                key: 'delivery_time', 
                header: 'Tiempo de Entrega',
                cell: (item) => (
                  <div className="flex items-center text-amber-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {item.delivery_time} día{item.delivery_time !== 1 ? 's' : ''}
                  </div>
                )
              },
              { 
                key: 'min_stock', 
                header: 'Mín. Requerido',
                cell: (item) => (
                  <div className="text-muted-foreground">{item.min_stock}</div>
                )
              },
              { 
                key: 'status', 
                header: 'Estado',
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
                      Mover
                    </Button>
                    {userRole === 'admin' && (
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    )}
                  </div>
                )
              },
            ]}
          />
        </MotionContainer>
      </div>

      <AddItemDialog
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
        locations={locations}
        onAddItem={handleAddItem}
      />
    </Layout>
  );
};

export default Inventory;
