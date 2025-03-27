
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { User, MapPin, Shield, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (user: {
    name: string;
    email: string;
    role: string;
    location: string;
    receiveAlerts: boolean;
  }) => void;
  locations: string[];
}

const AddUserDialog = ({ 
  open, 
  onOpenChange, 
  onAddUser,
  locations 
}: AddUserDialogProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [location, setLocation] = useState(locations[0] || 'CDMX');
  const [receiveAlerts, setReceiveAlerts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Error",
        description: "El nombre y correo electrónico son obligatorios",
        variant: "destructive"
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Por favor ingrese un correo electrónico válido",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert the user directly into the Supabase table
      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          role,
          location,
          receive_alerts: receiveAlerts
        })
        .select();
      
      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }
      
      console.log("User created successfully:", data);
      
      // Call the parent component's onAddUser function with the user data
      onAddUser({
        name,
        email,
        role,
        location,
        receiveAlerts
      });
      
      // Reset form
      setName('');
      setEmail('');
      setRole('viewer');
      setLocation(locations[0] || 'CDMX');
      setReceiveAlerts(false);
      
      // Show success toast
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
      
      // Close dialog
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding user:", error);
      
      // Check for duplicate email error
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "Este correo electrónico ya está registrado",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo agregar el usuario. Intente de nuevo.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Añadir Nuevo Usuario
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  placeholder="Nombre del usuario"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Rol
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="ops">Operador</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Ubicación
              </Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="alerts" className="flex items-center gap-1">
                <Bell className="h-3.5 w-3.5" /> Recibir Alertas
              </Label>
              <Switch 
                id="alerts"
                checked={receiveAlerts}
                onCheckedChange={setReceiveAlerts}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
