
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { MessageFilterBar } from '@/components/messages/MessageFilterBar';
import { MessageTabs } from '@/components/messages/MessageTabs';
import { StudentSelector } from '@/components/messages/StudentSelector';
import { StudentMessagesView } from '@/components/messages/StudentMessagesView';
import { ComposeMessageDialog } from '@/components/messages/ComposeMessageDialog';
import { useAdminMessages } from '@/hooks/use-admin-messages';
import { useStudents } from '@/hooks/use-students';
import { useAcceptedRequests } from '@/hooks/use-accepted-requests';

export default function AdminMessages() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const { user } = useAuth();

  // Use our custom hooks
  const { 
    messages, 
    loading, 
    fetchMessages, 
    updateMessageStatus, 
    getInboxMessages, 
    getSentMessages, 
    getRequestMessages 
  } = useAdminMessages(user?.id);

  const { students } = useStudents();
  const { getTransformedRequests, loading: acceptedRequestsLoading, fetchAcceptedRequests } = useAcceptedRequests();

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
  };

  // Transform messages for our components
  const transformedInboxMessages = getInboxMessages(searchQuery, statusFilter, typeFilter).map(msg => ({
    id: msg.id,
    content: msg.content,
    from_name: msg.sender_name || '',
    sender_role: 'student',
    message_type: msg.type || '',
    created_at: msg.created_at,
    status: msg.status
  }));

  const transformedSentMessages = getSentMessages(searchQuery, statusFilter, typeFilter).map(msg => ({
    id: msg.id,
    content: msg.content,
    from_name: msg.recipient_name || '',
    sender_role: 'admin',
    message_type: msg.type || '',
    created_at: msg.created_at,
    status: msg.status
  }));

  const transformedRequestMessages = getRequestMessages(searchQuery, statusFilter, typeFilter).map(msg => ({
    id: msg.id,
    content: msg.content,
    from_name: msg.sender_name || '',
    sender_role: 'student',
    message_type: msg.type || '',
    created_at: msg.created_at,
    status: msg.status
  }));

  const handleMessageSent = async () => {
    await fetchMessages();
  };

  const handleStatusUpdate = async (messageId: string, status: 'read' | 'pending' | 'approved' | 'rejected') => {
    const success = await updateMessageStatus(messageId, status);
    if (success && status === 'approved') {
      fetchAcceptedRequests();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Messages &amp; Requests</CardTitle>
          <CardDescription>
            Manage communication with students and respond to requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <MessageFilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                hasFilters={!!(searchQuery || statusFilter || typeFilter)}
                clearFilters={clearFilters}
              />
              <Button onClick={() => setIsComposeOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                New Message
              </Button>
              <ComposeMessageDialog
                onOpenChange={setIsComposeOpen}
                onMessageSent={handleMessageSent}
              />
            </div>

            <MessageTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              inboxMessages={transformedInboxMessages}
              sentMessages={transformedSentMessages}
              requestMessages={transformedRequestMessages}
              acceptedRequests={getTransformedRequests()}
              isAcceptedRequestsLoading={acceptedRequestsLoading}
              onUpdateStatus={handleStatusUpdate}
            />

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Student Messages</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StudentSelector 
                  students={students}
                  selectedStudent={selectedStudent}
                  onSelectStudent={handleStudentSelect}
                />

                <div className="col-span-1 md:col-span-3">
                  <StudentMessagesView 
                    selectedStudent={selectedStudent}
                    userId={user?.id}
                    onUpdateStatus={handleStatusUpdate}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
