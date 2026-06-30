import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { PageTransition, FadeInSection } from "@/components/AnimationWrappers";
import Breadcrumbs from "@/components/Breadcrumbs";
import { injectBreadcrumbJsonLd } from "@/lib/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  CircleDashed,
  Package,
  Truck,
  Home as HomeIcon,
  CreditCard,
  MapPin,
  ArrowLeft,
  Radio,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface OrderRow {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  shipping_name: string;
  shipping_phone: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_pin: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface OrderItemRow {
  id: string;
  flavour: string;
  size: string;
  quantity: number;
  unit_price: number;
}

const STAGES = [
  { key: "pending", label: "Order Placed", icon: CheckCircle2 },
  { key: "confirmed", label: "Payment Confirmed", icon: CreditCard },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: HomeIcon },
] as const;

const stageIndex = (status: string) => {
  const i = STAGES.findIndex((s) => s.key === status.toLowerCase());
  return i === -1 ? 0 : i;
};

const AdminOrderTracker = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const crumbs = useMemo(
    () => [
      { name: "Home", path: "/" },
      { name: "Admin", path: "/admin" },
      { name: `Order ${id?.slice(0, 8).toUpperCase() ?? ""}`, path: `/admin/orders/${id}` },
    ],
    [id]
  );

  useEffect(() => injectBreadcrumbJsonLd(crumbs), [crumbs]);

  useEffect(() => {
    if (authLoading || adminLoading) return;
    if (!user) { navigate("/auth"); return; }
    if (!isAdmin) { navigate("/"); return; }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  const [refreshing, setRefreshing] = useState(false);
  const [reconnectKey, setReconnectKey] = useState(0);
  const [channelStatus, setChannelStatus] = useState<string>("connecting");

  const refetch = async (showToast = false) => {
    if (!id) return;
    setRefreshing(true);
    const { data: o, error: oErr } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
    const { data: it, error: iErr } = await supabase.from("order_items").select("*").eq("order_id", id);
    setRefreshing(false);
    if (oErr || iErr) { toast.error("Failed to refresh order"); return; }
    setOrder(o as OrderRow | null);
    setItems((it ?? []) as OrderItemRow[]);
    if (showToast) toast.success("Order resynced");
  };

  useEffect(() => {
    if (!id || !isAdmin) return;
    let cancelled = false;

    const load = async () => {
      const { data: o } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      const { data: it } = await supabase.from("order_items").select("*").eq("order_id", id);
      if (cancelled) return;
      setOrder(o as OrderRow | null);
      setItems((it ?? []) as OrderItemRow[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`admin-order-${id}-${reconnectKey}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        (payload) => setOrder(payload.new as OrderRow)
      )
      .subscribe((status) => setChannelStatus(status));

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [id, isAdmin, reconnectKey]);

  const reconnect = async () => {
    setChannelStatus("connecting");
    setReconnectKey((k) => k + 1);
    await refetch(false);
    toast.success("Reconnected to live updates");
  };


  const setStage = async (key: string) => {
    if (!order) return;
    setSaving(key);
    const { error } = await supabase.from("orders").update({ status: key }).eq("id", order.id);
    setSaving(null);
    if (error) { toast.error("Failed to update stage"); return; }
    toast.success(`Stage set to ${key}`);
    setOrder({ ...order, status: key });
  };

  if (loading || authLoading || adminLoading) {
    return (
      <PageTransition>
        <div className="container py-16 max-w-3xl space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-48 w-full" />
        </div>
      </PageTransition>
    );
  }

  if (!order) {
    return (
      <PageTransition>
        <div className="container py-20 max-w-2xl text-center space-y-4">
          <h1 className="font-heading text-3xl">Order not found</h1>
          <Button asChild><Link to="/admin">Back to Admin</Link></Button>
        </div>
      </PageTransition>
    );
  }

  const current = stageIndex(order.status);

  return (
    <PageTransition>
      <div className="container py-10 md:py-16 max-w-3xl">
        <Breadcrumbs items={crumbs} className="mb-4" />

        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/admin"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Admin</Link>
        </Button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-3xl">Order Tracker</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              <span className="font-mono">#{order.id.slice(0, 8).toUpperCase()}</span> · {order.shipping_name} ·{" "}
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-body text-xs uppercase tracking-wide ${
                channelStatus === "SUBSCRIBED"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
              title={`Channel: ${channelStatus}`}
            >
              <Radio className={`h-3 w-3 ${channelStatus === "SUBSCRIBED" ? "animate-pulse" : ""}`} />
              {channelStatus === "SUBSCRIBED" ? "Live" : "Offline"}
            </span>
            <Button variant="outline" size="sm" onClick={() => refetch(true)} disabled={refreshing}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={reconnect} disabled={refreshing}>
              <Plug className="h-3.5 w-3.5 mr-1" />
              Reconnect
            </Button>
          </div>
        </div>

        <FadeInSection>
          <div className="rounded-xl border bg-card p-6 mt-6">
            <h2 className="font-heading text-lg mb-2">Update Shipment Stage</h2>
            <p className="font-body text-xs text-muted-foreground mb-5">
              Customers viewing their order status see updates instantly.
            </p>

            <div className="grid gap-2 sm:grid-cols-5">
              {STAGES.map((s, i) => {
                const reached = i <= current;
                const isCurrent = i === current;
                const Icon = reached ? s.icon : CircleDashed;
                return (
                  <motion.button
                    key={s.key}
                    onClick={() => setStage(s.key)}
                    disabled={saving !== null}
                    whileHover={{ y: -2 }}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors disabled:opacity-50 ${
                      isCurrent
                        ? "border-primary bg-primary/10"
                        : reached
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${reached ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-body text-xs font-bold leading-tight">{s.label}</span>
                    {isCurrent && <span className="font-body text-[10px] text-primary uppercase">current</span>}
                    {saving === s.key && <span className="font-body text-[10px] text-muted-foreground">saving…</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </FadeInSection>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-heading text-base mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Shipping
            </h3>
            <div className="font-body text-sm space-y-1">
              <p className="font-bold">{order.shipping_name}</p>
              <p>{order.shipping_address}</p>
              <p>{order.shipping_city} — {order.shipping_pin}</p>
              {order.shipping_phone && <p className="text-muted-foreground">{order.shipping_phone}</p>}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-heading text-base mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Payment
            </h3>
            <p className="font-body text-sm capitalize">{order.payment_method}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Total ₹{order.total_amount}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 mt-6">
          <h3 className="font-heading text-base mb-4">Items</h3>
          <div className="space-y-2 font-body text-sm">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between">
                <span>{it.flavour} — {it.size} <span className="text-muted-foreground">× {it.quantity}</span></span>
                <span>₹{it.unit_price * it.quantity}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-heading text-base">
              <span>Total</span><span>₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminOrderTracker;
