
import { useAuth } from "@/context/auth-context";
import { TopNavigation } from "./top-navigation";
import { AppSidebar } from "./app-sidebar";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  Menubar, 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem,
  MenubarSeparator
} from "./ui/menubar";
import { 
  Home, 
  BookOpen, 
  Users, 
  Settings, 
  HelpCircle, 
  Bell, 
  MessageSquare, 
  Calendar 
} from "lucide-react";

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
              {/* Menubar Component */}
              <Menubar className="mb-6 border border-border/40 bg-background/80 backdrop-blur-sm">
                <MenubarMenu>
                  <MenubarTrigger className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>Dashboard</MenubarItem>
                    <MenubarItem>Activity</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>Recent</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                
                <MenubarMenu>
                  <MenubarTrigger className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Courses</span>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>My Courses</MenubarItem>
                    <MenubarItem>Enrolled</MenubarItem>
                    <MenubarItem>Completed</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                
                <MenubarMenu>
                  <MenubarTrigger className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule</span>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>Calendar</MenubarItem>
                    <MenubarItem>Upcoming</MenubarItem>
                    <MenubarItem>Past Events</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                
                <MenubarMenu>
                  <MenubarTrigger className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Messages</span>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>Inbox</MenubarItem>
                    <MenubarItem>Sent</MenubarItem>
                    <MenubarItem>Drafts</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                
                <MenubarMenu>
                  <MenubarTrigger className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Help</span>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>Documentation</MenubarItem>
                    <MenubarItem>Support</MenubarItem>
                    <MenubarItem>Contact</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
              
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
