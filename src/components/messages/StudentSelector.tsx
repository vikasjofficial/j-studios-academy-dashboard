
import React from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Student } from '@/hooks/use-students';
import styles from '@/styles/messages.module.css';

interface StudentSelectorProps {
  students: Student[];
  selectedStudent: string | null;
  onSelectStudent: (studentId: string) => void;
}

export function StudentSelector({ students, selectedStudent, onSelectStudent }: StudentSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredStudents = students.filter(student => 
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="col-span-1 bg-muted/30 rounded-lg p-4">
      <div className="mb-4">
        <h4 className="font-medium text-sm mb-2">Students</h4>
        <Input 
          type="search"
          placeholder="Search students..."
          className="mb-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className={`${styles.studentList} space-y-2 max-h-[400px] overflow-y-auto pr-2`}>
        {filteredStudents.map(student => (
          <div 
            key={student.id}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${selectedStudent === student.id ? 'bg-muted' : ''}`}
            onClick={() => onSelectStudent(student.id)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={student.profile_image} />
              <AvatarFallback>{student.first_name.charAt(0)}{student.last_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">{student.first_name} {student.last_name}</div>
              <div className="text-xs text-muted-foreground truncate">{student.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
