
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LogOut, 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Settings,
  ListChecks,
  Menu
} from 'lucide-react';
import { DownloadStudentPdf } from './download-student-pdf';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function TopNavigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

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

  const MobileMenu = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="py-4">
        <div className="flex items-center mb-6 px-2">
          <Link to={user?.role === 'admin' ? '/admin' : '/student'} className="inline-flex items-center gap-2">
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              J-Studios
            </span>
          </Link>
        </div>
        
        <div className="flex flex-col space-y-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md text-sm transition-colors",
                location.pathname === item.href 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "hover:bg-muted"
              )}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
          
          <Link
            to={user?.role === 'admin' ? '/admin/settings' : '/settings'}
            className={cn(
              "flex items-center gap-3 p-2 rounded-md text-sm transition-colors mt-4",
              location.pathname.includes('/settings') 
                ? "bg-primary/10 text-primary font-medium" 
                : "hover:bg-muted"
            )}
            onClick={() => setIsOpen(false)}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
          
          <DownloadStudentPdf className="mt-2" />
          
          <Button 
            variant="ghost" 
            className="justify-start mt-4" 
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 mr-4">
          <Link to={user?.role === 'admin' ? '/admin' : '/student'} className="inline-flex items-center gap-2">
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              J-Studios
            </span>
          </Link>
        </div>
        
        <MobileMenu />
        
        <NavigationMenu className="hidden md:flex mx-6">
          <NavigationMenuList>
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link to={item.href}>
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      location.pathname === item.href && "bg-accent/50 text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex items-center ml-auto gap-2">
          <div className="hidden md:block mr-2">
            <DownloadStudentPdf />
          </div>
          
          <Link to={user?.role === 'admin' ? '/admin/settings' : '/settings'} className="hidden md:inline-flex">
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                location.pathname.includes('/settings') && "bg-accent/50"
              )}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
          
          <div className="hidden md:block">
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2 border-l pl-2 ml-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl} alt={user?.name || 'User'} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
