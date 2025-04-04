
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  sender: string;
  senderRole: string;
  text: string;
  timestamp: Date;
}

interface ChatPanelProps {
  channelName: string;
}

export default function ChatPanel({ channelName }: ChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // In a real implementation, you would connect to a real-time messaging service here
  // For demonstration, we'll use local state
  
  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;
    
    const message: Message = {
      id: Date.now().toString(),
      sender: user.name || user.email || 'Unknown User',
      senderRole: user.role || 'student',
      text: newMessage,
      timestamp: new Date()
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // In a real implementation, you would send this message to your real-time service
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Sample messages for demonstration
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '0',
      sender: 'System',
      senderRole: 'system',
      text: `Welcome to the chat for ${channelName}. Messages are only visible during this session.`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, [channelName]);
  
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm">Chat</CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2 mb-2">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`p-2 rounded-lg max-w-[85%] ${
                message.senderRole === 'system' 
                  ? 'bg-muted text-xs mx-auto text-center' 
                  : message.sender === (user?.name || user?.email) 
                    ? 'bg-primary/15 ml-auto' 
                    : 'bg-secondary/15'
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-medium">
                <span>{message.sender}</span>
                <span className="text-muted-foreground text-[10px]">
                  {format(message.timestamp, 'h:mm a')}
                </span>
              </div>
              <p className="text-sm mt-1 break-words">{message.text}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex gap-2 mt-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="text-sm"
          />
          <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
