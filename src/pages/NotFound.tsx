
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="w-full max-w-md text-center animate-in slide-in-from-bottom-4 duration-700 fade-in-0">
        <div className="relative mb-8">
          <div className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-[180px] font-bold text-foreground">
              404
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        
        <div className="flex justify-center">
          <Button asChild className="shadow-md hover:shadow-lg">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
