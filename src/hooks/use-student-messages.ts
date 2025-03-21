
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as z from "zod";

interface Message {
  id: string;
  content: string;
  sender_role: string;
  created_at: string;
  from_name: string;
  student_id: string;
  message_type?: string;
}

const messageSchema = z.object({
  content: z.string().min(1, { message: "Message cannot be empty" }),
  message_type: z.string().min(1, { message: "Please select a message type" })
});

export function useStudentMessages(userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchMessages = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('student_id', userId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (data: z.infer<typeof messageSchema>, userName: string) => {
    if (!userId) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          student_id: userId,
          content: data.content,
          sender_role: 'student',
          from_name: userName,
          message_type: data.message_type
        });
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMessages();
      
      const channel = supabase
        .channel('student-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `student_id=eq.${userId}`,
        }, (payload) => {
          const newMessage = payload.new as Message;
          setMessages(current => [...current, newMessage]);
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  return {
    messages,
    isLoading,
    isSending,
    fetchMessages,
    sendMessage
  };
}
