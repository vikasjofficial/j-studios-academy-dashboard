
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageTypeLabel } from './MessageTypeLabel';
import { StatusBadge } from './StatusBadge';
import { Loader2, ClipboardCheck } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  from_name: string;
  sender_role: string;
  message_type: string | null;
  created_at: string;
  status?: string;
}

interface AcceptedRequestsListProps {
  requests: Message[];
  isLoading: boolean;
}

export function AcceptedRequestsList({ requests, isLoading }: AcceptedRequestsListProps) {
  const acceptedRequests = requests.filter(
    message => message.sender_role === 'student' && message.status === 'accepted'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Accepted Requests
        </CardTitle>
        <CardDescription>
          All student requests that have been accepted
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : acceptedRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardCheck className="h-12 w-12 mb-2 opacity-20 mx-auto" />
            <p>No accepted requests yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {acceptedRequests.map((request) => (
              <div 
                key={request.id} 
                className="p-4 rounded-lg bg-green-50 border border-green-100"
              >
                <div className="flex justify-between mb-2">
                  <div className="font-medium flex items-center gap-2">
                    {request.from_name}
                    {request.message_type && <MessageTypeLabel type={request.message_type} />}
                    <StatusBadge status={request.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                <p className="text-sm">{request.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
