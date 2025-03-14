
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard-layout';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define form schema for admin credential updates
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Settings() {
  const { user, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      // For the admin mock user, we need to update localStorage
      const storedUser = localStorage.getItem('j-studios-user');
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        // First check if current password is correct
        if (parsedUser.email === 'admin@jstudios.com' && values.currentPassword !== 'admin123') {
          toast.error('Current password is incorrect');
          setIsSubmitting(false);
          return;
        }
        
        // Update admin credentials in localStorage
        localStorage.removeItem('j-studios-user');
        
        // Force logout and re-login with new credentials
        // We'll modify the auth context to handle admin credential updates
        const success = await login(values.email, values.newPassword);
        
        if (success) {
          toast.success('Credentials updated successfully');
          form.reset({
            email: values.email,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        } else {
          toast.error('Failed to update credentials');
        }
      }
    } catch (error) {
      console.error('Error updating admin credentials:', error);
      toast.error('An error occurred while updating credentials');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card className="backdrop-blur-sm border-border/40">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your profile and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormLabel>Full Name</FormLabel>
                      <Input value={user?.name} readOnly />
                    </div>
                    <div className="space-y-2">
                      <FormLabel>Role</FormLabel>
                      <Input value={user?.role} readOnly className="capitalize" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <Input value={user?.email} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card className="backdrop-blur-sm border-border/40">
              <CardHeader>
                <CardTitle>Update Credentials</CardTitle>
                <CardDescription>
                  Change the email and password used to log in to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.role !== 'admin' && (
                  <Alert className="mb-6">
                    <AlertDescription>
                      Only admin users can update credentials.
                    </AlertDescription>
                  </Alert>
                )}
                
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
                              placeholder="admin@example.com"
                              type="email"
                              disabled={isSubmitting || user?.role !== 'admin'}
                              className="bg-background/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter current password"
                                type="password"
                                disabled={isSubmitting || user?.role !== 'admin'}
                                className="bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter new password"
                                type="password"
                                disabled={isSubmitting || user?.role !== 'admin'}
                                className="bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Confirm new password"
                                type="password"
                                disabled={isSubmitting || user?.role !== 'admin'}
                                className="bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || user?.role !== 'admin'}
                      className="mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Credentials'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
