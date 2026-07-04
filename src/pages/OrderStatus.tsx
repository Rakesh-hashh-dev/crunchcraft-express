import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition, FadeInSection } from "@/components/AnimationWrappers";
import Breadcrumbs from "@/components/Breadcrumbs";
import { injectBreadcrumbJsonLd } from "@/lib/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  CircleDashed,
  Package,
  Truck,
  Home as HomeIcon,
  CreditCard,
  MapPin,
  Loader2,
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
}

interface OrderItemRow {
  id: string;
  flavour: string;
  size: string;
  quantity: number;
  unit_price: number;
}

interface OrderEventRow {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_at: string;
}

const STAGES = [
  { key: "pending", label: "Order Placed", icon: CheckCircle2, blurb: "We've received your order." },
  { key: "confirmed", label: "Payment Confirmed", icon: CreditCard, blurb: "Razorpay confirmation received." },
  { key: "packed", label: "Packed", icon: Package, blurb: "Your snacks are boxed up." },
  { key: "shipped", label: "Shipped", icon: Truck, blurb: "On the way to your doorstep." },
  { key: "delivered", label: "Delivered", icon: HomeIcon, blurb: "Enjoy the crunch!" },
] as const;

const stageIndex = (status: string) => {
  const i = STAGES.findIndex((s) => s.key === status.toLowerCase());
  return i === -1 ? 0 : i;
};

const OrderStatus = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [events, setEvents] = useState<OrderEventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Order Status", path: `/order/${id}` },
  ];

  useEffect(() => injectBreadcrumbJsonLd(crumbs), [id]);

  useEffect(() => {
    if (!id || !user) return;
    let cancelled = false;

    const load = async () => {
      const { data: o } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      const { data: it } = await supabase.from("order_items").select("*").eq("order_id", id);
      const { data: ev } = await (supabase as any)
        .from("order_events")
        .select("*")
        .eq("order_id", id)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      setOrder(o as OrderRow | null);
      setItems((it ?? []) as OrderItemRow[]);
      setEvents((ev ?? []) as OrderEventRow[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        (payload) => {
          const updated = payload.new as OrderRow;
          setOrder((prev) => {
            if (prev && prev.status !== updated.status) {
              toast.success(`Status updated: ${updated.status}`);
            }
            return updated;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_events", filter: `order_id=eq.${id}` },
        (payload) => {
          setEvents((prev) => [...prev, payload.new as OrderEventRow]);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  if (loading) {
    return (
      <PageTransition>
        <div className="container py-16 max-w-3xl space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </PageTransition>
    );
  }

  if (!order) {
    return (
      <PageTransition>
        <div className="container py-20 max-w-2xl text-center space-y-4">
          <h1 className="font-heading text-3xl">Order not found</h1>
          <p className="font-body text-muted-foreground">We couldn't locate this order.</p>
          <Button asChild><Link to="/shop">Back to Shop</Link></Button>
        </div>
      </PageTransition>
    );
  }

  const current = stageIndex(order.status);

  return (
    <PageTransition>
      <div className="container py-10 md:py-16 max-w-3xl">
        <Breadcrumbs items={crumbs} className="mb-6" />

        <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
          <div>
            <h1 className="font-heading text-3xl">Order Status</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Order ID <span className="font-mono">#{order.id.slice(0, 8).toUpperCase()}</span> · Placed{" "}
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 font-body text-xs uppercase tracking-wide">
            <Loader2 className="h-3 w-3 animate-spin" /> Live updates
          </span>
        </div>

        <FadeInSection>
          <div className="rounded-xl border bg-card p-6 mt-6">
            <h2 className="font-heading text-lg mb-6">Shipment Progress</h2>
            <ol className="relative space-y-6">
              {STAGES.map((s, i) => {
                const reached = i <= current;
                const isCurrent = i === current;
                const Icon = reached ? s.icon : CircleDashed;
                return (
                  <li key={s.key} className="flex gap-4 items-start">
                    <div className="relative flex flex-col items-center">
                      <motion.div
                        initial={false}
                        animate={{ scale: isCurrent ? 1.1 : 1 }}
                        className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                          reached
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </motion.div>
                      {i < STAGES.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-1 min-h-8 ${i < current ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`font-heading text-sm ${reached ? "" : "text-muted-foreground"}`}>
                        {s.label}
                        {isCurrent && <span className="ml-2 text-xs text-primary font-body normal-case">— current</span>}
                      </p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{s.blurb}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </FadeInSection>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <FadeInSection>
            <div className="rounded-xl border bg-card p-6 h-full">
              <h3 className="font-heading text-base mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Shipping To
              </h3>
              <div className="font-body text-sm space-y-1">
                <p className="font-bold">{order.shipping_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city} — {order.shipping_pin}</p>
                {order.shipping_phone && <p className="text-muted-foreground">{order.shipping_phone}</p>}
              </div>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="rounded-xl border bg-card p-6 h-full">
              <h3 className="font-heading text-base mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" /> Payment
              </h3>
              <div className="font-body text-sm space-y-1">
                <p className="capitalize">{order.payment_method}</p>
                <p className="text-muted-foreground text-xs">
                  {order.payment_method === "cod" ? "Pay on delivery" : "Razorpay confirmation received"}
                </p>
              </div>
            </div>
          </FadeInSection>
        </div>

        <FadeInSection>
          <div className="rounded-xl border bg-card p-6 mt-6">
            <h3 className="font-heading text-base mb-4">Items</h3>
            <div className="space-y-3 font-body text-sm">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between">
                  <span>{it.flavour} — {it.size} <span className="text-muted-foreground">× {it.quantity}</span></span>
                  <span>₹{it.unit_price * it.quantity}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-heading text-base">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button asChild variant="outline"><Link to="/shop">Continue Shopping</Link></Button>
              <Button asChild><Link to="/">Back Home</Link></Button>
            </div>
          </div>
        </FadeInSection>
      </div>
    </PageTransition>
  );
};

export default OrderStatus;
