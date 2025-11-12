import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CircleDollarSign, Cog, Dog, FileBarChart2, Home, ListChecks, MessageSquareText, Users } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";

const menu = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/servicios", label: "Servicios", icon: ListChecks },
  { to: "/cobros", label: "Cobros", icon: CircleDollarSign },
  { to: "/recordatorios", label: "Recordatorios", icon: MessageSquareText },
  { to: "/reportes", label: "Reportes", icon: FileBarChart2 },
  { to: "/config", label: "Configuración", icon: Cog },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <Sidebar className="border-r" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <Dog className="h-6 w-6 text-primary" />
            <span className="font-bold text-sm">Manolo’s Gestión</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menú</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menu.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <NavLink to={item.to} className="block" end={item.to === "/"}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                          <item.icon className={isActive ? "text-[hsl(var(--brand-primary))]" : ""} />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 py-1 text-xs text-muted-foreground">{user ? `Sesión: ${user.nombre}` : ""}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={() => { logout(); navigate("/login"); }}>Cerrar sesión</Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background px-3">
          <SidebarTrigger />
          <div className="flex-1" />
          <div className="text-sm">{user?.correo}</div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
