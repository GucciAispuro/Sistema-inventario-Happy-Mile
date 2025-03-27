
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BoxesIcon,
  ArrowLeftRight,
  Settings,
  Package,
  Map,
  Users,
  LogOut,
  ClipboardCheck,
  FileCheck2,
  Bell
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import MotionContainer from '../ui/MotionContainer';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  
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
  ];

  return (
    <Sidebar className={isMobile ? "z-50" : ""}>
      <SidebarHeader className="p-4">
        <MotionContainer className="flex items-center gap-2">
          <div className="h-10 w-auto">
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
          <Link to="/" className="nav-link text-sidebar-foreground/70">
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Link>
        </MotionContainer>
      </SidebarFooter>
    </Sidebar>
  );
}
