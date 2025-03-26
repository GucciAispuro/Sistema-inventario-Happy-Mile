
import { useState, useEffect } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState(title);
  
  // Update title based on current route if not provided
  useEffect(() => {
    if (title) return;
    
    const path = location.pathname;
    let newTitle = 'Dashboard';
    
    if (path.includes('/inventory')) newTitle = 'Inventario';
    else if (path.includes('/transactions')) newTitle = 'Transacciones';
    else if (path.includes('/admin/items')) newTitle = 'Gestión de Artículos';
    else if (path.includes('/admin/locations')) newTitle = 'Gestión de Ubicaciones';
    else if (path.includes('/admin/users')) newTitle = 'Gestión de Usuarios';
    else if (path.includes('/colaborador')) newTitle = 'Entrada y Salida';
    
    setPageTitle(newTitle);
  }, [location, title]);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-white/90">
      <div className="flex h-16 items-center px-6 gap-4">
        <div className="md:hidden">
          <SidebarTrigger>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Alternar menú</span>
            </Button>
          </SidebarTrigger>
        </div>
        
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
        
        <div className="flex-1" />
        
        <div className="hidden md:flex items-center relative max-w-sm">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar..." 
            className="pl-9 w-full subtle-input rounded-full"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"></span>
          <span className="sr-only">Notificaciones</span>
        </Button>
        
        <Button variant="ghost" className="rounded-full p-0 overflow-hidden h-9 w-9">
          <img 
            src="https://i.pravatar.cc/300" 
            alt="Avatar de usuario" 
            className="h-full w-full object-cover"
          />
        </Button>
      </div>
    </header>
  );
};

export default Header;
