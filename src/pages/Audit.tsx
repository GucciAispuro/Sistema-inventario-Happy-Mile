
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import MotionContainer from '@/components/ui/MotionContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { FileCheck2, MapPin, Search, Trash2 } from 'lucide-react';
import AuditDetailComponent from '@/components/audit/AuditDetail';

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
  last_audit?: string;
};

type AuditItem = {
  id: string;
  name: string;
  category: string;
  system_quantity: number;
  actual_quantity: number;
  difference: number;
  last_audit?: string;
};

const Audit = () => {
  const [user] = useState('Admin User'); // Default user
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Fetch locations from the locations table in Supabase
  const { 
    data: locations = [], 
    isLoading: isLoadingLocations 
  } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        return data || [];
      } catch (err) {
        console.error('Error fetching locations:', err);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las ubicaciones',
          variant: 'destructive'
        });
        return [];
      }
    }
  });

  // Fetch inventory items for the selected location
  const { 
    data: inventoryItems = [],
    isLoading: isLoadingInventory,
    refetch: refetchInventory
  } = useQuery<InventoryItem[]>({
    queryKey: ['inventory-items', selectedLocation],
    enabled: !!selectedLocation,
    queryFn: async () => {
      if (!selectedLocation) return [];
      
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('location', selectedLocation);
          
        if (error) {
          throw error;
        }
        
        return data || [];
      } catch (err) {
        console.error('Error fetching inventory items:', err);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los artículos',
          variant: 'destructive'
        });
        return [];
      }
    }
  });

  // Fetch audit history
  const { 
    data: auditHistory = [], 
    isLoading: isLoadingAuditHistory, 
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

  // Initialize audit items when location is selected
  useEffect(() => {
    if (inventoryItems.length > 0) {
      const items: AuditItem[] = inventoryItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        system_quantity: item.quantity,
        actual_quantity: item.quantity, // Default to system quantity initially
        difference: 0, // Initially no difference
        last_audit: item.last_audit
      }));
      
      setAuditItems(items);
    } else {
      setAuditItems([]);
    }
  }, [inventoryItems]);

  // Handle location selection
  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
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

  // Filter items by search query
  const filteredItems = auditItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get discrepancy count
  const getDiscrepancyCount = () => {
    return auditItems.filter(item => item.difference !== 0).length;
  };

  // Handle form submission
  const handleSaveAudit = async () => {
    try {
      if (auditItems.length === 0) {
        toast({
          title: 'No hay artículos',
          description: 'No hay artículos para auditar',
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
        location: selectedLocation,
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

      // Reset form and refetch data
      setSelectedLocation("");
      setAuditItems([]);
      refetchAuditHistory();
      refetchInventory();
    } catch (error) {
      console.error('Error saving audit:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido al guardar la auditoría',
        variant: 'destructive'
      });
    }
  };

  // Delete an audit record
  const handleDeleteAudit = async (auditId: string) => {
    try {
      // First, delete all related audit items
      const { error: itemsError } = await supabase
        .from('audit_items')
        .delete()
        .eq('audit_id', auditId);

      if (itemsError) {
        throw new Error(`Error al eliminar los elementos de la auditoría: ${itemsError.message}`);
      }

      // Then, delete the audit record
      const { error: auditError } = await supabase
        .from('audits')
        .delete()
        .eq('id', auditId);

      if (auditError) {
        throw new Error(`Error al eliminar la auditoría: ${auditError.message}`);
      }

      // Success!
      toast({
        title: 'Auditoría Eliminada',
        description: 'La auditoría ha sido eliminada exitosamente.',
      });

      // Refetch audit history
      refetchAuditHistory();
    } catch (error) {
      console.error('Error deleting audit:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido al eliminar la auditoría',
        variant: 'destructive'
      });
    }
  };

  // View audit details
  const handleViewDetails = async (auditId: string) => {
    try {
      // Fetch audit details
      const { data: auditData, error: auditError } = await supabase
        .from('audits')
        .select('*')
        .eq('id', auditId)
        .single();

      if (auditError) {
        throw auditError;
      }

      // Fetch audit items
      const { data: itemsData, error: itemsError } = await supabase
        .from('audit_items')
        .select('*')
        .eq('audit_id', auditId);

      if (itemsError) {
        throw itemsError;
      }

      // Combine data
      const auditDetail = {
        ...auditData,
        items: itemsData || []
      };

      setSelectedAudit(auditDetail);
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Error fetching audit details:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los detalles de la auditoría',
        variant: 'destructive'
      });
    }
  };

  return (
    <Layout title="Auditoría de Inventario">
      <div className="space-y-6">
        <MotionContainer>
          <h1 className="text-2xl font-bold">Auditoría de Inventario</h1>
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="pending">Auditoría Pendiente</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-medium mb-3">Seleccionar Ubicación a Auditar</h2>
                  <Select
                    value={selectedLocation}
                    onValueChange={handleLocationChange}
                  >
                    <SelectTrigger className="w-full md:max-w-md">
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        {selectedLocation 
                          ? selectedLocation 
                          : 'Seleccionar ubicación'
                        }
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {locations.length > 0 ? (
                        locations.map((location) => (
                          <SelectItem key={location.id} value={location.name}>
                            {location.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-muted-foreground">
                          {isLoadingLocations ? 'Cargando ubicaciones...' : 'No hay ubicaciones disponibles'}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedLocation && (
                  <>
                    <div className="flex items-center">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar artículos..."
                          className="pl-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border">
                      <div className="grid grid-cols-12 gap-2 font-medium text-sm p-4 border-b bg-muted/50">
                        <div className="col-span-4">Nombre del Artículo</div>
                        <div className="col-span-2">Categoría</div>
                        <div className="col-span-1 text-center">Cantidad en Sistema</div>
                        <div className="col-span-2 text-center">Cantidad Real</div>
                        <div className="col-span-1 text-center">Diferencia</div>
                        <div className="col-span-2 text-center">Última Auditoría</div>
                      </div>
                      
                      <div className="max-h-[60vh] overflow-y-auto">
                        {filteredItems.length > 0 ? (
                          filteredItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 p-4 border-b hover:bg-muted/20">
                              <div className="col-span-4">{item.name}</div>
                              <div className="col-span-2">{item.category}</div>
                              <div className="col-span-1 text-center font-medium">{item.system_quantity}</div>
                              <div className="col-span-2 text-center">
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.actual_quantity}
                                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                  className="text-center h-9"
                                />
                              </div>
                              <div className={`col-span-1 text-center font-medium ${
                                item.difference > 0 
                                  ? 'text-green-600' 
                                  : item.difference < 0 
                                    ? 'text-red-600' 
                                    : ''
                              }`}>
                                {item.difference > 0 ? `+${item.difference}` : item.difference}
                              </div>
                              <div className="col-span-2 text-center text-muted-foreground">
                                {item.last_audit || 'N/A'}
                              </div>
                            </div>
                          ))
                        ) : isLoadingInventory ? (
                          <div className="p-8 text-center text-muted-foreground">
                            Cargando artículos...
                          </div>
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            No hay artículos para auditar en esta ubicación
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {filteredItems.length > 0 && (
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSaveAudit}
                          className="gap-2"
                        >
                          <FileCheck2 className="h-4 w-4" />
                          Guardar Auditoría
                        </Button>
                      </div>
                    )}
                  </>
                )}
                
                {!selectedLocation && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileCheck2 className="h-16 w-16 mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-medium mb-2">Auditoría de Inventario</h3>
                    <p className="text-muted-foreground max-w-md">
                      Seleccione una ubicación para comenzar a auditar su inventario
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="bg-white rounded-lg border">
                <div className="grid grid-cols-7 gap-2 font-medium text-sm p-4 border-b bg-muted/50">
                  <div className="col-span-1">Ubicación</div>
                  <div className="col-span-1">Fecha</div>
                  <div className="col-span-1">Realizada por</div>
                  <div className="col-span-1 text-center">Artículos Auditados</div>
                  <div className="col-span-1 text-center">Discrepancias</div>
                  <div className="col-span-2 text-right">Acciones</div>
                </div>
                
                <div className="divide-y">
                  {isLoadingAuditHistory ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Cargando historial...
                    </div>
                  ) : auditHistory.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No hay registros de auditorías previas
                    </div>
                  ) : (
                    auditHistory.map((audit) => (
                      <div key={audit.id} className="grid grid-cols-7 gap-2 p-4 hover:bg-muted/20">
                        <div className="col-span-1">{audit.location}</div>
                        <div className="col-span-1">{audit.date}</div>
                        <div className="col-span-1">{audit.user_name}</div>
                        <div className="col-span-1 text-center">{audit.items_count}</div>
                        <div className={`col-span-1 text-center font-medium ${
                          audit.discrepancies > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {audit.discrepancies}
                        </div>
                        <div className="col-span-2 text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(audit.id)}>
                            Ver Detalles
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteAudit(audit.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </MotionContainer>
      </div>
      
      {/* Audit Detail Dialog */}
      <AuditDetailComponent 
        audit={selectedAudit}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </Layout>
  );
};

export default Audit;
