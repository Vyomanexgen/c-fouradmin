import { Bell, Search, Plus, Moon, Sun, HelpCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { GlobalSearch, useGlobalSearchController } from "@/components/global-search";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi, NotificationItem } from "@/api/notificationApi";

export function TopBar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);
  const queryClient = useQueryClient();
  
  const name = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "Admin" : "Admin";
  const email = user?.email || "";
  const initials = user
    ? ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || user.email?.[0]?.toUpperCase() || "A"
    : "A";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const { data } = useQuery({
    queryKey: ["notifications", undefined], // Match the general list for the badge
    queryFn: () => notificationApi.getNotifications(),
    refetchInterval: 30000,
  });

  const notifications = data?.data || [];
  const unread = data?.unreadCount || 0;

  const markAsReadMut = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMut = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const searchCtx = useGlobalSearchController();
  const shownToasts = useRef<Set<string>>(new Set());

  // Toast freshly added notifications
  useEffect(() => {
    if (!notifications.length) return;
    if (shownToasts.current.size === 0) {
      // First load, populate set without toasting
      notifications.forEach((n: NotificationItem) => shownToasts.current.add(n._id));
      return;
    }
    
    // Toast any new unread
    notifications.forEach((n: NotificationItem) => {
      if (!n.isRead && !shownToasts.current.has(n._id)) {
        toast(n.title, { description: n.message, id: n._id });
        shownToasts.current.add(n._id);
      }
    });
  }, [notifications]);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <button
        type="button"
        onClick={() => searchCtx.setOpen(true)}
        className="relative hidden h-9 w-full max-w-md items-center gap-2 rounded-md border border-transparent bg-secondary/60 px-3 text-left text-sm text-muted-foreground transition hover:bg-secondary md:flex"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 truncate">Search orders, products, customers…</span>
        <kbd className="pointer-events-none hidden select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-9 w-9"
        onClick={() => searchCtx.setOpen(true)}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>
      <div className="ml-auto flex items-center gap-1.5">
        <Button asChild size="sm" className="hidden h-9 gap-1.5 sm:inline-flex">
          <Link to="/products/new">
            <Plus className="h-4 w-4" />
            New product
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:inline-flex" aria-label="Help">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{unread} new</Badge>
                <button
                  className="text-[11px] text-primary hover:underline disabled:opacity-50"
                  onClick={() => markAllReadMut.mutate()}
                  disabled={markAllReadMut.isPending || unread === 0}
                >
                  Mark all read
                </button>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
               <div className="py-4 text-center text-sm text-muted-foreground">No new notifications</div>
            ) : notifications.slice(0, 5).map((n: NotificationItem) => (
              <DropdownMenuItem
                key={n._id}
                className="flex flex-col items-start gap-0.5 py-2 cursor-pointer"
                onClick={() => {
                  if (!n.isRead) markAsReadMut.mutate(n._id);
                }}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className={`text-sm ${!n.isRead ? "font-semibold" : "font-medium"}`}>{n.title}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <span className="text-xs text-muted-foreground">{n.message}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/notifications" className="w-full text-center text-sm">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground text-xs font-semibold ring-offset-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 uppercase">
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/settings">Account settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/users">Team & roles</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/audit-logs">Audit logs</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => logout()}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <GlobalSearch ctx={searchCtx} />
    </header>
  );
}
