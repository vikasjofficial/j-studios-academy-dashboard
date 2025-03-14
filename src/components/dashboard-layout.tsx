
import { useAuth } from "@/context/auth-context";
import { TopNavigation } from "./top-navigation";
import { AdminNavigation } from "./admin-navigation";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { Home, BookOpen, Users, CheckSquare, Calendar, Settings } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-background to-background/80">
        <TopNavigation />
        
        {user?.role === 'admin' && <AdminNavigation />}
        
        <div className="flex w-full pt-16">
          {/* Left Sidebar */}
          <LeftSidebar />
          
          {/* Main Content */}
          <SidebarInset>
            <div className="flex-1 p-6">
              <main className="pb-12 max-w-7xl mx-auto">
                {children}
              </main>
            </div>
          </SidebarInset>
          
          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </div>
    </SidebarProvider>
  );
}
