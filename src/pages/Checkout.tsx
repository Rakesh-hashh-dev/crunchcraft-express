import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CreditCard, Smartphone, Truck, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition, FadeInSection } from "@/components/AnimationWrappers";
import { motion, AnimatePresence } from "framer-motion";
import Breadcrumbs from "@/components/Breadcrumbs";
import { injectBreadcrumbJsonLd } from "@/lib/breadcrumbs";

const checkoutCrumbs = [
  { name: "Home", path: "/" },
  { name: "Checkout", path: "/checkout" },
];

const paymentMethods = [
  { value: "razorpay", label: "Razorpay (Cards/NetBanking)", icon: CreditCard },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "cod", label: "Cash on Delivery", icon: Truck },
];

const Checkout = () => {
  const [payment, setPayment] = useState("razorpay");
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", pin: "" });
  const [placing, setPlacing] = useState(false);
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!user) { toast.error("Please sign in first"); navigate("/auth"); return; }
    if (!form.name || !form.address || !form.city || !form.pin) { toast.error("Please fill all required fields"); return; }
    if (items.length === 0) { toast.error("Cart is empty"); return; }

    setPlacing(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      total_amount: total,
      payment_method: payment,
      shipping_name: form.name,
      shipping_phone: form.phone,
      shipping_address: form.address,
      shipping_city: form.city,
      shipping_pin: form.pin,
    }).select().single();

    if (error || !order) { toast.error("Failed to place order"); setPlacing(false); return; }

    await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        flavour: i.flavour,
        size: i.size,
        quantity: i.quantity,
        unit_price: i.unitPrice,
      }))
    );

    await clearCart();
    setPlacing(false);
    toast.success("Order placed! 🎉 WhatsApp confirmation sent.");
    navigate("/");
  };

  return (
    <PageTransition>
      <div className="container py-10 md:py-16 max-w-3xl">
        <h1 className="text-3xl mb-8">Checkout</h1>

        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <FadeInSection>
              <div>
                <h2 className="font-heading text-lg mb-4">Shipping Address</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="font-body text-sm">Full Name *</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Meera Sharma" className="bg-card" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="font-body text-sm">Phone</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="bg-card" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address" className="font-body text-sm">Address *</Label>
                    <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Flat/House No., Street" className="bg-card" />
                  </div>
                  <div>
                    <Label htmlFor="city" className="font-body text-sm">City *</Label>
                    <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" className="bg-card" />
                  </div>
                  <div>
                    <Label htmlFor="pin" className="font-body text-sm">PIN Code *</Label>
                    <Input id="pin" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} placeholder="400001" className="bg-card" />
                  </div>
                </div>
              </div>
            </FadeInSection>

            <Separator />

            <FadeInSection>
              <div>
                <h2 className="font-heading text-lg mb-4">Payment Method</h2>
                <RadioGroup value={payment} onValueChange={setPayment} className="space-y-3">
                  {paymentMethods.map((m) => (
                    <Label key={m.value} htmlFor={m.value}
                      className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors font-body ${payment === m.value ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <RadioGroupItem value={m.value} id={m.value} />
                      <m.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm">{m.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </FadeInSection>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/60 border">
              <Smartphone className="h-4 w-4 text-primary" />
              <span className="font-body text-xs text-muted-foreground">Order confirmation will be sent via WhatsApp</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-card p-6 sticky top-24">
              <h2 className="font-heading text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 font-body text-sm">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div key={item.id} layout exit={{ opacity: 0, x: -20 }} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.flavour} — {item.size}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-muted-foreground hover:text-foreground">−</button>
                          <span className="font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-muted-foreground hover:text-foreground">+</button>
                        </div>
                      </div>
                      <span>₹{item.unitPrice * item.quantity}</span>
                      <button onClick={() => removeItem(item.id)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length === 0 && <p className="text-muted-foreground text-center py-4">Cart is empty</p>}
                <Separator />
                <div className="flex justify-between"><span>Subtotal</span><span>₹{total}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>FREE</span></div>
                <Separator />
                <div className="flex justify-between font-heading text-base"><span>Total</span><span>₹{total}</span></div>
              </div>
              <Button
                className="w-full mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading text-sm"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={placing || items.length === 0}
              >
                {placing ? "Placing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Checkout;
