
import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/context/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!isLoading && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        navigate(user.role === 'admin' ? '/admin' : '/student');
      }
    }
  }, [isAuthenticated, isLoading, navigate, allowedRoles, user]);

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  // If not authenticated, nothing to see here (will be redirected)
  if (!isAuthenticated) {
    return null;
  }

  // If role check is needed but user doesn't have permission
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
}
