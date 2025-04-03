
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
    <div className="min-h-screen flex items-center justify-center bg-[#5d5b70] p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl shadow-2xl">
        {/* Left side - Image and tagline */}
        <div className="relative bg-gradient-to-br from-[#5b52ab] to-[#372f6a] p-8 flex flex-col">
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-white">J STUDIOS</h2>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <img 
              src="https://images.pexels.com/photos/31419747/pexels-photo-31419747.jpeg" 
              alt="J-Studios" 
              className="w-full max-w-md h-auto object-cover rounded-xl" 
            />
          </div>
          
          <div className="mt-auto text-center text-white">
            <h3 className="text-3xl font-light mb-1">J STUDIOS ACADEMY</h3>
            <p className="text-xl font-light text-white/80">Education Management System</p>
            
            <div className="flex justify-center mt-6 space-x-2">
              <div className="w-2 h-2 rounded-full bg-white/40"></div>
              <div className="w-2 h-2 rounded-full bg-white/40"></div>
              <div className="w-8 h-2 rounded-full bg-white"></div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="bg-[#1e1c2a] p-8 md:p-12 flex flex-col">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 mb-8">Please sign in to continue</p>
          
          <Tabs defaultValue="admin" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 w-full mb-6 bg-[#2a2838] h-14">
              <TabsTrigger 
                value="admin" 
                className="flex-1 justify-center py-4 data-[state=active]:bg-[#5b52ab] data-[state=active]:text-white"
              >
                <Laptop className="mr-2 h-4 w-4" />
                Admin
              </TabsTrigger>
              <TabsTrigger 
                value="student" 
                className="flex-1 justify-center py-4 data-[state=active]:bg-[#5b52ab] data-[state=active]:text-white"
              >
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
                            className="h-12 bg-[#2a2838] border-[#3f3b54] text-white placeholder:text-gray-500 focus-visible:ring-[#5b52ab]"
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
                              className="h-12 bg-[#2a2838] border-[#3f3b54] text-white placeholder:text-gray-500 focus-visible:ring-[#5b52ab] pr-10"
                              {...field}
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-3 text-gray-400 hover:text-white"
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
                    <Checkbox 
                      id="remember" 
                      className="border-[#3f3b54] data-[state=checked]:bg-[#5b52ab] data-[state=checked]:border-[#5b52ab]" 
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                      Remember me for 30 days
                    </label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#5b52ab] hover:bg-[#4a4294] text-white"
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
                            className="h-12 bg-[#2a2838] border-[#3f3b54] text-white placeholder:text-gray-500 focus-visible:ring-[#5b52ab]"
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
                              className="h-12 bg-[#2a2838] border-[#3f3b54] text-white placeholder:text-gray-500 focus-visible:ring-[#5b52ab] pr-10"
                              {...field}
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-3 text-gray-400 hover:text-white"
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
                    <Checkbox 
                      id="remember-student" 
                      className="border-[#3f3b54] data-[state=checked]:bg-[#5b52ab] data-[state=checked]:border-[#5b52ab]" 
                    />
                    <label htmlFor="remember-student" className="ml-2 text-sm text-gray-400">
                      Remember me for 30 days
                    </label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#5b52ab] hover:bg-[#4a4294] text-white"
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
          
          <div className="mt-6 pt-6 border-t border-[#3f3b54] text-center">
            <p className="text-gray-400 text-sm">
              Need help? Contact <a className="text-[#8c82e3] hover:underline" href="#">jstudiosacademy@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
