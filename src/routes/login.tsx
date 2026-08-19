import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/button";
import {
  Store,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — Admin Console" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(trimmedEmail, trimmedPassword);
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to log in. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-neutral-100 to-slate-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 select-none relative overflow-hidden">
      {/* Subtle Background Glow Spheres */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Centered Modern Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] p-6 sm:p-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/15 shadow-sm mb-3.5">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Enter your credentials to manage store operations
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Email Address */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
            >
              Email Address
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@store.io"
                required
                autoComplete="email"
                disabled={loading}
                className="block w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
            >
              Password
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
                className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Keep session active option */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary"
              />
              <span className="text-xs text-muted-foreground font-medium">Keep session active</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 transition-all active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="pt-4 mt-3 border-t border-border flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>Secure Administrator Access</span>
          </div>
        </form>
      </div>
    </div>
  );
}
