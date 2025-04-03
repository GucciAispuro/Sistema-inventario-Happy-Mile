
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at?: string;
}

const Suppliers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Omit<Supplier, 'id' | 'created_at'>>({
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  // Fetch suppliers
  const { refetch } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching suppliers:', error);
          throw error;
        }
        
        setSuppliers(data || []);
        setFilteredSuppliers(data || []);
        return data || [];
      } catch (error) {
        console.error('Error in fetchSuppliers:', error);
        toast({
          title: 'Error al cargar proveedores',
          description: 'No se pudieron cargar los proveedores',
          variant: 'destructive'
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    initialData: []
  });

  // Filter suppliers based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSuppliers(suppliers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(query) || 
        (supplier.contact_name && supplier.contact_name.toLowerCase().includes(query)) ||
        (supplier.email && supplier.email.toLowerCase().includes(query)) ||
        (supplier.phone && supplier.phone.includes(query)) ||
        (supplier.address && supplier.address.toLowerCase().includes(query))
      );
      setFilteredSuppliers(filtered);
    }
  }, [searchQuery, suppliers]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open add dialog
  const handleAddSupplier = () => {
    setFormData({
      name: '',
      contact_name: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_name: supplier.contact_name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      notes: supplier.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  // Submit add supplier form
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('suppliers')
        .insert([formData]);
      
      if (error) {
        console.error('Error adding supplier:', error);
        toast({
          title: 'Error al agregar proveedor',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      toast({
        title: 'Proveedor añadido',
        description: `${formData.name} ha sido añadido correctamente`
      });
      
      setIsAddDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error in handleAddSubmit:', error);
      toast({
        title: 'Error al agregar proveedor',
        description: 'No se pudo agregar el proveedor',
        variant: 'destructive'
      });
    }
  };

  // Submit edit supplier form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(formData)
        .eq('id', selectedSupplier.id);
      
      if (error) {
        console.error('Error updating supplier:', error);
        toast({
          title: 'Error al actualizar proveedor',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      toast({
        title: 'Proveedor actualizado',
        description: `${formData.name} ha sido actualizado correctamente`
      });
      
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error in handleEditSubmit:', error);
      toast({
        title: 'Error al actualizar proveedor',
        description: 'No se pudo actualizar el proveedor',
        variant: 'destructive'
      });
    }
  };

  // Delete supplier
  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;
    
    try {
      // Check if supplier is being used in part_receipts
      const { data: receiptsData, error: receiptsError } = await supabase
        .from('part_receipts')
        .select('id')
        .eq('supplier_id', selectedSupplier.id)
        .limit(1);
      
      if (receiptsError) {
        console.error('Error checking receipts:', receiptsError);
        throw receiptsError;
      }
      
      if (receiptsData && receiptsData.length > 0) {
        toast({
          title: 'No se puede eliminar',
          description: 'Este proveedor tiene transacciones asociadas y no puede ser eliminado.',
          variant: 'destructive'
        });
        setIsDeleteDialogOpen(false);
        return;
      }
      
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', selectedSupplier.id);
      
      if (error) {
        console.error('Error deleting supplier:', error);
        toast({
          title: 'Error al eliminar proveedor',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      toast({
        title: 'Proveedor eliminado',
        description: `${selectedSupplier.name} ha sido eliminado correctamente`
      });
      
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error in handleDeleteSupplier:', error);
      toast({
        title: 'Error al eliminar proveedor',
        description: 'No se pudo eliminar el proveedor',
        variant: 'destructive'
      });
    }
  };

  return (
    <Layout title="Proveedores">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar proveedores..." 
                className="pl-9 subtle-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button size="sm" onClick={handleAddSupplier}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Proveedor
            </Button>
          </div>
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <DataTable 
            data={filteredSuppliers}
            columns={[
              { key: 'name', header: 'Nombre' },
              { 
                key: 'contact_name', 
                header: 'Contacto',
                cell: (item) => <div>{item.contact_name || '---'}</div>
              },
              {
                key: 'phone', 
                header: 'Teléfono',
                cell: (item) => <div>{item.phone || '---'}</div>
              },
              {
                key: 'email', 
                header: 'Email',
                cell: (item) => <div>{item.email || '---'}</div>
              },
              {
                key: 'address', 
                header: 'Dirección',
                cell: (item) => (
                  <div className="max-w-[200px] truncate text-muted-foreground">
                    {item.address || '---'}
                  </div>
                )
              },
              { 
                key: 'actions', 
                header: '',
                cell: (item) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditSupplier(item)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(item)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                )
              },
            ]}
            loading={isLoading}
            emptyState="No hay proveedores registrados"
          />
        </MotionContainer>
      </div>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Añadir Proveedor</DialogTitle>
            <DialogDescription>
              Ingresa los detalles del nuevo proveedor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="name" className="text-sm font-medium">Nombre*</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="contact_name" className="text-sm font-medium">Contacto</label>
                <Input
                  id="contact_name"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor="phone" className="text-sm font-medium">Teléfono</label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="address" className="text-sm font-medium">Dirección</label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
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

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Proveedor</DialogTitle>
            <DialogDescription>
              Modifica los detalles del proveedor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Nombre*</label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="edit-contact_name" className="text-sm font-medium">Contacto</label>
                <Input
                  id="edit-contact_name"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor="edit-phone" className="text-sm font-medium">Teléfono</label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor="edit-email" className="text-sm font-medium">Email</label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="edit-address" className="text-sm font-medium">Dirección</label>
                <Input
                  id="edit-address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="edit-notes" className="text-sm font-medium">Notas</label>
                <Input
                  id="edit-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar</Button>
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
              Esta acción eliminará permanentemente el proveedor "{selectedSupplier?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSupplier} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Suppliers;
