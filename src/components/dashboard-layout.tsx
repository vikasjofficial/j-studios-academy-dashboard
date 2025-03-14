
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TopNavigation } from './top-navigation';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();

  // Reset scroll position on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none z-0"></div>
      
      {/* Top Navigation */}
      <TopNavigation />
      
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 w-full overflow-hidden"
      >
        {/* Left sidebar */}
        <ResizablePanel 
          defaultSize={15} 
          minSize={10}
          maxSize={20}
          className="hidden md:block"
        >
          <div className="h-full p-4 border-r bg-sidebar">
            <h3 className="font-medium mb-4">Navigation</h3>
            <div className="space-y-2">
              <div className="p-2 bg-muted/50 rounded-md">Dashboard</div>
              <div className="p-2 hover:bg-muted/30 rounded-md cursor-pointer">Courses</div>
              <div className="p-2 hover:bg-muted/30 rounded-md cursor-pointer">Attendance</div>
              <div className="p-2 hover:bg-muted/30 rounded-md cursor-pointer">Messages</div>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Main content */}
        <ResizablePanel defaultSize={70}>
          <div className="flex-1 flex flex-col relative overflow-hidden w-full">
            {/* Subtle gradient background shapes */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
              <div className="animate-float absolute top-[5%] right-[10%] w-72 h-72 rounded-full bg-primary/5 blur-3xl"></div>
              <div className="animate-float animation-delay-2000 absolute bottom-[10%] left-[5%] w-96 h-96 rounded-full bg-blue-400/5 blur-3xl"></div>
              <div className="animate-pulse animation-delay-1000 absolute top-[35%] left-[15%] w-64 h-64 rounded-full bg-accent/5 blur-3xl"></div>
            </div>
            
            <ScrollArea className="h-[calc(100vh-3.5rem)]">
              <main className="p-4 md:p-6 relative z-10">
                <div className="mx-auto max-w-5xl animate-in-subtle">
                  {children}
                </div>
              </main>
            </ScrollArea>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Right sidebar */}
        <ResizablePanel 
          defaultSize={15}
          minSize={10}
          maxSize={20}
          className="hidden md:block"
        >
          <div className="h-full p-4 border-l bg-sidebar">
            <h3 className="font-medium mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="text-sm p-2 bg-muted/50 rounded-md">
                <p className="font-medium">New grade posted</p>
                <p className="text-xs text-muted-foreground">5 minutes ago</p>
              </div>
              <div className="text-sm p-2 bg-muted/50 rounded-md">
                <p className="font-medium">Course updated</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <div className="text-sm p-2 bg-muted/50 rounded-md">
                <p className="font-medium">Assignment due soon</p>
                <p className="text-xs text-muted-foreground">Tomorrow</p>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <Toaster position="top-right" />
    </div>
  );
}
