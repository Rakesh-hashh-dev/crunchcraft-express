import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-primary text-primary-foreground">
    <div className="container py-12 grid gap-8 md:grid-cols-4">
      <div>
        <h3 className="text-lg mb-3">CrunchCraft Foods</h3>
        <p className="font-body text-sm opacity-80">Snack Smart. Crunch Bold.</p>
      </div>
      <div>
        <h4 className="text-sm font-bold mb-3 font-heading">Shop</h4>
        <div className="flex flex-col gap-2 text-sm opacity-80 font-body">
          <Link to="/shop" className="hover:opacity-100">All Products</Link>
          <Link to="/subscription" className="hover:opacity-100">Subscription Club</Link>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold mb-3 font-heading">Company</h4>
        <div className="flex flex-col gap-2 text-sm opacity-80 font-body">
          <Link to="/our-story" className="hover:opacity-100">Our Story</Link>
          <span>Careers</span>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold mb-3 font-heading">Support</h4>
        <div className="flex flex-col gap-2 text-sm opacity-80 font-body">
          <span>hello@crunchcraft.in</span>
          <span>+91 98765 43210</span>
        </div>
      </div>
    </div>
    <div className="border-t border-primary-foreground/20 py-4 text-center text-xs opacity-60 font-body">
      © 2026 CrunchCraft Foods Pvt. Ltd. All rights reserved.
    </div>
  </footer>
);

export default Footer;
