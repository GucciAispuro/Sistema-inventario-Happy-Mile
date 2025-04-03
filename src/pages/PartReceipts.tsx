
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, FileText, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import Layout from '@/components/layout/Layout';
import MotionContainer from '@/components/ui/MotionContainer';
import { DataTable } from '@/components/ui/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface PartReceipt {
  id: string;
  item_id: string;
  supplier_id: string;
  invoice_number: string;
  receipt_date: string;
  quantity: number;
  cost?: number;
  notes?: string;
  created_at?: string;
  // Joined data
  item_name?: string;
  supplier_name?: string;
  location?: string;
  category?: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  name: string;
  location: string;
  category: string;
}

const PartReceipts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [partReceipts, setPartReceipts] = useState<PartReceipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<PartReceipt[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PartReceipt | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  
  // Form state
  const [formData, setFormData] = useState({
    item_id: '',
    supplier_id: '',
    invoice_number: '',
    receipt_date: format(new Date(), 'yyyy-MM-dd'),
    quantity: 1,
    cost: 0,
    notes: ''
  });

  // Fetch data
  const { refetch } = useQuery({
    queryKey: ['part-receipts'],
    queryFn: async () => {
      setIsLoading(true);
      try {
        // Fetch suppliers
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('suppliers')
          .select('id, name')
          .order('name');
        
        if (suppliersError) throw suppliersError;
        setSuppliers(suppliersData || []);
        
        // Fetch inventory items
        const { data: itemsData, error: itemsError } = await supabase
          .from('inventory')
          .select('id, name, location, category')
          .order('name');
        
        if (itemsError) throw itemsError;
        setInventoryItems(itemsData || []);
        
        // Fetch part receipts
        const { data: receiptsData, error: receiptsError } = await supabase
          .from('part_receipts')
          .select('*')
          .order('receipt_date', { ascending: false });
        
        if (receiptsError) throw receiptsError;
        
        // Join with supplier and item data
        const receiptsWithDetails = await Promise.all((receiptsData || []).map(async (receipt) => {
          const item = itemsData?.find(i => i.id === receipt.item_id);
          const supplier = suppliersData?.find(s => s.id === receipt.supplier_id);
          
          return {
            ...receipt,
            item_name: item?.name || 'Desconocido',
            supplier_name: supplier?.name || 'Desconocido',
            location: item?.location || 'Desconocido',
            category: item?.category || 'Desconocido'
          };
        }));
        
        setPartReceipts(receiptsWithDetails);
        setFilteredReceipts(receiptsWithDetails);
        return receiptsWithDetails;
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error al cargar datos',
          description: 'No se pudieron cargar los datos',
          variant: 'destructive'
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Filter receipts
  useEffect(() => {
    let filtered = [...partReceipts];
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(receipt => 
        receipt.item_name?.toLowerCase().includes(query) || 
        receipt.supplier_name?.toLowerCase().includes(query) ||
        receipt.invoice_number.toLowerCase().includes(query) ||
        (receipt.notes && receipt.notes.toLowerCase().includes(query))
      );
    }
    
    // Apply supplier filter
    if (filterSupplier) {
      filtered = filtered.filter(receipt => receipt.supplier_id === filterSupplier);
    }
    
    setFilteredReceipts(filtered);
  }, [searchQuery, filterSupplier, partReceipts]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setFormData(prev => ({ ...prev, quantity: value }));
    }
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setFormData(prev => ({ ...prev, cost: value }));
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setFormData(prev => ({ 
        ...prev, 
        receipt_date: format(newDate, 'yyyy-MM-dd')
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      item_id: '',
      supplier_id: '',
      invoice_number: '',
      receipt_date: format(new Date(), 'yyyy-MM-dd'),
      quantity: 1,
      cost: 0,
      notes: ''
    });
    setDate(new Date());
  };

  // Open add dialog
  const handleAddReceipt = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (receipt: PartReceipt) => {
    setSelectedReceipt(receipt);
    setIsDeleteDialogOpen(true);
  };

  // Toggle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterSupplier('');
  };

  // Submit add receipt form
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.item_id || !formData.supplier_id || !formData.invoice_number) {
      toast({
        title: 'Datos incompletos',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Add the receipt
      const { error: receiptError } = await supabase
        .from('part_receipts')
        .insert([
          {
            item_id: formData.item_id,
            supplier_id: formData.supplier_id,
            invoice_number: formData.invoice_number,
            receipt_date: formData.receipt_date,
            quantity: formData.quantity,
            cost: formData.cost || null,
            notes: formData.notes || null
          }
        ]);
      
      if (receiptError) throw receiptError;
      
      // Update the inventory quantity
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('id', formData.item_id)
        .single();
      
      if (inventoryError) throw inventoryError;
      
      const newQuantity = (inventoryData?.quantity || 0) + formData.quantity;
      
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', formData.item_id);
      
      if (updateError) throw updateError;
      
      // Add a transaction entry
      const item = inventoryItems.find(i => i.id === formData.item_id);
      const supplier = suppliers.find(s => s.id === formData.supplier_id);
      
      if (item) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              item: item.name,
              category: item.category,
              location: item.location,
              type: 'IN',
              quantity: formData.quantity,
              user_id: 'system',
              user_name: 'Sistema de Control de Refacciones',
              notes: `Factura: ${formData.invoice_number} - Proveedor: ${supplier?.name || 'Desconocido'}`,
              date: formData.receipt_date
            }
          ]);
        
        if (transactionError) {
          console.error('Error creating transaction:', transactionError);
          // Continue even if transaction creation fails
        }
      }
      
      toast({
        title: 'Registro añadido',
        description: 'La entrada de refacción ha sido registrada correctamente'
      });
      
      setIsAddDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error in handleAddSubmit:', error);
      toast({
        title: 'Error al agregar registro',
        description: 'No se pudo registrar la entrada de refacción',
        variant: 'destructive'
      });
    }
  };

  // Delete receipt
  const handleDeleteReceipt = async () => {
    if (!selectedReceipt) return;
    
    try {
      // Get current inventory quantity
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('id', selectedReceipt.item_id)
        .single();
      
      if (inventoryError) throw inventoryError;
      
      // Subtract quantity (but never below 0)
      const newQuantity = Math.max(0, (inventoryData?.quantity || 0) - selectedReceipt.quantity);
      
      // Update inventory
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', selectedReceipt.item_id);
      
      if (updateError) throw updateError;
      
      // Delete the receipt
      const { error: deleteError } = await supabase
        .from('part_receipts')
        .delete()
        .eq('id', selectedReceipt.id);
      
      if (deleteError) throw deleteError;
      
      toast({
        title: 'Registro eliminado',
        description: 'La entrada de refacción ha sido eliminada correctamente'
      });
      
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error in handleDeleteReceipt:', error);
      toast({
        title: 'Error al eliminar registro',
        description: 'No se pudo eliminar la entrada de refacción',
        variant: 'destructive'
      });
    }
  };

  return (
    <Layout title="Control de Refacciones">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por refacción, proveedor o factura..." 
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
              
              <Button size="sm" onClick={handleAddReceipt}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Entrada
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-card rounded-md border">
              <h3 className="font-medium mb-2">Filtros</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Proveedor</label>
                  <Select
                    value={filterSupplier}
                    onValueChange={(value) => setFilterSupplier(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos los proveedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los proveedores</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="sm:col-span-3 flex justify-end">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </div>
          )}
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <DataTable 
            data={filteredReceipts}
            columns={[
              { 
                key: 'receipt_date', 
                header: 'Fecha', 
                cell: (item) => (
                  <div>{format(new Date(item.receipt_date), 'd MMM yyyy', { locale: es })}</div>
                )
              },
              { key: 'item_name', header: 'Refacción' },
              { key: 'supplier_name', header: 'Proveedor' },
              { key: 'invoice_number', header: 'No. Factura' },
              { 
                key: 'quantity', 
                header: 'Cantidad',
                cell: (item) => <div className="font-medium">{item.quantity}</div>
              },
              { 
                key: 'cost', 
                header: 'Costo',
                cell: (item) => (
                  <div>
                    {item.cost ? `$${parseFloat(item.cost.toString()).toFixed(2)}` : '---'}
                  </div>
                )
              },
              { 
                key: 'notes', 
                header: 'Notas',
                cell: (item) => (
                  <div className="max-w-[200px] truncate text-muted-foreground">
                    {item.notes || '---'}
                  </div>
                )
              },
              { 
                key: 'actions', 
                header: '',
                cell: (item) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(item)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                )
              },
            ]}
            loading={isLoading}
            emptyState="No hay registros de entradas de refacciones"
          />
        </MotionContainer>
      </div>

      {/* Add Receipt Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Entrada de Refacción</DialogTitle>
            <DialogDescription>
              Ingresa los detalles de la nueva entrada de refacción.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="item_id" className="text-sm font-medium">Refacción*</label>
                <Select
                  value={formData.item_id}
                  onValueChange={(value) => handleSelectChange('item_id', value)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar refacción" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="supplier_id" className="text-sm font-medium">Proveedor*</label>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(value) => handleSelectChange('supplier_id', value)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="invoice_number" className="text-sm font-medium">Número de Factura*</label>
                <Input
                  id="invoice_number"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm font-medium">Fecha de Recepción*</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(date, 'PP', { locale: es })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor="quantity" className="text-sm font-medium">Cantidad*</label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleQuantityChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="cost" className="text-sm font-medium">Costo Unitario</label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={handleCostChange}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="notes" className="text-sm font-medium">Notas</label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente este registro de entrada de refacción.
              También se actualizará el inventario, reduciendo la cantidad correspondiente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReceipt} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default PartReceipts;
