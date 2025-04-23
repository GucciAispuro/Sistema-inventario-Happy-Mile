import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Dashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings,
  FileText,
  LogOut,
  AlertTriangle,
  Building,
  ClipboardList
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { supabase } from '@/integrations/supabase/client';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const location = localStorage.getItem('userLocation');
    setUserRole(role);
    setUserName(name);
    setUserLocation(location);
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userLocation');
    navigate('/');
  };

  const commonMenuItems = [
    {
      icon: <Dashboard className="h-4 w-4" />,
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      icon: <ShoppingBag className="h-4 w-4" />,
      label: 'Inventario',
      path: '/inventory'
    },
    {
      icon: <Package className="h-4 w-4" />,
      label: 'Transacciones',
      path: '/transactions'
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'Reportes',
      path: '/reports'
    }
  ];

  const adminMenuItems = [
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Usuarios',
      path: '/admin/users'
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: 'Auditorías',
      path: '/admin/audits'
    },
    {
      icon: <Building className="h-4 w-4" />,
      label: 'Ubicaciones',
      path: '/admin/locations'
    },
    {
      icon: <ClipboardList className="h-4 w-4" />,
      label: 'Artículos',
      path: '/admin/items'
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Activos Asignados',
      path: '/admin/assigned-assets'
    }
  ];

  const menuItems = userRole === 'admin' ? [...commonMenuItems, ...adminMenuItems] : commonMenuItems;

  return (
    <div
      className={`flex flex-col h-screen bg-gray-50 border-r border-gray-200 ${
        isExpanded ? 'w-64' : 'w-20'
      } transition-width duration-300`}
    >
      <div className="flex items-center justify-center h-16 shrink-0">
        <span className={`text-2xl font-bold ${isExpanded ? 'block' : 'hidden'}`}>
          Inventario
        </span>
      </div>
      <Separator />
      <nav className="flex-1 py-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.label} className="mb-1">
              <a
                href={item.path}
                className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 ${
                  location.pathname === item.path ? 'bg-gray-200 text-gray-900' : ''
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                <span className={`${isExpanded ? 'block' : 'hidden'}`}>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <Separator />
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 w-full justify-start">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium leading-none">{userName}</span>
                <span className="text-xs text-muted-foreground">{userLocation}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Sidebar;
