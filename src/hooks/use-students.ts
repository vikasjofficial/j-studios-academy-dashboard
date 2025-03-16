
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, email, avatar_url');

      if (error) throw error;
      
      // Transform the data to match the Student type
      const transformedData: Student[] = data?.map(student => ({
        id: student.id,
        first_name: student.name.split(' ')[0] || '',
        last_name: student.name.split(' ').slice(1).join(' ') || '',
        email: student.email,
        profile_image: student.avatar_url
      })) || [];
      
      setStudents(transformedData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, fetchStudents };
}
