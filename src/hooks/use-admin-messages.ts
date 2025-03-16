
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  status: 'sent' | 'read' | 'pending' | 'approved' | 'rejected';
  type: 'general' | 'announcement' | 'request';
  created_at: string;
  sender_name?: string;
  recipient_name?: string;
  sent_from?: string;
  sent_to?: string;
}

// Transformed message type for components
export interface TransformedMessage {
  id: string;
  content: string;
  from_name: string;
  sender_role: string;
  message_type: string | null;
  created_at: string;
  status?: string;
}

export function useAdminMessages(userId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(name), recipient:recipient_id(name)')
        .or(`recipient_id.eq.${userId},sender_id.eq.${userId}`);

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
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: 'read' | 'pending' | 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId);

      if (error) throw error;

      // Update local state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));
      
      toast({
        title: 'Success',
        description: `Message ${status === 'read' ? 'marked as read' : status}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating message status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update message status',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getInboxMessages = (searchQuery = '', statusFilter = '', typeFilter = '') => {
    return messages.filter(message => {
      const matchesSearch = 
        message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter ? message.status === statusFilter : true;
      const matchesType = typeFilter ? message.type === typeFilter : true;
      
      return matchesSearch && matchesStatus && matchesType && message.recipient_id === userId;
    });
  };

  const getSentMessages = (searchQuery = '', statusFilter = '', typeFilter = '') => {
    return messages.filter(message => {
      const matchesSearch = 
        message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter ? message.status === statusFilter : true;
      const matchesType = typeFilter ? message.type === typeFilter : true;
      
      return matchesSearch && matchesStatus && matchesType && message.sender_id === userId;
    });
  };

  const getRequestMessages = (searchQuery = '', statusFilter = '', typeFilter = '') => {
    return messages.filter(message => {
      const matchesSearch = 
        message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter ? message.status === statusFilter : true;
      const matchesType = typeFilter ? message.type === typeFilter : true;
      
      return matchesSearch && matchesStatus && matchesType && message.type === 'request' && message.recipient_id === userId;
    });
  };

  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId]);

  return {
    messages,
    loading,
    fetchMessages,
    updateMessageStatus,
    getInboxMessages,
    getSentMessages,
    getRequestMessages
  };
}
