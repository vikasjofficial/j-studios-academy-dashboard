
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth-context';
import { Send, MessageCircle } from 'lucide-react';
import { Dialog } from "@/components/ui/dialog";
import { MessageList } from '@/components/messages/MessageList';
import { ComposeMessageDialog } from '@/components/messages/ComposeMessageDialog';
import { useStudentMessages } from '@/hooks/use-student-messages';
import { TransformedMessage } from '@/hooks/use-admin-messages';
import * as z from "zod";

const messageSchema = z.object({
  content: z.string().min(1, { message: "Message cannot be empty" }),
  message_type: z.string().min(1, { message: "Please select a message type" })
});

export default function StudentMessages() {
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { 
    messages, 
    isLoading, 
    isSending, 
    sendMessage 
  } = useStudentMessages(user?.id);
  
  const handleSendMessage = async (data: z.infer<typeof messageSchema>) => {
    if (!user?.id || !user?.name) return;
    
    const success = await sendMessage(data, user.name);
    if (success) {
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
      setComposeDialogOpen(false);
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
  
  const transformedMessages: TransformedMessage[] = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    from_name: msg.from_name || '',
    sender_role: msg.sender_role || 'student',
    message_type: msg.message_type || 'general',
    created_at: msg.created_at,
    status: msg.status || 'pending'
  }));
  
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
          <MessageList 
            messages={transformedMessages} 
            onUpdateStatus={() => {}} 
            emptyMessage="No messages yet" 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>

      <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
        <ComposeMessageDialog
          onSubmit={handleSendMessage}
          onClose={() => setComposeDialogOpen(false)}
          isSending={isSending}
          onOpenChange={setComposeDialogOpen}
        />
      </Dialog>
    </div>
  );
}
