
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
    item: 'Office Chair', 
    category: 'Furniture',
    location: 'CDMX', 
    type: 'IN', 
    quantity: 5, 
    date: '2023-06-01', 
    user: 'Maria G.',
    notes: 'New stock delivery',
    has_proof: true
  },
  { 
    id: 2, 
    item: 'Printer Paper', 
    category: 'Office Supplies',
    location: 'Monterrey', 
    type: 'OUT', 
    quantity: 2, 
    date: '2023-05-31', 
    user: 'Carlos R.',
    notes: 'Monthly requisition',
    has_proof: true
  },
  { 
    id: 3, 
    item: 'Spare Tire', 
    category: 'Vehicle Parts',
    location: 'Guadalajara', 
    type: 'OUT', 
    quantity: 1, 
    date: '2023-05-30', 
    user: 'Juan P.',
    notes: 'Emergency replacement',
    has_proof: true
  },
  { 
    id: 4, 
    item: 'Laptop', 
    category: 'Electronics',
    location: 'CDMX', 
    type: 'IN', 
    quantity: 3, 
    date: '2023-05-29', 
    user: 'Ana L.',
    notes: 'New equipment for IT dept',
    has_proof: true
  },
  { 
    id: 5, 
    item: 'Printer Toner', 
    category: 'Office Supplies',
    location: 'Culiacán', 
    type: 'IN', 
    quantity: 10, 
    date: '2023-05-28', 
    user: 'Diego M.',
    notes: 'Quarterly supply restock',
    has_proof: false
  },
  { 
    id: 6, 
    item: 'Safety Vest', 
    category: 'Safety Equipment',
    location: 'Monterrey', 
    type: 'OUT', 
    quantity: 2, 
    date: '2023-05-28', 
    user: 'Laura B.',
    notes: 'Field operation requirements',
    has_proof: true
  },
  { 
    id: 7, 
    item: 'First Aid Kit', 
    category: 'Safety Equipment',
    location: 'Guadalajara', 
    type: 'OUT', 
    quantity: 1, 
    date: '2023-05-27', 
    user: 'Roberto S.',
    notes: 'Replacement for expired kit',
    has_proof: true
  },
  { 
    id: 8, 
    item: 'Desk Lamp', 
    category: 'Furniture',
    location: 'CDMX', 
    type: 'IN', 
    quantity: 8, 
    date: '2023-05-26', 
    user: 'Sofia T.',
    notes: 'Office expansion project',
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
    <Layout title="Transactions">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-9 subtle-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Transaction
              </Button>
            </div>
          </div>
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <DataTable 
            data={filteredTransactions}
            columns={[
              { key: 'item', header: 'Item' },
              { key: 'location', header: 'Location' },
              { 
                key: 'type', 
                header: 'Type',
                cell: (transaction) => (
                  <div className="flex items-center">
                    {transaction.type === 'IN' ? (
                      <>
                        <ArrowDown className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">IN</span>
                      </>
                    ) : (
                      <>
                        <ArrowUp className="h-3 w-3 text-blue-600 mr-1" />
                        <span className="text-blue-600 font-medium">OUT</span>
                      </>
                    )}
                  </div>
                )
              },
              { 
                key: 'quantity', 
                header: 'Qty',
                cell: (transaction) => (
                  <div className="font-medium">{transaction.quantity}</div>
                )
              },
              { 
                key: 'date', 
                header: 'Date',
                cell: (transaction) => (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {transaction.date}
                  </div>
                )
              },
              { 
                key: 'user', 
                header: 'User',
                cell: (transaction) => (
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1 text-muted-foreground" />
                    {transaction.user}
                  </div>
                )
              },
              { 
                key: 'proof', 
                header: 'Proof',
                cell: (transaction) => (
                  transaction.has_proof ? (
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <FileText className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  ) : (
                    <span className="text-muted-foreground text-xs">None</span>
                  )
                )
              },
              { 
                key: 'notes', 
                header: 'Notes',
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
