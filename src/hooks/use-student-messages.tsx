
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message } from './use-admin-messages';

export function useStudentMessages(userId?: string) {
  const [studentMessages, setStudentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStudentMessages = async (studentId: string) => {
    if (!studentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(name), recipient:recipient_id(name)')
        .or(`recipient_id.eq.${studentId},sender_id.eq.${studentId}`);

      if (error) throw error;

      const formattedMessages: Message[] = data.map((msg: any) => ({
        ...msg,
        sender_name: msg.sender ? msg.sender.name : '',
        recipient_name: msg.recipient ? msg.recipient.name : '',
        sent_from: msg.sender_id === userId ? 'You' : (msg.sender ? msg.sender.name : ''),
        sent_to: msg.recipient_id === userId ? 'You' : (msg.recipient ? msg.recipient.name : ''),
      }));

      setStudentMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching student messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    studentMessages,
    loading,
    fetchStudentMessages
  };
}
