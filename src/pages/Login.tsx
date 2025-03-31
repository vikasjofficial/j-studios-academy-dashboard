
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Laptop, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import styles from '@/styles/moving-border.module.css';

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
  const [showPassword, setShowPassword] = useState(false);

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
      password: ''
    }
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'admin' | 'student');
    form.setValue('email', value === 'admin' ? 'admin@jstudios.com' : '');
    form.setValue('password', '');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#222131] to-[#383565] p-4">
      {/* Logo with glowing border */}
      <div className={`${styles.movingBorderWrapper} mb-8 rounded-2xl overflow-hidden`}>
        <div className="p-1">
          <img 
            src="https://images.pexels.com/photos/31419747/pexels-photo-31419747.jpeg" 
            alt="J-Studios Logo" 
            className="w-48 h-48 object-cover rounded-xl"
          />
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-blue-400">
          J STUDIOS ACADEMY
        </h1>
        <p className="text-gray-400 mt-2">Education Management System</p>
      </div>
      
      <Card className="w-full max-w-md border-0 shadow-2xl bg-card/30 backdrop-blur-lg">
        <CardContent className="pt-6">
          <Tabs defaultValue="admin" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="admin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Laptop className="mr-2 h-4 w-4" />
                Admin
              </TabsTrigger>
              <TabsTrigger value="student" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <User className="mr-2 h-4 w-4" />
                Student
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="admin@jstudios.com"
                            type="email"
                            autoComplete="email"
                            disabled={isLoading}
                            className="h-12 bg-background/50 backdrop-blur-sm border-border/50"
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
                      <FormItem className="relative">
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter your password"
                              type={showPassword ? "text" : "password"}
                              disabled={isLoading}
                              className="h-12 bg-background/50 backdrop-blur-sm border-border/50 pr-10"
                              {...field}
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-3 text-muted-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center">
                    <Checkbox id="remember" className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground">
                      Remember me for 30 days
                    </label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90"
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
            </TabsContent>
            
            <TabsContent value="student">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter your student email"
                            type="email"
                            autoComplete="email"
                            disabled={isLoading}
                            className="h-12 bg-background/50 backdrop-blur-sm border-border/50"
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
                      <FormItem className="relative">
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter your password"
                              type={showPassword ? "text" : "password"}
                              disabled={isLoading}
                              className="h-12 bg-background/50 backdrop-blur-sm border-border/50 pr-10"
                              {...field}
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-3 text-muted-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center">
                    <Checkbox id="remember-student" className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <label htmlFor="remember-student" className="ml-2 text-sm text-muted-foreground">
                      Remember me for 30 days
                    </label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90"
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
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Need help? Contact <a className="text-primary hover:underline" href="#">support@jstudios.com</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
