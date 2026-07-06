import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageTransition } from "@/components/AnimationWrappers";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the recovery token in the URL hash and fires a PASSWORD_RECOVERY event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated! You're signed in.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="container flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-xl border bg-card p-8">
          <h1 className="text-2xl text-center mb-2">Set a New Password</h1>
          <p className="text-sm text-center font-body text-muted-foreground mb-6">
            {ready
              ? "Choose a new password for your account."
              : "Waiting for your reset link... open this page from the email link."}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="font-body text-sm">New password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="bg-background" />
            </div>
            <div>
              <Label htmlFor="confirm" className="font-body text-sm">Confirm password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required minLength={6} className="bg-background" />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading || !ready}>
              {loading ? "..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;
