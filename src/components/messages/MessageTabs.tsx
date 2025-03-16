
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MessageList } from './MessageList';
import { AcceptedRequestsList } from './AcceptedRequestsList';
import { TransformedMessage } from '@/hooks/use-admin-messages';

interface MessageTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  inboxMessages: TransformedMessage[];
  sentMessages: TransformedMessage[];
  requestMessages: TransformedMessage[];
  acceptedRequests: TransformedMessage[];
  isAcceptedRequestsLoading: boolean;
  onUpdateStatus: (id: string, status: 'read' | 'pending' | 'approved' | 'rejected') => void;
}

export function MessageTabs({
  activeTab,
  setActiveTab,
  inboxMessages,
  sentMessages,
  requestMessages,
  acceptedRequests,
  isAcceptedRequestsLoading,
  onUpdateStatus
}: MessageTabsProps) {
  return (
    <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="inbox" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Inbox
          {inboxMessages.filter(m => m.status === 'sent').length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {inboxMessages.filter(m => m.status === 'sent').length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Sent
        </TabsTrigger>
        <TabsTrigger value="requests" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Requests
          {requestMessages.filter(m => m.status === 'pending').length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {requestMessages.filter(m => m.status === 'pending').length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="accepted" className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Accepted Requests
        </TabsTrigger>
      </TabsList>

      <div>
        <TabsContent value="inbox">
          <MessageList
            messages={inboxMessages}
            onUpdateStatus={onUpdateStatus}
            emptyMessage="No incoming messages"
          />
        </TabsContent>

        <TabsContent value="sent">
          <MessageList 
            messages={sentMessages} 
            onUpdateStatus={onUpdateStatus}
            emptyMessage="No sent messages"
            isSentFolder={true}
          />
        </TabsContent>

        <TabsContent value="requests">
          <MessageList
            messages={requestMessages}
            onUpdateStatus={onUpdateStatus}
            emptyMessage="No pending requests"
            showApprovalButtons={true}
          />
        </TabsContent>

        <TabsContent value="accepted">
          <AcceptedRequestsList 
            requests={acceptedRequests}
            isLoading={isAcceptedRequestsLoading}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
