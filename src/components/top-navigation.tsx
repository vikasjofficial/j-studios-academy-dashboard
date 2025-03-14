
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Menu, Settings } from 'lucide-react';
import { DownloadStudentPdf } from './download-student-pdf';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function TopNavigation() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

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
          {/* Mobile menu items */}
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
      <div className="flex h-14 items-center px-4 w-full justify-between">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link to={user?.role === 'admin' ? '/admin' : '/student'} className="inline-flex items-center gap-2">
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              J-Studios
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:block mr-2">
            <DownloadStudentPdf className="mt-0" />
          </div>
          
          <Link to={user?.role === 'admin' ? '/admin/settings' : '/settings'} className="hidden md:inline-flex">
            <Button variant="ghost" size="icon">
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
