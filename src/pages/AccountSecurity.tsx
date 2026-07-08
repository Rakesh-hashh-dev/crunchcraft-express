import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageTransition } from "@/components/AnimationWrappers";
import Breadcrumbs from "@/components/Breadcrumbs";
import { KeyRound, Mail } from "lucide-react";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Account Security", path: "/account/security" },
];

const AccountSecurity = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated 🎉");
      setPassword("");
      setConfirm("");
    } catch (err: any) {
      toast.error(err.message || "Could not update password");
    }
    setSaving(false);
  };

  const handleResetEmail = async () => {
    if (!user?.email) return;
    setSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset link sent to your email");
    } catch (err: any) {
      toast.error(err.message || "Could not send reset link");
    }
    setSending(false);
  };

  return (
    <PageTransition>
      <div className="container py-10 md:py-16 max-w-2xl">
        <Breadcrumbs items={crumbs} className="mb-6" />
        <h1 className="font-heading text-3xl mb-2">Account Security</h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Signed in as <span className="font-medium text-foreground">{user?.email}</span>
        </p>

        <div className="rounded-xl border bg-card p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl">Change Password</h2>
          </div>
          <form onSubmit={handleChange} className="space-y-4">
            <div>
              <Label htmlFor="new-password" className="font-body text-sm">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="font-body text-sm">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
                className="bg-background"
              />
            </div>
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground">
              {saving ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>

        <div className="rounded-xl border bg-card p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl">Forgot your password?</h2>
          </div>
          <p className="font-body text-sm text-muted-foreground mb-4">
            We'll email you a secure link to reset it.
          </p>
          <Button variant="outline" onClick={handleResetEmail} disabled={sending}>
            {sending ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Link to="/account/orders" className="text-sm font-body text-primary hover:underline">
            ← Back to My Orders
          </Link>
        </div>
      </div>
    </PageTransition>
  );
};

export default AccountSecurity;
