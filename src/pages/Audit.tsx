
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Search,
  MapPin,
  Save,
  ClipboardCheck,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogClose 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data for inventory items by location
const inventoryItems = [
  { id: 1, name: 'Silla de Oficina', category: 'Mobiliario', location: 'CDMX', system_quantity: 15, actual_quantity: null, difference: null, last_audit: '2023-05-15' },
  { id: 2, name: 'Papel para Impresora', category: 'Material de Oficina', location: 'CDMX', system_quantity: 8, actual_quantity: null, difference: null, last_audit: '2023-05-10' },
  { id: 3, name: 'Laptop', category: 'Electrónicos', location: 'CDMX', system_quantity: 12, actual_quantity: null, difference: null, last_audit: '2023-06-01' },
  { id: 4, name: 'Silla de Oficina', category: 'Mobiliario', location: 'Monterrey', system_quantity: 7, actual_quantity: null, difference: null, last_audit: '2023-04-22' },
  { id: 5, name: 'Papel para Impresora', category: 'Material de Oficina', location: 'Monterrey', system_quantity: 3, actual_quantity: null, difference: null, last_audit: '2023-04-20' },
  { id: 6, name: 'Llanta de Repuesto', category: 'Piezas de Vehículo', location: 'Guadalajara', system_quantity: 5, actual_quantity: null, difference: null, last_audit: '2023-05-28' },
  { id: 7, name: 'Chaleco de Seguridad', category: 'Equipo de Seguridad', location: 'Culiacán', system_quantity: 4, actual_quantity: null, difference: null, last_audit: '2023-06-02' },
  { id: 8, name: 'Tóner para Impresora', category: 'Material de Oficina', location: 'Guadalajara', system_quantity: 9, actual_quantity: null, difference: null, last_audit: '2023-05-19' },
  { id: 9, name: 'Kit de Primeros Auxilios', category: 'Equipo de Seguridad', location: 'CDMX', system_quantity: 12, actual_quantity: null, difference: null, last_audit: '2023-05-30' },
  { id: 10, name: 'Lámpara de Escritorio', category: 'Mobiliario', location: 'Culiacán', system_quantity: 6, actual_quantity: null, difference: null, last_audit: '2023-06-01' },
];

// Get unique locations
const locations = Array.from(new Set(inventoryItems.map(item => item.location)));

// Interfaces for our data
interface AuditItem {
  id: number;
  name: string;
  category: string;
  location: string;
  system_quantity: number;
  actual_quantity: number | null;
  difference: number | null;
  last_audit?: string; // Make this optional
}

interface DatabaseAuditItem {
  id: string;
  audit_id: string;
  name: string;
  category: string;
  location: string;
  system_quantity: number;
  actual_quantity: number;
  difference: number;
  created_at: string | null;
}

interface AuditHistory {
  id: string;
  location: string;
  date: string;
  user_name: string; // Changed from 'user' to 'user_name' to match database
  items_count: number;
  discrepancies: number;
  items?: AuditItem[] | DatabaseAuditItem[];
  created_at?: string;
}

