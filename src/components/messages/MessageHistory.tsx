
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, MessageCircle } from "lucide-react";
import { MessageItem } from './MessageItem';

interface Message {
  id: string;
  content: string;
  from_name: string;
  sender_role: string;
  message_type: string | null;
  created_at: string;
  status?: string;
}

interface MessageHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageHistory({ messages, isLoading }: MessageHistoryProps) {
  return (
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
              <MessageItem key={message.id} message={message} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
