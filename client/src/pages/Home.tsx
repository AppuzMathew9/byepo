import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Redirect based on role
      if (user.role === "super_admin") {
        setLocation("/super-admin");
      } else if (user.role === "org_admin") {
        setLocation("/org-admin");
      } else if (user.role === "user") {
        setLocation("/user");
      }
    }
  }, [user, loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null; // Will redirect above
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Geometric Accent Shapes */}
      <div className="accent-shape-1" style={{ top: "10%", right: "5%" }} />
      <div className="accent-shape-2" style={{ bottom: "15%", left: "3%" }} />

      <div className="w-full max-w-2xl text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-foreground mb-4">
            Byepo
          </h1>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Feature Flag Management
          </h2>
          <p className="subtitle text-lg">
            Control feature rollouts across your organization with precision and ease
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-elevated flex flex-col justify-between py-6 px-4">
            <div>
              <div className="text-lg font-bold text-accent mb-2 flex items-center justify-center gap-1.5">
                <span>✓</span> Super Admin
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Create and manage organizations.
              </p>
            </div>
          </div>
          <div className="card-elevated flex flex-col justify-between py-6 px-4">
            <div>
              <div className="text-lg font-bold text-accent mb-2 flex items-center justify-center gap-1.5">
                <span>✓</span> Org Admin
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Manage feature flags.
              </p>
            </div>
          </div>
          <div className="card-elevated flex flex-col justify-between py-6 px-4">
            <div>
              <div className="text-lg font-bold text-accent mb-2 flex items-center justify-center gap-1.5">
                <span>✓</span> End User
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Check feature availability.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="card-elevated mb-8 flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">
            Sign in or sign up to manage your organization's feature flags
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button className="btn-primary inline-flex items-center gap-2">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="btn-secondary">
                Register Organization
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          © 2026 Byepo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
