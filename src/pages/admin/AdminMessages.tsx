
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, MessageSquare, Search, Filter, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { MessageItem } from '@/components/messages/MessageItem';
import { StatusBadge } from '@/components/messages/StatusBadge';
import { MessageTypeLabel } from '@/components/messages/MessageTypeLabel';
import { AcceptedRequestsList } from '@/components/messages/AcceptedRequestsList';
import styles from '@/styles/messages.module.css';

// Define AdminMessage type that matches our database structure
type AdminMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  status: 'sent' | 'read' | 'pending' | 'approved' | 'rejected';
  type: 'general' | 'announcement' | 'request';
  created_at: string;
  sender_name?: string;
  recipient_name?: string;
  sent_from?: string;
  sent_to?: string;
};

type AdminMessageWithUser = AdminMessage & {
  profiles: {
    first_name: string;
    last_name: string;
    role: string;
  };
};

type Student = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string;
};

// Define MessageList component to clean up the code
const MessageList = ({ 
  messages, 
  onUpdateStatus, 
  emptyMessage = "No messages", 
  isSentFolder = false,
  showApprovalButtons = false 
}) => {
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
          message={{
            id: message.id,
            content: message.content,
            from_name: message.sender_name || '',
            sender_role: message.sender_id === message.recipient_id ? 'admin' : 'student',
            message_type: message.type,
            created_at: message.created_at,
            status: message.status
          }}
          showActions={showApprovalButtons && message.status === 'pending'}
          onAccept={showApprovalButtons ? 
            () => onUpdateStatus(message.id, 'approved') : undefined}
          onDeny={showApprovalButtons ? 
            () => onUpdateStatus(message.id, 'rejected') : undefined}
        />
      ))}
    </div>
  );
};

