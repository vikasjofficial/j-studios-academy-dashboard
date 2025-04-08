
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export function useFeeData(userId: string | undefined) {
  const { toast } = useToast();

  // Fetch fee data
  const { data: feeData } = useQuery({
    queryKey: ["student-fees", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("student_fees")
        .select("*")
        .eq("student_id", userId)
        .order("due_date", { ascending: true });
        
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!userId,
  });

  // Calculate fee summary
  const feeSummary = React.useMemo(() => {
    if (!feeData) return { totalAmount: 0, paidAmount: 0, unpaidAmount: 0, upcomingFee: null, overdueFees: [] };
    
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

  // Handle fee notifications
  React.useEffect(() => {
    if (feeSummary.overdueFees && feeSummary.overdueFees.length > 0) {
      const overdueCount = feeSummary.overdueFees.length;
      const totalOverdue = feeSummary.overdueFees.reduce((sum, fee) => sum + Number(fee.amount), 0);
      
      toast({
        title: "Fee Payment Overdue",
        description: `You have ${overdueCount} overdue fee payment${overdueCount > 1 ? 's' : ''} totaling ₹${totalOverdue.toLocaleString('en-IN')}. Please make the payment as soon as possible.`,
        variant: "destructive",
      });
    }
  }, [feeSummary.overdueFees, toast]);

  return { feeData, feeSummary };
}
