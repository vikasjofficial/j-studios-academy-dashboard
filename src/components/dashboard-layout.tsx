
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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <TopNavigation />
      
      <div className="flex mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-64 hidden md:block">
          <div className="sticky top-16 pt-6">
            <AppSidebar />
          </div>
        </div>
        
        <div className="flex-1 min-w-0 py-6 pl-0 md:pl-8">
          <main className="pb-12">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
