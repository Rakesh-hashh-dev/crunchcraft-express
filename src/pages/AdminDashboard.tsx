import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";

import { PageTransition, FadeInSection } from "@/components/AnimationWrappers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  ShoppingBag, Users, BarChart3, Package, ArrowLeft, Search,
  TrendingUp, IndianRupee, Clock, Plus, Trash2, Edit, UserPlus,
  PackageOpen, AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from "recharts";

type Tab = "overview" | "orders" | "users" | "inventory";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_name: string;
  shipping_city: string;
  shipping_address: string;
  shipping_pin: string;
  shipping_phone: string | null;
  payment_method: string;
  user_id: string;
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
  created_at: string;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "#6366f1",
  "#ec4899",
];

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const RestockDialog = ({
  product,
  onRestock,
}: {
  product: Product;
  onRestock: (id: string, addQty: number, newThreshold: number) => void | Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [addQty, setAddQty] = useState("10");
  const [threshold, setThreshold] = useState(String(product.low_stock_threshold));

  useEffect(() => {
    if (open) {
      setAddQty("10");
      setThreshold(String(product.low_stock_threshold));
    }
  }, [open, product.low_stock_threshold]);

  const projected = product.stock_quantity + (Number(addQty) || 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary" title="Restock">
          <PackageOpen className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restock “{product.name}”</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/40 p-3 text-sm font-body">
            Current stock: <span className="font-bold">{product.stock_quantity}</span>
            <span className="mx-2 text-muted-foreground">·</span>
            Threshold: <span className="font-bold">{product.low_stock_threshold}</span>
          </div>
          <div>
            <Label>Add units</Label>
            <Input
              type="number"
              min={0}
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[10, 25, 50, 100].map((n) => (
                <Button key={n} type="button" variant="outline" size="sm" onClick={() => setAddQty(String(n))}>
                  +{n}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground font-body">
              New stock will be <span className="font-bold">{projected}</span>
            </p>
          </div>
          <div>
            <Label>Low-stock threshold</Label>
            <Input
              type="number"
              min={0}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button
            onClick={async () => {
              await onRestock(product.id, Number(addQty) || 0, Number(threshold) || 0);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Add order dialog state
  const [addOrderOpen, setAddOrderOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    shipping_name: "", shipping_city: "", shipping_address: "", shipping_pin: "",
    shipping_phone: "", payment_method: "cod", total_amount: "", status: "pending",
  });

  // Edit order dialog state
  const [editOrderOpen, setEditOrderOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);

  // Add user dialog state
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ display_name: "", phone: "" });

  // Inventory state
  const [products, setProducts] = useState<Product[]>([]);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "", description: "", price: "", stock_quantity: "", low_stock_threshold: "10", category: "millet-puffs", is_active: true,
  });
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [bulkRestockOpen, setBulkRestockOpen] = useState(false);
  const [bulkAddQty, setBulkAddQty] = useState("10");
  const [bulkThreshold, setBulkThreshold] = useState("");

  const handleStatusChange = useCallback(async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) { toast.error("Failed to update status"); }
    else {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order updated to "${newStatus}"`);
    }
    setUpdatingOrderId(null);
  }, []);

  const handleDeleteOrder = useCallback(async (orderId: string) => {
    // Delete order items first, then the order
    await supabase.from("order_items").delete().eq("order_id", orderId);
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) { toast.error("Failed to delete order"); }
    else {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success("Order deleted");
    }
  }, []);

  const handleAddOrder = useCallback(async () => {
    if (!newOrder.shipping_name || !newOrder.total_amount || !user) {
      toast.error("Fill in required fields"); return;
    }
    const { data, error } = await supabase.from("orders").insert({
      shipping_name: newOrder.shipping_name,
      shipping_city: newOrder.shipping_city,
      shipping_address: newOrder.shipping_address,
      shipping_pin: newOrder.shipping_pin,
      shipping_phone: newOrder.shipping_phone || null,
      payment_method: newOrder.payment_method,
      total_amount: Number(newOrder.total_amount),
      status: newOrder.status,
      user_id: user.id,
    }).select().single();
    if (error) { toast.error("Failed to add order"); }
    else if (data) {
      setOrders((prev) => [data, ...prev]);
      setAddOrderOpen(false);
      setNewOrder({ shipping_name: "", shipping_city: "", shipping_address: "", shipping_pin: "", shipping_phone: "", payment_method: "cod", total_amount: "", status: "pending" });
      toast.success("Order added");
    }
  }, [newOrder, user]);

  const handleEditOrder = useCallback(async () => {
    if (!editOrder) return;
    const { error } = await supabase.from("orders").update({
      shipping_name: editOrder.shipping_name,
      shipping_city: editOrder.shipping_city,
      shipping_address: editOrder.shipping_address,
      shipping_pin: editOrder.shipping_pin,
      shipping_phone: editOrder.shipping_phone,
      payment_method: editOrder.payment_method,
      total_amount: editOrder.total_amount,
      status: editOrder.status,
    }).eq("id", editOrder.id);
    if (error) { toast.error("Failed to update order"); }
    else {
      setOrders((prev) => prev.map((o) => o.id === editOrder.id ? editOrder : o));
      setEditOrderOpen(false);
      setEditOrder(null);
      toast.success("Order updated");
    }
  }, [editOrder]);

  const handleAddUser = useCallback(async () => {
    if (!newUser.display_name) { toast.error("Name is required"); return; }
    // Create a profile entry (admin-created, uses admin's user_id as placeholder)
    if (!user) return;
    const { data, error } = await supabase.from("profiles").insert({
      display_name: newUser.display_name,
      phone: newUser.phone || null,
      user_id: user.id, // admin-created profile
    }).select().single();
    if (error) { toast.error("Failed to add user"); }
    else if (data) {
      setProfiles((prev) => [data, ...prev]);
      setAddUserOpen(false);
      setNewUser({ display_name: "", phone: "" });
      toast.success("User profile added");
    }
  }, [newUser, user]);

  const handleDeleteUser = useCallback(async (profileId: string) => {
    const { error } = await supabase.from("profiles").delete().eq("id", profileId);
    if (error) { toast.error("Failed to delete user"); }
    else {
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      toast.success("User profile deleted");
    }
  }, []);
  // Product CRUD handlers
  const handleAddProduct = useCallback(async () => {
    if (!newProduct.name || !newProduct.price) { toast.error("Name and price are required"); return; }
    const { data, error } = await supabase.from("products").insert({
      name: newProduct.name,
      description: newProduct.description || null,
      price: Number(newProduct.price),
      stock_quantity: Number(newProduct.stock_quantity) || 0,
      low_stock_threshold: Number(newProduct.low_stock_threshold) || 10,
      category: newProduct.category,
      is_active: newProduct.is_active,
    }).select().single();
    if (error) { toast.error("Failed to add product"); }
    else if (data) {
      setProducts((prev) => [data, ...prev]);
      setAddProductOpen(false);
      setNewProduct({ name: "", description: "", price: "", stock_quantity: "", low_stock_threshold: "10", category: "millet-puffs", is_active: true });
      toast.success("Product added");
    }
  }, [newProduct]);

  const handleEditProduct = useCallback(async () => {
    if (!editProduct) return;
    const { error } = await supabase.from("products").update({
      name: editProduct.name,
      description: editProduct.description,
      price: editProduct.price,
      stock_quantity: editProduct.stock_quantity,
      low_stock_threshold: editProduct.low_stock_threshold,
      category: editProduct.category,
      is_active: editProduct.is_active,
    }).eq("id", editProduct.id);
    if (error) { toast.error("Failed to update product"); }
    else {
      setProducts((prev) => prev.map((p) => p.id === editProduct.id ? editProduct : p));
      setEditProductOpen(false);
      setEditProduct(null);
      toast.success("Product updated");
    }
  }, [editProduct]);

  const handleRestockProduct = useCallback(async (productId: string, addQty: number, newThreshold: number) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const newStock = Math.max(0, target.stock_quantity + addQty);
    const { error } = await supabase
      .from("products")
      .update({ stock_quantity: newStock, low_stock_threshold: newThreshold })
      .eq("id", productId);
    if (error) { toast.error("Failed to restock product"); return; }
    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, stock_quantity: newStock, low_stock_threshold: newThreshold } : p));
    toast.success(addQty > 0 ? `Restocked +${addQty} units` : "Inventory updated");
  }, [products]);

  const handleBulkRestock = useCallback(async () => {
    const ids = Array.from(selectedProductIds);
    if (ids.length === 0) return;
    const addQty = Number(bulkAddQty) || 0;
    const thresholdRaw = bulkThreshold.trim();
    const newThreshold = thresholdRaw === "" ? null : Math.max(0, Number(thresholdRaw) || 0);

    const updates = ids.map((id) => {
      const target = products.find((p) => p.id === id);
      if (!target) return Promise.resolve({ error: null, id });
      const newStock = Math.max(0, target.stock_quantity + addQty);
      const patch: { stock_quantity: number; low_stock_threshold?: number } = { stock_quantity: newStock };
      if (newThreshold !== null) patch.low_stock_threshold = newThreshold;
      return supabase.from("products").update(patch).eq("id", id).then(({ error }) => ({ error, id, newStock }));
    });
    const results = await Promise.all(updates);
    const failed = results.filter((r) => r.error).length;
    if (failed > 0) toast.error(`${failed} of ${ids.length} updates failed`);
    setProducts((prev) => prev.map((p) => {
      if (!selectedProductIds.has(p.id)) return p;
      const newStock = Math.max(0, p.stock_quantity + addQty);
      return { ...p, stock_quantity: newStock, ...(newThreshold !== null ? { low_stock_threshold: newThreshold } : {}) };
    }));
    if (failed === 0) toast.success(`Restocked ${ids.length} products${addQty ? ` (+${addQty} each)` : ""}`);
    setBulkRestockOpen(false);
    setSelectedProductIds(new Set());
  }, [selectedProductIds, bulkAddQty, bulkThreshold, products]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) { toast.error("Failed to delete product"); }
    else {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product deleted");
    }
  }, []);
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
      setLoading(true);
      const [ordersRes, profilesRes, productsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*").order("created_at", { ascending: false }),
      ]);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (profilesRes.data) setProfiles(profilesRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      setLoading(false);
    };
    fetchData();
  }, [isAdmin]);

  // Chart data computations
  const revenueByMonth = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const d = new Date(o.created_at);
      const key = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
      map.set(key, (map.get(key) || 0) + o.total_amount);
    });
    return Array.from(map, ([month, revenue]) => ({ month, revenue })).slice(-12);
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => map.set(o.status, (map.get(o.status) || 0) + 1));
    return Array.from(map, ([status, count]) => ({ status, count }));
  }, [orders]);

  const ordersByPayment = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => map.set(o.payment_method, (map.get(o.payment_method) || 0) + 1));
    return Array.from(map, ([method, count]) => ({ method, count }));
  }, [orders]);

  const ordersByCity = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => map.set(o.shipping_city, (map.get(o.shipping_city) || 0) + 1));
    return Array.from(map, ([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [orders]);

  const dailyOrders = useMemo(() => {
    const map = new Map<string, { orders: number; revenue: number }>();
    orders.forEach((o) => {
      const key = new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const existing = map.get(key) || { orders: 0, revenue: 0 };
      map.set(key, { orders: existing.orders + 1, revenue: existing.revenue + o.total_amount });
    });
    return Array.from(map, ([date, data]) => ({ date, ...data })).slice(-30);
  }, [orders]);

  const userGrowth = useMemo(() => {
    const map = new Map<string, number>();
    profiles.forEach((p) => {
      const d = new Date(p.created_at);
      const key = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    let cumulative = 0;
    return Array.from(map, ([month, count]) => {
      cumulative += count;
      return { month, newUsers: count, totalUsers: cumulative };
    });
  }, [profiles]);

  if (adminLoading || !isAdmin) {
    return (
      <div className="container py-20 text-center">
        <p className="font-body text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + o.total_amount, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const recentOrders = orders.slice(0, 5);

  const filteredOrders = orders.filter(
    (o) =>
      o.shipping_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProfiles = profiles.filter(
    (p) =>
      (p.display_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter((p) => p.stock_quantity <= p.low_stock_threshold && p.is_active);

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
    { id: "orders" as Tab, label: "Orders", icon: Package },
    { id: "users" as Tab, label: "Users", icon: Users },
    { id: "inventory" as Tab, label: "Inventory", icon: PackageOpen },
  ];

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-lg"
    >
      <h3 className="font-heading text-sm mb-4 text-muted-foreground">{title}</h3>
      <div className="h-64">{children}</div>
    </motion.div>
  );

  const OrderFormFields = ({ values, onChange }: { values: any; onChange: (field: string, val: string) => void }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Customer Name *</Label><Input value={values.shipping_name} onChange={(e) => onChange("shipping_name", e.target.value)} /></div>
        <div><Label>Amount (₹) *</Label><Input type="number" value={values.total_amount} onChange={(e) => onChange("total_amount", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>City</Label><Input value={values.shipping_city} onChange={(e) => onChange("shipping_city", e.target.value)} /></div>
        <div><Label>PIN Code</Label><Input value={values.shipping_pin} onChange={(e) => onChange("shipping_pin", e.target.value)} /></div>
      </div>
      <div><Label>Address</Label><Input value={values.shipping_address} onChange={(e) => onChange("shipping_address", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Phone</Label><Input value={values.shipping_phone || ""} onChange={(e) => onChange("shipping_phone", e.target.value)} /></div>
        <div>
          <Label>Payment Method</Label>
          <Select value={values.payment_method} onValueChange={(v) => onChange("payment_method", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cod">COD</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="netbanking">Net Banking</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Status</Label>
        <Select value={values.status} onValueChange={(v) => onChange("status", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (<SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container flex items-center gap-4 h-14">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-heading">Admin Dashboard</h1>
          </div>
        </div>

        <div className="container py-6 md:py-10">
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((t) => (
              <Button
                key={t.id}
                variant={tab === t.id ? "default" : "outline"}
                size="sm"
                onClick={() => { setTab(t.id); setSearchTerm(""); }}
                className={`transition-all duration-200 ${tab === t.id ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-primary/10"}`}
              >
                <t.icon className="h-4 w-4 mr-1.5" /> {t.label}
              </Button>
            ))}
          </div>

          {/* Overview */}
          {tab === "overview" && (
            <FadeInSection>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {[
                  { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-primary" },
                  { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-secondary" },
                  { label: "Pending Orders", value: pendingOrders, icon: Clock, color: "text-destructive" },
                  { label: "Total Users", value: profiles.length, icon: Users, color: "text-primary" },
                ].map((stat) => (
                  <motion.div key={stat.label} whileHover={{ y: -2 }} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-body text-sm text-muted-foreground">{stat.label}</span>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-heading">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
                <ChartCard title="Revenue Over Time">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueByMonth.length > 0 ? revenueByMonth : [{ month: "No data", revenue: 0 }]}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v}`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Daily Orders & Revenue">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyOrders.length > 0 ? dailyOrders : [{ date: "No data", orders: 0, revenue: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v}`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar yAxisId="left" dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Orders" />
                      <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Orders by Status">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={ordersByStatus.length > 0 ? ordersByStatus : [{ status: "No orders", count: 1 }]} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {(ordersByStatus.length > 0 ? ordersByStatus : [{ status: "No orders", count: 1 }]).map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Payment Methods">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={ordersByPayment.length > 0 ? ordersByPayment : [{ method: "No data", count: 1 }]} dataKey="count" nameKey="method" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {(ordersByPayment.length > 0 ? ordersByPayment : [{ method: "No data", count: 1 }]).map((_, i) => (<Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Top Cities by Orders">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersByCity.length > 0 ? ordersByCity : [{ city: "No data", count: 0 }]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="city" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="User Growth">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowth.length > 0 ? userGrowth : [{ month: "No data", newUsers: 0, totalUsers: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="totalUsers" stroke="hsl(var(--primary))" strokeWidth={2} name="Total Users" dot={false} />
                      <Line type="monotone" dataKey="newUsers" stroke="hsl(var(--secondary))" strokeWidth={2} name="New Users" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-heading text-lg mb-4">Recent Orders</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="border-b text-muted-foreground text-left">
                        <th className="pb-3 pr-4">Order ID</th>
                        <th className="pb-3 pr-4">Customer</th>
                        <th className="pb-3 pr-4">Amount</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 pr-4 font-mono text-xs">{o.id.slice(0, 8)}...</td>
                          <td className="py-3 pr-4">{o.shipping_name}</td>
                          <td className="py-3 pr-4 font-bold">₹{o.total_amount}</td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${o.status === "pending" ? "bg-secondary/20 text-secondary" : o.status === "completed" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {recentOrders.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No orders yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeInSection>
          )}

          {/* Orders tab */}
          {tab === "orders" && (
            <FadeInSection>
              <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name or order ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-card" />
                </div>
                <Dialog open={addOrderOpen} onOpenChange={setAddOrderOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Order</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add New Order</DialogTitle></DialogHeader>
                    <OrderFormFields values={newOrder} onChange={(field, val) => setNewOrder((prev) => ({ ...prev, [field]: val }))} />
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <Button onClick={handleAddOrder}>Create Order</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Edit order dialog */}
              <Dialog open={editOrderOpen} onOpenChange={setEditOrderOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Edit Order</DialogTitle></DialogHeader>
                  {editOrder && (
                    <OrderFormFields
                      values={editOrder}
                      onChange={(field, val) => setEditOrder((prev) => prev ? { ...prev, [field]: field === "total_amount" ? Number(val) : val } : prev)}
                    />
                  )}
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleEditOrder}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="rounded-xl border bg-card overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b text-muted-foreground text-left">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">City</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-mono text-xs">{o.id.slice(0, 8)}...</td>
                        <td className="p-4">{o.shipping_name}</td>
                        <td className="p-4">{o.shipping_city}</td>
                        <td className="p-4 capitalize">{o.payment_method}</td>
                        <td className="p-4 font-bold">₹{o.total_amount}</td>
                        <td className="p-4">
                          <Select value={o.status} onValueChange={(val) => handleStatusChange(o.id, val)} disabled={updatingOrderId === o.id}>
                            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((s) => (<SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditOrder(o); setEditOrderOpen(true); }}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently delete this order and its items.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteOrder(o.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </FadeInSection>
          )}

          {/* Users tab */}
          {tab === "users" && (
            <FadeInSection>
              <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-card" />
                </div>
                <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5"><UserPlus className="h-4 w-4" /> Add User</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add User Profile</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div><Label>Display Name *</Label><Input value={newUser.display_name} onChange={(e) => setNewUser((p) => ({ ...p, display_name: e.target.value }))} /></div>
                      <div><Label>Phone</Label><Input value={newUser.phone} onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))} /></div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <Button onClick={handleAddUser}>Add User</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProfiles.map((p) => (
                  <motion.div key={p.id} whileHover={{ y: -2 }} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-heading text-sm">
                          {(p.display_name || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-heading text-sm">{p.display_name || "Unnamed"}</p>
                          <p className="font-body text-xs text-muted-foreground">{p.phone || "No phone"}</p>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User Profile?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently remove this user profile.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">Joined {new Date(p.created_at).toLocaleDateString()}</p>
                  </motion.div>
                ))}
                {filteredProfiles.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-8 font-body">No users found</p>
                )}
              </div>
            </FadeInSection>
          )}
          {/* Inventory tab */}
          {tab === "inventory" && (
            <FadeInSection>
              {/* Low stock alert */}
              {lowStockProducts.length > 0 && (
                <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h3 className="font-heading text-sm text-destructive">Low Stock Alerts ({lowStockProducts.length})</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lowStockProducts.map((p) => (
                      <span key={p.id} className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
                        {p.name}: {p.stock_quantity} left
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-card" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProductIds.size > 0 && (
                    <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => { setBulkAddQty("10"); setBulkThreshold(""); setBulkRestockOpen(true); }}>
                      <PackageOpen className="h-4 w-4" /> Bulk Restock ({selectedProductIds.size})
                    </Button>
                  )}
                <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Product</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Product Name *</Label><Input value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} /></div>
                        <div><Label>Price (₹) *</Label><Input type="number" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} /></div>
                      </div>
                      <div><Label>Description</Label><Input value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Stock Quantity</Label><Input type="number" value={newProduct.stock_quantity} onChange={(e) => setNewProduct((p) => ({ ...p, stock_quantity: e.target.value }))} /></div>
                        <div><Label>Low Stock Threshold</Label><Input type="number" value={newProduct.low_stock_threshold} onChange={(e) => setNewProduct((p) => ({ ...p, low_stock_threshold: e.target.value }))} /></div>
                      </div>
                      <div><Label>Category</Label><Input value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))} /></div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <Button onClick={handleAddProduct}>Add Product</Button>
                    </DialogFooter>
                  </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Edit product dialog */}
              <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
                  {editProduct && (
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Product Name *</Label><Input value={editProduct.name} onChange={(e) => setEditProduct((p) => p ? { ...p, name: e.target.value } : p)} /></div>
                        <div><Label>Price (₹) *</Label><Input type="number" value={editProduct.price} onChange={(e) => setEditProduct((p) => p ? { ...p, price: Number(e.target.value) } : p)} /></div>
                      </div>
                      <div><Label>Description</Label><Input value={editProduct.description || ""} onChange={(e) => setEditProduct((p) => p ? { ...p, description: e.target.value } : p)} /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Stock Quantity</Label><Input type="number" value={editProduct.stock_quantity} onChange={(e) => setEditProduct((p) => p ? { ...p, stock_quantity: Number(e.target.value) } : p)} /></div>
                        <div><Label>Low Stock Threshold</Label><Input type="number" value={editProduct.low_stock_threshold} onChange={(e) => setEditProduct((p) => p ? { ...p, low_stock_threshold: Number(e.target.value) } : p)} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Category</Label><Input value={editProduct.category || ""} onChange={(e) => setEditProduct((p) => p ? { ...p, category: e.target.value } : p)} /></div>
                        <div className="flex items-end gap-2 pb-1">
                          <Label>Active</Label>
                          <Button variant={editProduct.is_active ? "default" : "outline"} size="sm" onClick={() => setEditProduct((p) => p ? { ...p, is_active: !p.is_active } : p)}>
                            {editProduct.is_active ? "Active" : "Inactive"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleEditProduct}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="rounded-xl border bg-card overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b text-muted-foreground text-left">
                      <th className="p-4 w-10">
                        <Checkbox
                          checked={filteredProducts.length > 0 && filteredProducts.every((p) => selectedProductIds.has(p.id))}
                          onCheckedChange={(v) => {
                            setSelectedProductIds((prev) => {
                              const next = new Set(prev);
                              if (v) filteredProducts.forEach((p) => next.add(p.id));
                              else filteredProducts.forEach((p) => next.delete(p.id));
                              return next;
                            });
                          }}
                          aria-label="Select all"
                        />
                      </th>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Threshold</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const isLow = p.stock_quantity <= p.low_stock_threshold;
                      return (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-medium">{p.name}</td>
                          <td className="p-4 capitalize text-muted-foreground">{p.category || "—"}</td>
                          <td className="p-4 font-bold">₹{p.price}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 font-bold ${isLow ? "text-destructive" : "text-primary"}`}>
                              {isLow && <AlertTriangle className="h-3.5 w-3.5" />}
                              {p.stock_quantity}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">{p.low_stock_threshold}</td>
                          <td className="p-4">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${p.is_active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {p.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <RestockDialog product={p} onRestock={handleRestockProduct} />
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditProduct(p); setEditProductOpen(true); }}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete "{p.name}" from inventory.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProduct(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredProducts.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No products found. Add your first product!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </FadeInSection>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
