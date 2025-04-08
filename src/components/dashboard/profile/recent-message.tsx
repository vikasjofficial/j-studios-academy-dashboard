
import React from 'react';
import { CardContent } from "@/components/ui/card";
import { MessageSquare } from 'lucide-react';

interface RecentMessageProps {
  message: any | null;
}

export function RecentMessage({ message }: RecentMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <CardContent className="p-4 bg-muted/30 border-t">
      <div className="flex items-start gap-3">
        <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Recent Message</span>
            <span className="text-xs text-muted-foreground">from {message.from_name}</span>
          </div>
          <p className="text-sm line-clamp-2 mt-0.5">{message.content}</p>
        </div>
      </div>
    </CardContent>
  );
}
