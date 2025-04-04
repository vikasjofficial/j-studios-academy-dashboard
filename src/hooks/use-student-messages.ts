
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
  const [isDeleting, setIsDeleting] = useState(false);

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
      
      // No need to fetch messages here as the realtime subscription will update the UI
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!userId) return false;
    
    setIsDeleting(true);
    try {
      console.log(`Attempting to delete message with ID: ${messageId}`);
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
        
      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      console.log(`Message deleted successfully`);
      
      // Message will be removed from state by the realtime subscription
      toast.success("Message permanently deleted");
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error("Failed to delete message");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMessages();
      
      // Set up realtime subscription
      const channel = supabase
        .channel('student-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `student_id=eq.${userId}`,
        }, (payload) => {
          const newMessage = payload.new as Message;
          console.log('Realtime: New message received', newMessage);
          setMessages(current => [...current, newMessage]);
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `student_id=eq.${userId}`,
        }, (payload) => {
          const deletedMessage = payload.old as Message;
          console.log('Realtime: Message deleted', deletedMessage);
          setMessages(current => 
            current.filter(message => message.id !== deletedMessage.id)
          );
        })
        .subscribe();
        
      console.log('Realtime subscription activated for student_id:', userId);
        
      return () => {
        console.log('Cleaning up realtime subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  return {
    messages,
    isLoading,
    isSending,
    isDeleting,
    fetchMessages,
    sendMessage,
    deleteMessage
  };
}
