import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth-context';
import { Cake, Calendar, GraduationCap, MessageSquare, User, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from 'react';

export function StudentProfileCard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch student's enrolled courses
  const { data: courses } = useQuery({
    queryKey: ["student-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          course_id,
          courses:course_id(id, name, code)
        `)
        .eq("student_id", user.id)
        .eq("status", "active");
        
      if (error) throw error;
      
      return data.map(item => item.courses);
    },
    enabled: !!user?.id,
  });

  // Fetch recent message from admin
  const { data: recentMessage } = useQuery({
    queryKey: ["recent-message", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("student_id", user.id)
        .eq("sender_role", "admin")
        .order("created_at", { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      return data.length > 0 ? data[0] : null;
    },
    enabled: !!user?.id,
  });

  // Get student details (including student_id)
  const { data: studentDetails } = useQuery({
    queryKey: ["student-details", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch fee data
  const { data: feeData } = useQuery({
    queryKey: ["student-fees", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("student_fees")
        .select("*")
        .eq("student_id", user.id)
        .order("due_date", { ascending: true });
        
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate fee summary
  const feeSummary = React.useMemo(() => {
    if (!feeData) return { totalAmount: 0, paidAmount: 0, unpaidAmount: 0, upcomingFee: null };
    
    const totalAmount = feeData.reduce((sum, fee) => sum + Number(fee.amount), 0);
    const paidAmount = feeData
      .filter(fee => fee.payment_status === 'Paid')
      .reduce((sum, fee) => sum + Number(fee.amount), 0);
    const unpaidAmount = totalAmount - paidAmount;
    
    // Find the nearest upcoming fee
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingFees = feeData.filter(fee => {
      if (fee.payment_status !== 'Paid' && fee.due_date) {
        const dueDate = new Date(fee.due_date);
        return dueDate >= today;
      }
      return false;
    });
    
    upcomingFees.sort((a, b) => {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
    
    const upcomingFee = upcomingFees.length > 0 ? upcomingFees[0] : null;
    
    // Find overdue fees
    const overdueFees = feeData.filter(fee => {
      if (fee.payment_status !== 'Paid' && fee.due_date) {
        const dueDate = new Date(fee.due_date);
        return dueDate < today;
      }
      return false;
    });
    
    return { totalAmount, paidAmount, unpaidAmount, upcomingFee, overdueFees };
  }, [feeData]);

  // Show notification for overdue fees
  useEffect(() => {
    if (feeSummary.overdueFees && feeSummary.overdueFees.length > 0) {
      const overdueCount = feeSummary.overdueFees.length;
      const totalOverdue = feeSummary.overdueFees.reduce((sum, fee) => sum + Number(fee.amount), 0);
      
      toast({
        title: "Fee Payment Overdue",
        description: `You have ${overdueCount} overdue fee payment${overdueCount > 1 ? 's' : ''} totaling ₹${totalOverdue.toLocaleString('en-IN')}. Please make the payment as soon as possible.`,
        variant: "destructive",
      });
    }
  }, [feeSummary.overdueFees]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM, yyyy');
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="bg-primary/10 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          <Avatar className="h-28 w-28 border-4 border-background">
            <AvatarImage src={studentDetails?.avatar_url} alt={user?.name || 'Student'} />
            <AvatarFallback className="text-xl">
              {user?.name ? getInitials(user.name) : 'S'}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center">
                <Badge variant="outline" className="flex items-center gap-1 bg-primary/5">
                  <User className="h-3 w-3" />
                  ID: {studentDetails?.student_id || 'N/A'}
                </Badge>
                {studentDetails?.grade && (
                  <Badge variant="outline" className="flex items-center gap-1 bg-primary/5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Grade: {studentDetails.grade}
                  </Badge>
                )}
              </div>
            </div>
            
            {courses && courses.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-medium mb-1">Enrolled Courses:</div>
                <div className="flex flex-wrap gap-1.5">
                  {courses.map((course: any) => (
                    <Badge key={course.id} variant="secondary" className="text-xs">
                      {course.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {recentMessage && (
        <CardContent className="p-4 bg-muted/30 border-t">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Recent Message</span>
                <span className="text-xs text-muted-foreground">from {recentMessage.from_name}</span>
              </div>
              <p className="text-sm line-clamp-2 mt-0.5">{recentMessage.content}</p>
            </div>
          </div>
        </CardContent>
      )}
      
      {/* Fee Summary Section */}
      <CardContent className="p-4 bg-primary/5 border-t">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">Fee Summary</span>
              <Badge variant="outline" className="text-xs">Total: {formatCurrency(feeSummary.totalAmount)}</Badge>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Paid: {formatCurrency(feeSummary.paidAmount)}
              </Badge>
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                Due: {formatCurrency(feeSummary.unpaidAmount)}
              </Badge>
            </div>
          </div>
          
          {feeSummary.upcomingFee && (
            <Alert className="py-3 bg-amber-50 text-amber-800 border-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm font-medium flex items-center gap-2">
                Upcoming Payment 
                <Badge variant="outline" className="bg-white text-amber-700 border-amber-300 text-xs">
                  {formatCurrency(Number(feeSummary.upcomingFee.amount))}
                </Badge>
              </AlertTitle>
              <AlertDescription className="text-xs mt-1 flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Due Date: {formatDate(feeSummary.upcomingFee.due_date)}
                <span className="text-xs font-medium">({feeSummary.upcomingFee.description})</span>
              </AlertDescription>
            </Alert>
          )}
          
          {feeSummary.overdueFees && feeSummary.overdueFees.length > 0 && (
            <Alert className="py-3 bg-red-50 text-red-800 border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm font-medium flex items-center gap-2">
                Overdue Payment 
                <Badge variant="outline" className="bg-white text-red-700 border-red-300 text-xs">
                  {formatCurrency(feeSummary.overdueFees.reduce((sum, fee) => sum + Number(fee.amount), 0))}
                </Badge>
              </AlertTitle>
              <AlertDescription className="text-xs mt-1">
                You have {feeSummary.overdueFees.length} overdue payment{feeSummary.overdueFees.length > 1 ? 's' : ''}. 
                Please make the payment as soon as possible.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
