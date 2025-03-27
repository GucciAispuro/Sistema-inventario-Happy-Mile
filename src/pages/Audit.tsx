
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import MotionContainer from '@/components/ui/MotionContainer';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { DataTable } from '@/components/ui/DataTable';
import { Calendar, Plus, Minus, ChevronsUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AuditDetail, { AuditItem } from '@/components/audit/AuditDetail';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Type definitions
type AuditHistory = {
  id: string;
  location: string;
  date: string;
  user_name: string;
  items_count: number;
  discrepancies: number;
  created_at?: string;
};

type Location = {
  id: string;
  name: string;
};

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
};

const Audit = () => {
  const [user, setUser] = useState('Admin User'); // Default user
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isAuditItemsDialogOpen, setIsAuditItemsDialogOpen] = useState(false);
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);

  // Fetch locations
  const { 
    data: locations = [], 
    isLoading: isLoadingLocations 
  } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      try {
        // Simulating a fetch of locations - in a real app, this would come from the database
        return [
          { id: '1', name: 'Almacén Principal' },
          { id: '2', name: 'Almacén Secundario' },
          { id: '3', name: 'Oficina Central' }
        ];
      } catch (err) {
        console.error('Error fetching locations:', err);
        return [];
      }
    }
  });

  // Fetch inventory items for the selected location
  const { 
    data: inventoryItems = [],
    isLoading: isLoadingInventory,
    refetch: refetchInventoryItems
  } = useQuery<InventoryItem[]>({
    queryKey: ['inventory-items', selectedLocation],
    queryFn: async () => {
      if (!selectedLocation) return [];
      
      try {
        // In a real app, fetch items from the database based on location
        // This is a simulation with hardcoded data
        return [
          { 
            id: '1', 
            name: 'Laptop HP', 
            category: 'Electrónicos',
            location: selectedLocation,
            quantity: 10
          },
          { 
            id: '2', 
            name: 'Monitor Dell', 
            category: 'Electrónicos',
            location: selectedLocation,
            quantity: 15
          },
          { 
            id: '3', 
            name: 'Teclado Mecánico', 
            category: 'Periféricos',
            location: selectedLocation,
            quantity: 20
          }
        ];
      } catch (err) {
        console.error('Error fetching inventory items:', err);
        return [];
      }
    },
    enabled: !!selectedLocation
  });

  // Fetch audit history
  const { 
    data: auditHistory = [], 
    isLoading, 
    refetch: refetchAuditHistory
  } = useQuery<AuditHistory[]>({
    queryKey: ['audit-history'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('audits')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          toast({
            title: 'Error al cargar el historial de auditorías',
            description: error.message,
            variant: 'destructive'
          });
          throw error;
        }

        return data || [];
      } catch (err) {
        console.error('Error fetching audit history:', err);
        return [];
      }
    }
  });

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    
    // Generate audit items based on inventory
    const items: AuditItem[] = inventoryItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      location: item.location,
      system_quantity: item.quantity,
      actual_quantity: item.quantity, // Default to system quantity initially
      difference: 0 // Initially no difference
    }));
    
    setAuditItems(items);
    setIsAuditItemsDialogOpen(true);
  };

  // Update actual quantity for an item
  const handleQuantityChange = (id: string, newQuantity: number) => {
    setAuditItems(prev => prev.map(item => {
      if (item.id === id) {
        const actual = Math.max(0, newQuantity); // Prevent negative quantities
        return {
          ...item,
          actual_quantity: actual,
          difference: actual - item.system_quantity
        };
      }
      return item;
    }));
  };

  // Get discrepancy count
  const getDiscrepancyCount = () => {
    return auditItems.filter(item => item.difference !== 0).length;
  };

  // Handle form submission
  const handleSaveAudit = async () => {
    try {
      if (!selectedLocation) {
        toast({
          title: 'Ubicación no seleccionada',
          description: 'Por favor selecciona una ubicación para la auditoría.',
          variant: 'destructive'
        });
        return;
      }

      const itemsWithDiscrepancies = auditItems.length;
      const discrepancyCount = getDiscrepancyCount();

      // Insert audit record
      const { data: auditRecord, error: auditError } = await supabase
        .from('audits')
        .insert({
          location: selectedLocation,
          date: new Date().toISOString().split('T')[0],
          user_name: user,
          items_count: itemsWithDiscrepancies,
          discrepancies: discrepancyCount
        })
        .select()
        .single();

      if (auditError) {
        throw new Error(`Error al guardar la auditoría: ${auditError.message}`);
      }

      // Insert audit items with correct properties
      const auditItemsData = auditItems.map(item => ({
        audit_id: auditRecord.id,
        id: item.id,
        name: item.name,
        category: item.category,
        location: item.location,
        system_quantity: item.system_quantity,
        actual_quantity: item.actual_quantity,
        difference: item.difference
      }));

      const { error: itemsError } = await supabase
        .from('audit_items')
        .insert(auditItemsData);

      if (itemsError) {
        throw new Error(`Error al guardar los elementos de la auditoría: ${itemsError.message}`);
      }

      // Success!
      toast({
        title: 'Auditoría Guardada',
        description: `Se ha guardado la auditoría con ${discrepancyCount} discrepancias.`,
      });

      // Reset form and close dialog
      setSelectedLocation('');
      setIsAuditItemsDialogOpen(false);

      // Refresh audit history
      refetchAuditHistory();
    } catch (error) {
      console.error('Error saving audit:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido al guardar la auditoría',
        variant: 'destructive'
      });
    }
  };

  // View audit details
  const handleViewAuditDetails = async (auditId: string) => {
    try {
      // Fetch audit details
      const { data: auditData, error: auditError } = await supabase
        .from('audits')
        .select('*')
        .eq('id', auditId)
        .single();

      if (auditError) {
        throw new Error(`Error al cargar la auditoría: ${auditError.message}`);
      }

      // Fetch audit items
      const { data: itemsData, error: itemsError } = await supabase
        .from('audit_items')
        .select('*')
        .eq('audit_id', auditId);

      if (itemsError) {
        throw new Error(`Error al cargar los elementos de la auditoría: ${itemsError.message}`);
      }

      // Transform itemsData to match AuditItem interface
      const transformedItems: AuditItem[] = (itemsData || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        location: item.location,
        system_quantity: item.system_quantity,
        actual_quantity: item.actual_quantity,
        difference: item.difference
      }));

      // Set selected audit for detail view
      setSelectedAudit({
        ...auditData,
        items: transformedItems
      });

      setIsDetailOpen(true);
    } catch (error) {
      console.error('Error fetching audit details:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido al cargar los detalles',
        variant: 'destructive'
      });
    }
  };

  return (
    <Layout title="Auditoría de Inventario">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Auditoría de Inventario</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-40">
                  Nueva Auditoría
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {locations.map((location) => (
                  <DropdownMenuItem 
                    key={location.id}
                    onClick={() => handleLocationSelect(location.name)}
                  >
                    {location.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Historial de Auditorías</h2>
            
            <DataTable 
              data={auditHistory}
              loading={isLoading}
              emptyState="No hay registros de auditorías"
              columns={[
                { 
                  key: 'date', 
                  header: 'Fecha',
                  cell: (audit: AuditHistory) => (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {audit.date}
                    </div>
                  )
                },
                { key: 'location', header: 'Ubicación' },
                { key: 'user_name', header: 'Usuario' },
                { 
                  key: 'items_count', 
                  header: 'Artículos',
                  cell: (audit: AuditHistory) => (
                    <span className="font-medium">{audit.items_count}</span>
                  )
                },
                { 
                  key: 'discrepancies', 
                  header: 'Discrepancias',
                  cell: (audit: AuditHistory) => (
                    <span className={`font-medium ${audit.discrepancies > 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {audit.discrepancies}
                    </span>
                  )
                },
                {
                  key: 'actions',
                  header: 'Acciones',
                  cell: (audit: AuditHistory) => (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewAuditDetails(audit.id)}
                    >
                      Ver Detalles
                    </Button>
                  )
                }
              ]}
            />
          </div>
        </MotionContainer>
      </div>
      
      {/* Audit Items Dialog */}
      <Dialog open={isAuditItemsDialogOpen} onOpenChange={setIsAuditItemsDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Auditoría: {selectedLocation}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-md">
                <span className="text-sm text-muted-foreground">Ubicación</span>
                <span className="text-lg font-medium">{selectedLocation}</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-md">
                <span className="text-sm text-muted-foreground">Artículos</span>
                <span className="text-lg font-medium">{auditItems.length}</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-md">
                <span className="text-sm text-muted-foreground">Discrepancias</span>
                <span className={`text-lg font-medium ${getDiscrepancyCount() > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {getDiscrepancyCount()}
                </span>
              </div>
            </div>
            
            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-2">Artículo</th>
                  <th className="text-left p-2">Categoría</th>
                  <th className="text-left p-2">Sistema</th>
                  <th className="text-left p-2">Real</th>
                  <th className="text-left p-2">Diferencia</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {auditItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.category}</td>
                    <td className="p-2 font-medium">{item.system_quantity}</td>
                    <td className="p-2 font-medium">{item.actual_quantity}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        {item.difference > 0 && <Plus className="h-3 w-3 text-destructive mr-1" />}
                        {item.difference < 0 && <Minus className="h-3 w-3 text-blue-600 mr-1" />}
                        <span 
                          className={
                            item.difference > 0 
                              ? 'text-destructive font-medium' 
                              : item.difference < 0 
                                ? 'text-blue-600 font-medium' 
                                : 'text-green-600 font-medium'
                          }
                        >
                          {item.difference > 0 ? `+${item.difference}` : item.difference}
                        </span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleQuantityChange(item.id, item.actual_quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <Input
                          type="number"
                          value={item.actual_quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 h-7 text-center"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleQuantityChange(item.id, item.actual_quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuditItemsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAudit}>
              Guardar Auditoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Audit Detail Dialog */}
      <AuditDetail 
        audit={selectedAudit}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </Layout>
  );
};

export default Audit;
