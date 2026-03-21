import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User, LogOut, Settings, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/our-story", label: "Our Story" },
  { to: "/subscription", label: "Subscribe" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { itemCount } = useCart();

  useEffect(() => {
    if (!user) { setDisplayName(null); return; }
    supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name || null));
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-heading text-xl tracking-tight text-primary hover:opacity-80 transition-opacity">
          🌾 CrunchCraft
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`relative text-sm font-body transition-colors duration-200 hover:text-primary ${
                pathname === l.to ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              {l.label}
              {pathname === l.to && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary rounded-full"
                />
              )}
            </Link>
          ))}

          <Link to="/checkout">
            <Button
              size="icon"
              variant="ghost"
              className="relative hover:bg-primary/10 transition-colors duration-200"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground"
                >
                  {itemCount}
                </motion.span>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-body text-foreground hover:bg-primary/20 transition-colors duration-200"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {(displayName || user.email || "U")[0].toUpperCase()}
                </div>
                <span className="truncate max-w-[100px]">{displayName || user.email?.split("@")[0]}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border bg-card shadow-lg overflow-hidden z-50"
                  >
                    <Link
                      to="/auth?tab=profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-body text-foreground hover:bg-muted transition-colors"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" /> Edit Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-body text-foreground hover:bg-muted transition-colors"
                      >
                        <Shield className="h-4 w-4 text-muted-foreground" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setProfileOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-body text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                <User className="h-4 w-4 mr-1" /> Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <Link to="/checkout" className="relative">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground"
              >
                {itemCount}
              </motion.span>
            )}
          </Link>
          <button
            className="p-1 hover:bg-muted rounded-md transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t bg-background md:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`font-body text-sm py-2 px-3 rounded-md transition-colors ${
                    pathname === l.to
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/checkout"
                onClick={() => setOpen(false)}
                className="font-body text-sm py-2 px-3 rounded-md text-foreground hover:bg-muted transition-colors"
              >
                Cart ({itemCount})
              </Link>
              {user ? (
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="font-body text-sm py-2 px-3 rounded-md text-foreground hover:bg-destructive/10 hover:text-destructive text-left transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="mt-2"
                >
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <User className="h-4 w-4 mr-2" /> Sign In
                  </Button>
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
