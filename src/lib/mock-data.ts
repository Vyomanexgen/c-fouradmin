// Mock data for admin dashboard. Pure functions, no side effects.
// Stable epoch so SSR and client renders match (avoid hydration drift).
const BASE_EPOCH = Date.UTC(2026, 5, 25); // 2026-06-25


export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" | "refunded";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export const kpis = {
  revenue: { value: 184290, delta: 12.4 },
  orders: { value: 2438, delta: 8.1 },
  customers: { value: 18402, delta: 4.2 },
  products: { value: 1284, delta: 1.6 },
  pending: { value: 64, delta: -3.2 },
  lowStock: { value: 23, delta: 11.0 },
  conversion: { value: 3.42, delta: 0.6 },
  aov: { value: 75.6, delta: 2.3 },
};

export const revenueSeries = [
  { date: "Jan", revenue: 12400, orders: 240 },
  { date: "Feb", revenue: 14210, orders: 268 },
  { date: "Mar", revenue: 15890, orders: 302 },
  { date: "Apr", revenue: 17320, orders: 314 },
  { date: "May", revenue: 16100, orders: 290 },
  { date: "Jun", revenue: 19840, orders: 360 },
  { date: "Jul", revenue: 21280, orders: 401 },
  { date: "Aug", revenue: 20410, orders: 388 },
  { date: "Sep", revenue: 22890, orders: 420 },
  { date: "Oct", revenue: 24130, orders: 446 },
  { date: "Nov", revenue: 26780, orders: 491 },
  { date: "Dec", revenue: 29410, orders: 532 },
];

export const categorySplit = [
  { name: "Electronics", value: 38 },
  { name: "Fashion", value: 24 },
  { name: "Home", value: 18 },
  { name: "Beauty", value: 12 },
  { name: "Sports", value: 8 },
];

export const customerGrowth = [
  { date: "W1", new: 120, returning: 80 },
  { date: "W2", new: 142, returning: 96 },
  { date: "W3", new: 168, returning: 110 },
  { date: "W4", new: 184, returning: 132 },
  { date: "W5", new: 210, returning: 148 },
  { date: "W6", new: 236, returning: 162 },
  { date: "W7", new: 268, returning: 188 },
  { date: "W8", new: 292, returning: 210 },
];

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  status: "active" | "draft" | "archived";
  rating: number;
  sales: number;
  image: string;
};

const productNames = [
  "Aurora Wireless Headphones", "Nimbus Smart Watch", "Helios Bluetooth Speaker",
  "Vega Mechanical Keyboard", "Orion Ergonomic Chair", "Lyra Standing Desk",
  "Atlas Travel Backpack", "Cosmo Running Shoes", "Stellar Yoga Mat",
  "Nova Coffee Maker", "Comet Air Purifier", "Pulsar LED Lamp",
  "Quasar Phone Case", "Galaxy Wireless Charger", "Eclipse Sunglasses",
  "Meteor Water Bottle", "Solstice Hoodie", "Equinox Joggers",
  "Zenith Skincare Set", "Apex Protein Powder",
];
const categories = ["Electronics", "Fashion", "Home", "Beauty", "Sports", "Accessories"];
const statuses: Product["status"][] = ["active", "active", "active", "draft", "archived"];

export const products: Product[] = productNames.map((name, i) => ({
  id: `prd_${1000 + i}`,
  name,
  sku: `SKU-${String(2000 + i * 7).padStart(5, "0")}`,
  category: categories[i % categories.length],
  price: 29 + ((i * 13) % 280),
  salePrice: i % 3 === 0 ? 19 + ((i * 11) % 200) : undefined,
  stock: i % 7 === 0 ? 0 : i % 5 === 0 ? 4 : 12 + ((i * 17) % 180),
  status: statuses[i % statuses.length],
  rating: 3.6 + ((i * 0.13) % 1.4),
  sales: 120 + ((i * 47) % 980),
  image: `https://picsum.photos/seed/prd${i}/96/96`,
}));

export const topProducts = [...products].sort((a, b) => b.sales - a.sales).slice(0, 5);

export type Order = {
  id: string;
  customer: string;
  email: string;
  date: string;
  amount: number;
  items: number;
  payment: PaymentStatus;
  fulfillment: OrderStatus;
};

const customerNames = [
  "Liam Carter", "Sofia Reyes", "Noah Patel", "Ava Chen", "Ethan Rivera",
  "Mia Nakamura", "Lucas Brooks", "Isabella Romano", "Mason Cohen", "Zoe Andersen",
  "Logan Park", "Amelia Singh", "Jackson Hoang", "Harper Lopez", "Aiden Murphy",
  "Ella Petrov", "Owen Sato", "Aria Fischer", "Henry Kowalski", "Layla Mensah",
];
const payStatuses: PaymentStatus[] = ["paid", "paid", "paid", "pending", "failed", "refunded"];
const fulStatuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"];

export const orders: Order[] = Array.from({ length: 24 }, (_, i) => ({
  id: `#ORD-${4820 + i}`,
  customer: customerNames[i % customerNames.length],
  email: customerNames[i % customerNames.length].toLowerCase().replace(" ", ".") + "@mail.com",
  date: new Date(Date.now() - i * 86400000 * 0.6).toISOString().slice(0, 10),
  amount: 38 + ((i * 29) % 480),
  items: 1 + (i % 5),
  payment: payStatuses[i % payStatuses.length],
  fulfillment: fulStatuses[i % fulStatuses.length],
}));

