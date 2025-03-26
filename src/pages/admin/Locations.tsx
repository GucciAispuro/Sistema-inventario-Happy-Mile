
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

const AdminLocations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [totalOverallValue, setTotalOverallValue] = useState(0);
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    manager: ''
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <Layout title="Location Management">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search locations..." 
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
                Add Location
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
                header: 'Location Name',
                cell: (location) => (
                  <div className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {location.name}
                  </div>
                )
              },
              { 
                key: 'address', 
                header: 'Address',
                cell: (location) => (
                  <div className="max-w-[300px] truncate text-muted-foreground">
                    {location.address}
                  </div>
                )
              },
              { 
                key: 'items_count', 
                header: 'Items Count',
                cell: (location) => (
                  <div className="font-medium">{location.items_count}</div>
                )
              },
              { 
                key: 'total_value', 
                header: 'Total Value',
                cell: (location) => (
                  <div className="font-medium text-green-700">{formatCurrency(location.total_value)}</div>
                )
              },
              { key: 'manager', header: 'Manager' },
              { 
                key: 'actions', 
                header: '',
                cell: (location) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
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
              <Input 
                id="location-manager" 
                value={newLocation.manager}
                onChange={(e) => setNewLocation({...newLocation, manager: e.target.value})}
                placeholder="Nombre del administrador"
              />
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
    </Layout>
  );
};

export default AdminLocations;
