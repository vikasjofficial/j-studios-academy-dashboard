
import { useAuth } from "@/context/auth-context";
import { SidebarProvider, SidebarInset, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { PanelLeftClose, PanelLeftOpen, Home, Users, BookOpen, CheckSquare, Calendar, MessageSquare, Settings, HelpCircle, BookOpenText, LogOut, Clock, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useLocation } from "react-router-dom";
import styles from "@/styles/layout.module.css";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "./ui/sidebar";
import { DownloadStudentPdf } from "./download-student-pdf";

function SidebarToggle() {
  const { toggleSidebar, state } = useSidebar();
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="fixed top-20 left-0 z-50 h-8 w-8 rounded-r-full bg-background/80 backdrop-blur border-border/50 shadow-md md:hidden"
      onClick={toggleSidebar}
      aria-label="Toggle Left Sidebar"
    >
      {state === "expanded" ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
    </Button>
  );
}

function LeftSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const today = new Date();

  const adminNavItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/students', icon: Users, label: 'Students' },
    { href: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { href: '/admin/gradebook', icon: CheckSquare, label: 'Gradebook' },
    { href: '/admin/attendance', icon: Calendar, label: 'Attendance' },
    { href: '/admin/lectures', icon: BookOpenText, label: 'Lectures' },
    { href: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const studentNavItems = [
    { href: '/student', icon: Home, label: 'Dashboard' },
    { href: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { href: '/student/lectures', icon: BookOpenText, label: 'My Lectures' },
    { href: '/student/attendance', icon: Calendar, label: 'My Attendance' },
    { href: '/student/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-col items-center px-2 py-3">
          <img 
            src="https://i.ibb.co/ccDKFZgD/logo.png" 
            alt="J-Studios Logo" 
            className="h-4 w-auto" 
          />
          <div className="flex flex-col items-center mt-2">
            <div className="font-semibold">J Studios Academy</div>
            <div className="text-xs text-muted-foreground">Pimpri-Pune</div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Today
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="text-xs p-2 rounded-md bg-muted/50">
              <div className="font-medium">{format(today, "EEEE, MMMM d, yyyy")}</div>
              <div className="text-muted-foreground text-[10px]">Current Time: {format(today, "h:mm a")}</div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Help & Documentation">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help & Documentation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-2">
              <DownloadStudentPdf className="w-full mb-2" />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:text-destructive" 
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">
          <p>© 2023 J-Studios Academy</p>
          <p>All rights reserved</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className={`min-h-screen flex flex-row ${styles.layoutContainer}`}>
        <div className="h-screen">
          <LeftSidebar />
        </div>
        
        <div className="hidden md:block w-[calc(var(--sidebar-width)/4)] flex-shrink-0"></div>
        
        <div className={`flex-1 ${styles.contentContainer}`}>
          <SidebarInset className={styles.customScrollbar}>
            <div className={styles.mainContent}>
              <main className="p-4 pl-8 md:p-6 md:pl-10 lg:p-8 lg:pl-12 w-full">
                {children}
              </main>
            </div>
          </SidebarInset>
          
          <SidebarToggle />
        </div>
      </div>
    </SidebarProvider>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}
