
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
  showActions?: boolean;
  onAccept?: (messageId: string, messageType: string | null) => void;
  onDeny?: (messageId: string, messageType: string | null) => void;
  isProcessing?: boolean;
}

export function MessageItem({ 
  message, 
  showActions = false, 
  onAccept, 
  onDeny, 
  isProcessing = false 
}: MessageItemProps) {
  const isRequestMessage = (
    message.sender_role === 'student' && 
    (message.message_type === 'Leave Request' || 
     message.message_type === 'Absent Request' || 
     message.message_type === 'Submission Request')
  );

  const isPendingRequest = isRequestMessage && !message.status;

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
      
      {isPendingRequest && !showActions && (
        <div className="mt-2">
          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertDescription className="text-xs">
              Waiting for admin response...
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {isPendingRequest && showActions && onAccept && onDeny && (
        <div className="mt-3 flex gap-2 justify-end">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            onClick={() => onAccept(message.id, message.message_type)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle className="mr-1 h-3 w-3" />
            )}
            Accept
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            onClick={() => onDeny(message.id, message.message_type)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            Deny
          </Button>
        </div>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
