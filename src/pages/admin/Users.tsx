import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search,
  Edit,
  Trash2,
  User,
  Shield,
  MapPin,
  Bell
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AddUserDialog from '@/components/admin/AddUserDialog';

// Mock data for users
const users = [
  { 
    id: 1, 
    name: 'Maria Gonzalez', 
    email: 'maria@example.com',
    role: 'admin',
    location: 'CDMX',
    receiveAlerts: true
  },
  { 
    id: 2, 
    name: 'Carlos Rodriguez', 
    email: 'carlos@example.com',
    role: 'ops',
    location: 'Monterrey',
    receiveAlerts: true
  },
  { 
    id: 3, 
    name: 'Juan Perez', 
    email: 'juan@example.com',
    role: 'ops',
    location: 'Guadalajara',
    receiveAlerts: false
  },
  { 
    id: 4, 
    name: 'Ana Lopez', 
    email: 'ana@example.com',
    role: 'ops',
    location: 'Culiacán',
    receiveAlerts: true
  },
  { 
    id: 5, 
    name: 'Diego Martinez', 
    email: 'diego@example.com',
    role: 'viewer',
    location: 'CDMX',
    receiveAlerts: false
  },
  { 
    id: 6, 
    name: 'Laura Blanco', 
    email: 'laura@example.com',
    role: 'viewer',
    location: 'Monterrey',
    receiveAlerts: false
  },
];

const AdminUsers = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [nextUserId, setNextUserId] = useState(7); // For mock data ID generation
  
  // Get unique locations for dropdown
  const locations = Array.from(new Set(users.map(user => user.location)));
  
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
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.location.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery]);

  const handleToggleAlerts = (userId: number) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, receiveAlerts: !user.receiveAlerts } 
        : user
    );
    
    // Update both users array and filtered users
    Object.assign(users, updatedUsers);
    setFilteredUsers(
      searchQuery.trim() === '' 
        ? updatedUsers 
        : updatedUsers.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.location.toLowerCase().includes(searchQuery.toLowerCase())
          )
    );
    
    // Show toast notification
    const user = users.find(user => user.id === userId);
    if (user) {
      const newState = !user.receiveAlerts;
      toast({
        title: "Preferencia actualizada",
        description: `${user.name} ${newState ? 'recibirá' : 'no recibirá'} alertas de stock bajo`,
      });
    }
  };

  const handleAddUser = (userData: {
    name: string;
    email: string;
    role: string;
    location: string;
    receiveAlerts: boolean;
  }) => {
    // Create new user with generated ID
    const newUser = {
      id: nextUserId,
      ...userData
    };
    
    // Add to users array
    users.push(newUser);
    
    // Update filtered users
    if (searchQuery.trim() === '') {
      setFilteredUsers([...users]);
    } else {
      setFilteredUsers(users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    }
    
    // Increment next ID
    setNextUserId(nextUserId + 1);
    
    // Show success message
    toast({
      title: "Usuario añadido",
      description: `${userData.name} ha sido añadido exitosamente.`
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'ops': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Layout title="User Management">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar usuarios..." 
                className="pl-9 subtle-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setIsAddUserDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Usuario
              </Button>
            </div>
          </div>
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <DataTable 
            data={filteredUsers}
            columns={[
              { 
                key: 'name', 
                header: 'Nombre',
                cell: (user) => (
                  <div className="font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    {user.name}
                  </div>
                )
              },
              { key: 'email', header: 'Email' },
              { 
                key: 'role', 
                header: 'Rol',
                cell: (user) => (
                  <div className="flex items-center">
                    <Shield className="h-3 w-3 mr-1 text-muted-foreground" />
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role === 'admin' ? 'Admin' : 
                       user.role === 'ops' ? 'Operador' : 
                       'Visualizador'}
                    </Badge>
                  </div>
                )
              },
              { 
                key: 'location', 
                header: 'Ubicación',
                cell: (user) => (
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                    {user.location}
                  </div>
                )
              },
              { 
                key: 'receiveAlerts', 
                header: 'Recibir Alertas',
                cell: (user) => (
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={user.receiveAlerts} 
                      onCheckedChange={() => handleToggleAlerts(user.id)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {user.receiveAlerts ? 'Activado' : 'Desactivado'}
                    </span>
                    <Bell className="h-3 w-3 text-muted-foreground" />
                  </div>
                )
              },
              { 
                key: 'actions', 
                header: '',
                cell: (user) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
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
      
      {/* Add User Dialog */}
      <AddUserDialog 
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        onAddUser={handleAddUser}
        locations={locations}
      />
    </Layout>
  );
};

export default AdminUsers;
