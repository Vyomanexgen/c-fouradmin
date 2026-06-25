import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { products, customers, inventoryAlerts } from "@/lib/mock-data";
import { useOrders } from "@/lib/realtime-store";
import {
  Package, ShoppingCart, Users, AlertTriangle, LayoutDashboard, BarChart3,
  Tags, Boxes, Ticket, Bell, Settings, ShieldCheck, FileText, Megaphone,
} from "lucide-react";

const QUICK_PAGES = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Products", to: "/products", icon: Package },
  { label: "Categories", to: "/categories", icon: Tags },
  { label: "Inventory", to: "/inventory", icon: Boxes },
  { label: "Orders", to: "/orders", icon: ShoppingCart },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Coupons", to: "/coupons", icon: Ticket },
  { label: "Marketing", to: "/marketing", icon: Megaphone },
  { label: "Content", to: "/content", icon: FileText },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Admin Users", to: "/users", icon: ShieldCheck },
  { label: "Audit Logs", to: "/audit-logs", icon: FileText },
  { label: "Settings", to: "/settings", icon: Settings },
];

type Ctx = ReturnType<typeof useGlobalSearchController>;

export function useGlobalSearchController() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}

export function GlobalSearch({ ctx }: { ctx: Ctx }) {
  const { open, setOpen } = ctx;
  const navigate = useNavigate();
  const orders = useOrders();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const limit = 6;

  const matchedProducts = useMemo(
    () => (q ? products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, limit) : products.slice(0, limit)),
    [q],
  );
  const matchedOrders = useMemo(
    () => (q ? orders.filter((o) => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q)).slice(0, limit) : orders.slice(0, limit)),
    [q, orders],
  );
  const matchedCustomers = useMemo(
    () => (q ? customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, limit) : customers.slice(0, limit)),
    [q],
  );
  const matchedInventory = useMemo(
    () => (q ? inventoryAlerts.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, limit) : inventoryAlerts.slice(0, limit)),
    [q],
  );
  const matchedPages = useMemo(
    () => (q ? QUICK_PAGES.filter((p) => p.label.toLowerCase().includes(q)) : QUICK_PAGES.slice(0, limit)),
    [q],
  );

  const go = (to: string) => {
    setOpen(false);
    setQuery("");
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search products, orders, customers, inventory…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {matchedPages.length > 0 && (
          <CommandGroup heading="Navigate">
            {matchedPages.map((p) => (
              <CommandItem key={p.to} value={`page-${p.label}`} onSelect={() => go(p.to)}>
                <p.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {matchedProducts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Products">
              {matchedProducts.map((p) => (
                <CommandItem key={p.id} value={`prd-${p.id}-${p.name}`} onSelect={() => go("/products")}>
                  <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{p.name}</span>
                  <span className="ml-2 font-mono text-[10px] text-muted-foreground">{p.sku}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {matchedOrders.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Orders">
              {matchedOrders.map((o) => (
                <CommandItem key={o.id} value={`ord-${o.id}-${o.customer}`} onSelect={() => go(`/orders/${o.id.replace("#", "")}`)}>
                  <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{o.id} · {o.customer}</span>
                  <span className="ml-2 text-[11px] text-muted-foreground">${o.amount.toFixed(2)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {matchedCustomers.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Customers">
              {matchedCustomers.map((c) => (
                <CommandItem key={c.id} value={`cus-${c.id}-${c.name}`} onSelect={() => go("/customers")}>
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{c.name}</span>
                  <span className="ml-2 text-[11px] text-muted-foreground">{c.email}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {matchedInventory.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Inventory alerts">
              {matchedInventory.map((p) => (
                <CommandItem key={`inv-${p.id}`} value={`inv-${p.id}-${p.name}`} onSelect={() => go("/inventory")}>
                  <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{p.name}</span>
                  <span className="ml-2 text-[11px] text-muted-foreground">{p.stock} left</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
