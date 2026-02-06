import { useState } from "react";
import { supabase } from "@/lib/supabase";
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
import { LogOut, Users, Sparkles, Calendar, CalendarDays, Briefcase } from "lucide-react";
import { LeadsPage } from "./pages/LeadsPage";
import { ConfiguratorPage } from "./pages/ConfiguratorPage";
import { KlantenPage } from "./pages/KlantenPage";
import { AfsprakenPage } from "./pages/AfsprakenPage";
import { AgendaPage } from "./pages/AgendaPage";

type Page = "leads" | "configurator" | "klanten" | "agenda" | "afspraken";

interface MenuItem {
  id: Page;
  label: string;
  icon: typeof Briefcase;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "CRM",
    items: [
      { id: "leads", label: "Leads", icon: Briefcase },
      { id: "klanten", label: "Klanten", icon: Users },
    ],
  },
  {
    label: "Agenda",
    items: [
      { id: "agenda", label: "Kalender", icon: CalendarDays },
      { id: "afspraken", label: "Afspraken", icon: Calendar },
    ],
  },
  {
    label: "Tools",
    items: [
      { id: "configurator", label: "AI Configurator", icon: Sparkles },
    ],
  },
];

// Flatten for easy lookup
const allMenuItems = menuGroups.flatMap((group) => group.items);

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
      case "agenda":
        return <AgendaPage />;
      case "afspraken":
        return <AfsprakenPage />;
      default:
        return <LeadsPage />;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
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
            {menuGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
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
            ))}
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
                  {allMenuItems.find((item) => item.id === activePage)?.label || "Admin Dashboard"}
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
