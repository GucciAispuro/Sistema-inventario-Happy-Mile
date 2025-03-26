
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search,
  Filter,
  ArrowDown, 
  ArrowUp,
  Download,
  FileText,
  Clock,
  User
} from 'lucide-react';

// Mock data for transactions
const transactions = [
  { 
    id: 1, 
    item: 'Silla de Oficina', 
    category: 'Mobiliario',
    location: 'CDMX', 
    type: 'IN', 
    quantity: 5, 
    date: '2023-06-01', 
    user: 'María G.',
    notes: 'Entrega de nuevo stock',
    has_proof: true
  },
  { 
    id: 2, 
    item: 'Papel para Impresora', 
    category: 'Material de Oficina',
    location: 'Monterrey', 
    type: 'OUT', 
    quantity: 2, 
    date: '2023-05-31', 
    user: 'Carlos R.',
    notes: 'Requisición mensual',
    has_proof: true
  },
  { 
    id: 3, 
    item: 'Llanta de Repuesto', 
    category: 'Piezas de Vehículo',
    location: 'Guadalajara', 
    type: 'OUT', 
    quantity: 1, 
    date: '2023-05-30', 
    user: 'Juan P.',
    notes: 'Reemplazo de emergencia',
    has_proof: true
  },
  { 
    id: 4, 
    item: 'Laptop', 
    category: 'Electrónicos',
    location: 'CDMX', 
    type: 'IN', 
    quantity: 3, 
    date: '2023-05-29', 
    user: 'Ana L.',
    notes: 'Nuevo equipo para depto. de TI',
    has_proof: true
  },
  { 
    id: 5, 
    item: 'Tóner para Impresora', 
    category: 'Material de Oficina',
    location: 'Culiacán', 
    type: 'IN', 
    quantity: 10, 
    date: '2023-05-28', 
    user: 'Diego M.',
    notes: 'Reabastecimiento trimestral',
    has_proof: false
  },
  { 
    id: 6, 
    item: 'Chaleco de Seguridad', 
    category: 'Equipo de Seguridad',
    location: 'Monterrey', 
    type: 'OUT', 
    quantity: 2, 
    date: '2023-05-28', 
    user: 'Laura B.',
    notes: 'Requisitos para operaciones de campo',
    has_proof: true
  },
  { 
    id: 7, 
    item: 'Kit de Primeros Auxilios', 
    category: 'Equipo de Seguridad',
    location: 'Guadalajara', 
    type: 'OUT', 
    quantity: 1, 
    date: '2023-05-27', 
    user: 'Roberto S.',
    notes: 'Reemplazo de kit caducado',
    has_proof: true
  },
  { 
    id: 8, 
    item: 'Lámpara de Escritorio', 
    category: 'Mobiliario',
    location: 'CDMX', 
    type: 'IN', 
    quantity: 8, 
    date: '2023-05-26', 
    user: 'Sofía T.',
    notes: 'Proyecto de expansión de oficina',
    has_proof: true
  }
];

const Transactions = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  
  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Get user role
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, [navigate]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTransactions(transactions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = transactions.filter(transaction => 
        transaction.item.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query) ||
        transaction.location.toLowerCase().includes(query) ||
        transaction.user.toLowerCase().includes(query) ||
        transaction.notes.toLowerCase().includes(query)
      );
      setFilteredTransactions(filtered);
    }
  }, [searchQuery]);

  return (
    <Layout title="Transacciones">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar transacciones..." 
                className="pl-9 subtle-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Transacción
              </Button>
            </div>
          </div>
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <DataTable 
            data={filteredTransactions}
            columns={[
              { key: 'item', header: 'Artículo' },
              { key: 'location', header: 'Ubicación' },
              { 
                key: 'type', 
                header: 'Tipo',
                cell: (transaction) => (
                  <div className="flex items-center">
                    {transaction.type === 'IN' ? (
                      <>
                        <ArrowDown className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">ENTRADA</span>
                      </>
                    ) : (
                      <>
                        <ArrowUp className="h-3 w-3 text-blue-600 mr-1" />
                        <span className="text-blue-600 font-medium">SALIDA</span>
                      </>
                    )}
                  </div>
                )
              },
              { 
                key: 'quantity', 
                header: 'Cant.',
                cell: (transaction) => (
                  <div className="font-medium">{transaction.quantity}</div>
                )
              },
              { 
                key: 'date', 
                header: 'Fecha',
                cell: (transaction) => (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {transaction.date}
                  </div>
                )
              },
              { 
                key: 'user', 
                header: 'Usuario',
                cell: (transaction) => (
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1 text-muted-foreground" />
                    {transaction.user}
                  </div>
                )
              },
              { 
                key: 'proof', 
                header: 'Comprobante',
                cell: (transaction) => (
                  transaction.has_proof ? (
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <FileText className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  ) : (
                    <span className="text-muted-foreground text-xs">Ninguno</span>
                  )
                )
              },
              { 
                key: 'notes', 
                header: 'Notas',
                cell: (transaction) => (
                  <div className="max-w-[200px] truncate text-muted-foreground">
                    {transaction.notes}
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

export default Transactions;
