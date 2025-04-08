
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, User } from 'lucide-react';

interface StudentAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  studentId?: string | null;
  grade?: string | null;
}

export function StudentAvatar({ avatarUrl, name, studentId, grade }: StudentAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
      <Avatar className="h-24 w-24 border-4 border-background">
        <AvatarImage src={avatarUrl} alt={name || 'Student'} />
        <AvatarFallback className="text-xl">
          {name ? getInitials(name) : 'S'}
        </AvatarFallback>
      </Avatar>
      
      <div className="space-y-2 text-center md:text-left flex-1">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center">
            <Badge variant="outline" className="flex items-center gap-1 bg-primary/5">
              <User className="h-3 w-3" />
              ID: {studentId || 'N/A'}
            </Badge>
            {grade && (
              <Badge variant="outline" className="flex items-center gap-1 bg-primary/5">
                <GraduationCap className="h-3.5 w-3.5" />
                Grade: {grade}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
