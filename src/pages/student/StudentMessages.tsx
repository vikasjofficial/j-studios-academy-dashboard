
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth-context';
import { Send, MessageCircle } from 'lucide-react';
import { Dialog } from "@/components/ui/dialog";
import { MessageList } from '@/components/messages/MessageList';
import { ComposeMessageDialog } from '@/components/messages/ComposeMessageDialog';
import { useStudentMessages } from '@/hooks/use-student-messages';
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
  
  // Mark all admin messages as checked when the page loads
  useEffect(() => {
    if (messages && messages.length > 0) {
      const checkedMessages = JSON.parse(localStorage.getItem('checkedMessages') || '{}');
      let updated = false;

      messages.forEach(message => {
        if (message.sender_role === 'admin' && !checkedMessages[message.id]) {
          checkedMessages[message.id] = true;
          updated = true;
        }
      });

      if (updated) {
        localStorage.setItem('checkedMessages', JSON.stringify(checkedMessages));
      }
    }
  }, [messages]);
  
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
  
  return (
    <div className="flex w-full">
      {/* Empty div on the left side */}
      <div className="hidden md:block w-16 md:w-24 lg:w-28 flex-shrink-0"></div>
      
      <div className="space-y-6 w-full">
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
            <MessageList messages={messages} isLoading={isLoading} />
          </CardContent>
        </Card>

        <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
          <ComposeMessageDialog
            onSubmit={handleSendMessage}
            onClose={() => setComposeDialogOpen(false)}
            isSending={isSending}
          />
        </Dialog>
      </div>
    </div>
  );
}
