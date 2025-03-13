
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

  // Create student credentials with auto-confirmation
  const createStudentCredentials = async (studentId: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('Creating credentials for student:', studentId, email);
      
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

      // Check if user already exists in auth
      const { data, error: getUserError } = await supabase.auth.admin.listUsers();
      
      // Fix type error by properly typing the users array
      const users = data?.users || [];
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        console.log('User already exists in auth system, updating password');
        
        // Update the user's password instead of creating a new account
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password }
        );
        
        if (updateError) {
          console.error('Error updating user password:', updateError);
          toast.error(updateError.message || 'Failed to update student password');
          return false;
        }
        
        toast.success('Student credentials updated successfully');
        return true;
      }
      
      // Create new user - using admin API to automatically confirm email
      const { data: createData, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // This automatically confirms the email
        user_metadata: {
          name: studentData.name,
          role: 'student',
          studentId: studentId
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
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      // Handle admin login with mock data
      const { password: _, ...userWithoutPassword } = MOCK_ADMIN;
      
      setUser(userWithoutPassword);
      localStorage.setItem('j-studios-user', JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${userWithoutPassword.name}!`);
      setIsLoading(false);
      return true;
    } 
    
    // Authentication for student users
    try {
      console.log('Attempting student login for:', email);
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Authentication error:', error);
        
        // Check if the error is due to unconfirmed email
        if (error.message.includes('Email not confirmed')) {
          // Try to confirm the email automatically
          try {
            const { data: listData } = await supabase.auth.admin.listUsers();
            // Fix type error by properly typing the users array
            const users = listData?.users || [];
            const userToConfirm = users.find(u => u.email === email);
            
            if (userToConfirm) {
              await supabase.auth.admin.updateUserById(
                userToConfirm.id, 
                { email_confirm: true }
              );
              
              // Try logging in again
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password
              });
              
              if (retryError) {
                console.error('Retry authentication error:', retryError);
                toast.error('Login failed after confirming email');
                setIsLoading(false);
                return false;
              }
              
              if (!retryData.user) {
                console.error('No user returned from retry authentication');
                toast.error('Login failed - no user data');
                setIsLoading(false);
                return false;
              }
              
              // Continue with successful login below using retryData
              data.user = retryData.user;
              data.session = retryData.session;
            } else {
              toast.error('Invalid email or password');
              setIsLoading(false);
              return false;
            }
          } catch (confirmError) {
            console.error('Error confirming email:', confirmError);
            toast.error('Invalid email or password');
            setIsLoading(false);
            return false;
          }
        } else {
          toast.error('Invalid email or password');
          setIsLoading(false);
          return false;
        }
      }

      if (!data.user) {
        console.error('No user returned from authentication');
        toast.error('Login failed - no user data');
        setIsLoading(false);
        return false;
      }

      console.log('User authenticated successfully:', data.user.id);
      
      // Get student data from the database using the email
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
        toast.error('Could not fetch student profile');
        // Log out from Supabase since we couldn't complete the process
        await supabase.auth.signOut();
        setIsLoading(false);
        return false;
      }

      if (!studentData) {
        console.error('No student record found with email:', email);
        toast.error('No student profile found for this email');
        // Log out from Supabase since we couldn't complete the process
        await supabase.auth.signOut();
        setIsLoading(false);
        return false;
      }

      console.log('Student data retrieved:', studentData.name);
      
      // Create the student user object
      const studentUser: User = {
        id: data.user.id,
        name: studentData.name,
        email: studentData.email,
        role: 'student',
        avatarUrl: studentData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.name)}&background=2563EB&color=fff`,
        studentId: studentData.student_id
      };

      // Set the user in state and localStorage
      setUser(studentUser);
      localStorage.setItem('j-studios-user', JSON.stringify(studentUser));
      toast.success(`Welcome, ${studentUser.name}!`);
      setIsLoading(false);
      return true;
      
    } catch (error) {
      console.error('Unexpected error during login:', error);
      toast.error('An unexpected error occurred during login');
      setIsLoading(false);
      return false;
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
