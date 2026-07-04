import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition, FadeInSection } from "@/components/AnimationWrappers";
import Breadcrumbs from "@/components/Breadcrumbs";
import { injectBreadcrumbJsonLd } from "@/lib/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight, ShoppingBag, Truck } from "lucide-react";

interface OrderRow {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  shipping_city: string;
  created_at: string;
}

interface OrderItemRow {
  order_id: string;
  flavour: string;
  size: string;
  quantity: number;
}

const crumbs = [
  { name: "Home", path: "/" },
  { name: "My Orders", path: "/account/orders" },
];

const statusVariant = (status: string): "default" | "secondary" | "outline" => {
  const s = status.toLowerCase();
  if (s === "delivered") return "default";
  if (s === "shipped" || s === "packed" || s === "confirmed") return "secondary";
  return "outline";
};

const AccountOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItemRow[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => injectBreadcrumbJsonLd(crumbs), []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    let cancelled = false;
    const load = async () => {
      const { data: os } = await supabase
        .from("orders")
        .select("id,status,total_amount,payment_method,shipping_city,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const list = (os ?? []) as OrderRow[];
      let itemsMap: Record<string, OrderItemRow[]> = {};
      if (list.length > 0) {
        const { data: its } = await supabase
          .from("order_items")
          .select("order_id,flavour,size,quantity")
          .in("order_id", list.map((o) => o.id));
        (its ?? []).forEach((it: any) => {
          (itemsMap[it.order_id] ||= []).push(it as OrderItemRow);
        });
      }
      if (cancelled) return;
      setOrders(list);
      setItemsByOrder(itemsMap);
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [user, authLoading, navigate]);

  return (
    <PageTransition>
      <div className="container py-10 md:py-16 max-w-4xl">
        <Breadcrumbs items={crumbs} className="mb-6" />
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl">My Orders</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Track past orders and their shipment status.
            </p>
          </div>
          <Button asChild variant="outline"><Link to="/shop">Continue Shopping</Link></Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : orders.length === 0 ? (
          <FadeInSection>
            <div className="rounded-xl border bg-card p-10 text-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-heading text-xl mb-2">No orders yet</h2>
              <p className="font-body text-sm text-muted-foreground mb-6">
                When you place your first order, it'll show up here.
              </p>
              <Button asChild><Link to="/shop">Browse Snacks</Link></Button>
            </div>
          </FadeInSection>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const its = itemsByOrder[o.id] ?? [];
              const totalQty = its.reduce((s, i) => s + i.quantity, 0);
              const preview = its.slice(0, 2).map((i) => `${i.flavour} (${i.size})`).join(", ");
              return (
                <FadeInSection key={o.id}>
                  <Link
                    to={`/order/${o.id}`}
                    className="group block rounded-xl border bg-card p-5 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex gap-4 items-start min-w-0">
                        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-heading text-sm">
                              Order <span className="font-mono">#{o.id.slice(0, 8).toUpperCase()}</span>
                            </p>
                            <Badge variant={statusVariant(o.status)} className="capitalize text-[10px]">
                              {o.status}
                            </Badge>
                          </div>
                          <p className="font-body text-xs text-muted-foreground mt-1">
                            {new Date(o.created_at).toLocaleDateString(undefined, {
                              day: "numeric", month: "short", year: "numeric",
                            })} · {o.shipping_city} · {totalQty} item{totalQty === 1 ? "" : "s"}
                          </p>
                          {preview && (
                            <p className="font-body text-xs text-muted-foreground mt-0.5 truncate">
                              {preview}{its.length > 2 ? ` +${its.length - 2} more` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-auto">
                        <div className="text-right">
                          <p className="font-heading text-base">₹{o.total_amount}</p>
                          <p className="font-body text-[11px] text-muted-foreground capitalize">{o.payment_method}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`/order/${o.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Truck className="h-4 w-4 mr-1.5" />
                          Track this order
                        </a>
                      </Button>
                    </div>
                  </Link>
                </FadeInSection>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AccountOrders;
