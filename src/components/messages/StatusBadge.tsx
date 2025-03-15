
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string | undefined;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;
  
  switch (status) {
    case "accepted":
      return (
        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" /> Accepted
        </span>
      );
    case "denied":
      return (
        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full flex items-center">
          <XCircle className="h-3 w-3 mr-1" /> Denied
        </span>
      );
    default:
      return null;
  }
}
