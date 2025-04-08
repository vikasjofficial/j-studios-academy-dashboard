import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FloatingObjects from "@/components/webgl/FloatingObjects";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (user) {
      const roleBasedRedirect = () => {
        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "student") {
          navigate("/student");
        }
      };

      roleBasedRedirect();
    }
  }, [user, navigate]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-secondary py-4">
        <div className="container max-w-6xl mx-auto px-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-lg font-semibold">
              J-Studios Academy
            </Link>
            <div className="space-x-4">
              {!user && (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
              {user && (
                <>
                  <span>{user.email}</span>
                  {/* Add logout or profile link here */}
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="relative">
            {/* WebGL background effect */}
            <div className="absolute inset-0 opacity-40 pointer-events-none -z-10">
              <FloatingObjects count={15} />
            </div>
            
            <div className="relative z-10 text-center space-y-6 py-12">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                J-Studios Academy
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                A modern academy management system with advanced visualization and interactive features
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button asChild size="lg">
                  <Link to="/login">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/webgl">View WebGL Showcase</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-secondary py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} J-Studios Academy. All rights reserved.</p>
        <p>Current Time: {currentTime.toLocaleTimeString()}</p>
      </footer>
    </div>
  );
}
