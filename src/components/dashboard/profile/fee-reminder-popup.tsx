
import React, { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";

interface FeeReminderPopupProps {
  feeSummary: {
    overdueFees?: any[] | null;
    unpaidAmount: number;
  };
}

export function FeeReminderPopup({ feeSummary }: FeeReminderPopupProps) {
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [remindCountdown, setRemindCountdown] = useState(0);
  const [isReminding, setIsReminding] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(true);
  
  // Handle initial popup display and periodic reminders
  useEffect(() => {
    // Only show popup if there are overdue fees
    if (feeSummary.overdueFees && feeSummary.overdueFees.length > 0) {
      // Show popup immediately after login
      setOpen(true);
      setSecondsLeft(10);
      setButtonsDisabled(true);
      
      // Set up interval to show popup every 10 minutes
      const intervalId = setInterval(() => {
        if (!isReminding) {
          setOpen(true);
          setSecondsLeft(10);
          setButtonsDisabled(true);
        }
      }, 10 * 60 * 1000); // 10 minutes in milliseconds
      
      return () => clearInterval(intervalId);
    }
  }, [feeSummary.overdueFees, isReminding]);
  
  // Handle the main popup countdown timer
  useEffect(() => {
    let timerId: number | undefined;
    
    if (open && secondsLeft > 0) {
      timerId = window.setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setButtonsDisabled(false);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [open, secondsLeft]);
  
  // Handle the "remind later" countdown timer
  useEffect(() => {
    let remindTimerId: number | undefined;
    
    if (isReminding && remindCountdown > 0) {
      remindTimerId = window.setInterval(() => {
        setRemindCountdown(prev => prev - 1);
      }, 1000);
    } else if (isReminding && remindCountdown === 0) {
      setIsReminding(false);
      setOpen(true); // Show popup again when reminder countdown completes
      setSecondsLeft(10);
      setButtonsDisabled(true);
    }
    
    return () => {
      if (remindTimerId) clearInterval(remindTimerId);
    };
  }, [isReminding, remindCountdown]);
  
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
  
  const handleRemindLater = () => {
    setOpen(false); // Hide the popup immediately
    setIsReminding(true);
    setRemindCountdown(300); // Changed from 10 to 300 seconds (5 minutes)
    // The popup will reappear after the countdown finishes in the useEffect
  };
  
  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  return (
    <>
      {/* Display a floating reminder indicator when in remind mode */}
      {isReminding && (
        <div className="fixed bottom-4 right-4 bg-amber-50 border border-amber-200 p-3 rounded-lg shadow-md z-50">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">Payment reminder in</p>
              <p className="text-lg font-bold text-amber-600">{formatTime(remindCountdown)}</p>
            </div>
          </div>
        </div>
      )}
      
      <AlertDialog open={open} onOpenChange={(isOpen) => {
        // Only allow programmatic closing of the dialog when buttons are enabled
        if (buttonsDisabled && isOpen === false) return;
        setOpen(isOpen);
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" /> 
              Payment Overdue
            </AlertDialogTitle>
            
            <AlertDialogDescription className="space-y-3">
              {secondsLeft > 0 && (
                <div className="bg-slate-100 p-2 mb-2 rounded text-center">
                  <span className="text-sm font-medium">
                    Please review this important message ({secondsLeft}s)
                  </span>
                </div>
              )}
              
              <p className="text-base font-medium">
                You have {feeSummary.overdueFees?.length} overdue payment{feeSummary.overdueFees && feeSummary.overdueFees.length > 1 ? 's' : ''} totaling {formatCurrency(overdueAmount)}.
              </p>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 text-sm">
                <p>Please make the payment at your earliest convenience to avoid any interruption in your education. Continued non-payment may result in a temporary pause of your classes.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={buttonsDisabled} onClick={handleRemindLater}>
              Remind Later {buttonsDisabled && `(${secondsLeft}s)`}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePaymentRedirect} 
              className="bg-primary hover:bg-primary/90"
              disabled={buttonsDisabled}
            >
              Proceed to Payment {buttonsDisabled && `(${secondsLeft}s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
