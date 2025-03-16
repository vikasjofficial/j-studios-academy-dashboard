
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message } from './use-admin-messages';

export function useStudentMessages(userId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const fetchMessages = async (studentId: string) => {
    if (!studentId) return;
    
    setIsLoading(true);
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

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching student messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (data: { content?: string; message_type?: string }, userName: string) => {
    if (!userId) return false;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          student_id: userId,
          content: data.content || '',
          sender_role: 'student',
          from_name: userName,
          message_type: data.message_type
        });
        
      if (error) throw error;
      
      fetchMessages(userId);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isLoading,
    isSending,
    fetchMessages,
    sendMessage
  };
}
