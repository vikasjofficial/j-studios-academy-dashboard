
import React from 'react';
import { MessageItem } from './MessageItem';
import { TransformedMessage } from '@/hooks/use-admin-messages';

interface MessageListProps {
  messages: TransformedMessage[];
  onUpdateStatus: (id: string, status: 'read' | 'pending' | 'approved' | 'rejected') => void;
  emptyMessage?: string;
  isSentFolder?: boolean;
  showApprovalButtons?: boolean;
}

export function MessageList({ 
  messages, 
  onUpdateStatus, 
  emptyMessage = "No messages", 
  isSentFolder = false,
  showApprovalButtons = false 
}: MessageListProps) {
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
