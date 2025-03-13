
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type FormValues = z.infer<typeof formSchema>;

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'admin' | 'student'>('admin');
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/student');
    }
  }, [isAuthenticated, user, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: activeTab === 'admin' ? 'admin@jstudios.com' : '',
      password: activeTab === 'admin' ? 'admin123' : ''
    }
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'admin' | 'student');
    form.setValue('email', value === 'admin' ? 'admin@jstudios.com' : '');
    form.setValue('password', value === 'admin' ? 'admin123' : '');
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      console.log(`Attempting ${activeTab} login for: ${data.email}`);
      
      // Track login attempts for debugging
      setLoginAttempts(prev => prev + 1);
      
      const success = await login(data.email, data.password);
      
      if (!success && activeTab === 'student' && loginAttempts > 0) {
        // Show more descriptive error for students after first attempt
        toast.error(
          "If you're having trouble logging in, please contact your administrator to verify your credentials."
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-700 fade-in-0">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            J-Studios Academy
          </h1>
          <p className="text-muted-foreground">Electronic Music Production Academy</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 border border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full mb-6" onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="student">Student</TabsTrigger>
              </TabsList>
            </Tabs>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={activeTab === 'admin' ? "admin@jstudios.com" : "Enter your student email"}
                          type="email"
                          disabled={isLoading}
                          className={cn(
                            "backdrop-blur-sm bg-white/50 border border-input transition-all duration-200",
                            "focus:border-primary focus:ring-1 focus:ring-primary"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={activeTab === 'admin' ? "admin123" : "Enter your password"}
                          type="password"
                          disabled={isLoading}
                          className={cn(
                            "backdrop-blur-sm bg-white/50 border border-input transition-all duration-200",
                            "focus:border-primary focus:ring-1 focus:ring-primary"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full transition-all bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
            {activeTab === 'admin' ? (
              <p>
                Demo credentials are pre-filled for admin access
              </p>
            ) : (
              <p>
                Use the login credentials created by your administrator
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
