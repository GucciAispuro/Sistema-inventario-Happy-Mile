
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import MotionContainer from '../ui/MotionContainer';
import { supabase } from '@/integrations/supabase/client';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor ingrese su correo y contraseña",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Try to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Set local auth data for the app
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userEmail', email);
        
        toast({
          title: "Éxito",
          description: "Has iniciado sesión correctamente",
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "Credenciales incorrectas. Por favor intente de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add signup functionality
  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor ingrese un correo y contraseña para registrarse",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin',
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Registro exitoso",
        description: "Cuenta creada correctamente. Ahora puede iniciar sesión.",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      
      toast({
        title: "Error de registro",
        description: error.message || "No se pudo crear la cuenta. Por favor intente de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md">
      <MotionContainer className="mb-8 text-center">
        <div className="mx-auto h-16 w-auto mb-4">
          <img 
            src="/lovable-uploads/5399f4ec-e1d9-4ad7-bd49-730fd7167990.png" 
            alt="Happy Mile Logo" 
            className="h-full w-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-semibold">Sistema de Inventario</h1>
        <p className="text-muted-foreground mt-2">
          Inicie sesión para acceder al sistema
        </p>
      </MotionContainer>
      
      <MotionContainer delay={100}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="subtle-input"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Button type="button" variant="link" className="p-0 h-auto text-xs">
                ¿Olvidó su contraseña?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="subtle-input"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">¿No tiene una cuenta?</p>
            <Button 
              type="button" 
              variant="outline" 
              className="mt-2 w-full"
              onClick={handleSignUp}
              disabled={isLoading}
            >
              Registrarse
            </Button>
          </div>
        </form>
      </MotionContainer>
    </div>
  );
};

export default LoginForm;
