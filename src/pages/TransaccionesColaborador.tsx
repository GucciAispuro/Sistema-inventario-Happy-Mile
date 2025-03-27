
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

// Example data for items and locations
const itemsData = [
  { id: 1, name: 'Silla de Oficina', category: 'Mobiliario' },
  { id: 2, name: 'Papel de Impresora', category: 'Suministros de Oficina' },
  { id: 3, name: 'Laptop', category: 'Electrónicos' },
  { id: 4, name: 'Llanta de Repuesto', category: 'Piezas de Vehículo' },
  { id: 5, name: 'Chaleco de Seguridad', category: 'Equipo de Seguridad' },
];

const locationsData = [
  { id: 1, name: 'CDMX', address: 'Ciudad de México' },
  { id: 2, name: 'Monterrey', address: 'Nuevo León' },
  { id: 3, name: 'Guadalajara', address: 'Jalisco' },
  { id: 4, name: 'Culiacán', address: 'Sinaloa' },
];

const TransaccionesColaborador = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const onSubmit = async (values: FormValues) => {
    console.log("Datos enviados:", values);
    setIsSubmitting(true);
    
    try {
      // Get item and location details
      const selectedItem = itemsData.find(i => i.id.toString() === values.item);
      const selectedLocation = locationsData.find(l => l.id.toString() === values.location);
      
      if (!selectedItem || !selectedLocation) {
        toast({
          title: "Error",
          description: "Seleccione un artículo y ubicación válidos.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Generate a date in YYYY-MM-DD format
      const formattedDate = new Date().toISOString().split('T')[0];
      
      // Prepare transaction data
      const transactionData = {
        item: selectedItem.name,
        category: selectedItem.category,
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
      
      // Insert transaction into Supabase
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData);
      
      if (error) {
        console.error("Error saving transaction:", error);
        toast({
          title: "Error al guardar",
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
      
      // Refetch transactions to update the list
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
                      name="item"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Artículo</FormLabel>
                          <FormControl>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="">Seleccionar artículo</option>
                              {itemsData.map(item => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.category})
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
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ubicación</FormLabel>
                          <FormControl>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="">Seleccionar ubicación</option>
                              {locationsData.map(location => (
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
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              placeholder="Cantidad"
                              {...field}
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