export type Customer = {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  spent: number;
  segment: "VIP" | "Regular" | "New" | "Churned";
  lastActive: string;
};

const segments: Customer["segment"][] = ["VIP", "Regular", "New", "Regular", "Churned", "Regular", "VIP", "New"];

export const customers: Customer[] = customerNames.map((name, i) => ({
  id: `cus_${500 + i}`,
  name,
  email: name.toLowerCase().replace(" ", ".") + "@mail.com",
  joined: new Date(Date.now() - (i + 4) * 86400000 * 14).toISOString().slice(0, 10),
  orders: 1 + ((i * 3) % 28),
  spent: 80 + ((i * 137) % 4800),
  segment: segments[i % segments.length],
  lastActive: new Date(Date.now() - i * 86400000 * 1.4).toISOString().slice(0, 10),
}));

export const coupons = [
  { code: "WELCOME15", type: "Percentage", value: "15%", uses: 1248, limit: 5000, expires: "2026-12-31", status: "Active" },
  { code: "FREESHIP", type: "Free Shipping", value: "—", uses: 842, limit: 2000, expires: "2026-09-30", status: "Active" },
  { code: "SUMMER40", type: "Percentage", value: "40%", uses: 312, limit: 500, expires: "2026-08-15", status: "Scheduled" },
  { code: "FLAT10", type: "Fixed", value: "$10", uses: 4218, limit: 10000, expires: "2027-01-01", status: "Active" },
  { code: "BLACKFRI", type: "Percentage", value: "50%", uses: 980, limit: 1000, expires: "2026-11-29", status: "Paused" },
];

export const reviews = [
  { id: "rv1", product: "Aurora Wireless Headphones", author: "Sofia Reyes", rating: 5, text: "Sound is incredible, battery lasts all day.", status: "pending", date: "2026-06-20" },
  { id: "rv2", product: "Nimbus Smart Watch", author: "Liam Carter", rating: 4, text: "Great features, strap could be better.", status: "approved", date: "2026-06-18" },
  { id: "rv3", product: "Helios Bluetooth Speaker", author: "Mia Nakamura", rating: 2, text: "Buzzes at high volume.", status: "rejected", date: "2026-06-17" },
  { id: "rv4", product: "Vega Mechanical Keyboard", author: "Lucas Brooks", rating: 5, text: "Best typing experience I've had.", status: "pending", date: "2026-06-22" },
  { id: "rv5", product: "Cosmo Running Shoes", author: "Ava Chen", rating: 4, text: "Comfortable, runs slightly small.", status: "approved", date: "2026-06-15" },
];

export const notifications = [
  { id: "n1", type: "order", title: "New order #ORD-4844", desc: "Liam Carter placed an order for $248.00", time: "2m ago", unread: true },
  { id: "n2", type: "stock", title: "Low stock: Vega Mechanical Keyboard", desc: "Only 4 units remaining", time: "18m ago", unread: true },
  { id: "n3", type: "payment", title: "Payment failed", desc: "Stripe declined charge for #ORD-4831", time: "1h ago", unread: true },
  { id: "n4", type: "message", title: "Customer message", desc: "Sofia Reyes asked about return policy", time: "3h ago", unread: false },
  { id: "n5", type: "refund", title: "Refund requested", desc: "#ORD-4812 — $58.00", time: "Yesterday", unread: false },
];

export const adminUsers = [
  { id: "u1", name: "Elena Brooks", email: "elena@store.io", role: "Super Admin", lastLogin: "2026-06-24 09:12", status: "Active" },
  { id: "u2", name: "Marcus Wei", email: "marcus@store.io", role: "Admin", lastLogin: "2026-06-23 17:48", status: "Active" },
  { id: "u3", name: "Priya Shah", email: "priya@store.io", role: "Inventory Manager", lastLogin: "2026-06-22 11:02", status: "Active" },
  { id: "u4", name: "Daniel Kim", email: "daniel@store.io", role: "Customer Support", lastLogin: "2026-06-20 14:30", status: "Active" },
  { id: "u5", name: "Aisha Bello", email: "aisha@store.io", role: "Manager", lastLogin: "2026-06-15 08:55", status: "Invited" },
];

export const categoriesList = [
  { id: "c1", name: "Electronics", slug: "electronics", products: 248, parent: "—", status: "Visible" },
  { id: "c2", name: "Audio", slug: "electronics/audio", products: 64, parent: "Electronics", status: "Visible" },
  { id: "c3", name: "Wearables", slug: "electronics/wearables", products: 38, parent: "Electronics", status: "Visible" },
  { id: "c4", name: "Fashion", slug: "fashion", products: 412, parent: "—", status: "Visible" },
  { id: "c5", name: "Men", slug: "fashion/men", products: 184, parent: "Fashion", status: "Visible" },
  { id: "c6", name: "Women", slug: "fashion/women", products: 228, parent: "Fashion", status: "Visible" },
  { id: "c7", name: "Home", slug: "home", products: 196, parent: "—", status: "Visible" },
  { id: "c8", name: "Beauty", slug: "beauty", products: 132, parent: "—", status: "Hidden" },
  { id: "c9", name: "Sports", slug: "sports", products: 96, parent: "—", status: "Visible" },
];

export const inventoryAlerts = products
  .filter((p) => p.stock < 10)
  .map((p) => ({ ...p, reorder: 20, incoming: (p.id.charCodeAt(p.id.length - 1) % 3) * 25 }));
