
import DashboardLayout from '@/components/dashboard-layout';
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Send, Loader2, Mail, MessageSquare, CheckCircle, XCircle, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MessageItem } from "@/components/messages/MessageItem";
import { AcceptedRequestsList } from "@/components/messages/AcceptedRequestsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Student {
  id: string;
  name: string;
  email: string;
  student_id: string;
}

interface Message {
  id: string;
  student_id: string;
  content: string;
  sender_role: string;
  from_name: string;
  created_at: string;
  message_type: string | null;
  status?: string;
}

const sendMessageSchema = z.object({
  content: z.string().min(1, { message: "Message cannot be empty" }),
});

export default function AdminMessages() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingAllMessages, setIsLoadingAllMessages] = useState(false);
  const [messageTypeFilter, setMessageTypeFilter] = useState<string>("all");
  const [processingMessageId, setProcessingMessageId] = useState<string | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("chat");

  const form = useForm<z.infer<typeof sendMessageSchema>>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      content: "",
    },
  });

  const inlineForm = useForm<z.infer<typeof sendMessageSchema>>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    fetchStudents();
    fetchAllMessages();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchMessages(selectedStudent.id);
    }
  }, [selectedStudent]);

  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = students.filter(
        student => 
          student.name.toLowerCase().includes(lowercaseQuery) ||
          student.email.toLowerCase().includes(lowercaseQuery) ||
          student.student_id.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, email, student_id')
        .order('name');
        
      if (error) throw error;
      
      setStudents(data || []);
      setFilteredStudents(data || []);
      
      if (data && data.length > 0 && !selectedStudent) {
        setSelectedStudent(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchAllMessages = async () => {
    setIsLoadingAllMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setAllMessages(data || []);
    } catch (error) {
      console.error('Failed to fetch all messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingAllMessages(false);
    }
  };

  const fetchMessages = async (studentId: string) => {
    setIsLoadingMessages(true);
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });
        
      if (messageTypeFilter !== "all") {
        query = query.eq('message_type', messageTypeFilter);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (data: z.infer<typeof sendMessageSchema>) => {
    if (!selectedStudent) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          student_id: selectedStudent.id,
          content: data.content,
          from_name: 'Admin',
          sender_role: 'admin',
          message_type: 'General'
        });
        
      if (error) throw error;
      
      form.reset();
      inlineForm.reset();
      toast.success('Message sent successfully');
      fetchMessages(selectedStudent.id);
      fetchAllMessages();
      setReplyDialogOpen(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab("chat");
  };

  const handleRequestAction = async (messageId: string, status: 'accepted' | 'denied', messageType: string | null) => {
    if (!selectedStudent) return;
    
    setProcessingMessageId(messageId);
    
    try {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId);
        
      if (updateError) throw updateError;
      
      const responseContent = `Your ${messageType} has been ${status}.`;
      
      const { error: responseError } = await supabase
        .from('messages')
        .insert({
          student_id: selectedStudent.id,
          content: responseContent,
          from_name: 'Admin',
          sender_role: 'admin',
          message_type: 'Response',
          status
        });
        
      if (responseError) throw responseError;
      
      toast.success(`Request ${status} successfully`);
      fetchMessages(selectedStudent.id);
      fetchAllMessages();
    } catch (error) {
      console.error(`Failed to ${status} request:`, error);
      toast.error(`Failed to ${status} request`);
    } finally {
      setProcessingMessageId(null);
    }
  };

  const getMessageTypeBadge = (type: string | null) => {
    if (!type) return null;
    
    switch (type) {
      case "Leave Request":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">Leave Request</Badge>;
      case "Absent Request":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Absent Request</Badge>;
      case "Submission Request":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Submission Request</Badge>;
      case "Response":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Response</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200">General</Badge>;
    }
  };

  const isRequestMessage = (message: Message) => {
    return (
      message.sender_role === 'student' && 
      (message.message_type === 'Leave Request' || 
       message.message_type === 'Absent Request' || 
       message.message_type === 'Submission Request')
    );
  };

  const openReplyDialog = () => {
    form.reset();
    setReplyDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Messages</h1>
          <p className="text-muted-foreground">
            View and respond to student messages
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Students</CardTitle>
              <CardDescription>Select a student to view messages</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingStudents ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students found
                </div>
              ) : (
                <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
                  {filteredStudents.map((student) => (
                    <Button
                      key={student.id}
                      variant={selectedStudent?.id === student.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left"
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div className="truncate">
                        <div className="font-medium truncate">{student.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {student.student_id}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  {selectedStudent ? `Messages - ${selectedStudent.name}` : "Messages"}
                </CardTitle>
                
                <div className="flex gap-2">
                  {activeTab === "chat" && (
                    <Select 
                      value={messageTypeFilter} 
                      onValueChange={(value) => {
                        setMessageTypeFilter(value);
                        if (selectedStudent) {
                          fetchMessages(selectedStudent.id);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Leave Request">Leave Request</SelectItem>
                        <SelectItem value="Absent Request">Absent Request</SelectItem>
                        <SelectItem value="Submission Request">Submission Request</SelectItem>
                        <SelectItem value="Response">Responses</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  {selectedStudent && activeTab === "chat" && (
                    <Button onClick={openReplyDialog}>
                      <Send className="mr-2 h-4 w-4" />
                      New Message
                    </Button>
                  )}
                </div>
              </div>
              
              <CardDescription>
                {selectedStudent 
                  ? `View and manage interactions with ${selectedStudent.name}` 
                  : "Select a student to view messages"}
              </CardDescription>
              
              {selectedStudent && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="accepted">Accepted Requests</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </CardHeader>
            <CardContent className="flex flex-col h-[550px]">
              {!selectedStudent ? (
                <div className="text-center py-8 text-muted-foreground flex-1">
                  Please select a student to view messages
                </div>
              ) : (
                <TabsContent value="chat" className="flex-1 flex flex-col h-full mt-0">
                  {isLoadingMessages ? (
                    <div className="flex justify-center py-8 flex-1">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 pb-4 flex-1 flex flex-col">
                        {messages.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No messages found
                          </div>
                        ) : (
                          <>
                            {messages.map((message) => (
                              <MessageItem
                                key={message.id}
                                message={message}
                                showActions={isRequestMessage(message) && !message.status}
                                onAccept={(id, type) => handleRequestAction(id, 'accepted', type)}
                                onDeny={(id, type) => handleRequestAction(id, 'denied', type)}
                                isProcessing={processingMessageId === message.id}
                              />
                            ))}
                            <div ref={messagesEndRef} />
                          </>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <Form {...inlineForm}>
                          <form onSubmit={inlineForm.handleSubmit(sendMessage)} className="flex items-end gap-2">
                            <FormField
                              control={inlineForm.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Type your message here..." 
                                      className="resize-none min-h-[80px]" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="submit" 
                              className="mb-[2px]"
                              disabled={inlineForm.formState.isSubmitting}
                            >
                              {inlineForm.formState.isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </form>
                        </Form>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="accepted" className="flex-1 h-full mt-0">
                  <AcceptedRequestsList
                    requests={
                      allMessages.filter(m => 
                        m.student_id === selectedStudent.id &&
                        m.sender_role === 'student' &&
                        m.status === 'accepted'
                      )
                    }
                    isLoading={isLoadingAllMessages}
                  />
                </TabsContent>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Accepted Requests</CardTitle>
            <CardDescription>View all student requests that have been accepted across the system</CardDescription>
          </CardHeader>
          <CardContent>
            <AcceptedRequestsList
              requests={allMessages.filter(m => m.status === 'accepted')}
              isLoading={isLoadingAllMessages}
            />
          </CardContent>
        </Card>

        <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Reply to {selectedStudent?.name}
              </DialogTitle>
              <DialogDescription>
                Send a message to the student. They will be notified immediately.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="relative p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-gray-100">
                <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-grid-pattern"></div>
                <div className="relative">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(sendMessage)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <Textarea 
                                placeholder="Type your message here..." 
                                className="min-h-[100px] resize-none border-gray-200 focus:border-primary" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-between items-center pt-2">
                        <Button 
                          type="button"
                          variant="ghost" 
                          onClick={() => setReplyDialogOpen(false)}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                        
                        <Button 
                          type="submit" 
                          className="px-4" 
                          disabled={form.formState.isSubmitting}
                        >
                          {form.formState.isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