const Audit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [auditHistory, setAuditHistory] = useState<AuditHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditHistory | null>(null);
  const [deletingAudit, setDeletingAudit] = useState<AuditHistory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
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

    // Load audit history when component mounts
    loadAuditHistory();
  }, [navigate]);
  
  // Load audit history from Supabase
  const loadAuditHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading audit history:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el historial de auditorías',
          variant: 'destructive'
        });
        return;
      }

      setAuditHistory(data || []);
    } catch (err) {
      console.error('Error in loadAuditHistory:', err);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al cargar el historial',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (selectedLocation) {
      // Filter items by selected location
      const locationItems = inventoryItems.filter(item => 
        item.location === selectedLocation
      );
      
      // Apply search filter if needed
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const filtered = locationItems.filter(item => 
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
        setAuditItems(filtered);
      } else {
        setAuditItems(locationItems);
      }
    } else {
      setAuditItems([]);
    }
  }, [selectedLocation, searchQuery]);

  // Update individual item quantity
  const handleQuantityChange = (id: number, value: string) => {
    const actualQuantity = value === '' ? null : parseInt(value);
    setAuditItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const difference = actualQuantity !== null ? actualQuantity - item.system_quantity : null;
          return { ...item, actual_quantity: actualQuantity, difference };
        }
        return item;
      })
    );
  };

  // Save audit to Supabase
  const handleSaveAudit = async () => {
    // Check if all items have been counted
    const uncountedItems = auditItems.filter(item => item.actual_quantity === null);
    if (uncountedItems.length > 0) {
      toast({
        title: "Auditoría incompleta",
        description: "Por favor ingrese la cantidad real de todos los artículos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get current user info
      const userName = localStorage.getItem('userName') || 'Usuario';
      
      // Create the audit record
      const auditData = {
        location: selectedLocation,
        date: new Date().toISOString().substring(0, 10),
        user_name: userName, // Changed from 'user' to 'user_name'
        items_count: auditItems.length,
        discrepancies: auditItems.filter(item => item.difference !== 0).length,
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('audits')
        .insert(auditData)
        .select();
      
      if (error) {
        console.error('Error saving audit:', error);
        throw error;
      }
      
      // Now insert each audit item
      if (data && data.length > 0) {
        const auditId = data[0].id;
        
        const auditItemsData = auditItems.map(item => ({
          audit_id: auditId,
          name: item.name,
          category: item.category,
          location: item.location,
          system_quantity: item.system_quantity,
          actual_quantity: item.actual_quantity || 0,
          difference: item.difference || 0
        }));
        
        const { error: itemsError } = await supabase
          .from('audit_items')
          .insert(auditItemsData);
        
        if (itemsError) {
          console.error('Error saving audit items:', itemsError);
          throw itemsError;
        }
      }
      
      toast({
        title: "Auditoría guardada",
        description: `Se ha guardado la auditoría de ${selectedLocation} correctamente`,
      });
      
      // Reset form and refresh history
      resetAuditForm();
      loadAuditHistory();
      setActiveTab("history");
      
    } catch (err) {
      console.error('Error in save audit:', err);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la auditoría. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAuditForm = () => {
    setSelectedLocation('');
    setAuditItems([]);
    setSearchQuery('');
  };

  // Delete audit and revert inventory changes
  const handleDeleteAudit = async () => {
    if (!deletingAudit) return;
    
    setIsDeleting(true);
    try {
      // First, load the audit items if not already loaded
      let auditItemsToRevert = deletingAudit.items;
      
      if (!auditItemsToRevert || auditItemsToRevert.length === 0) {
        const { data, error } = await supabase
          .from('audit_items')
          .select('*')
          .eq('audit_id', deletingAudit.id);
        
        if (error) {
          console.error('Error loading audit items for deletion:', error);
          throw error;
        }
        
        auditItemsToRevert = data;
      }
      
      // For each audit item, update the inventory to reverse the changes
      if (auditItemsToRevert && auditItemsToRevert.length > 0) {
        for (const item of auditItemsToRevert) {
          // Check if the item exists in inventory
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('inventory')
            .select('*')
            .eq('name', item.name)
            .eq('location', item.location)
            .single();
          
          if (inventoryError && inventoryError.code !== 'PGRST116') {
            console.error('Error checking inventory for item:', inventoryError);
            continue;
          }
          
          // If the item exists, revert the quantity change
          if (inventoryData) {
            // Calculate the original quantity before the audit
            // For this we revert the difference: current quantity - difference = original quantity
            const originalQuantity = item.actual_quantity - (item.difference || 0);
            
            const { error: updateError } = await supabase
              .from('inventory')
              .update({ quantity: originalQuantity })
              .eq('id', inventoryData.id);
            
            if (updateError) {
              console.error('Error reverting inventory quantity:', updateError);
              // Continue with other items even if one fails
            }
          }
        }
      }
      
      // Now delete the audit items
      const { error: deleteItemsError } = await supabase
        .from('audit_items')
        .delete()
        .eq('audit_id', deletingAudit.id);
      
      if (deleteItemsError) {
        console.error('Error deleting audit items:', deleteItemsError);
        throw deleteItemsError;
      }
      
      // Finally delete the audit
      const { error: deleteAuditError } = await supabase
        .from('audits')
        .delete()
        .eq('id', deletingAudit.id);
      
      if (deleteAuditError) {
        console.error('Error deleting audit:', deleteAuditError);
        throw deleteAuditError;
      }
      
      toast({
        title: 'Auditoría eliminada',
        description: 'La auditoría y sus cambios en el inventario han sido revertidos',
      });
      
      // Refresh the audit history
      loadAuditHistory();
      setDeletingAudit(null);
      
    } catch (err) {
      console.error('Error in delete audit:', err);
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar la auditoría. Intente nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // View audit details
  const handleViewDetails = async (audit: AuditHistory) => {
    setLoading(true);
    try {
      // If the audit already has items loaded, use them
      if (audit.items && audit.items.length > 0) {
        setSelectedAudit(audit);
        setDetailsOpen(true);
        return;
      }
      
      // Otherwise, load the items from Supabase
      const { data, error } = await supabase
        .from('audit_items')
        .select('*')
        .eq('audit_id', audit.id);
      
      if (error) {
        console.error('Error loading audit items:', error);
        throw error;
      }
      
      const auditWithItems = { ...audit, items: data || [] };
      setSelectedAudit(auditWithItems);
      setDetailsOpen(true);
      
    } catch (err) {
      console.error('Error loading audit details:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la auditoría",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Auditoría de Inventario">
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">Auditoría Pendiente</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        {/* Pestaña de Auditoría Pendiente */}
        <TabsContent value="pending" className="space-y-6">
          <MotionContainer>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <label className="text-sm font-medium mb-2 block">Seleccionar Ubicación a Auditar</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Seleccionar ubicación" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedLocation && (
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar artículos..." 
                    className="pl-9 subtle-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>
          </MotionContainer>
          
          {selectedLocation && (
            <>
              <MotionContainer delay={100}>
                <DataTable 
                  data={auditItems}
                  columns={[
                    { key: 'name', header: 'Nombre del Artículo' },
                    { key: 'category', header: 'Categoría' },
                    { 
                      key: 'system_quantity', 
                      header: 'Cantidad en Sistema',
                      cell: (item) => (
                        <div className="font-medium">{item.system_quantity}</div>
                      )
                    },
                    { 
                      key: 'actual_quantity', 
                      header: 'Cantidad Real',
                      cell: (item) => (
                        <Input 
                          type="number" 
                          className="w-20" 
                          min="0"
                          value={item.actual_quantity === null ? '' : item.actual_quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        />
                      )
                    },
                    { 
                      key: 'difference', 
                      header: 'Diferencia',
                      cell: (item) => {
                        if (item.difference === null) return null;
                        
                        const colorClass = item.difference < 0 
                          ? 'text-red-600' 
                          : (item.difference > 0 ? 'text-green-600' : 'text-gray-600');
                        
                        const prefix = item.difference > 0 ? '+' : '';
                        
                        return (
                          <div className={`font-medium ${colorClass}`}>
                            {prefix}{item.difference}
                          </div>
                        );
                      }
                    },
                    { 
                      key: 'last_audit', 
                      header: 'Última Auditoría',
                      cell: (item) => (
                        <div className="text-muted-foreground">{item.last_audit}</div>
                      )
                    },
                  ]}
                />
              </MotionContainer>

              <MotionContainer delay={200}>
                <div className="flex justify-end">
                  <Button onClick={handleSaveAudit} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar Auditoría'}
                  </Button>
                </div>
              </MotionContainer>
            </>
          )}

          {!selectedLocation && (
            <MotionContainer delay={100}>
              <div className="text-center py-12">
                <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Auditoría de Inventario</h3>
                <p className="text-muted-foreground">
                  Seleccione una ubicación para comenzar a auditar su inventario
                </p>
              </div>
            </MotionContainer>
          )}
        </TabsContent>

        {/* Pestaña de Historial */}
        <TabsContent value="history" className="space-y-6">
          <MotionContainer>
            <DataTable 
              data={auditHistory}
              loading={loading}
              columns={[
                { key: 'location', header: 'Ubicación' },
                { key: 'date', header: 'Fecha' },
                { key: 'user_name', header: 'Realizada por' }, // Changed from 'user' to 'user_name'
                { key: 'items_count', header: 'Artículos Auditados' },
                { 
                  key: 'discrepancies', 
                  header: 'Discrepancias',
                  cell: (item) => (
                    <div className={item.discrepancies > 0 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>
                      {item.discrepancies}
                    </div>
                  )
                },
                {
                  key: 'actions',
                  header: 'Acciones',
                  cell: (item) => (
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                        disabled={loading || isDeleting}
                      >
                        Ver Detalles
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        onClick={() => setDeletingAudit(item)}
                        disabled={loading || isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  )
                }
              ]}
              emptyState="No hay registros de auditorías previas"
            />
          </MotionContainer>
        </TabsContent>
      </Tabs>

      {/* Audit Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Auditoría</DialogTitle>
            <DialogDescription>
              {selectedAudit && (
                <div className="flex flex-wrap gap-4 text-sm mt-2">
                  <div>
                    <span className="font-medium">Ubicación:</span> {selectedAudit.location}
                  </div>
                  <div>
                    <span className="font-medium">Fecha:</span> {selectedAudit.date}
                  </div>
                  <div>
                    <span className="font-medium">Auditor:</span> {selectedAudit.user_name}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artículo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Cant. Sistema</TableHead>
                  <TableHead>Cant. Real</TableHead>
                  <TableHead>Diferencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedAudit?.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.system_quantity}</TableCell>
                    <TableCell>{item.actual_quantity}</TableCell>
                    <TableCell className={
                      item.difference === 0 ? 'text-gray-600' : 
                      item.difference && item.difference > 0 ? 'text-green-600' : 
                      'text-red-600'
                    }>
                      {item.difference !== null && item.difference > 0 ? `+${item.difference}` : item.difference}
                    </TableCell>
                  </TableRow>
                ))}
                {!selectedAudit?.items?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No hay detalles disponibles para esta auditoría
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Audit Confirmation Dialog */}
      <AlertDialog 
        open={!!deletingAudit} 
        onOpenChange={(open) => !open && setDeletingAudit(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta auditoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminará permanentemente la auditoría y 
              revertirá los cambios realizados en el inventario durante esta auditoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAudit}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Audit;
