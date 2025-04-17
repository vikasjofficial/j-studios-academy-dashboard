
import React, { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface FeeReminderPopupProps {
  feeSummary: {
    overdueFees?: any[] | null;
    unpaidAmount: number;
  };
}

export function FeeReminderPopup({ feeSummary }: FeeReminderPopupProps) {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    // Only show popup if there are overdue fees
    if (feeSummary.overdueFees && feeSummary.overdueFees.length > 0) {
      // Show popup immediately after login
      setOpen(true);
      
      // Set up interval to show popup every 10 minutes
      const intervalId = setInterval(() => {
        setOpen(true);
      }, 10 * 60 * 1000); // 10 minutes in milliseconds
      
      return () => clearInterval(intervalId);
    }
  }, [feeSummary.overdueFees]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const overdueAmount = feeSummary.overdueFees 
    ? feeSummary.overdueFees.reduce((sum, fee) => sum + Number(fee.amount), 0)
    : 0;
  
  const handlePaymentRedirect = () => {
    window.open("https://razorpay.me/@jstudiosacademy", "_blank");
    setOpen(false);
  };
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" /> 
            Payment Overdue
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="text-base font-medium">
              You have {feeSummary.overdueFees?.length} overdue payment{feeSummary.overdueFees && feeSummary.overdueFees.length > 1 ? 's' : ''} totaling {formatCurrency(overdueAmount)}.
            </p>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 text-sm">
              <p>Please make the payment at your earliest convenience to avoid any interruption in your education. Continued non-payment may result in a temporary pause of your classes.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Remind Later</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handlePaymentRedirect} 
            className="bg-primary hover:bg-primary/90"
          >
            Proceed to Payment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
