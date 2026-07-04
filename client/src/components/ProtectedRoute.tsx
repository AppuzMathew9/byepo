import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "super_admin" | "org_admin" | "user";
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return fallback || null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="super_admin">
      {children}
    </ProtectedRoute>
  );
}

export function OrgAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="org_admin">
      {children}
    </ProtectedRoute>
  );
}

export function UserRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="user">
      {children}
    </ProtectedRoute>
  );
}
