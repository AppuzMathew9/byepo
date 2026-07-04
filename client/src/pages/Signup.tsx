import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function Signup() {
  const [orgName, setOrgName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const signupMutation = useMutation({
    mutationFn: async () => {
      const data = await api.post<{ user: any; token: string }>("/api/auth/signup", {
        orgName,
        name,
        email,
        password,
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success("Organization and Admin account registered!");
      api.setToken(data.token);
      queryClient.setQueryData(["auth_me", data.token], data.user);
      setLocation("/org-admin");
    },
    onError: (error: any) => {
      toast.error(error.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    signupMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Accent Shapes */}
      <div className="accent-shape-1" style={{ top: "15%", left: "5%" }} />
      <div className="accent-shape-2" style={{ bottom: "15%", right: "5%" }} />

      <div className="w-full max-w-md card-elevated z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Register Organization</h1>
          <p className="subtitle mt-2">Create a new tenant and Admin user</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="orgName">Organization Name</label>
            <input
              id="orgName"
              type="text"
              className="form-input"
              placeholder="e.g., Acme Corporation"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="•••••••• (Min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register & Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-accent font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
