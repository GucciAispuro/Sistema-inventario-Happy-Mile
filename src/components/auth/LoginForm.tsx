
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
        title: "Success",
        description: "You have successfully logged in",
      });
      
      navigate('/dashboard');
    }, 500);
  };
  
  return (
    <div className="w-full max-w-md">
      <MotionContainer className="mb-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4">
          <BoxesIcon className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-semibold">Road Logistics Inventory</h1>
        <p className="text-muted-foreground mt-2">
          Login disabled for testing - click Sign In to continue
        </p>
      </MotionContainer>
      
      <MotionContainer delay={100}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="subtle-input"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button type="button" variant="link" className="p-0 h-auto text-xs">
                Forgot password?
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
            {isLoading ? "Signing in..." : "Sign in (Auto Login Enabled)"}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Login is disabled for testing - you'll be signed in as Admin</p>
          </div>
        </form>
      </MotionContainer>
    </div>
  );
};

export default LoginForm;
