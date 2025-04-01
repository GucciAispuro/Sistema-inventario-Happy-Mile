
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DeleteItemDialog from '@/components/inventory/DeleteItemDialog';
import EditItemDialog from '@/components/inventory/EditItemDialog';
import { 
  Search,
  Filter,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description?: string; 
  min_stock: number;
  lead_time?: number;
  unit: string;
  location: string;
  cost?: number;
  quantity?: number;
}

const AdminItems = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [registeredLocations, setRegisteredLocations] = useState<string[]>([]);
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    setUserRole(role);
    fetchItems();
    fetchLocations();
  }, [navigate]);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('name')
        .order('name');
      
      if (error) {
        console.error("Error fetching locations:", error);
        throw error;
      }
      
      if (data) {
        setRegisteredLocations(data.map(loc => loc.name));
      }
    } catch (error) {
      console.error("Error in fetchLocations:", error);
      toast({
        title: "Error al cargar ubicaciones",
        description: "No se pudieron cargar las ubicaciones",
        variant: "destructive"
      });
    }
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*');
      
      if (error) {
        console.error("Error fetching items:", error);
        throw error;
      }
      
      const formattedItems = data ? data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description || '', 
        min_stock: item.min_stock || 5,
        lead_time: item.lead_time || 7,
        unit: 'piezas',
        location: item.location,
        cost: item.cost,
        quantity: item.quantity
      })) : [];
      
      setItems(formattedItems);
      setFilteredItems(formattedItems);
    } catch (error) {
      console.error("Error in fetchItems:", error);
      toast({
        title: "Error al cargar artículos",
        description: "No se pudieron cargar los artículos del inventario",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (searchQuery.trim() === '' && categoryFilter === '') {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(item => {
        const matchesSearch = query === '' ? true : 
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query)) ||
          item.location.toLowerCase().includes(query);
        
        const matchesCategory = categoryFilter === '' ? true : 
          item.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
      });
      setFilteredItems(filtered);
    }
  }, [searchQuery, categoryFilter, items]);

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const handleUpdateItem = async (id: string, updatedItem: any) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          name: updatedItem.name,
          category: updatedItem.category,
          location: updatedItem.location,
          quantity: updatedItem.quantity,
          min_stock: updatedItem.min_stock,
          cost: updatedItem.cost,
          lead_time: updatedItem.lead_time,
          description: updatedItem.description
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating item:', error);
        throw error;
      }
      
      const updatedItems = items.map(item => 
        item.id === id ? { ...item, ...updatedItem } : item
      );
      
      setItems(updatedItems);
      setFilteredItems(updatedItems.filter(item => {
        const matchesSearch = searchQuery === '' ? true : 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = categoryFilter === '' ? true : 
          item.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
      }));
      
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

  const handleDeleteItem = async (id: string) => {
    try {
      if (!selectedItem) {
        throw new Error('No item selected for deletion');
      }
      
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('id')
        .eq('item', selectedItem.name)
        .eq('location', selectedItem.location)
        .limit(1);
      
      if (transactionsError) {
        console.error('Error checking transactions:', transactionsError);
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
      
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting from database:', error);
        throw error;
      }
      
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      setFilteredItems(updatedItems.filter(item => {
        const matchesSearch = searchQuery === '' ? true : 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = categoryFilter === '' ? true : 
          item.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
      }));
      
      toast({
        title: "Artículo eliminado",
        description: `${selectedItem.name} ha sido eliminado del inventario`,
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error al eliminar artículo",
        description: "No se pudo eliminar el artículo del inventario",
        variant: "destructive"
      });
      throw error;
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleAddItem = () => {
    toast({
      title: "Añadir Artículo",
      description: "Dirigiéndose a la página de inventario para añadir un artículo",
    });
    navigate('/inventory');
  };

  const categories = Array.from(new Set(items.map(item => item.category)));

  return (
    <Layout title="Gestión de Artículos">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar artículos..." 
                className="pl-9 subtle-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              
              <Button size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Artículo
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-card rounded-md border">
              <h3 className="font-medium mb-2">Filtros</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Categoría</label>
                  <select 
                    className="w-full p-2 rounded-md border"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <DataTable 
            data={filteredItems}
            columns={[
              { key: 'name', header: 'Nombre del Artículo' },
              { key: 'category', header: 'Categoría' },
              { key: 'location', header: 'Ubicación' },
              { 
                key: 'description', 
                header: 'Descripción',
                cell: (item) => (
                  <div className="max-w-[250px] truncate text-muted-foreground">
                    {item.description || '---'}
                  </div>
                )
              },
              { 
                key: 'min_stock', 
                header: 'Stock Mínimo',
                cell: (item) => (
                  <div className="font-medium">{item.min_stock}</div>
                )
              },
              { 
                key: 'lead_time', 
                header: 'Tiempo de Reabastecimiento',
                cell: (item) => (
                  <div>{item.lead_time || '---'} días</div>
                )
              },
              { key: 'unit', header: 'Unidad', cell: (item) => <div>{item.unit || '---'}</div> },
              { 
                key: 'actions', 
                header: '',
                cell: (item) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(item)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                )
              },
            ]}
            loading={isLoading}
            emptyState="No hay artículos en el inventario"
          />
        </MotionContainer>
      </div>

      <DeleteItemDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        item={selectedItem}
        onDeleteItem={handleDeleteItem}
      />

      {selectedItem && (
        <EditItemDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          locations={registeredLocations}
          item={selectedItem}
          onUpdateItem={handleUpdateItem}
        />
      )}
    </Layout>
  );
};

export default AdminItems;
