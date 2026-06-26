import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { products, customers, inventoryAlerts } from "@/lib/mock-data";
import { useOrders } from "@/lib/realtime-store";
import {
  Search, Package, ShoppingCart, Users, AlertTriangle, LayoutDashboard, BarChart3,
  Tags, Boxes, Ticket, Bell, Settings, ShieldCheck, FileText, Megaphone, X,
} from "lucide-react";

// Re-derive category list (mock-data doesn't export "categories" const directly).
const PRODUCT_CATEGORIES = Array.from(new Set(products.map((p) => p.category)));

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

type Module = "all" | "products" | "orders" | "customers" | "inventory" | "pages";

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

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const idx = lower.indexOf(needle);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-yellow-200/70 px-0.5 text-foreground dark:bg-yellow-400/30">
        {text.slice(idx, idx + needle.length)}
      </mark>
      {text.slice(idx + needle.length)}
    </>
  );
}

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "returned", "refunded"];
const PRODUCT_STATUSES = ["active", "draft", "archived"];
const CUSTOMER_SEGMENTS = ["VIP", "Regular", "New", "Churned"];

const LIMIT = 6;

export function GlobalSearch({ ctx }: { ctx: Ctx }) {
  const { open, setOpen } = ctx;
  const navigate = useNavigate();
  const orders = useOrders();
  const [query, setQuery] = useState("");
  const [module, setModule] = useState<Module>("all");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const q = query.trim().toLowerCase();
  const fromT = from ? new Date(from).getTime() : -Infinity;
  const toT = to ? new Date(to).getTime() + 86399999 : Infinity;

  // Reset secondary filters when module changes
  useEffect(() => { setStatus("all"); }, [module]);

  const showProducts = module === "all" || module === "products";
  const showOrders = module === "all" || module === "orders";
  const showCustomers = module === "all" || module === "customers";
  const showInventory = module === "all" || module === "inventory";
  const showPages = module === "all" || module === "pages";

  const matchedProducts = useMemo(() => {
    if (!showProducts) return [];
    return products
      .filter((p) => (q ? p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) : true))
      .filter((p) => (category !== "all" ? p.category === category : true))
      .filter((p) => (module === "products" && status !== "all" ? p.status === status : true))
      .slice(0, LIMIT);
  }, [q, showProducts, category, status, module]);

  const matchedOrders = useMemo(() => {
    if (!showOrders) return [];
    return orders
      .filter((o) => (q ? o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) : true))
      .filter((o) => (module === "orders" && status !== "all" ? o.fulfillment === status : true))
      .filter((o) => {
        const t = new Date(o.date).getTime();
        return t >= fromT && t <= toT;
      })
      .slice(0, LIMIT);
  }, [q, orders, showOrders, module, status, fromT, toT]);

  const matchedCustomers = useMemo(() => {
    if (!showCustomers) return [];
    return customers
      .filter((c) => (q ? c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) : true))
      .filter((c) => (module === "customers" && status !== "all" ? c.segment === status : true))
      .slice(0, LIMIT);
  }, [q, showCustomers, module, status]);

  const matchedInventory = useMemo(() => {
    if (!showInventory) return [];
    return inventoryAlerts
      .filter((p) => (q ? p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) : true))
      .filter((p) => (category !== "all" ? p.category === category : true))
      .slice(0, LIMIT);
  }, [q, showInventory, category]);

  const matchedPages = useMemo(() => {
    if (!showPages) return [];
    return (q ? QUICK_PAGES.filter((p) => p.label.toLowerCase().includes(q)) : QUICK_PAGES.slice(0, LIMIT));
  }, [q, showPages]);

  const totalMatches =
    matchedProducts.length + matchedOrders.length + matchedCustomers.length +
    matchedInventory.length + matchedPages.length;

  const go = (to: string) => {
    setOpen(false);
    setQuery("");
    navigate({ to });
  };

  const statusOptions = useMemo(() => {
    if (module === "orders") return ORDER_STATUSES;
    if (module === "products") return PRODUCT_STATUSES;
    if (module === "customers") return CUSTOMER_SEGMENTS;
    return [];
  }, [module]);

  const filtersActive = module !== "all" || status !== "all" || category !== "all" || from || to;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Global search</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search products, orders, customers, inventory…"
            className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">ESC</kbd>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
          <FilterChip label="Module" value={module} onValueChange={(v) => setModule(v as Module)}
            options={[
              { v: "all", l: "All" }, { v: "products", l: "Products" }, { v: "orders", l: "Orders" },
              { v: "customers", l: "Customers" }, { v: "inventory", l: "Inventory" }, { v: "pages", l: "Pages" },
            ]}
          />
          {statusOptions.length > 0 && (
            <FilterChip label="Status" value={status} onValueChange={setStatus}
              options={[{ v: "all", l: "Any" }, ...statusOptions.map((s) => ({ v: s, l: s }))]}
            />
          )}
          {(module === "all" || module === "products" || module === "inventory") && (
            <FilterChip label="Category" value={category} onValueChange={setCategory}
              options={[{ v: "all", l: "Any" }, ...PRODUCT_CATEGORIES.map((c) => ({ v: c, l: c }))]}
            />
          )}
          {(module === "all" || module === "orders") && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Date</span>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-7 w-[130px] text-xs" />
              <span className="text-xs text-muted-foreground">→</span>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-7 w-[130px] text-xs" />
            </div>
          )}
          {filtersActive && (
            <Button variant="ghost" size="sm" className="ml-auto h-7 px-2 text-xs"
              onClick={() => { setModule("all"); setStatus("all"); setCategory("all"); setFrom(""); setTo(""); }}>
              <X className="mr-1 h-3 w-3" /> Reset
            </Button>
          )}
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {totalMatches === 0 && (
            <div className="grid place-items-center py-12 text-sm text-muted-foreground">No results found.</div>
          )}

          {matchedPages.length > 0 && (
            <Group title="Navigate">
              {matchedPages.map((p) => (
                <Row key={p.to} onClick={() => go(p.to)} icon={<p.icon className="h-4 w-4 text-muted-foreground" />}>
                  <Highlight text={p.label} q={q} />
                </Row>
              ))}
            </Group>
          )}

          {matchedProducts.length > 0 && (
            <Group title="Products">
              {matchedProducts.map((p) => (
                <Row key={p.id} onClick={() => go("/products")} icon={<Package className="h-4 w-4 text-muted-foreground" />}
                  right={<><Badge variant="outline" className="text-[10px]">{p.category}</Badge><span className="font-mono text-[10px] text-muted-foreground">{p.sku}</span></>}>
                  <Highlight text={p.name} q={q} />
                </Row>
              ))}
            </Group>
          )}

          {matchedOrders.length > 0 && (
            <Group title="Orders">
              {matchedOrders.map((o) => (
                <Row key={o.id} onClick={() => go(`/orders/${o.id.replace("#", "")}`)} icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
                  right={<><Badge variant="outline" className="text-[10px] capitalize">{o.fulfillment}</Badge><span className="text-[11px] text-muted-foreground">${o.amount.toFixed(2)}</span></>}>
                  <Highlight text={`${o.id} · ${o.customer}`} q={q} />
                </Row>
              ))}
            </Group>
          )}

          {matchedCustomers.length > 0 && (
            <Group title="Customers">
              {matchedCustomers.map((c) => (
                <Row key={c.id} onClick={() => go("/customers")} icon={<Users className="h-4 w-4 text-muted-foreground" />}
                  right={<><Badge variant="outline" className="text-[10px]">{c.segment}</Badge><span className="text-[11px] text-muted-foreground"><Highlight text={c.email} q={q} /></span></>}>
                  <Highlight text={c.name} q={q} />
                </Row>
              ))}
            </Group>
          )}

          {matchedInventory.length > 0 && (
            <Group title="Inventory alerts">
              {matchedInventory.map((p) => (
                <Row key={`inv-${p.id}`} onClick={() => go("/inventory")} icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                  right={<span className="text-[11px] text-muted-foreground">{p.stock} left</span>}>
                  <Highlight text={p.name} q={q} />
                </Row>
              ))}
            </Group>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FilterChip({
  label, value, onValueChange, options,
}: {
  label: string; value: string; onValueChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-7 w-auto gap-1 px-2 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (<SelectItem key={o.v} value={o.v} className="text-xs capitalize">{o.l}</SelectItem>))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{title}</div>
      <div>{children}</div>
    </div>
  );
}

function Row({
  children, icon, right, onClick,
}: { children: React.ReactNode; icon: React.ReactNode; right?: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-muted">
      {icon}
      <span className="flex-1 truncate">{children}</span>
      {right && <span className="ml-2 flex shrink-0 items-center gap-2">{right}</span>}
    </button>
  );
}
