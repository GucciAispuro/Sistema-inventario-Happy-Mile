
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import MotionContainer from '../ui/MotionContainer';
import { BoxesIcon } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-login without validation
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('isAuthenticated', 'true');
      
      toast({
        title: "Éxito",
        description: "Has iniciado sesión correctamente",
      });
      
      navigate('/dashboard');
    }, 500);
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
          Inicio de sesión desactivado para pruebas - haga clic en Iniciar Sesión para continuar
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
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión (Automático)"}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>El inicio de sesión está desactivado para pruebas - se iniciará como Administrador</p>
          </div>
        </form>
      </MotionContainer>
    </div>
  );
};

export default LoginForm;
