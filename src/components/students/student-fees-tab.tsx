
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Fee {
  id: string;
  student_id: string;
  amount: number;
  description: string;
  due_date: string | null;
  payment_date: string | null;
  payment_status: string;
  created_at: string;
}

interface FeeFormData {
  amount: string;
  description: string;
  due_date: Date | null;
  payment_date: Date | null;
  payment_status: string;
}

interface StudentFeesTabProps {
  studentId: string;
  studentName: string;
}

export function StudentFeesTab({ studentId, studentName }: StudentFeesTabProps) {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FeeFormData>({
    amount: '',
    description: '',
    due_date: null,
    payment_date: null,
    payment_status: 'Unpaid'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const totalAmount = fees.reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0);
  const paidAmount = fees
    .filter(fee => fee.payment_status === 'Paid')
    .reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0);
  const unpaidAmount = totalAmount - paidAmount;
  
  useEffect(() => {
    fetchFees();
  }, [studentId]);

  async function fetchFees() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_fees')
        .select('*')
        .eq('student_id', studentId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      setFees(data || []);
    } catch (error) {
      console.error('Error fetching student fees:', error);
      toast({
        title: "Error",
        description: "Failed to load fee information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null, field: 'due_date' | 'payment_date') => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const feeData = {
        student_id: studentId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
        payment_date: formData.payment_date ? format(formData.payment_date, 'yyyy-MM-dd') : null,
        payment_status: formData.payment_status
      };
      
      const { error } = await supabase
        .from('student_fees')
        .insert(feeData);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Fee added successfully",
      });
      
      // Reset form and refresh fees
      setFormData({
        amount: '',
        description: '',
        due_date: null,
        payment_date: null,
        payment_status: 'Unpaid'
      });
      
      setShowAddForm(false);
      fetchFees();
    } catch (error) {
      console.error('Error adding fee:', error);
      toast({
        title: "Error",
        description: "Failed to add fee",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (feeId: string, newStatus: string) => {
    try {
      const updateData: any = {
        payment_status: newStatus
      };
      
      // If marked as paid and no payment date, set to today
      if (newStatus === 'Paid') {
        updateData.payment_date = new Date().toISOString().split('T')[0];
      }
      
      const { error } = await supabase
        .from('student_fees')
        .update(updateData)
        .eq('id', feeId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Payment status updated",
      });
      
      fetchFees();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFee = async (feeId: string) => {
    if (!confirm("Are you sure you want to delete this fee?")) return;
    
    try {
      const { error } = await supabase
        .from('student_fees')
        .delete()
        .eq('id', feeId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Fee deleted successfully",
      });
      
      fetchFees();
    } catch (error) {
      console.error('Error deleting fee:', error);
      toast({
        title: "Error",
        description: "Failed to delete fee",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <div>Loading fee information...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Remaining Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(unpaidAmount)}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Fee Records</h3>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)} 
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Fee
        </Button>
      </div>
      
      {showAddForm && (
        <Card className="p-4 border border-dashed">
          <form onSubmit={handleAddFee} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount*
                </label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description*
                </label>
                <Input
                  id="description"
                  name="description"
                  placeholder="e.g., Tuition for January"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? (
                        format(formData.due_date, 'PPP')
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.due_date || undefined}
                      onSelect={(date) => handleDateChange(date, 'due_date')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <select 
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Late">Late</option>
                </select>
              </div>
              
              {formData.payment_status === 'Paid' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.payment_date ? (
                          format(formData.payment_date, 'PPP')
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.payment_date || undefined}
                        onSelect={(date) => handleDateChange(date, 'payment_date')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {fees.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          No fee records found. Add a fee record to get started.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.description}</TableCell>
                  <TableCell>{formatCurrency(parseFloat(fee.amount.toString()))}</TableCell>
                  <TableCell>{formatDate(fee.due_date)}</TableCell>
                  <TableCell>{formatDate(fee.payment_date)}</TableCell>
                  <TableCell>
                    <select
                      value={fee.payment_status}
                      onChange={(e) => handleStatusChange(fee.id, e.target.value)}
                      className="p-1 border rounded text-sm bg-transparent"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Late">Late</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFee(fee.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
