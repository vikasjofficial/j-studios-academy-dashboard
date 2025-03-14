
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Home, Users, BookOpen, Calendar, CheckSquare, MessageSquare, Settings, ListChecks } from 'lucide-react';
import { DownloadStudentPdf } from './download-student-pdf';
import { Separator } from '@/components/ui/separator';

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/students', icon: Users, label: 'Students' },
    { href: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { href: '/admin/gradebook', icon: ListChecks, label: 'Gradebook' },
    { href: '/admin/calendar', icon: Calendar, label: 'Calendar' },
    { href: '/admin/attendance', icon: CheckSquare, label: 'Attendance' },
    { href: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const studentMenuItems = [
    { href: '/student', icon: Home, label: 'Dashboard' },
    { href: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { href: '/student/calendar', icon: Calendar, label: 'Schedule' },
    { href: '/student/attendance', icon: CheckSquare, label: 'Attendance' },
    { href: '/student/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  return (
    <div className="w-[240px] min-w-[240px] border-r h-[calc(100vh-3.5rem)] bg-background">
      <div className="p-4 flex flex-col items-center gap-4">
        <Link to={user?.role === 'admin' ? '/admin' : '/student'} className="inline-flex items-center gap-2 py-2">
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            J-Studios
          </span>
        </Link>
        
        <div className="flex items-center w-full gap-3 p-2 rounded-lg bg-secondary/40">
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarImage src={user?.avatarUrl} alt={user?.name || 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="px-2 overflow-y-auto">
        <ul className="flex w-full min-w-0 flex-col gap-1">
          {menuItems.map((item) => (
            <li key={item.href} className="group relative">
              <Link 
                to={item.href} 
                className={`flex items-center gap-3 w-full p-2 rounded-md text-sm ${
                  location.pathname === item.href ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 mt-auto">
        <div className="flex flex-col gap-2">
          <Link to={user?.role === 'admin' ? '/admin/settings' : '/settings'} className="w-full">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          
          {/* Download PDF Button */}
          <DownloadStudentPdf />
          
          <Separator className="my-1" />
          
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
