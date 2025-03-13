
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define user roles
export type UserRole = 'admin' | 'student';

// Define user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  studentId?: string; // Add studentId for student users
}

// Mock admin user for demo purposes
const MOCK_ADMIN = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@jstudios.com',
  role: 'admin' as UserRole,
  password: 'admin123',
  avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
};

// Context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createStudentCredentials: (studentId: string, email: string, password: string) => Promise<boolean>;
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

  // Create student credentials - Updated to use a serverless function approach
  const createStudentCredentials = async (studentId: string, email: string, password: string): Promise<boolean> => {
    try {
      // First check if this student already has credentials
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', studentId)
        .eq('email', email)
        .single();

      if (!studentData) {
        toast.error('Student not found with the provided ID and email');
        return false;
      }

      // Use signUp method to create credentials
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: studentData.name,
            role: 'student',
            studentId: studentId
          }
        }
      });

      if (error) {
        console.error('Error creating student credentials:', error);
        toast.error(error.message || 'Failed to create student credentials');
        return false;
      }

      toast.success('Student credentials created successfully');
      return true;
    } catch (error) {
      console.error('Error in createStudentCredentials:', error);
      toast.error('Failed to create student credentials');
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Check if it's the mock admin
    const adminMatch = email === MOCK_ADMIN.email && password === MOCK_ADMIN.password;
    
    if (adminMatch) {
      // Handle admin login with mock data
      const { password: _, ...userWithoutPassword } = MOCK_ADMIN;
      
      setUser(userWithoutPassword);
      localStorage.setItem('j-studios-user', JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${userWithoutPassword.name}!`);
      setIsLoading(false);
      return true;
    } else {
      // Try to authenticate with Supabase for student users
      try {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          console.error('Login error:', error);
          toast.error('Invalid email or password');
          setIsLoading(false);
          return false;
        }

        if (data.user) {
          // Get the user metadata
          const userData = data.user.user_metadata;
          
          // Get student data from the database
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('email', email)
            .single();

          if (studentError) {
            console.error('Error fetching student data:', studentError);
            toast.error('Could not fetch student profile');
            setIsLoading(false);
            return false;
          }

          if (studentData) {
            // Create the user object
            const studentUser: User = {
              id: data.user.id,
              name: studentData.name,
              email: studentData.email,
              role: 'student',
              avatarUrl: studentData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.name)}&background=2563EB&color=fff`,
              studentId: studentData.student_id
            };

            setUser(studentUser);
            localStorage.setItem('j-studios-user', JSON.stringify(studentUser));
            toast.success(`Welcome, ${studentUser.name}!`);
            setIsLoading(false);
            return true;
          } else {
            toast.error('Could not find student profile');
            setIsLoading(false);
            return false;
          }
        }

        toast.error('Login failed');
        setIsLoading(false);
        return false;
      } catch (error) {
        console.error('Login error:', error);
        toast.error('An error occurred during login');
        setIsLoading(false);
        return false;
      }
    }
  };

  // Logout function
  const logout = () => {
    // Sign out from Supabase if there's an active session
    supabase.auth.signOut().then(() => {
      localStorage.removeItem('j-studios-user');
      setUser(null);
      toast.success('Logged out successfully');
    });
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    createStudentCredentials
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
