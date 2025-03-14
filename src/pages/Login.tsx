
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
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

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
  const [activeSlide, setActiveSlide] = useState(0);

  // Carousel data for the hero side
  const heroSlides = [
    {
      title: "Capturing Moments, Creating Memories",
      subtitle: "Electronic Music Production Academy"
    },
    {
      title: "Learn. Create. Innovate.",
      subtitle: "Master the art of music production"
    },
    {
      title: "Your Journey Starts Here",
      subtitle: "Join our community of music creators"
    }
  ];

  // Auto slide change effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

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
    <div className="min-h-screen flex items-stretch bg-[#2D2B36]">
      {/* Left hero section */}
      <div className="hidden md:flex flex-1 flex-col relative overflow-hidden bg-[#6E59A5] text-white">
        <div className="absolute top-8 left-8">
          <h1 className="text-3xl font-bold tracking-tight">J-Studios</h1>
        </div>
        
        <div className="absolute top-8 right-8">
          <Button 
            variant="outline" 
            className="text-white border-white/30 bg-white/10 hover:bg-white/20 flex items-center gap-2 rounded-full px-4"
          >
            Back to website <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Hero content */}
        <div className="flex-1 flex flex-col justify-end p-12 pb-24 relative z-10">
          {heroSlides.map((slide, index) => (
            <div 
              key={index}
              className={cn(
                "transition-all duration-700 absolute bottom-24 left-12 right-12",
                activeSlide === index ? "opacity-100" : "opacity-0 translate-y-8"
              )}
            >
              <h2 className="text-3xl md:text-4xl font-semibold mb-2">{slide.title}</h2>
              <p className="text-white/70">{slide.subtitle}</p>
            </div>
          ))}
          
          {/* Slide indicators */}
          <div className="absolute bottom-12 left-12 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button 
                key={index} 
                className={cn(
                  "w-8 h-1 rounded-full transition-all", 
                  activeSlide === index ? "bg-white" : "bg-white/30"
                )}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Overlay image */}
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{ 
            backgroundImage: "url('/lovable-uploads/46879141-600c-4bab-9722-46bb3c4e697a.png')",
            opacity: 0.5
          }}
        />
      </div>
      
      {/* Right login form section */}
      <div className="flex-1 flex flex-col justify-center p-6 md:p-12 bg-[#222131]">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8 md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">
              {activeTab === 'admin' ? 'Admin Login' : 'Student Login'}
            </h1>
            <p className="text-gray-400">
              Enter your credentials to access your account
            </p>
          </div>

          <Tabs defaultValue="admin" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 w-full mb-6 bg-gray-800/50">
              <TabsTrigger value="admin" className="data-[state=active]:bg-[#6E59A5]">Admin</TabsTrigger>
              <TabsTrigger value="student" className="data-[state=active]:bg-[#6E59A5]">Student</TabsTrigger>
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
                            className="h-12 bg-gray-800/50 border-0 text-white placeholder:text-gray-500"
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
                              className="h-12 bg-gray-800/50 border-0 text-white placeholder:text-gray-500 pr-10"
                              {...field}
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-3 text-gray-400"
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
                    <Checkbox id="remember" className="border-gray-500 data-[state=checked]:bg-[#6E59A5] data-[state=checked]:border-[#6E59A5]" />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                      Remember me for 30 days
                    </label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#6E59A5] hover:bg-[#5B4A8A] text-white"
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
                            className="h-12 bg-gray-800/50 border-0 text-white placeholder:text-gray-500"
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
                              className="h-12 bg-gray-800/50 border-0 text-white placeholder:text-gray-500 pr-10"
                              {...field}
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-3 text-gray-400"
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
                    <Checkbox id="remember" className="border-gray-500 data-[state=checked]:bg-[#6E59A5] data-[state=checked]:border-[#6E59A5]" />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                      Remember me for 30 days
                    </label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#6E59A5] hover:bg-[#5B4A8A] text-white"
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
          
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Need help? Contact <a className="text-[#9b87f5] hover:underline" href="#">support@jstudios.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
