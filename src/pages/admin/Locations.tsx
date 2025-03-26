
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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

// Mock data for locations
const locations = [
  { 
    id: 1, 
    name: 'CDMX', 
    address: 'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940 Ciudad de México, CDMX', 
    items_count: 45,
    manager: 'Maria Gonzalez',
    total_value: 208700
  },
  { 
    id: 2, 
    name: 'Monterrey', 
    address: 'Av. Lázaro Cárdenas 2424, Residencial San Agustín, San Pedro Garza García, N.L.', 
    items_count: 38,
    manager: 'Carlos Rodriguez',
    total_value: 156800
  },
  { 
    id: 3, 
    name: 'Guadalajara', 
    address: 'Av. Adolfo López Mateos Sur 2077, Jardines Plaza del Sol, 44510 Guadalajara, Jal.', 
    items_count: 32,
    manager: 'Juan Perez',
    total_value: 98500
  },
  { 
    id: 4, 
    name: 'Culiacán', 
    address: 'Blvd. Pedro Infante 2150, Desarrollo Urbano Tres Ríos, 80020 Culiacán, Sin.', 
    items_count: 29,
    manager: 'Ana Lopez',
    total_value: 76300
  },
];

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
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [totalOverallValue, setTotalOverallValue] = useState(0);
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false);
  const [showEditLocationDialog, setShowEditLocationDialog] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    manager: ''
  });
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  
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
      setFilteredLocations(locations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = locations.filter(location => 
        location.name.toLowerCase().includes(query) ||
        location.address.toLowerCase().includes(query) ||
        location.manager.toLowerCase().includes(query)
      );
      setFilteredLocations(filtered);
    }
    
    // Calculate total overall value
    const total = locations.reduce((sum, location) => sum + location.total_value, 0);
    setTotalOverallValue(total);
  }, [searchQuery]);

  const handleAddLocation = () => {
    setShowAddLocationDialog(true);
  };

  const handleEditLocation = (location: any) => {
    setCurrentLocation(location);
    setShowEditLocationDialog(true);
  };

  const handleSaveLocation = () => {
    // Validación básica
    if (!newLocation.name || !newLocation.address || !newLocation.manager) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Simular añadir la ubicación (en una app real, esto enviaría datos al backend)
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
  };

  const handleUpdateLocation = () => {
    if (!currentLocation) return;

    // Validación básica
    if (!currentLocation.name || !currentLocation.address || !currentLocation.manager) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Simular actualizar la ubicación (en una app real, esto enviaría datos al backend)
    toast({
      title: "Ubicación actualizada",
      description: `Se ha actualizado ${currentLocation.name} correctamente`,
    });

    // Cerrar diálogo
    setShowEditLocationDialog(false);
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
          <DataTable 
            data={filteredLocations}
            columns={[
              { 
                key: 'name', 
                header: 'Nombre de Ubicación',
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
                  <div className="font-medium text-green-700">{formatCurrency(location.total_value)}</div>
                )
              },
              { key: 'manager', header: 'Administrador' },
              { 
                key: 'actions', 
                header: '',
                cell: (location) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditLocation(location)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                )
              },
            ]}
          />
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
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location-manager">Administrador</Label>
              <select 
                id="location-manager"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newLocation.manager}
                onChange={(e) => setNewLocation({...newLocation, manager: e.target.value})}
              >
                <option value="">Seleccionar administrador</option>
                {availableManagers.map((manager) => (
                  <option key={manager} value={manager}>{manager}</option>
                ))}
              </select>
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
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-location-manager">Administrador</Label>
                <select 
                  id="edit-location-manager"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={currentLocation.manager}
                  onChange={(e) => setCurrentLocation({...currentLocation, manager: e.target.value})}
                >
                  <option value="">Seleccionar administrador</option>
                  {availableManagers.map((manager) => (
                    <option key={manager} value={manager}>{manager}</option>
                  ))}
                </select>
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
