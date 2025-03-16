
import React from 'react';
import { MessageItem } from './MessageItem';
import { TransformedMessage } from '@/hooks/use-admin-messages';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: TransformedMessage[];
  onUpdateStatus: (id: string, status: 'read' | 'pending' | 'approved' | 'rejected') => void;
  emptyMessage?: string;
  isSentFolder?: boolean;
  showApprovalButtons?: boolean;
  isLoading?: boolean;
}

export function MessageList({ 
  messages, 
  onUpdateStatus, 
  emptyMessage = "No messages", 
  isSentFolder = false,
  showApprovalButtons = false,
  isLoading = false
}: MessageListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <MessageItem 
          key={message.id}
          message={message}
          showActions={showApprovalButtons && message.status === 'pending'}
          onAccept={showApprovalButtons ? 
            () => onUpdateStatus(message.id, 'approved') : undefined}
          onDeny={showApprovalButtons ? 
            () => onUpdateStatus(message.id, 'rejected') : undefined}
        />
      ))}
    </div>
  );
}
