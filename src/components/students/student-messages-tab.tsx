
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth-context';
import { Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_role: 'admin' | 'student';
  created_at: string;
  from_name: string;
}

interface StudentMessagesTabProps {
  studentId: string;
}

export default function StudentMessagesTab({ studentId }: StudentMessagesTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('student-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `student_id=eq.${studentId}`,
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(current => [...current, newMessage]);
        scrollToBottom();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          student_id: studentId,
          content: newMessage.trim(),
          sender_role: user.role,
          from_name: user.name
        });
        
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[600px] border rounded-md">
      <div className="p-4 border-b flex items-center gap-2 bg-muted/30">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Messages</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-2 opacity-20" />
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex flex-col ${
                message.sender_role === 'admin' ? 'items-end' : 'items-start'
              }`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender_role === 'admin' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <p className="break-words">{message.content}</p>
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span>{message.from_name}</span>
                <span>•</span>
                <span>{format(new Date(message.created_at), 'MMM d, h:mm a')}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isSending || !newMessage.trim()}
            className="h-auto"
          >
            {isSending ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