export default function AdminMessages() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentMessages, setStudentMessages] = useState<AdminMessage[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<AdminMessage[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
    fetchStudents();
    fetchAcceptedRequests();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentMessages(selectedStudent);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, email, avatar_url');

      if (error) throw error;
      
      // Transform the data to match the Student type
      const transformedData = data?.map(student => ({
        id: student.id,
        first_name: student.name.split(' ')[0] || '',
        last_name: student.name.split(' ').slice(1).join(' ') || '',
        email: student.email,
        profile_image: student.avatar_url
      })) || [];
      
      setStudents(transformedData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    }
  };

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(first_name, last_name),
          recipient:profiles!recipient_id(first_name, last_name)
        `)
        .or(`recipient_id.eq.${user?.id},sender_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const formattedMessages = data.map((msg: any) => ({
        ...msg,
        sender_name: `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`,
        recipient_name: `${msg.recipient?.first_name || ''} ${msg.recipient?.last_name || ''}`,
        sent_from: msg.sender_id === user?.id ? 'You' : `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`,
        sent_to: msg.recipient_id === user?.id ? 'You' : `${msg.recipient?.first_name || ''} ${msg.recipient?.last_name || ''}`,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  };

  const fetchStudentMessages = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(first_name, last_name),
          recipient:profiles!recipient_id(first_name, last_name)
        `)
        .or(`recipient_id.eq.${studentId},sender_id.eq.${studentId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMessages = data.map((msg: any) => ({
        ...msg,
        sender_name: `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`,
        recipient_name: `${msg.recipient?.first_name || ''} ${msg.recipient?.last_name || ''}`,
        sent_from: msg.sender_id === user?.id ? 'You' : `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`,
        sent_to: msg.recipient_id === user?.id ? 'You' : `${msg.recipient?.first_name || ''} ${msg.recipient?.last_name || ''}`,
      }));

      setStudentMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching student messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student messages',
        variant: 'destructive',
      });
    }
  };

  const fetchAcceptedRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(first_name, last_name),
          recipient:profiles!recipient_id(first_name, last_name)
        `)
        .eq('status', 'approved')
        .eq('type', 'request')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMessages = data.map((msg: any) => ({
        ...msg,
        sender_name: `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`,
        recipient_name: `${msg.recipient?.first_name || ''} ${msg.recipient?.last_name || ''}`,
        sent_from: msg.sender_id === user?.id ? 'You' : `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`,
        sent_to: msg.recipient_id === user?.id ? 'You' : `${msg.recipient?.first_name || ''} ${msg.recipient?.last_name || ''}`,
      }));

      setAcceptedRequests(formattedMessages);
    } catch (error) {
      console.error('Error fetching accepted requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load accepted requests',
        variant: 'destructive',
      });
    }
  };

  const updateMessageStatus = async (messageId: string, status: 'read' | 'pending' | 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId);

      if (error) throw error;

      // Update local state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));
      
      if (selectedStudent) {
        setStudentMessages(studentMessages.map(msg => 
          msg.id === messageId ? { ...msg, status } : msg
        ));
      }

      // If message was approved, refresh the accepted requests list
      if (status === 'approved') {
        fetchAcceptedRequests();
      }

      toast({
        title: 'Success',
        description: `Message ${status === 'read' ? 'marked as read' : status}`,
      });
    } catch (error) {
      console.error('Error updating message status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update message status',
        variant: 'destructive',
      });
    }
  };

  const getFilteredMessages = () => {
    return messages.filter(message => {
      const matchesSearch = 
        message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter ? message.status === statusFilter : true;
      const matchesType = typeFilter ? message.type === typeFilter : true;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const getInboxMessages = () => {
    return getFilteredMessages().filter(msg => msg.recipient_id === user?.id);
  };

  const getSentMessages = () => {
    return getFilteredMessages().filter(msg => msg.sender_id === user?.id);
  };

  const getRequestMessages = () => {
    return getFilteredMessages().filter(msg => msg.type === 'request' && msg.recipient_id === user?.id);
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
  };

  // Simplified ComposeMessageDialog component for this example
  const ComposeMessageDialog = ({ onOpenChange, onMessageSent }) => {
    return (
      <Button onClick={() => onOpenChange(true)} className="gap-2">
        <Mail className="h-4 w-4" />
        Compose Message
      </Button>
    );
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
              <div className="flex gap-2 flex-grow">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search messages..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="request">Request</SelectItem>
                  </SelectContent>
                </Select>
                {(searchQuery || statusFilter || typeFilter) && (
                  <Button variant="outline" onClick={clearFilters} className="gap-2">
                    <Filter className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
              <ComposeMessageDialog
                onOpenChange={setIsComposeOpen}
                onMessageSent={fetchMessages}
              />
            </div>

            <Tabs defaultValue="inbox" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="inbox" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Inbox
                  {getInboxMessages().filter(m => m.status === 'sent').length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {getInboxMessages().filter(m => m.status === 'sent').length}
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
                  {getRequestMessages().filter(m => m.status === 'pending').length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {getRequestMessages().filter(m => m.status === 'pending').length}
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
                    messages={getInboxMessages()}
                    onUpdateStatus={updateMessageStatus}
                    emptyMessage="No incoming messages"
                  />
                </TabsContent>

                <TabsContent value="sent">
                  <MessageList 
                    messages={getSentMessages()} 
                    onUpdateStatus={updateMessageStatus}
                    emptyMessage="No sent messages"
                    isSentFolder={true}
                  />
                </TabsContent>

                <TabsContent value="requests">
                  <MessageList
                    messages={getRequestMessages()}
                    onUpdateStatus={updateMessageStatus}
                    emptyMessage="No pending requests"
                    showApprovalButtons={true}
                  />
                </TabsContent>

                <TabsContent value="accepted">
                  <div className="space-y-3">
                    {acceptedRequests.length > 0 ? (
                      acceptedRequests.map(request => (
                        <MessageItem 
                          key={request.id}
                          message={{
                            id: request.id,
                            content: request.content,
                            from_name: request.sender_name || '',
                            sender_role: 'student',
                            message_type: request.type,
                            created_at: request.created_at,
                            status: request.status
                          }}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No accepted requests
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Student Messages</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1 bg-muted/30 rounded-lg p-4">
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">Students</h4>
                    <Input 
                      type="search"
                      placeholder="Search students..."
                      className="mb-2"
                    />
                  </div>
                  <div className={`${styles.studentList} space-y-2 max-h-[400px] overflow-y-auto pr-2`}>
                    {students.map(student => (
                      <div 
                        key={student.id}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${selectedStudent === student.id ? 'bg-muted' : ''}`}
                        onClick={() => handleStudentSelect(student.id)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.profile_image} />
                          <AvatarFallback>{student.first_name.charAt(0)}{student.last_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <div className="font-medium">{student.first_name} {student.last_name}</div>
                          <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3">
                  {selectedStudent ? (
                    <Tabs defaultValue="all">
                      <TabsList>
                        <TabsTrigger value="all">All Messages</TabsTrigger>
                        <TabsTrigger value="requests">Requests</TabsTrigger>
                        <TabsTrigger value="accepted">Accepted Requests</TabsTrigger>
                      </TabsList>

                      <TabsContent value="all">
                        <div className="bg-muted/30 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                          {studentMessages.length > 0 ? (
                            <div className="space-y-3">
                              {studentMessages.map(message => (
                                <MessageItem 
                                  key={message.id}
                                  message={{
                                    id: message.id,
                                    content: message.content,
                                    from_name: message.sender_name || '',
                                    sender_role: message.sender_id === user?.id ? 'admin' : 'student',
                                    message_type: message.type,
                                    created_at: message.created_at,
                                    status: message.status
                                  }}
                                  onAccept={message.type === 'request' && message.status === 'pending' ? 
                                    () => updateMessageStatus(message.id, 'approved') : undefined}
                                  onDeny={message.type === 'request' && message.status === 'pending' ? 
                                    () => updateMessageStatus(message.id, 'rejected') : undefined}
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
                          {studentMessages.filter(m => m.type === 'request').length > 0 ? (
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
                                      sender_role: message.sender_id === user?.id ? 'admin' : 'student',
                                      message_type: message.type,
                                      created_at: message.created_at,
                                      status: message.status
                                    }}
                                    onAccept={message.status === 'pending' ? 
                                      () => updateMessageStatus(message.id, 'approved') : undefined}
                                    onDeny={message.status === 'pending' ? 
                                      () => updateMessageStatus(message.id, 'rejected') : undefined}
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
                          {studentMessages.filter(m => m.type === 'request' && m.status === 'approved').length > 0 ? (
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
                                      sender_role: message.sender_id === user?.id ? 'admin' : 'student',
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
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-8 h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Select a student to view their messages</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
