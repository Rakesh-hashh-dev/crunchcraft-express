import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Facebook, Twitter, Youtube, Mail } from "lucide-react";
import { toast } from "sonner";

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Welcome to the Crunch Club! 🎉");
    setEmail("");
  };

  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        {/* Newsletter bar */}
        <div className="mb-12 rounded-xl bg-primary-foreground/10 p-6 md:p-8 md:flex md:items-center md:justify-between gap-6">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-heading">Join the Crunch Club</h3>
            <p className="font-body text-sm opacity-80 mt-1">Get 10% off your first order + snack drops to your inbox.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto md:min-w-[340px]">
            <Input
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-primary-foreground/20 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
            />
            <Button
              type="submit"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors whitespace-nowrap"
            >
              <Mail className="h-4 w-4 mr-1.5" /> Subscribe
            </Button>
          </form>
        </div>

        {/* Links grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="text-lg mb-3 font-heading">🌾 CrunchCraft</h3>
            <p className="font-body text-sm opacity-80 leading-relaxed">Snack Smart. Crunch Bold.</p>
            <div className="flex gap-3 mt-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-3 font-heading uppercase tracking-wider">Shop</h4>
            <div className="flex flex-col gap-2 text-sm opacity-80 font-body">
              <Link to="/shop" className="hover:opacity-100 hover:translate-x-1 transition-all duration-200">All Products</Link>
              <Link to="/subscription" className="hover:opacity-100 hover:translate-x-1 transition-all duration-200">Subscription Club</Link>
              <Link to="/product" className="hover:opacity-100 hover:translate-x-1 transition-all duration-200">MilLet's Pop</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-3 font-heading uppercase tracking-wider">Company</h4>
            <div className="flex flex-col gap-2 text-sm opacity-80 font-body">
              <Link to="/our-story" className="hover:opacity-100 hover:translate-x-1 transition-all duration-200">Our Story</Link>
              <Link to="/" className="hover:opacity-100 hover:translate-x-1 transition-all duration-200">Home</Link>
              <span className="cursor-default">Careers</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-3 font-heading uppercase tracking-wider">Support</h4>
            <div className="flex flex-col gap-2 text-sm opacity-80 font-body">
              <a href="mailto:hello@crunchcraft.in" className="hover:opacity-100 transition-opacity">rraku04@gmail.com</a>
              <a href="tel:+919876543210" className="hover:opacity-100 transition-opacity">+91 73775 51040</a>
              <span className="mt-2 text-xs opacity-60">FSSAI Lic. No. 10024021000123</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/20 py-4 text-center text-xs opacity-60 font-body">
        © 2026 CrunchCraft Foods Pvt. Ltd. All rights reserved. | Snack Smart. Crunch Bold.
      </div>
    </footer>
  );
};

export default Footer;
