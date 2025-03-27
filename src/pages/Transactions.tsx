
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

import Layout from '@/components/layout/Layout';
import MotionContainer from '@/components/ui/MotionContainer';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import TransactionsTable from '@/components/transactions/TransactionsTable';

// Define the Transaction type more accurately matching what's returned from Supabase
type Transaction = {
  id: string;
  item: string;
  category: string;
  location: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  user_name: string;
  notes: string | null;
  has_proof: boolean | null;
  proof_url?: string | null;
  created_at?: string;
  user_id?: string;
};

const Transactions = () => {
  console.log("Rendering Transactions page");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Query transactions from Supabase
  const { 
    data: transactions = [], 
    isLoading, 
    error,
    refetch
  } = useQuery<Transaction[]>({
    queryKey: ['transactions', searchQuery, filterCategory, filterType],
    queryFn: async () => {
      try {
        console.log("Fetching transactions with filters:", {
          searchQuery,
          filterCategory,
          filterType
        });

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

        // Apply category filter - only apply if not 'all'
        if (filterCategory && filterCategory !== 'all') {
          query = query.eq('category', filterCategory);
        }

        // Apply type filter - only apply if not 'all'
        if (filterType && filterType !== 'all') {
          query = query.eq('type', filterType);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error("Supabase query error:", error);
          toast({
            title: 'Error fetching transactions',
            description: error.message,
            variant: 'destructive'
          });
          throw error;
        }

        console.log('Transactions fetched:', data);
        return (data || []) as Transaction[];
      } catch (err) {
        console.error('Error in transaction query:', err);
        return [];
      }
    }
  });

  // Handle errors from the query
  useEffect(() => {
    if (error) {
      console.error("Query error in useEffect:", error);
      toast({
        title: 'Error loading transactions',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  }, [error]);

  // Unique categories for filter dropdown
  const categories = Array.from(
    new Set((transactions || []).map(t => t.category).filter(Boolean))
  );

  // Export transactions to CSV
  const handleExport = () => {
    // Implement export logic
    toast({
      title: 'Export functionality coming soon!'
    });
  };

  const resetFilters = () => {
    setFilterCategory('all');
    setFilterType('all');
    setSearchQuery('');
  };

  const handleNewTransaction = () => {
    navigate('/colaborador');
  };

  // Delete a transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      // First, get the transaction details for inventory adjustment
      const { data: transactionData, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching transaction details:", fetchError);
        throw new Error(fetchError.message);
      }
      
      // Find the corresponding inventory item
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('name', transactionData.item)
        .eq('location', transactionData.location)
        .single();
      
      if (inventoryError && inventoryError.code !== 'PGRST116') {
        console.error("Error checking inventory for item:", inventoryError);
        throw new Error(inventoryError.message);
      }
      
      // Adjust inventory quantity based on transaction type
      // If we're deleting an 'IN' transaction, we need to subtract the quantity
      // If we're deleting an 'OUT' transaction, we need to add the quantity back
      if (inventoryData) {
        const adjustmentQuantity = transactionData.quantity;
        let newQuantity = inventoryData.quantity;
        
        if (transactionData.type === 'IN') {
          // If deleting an 'IN' transaction, subtract quantity
          newQuantity = Math.max(0, newQuantity - adjustmentQuantity);
        } else {
          // If deleting an 'OUT' transaction, add quantity back
          newQuantity = newQuantity + adjustmentQuantity;
        }
        
        // Update inventory with adjusted quantity
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ quantity: newQuantity })
          .eq('id', inventoryData.id);
        
        if (updateError) {
          console.error("Error updating inventory quantity:", updateError);
          throw new Error(updateError.message);
        }
      }
      
      // Delete the transaction
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error("Error deleting transaction:", deleteError);
        throw new Error(deleteError.message);
      }
      
      // Refresh the transactions list
      refetch();
      
      toast({
        title: 'Transacción eliminada',
        description: 'La transacción ha sido eliminada exitosamente y el inventario ha sido actualizado.',
      });
    } catch (error) {
      console.error('Error in delete transaction:', error);
      toast({
        title: 'Error al eliminar la transacción',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <Layout title="Transacciones">
      <div className="space-y-6">
        <MotionContainer>
          <TransactionFilters 
            searchQuery={searchQuery}
            filterCategory={filterCategory}
            filterType={filterType}
            categories={categories}
            onSearchChange={setSearchQuery}
            onCategoryChange={setFilterCategory}
            onTypeChange={setFilterType}
            onResetFilters={resetFilters}
            onExport={handleExport}
          />
          
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={handleNewTransaction}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Transacción
            </Button>
          </div>
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <TransactionsTable 
            transactions={transactions} 
            isLoading={isLoading}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </MotionContainer>
      </div>
    </Layout>
  );
};

export default Transactions;
