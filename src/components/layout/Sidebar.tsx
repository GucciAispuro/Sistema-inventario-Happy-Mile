
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BoxesIcon,
  ArrowLeftRight,
  Package,
  Map,
  Users,
  LogOut,
  ClipboardCheck,
  FileCheck2,
  Contact2,
  Truck,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import MotionContainer from '../ui/MotionContainer';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const adminItems = [
    { icon: Package, label: 'Artículos', path: '/admin/items' },
    { icon: Map, label: 'Ubicaciones', path: '/admin/locations' },
    { icon: Users, label: 'Usuarios', path: '/admin/users' },
  ];

  const mainItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BoxesIcon, label: 'Inventario', path: '/inventory' },
    { icon: ArrowLeftRight, label: 'Transacciones', path: '/transactions' },
    { icon: ClipboardCheck, label: 'Entrada y Salida', path: '/colaborador' },
    { icon: FileCheck2, label: 'Auditar', path: '/audit' },
    { icon: Truck, label: 'Control de Refacciones', path: '/part-receipts' },
    { icon: Contact2, label: 'Proveedores', path: '/suppliers' },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al cerrar sesión",
        variant: "destructive"
      });
    }
  };

  return (
    <Sidebar className={isMobile ? "z-50" : ""}>
      <SidebarHeader className="p-4">
        <MotionContainer className="flex items-center justify-center">
          <div className="h-30 w-auto">
            <img 
              src="/lovable-uploads/2c5878e5-7b09-4745-a10d-490c059a167d.png" 
              alt="Happy Mile Logo" 
              className="h-full w-auto object-contain"
            />
          </div>
        </MotionContainer>
      </SidebarHeader>
      
      <SidebarContent>
        <MotionContainer delay={100} className="px-3 py-2">
          <div className="space-y-1">
            <p className="text-sidebar-foreground/50 text-xs font-medium ml-3 mb-2">
              MENÚ PRINCIPAL
            </p>
            
            {mainItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </MotionContainer>
        
        <MotionContainer delay={200} className="mt-6 px-3 py-2">
          <div className="space-y-1">
            <p className="text-sidebar-foreground/50 text-xs font-medium ml-3 mb-2">
              ADMINISTRACIÓN
            </p>
            
            {adminItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </MotionContainer>
      </SidebarContent>
      
      <SidebarFooter className="px-3 py-4">
        <MotionContainer delay={300}>
          <button 
            onClick={handleLogout}
            className="nav-link text-sidebar-foreground/70 w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </MotionContainer>
      </SidebarFooter>
    </Sidebar>
  );
}
