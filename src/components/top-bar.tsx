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
import {
  notificationsApi, shouldShowToast, startRealtimeSimulator, useNotifications,
} from "@/lib/realtime-store";
import { toast } from "sonner";

export function TopBar() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const notifications = useNotifications();
  const unread = notifications.filter((n) => n.unread).length;
  const searchCtx = useGlobalSearchController();
  const initialized = useRef(false);

  useEffect(() => {
    startRealtimeSimulator();
  }, []);

  // Toast freshly added notifications, deduped persistently by event id.
  useEffect(() => {
    if (!initialized.current) {
      // Don't toast the seed batch on first render. Mark them as seen.
      notifications.forEach((n) => shouldShowToast(n.id));
      initialized.current = true;
      return;
    }
    const latest = notifications[0];
    if (latest && latest.unread && shouldShowToast(latest.id)) {
      toast(latest.title, { description: latest.desc, id: latest.id });
    }
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
                  className="text-[11px] text-primary hover:underline"
                  onClick={() => notificationsApi.markAllRead()}
                >
                  Mark all read
                </button>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.slice(0, 5).map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-0.5 py-2"
                onClick={() => notificationsApi.markRead(n.id)}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                </div>
                <span className="text-xs text-muted-foreground">{n.desc}</span>
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
            <button className="ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground text-xs font-semibold ring-offset-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              EB
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Elena Brooks</span>
                <span className="text-xs text-muted-foreground">elena@store.io</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/settings">Account settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/users">Team & roles</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/audit-logs">Audit logs</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <GlobalSearch ctx={searchCtx} />
    </header>
  );
}
