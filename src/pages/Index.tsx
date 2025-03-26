
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-glass">
        <LoginForm />
      </div>
    </div>
  );
};

export default Index;
