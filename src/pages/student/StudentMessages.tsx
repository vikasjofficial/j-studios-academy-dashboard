
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth-context';
import { Send, MessageCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

export default function StudentMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
      message_type: "General"
    },
  });
  
  useEffect(() => {
    if (user?.id) {
      fetchMessages();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('student-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `student_id=eq.${user.id}`,
        }, (payload) => {
          const newMessage = payload.new as Message;
          setMessages(current => [...current, newMessage]);
          scrollToBottom();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const fetchMessages = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('student_id', user.id)
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
  
  const sendMessage = async (data: z.infer<typeof messageSchema>) => {
    if (!user?.id) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          student_id: user.id,
          content: data.content,
          sender_role: 'student',
          from_name: user.name,
          message_type: data.message_type
        });
        
      if (error) throw error;
      
      form.reset({
        content: "",
        message_type: "General"
      });
      setComposeDialogOpen(false);
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
  
  const getMessageTypeColor = (type?: string) => {
    switch (type) {
      case 'Leave Request':
        return 'bg-orange-100 text-orange-800';
      case 'Absent Request':
        return 'bg-red-100 text-red-800';
      case 'Submission Request':
        return 'bg-blue-100 text-blue-800';
      case 'Admin Response':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please login to view your messages</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Communicate with your instructors and administrators</p>
      </div>
      
      <Card className="flex flex-col h-[70vh]">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Messages
            </CardTitle>
            <Button onClick={() => setComposeDialogOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageCircle className="h-12 w-12 mb-2 opacity-20" />
                <p>No messages yet</p>
                <p className="text-sm">Start a conversation with your instructors</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex flex-col ${
                    message.sender_role === 'student' ? 'items-end' : 'items-start'
                  }`}
                >
                  {message.message_type && message.sender_role === 'student' && (
                    <div className="mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getMessageTypeColor(message.message_type)}`}>
                        {message.message_type}
                      </span>
                    </div>
                  )}
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender_role === 'student' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span>{message.from_name}</span>
                    <span>•</span>
                    <span>{format(new Date(message.created_at), 'MMMM d, h:mm a')}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Redesigned Compose Message Dialog */}
      <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              New Message
            </DialogTitle>
            <DialogDescription>
              Send a message to your instructors and administrators
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="relative p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-100">
              <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-grid-pattern"></div>
              <div className="relative">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(sendMessage)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="message_type"
                      render={({ field }) => (
                        <FormItem>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a message type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="General">General</SelectItem>
                              <SelectItem value="Leave Request">Leave Request</SelectItem>
                              <SelectItem value="Absent Request">Absent Request</SelectItem>
                              <SelectItem value="Submission Request">Submission Request</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <Textarea 
                              placeholder="Type your message here..." 
                              className="min-h-[100px] resize-none border-gray-200 focus:border-primary" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between items-center pt-2">
                      <Button 
                        type="button"
                        variant="ghost" 
                        onClick={() => setComposeDialogOpen(false)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                      </Button>
                      
                      <Button 
                        type="submit" 
                        className="px-4"
                        disabled={isSending || form.formState.isSubmitting}
                      >
                        {isSending || form.formState.isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
