
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth-context';
import { Send, MessageCircle, Search, UserRound } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  content: string;
  sender_role: string;
  created_at: string;
  from_name: string;
  student_id: string;
}

interface Student {
  id: string;
  name: string;
  student_id: string;
  email: string;
}

export default function AdminMessages() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch students
  useEffect(() => {
    fetchStudents();
  }, []);
  
  // Setup real-time messages subscription when a student is selected
  useEffect(() => {
    if (selectedStudentId) {
      fetchMessages();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('admin-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `student_id=eq.${selectedStudentId}`,
        }, (payload) => {
          const newMessage = payload.new as Message;
          setMessages(current => [...current, newMessage]);
          scrollToBottom();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedStudentId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, student_id, email')
        .order('name');
        
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    } finally {
      setIsLoadingStudents(false);
    }
  };
  
  const fetchMessages = async () => {
    if (!selectedStudentId) return;
    
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('student_id', selectedStudentId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStudentId || !user) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          student_id: selectedStudentId,
          content: newMessage.trim(),
          sender_role: 'admin',
          from_name: user.name
        });
        
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Filter students based on search query
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Messages</h1>
        <p className="text-muted-foreground">Communicate with your students</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="md:col-span-1">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Students</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2">
              {isLoadingStudents ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className="space-y-1">
                  {filteredStudents.map((student) => (
                    <Button
                      key={student.id}
                      variant={selectedStudentId === student.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <div className="flex items-center">
                        <UserRound className="h-4 w-4 mr-2" />
                        <div className="text-left truncate">
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-muted-foreground">{student.student_id}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No students found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Messages */}
        <div className="md:col-span-2">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                {selectedStudentId ? 
                  `Chat with ${students.find(s => s.id === selectedStudentId)?.name}` : 
                  'Messages'
                }
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {!selectedStudentId ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mb-2 opacity-20" />
                  <p>Select a student to view messages</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                    {isLoadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mb-2 opacity-20" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start a conversation with this student</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex flex-col ${
                            message.sender_role === 'admin' ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender_role === 'admin' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span>{message.from_name}</span>
                            <span>•</span>
                            <span>{format(new Date(message.created_at), 'MMM d, h:mm a')}</span>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="resize-none"
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        disabled={!selectedStudentId}
                      />
                      <Button 
                        onClick={sendMessage} 
                        disabled={isSending || !newMessage.trim() || !selectedStudentId}
                        size="icon"
                        className="h-auto self-end"
                      >
                        {isSending ? (
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
