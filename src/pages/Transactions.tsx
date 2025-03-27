
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
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
import { supabase } from '@/integrations/supabase/client';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

// Transactions type definition
type Transaction = {
  id: string;
  item: string;
  category: string;
  location: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  user_name: string;
  notes: string;
  has_proof: boolean;
};

const Transactions = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  // Fetch transactions
  const { 
    data: transactions = [], 
    isLoading, 
    error 
  } = useQuery<Transaction[]>({
    queryKey: ['transactions', searchQuery, filterCategory, filterType],
    queryFn: async () => {
      let query = supabase.from('transactions').select('*');

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `item.ilike.%${searchQuery}%,` +
          `category.ilike.%${searchQuery}%,` +
          `location.ilike.%${searchQuery}%,` +
          `user_name.ilike.%${searchQuery}%,` +
          `notes.ilike.%${searchQuery}%`
        );
      }

      // Apply category filter
      if (filterCategory) {
        query = query.eq('category', filterCategory);
      }

      // Apply type filter
      if (filterType) {
        query = query.eq('type', filterType);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Error fetching transactions',
          description: error.message,
          variant: 'destructive'
        });
        return [];
      }

      return data;
    }
  });

  // Unique categories for filter dropdown
  const categories = Array.from(new Set(transactions.map(t => t.category)));

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  // Export transactions to CSV
  const handleExport = () => {
    // Implement export logic
    toast({
      title: 'Export functionality coming soon!'
    });
  };

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
              <Select 
                value={filterCategory} 
                onValueChange={setFilterCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filterType} 
                onValueChange={setFilterType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de Transacción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">Entrada</SelectItem>
                  <SelectItem value="OUT">Salida</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setFilterCategory('');
                  setFilterType('');
                  setSearchQuery('');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
              >
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
            data={transactions}
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
                key: 'user_name', 
                header: 'Usuario',
                cell: (transaction) => (
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1 text-muted-foreground" />
                    {transaction.user_name}
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
                    {transaction.notes || 'Sin notas'}
                  </div>
                )
              },
            ]}
            loading={isLoading}
            emptyState="No hay transacciones encontradas"
          />
        </MotionContainer>
      </div>
    </Layout>
  );
};

export default Transactions;
