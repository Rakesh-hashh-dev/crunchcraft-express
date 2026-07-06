import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageTransition } from "@/components/AnimationWrappers";

type Mode = "login" | "signup" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("Welcome back! 🎉");
        navigate("/");
      } else if (mode === "signup") {
        await signUp(email, password, name);
        toast.success("Account created! Check your email to confirm.");
        navigate("/");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent! Check your email.");
        setMode("login");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  const title =
    mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password";
  const cta =
    mode === "login" ? "Sign In" : mode === "signup" ? "Sign Up" : "Send Reset Link";

  return (
    <PageTransition>
      <div className="container flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-xl border bg-card p-8">
          <h1 className="text-2xl text-center mb-6">{title}</h1>
          {mode === "forgot" && (
            <p className="text-sm text-center font-body text-muted-foreground mb-4">
              Enter your email and we'll send you a link to reset your password.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name" className="font-body text-sm">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-background" />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="font-body text-sm">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className="bg-background" />
            </div>
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-body text-sm">Password</Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs font-body text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="bg-background" />
              </div>
            )}
            <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
              {loading ? "..." : cta}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm font-body text-muted-foreground">
            {mode === "login" && (
              <>
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-bold hover:underline">
                  Sign Up
                </button>
              </>
            )}
            {mode === "signup" && (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-primary font-bold hover:underline">
                  Sign In
                </button>
              </>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("login")} className="text-primary font-bold hover:underline">
                Back to Sign In
              </button>
            )}
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Auth;
