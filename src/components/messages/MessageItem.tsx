
import React from 'react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageTypeLabel } from './MessageTypeLabel';
import { StatusBadge } from './StatusBadge';

interface Message {
  id: string;
  content: string;
  from_name: string;
  sender_role: string;
  message_type: string | null;
  created_at: string;
  status?: string;
}

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isRequestMessage = (
    message.sender_role === 'student' && 
    (message.message_type === 'Leave Request' || 
     message.message_type === 'Absent Request' || 
     message.message_type === 'Submission Request')
  );

  return (
    <div 
      className={`p-4 rounded-lg ${
        message.sender_role === 'student' 
          ? 'bg-primary/10 ml-12' 
          : 'bg-secondary/10 mr-12'
      }`}
    >
      <div className="flex justify-between mb-2">
        <div className="font-medium flex items-center gap-2">
          {message.from_name} 
          {message.message_type && <MessageTypeLabel type={message.message_type} />}
          {message.status && <StatusBadge status={message.status} />}
        </div>
        <div className="text-xs text-muted-foreground">
          {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
        </div>
      </div>
      <p className="text-sm">{message.content}</p>
      
      {isRequestMessage && !message.status && (
        <div className="mt-2">
          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertDescription className="text-xs">
              Waiting for admin response...
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
