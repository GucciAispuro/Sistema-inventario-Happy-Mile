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
import EditItemDialog from '@/components/inventory/EditItemDialog';
import DeleteItemDialog from '@/components/inventory/DeleteItemDialog';
import { exportToExcel, formatInventoryForExport } from '@/utils/exportToExcel';
import { checkAndAlertLowStock } from '@/utils/inventory/lowStockAlert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search,
  Filter,
  Download,
  DollarSign,
  MapPin,
  X,
  BellRing,
  Trash2
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
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [showDeleteItemDialog, setShowDeleteItemDialog] = useState(false);
  const [allLocations, setAllLocations] = useState<string[]>([]);

  const categories = Array.from(new Set(inventoryItems.map(item => item.category)));
  const statuses = Array.from(new Set(inventoryItems.map(item => item.status || ''))).filter(Boolean);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    fetchInventoryData();
    fetchLocations();
    
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

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const locationNames = data.map(loc => loc.name);
        setAllLocations(locationNames);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error al cargar ubicaciones",
        description: "No se pudieron cargar las ubicaciones disponibles",
        variant: "destructive"
      });
    }
  };

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
        const formattedData: InventoryItem[] = data.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          location: item.location,
          quantity: item.quantity,
          min_stock: item.min_stock || 5,
          cost: item.cost || 0,
          status: 
            item.quantity === 0 ? 'Agotado' :
            item.min_stock ? (item.quantity < item.min_stock / 2 ? 'Crítico' :
            item.quantity < item.min_stock ? 'Bajo' : 'Normal') : 'Normal',
          total_value: (item.cost || 0) * item.quantity
        }));
        
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

  useEffect(() => {
    if (!isLoading && inventoryItems && inventoryItems.length > 0) {
      const hasLowStockItems = inventoryItems.some(item => item.quantity < item.min_stock);
      if (hasLowStockItems) {
        checkAndAlertLowStock();
      }
    }
  }, [inventoryItems, isLoading]);

  const handleAddItem = async (newItem) => {
    try {
      await fetchInventoryData();
      
      toast({
        title: "Artículo añadido",
        description: `${newItem.name} ha sido añadido al inventario`,
      });
    } catch (error) {
      console.error('Error refreshing inventory data:', error);
      toast({
        title: "Error al actualizar inventario",
        description: "No se pudo actualizar la vista del inventario",
        variant: "destructive"
      });
    }
  };

  const handleUpdateItem = async (id: string, updatedItem: any) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update({
          name: updatedItem.name,
          category: updatedItem.category,
          location: updatedItem.location,
          quantity: updatedItem.quantity,
          min_stock: updatedItem.min_stock,
          cost: updatedItem.cost
        })
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Artículo actualizado",
        description: `${updatedItem.name} ha sido actualizado correctamente`,
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error al actualizar artículo",
        description: "No se pudo actualizar el artículo en el inventario",
        variant: "destructive"
      });
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowEditItemDialog(true);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      if (selectedItem) {
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('id')
          .eq('item', selectedItem.name)
          .eq('location', selectedItem.location)
          .limit(1);
        
        if (transactionsError) {
          throw transactionsError;
        }
        
        if (transactionsData && transactionsData.length > 0) {
          toast({
            title: "No se puede eliminar",
            description: "Este artículo tiene transacciones asociadas y no puede ser eliminado. Considere reducir su cantidad a cero en su lugar.",
            variant: "destructive"
          });
          return;
        }
      }
      
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      await fetchInventoryData();
      
      toast({
        title: "Artículo eliminado",
        description: "El artículo ha sido eliminado correctamente del inventario.",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  const handleDeleteItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDeleteItemDialog(true);
  };

  const handleExport = () => {
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

  const handleSendLowStockAlerts = async () => {
    try {
      await checkAndAlertLowStock();
      toast({
        title: "Verificación iniciada",
        description: "Se están revisando artículos con stock bajo y enviando alertas",
      });
    } catch (error) {
      console.error("Error al enviar alertas de stock bajo:", error);
      toast({
        title: "Error en alertas",
        description: "No se pudieron verificar los artículos con stock bajo",
        variant: "destructive"
      });
    }
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
                    {allLocations.map(location => (
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

              {userRole === 'admin' && (
                <Button variant="outline" size="sm" onClick={handleSendLowStockAlerts}>
                  <BellRing className="h-4 w-4 mr-2" />
                  Verificar Stock Bajo
                </Button>
              )}
              
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
                cell: (item: InventoryItem) => (
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
                    {userRole === 'admin' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteItemClick(item)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </>
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
        locations={allLocations}
        onAddItem={handleAddItem}
      />

      <EditItemDialog
        open={showEditItemDialog}
        onOpenChange={setShowEditItemDialog}
        locations={allLocations}
        item={selectedItem}
        onUpdateItem={handleUpdateItem}
      />

      <DeleteItemDialog
        open={showDeleteItemDialog}
        onOpenChange={setShowDeleteItemDialog}
        item={selectedItem}
        onDeleteItem={handleDeleteItem}
      />
    </Layout>
  );
};

export default Inventory;
