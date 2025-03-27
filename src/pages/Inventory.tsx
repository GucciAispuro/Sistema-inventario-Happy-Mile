
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AddItemDialog from '@/components/inventory/AddItemDialog';
import { exportToExcel, formatInventoryForExport } from '@/utils/exportToExcel';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search,
  Filter,
  ArrowUpDown,
  Download,
  DollarSign,
  MapPin,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  min_stock?: number;
  cost?: number;
  status?: string;
  total_value?: number;
}

const Inventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ensure these arrays are never undefined by providing default empty arrays
  const locations = Array.from(new Set((inventoryItems || []).map(item => item.location)));
  const categories = Array.from(new Set((inventoryItems || []).map(item => item.category)));
  const statuses = Array.from(new Set((inventoryItems || []).map(item => item.status || '')).filter(Boolean));
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    fetchInventoryData();
    
    // Setup real-time subscription for inventory changes
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => fetchInventoryData()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const fetchInventoryData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform the data to match our UI expectations
        const formattedData = data.map(item => {
          // Default values for min_stock and cost
          const minStock = item.min_stock || 5;
          const cost = item.cost || 0;
          
          // Calculate status based on quantity and min_stock
          const status = 
            item.quantity === 0 ? 'Agotado' :
            item.quantity < minStock / 2 ? 'Crítico' :
            item.quantity < minStock ? 'Bajo' : 'Normal';
          
          // Calculate total value
          const totalValue = cost * item.quantity;
          
          return {
            id: item.id,
            name: item.name,
            category: item.category,
            location: item.location,
            quantity: item.quantity,
            min_stock: minStock,
            cost: cost,
            status: status,
            total_value: totalValue
          };
        });
        
        setInventoryItems(formattedData);
        setFilteredItems(formattedData);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error al cargar inventario",
        description: "No se pudo cargar la información del inventario",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Early return if inventoryItems is undefined
    if (!inventoryItems) return;
    
    let filtered = [...inventoryItems];
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.location && item.location.toLowerCase().includes(query))
      );
    }
    
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.location === selectedLocation);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }
    
    setFilteredItems(filtered);
    
    const total = filtered.reduce((sum, item) => sum + (item.total_value || 0), 0);
    setTotalInventoryValue(total);
  }, [searchQuery, selectedLocation, selectedCategory, selectedStatus, inventoryItems]);

  const handleAddItem = async (newItem) => {
    try {
      // Prepare the item for Supabase (remove UI-specific fields)
      const { 
        status, 
        total_value, 
        delivery_time, 
        ...itemForDb 
      } = newItem;
      
      // Insert the new item into Supabase
      const { data, error } = await supabase
        .from('inventory')
        .insert([itemForDb])
        .select();
      
      if (error) {
        throw error;
      }
      
      // We don't need to manually update the state as the subscription will trigger fetchInventoryData
      
      toast({
        title: "Artículo añadido",
        description: `${newItem.name} ha sido añadido al inventario`,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error al añadir artículo",
        description: "No se pudo agregar el artículo al inventario",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    // Ensure filteredItems exists before exporting
    if (!filteredItems || filteredItems.length === 0) {
      toast({
        title: "Error al exportar",
        description: "No hay datos para exportar",
        variant: "destructive"
      });
      return;
    }
    
    const dataToExport = formatInventoryForExport(filteredItems);
    const timestamp = new Date().toISOString().split('T')[0];
    exportToExcel(dataToExport, `inventario-${timestamp}`, 'Inventario');
    
    toast({
      title: "Exportación exitosa",
      description: `Se ha exportado el inventario a Excel`,
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Bajo': return 'destructive';
      case 'Crítico': return 'destructive';
      case 'Agotado': return 'destructive';
      default: return 'secondary';
    }
  };

  const resetFilters = () => {
    setSelectedLocation('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
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
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Filtros</h4>
                      <p className="text-sm text-muted-foreground">
                        Filtra el inventario por categoría y estado
                      </p>
                    </div>
                    <Separator />
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Categoría</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Estado</label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          {statuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Reiniciar filtros
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" size="sm" onClick={handleExport}>
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
            data={filteredItems || []}
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
                  <div className="font-medium text-green-700">{formatCurrency(item.cost || 0)}</div>
                )
              },
              { 
                key: 'total_value', 
                header: 'Valor Total',
                cell: (item) => (
                  <div className="font-medium text-green-700">{formatCurrency(item.total_value || 0)}</div>
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
                  <Badge variant={getStatusVariant(item.status || 'Normal')}>
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
            loading={isLoading}
            emptyState="No se encontraron artículos en el inventario"
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
