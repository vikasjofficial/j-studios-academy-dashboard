
import React, { useEffect, useState } from 'react';
import { CardContent } from "@/components/ui/card";
import { MessageSquare } from 'lucide-react';
import { cn } from "@/lib/utils";
import styles from "../../../styles/animations.module.css";

interface RecentMessageProps {
  message: any | null;
}

export function RecentMessage({ message }: RecentMessageProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  
  useEffect(() => {
    // Start animation when a message exists
    if (message) {
      setIsAnimating(true);
      
      // Stop animation after 10 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [message?.id]);

  if (!message) {
    return null;
  }

  return (
    <CardContent className={cn(
      "p-4 bg-primary/10 border-t relative", 
      isAnimating && "animate-vibrate"
    )}>
      <div className="flex items-start gap-3">
        <MessageSquare className={cn(
          "h-5 w-5 text-primary shrink-0 mt-0.5",
          isAnimating && styles.animateFloat
        )} />
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
