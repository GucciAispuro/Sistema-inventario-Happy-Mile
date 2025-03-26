
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import MotionContainer from "@/components/ui/MotionContainer";
import { BoxesIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-6">
      <MotionContainer className="text-center max-w-md">
        <div className="mx-auto h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
          <BoxesIcon className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Oops! We couldn't find the page you're looking for.
        </p>
        
        <Button
          onClick={() => navigate('/dashboard')}
          className="mx-auto"
        >
          Return to Dashboard
        </Button>
      </MotionContainer>
    </div>
  );
};

export default NotFound;
