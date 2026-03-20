import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { PageTransition, FadeInSection } from "@/components/AnimationWrappers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag, Users, BarChart3, Package, ArrowLeft, Search,
  TrendingUp, IndianRupee, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

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

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <div className="border-b bg-card">
          <div className="container flex items-center gap-4 h-14">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-heading">Admin Dashboard</h1>
          </div>
        </div>

        <div className="container py-6 md:py-10">
          {/* Tab nav */}
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

              {/* Recent orders */}
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
                  <Input
                    placeholder="Search by name or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-card"
                  />
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
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            o.status === "pending"
                              ? "bg-secondary/20 text-secondary"
                              : "bg-primary/20 text-primary"
                          }`}>
                            {o.status}
                          </span>
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
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-card"
                  />
                </div>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProfiles.map((p) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-heading text-sm">
                        {(p.display_name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-heading text-sm">{p.display_name || "Unnamed"}</p>
                        <p className="font-body text-xs text-muted-foreground">{p.phone || "No phone"}</p>
                      </div>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">
                      Joined {new Date(p.created_at).toLocaleDateString()}
                    </p>
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
