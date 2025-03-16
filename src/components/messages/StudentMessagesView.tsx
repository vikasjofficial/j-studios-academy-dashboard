
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
  const { studentMessages, loading, fetchStudentMessages } = useStudentMessages(userId);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentMessages(selectedStudent);
    }
  }, [selectedStudent]);

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
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading messages...
            </div>
          ) : studentMessages.length > 0 ? (
            <div className="space-y-3">
              {studentMessages.map(message => (
                <MessageItem 
                  key={message.id}
                  message={{
                    id: message.id,
                    content: message.content,
                    from_name: message.sender_name || '',
                    sender_role: message.sender_id === userId ? 'admin' : 'student',
                    message_type: message.type,
                    created_at: message.created_at,
                    status: message.status
                  }}
                  onAccept={message.type === 'request' && message.status === 'pending' ? 
                    () => onUpdateStatus(message.id, 'approved') : undefined}
                  onDeny={message.type === 'request' && message.status === 'pending' ? 
                    () => onUpdateStatus(message.id, 'rejected') : undefined}
                  showActions={message.type === 'request' && message.status === 'pending'}
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
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading requests...
            </div>
          ) : studentMessages.filter(m => m.type === 'request').length > 0 ? (
            <div className="space-y-3">
              {studentMessages
                .filter(m => m.type === 'request')
                .map(message => (
                  <MessageItem 
                    key={message.id}
                    message={{
                      id: message.id,
                      content: message.content,
                      from_name: message.sender_name || '',
                      sender_role: message.sender_id === userId ? 'admin' : 'student',
                      message_type: message.type,
                      created_at: message.created_at,
                      status: message.status
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
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading accepted requests...
            </div>
          ) : studentMessages.filter(m => m.type === 'request' && m.status === 'approved').length > 0 ? (
            <div className="space-y-3">
              {studentMessages
                .filter(m => m.type === 'request' && m.status === 'approved')
                .map(message => (
                  <MessageItem 
                    key={message.id}
                    message={{
                      id: message.id,
                      content: message.content,
                      from_name: message.sender_name || '',
                      sender_role: message.sender_id === userId ? 'admin' : 'student',
                      message_type: message.type,
                      created_at: message.created_at,
                      status: message.status
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
