
import React from 'react';
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface FeeSummaryProps {
  feeSummary: {
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    upcomingFee: any | null;
    overdueFees?: any[] | null;
  };
}

export function FeeSummary({ feeSummary }: FeeSummaryProps) {
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
  );
}
