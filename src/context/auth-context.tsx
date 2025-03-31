
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

// Context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createStudentCredentials: (studentId: string, email: string, password: string) => Promise<boolean>;
  updateAdminCredentials: (email: string, currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Define StudentCredential interface to match database table
interface StudentCredential {
  id?: string;
  student_id: string;
  email: string;
  password: string;
  created_at?: string;
  updated_at?: string;
}

// Define AdminCredential interface to match database table
interface AdminCredential {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
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

  // Create student credentials with alternate approach
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

      // Store the credentials in a dedicated student_credentials table
      // This will be used during login to authenticate students
      const credentials: StudentCredential = {
        student_id: studentData.id,
        email: email,
        password: password
      };

      const { error: upsertError } = await supabase
        .from('student_credentials')
        .upsert(credentials, { 
          onConflict: 'student_id' 
        });

      if (upsertError) {
        console.error('Error storing student credentials:', upsertError);
        toast.error(upsertError.message || 'Failed to save student credentials');
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
    
    try {
      // Check for admin login first
      const { data: adminData, error: adminError } = await supabase
        .from('admin_credentials')
        .select('*')
        .eq('email', email)
        .single();
      
      if (adminData && !adminError) {
        // Check if password matches
        if (adminData.password === password) {
          // Admin login successful
          const adminUser: User = {
            id: adminData.id,
            name: adminData.name,
            email: adminData.email,
            role: 'admin',
            avatarUrl: adminData.avatar_url || `https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff`
          };
          
          setUser(adminUser);
          localStorage.setItem('j-studios-user', JSON.stringify(adminUser));
          toast.success(`Welcome back, Admin!`);
          setIsLoading(false);
          return true;
        } else {
          console.error('Admin password does not match');
          toast.error('Invalid email or password');
          setIsLoading(false);
          return false;
        }
      }
      
      // If not an admin, try student login
      console.log('Attempting student login for:', email);
      
      // For student login, check the student_credentials table
      const { data: credentialData, error: credentialError } = await supabase
        .from('student_credentials')
        .select('*')
        .eq('email', email)
        .single();
      
      if (credentialError || !credentialData) {
        console.error('No credentials found for this email');
        toast.error('Invalid email or password');
        setIsLoading(false);
        return false;
      }
      
      // Check if password matches
      if (credentialData.password !== password) {
        console.error('Password does not match');
        toast.error('Invalid email or password');
        setIsLoading(false);
        return false;
      }
      
      // If credentials match, get the student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', credentialData.student_id)
        .single();

      if (studentError || !studentData) {
        console.error('Error fetching student data:', studentError);
        toast.error('Could not fetch student profile');
        setIsLoading(false);
        return false;
      }

      console.log('Student data retrieved:', studentData.name);
      
      // Create the student user object
      const studentUser: User = {
        id: studentData.id,
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

  // Update admin credentials
  const updateAdminCredentials = async (email: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // First, verify the admin exists and the current password is correct
      const { data: adminData, error: fetchError } = await supabase
        .from('admin_credentials')
        .select('*')
        .eq('email', user?.email || '')
        .single();
      
      if (fetchError || !adminData) {
        toast.error('Admin account not found');
        setIsLoading(false);
        return false;
      }
      
      // Verify current password is correct
      if (adminData.password !== currentPassword) {
        toast.error('Current password is incorrect');
        setIsLoading(false);
        return false;
      }
      
      // Update the admin credentials in the database
      const { error: updateError } = await supabase
        .from('admin_credentials')
        .update({
          email: email,
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminData.id);
      
      if (updateError) {
        console.error('Error updating admin credentials:', updateError);
        toast.error('Failed to update admin credentials');
        setIsLoading(false);
        return false;
      }
      
      // Update the current user in state if logged in as admin
      if (user && user.role === 'admin') {
        const updatedUser = {
          ...user,
          email,
        };
        
        setUser(updatedUser);
        localStorage.setItem('j-studios-user', JSON.stringify(updatedUser));
      }
      
      toast.success('Admin credentials updated successfully');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error updating admin credentials:', error);
      toast.error('Failed to update admin credentials');
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
    logout,
    createStudentCredentials,
    updateAdminCredentials
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
