import DashboardLayout from '@/components/dashboard-layout';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Search, Send, Loader2, Mail, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  name: string;
  email: string;
  student_id: string;
}

const sendMessageSchema = z.object({
  content: z.string().min(1, { message: "Message cannot be empty" }),
});

export default function AdminMessages() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageTypeFilter, setMessageTypeFilter] = useState<string>("all");

  const form = useForm<z.infer<typeof sendMessageSchema>>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    fetchStudents();
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

  const fetchMessages = async (studentId: string) => {
    setIsLoadingMessages(true);
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
        
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
      toast.success('Message sent successfully');
      fetchMessages(selectedStudent.id);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
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
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200">General</Badge>;
    }
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
                  </SelectContent>
                </Select>
              </div>
              
              <CardDescription>
                {selectedStudent 
                  ? `View your conversation with ${selectedStudent.name}` 
                  : "Select a student to view messages"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedStudent ? (
                <div className="text-center py-8 text-muted-foreground">
                  Please select a student to view messages
                </div>
              ) : isLoadingMessages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages found
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`p-4 rounded-lg ${
                        message.sender_role === 'admin' 
                          ? 'bg-primary/10 ml-12' 
                          : 'bg-secondary/10 mr-12'
                      }`}
                    >
                      <div className="flex justify-between mb-2">
                        <div className="font-medium flex items-center gap-2">
                          {message.from_name}
                          {message.message_type && getMessageTypeBadge(message.message_type)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedStudent && (
                <div className="mt-4 pt-4 border-t">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(sendMessage)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reply</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Type your message here..." 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
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
                    </form>
                  </Form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
