
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth-context';
import { Key, Save } from 'lucide-react';

const formSchema = z.object({
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters." })
    .max(100, { message: "Password must be less than 100 characters." }),
  confirmPassword: z.string()
    .min(6, { message: "Password must be at least 6 characters." })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface Student {
  id: string;
  name: string;
  email: string;
  student_id: string;
}

interface StudentCredentialsFormProps {
  student: Student;
}

export default function StudentCredentialsForm({ student }: StudentCredentialsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createStudentCredentials } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const success = await createStudentCredentials(
        student.student_id,
        student.email,
        values.password
      );

      if (success) {
        form.reset();
        toast({
          title: "Success",
          description: `Login credentials created for ${student.name}`,
        });
      }
    } catch (error) {
      console.error('Error creating credentials:', error);
      toast({
        title: "Error",
        description: "Failed to create login credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md mb-4">
          <h3 className="text-md font-medium flex items-center gap-2 mb-2">
            <Key className="h-4 w-4" />
            Create Login Credentials
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            This will create login credentials for {student.name} using their email: {student.email}
          </p>
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Enter student password" 
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
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Confirm password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Credentials
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
