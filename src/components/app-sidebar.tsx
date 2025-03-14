
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings } from 'lucide-react';
import { DownloadStudentPdf } from './download-student-pdf';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from './ui/card';

export function AppSidebar() {
  const { user, logout } = useAuth();

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
          
          <div className="space-y-2 pt-4 border-t border-border/30">
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
