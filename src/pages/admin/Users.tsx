
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search,
  Edit,
  Trash2,
  User,
  Shield,
  MapPin
} from 'lucide-react';

// Mock data for users
const users = [
  { 
    id: 1, 
    name: 'Maria Gonzalez', 
    email: 'maria@example.com',
    role: 'admin',
    location: 'CDMX',
    last_active: '2023-06-01 09:45'
  },
  { 
    id: 2, 
    name: 'Carlos Rodriguez', 
    email: 'carlos@example.com',
    role: 'ops',
    location: 'Monterrey',
    last_active: '2023-06-01 10:30'
  },
  { 
    id: 3, 
    name: 'Juan Perez', 
    email: 'juan@example.com',
    role: 'ops',
    location: 'Guadalajara',
    last_active: '2023-05-31 14:15'
  },
  { 
    id: 4, 
    name: 'Ana Lopez', 
    email: 'ana@example.com',
    role: 'ops',
    location: 'Culiacán',
    last_active: '2023-05-31 16:45'
  },
  { 
    id: 5, 
    name: 'Diego Martinez', 
    email: 'diego@example.com',
    role: 'viewer',
    location: 'CDMX',
    last_active: '2023-05-30 11:20'
  },
  { 
    id: 6, 
    name: 'Laura Blanco', 
    email: 'laura@example.com',
    role: 'viewer',
    location: 'Monterrey',
    last_active: '2023-05-29 09:10'
  },
];

const AdminUsers = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'primary';
      case 'ops': return 'success';
      default: return 'secondary';
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
                placeholder="Search users..." 
                className="pl-9 subtle-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add User
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
                header: 'Name',
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
                header: 'Role',
                cell: (user) => (
                  <div className="flex items-center">
                    <Shield className="h-3 w-3 mr-1 text-muted-foreground" />
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                )
              },
              { 
                key: 'location', 
                header: 'Location',
                cell: (user) => (
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                    {user.location}
                  </div>
                )
              },
              { 
                key: 'last_active', 
                header: 'Last Active',
                cell: (user) => (
                  <div className="text-muted-foreground text-sm">
                    {user.last_active}
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
    </Layout>
  );
};

export default AdminUsers;
