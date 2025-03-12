
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Top of page on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 h-screen">
            <main className="flex-1 p-6">
              <div className="fade-in slide-in-from-bottom-2 duration-300 mx-auto">
                {children}
              </div>
            </main>
          </ScrollArea>
        </div>
        <Toaster position="top-right" />
      </div>
    </SidebarProvider>
  );
}
