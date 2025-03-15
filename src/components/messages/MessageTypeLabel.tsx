
import React from 'react';

interface MessageTypeLabelProps {
  type: string | null;
}

export function MessageTypeLabel({ type }: MessageTypeLabelProps) {
  if (!type) return (
    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">General</span>
  );
  
  switch (type) {
    case "Leave Request":
      return <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">Leave Request</span>;
    case "Absent Request":
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Absent Request</span>;
    case "Submission Request":
      return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Submission Request</span>;
    case "Response":
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Response</span>;
    default:
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">General</span>;
  }
}
