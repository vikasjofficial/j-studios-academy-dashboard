
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog } from "@/components/ui/dialog";
import { MessageHistory } from "@/components/messages/MessageHistory";
import { ComposeMessageDialog } from "@/components/messages/ComposeMessageDialog";
import * as z from "zod";

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
  const [isSending, setIsSending] = useState(false);

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
      setIsSending(true);
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
      setComposeDialogOpen(false);
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
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
      
      <MessageHistory messages={messages} isLoading={isLoading} />

      <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
        <ComposeMessageDialog 
          onSubmit={onSubmit} 
          onClose={() => setComposeDialogOpen(false)} 
          isSending={isSending} 
        />
      </Dialog>
    </div>
  );
}
