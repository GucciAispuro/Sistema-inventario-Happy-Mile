
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
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import MotionContainer from '../ui/MotionContainer';

export function AppSidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const adminItems = [
    { icon: Package, label: 'Items', path: '/admin/items' },
    { icon: Map, label: 'Locations', path: '/admin/locations' },
    { icon: Users, label: 'Users', path: '/admin/users' },
  ];

  const mainItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BoxesIcon, label: 'Inventory', path: '/inventory' },
    { icon: ArrowLeftRight, label: 'Transactions', path: '/transactions' },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <MotionContainer className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <BoxesIcon className="h-5 w-5 text-white" />
          </div>
          <div className="font-semibold text-lg text-sidebar-foreground">
            RoadLogix
          </div>
        </MotionContainer>
      </SidebarHeader>
      
      <SidebarContent>
        <MotionContainer delay={100} className="px-3 py-2">
          <div className="space-y-1">
            <p className="text-sidebar-foreground/50 text-xs font-medium ml-3 mb-2">
              MAIN MENU
            </p>
            
            {mainItems.map((item, index) => (
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
              ADMINISTRATION
            </p>
            
            {adminItems.map((item, index) => (
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
            <span>Log Out</span>
          </Link>
        </MotionContainer>
      </SidebarFooter>
    </Sidebar>
  );
}
