
import { useRef } from 'react';
import { format } from 'date-fns';
import { MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_role: string;
  created_at: string;
  from_name: string;
  student_id: string;
  message_type?: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getMessageTypeColor = (type?: string) => {
    switch (type) {
      case 'Leave Request':
        return 'bg-orange-100 text-orange-800';
      case 'Absent Request':
        return 'bg-red-100 text-red-800';
      case 'Submission Request':
        return 'bg-blue-100 text-blue-800';
      case 'Admin Response':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <MessageCircle className="h-12 w-12 mb-2 opacity-20" />
          <p>No messages yet</p>
          <p className="text-sm">Start a conversation with your instructors</p>
        </div>
      ) : (
        messages.map((message) => (
          <div 
            key={message.id}
            className={`flex flex-col ${
              message.sender_role === 'student' ? 'items-end' : 'items-start'
            }`}
          >
            {message.message_type && message.sender_role === 'student' && (
              <div className="mb-1">
                <span className={`text-xs px-2 py-1 rounded-full ${getMessageTypeColor(message.message_type)}`}>
                  {message.message_type}
                </span>
              </div>
            )}
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender_role === 'student' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}
            >
              <p className="break-words">{message.content}</p>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span>{message.from_name}</span>
              <span>•</span>
              <span>{format(new Date(message.created_at), 'MMMM d, h:mm a')}</span>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
