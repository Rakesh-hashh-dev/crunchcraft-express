import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { sizeOptions, type Flavour, type Size } from "@/lib/products";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  flavour: Flavour;
  size: Size;
  quantity: number;
  is_subscription: boolean;
  unitPrice: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addItem: (flavour: Flavour, size: Size, isSubscription?: boolean) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const getPrice = (size: Size, isSub: boolean) => {
    const base = sizeOptions.find((s) => s.label === size)!.price;
    return isSub ? Math.round(base * 0.85) : base;
  };

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id);
    if (!error && data) {
      setItems(data.map((d) => ({
        id: d.id,
        flavour: d.flavour as Flavour,
        size: d.size as Size,
        quantity: d.quantity,
        is_subscription: d.is_subscription,
        unitPrice: getPrice(d.size as Size, d.is_subscription),
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (flavour: Flavour, size: Size, isSubscription = false) => {
    if (!user) { toast.error("Please sign in to add items to cart"); return; }
    const existing = items.find((i) => i.flavour === flavour && i.size === size && i.is_subscription === isSubscription);
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + 1);
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        flavour,
        size,
        is_subscription: isSubscription,
      });
      await fetchCart();
    }
    toast.success(`${flavour} (${size}) added to cart!`);
  };

  const removeItem = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) { await removeItem(id); return; }
    await supabase.from("cart_items").update({ quantity }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  };

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
