import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/Admin/AuthGuard";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LogOut, Users, Sparkles, Calendar, Clock, Briefcase } from "lucide-react";
import { LeadsPage } from "./pages/LeadsPage";
import { ConfiguratorPage } from "./pages/ConfiguratorPage";
import { KlantenPage } from "./pages/KlantenPage";
import { AfsprakenPage } from "./pages/AfsprakenPage";
import { FollowUpPage } from "./pages/FollowUpPage";

type Page = "leads" | "configurator" | "klanten" | "afspraken" | "follow-up";

const menuItems = [
  {
    id: "leads" as Page,
    label: "Leads",
    icon: Briefcase,
  },
  {
    id: "configurator" as Page,
    label: "AI Configurator",
    icon: Sparkles,
  },
  {
    id: "klanten" as Page,
    label: "Klanten",
    icon: Users,
  },
  {
    id: "afspraken" as Page,
    label: "Afspraken",
    icon: Calendar,
  },
  {
    id: "follow-up" as Page,
    label: "Follow-up",
    icon: Clock,
  },
];

const Dashboard = () => {
  const [activePage, setActivePage] = useState<Page>("leads");

  const renderPage = () => {
    switch (activePage) {
      case "leads":
        return <LeadsPage />;
      case "configurator":
        return <ConfiguratorPage />;
      case "klanten":
        return <KlantenPage />;
      case "afspraken":
        return <AfsprakenPage />;
      case "follow-up":
        return <FollowUpPage />;
      default:
        return <LeadsPage />;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <AuthGuard>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="px-4 py-2">
              <h2 className="text-lg font-bold text-foreground">Admin Dashboard</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigatie</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActivePage(item.id)}
                          isActive={activePage === item.id}
                          tooltip={item.label}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                  <span>Uitloggen</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="font-display text-xl font-bold text-foreground">
                  {menuItems.find((item) => item.id === activePage)?.label || "Admin Dashboard"}
                </h1>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6">
            {renderPage()}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
};

export default Dashboard;

