
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { 
  Home, Users, BookOpen, Calendar, 
  CheckSquare, MessageSquare, Settings, BookOpenText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function AdminNavigation() {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/students', icon: Users, label: 'Students' },
    { href: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { href: '/admin/gradebook', icon: CheckSquare, label: 'Gradebook' },
    { href: '/admin/attendance', icon: Calendar, label: 'Attendance' },
    { href: '/admin/lectures', icon: BookOpenText, label: 'Lectures' },
    { href: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b shadow-sm px-4 py-3 sticky top-16 z-30">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <Button
              variant={location.pathname === item.href ? "default" : "ghost"}
              size="sm"
              className={cn(
                "flex items-center gap-2",
                location.pathname === item.href 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
