import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const data = await api.post<{ user: any; token: string }>("/api/auth/login", {
        email,
        password,
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success("Logged in successfully");
      api.setToken(data.token);
      queryClient.setQueryData(["auth_me", data.token], data.user);
      
      // Redirect based on role
      if (data.user.role === "super_admin") {
        setLocation("/super-admin");
      } else if (data.user.role === "org_admin") {
        setLocation("/org-admin");
      } else {
        setLocation("/user");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Invalid credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Accent Shapes */}
      <div className="accent-shape-1" style={{ top: "10%", right: "10%" }} />
      <div className="accent-shape-2" style={{ bottom: "10%", left: "10%" }} />

      <div className="w-full max-w-md card-elevated z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Sign In</h1>
          <p className="subtitle mt-2">Access your feature flags dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an organization?{" "}
          <Link href="/signup" className="text-accent font-medium hover:underline">
            Register Organization
          </Link>
        </div>
        
        <div className="mt-6 border border-border/80 bg-muted/10 rounded-md p-4 text-left">
          <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            🔑 Demo Credentials
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Super Admin:</span>{" "}
              <code>superadmin@byepo.com</code> / <code>SuperAdminPassword123!</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
