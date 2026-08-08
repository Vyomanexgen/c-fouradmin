import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, Tags, ShoppingCart, Users, Boxes,
  Ticket, Star, BarChart3, Megaphone, FileText, Settings,
  ShieldCheck, Bell, Store, ScrollText, Mail, LayoutTemplate
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";

const sections: { label: string; items: { title: string; url: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", url: "/products", icon: Package },
      { title: "Categories", url: "/categories", icon: Tags },
      { title: "Inventory", url: "/inventory", icon: Boxes },
      { title: "Reviews", url: "/reviews", icon: Star },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", url: "/orders", icon: ShoppingCart },
      { title: "Customers", url: "/customers", icon: Users },
      { title: "Coupons", url: "/coupons", icon: Ticket },
      { title: "Contact Inquiries", url: "/contact-inquiries", icon: Mail },
    ],
  },
  {
    label: "Growth",
    items: [
      { title: "Marketing", url: "/marketing", icon: Megaphone },
      { title: "Content", url: "/content", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Admin Users", url: "/users", icon: ShieldCheck },
      { title: "Audit Logs", url: "/audit-logs", icon: ScrollText },
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Storefront Config", url: "/storefront-config", icon: LayoutTemplate },
    ],
  },
];


export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));
  const { user } = useAuth();

  const name = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "Admin" : "Admin";
  const role = user?.role || "Administrator";
  const initials = user
    ? ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || user.email?.[0]?.toUpperCase() || "A"
    : "A";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Store className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-tight">Northwind</span>
            <span className="truncate text-xs text-muted-foreground">Admin Console</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2 group-data-[collapsible=icon]:hidden">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground text-xs font-semibold uppercase">
            {initials}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{name}</span>
            <span className="truncate text-xs text-muted-foreground">{role}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
