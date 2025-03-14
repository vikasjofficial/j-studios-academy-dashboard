
import { useAuth } from "@/context/auth-context";
import { TopNavigation } from "./top-navigation";
import { AppSidebar } from "./app-sidebar";
import { ScrollArea } from "./ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./ui/resizable";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full flex-col">
      <TopNavigation />
      
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 overflow-hidden"
      >
        <ResizablePanel defaultSize={20} minSize={15} maxSize={20} className="hidden md:block">
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            <AppSidebar />
          </ScrollArea>
        </ResizablePanel>
        
        <ResizableHandle withHandle className="hidden md:flex" />
        
        <ResizablePanel defaultSize={80} minSize={30}>
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            <main className="flex-1 p-6 max-w-7xl mx-auto">
              {children}
            </main>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
