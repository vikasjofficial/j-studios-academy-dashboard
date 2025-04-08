
import React, { useEffect, useState } from 'react';
import { CardContent } from "@/components/ui/card";
import { MessageSquare, Bell } from 'lucide-react';
import { cn } from "@/lib/utils";
import styles from "../../../styles/animations.module.css";
import { Link } from 'react-router-dom';

interface RecentMessageProps {
  message: any | null;
}

export function RecentMessage({ message }: RecentMessageProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  
  useEffect(() => {
    // Start animation when a message exists
    if (message) {
      setIsAnimating(true);
      
      // Reset checked state when a new message arrives
      if (message.id) {
        const checkedMessages = JSON.parse(localStorage.getItem('checkedMessages') || '{}');
        setIsChecked(!!checkedMessages[message.id]);
      }
      
      // Stop animation after 10 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [message?.id]);

  const handleMessageClick = () => {
    if (message && message.id) {
      // Mark message as checked in localStorage
      const checkedMessages = JSON.parse(localStorage.getItem('checkedMessages') || '{}');
      checkedMessages[message.id] = true;
      localStorage.setItem('checkedMessages', JSON.stringify(checkedMessages));
      setIsChecked(true);
    }
  };

  if (!message) {
    return null;
  }

  const showNotification = message.sender_role === 'admin' && !isChecked;

  return (
    <Link to="/student/messages" onClick={handleMessageClick}>
      <CardContent className={cn(
        "p-4 bg-primary/10 border-t relative cursor-pointer transition-colors hover:bg-primary/20", 
        isAnimating && "animate-vibrate"
      )}>
        {showNotification && (
          <div className="absolute top-2 right-2 flex items-center">
            <Bell className="h-4 w-4 text-red-500 animate-pulse mr-1" />
            <span className="text-xs font-medium text-red-500">New message</span>
          </div>
        )}
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
    </Link>
  );
}
