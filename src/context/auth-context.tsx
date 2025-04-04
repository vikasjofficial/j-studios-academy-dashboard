
import React, { createContext, useContext } from 'react';

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
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createStudentCredentials: (studentId: string, email: string, password: string) => Promise<boolean>;
  updateAdminCredentials: (email: string, currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Create the auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Re-export the AuthProvider from auth-provider.tsx
export { AuthProvider } from './auth-provider';
