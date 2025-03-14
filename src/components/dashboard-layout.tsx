
import { useAuth } from "@/context/auth-context";
import { TopNavigation } from "./top-navigation";
import { AppSidebar } from "./app-sidebar";
import { ScrollArea } from "./ui/scroll-area";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen w-[1200px] mx-auto flex-col">
      <TopNavigation />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[240px] min-w-[240px]">
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            <AppSidebar />
          </ScrollArea>
        </div>
        
        <div className="flex-1 overflow-x-hidden">
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            <div className="px-6 pt-6 w-[960px]">
              <main className="flex-1 w-[960px]">
                {children}
              </main>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
