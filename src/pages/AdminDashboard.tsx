import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { demoUsers, demoOrders, demoRevenue } from "@/lib/demoUsers";
import { PageTransition, FadeInSection } from "@/components/AnimationWrappers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  ShoppingBag, Users, BarChart3, Package, ArrowLeft, Search,
  TrendingUp, IndianRupee, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from "recharts";

type Tab = "overview" | "orders" | "users";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_name: string;
  shipping_city: string;
  payment_method: string;
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

  const handleStatusChange = useCallback(async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order updated to "${newStatus}"`);
    }
    setUpdatingOrderId(null);
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
      const [ordersRes, profilesRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      ]);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (profilesRes.data) setProfiles(profilesRes.data);
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

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
    { id: "orders" as Tab, label: "Orders", icon: Package },
    { id: "users" as Tab, label: "Users", icon: Users },
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
              {/* Stat cards */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {[
                  { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-primary" },
                  { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-secondary" },
                  { label: "Pending Orders", value: pendingOrders, icon: Clock, color: "text-destructive" },
                  { label: "Total Users", value: profiles.length, icon: Users, color: "text-primary" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-body text-sm text-muted-foreground">{stat.label}</span>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-heading">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts grid */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
                {/* Revenue trend */}
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
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Daily orders + revenue */}
                <ChartCard title="Daily Orders & Revenue">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyOrders.length > 0 ? dailyOrders : [{ date: "No data", orders: 0, revenue: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar yAxisId="left" dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Orders" />
                      <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Order status pie */}
                <ChartCard title="Orders by Status">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordersByStatus.length > 0 ? ordersByStatus : [{ status: "No orders", count: 1 }]}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {(ordersByStatus.length > 0 ? ordersByStatus : [{ status: "No orders", count: 1 }]).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Payment methods pie */}
                <ChartCard title="Payment Methods">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordersByPayment.length > 0 ? ordersByPayment : [{ method: "No data", count: 1 }]}
                        dataKey="count"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {(ordersByPayment.length > 0 ? ordersByPayment : [{ method: "No data", count: 1 }]).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Top cities bar */}
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

                {/* User growth */}
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

              {/* Recent orders table */}
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
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              o.status === "pending"
                                ? "bg-secondary/20 text-secondary"
                                : o.status === "completed"
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}>
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
              <div className="mb-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name or order ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-card" />
                </div>
              </div>
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
                          <Select
                            value={o.status}
                            onValueChange={(val) => handleStatusChange(o.id, val)}
                            disabled={updatingOrderId === o.id}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </FadeInSection>
          )}

          {/* Users tab */}
          {tab === "users" && (
            <FadeInSection>
              <div className="mb-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-card" />
                </div>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProfiles.map((p) => (
                  <motion.div key={p.id} whileHover={{ y: -2 }} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-heading text-sm">
                        {(p.display_name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-heading text-sm">{p.display_name || "Unnamed"}</p>
                        <p className="font-body text-xs text-muted-foreground">{p.phone || "No phone"}</p>
                      </div>
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
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
