
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LogOut, Home, Users, BookOpen, Calendar, 
  CheckSquare, MessageSquare, Settings, ListChecks 
} from 'lucide-react';
import { DownloadStudentPdf } from './download-student-pdf';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from './ui/card';

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/students', icon: Users, label: 'Students' },
    { href: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { href: '/admin/gradebook', icon: ListChecks, label: 'Gradebook' },
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
    <Card className="bg-card/80 backdrop-blur-sm border border-border/40">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col items-center space-y-4 pb-4 border-b border-border/30">
            <Avatar className="w-16 h-16 border-2 border-primary/30">
              <AvatarImage src={user?.avatarUrl} alt={user?.name || 'User'} />
              <AvatarFallback className="bg-primary/80 text-primary-foreground">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-medium text-sm">{user?.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-all ${
                  location.pathname === item.href 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="space-y-2 pt-4 border-t border-border/30">
            <Link to={user?.role === 'admin' ? '/admin/settings' : '/settings'} className="w-full">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
            
            <DownloadStudentPdf className="w-full" />
            
            <Separator className="my-2 opacity-30" />
            
            <Button variant="ghost" className="w-full justify-start hover:text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
