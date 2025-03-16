
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message, TransformedMessage } from './use-admin-messages';

export function useAcceptedRequests() {
  const [acceptedRequests, setAcceptedRequests] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAcceptedRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(name), recipient:recipient_id(name)')
        .eq('status', 'approved')
        .eq('type', 'request');

      if (error) throw error;

      const formattedMessages: Message[] = data?.map((msg: any) => ({
        ...msg,
        sender_name: msg.sender ? msg.sender.name : '',
        recipient_name: msg.recipient ? msg.recipient.name : ''
      })) || [];

      setAcceptedRequests(formattedMessages);
    } catch (error) {
      console.error('Error fetching accepted requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load accepted requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Transform messages to the format expected by AcceptedRequestsList
  const getTransformedRequests = (): TransformedMessage[] => {
    return acceptedRequests.map(request => ({
      id: request.id,
      content: request.content,
      from_name: request.sender_name || '',
      sender_role: 'student',
      message_type: request.type || 'request',
      created_at: request.created_at,
      status: request.status || 'approved'
    }));
  };

  useEffect(() => {
    fetchAcceptedRequests();
  }, []);

  return {
    acceptedRequests,
    loading,
    fetchAcceptedRequests,
    getTransformedRequests
  };
}
