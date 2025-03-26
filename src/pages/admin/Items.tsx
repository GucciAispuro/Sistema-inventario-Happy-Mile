
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
  Filter,
  Edit,
  Trash2
} from 'lucide-react';

// Updated mock data for items in Spanish
const items = [
  { id: 1, name: 'Silla de Oficina', category: 'Mobiliario', description: 'Silla de oficina ergonómica con altura ajustable', min_stock: 5, lead_time: 14, unit: 'piezas' },
  { id: 2, name: 'Papel de Impresora', category: 'Suministros de Oficina', description: 'Papel tamaño A4 para impresora, 500 hojas por paquete', min_stock: 10, lead_time: 7, unit: 'paquetes' },
  { id: 3, name: 'Laptop', category: 'Electrónicos', description: 'Laptop empresarial con procesador i5, 8GB RAM, SSD de 256GB', min_stock: 3, lead_time: 21, unit: 'piezas' },
  { id: 4, name: 'Llanta de Repuesto', category: 'Piezas de Vehículo', description: 'Llanta de repuesto estándar para vehículos de la empresa', min_stock: 8, lead_time: 10, unit: 'piezas' },
  { id: 5, name: 'Chaleco de Seguridad', category: 'Equipo de Seguridad', description: 'Chaleco de seguridad de alta visibilidad con tiras reflectantes', min_stock: 5, lead_time: 5, unit: 'piezas' },
  { id: 6, name: 'Tóner de Impresora', category: 'Suministros de Oficina', description: 'Cartucho de tóner compatible con impresoras de oficina', min_stock: 2, lead_time: 7, unit: 'piezas' },
  { id: 7, name: 'Kit de Primeros Auxilios', category: 'Equipo de Seguridad', description: 'Kit de primeros auxilios estándar para uso de emergencia', min_stock: 5, lead_time: 7, unit: 'kits' },
  { id: 8, name: 'Lámpara de Escritorio', category: 'Mobiliario', description: 'Lámpara de escritorio LED con brillo ajustable', min_stock: 3, lead_time: 7, unit: 'piezas' },
];

const AdminItems = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  
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
    if (searchQuery.trim() === '' && categoryFilter === '') {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(item => {
        const matchesSearch = query === '' ? true : 
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query);
        
        const matchesCategory = categoryFilter === '' ? true : 
          item.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
      });
      setFilteredItems(filtered);
    }
  }, [searchQuery, categoryFilter]);

  const handleAddItem = () => {
    // En una implementación real, esto abriría un modal o navegaría a un formulario
    toast({
      title: "Añadir Artículo",
      description: "Esta funcionalidad estará disponible próximamente.",
    });
  };

  const handleEdit = (item) => {
    toast({
      title: "Editar Artículo",
      description: `Editando: ${item.name}`,
    });
  };

  const handleDelete = (item) => {
    toast({
      title: "Eliminar Artículo",
      description: `¿Está seguro que desea eliminar ${item.name}?`,
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(items.map(item => item.category)));

  return (
    <Layout title="Gestión de Artículos">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar artículos..." 
                className="pl-9 subtle-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              
              <Button size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Artículo
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-card rounded-md border">
              <h3 className="font-medium mb-2">Filtros</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Categoría</label>
                  <select 
                    className="w-full p-2 rounded-md border"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <DataTable 
            data={filteredItems}
            columns={[
              { key: 'name', header: 'Nombre del Artículo' },
              { key: 'category', header: 'Categoría' },
              { 
                key: 'description', 
                header: 'Descripción',
                cell: (item) => (
                  <div className="max-w-[250px] truncate text-muted-foreground">
                    {item.description}
                  </div>
                )
              },
              { 
                key: 'min_stock', 
                header: 'Stock Mínimo',
                cell: (item) => (
                  <div className="font-medium">{item.min_stock}</div>
                )
              },
              { 
                key: 'lead_time', 
                header: 'Tiempo de Entrega',
                cell: (item) => (
                  <div>{item.lead_time} días</div>
                )
              },
              { key: 'unit', header: 'Unidad' },
              { 
                key: 'actions', 
                header: '',
                cell: (item) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item)}>
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
    </Layout>
  );
};

export default AdminItems;
