
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle, XCircle, X, MessageCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface StudentMessagesTabProps {
  studentId: string;
  studentName: string;
}

const messageSchema = z.object({
  content: z.string().min(1, { message: "Message cannot be empty" }),
  message_type: z.string().min(1, { message: "Please select a message type" })
});

interface Message {
  id: string;
  content: string;
  from_name: string;
  sender_role: string;
  message_type: string | null;
  created_at: string;
  status?: string;
}

export function StudentMessagesTab({ studentId, studentName }: StudentMessagesTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
      message_type: "General"
    },
  });

  useEffect(() => {
    fetchMessages();
  }, [studentId]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    try {
      const newMessage = {
        student_id: studentId,
        content: data.content,
        from_name: studentName,
        sender_role: 'student',
        message_type: data.message_type
      };

      const { error } = await supabase.from('messages').insert(newMessage);
      
      if (error) throw error;
      
      toast.success('Message sent successfully');
      form.reset({
        content: "",
        message_type: "General"
      });
      
      setComposeDialogOpen(false);
      // Refresh messages
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };

  const getMessageTypeLabel = (type: string | null) => {
    if (!type) return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">General</span>;
    
    switch (type) {
      case "Leave Request":
        return <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">Leave Request</span>;
      case "Absent Request":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Absent Request</span>;
      case "Submission Request":
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Submission Request</span>;
      case "Response":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Response</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">General</span>;
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    
    switch (status) {
      case "accepted":
        return <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" /> Accepted
        </span>;
      case "denied":
        return <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full flex items-center">
          <XCircle className="h-3 w-3 mr-1" /> Denied
        </span>;
      default:
        return null;
    }
  };

  const isRequestMessage = (message: Message) => {
    return (
      message.sender_role === 'student' && 
      (message.message_type === 'Leave Request' || 
       message.message_type === 'Absent Request' || 
       message.message_type === 'Submission Request')
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Messages</CardTitle>
            <Button onClick={() => setComposeDialogOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
          <CardDescription>
            Send messages to the admin. Your messages will be visible to all admins.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>
            View your message history with admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mb-2 opacity-20 mx-auto" />
              <p>No messages yet</p>
              <p className="text-sm">Start a conversation with the instructors</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-4 rounded-lg ${
                    message.sender_role === 'student' 
                      ? 'bg-primary/10 ml-12' 
                      : 'bg-secondary/10 mr-12'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <div className="font-medium flex items-center gap-2">
                      {message.from_name} 
                      {message.message_type && getMessageTypeLabel(message.message_type)}
                      {message.status && getStatusBadge(message.status)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  
                  {isRequestMessage(message) && !message.status && (
                    <div className="mt-2">
                      <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                        <AlertDescription className="text-xs">
                          Waiting for admin response...
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="message_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Type</FormLabel>
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
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Type your message here..." 
                              className="min-h-[120px] resize-none" 
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
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
