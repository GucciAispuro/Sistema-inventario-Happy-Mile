
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
import EditUserDialog from '@/components/admin/EditUserDialog';
import { supabase } from '@/integrations/supabase/client';

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  receiveAlerts: boolean;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
    fetchUsers();
  }, [navigate]);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching users from Supabase...");
      
      // Fetch users from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log("Users fetched successfully:", data);
      
      if (data) {
        // Transform data to match our User interface
        const transformedUsers = data.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          receiveAlerts: user.receive_alerts
        }));
        
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios. Intente de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
  }, [searchQuery, users]);

  const handleToggleAlerts = async (userId: string) => {
    try {
      // Find the user to toggle
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      const newAlertsValue = !user.receiveAlerts;
      
      console.log(`Toggling alerts for user ${userId} to ${newAlertsValue}`);
      
      // Update the user in Supabase
      const { error } = await supabase
        .from('users')
        .update({ receive_alerts: newAlertsValue })
        .eq('id', userId);
      
      if (error) {
        console.error('Error toggling alerts:', error);
        throw error;
      }
      
      console.log(`Successfully updated receive_alerts to ${newAlertsValue} for user ${userId}`);
      
      // Update local state
      const updatedUsers = users.map(u => 
        u.id === userId 
          ? { ...u, receiveAlerts: newAlertsValue } 
          : u
      );
      
      setUsers(updatedUsers);
      
      // Update filtered users if needed
      setFilteredUsers(
        searchQuery.trim() === '' 
          ? updatedUsers 
          : updatedUsers.filter(u => 
              u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.location.toLowerCase().includes(searchQuery.toLowerCase())
            )
      );
      
      // Show toast notification
      toast({
        title: "Preferencia actualizada",
        description: `${user.name} ${newAlertsValue ? 'recibirá' : 'no recibirá'} alertas de stock bajo`,
      });
    } catch (error) {
      console.error('Error toggling alerts:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la preferencia. Intente de nuevo.",
        variant: "destructive"
      });
    }
  };

  const handleAddUser = async (userData: {
    name: string;
    email: string;
    role: string;
    location: string;
    receiveAlerts: boolean;
  }) => {
    console.log("handleAddUser called with:", userData);
    
    try {
      // We'll fetch the newly inserted users to get the complete data with IDs
      await fetchUsers();
      
      // Show success message
      toast({
        title: "Usuario añadido",
        description: `${userData.name} ha sido añadido exitosamente.`
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir el usuario. Intente de nuevo.",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
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
                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
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
        locations={locations.length > 0 ? locations : ['CDMX', 'Monterrey', 'Guadalajara', 'Culiacán']}
      />
      
      {/* Edit User Dialog */}
      <EditUserDialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
        user={selectedUser}
        onUserUpdated={fetchUsers}
        locations={locations.length > 0 ? locations : ['CDMX', 'Monterrey', 'Guadalajara', 'Culiacán']}
      />
    </Layout>
  );
};

export default AdminUsers;
