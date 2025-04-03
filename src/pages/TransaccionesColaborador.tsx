import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Save, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import MotionContainer from '@/components/ui/MotionContainer';

interface FormData {
  item: string;
  quantity: string;
  notes: string;
  voucher_number: string;
  has_proof: boolean;
  proof_image: File | null;
}

const TransaccionesColaborador = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactionType, setTransactionType] = useState<'IN' | 'OUT'>('IN');
  const [inventory, setInventory] = useState<any[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [userName, setUserName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [itemCount, setItemCount] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    item: '',
    quantity: '',
    notes: '',
    voucher_number: '',
    has_proof: false,
    proof_image: null,
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('id, name, category, quantity, location');
        
        if (error) {
          console.error("Error fetching inventory:", error);
          toast({
            title: "Error",
            description: "Failed to load inventory.",
            variant: "destructive"
          });
          return;
        }
        
        setInventory(data || []);
      } catch (error) {
        console.error("Error in inventory fetch:", error);
        toast({
          title: "Error",
          description: "Failed to load inventory.",
          variant: "destructive"
        });
      }
    };
    
    fetchInventory();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('name');
        
        if (error) {
          console.error("Error fetching locations:", error);
          toast({
            title: "Error",
            description: "Failed to load locations.",
            variant: "destructive"
          });
          return;
        }
        
        const locationNames = data ? data.map(loc => loc.name) : [];
        setLocations(locationNames);
        
        // Set initial location if available
        if (locationNames.length > 0) {
          setSelectedLocation(locationNames[0]);
        }
      } catch (error) {
        console.error("Error in locations fetch:", error);
        toast({
          title: "Error",
          description: "Failed to load locations.",
          variant: "destructive"
        });
      }
    };
    
    fetchLocations();
  }, []);

  useEffect(() => {
    // Retrieve user info from localStorage
    const storedUserName = localStorage.getItem('userName');
    setUserName(storedUserName || 'Colaborador');
  }, []);

  const filteredInventory = inventory.filter(item => item.location === selectedLocation);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, proof_image: e.target.files![0] }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.item || !formData.quantity) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos requeridos.",
        variant: "destructive"
      });
      return;
    }
    
    const quantityValue = parseInt(formData.quantity);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser un número mayor que cero.",
        variant: "destructive"
      });
      return;
    }

    const selectedItem = inventory.find(item => item.name === formData.item);
    
    if (!selectedItem) {
      toast({
        title: "Error",
        description: "El artículo seleccionado no existe en el inventario",
        variant: "destructive"
      });
      return;
    }

    if (transactionType === 'OUT' && quantityValue > selectedItem.quantity) {
      toast({
        title: "Error",
        description: "No hay suficiente stock disponible para esta transacción.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      let proofUrl = null;
      
      if (formData.has_proof && formData.proof_image) {
        const file = formData.proof_image;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `proofs/${fileName}`;
        
        const { data, error } = await supabase
          .storage
          .from('proof-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error("Error uploading file:", error);
          toast({
            title: "Error",
            description: "Failed to upload proof image.",
            variant: "destructive"
          });
          return;
        }
        
        proofUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data?.path}`;
      }
      
      const transactionData = {
        item: formData.item,
        category: selectedItem.category,
        location: selectedLocation,
        quantity: parseInt(formData.quantity),
        type: transactionType,
        date: format(new Date(), 'yyyy-MM-dd'),
        user_id: 'colaborador',
        user_name: userName,
        notes: formData.notes || null,
        has_proof: formData.has_proof,
        proof_url: proofUrl,
        voucher_number: formData.voucher_number || null,
      };
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([transactionData]);
      
      if (transactionError) {
        console.error("Error inserting transaction:", transactionError);
        toast({
          title: "Error",
          description: "Failed to record transaction.",
          variant: "destructive"
        });
        return;
      }
      
      const newQuantity = transactionType === 'IN'
        ? selectedItem.quantity + quantityValue
        : selectedItem.quantity - quantityValue;
      
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', selectedItem.id);
      
      if (updateError) {
        console.error("Error updating inventory:", updateError);
        toast({
          title: "Error",
          description: "Failed to update inventory.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Transacción exitosa",
        description: "La transacción ha sido registrada correctamente.",
      });
      
      setFormData({
        item: '',
        quantity: '',
        notes: '',
        voucher_number: '',
        has_proof: false,
        proof_image: null,
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setItemCount(prevCount => prevCount + 1);
      
    } catch (error) {
      console.error("Error al procesar la transacción:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la transacción.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const historyKey = `transactionHistory-${userName}`;
  const [transactionHistory, setTransactionHistory] = useState<any[]>(() => {
    try {
      const storedHistory = localStorage.getItem(historyKey);
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error("Error parsing transaction history from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(historyKey, JSON.stringify(transactionHistory));
    } catch (error) {
      console.error("Error saving transaction history to localStorage:", error);
    }
  }, [transactionHistory, historyKey]);

  return (
    <Layout title="Entrada y Salida de Artículos">
      <div className="max-w-3xl mx-auto">
        <MotionContainer>
          <Card>
            <CardHeader>
              <CardTitle>Registrar {transactionType === 'IN' ? 'Entrada' : 'Salida'} de Artículo</CardTitle>
              <CardDescription>
                {transactionType === 'IN' 
                  ? 'Registra la entrada de artículos al inventario' 
                  : 'Registra la salida de artículos del inventario'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    type="button"
                    variant={transactionType === 'IN' ? 'default' : 'outline'}
                    onClick={() => setTransactionType('IN')}
                    className="flex-1"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Entrada
                  </Button>
                  <Button
                    type="button"
                    variant={transactionType === 'OUT' ? 'default' : 'outline'}
                    onClick={() => setTransactionType('OUT')}
                    className="flex-1"
                  >
                    <TrendingDown className="mr-2 h-4 w-4" />
                    Salida
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ubicación" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="item">Artículo</Label>
                    <Select 
                      value={formData.item} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, item: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar artículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredInventory.map(item => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name} - {item.category} ({item.quantity} disponibles)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="voucher_number">Folio de Vale</Label>
                    <Input
                      id="voucher_number"
                      name="voucher_number"
                      placeholder="Ej. VAL-001-2023"
                      value={formData.voucher_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notas (opcional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Ingresa cualquier detalle adicional..."
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="has_proof" 
                        name="has_proof"
                        checked={formData.has_proof}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ 
                            ...prev, 
                            has_proof: checked === true, 
                            proof_image: checked === true ? prev.proof_image : null 
                          }))
                        }
                      />
                      <Label htmlFor="has_proof">Tengo un comprobante</Label>
                    </div>
                    
                    {formData.has_proof && (
                      <div className="pl-6">
                        <Label htmlFor="proof_image">Adjuntar comprobante (opcional)</Label>
                        <Input
                          ref={fileInputRef}
                          id="proof_image"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Formatos aceptados: JPEG, PNG, PDF (máx. 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Transacción
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </MotionContainer>

        {/* Transaction History Section */}
        {/*<MotionContainer delay={100}>
          <Card>
            <CardHeader>
              <CardTitle>Historial de Transacciones</CardTitle>
              <CardDescription>
                Tus últimas transacciones registradas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionHistory.length === 0 ? (
                <p>No hay transacciones registradas aún.</p>
              ) : (
                <ul>
                  {transactionHistory.map((transaction, index) => (
                    <li key={index} className="py-2 border-b last:border-b-0">
                      {transaction.type === 'IN' ? 'Entrada' : 'Salida'} de {transaction.quantity} {transaction.item} - {format(new Date(transaction.date), 'PPP')}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </MotionContainer>*/}
      </div>
    </Layout>
  );
};

export default TransaccionesColaborador;
