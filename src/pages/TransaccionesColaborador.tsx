import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import MotionContainer from '@/components/ui/MotionContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowDown, 
  ArrowUp,
  Upload,
  FileText,
} from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Schema for form validation
const formSchema = z.object({
  item: z.string().min(1, "Seleccione un artículo"),
  location: z.string().min(1, "Seleccione una ubicación"),
  type: z.enum(["IN", "OUT"], { required_error: "Seleccione un tipo de transacción" }),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1"),
  notes: z.string().optional(),
  evidenceFile: z.instanceof(FileList).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Define inventory item type
type InventoryItem = {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
};

// Define location type
type Location = {
  id: string;
  name: string;
  address: string;
};

const TransaccionesColaborador = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
  const [selectedLocationItems, setSelectedLocationItems] = useState<InventoryItem[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item: '',
      location: '',
      type: 'IN',
      quantity: 1,
      notes: '',
    },
  });
  
  // Fetch all inventory items
  const { data: inventoryItems = [], isLoading: isLoadingInventory } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      try {
        console.log("Fetching inventory items for transaction form");
        const { data, error } = await supabase
          .from('inventory')
          .select('*');

        if (error) {
          console.error("Error fetching inventory items:", error);
          toast({
            title: 'Error al cargar inventario',
            description: error.message,
            variant: 'destructive'
          });
          return [];
        }

        console.log("Fetched inventory items:", data);
        return data as InventoryItem[];
      } catch (err) {
        console.error("Error in inventory query:", err);
        return [];
      }
    }
  });
  
  // Fetch all locations
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      try {
        console.log("Fetching locations for transaction form");
        const { data, error } = await supabase
          .from('locations')
          .select('*');

        if (error) {
          console.error("Error fetching locations:", error);
          toast({
            title: 'Error al cargar ubicaciones',
            description: error.message,
            variant: 'destructive'
          });
          return [];
        }

        console.log("Fetched locations:", data);
        return data as Location[];
      } catch (err) {
        console.error("Error in locations query:", err);
        return [];
      }
    }
  });
  
  // Fetch recent transactions for this user
  const { data: transactions = [], refetch } = useQuery({
    queryKey: ['colaborador-transactions'],
    queryFn: async () => {
      try {
        console.log("Fetching recent transactions for colaborador view");
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching transactions:", error);
          toast({
            title: 'Error al cargar transacciones',
            description: error.message,
            variant: 'destructive'
          });
          return [];
        }

        console.log("Fetched transactions:", data);
        return data || [];
      } catch (err) {
        console.error("Error in transaction query:", err);
        return [];
      }
    }
  });
  
  // Watch for location changes to filter available items
  useEffect(() => {
    const locationValue = form.watch('location');
    const selectedLocation = locations.find(loc => loc.id === locationValue);
    
    if (selectedLocation) {
      console.log(`Location selected: ${selectedLocation.name}`);
      
      // Filter items by location
      const itemsInLocation = inventoryItems.filter(item => 
        item.location === selectedLocation.name
      );
      
      console.log(`Found ${itemsInLocation.length} items in ${selectedLocation.name}`);
      setSelectedLocationItems(itemsInLocation);
    } else {
      setSelectedLocationItems([]);
    }
  }, [form.watch('location'), locations, inventoryItems]);
  
  // Reset item selection when location changes
  useEffect(() => {
    form.setValue('item', '');
  }, [form.watch('location')]);
  
  // Ensure quantity doesn't exceed available inventory for OUT transactions
  useEffect(() => {
    const transactionType = form.watch('type');
    const itemId = form.watch('item');
    const quantity = form.watch('quantity');
    
    if (transactionType === 'OUT' && itemId) {
      const selectedItem = selectedLocationItems.find(item => item.id === itemId);
      
      if (selectedItem && quantity > selectedItem.quantity) {
        form.setValue('quantity', selectedItem.quantity);
        toast({
          title: 'Cantidad ajustada',
          description: `Solo hay ${selectedItem.quantity} unidades disponibles de este artículo`,
        });
      }
    }
  }, [form.watch('type'), form.watch('item'), form.watch('quantity')]);
  
  const onSubmit = async (values: FormValues) => {
    console.log("Datos enviados:", values);
    setIsSubmitting(true);
    
    try {
      // Get item and location details
      const selectedItem = selectedLocationItems.find(item => item.id === values.item);
      const selectedLocation = locations.find(loc => loc.id === values.location);
      
      if (!selectedLocation) {
        toast({
          title: "Error",
          description: "Seleccione una ubicación válida.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (values.type === 'OUT' && !selectedItem) {
        toast({
          title: "Error",
          description: "El artículo seleccionado no existe en esta ubicación.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // For OUT transactions, ensure there's enough inventory
      if (values.type === 'OUT') {
        if (!selectedItem) {
          toast({
            title: "Error",
            description: "No se puede encontrar el artículo en la ubicación seleccionada.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        if (selectedItem.quantity < values.quantity) {
          toast({
            title: "Inventario insuficiente",
            description: `Solo hay ${selectedItem.quantity} unidades disponibles de ${selectedItem.name}`,
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Generate a date in YYYY-MM-DD format
      const formattedDate = new Date().toISOString().split('T')[0];
      
      // For IN transactions with a new item (not in inventory yet)
      let itemName = '';
      let itemCategory = '';
      
      if (values.type === 'IN' && !selectedItem) {
        // For new items being added, we need to get details from the form
        // In a real app, you would have additional fields for category and item name
        // For now, we'll use a default category and prompt the user
        const newItemName = prompt("Este artículo no existe en esta ubicación. Por favor, ingrese el nombre del artículo:");
        
        if (!newItemName || newItemName.trim() === '') {
          toast({
            title: "Error",
            description: "Debe ingresar un nombre para el nuevo artículo.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        const newItemCategory = prompt("Por favor, ingrese la categoría del artículo:");
        
        if (!newItemCategory || newItemCategory.trim() === '') {
          toast({
            title: "Error",
            description: "Debe ingresar una categoría para el nuevo artículo.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        itemName = newItemName.trim();
        itemCategory = newItemCategory.trim();
      } else if (selectedItem) {
        // Use existing item details
        itemName = selectedItem.name;
        itemCategory = selectedItem.category;
      } else {
        toast({
          title: "Error",
          description: "Información del artículo incompleta.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Prepare transaction data
      const transactionData = {
        item: itemName,
        category: itemCategory,
        location: selectedLocation.name,
        type: values.type,
        quantity: values.quantity,
        date: formattedDate,
        user_id: "colaborador", // In a real app, use the authenticated user's ID
        user_name: "Colaborador", // In a real app, use the authenticated user's name
        notes: values.notes || null,
        has_proof: values.evidenceFile && values.evidenceFile.length > 0 ? true : false,
        proof_url: null // In a real app, upload file and store URL
      };
      
      console.log("About to insert transaction:", transactionData);
      
      // First, check if item exists in inventory for this location
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('name', itemName)
        .eq('location', selectedLocation.name);

      console.log("Inventory check result:", { inventoryData, inventoryError });
      
      // Handle errors other than "no rows returned"
      if (inventoryError && inventoryError.code !== 'PGRST116') {
        console.error("Error checking inventory:", inventoryError);
        toast({
          title: "Error al verificar inventario",
          description: inventoryError.message,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Calculate new inventory quantity based on transaction type
      let inventoryItem = inventoryData && inventoryData.length > 0 ? inventoryData[0] : null;
      const currentQuantity = inventoryItem ? inventoryItem.quantity : 0;
      
      const newQuantity = values.type === 'IN' 
        ? currentQuantity + values.quantity
        : Math.max(0, currentQuantity - values.quantity);

      console.log(`Inventory calculation: Current=${currentQuantity}, Transaction=${values.quantity}, New=${newQuantity}`);

      // Update or insert inventory based on whether it exists
      let inventoryUpdateResult;
      if (inventoryItem) {
        // Update existing inventory
        console.log(`Updating inventory for ${itemName} at ${selectedLocation.name}: Current=${inventoryItem.quantity}, New=${newQuantity}`);
        inventoryUpdateResult = await supabase
          .from('inventory')
          .update({ quantity: newQuantity })
          .eq('id', inventoryItem.id);
      } else if (values.type === 'IN') {
        // Create new inventory entry for IN transactions only
        console.log(`Creating new inventory for ${itemName} at ${selectedLocation.name} with quantity ${values.quantity}`);
        inventoryUpdateResult = await supabase
          .from('inventory')
          .insert({
            name: itemName,
            category: itemCategory,
            location: selectedLocation.name,
            quantity: values.quantity
          });
      } else {
        toast({
          title: "Error",
          description: "No se puede realizar una salida de un artículo que no existe en el inventario.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Check for inventory update errors
      if (inventoryUpdateResult?.error) {
        console.error("Error updating inventory:", inventoryUpdateResult.error);
        toast({
          title: values.type === 'IN' ? "Error al crear item en inventario" : "Error al actualizar inventario",
          description: inventoryUpdateResult.error.message,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Only insert transaction if inventory update was successful
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData);
      
      if (error) {
        console.error("Error saving transaction:", error);
        toast({
          title: "Error al guardar transacción",
          description: error.message,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Show success message
      toast({
        title: "Transacción registrada",
        description: `Se ha registrado correctamente la transacción de ${values.type === 'IN' ? 'entrada' : 'salida'}.`,
      });
      
      // Reset form
      form.reset({
        item: '',
        location: '',
        type: 'IN',
        quantity: 1,
        notes: '',
      });
      
      setFilePreview(null);
      
      // Refetch data
      refetch();
    } catch (err) {
      console.error("Error processing transaction:", err);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al procesar la transacción.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      form.setValue('evidenceFile', files);
      
      // Create preview if it's an image
      const fileType = files[0].type;
      if (fileType.includes('image')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFilePreview(event.target?.result as string);
        };
        reader.readAsDataURL(files[0]);
      } else {
        // If not an image, show a text indicating there's a file
        setFilePreview('file');
      }
    } else {
      form.setValue('evidenceFile', undefined);
      setFilePreview(null);
    }
  };

  return (
    <Layout title="Registro de Transacciones">
      <div className="space-y-6">
        <MotionContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Registrar Transacción</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ubicación</FormLabel>
                          <FormControl>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                              disabled={isLoadingLocations}
                            >
                              <option value="">Seleccionar ubicación</option>
                              {locations.map(location => (
                                <option key={location.id} value={location.id}>
                                  {location.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Transacción</FormLabel>
                          <div className="flex flex-wrap gap-2 w-full">
                            <FormControl>
                              <div className="flex flex-wrap items-center gap-2">
                                <label className={`flex-1 min-w-[120px] flex items-center justify-center p-2 rounded-md transition-colors ${field.value === 'IN' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-background border hover:bg-muted/50'}`}>
                                  <input
                                    type="radio"
                                    value="IN"
                                    className="sr-only"
                                    checked={field.value === 'IN'}
                                    onChange={() => field.onChange('IN')}
                                  />
                                  <ArrowDown className="h-4 w-4 mr-1" />
                                  <span>Entrada</span>
                                </label>
                                
                                <label className={`flex-1 min-w-[120px] flex items-center justify-center p-2 rounded-md transition-colors ${field.value === 'OUT' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-background border hover:bg-muted/50'}`}>
                                  <input
                                    type="radio"
                                    value="OUT"
                                    className="sr-only"
                                    checked={field.value === 'OUT'}
                                    onChange={() => field.onChange('OUT')}
                                  />
                                  <ArrowUp className="h-4 w-4 mr-1" />
                                  <span>Salida</span>
                                </label>
                              </div>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="item"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Artículo</FormLabel>
                          <FormControl>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                              disabled={!form.watch('location') || isLoadingInventory}
                            >
                              <option value="">
                                {!form.watch('location') 
                                  ? "Seleccione ubicación primero" 
                                  : form.watch('type') === 'OUT' && selectedLocationItems.length === 0
                                    ? "No hay artículos en esta ubicación"
                                    : "Seleccionar artículo"}
                              </option>
                              
                              {/* Show existing items for the selected location */}
                              {selectedLocationItems.map(item => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.category}) - Disponible: {item.quantity}
                                </option>
                              ))}
                              
                              {/* Add option for new item if it's an IN transaction */}
                              {form.watch('type') === 'IN' && form.watch('location') && (
                                <option value="new">+ Agregar nuevo artículo</option>
                              )}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max={form.watch('type') === 'OUT' && form.watch('item') 
                                ? selectedLocationItems.find(i => i.id === form.watch('item'))?.quantity || 1 
                                : undefined}
                              placeholder="Cantidad"
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (form.watch('type') === 'OUT' && form.watch('item')) {
                                  const selectedItem = selectedLocationItems.find(i => i.id === form.watch('item'));
                                  if (selectedItem && value > selectedItem.quantity) {
                                    field.onChange(selectedItem.quantity);
                                    return;
                                  }
                                }
                                field.onChange(e);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detalles adicionales de la transacción"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormItem>
                    <FormLabel>Comprobante</FormLabel>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          <span>Subir Comprobante</span>
                        </Button>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                          onChange={handleFileChange}
                        />
                      </div>
                      
                      {filePreview && (
                        <div className="mt-2 border rounded-md p-2 bg-secondary/30">
                          {filePreview === 'file' ? (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <FileText className="h-4 w-4 mr-2" />
                              <span>Archivo seleccionado</span>
                            </div>
                          ) : (
                            <img 
                              src={filePreview} 
                              alt="Vista previa" 
                              className="max-h-24 rounded-md object-contain"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </FormItem>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Procesando...' : 'Registrar Transacción'}
                  </Button>
                </form>
              </Form>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Transacciones Recientes</h2>
              
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-1">
                            {transaction.type === 'IN' ? (
                              <div className="flex items-center">
                                <ArrowDown className="h-3 w-3 text-green-600 mr-1" />
                                <span className="text-green-600 font-medium">ENTRADA</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <ArrowUp className="h-3 w-3 text-blue-600 mr-1" />
                                <span className="text-blue-600 font-medium">SALIDA</span>
                              </div>
                            )}
                          </div>
                          <div className="font-medium">{transaction.item}</div>
                          <div className="text-sm text-muted-foreground">
                            Ubicación: {transaction.location}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Cantidad: {transaction.quantity}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-muted-foreground">{transaction.date}</div>
                          {transaction.has_proof && (
                            <span className="inline-flex items-center text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5 mt-1">
                              <FileText className="h-3 w-3 mr-1" />
                              Comprobante
                            </span>
                          )}
                        </div>
                      </div>
                      {transaction.notes && (
                        <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                          {transaction.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay transacciones recientes</p>
                  <p className="text-sm mt-1">Las transacciones registradas aparecerán aquí</p>
                </div>
              )}
            </div>
          </div>
        </MotionContainer>
      </div>
    </Layout>
  );
};

export default TransaccionesColaborador;
