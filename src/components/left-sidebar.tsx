
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "./ui/sidebar";
import { Home, Users, BookOpen, CheckSquare, Calendar, MessageSquare, Settings, HelpCircle, BookOpenText, LogOut, Download, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { DownloadStudentPdf } from "./download-student-pdf";

export function LeftSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const today = new Date();

  // Navigation items based on user role
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
        {/* Today's Date and Time */}
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
        
        {/* Download Report Button */}
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
