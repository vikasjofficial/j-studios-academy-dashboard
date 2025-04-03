
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/context/auth-context';
import { Eye, EyeOff, Key } from 'lucide-react';

interface StudentCredentialsViewProps {
  studentId: string;
}

export default function StudentCredentialsView({ studentId }: StudentCredentialsViewProps) {
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();

  // Only admin users should be able to view this component
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin || !studentId) return;
    
    async function fetchCredentials() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('student_credentials')
          .select('email, password')
          .eq('student_id', studentId)
          .single();
          
        if (error) {
          console.error('Error fetching credentials:', error);
          return;
        }
        
        setCredentials(data);
      } catch (error) {
        console.error('Error in fetchCredentials:', error);
        toast.error('Failed to load student credentials');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCredentials();
  }, [studentId, isAdmin]);
  
  if (!isAdmin) return null;
  
  return (
    <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
          <Key className="h-5 w-5" />
          <h3 className="font-medium">Current Login Credentials</h3>
        </div>
        
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading credentials...</p>
        ) : !credentials ? (
          <p className="text-sm text-muted-foreground">No login credentials found for this student.</p>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Login Email/ID:</p>
              <p className="font-mono bg-background/50 p-2 rounded-md text-sm">{credentials.email}</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Password:</p>
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="h-3 w-3" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" /> Show
                    </>
                  )}
                </button>
              </div>
              
              <p className="font-mono bg-background/50 p-2 rounded-md text-sm">
                {showPassword ? credentials.password : '••••••••'}
              </p>
            </div>
            
            <p className="text-xs text-amber-600 dark:text-amber-400 italic mt-2">
              Only administrators can view these credentials. Share with the student if they've forgotten their login information.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
