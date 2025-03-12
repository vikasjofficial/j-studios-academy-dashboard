
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

// Define user roles
export type UserRole = 'admin' | 'student';

// Define user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

// Mock users for demo purposes
const MOCK_USERS = {
  admin: {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@jstudios.com',
    role: 'admin' as UserRole,
    password: 'admin123',
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
  },
  student: {
    id: 'student-1',
    name: 'Student User',
    email: 'student@jstudios.com',
    role: 'student' as UserRole,
    password: 'student123',
    avatarUrl: 'https://ui-avatars.com/api/?name=Student&background=2563EB&color=fff'
  }
};

// Context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('j-studios-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('j-studios-user');
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple authentication logic for demo
    const adminMatch = email === MOCK_USERS.admin.email && password === MOCK_USERS.admin.password;
    const studentMatch = email === MOCK_USERS.student.email && password === MOCK_USERS.student.password;
    
    if (adminMatch || studentMatch) {
      const userToLogin = adminMatch ? MOCK_USERS.admin : MOCK_USERS.student;
      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = userToLogin;
      
      setUser(userWithoutPassword);
      localStorage.setItem('j-studios-user', JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${userWithoutPassword.name}!`);
      setIsLoading(false);
      return true;
    } else {
      toast.error('Invalid email or password');
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('j-studios-user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
