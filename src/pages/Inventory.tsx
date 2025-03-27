import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AddItemDialog from '@/components/inventory/AddItemDialog';
import CategoryManagement from '@/components/inventory/CategoryManagement';

const Inventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    fetchInventory();
  }, [navigate, refreshTrigger]);

  const fetchInventory = async () => {
    setLoading(true);
    console.log('Fetching inventory data...');
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching inventory:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el inventario',
          variant: 'destructive'
        });
        return;
      }
      
      console.log('Inventory data loaded:', data);
      setInventoryItems(data || []);
    } catch (err) {
      console.error('Error in fetchInventory:', err);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al cargar el inventario',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshInventory = () => {
    console.log('Manually refreshing inventory');
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: 'Actualizando',
      description: 'Actualizando datos del inventario',
    });
  };

  const handleAddItem = async (newItem) => {
    setIsAddItemOpen(false);
    
    // After adding an item, refresh the inventory
    refreshInventory();
  };

  const filteredItems = inventoryItems.filter(item => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    );
  });

  return (
    <Layout title="Inventario">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, categoría o ubicación..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={refreshInventory}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={() => setIsAddItemOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Item
            </Button>
          </div>
        </div>
        
        <DataTable
          data={filteredItems}
          loading={loading}
          columns={[
            { key: 'name', header: 'Nombre' },
            { key: 'category', header: 'Categoría' },
            { key: 'location', header: 'Ubicación' },
            { key: 'quantity', header: 'Cantidad' },
          ]}
          emptyState="No hay items en el inventario"
        />

        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">Gestionar Categorías</TabsTrigger>
          </TabsList>
          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>
        </Tabs>

        <AddItemDialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen} onAddItem={handleAddItem} />
      </div>
    </Layout>
  );
};

export default Inventory;
