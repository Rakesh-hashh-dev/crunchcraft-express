import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CreditCard, Smartphone, Truck } from "lucide-react";

const paymentMethods = [
  { value: "razorpay", label: "Razorpay (Cards/NetBanking)", icon: CreditCard },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "cod", label: "Cash on Delivery", icon: Truck },
];

const Checkout = () => {
  const [payment, setPayment] = useState("razorpay");

  return (
    <div className="container py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl mb-8">Checkout</h1>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h2 className="font-heading text-lg mb-4">Shipping Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name" className="font-body text-sm">Full Name</Label>
                <Input id="name" placeholder="Meera Sharma" className="bg-card" />
              </div>
              <div>
                <Label htmlFor="phone" className="font-body text-sm">Phone</Label>
                <Input id="phone" placeholder="+91 98765 43210" className="bg-card" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address" className="font-body text-sm">Address</Label>
                <Input id="address" placeholder="Flat/House No., Street" className="bg-card" />
              </div>
              <div>
                <Label htmlFor="city" className="font-body text-sm">City</Label>
                <Input id="city" placeholder="Mumbai" className="bg-card" />
              </div>
              <div>
                <Label htmlFor="pin" className="font-body text-sm">PIN Code</Label>
                <Input id="pin" placeholder="400001" className="bg-card" />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="font-heading text-lg mb-4">Payment Method</h2>
            <RadioGroup value={payment} onValueChange={setPayment} className="space-y-3">
              {paymentMethods.map((m) => (
                <Label
                  key={m.value}
                  htmlFor={m.value}
                  className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors font-body ${
                    payment === m.value ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value={m.value} id={m.value} />
                  <m.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm">{m.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

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
              <div className="flex justify-between"><span>Peri-Peri Fiesta × 80g</span><span>₹45</span></div>
              <div className="flex justify-between"><span>Salt & Lime × 200g</span><span>₹110</span></div>
              <Separator />
              <div className="flex justify-between"><span>Subtotal</span><span>₹155</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>FREE</span></div>
              <Separator />
              <div className="flex justify-between font-heading text-base"><span>Total</span><span>₹155</span></div>
            </div>
            <Button
              className="w-full mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading text-sm"
              size="lg"
              onClick={() => toast.success("Order placed! 🎉 WhatsApp confirmation sent.")}
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
