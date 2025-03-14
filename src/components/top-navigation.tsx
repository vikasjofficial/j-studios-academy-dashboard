
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings } from 'lucide-react';
import { DownloadStudentPdf } from './download-student-pdf';

export function TopNavigation() {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-40 w-[1200px] mx-auto border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 w-full justify-between">
        <div className="flex items-center gap-2">
          <Link to={user?.role === 'admin' ? '/admin' : '/student'} className="inline-flex items-center gap-2">
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              J-Studios
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="mr-2">
            <DownloadStudentPdf className="mt-0" />
          </div>
          
          <Link to={user?.role === 'admin' ? '/admin/settings' : '/settings'}>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
          
          <div>
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
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
