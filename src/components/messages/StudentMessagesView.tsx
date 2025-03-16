
import React, { useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageItem } from './MessageItem';
import { useStudentMessages } from '@/hooks/use-student-messages';
import { Message } from '@/hooks/use-admin-messages';

interface StudentMessagesViewProps {
  selectedStudent: string | null;
  userId?: string;
  onUpdateStatus: (messageId: string, status: 'read' | 'pending' | 'approved' | 'rejected') => void;
}

export function StudentMessagesView({ 
  selectedStudent, 
  userId,
  onUpdateStatus 
}: StudentMessagesViewProps) {
  const { messages, isLoading, fetchMessages } = useStudentMessages(userId);

  useEffect(() => {
    if (selectedStudent) {
      fetchMessages();
    }
  }, [selectedStudent, fetchMessages]);

  if (!selectedStudent) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Select a student to view their messages</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All Messages</TabsTrigger>
        <TabsTrigger value="requests">Requests</TabsTrigger>
        <TabsTrigger value="accepted">Accepted Requests</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <div className="bg-muted/30 rounded-lg p-4 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading messages...
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map(message => (
                <MessageItem 
                  key={message.id}
                  message={{
                    id: message.id,
                    content: message.content,
                    from_name: message.from_name || '',
                    sender_role: message.sender_role || 'student',
                    message_type: message.message_type || 'general',
                    created_at: message.created_at,
                    status: message.status || 'pending'
                  }}
                  onAccept={message.message_type === 'request' && message.status === 'pending' ? 
                    () => onUpdateStatus(message.id, 'approved') : undefined}
                  onDeny={message.message_type === 'request' && message.status === 'pending' ? 
                    () => onUpdateStatus(message.id, 'rejected') : undefined}
                  showActions={message.message_type === 'request' && message.status === 'pending'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No messages with this student
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="requests">
        <div className="bg-muted/30 rounded-lg p-4 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading requests...
            </div>
          ) : messages.filter(m => m.message_type === 'request').length > 0 ? (
            <div className="space-y-3">
              {messages
                .filter(m => m.message_type === 'request')
                .map(message => (
                  <MessageItem 
                    key={message.id}
                    message={{
                      id: message.id,
                      content: message.content,
                      from_name: message.from_name || '',
                      sender_role: message.sender_role || 'student',
                      message_type: message.message_type || 'request',
                      created_at: message.created_at,
                      status: message.status || 'pending'
                    }}
                    onAccept={message.status === 'pending' ? 
                      () => onUpdateStatus(message.id, 'approved') : undefined}
                    onDeny={message.status === 'pending' ? 
                      () => onUpdateStatus(message.id, 'rejected') : undefined}
                    showActions={message.status === 'pending'}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No request messages from this student
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="accepted">
        <div className="bg-muted/30 rounded-lg p-4 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading accepted requests...
            </div>
          ) : messages.filter(m => m.message_type === 'request' && m.status === 'approved').length > 0 ? (
            <div className="space-y-3">
              {messages
                .filter(m => m.message_type === 'request' && m.status === 'approved')
                .map(message => (
                  <MessageItem 
                    key={message.id}
                    message={{
                      id: message.id,
                      content: message.content,
                      from_name: message.from_name || '',
                      sender_role: message.sender_role || 'student',
                      message_type: message.message_type || 'request',
                      created_at: message.created_at,
                      status: message.status || 'approved'
                    }}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No accepted requests from this student
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
