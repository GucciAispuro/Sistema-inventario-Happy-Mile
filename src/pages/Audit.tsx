
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
  ClipboardCheck
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

const Audit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [auditItems, setAuditItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  
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

  // Save audit
  const handleSaveAudit = () => {
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

    // Generate mock history entry for the audit
    const historyEntry = {
      id: Date.now(),
      location: selectedLocation,
      date: new Date().toISOString().substring(0, 10),
      user: "Usuario Actual",
      items_count: auditItems.length,
      discrepancies: auditItems.filter(item => item.difference !== 0).length
    };
    
    // In a real app, we would send this data to the backend
    setAuditHistory(prev => [historyEntry, ...prev]);

    toast({
      title: "Auditoría guardada",
      description: `Se ha guardado la auditoría de ${selectedLocation} correctamente`,
    });

    // Reset form
    resetAuditForm();
  };

  const resetAuditForm = () => {
    setSelectedLocation('');
    setAuditItems([]);
    setSearchQuery('');
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
                  <Button onClick={handleSaveAudit}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Auditoría
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
              columns={[
                { key: 'location', header: 'Ubicación' },
                { key: 'date', header: 'Fecha' },
                { key: 'user', header: 'Realizada por' },
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
                  header: '',
                  cell: () => (
                    <Button variant="ghost" size="sm">
                      Ver Detalles
                    </Button>
                  )
                }
              ]}
            />
            {auditHistory.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay registros de auditorías previas</p>
              </div>
            )}
          </MotionContainer>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Audit;
