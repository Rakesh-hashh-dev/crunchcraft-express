import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/our-story", label: "Our Story" },
  { to: "/subscription", label: "Subscribe" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-heading text-xl tracking-tight text-primary">
          CrunchCraft
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-body transition-colors hover:text-primary ${pathname === l.to ? "text-primary font-bold" : "text-muted-foreground"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/checkout">
            <Button size="icon" variant="ghost" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground"
                >
                  {itemCount}
                </motion.span>
              )}
            </Button>
          </Link>
          {user ? (
            <Button size="icon" variant="ghost" onClick={() => signOut()} title="Sign Out">
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="outline">
                <User className="h-4 w-4 mr-1" /> Sign In
              </Button>
            </Link>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t bg-background md:hidden"
          >
            <div className="container flex flex-col gap-4 py-4">
              {links.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="font-body text-sm text-foreground hover:text-primary">
                  {l.label}
                </Link>
              ))}
              <Link to="/checkout" onClick={() => setOpen(false)} className="font-body text-sm text-foreground hover:text-primary">
                Cart ({itemCount})
              </Link>
              {user ? (
                <button onClick={() => { signOut(); setOpen(false); }} className="font-body text-sm text-foreground hover:text-primary text-left">
                  Sign Out
                </button>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="font-body text-sm text-primary font-bold">
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
