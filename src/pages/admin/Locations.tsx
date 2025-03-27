
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Type definition for location
type Location = {
  id: string;
  name: string;
  address?: string;
  items_count?: number;
  manager?: string;
  total_value?: number;
};

// Lista de managers para seleccionar
const availableManagers = [
  'Maria Gonzalez',
  'Carlos Rodriguez',
  'Juan Perez',
  'Ana Lopez',
  'Luis Hernandez',
  'Sofia Ramirez',
  'Miguel Torres'
];

const AdminLocations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [totalOverallValue, setTotalOverallValue] = useState(0);
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false);
  const [showEditLocationDialog, setShowEditLocationDialog] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    manager: ''
  });
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  
  // Fetch locations from Supabase
  const { 
    data: allLocations = [], 
    isLoading,
    refetch: refetchLocations
  } = useQuery<Location[]>({
    queryKey: ['admin-locations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, name');
        
        if (error) {
          toast({
            title: 'Error al cargar ubicaciones',
            description: error.message,
            variant: 'destructive'
          });
          throw error;
        }
        
        // Transform data to include additional fields (temporary solution)
        // In a real app, these would come from proper relational queries
        return data.map(location => ({
          ...location,
          address: location.name === 'CDMX' ? 'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940 Ciudad de México, CDMX' :
                  location.name === 'Oficina Central' ? 'Av. Lázaro Cárdenas 2424, Residencial San Agustín, San Pedro Garza García, N.L.' :
                  location.name === 'Almacén Principal' ? 'Av. Adolfo López Mateos Sur 2077, Jardines Plaza del Sol, 44510 Guadalajara, Jal.' :
                  'Blvd. Pedro Infante 2150, Desarrollo Urbano Tres Ríos, 80020 Culiacán, Sin.',
          items_count: Math.floor(Math.random() * 50) + 10,
          manager: availableManagers[Math.floor(Math.random() * availableManagers.length)],
          total_value: Math.floor(Math.random() * 200000) + 50000
        }));
      } catch (err) {
        console.error('Error fetching locations:', err);
        return [];
      }
    }
  });
  
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
      setFilteredLocations(allLocations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allLocations.filter(location => 
        location.name.toLowerCase().includes(query) ||
        (location.address && location.address.toLowerCase().includes(query)) ||
        (location.manager && location.manager.toLowerCase().includes(query))
      );
      setFilteredLocations(filtered);
    }
    
    // Calculate total overall value
    const total = allLocations.reduce((sum, location) => sum + (location.total_value || 0), 0);
    setTotalOverallValue(total);
  }, [searchQuery, allLocations]);

  const handleAddLocation = () => {
    setShowAddLocationDialog(true);
  };

  const handleEditLocation = (location: Location) => {
    setCurrentLocation(location);
    setShowEditLocationDialog(true);
  };

  const handleSaveLocation = async () => {
    // Validación básica
    if (!newLocation.name) {
      toast({
        title: "Error",
        description: "El nombre de la ubicación es obligatorio",
        variant: "destructive"
      });
      return;
    }

    try {
      // Insert location into Supabase
      const { data, error } = await supabase
        .from('locations')
        .insert({ name: newLocation.name })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Mostrar notificación de éxito
      toast({
        title: "Ubicación añadida",
        description: `Se ha añadido ${newLocation.name} correctamente`,
      });

      // Cerrar diálogo y resetear formulario
      setShowAddLocationDialog(false);
      setNewLocation({
        name: '',
        address: '',
        manager: ''
      });

      // Refetch locations
      refetchLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al añadir la ubicación",
        variant: "destructive"
      });
    }
  };

  const handleUpdateLocation = async () => {
    if (!currentLocation) return;

    // Validación básica
    if (!currentLocation.name) {
      toast({
        title: "Error",
        description: "El nombre de la ubicación es obligatorio",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update location in Supabase
      const { error } = await supabase
        .from('locations')
        .update({ name: currentLocation.name })
        .eq('id', currentLocation.id);

      if (error) {
        throw error;
      }
      
      // Mostrar notificación de éxito
      toast({
        title: "Ubicación actualizada",
        description: `Se ha actualizado ${currentLocation.name} correctamente`,
      });

      // Cerrar diálogo
      setShowEditLocationDialog(false);
      
      // Refetch locations
      refetchLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la ubicación",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    // Verificar si hay artículos en la ubicación
    const locationToDelete = allLocations.find(loc => loc.id === locationId);
    
    if (locationToDelete && locationToDelete.items_count && locationToDelete.items_count > 0) {
      toast({
        title: "No se puede eliminar",
        description: "Esta ubicación contiene artículos. Traslade los artículos primero.",
        variant: "destructive"
      });
      return;
    }

    // Confirmar eliminación
    if (confirm(`¿Está seguro que desea eliminar la ubicación ${locationToDelete?.name}?`)) {
      try {
        // Delete location from Supabase
        const { error } = await supabase
          .from('locations')
          .delete()
          .eq('id', locationId);

        if (error) {
          throw error;
        }
        
        toast({
          title: "Ubicación eliminada",
          description: `Se ha eliminado la ubicación correctamente`,
        });
        
        // Refetch locations
        refetchLocations();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error al eliminar la ubicación",
          variant: "destructive"
        });
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <Layout title="Gestión de Ubicaciones">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar ubicaciones..." 
                className="pl-9 subtle-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-secondary/80 px-3 py-1.5 rounded-md flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                <span className="text-sm font-medium">
                  Valor Total: {formatCurrency(totalOverallValue)}
                </span>
              </div>
              <Button size="sm" onClick={handleAddLocation}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Ubicación
              </Button>
            </div>
          </div>
        </MotionContainer>
        
        <MotionContainer delay={100}>
          {isLoading ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">Cargando ubicaciones...</p>
            </div>
          ) : (
            <DataTable 
              data={filteredLocations}
              columns={[
                { 
                  key: 'name', 
                  header: 'Nombre',
                  cell: (location) => (
                    <div className="font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {location.name}
                    </div>
                  )
                },
                { 
                  key: 'address', 
                  header: 'Dirección',
                  cell: (location) => (
                    <div className="max-w-[300px] truncate text-muted-foreground">
                      {location.address}
                    </div>
                  )
                },
                { 
                  key: 'items_count', 
                  header: 'Cant. Artículos',
                  cell: (location) => (
                    <div className="font-medium">{location.items_count}</div>
                  )
                },
                { 
                  key: 'total_value', 
                  header: 'Valor Total',
                  cell: (location) => (
                    <div className="font-medium text-green-700">
                      {location.total_value ? formatCurrency(location.total_value) : '$0.00'}
                    </div>
                  )
                },
                { 
                  key: 'manager', 
                  header: 'Administrador',
                  cell: (location) => (
                    <div>{location.manager}</div>
                  )
                },
                { 
                  key: 'actions', 
                  header: '',
                  cell: (location) => (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditLocation(location)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteLocation(location.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  )
                },
              ]}
            />
          )}
        </MotionContainer>
      </div>

      {/* Dialog para añadir ubicación */}
      <Dialog open={showAddLocationDialog} onOpenChange={setShowAddLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Nueva Ubicación</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="location-name">Nombre de la ubicación</Label>
              <Input 
                id="location-name" 
                value={newLocation.name}
                onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                placeholder="Ej. Sucursal Norte"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location-address">Dirección</Label>
              <Input 
                id="location-address" 
                value={newLocation.address}
                onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                placeholder="Dirección completa"
                disabled={true}
              />
              <p className="text-xs text-muted-foreground">La dirección se configurará después de crear la ubicación</p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location-manager">Administrador</Label>
              <select 
                id="location-manager"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newLocation.manager}
                onChange={(e) => setNewLocation({...newLocation, manager: e.target.value})}
                disabled={true}
              >
                <option value="">Seleccionar administrador</option>
                {availableManagers.map((manager) => (
                  <option key={manager} value={manager}>{manager}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">El administrador se asignará después de crear la ubicación</p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSaveLocation}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar ubicación */}
      <Dialog open={showEditLocationDialog} onOpenChange={setShowEditLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ubicación</DialogTitle>
          </DialogHeader>
          
          {currentLocation && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-location-name">Nombre de la ubicación</Label>
                <Input 
                  id="edit-location-name" 
                  value={currentLocation.name}
                  onChange={(e) => setCurrentLocation({...currentLocation, name: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-location-address">Dirección</Label>
                <Input 
                  id="edit-location-address" 
                  value={currentLocation.address}
                  onChange={(e) => setCurrentLocation({...currentLocation, address: e.target.value})}
                  disabled={true}
                />
                <p className="text-xs text-muted-foreground">La dirección se configurará en una actualización futura</p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-location-manager">Administrador</Label>
                <select 
                  id="edit-location-manager"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={currentLocation.manager}
                  onChange={(e) => setCurrentLocation({...currentLocation, manager: e.target.value})}
                  disabled={true}
                >
                  <option value="">Seleccionar administrador</option>
                  {availableManagers.map((manager) => (
                    <option key={manager} value={manager}>{manager}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">El administrador se configurará en una actualización futura</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleUpdateLocation}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminLocations;
