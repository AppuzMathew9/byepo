import { UserRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle2, XCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface CheckResult {
  key: string;
  enabled: boolean;
  found: boolean;
}

export default function UserDashboard() {
  const [featureKey, setFeatureKey] = useState("");
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);

  const { logout, user } = useAuth();

  const checkFeatureMutation = useMutation({
    mutationFn: async (key: string) => {
      const data = await api.post<CheckResult>("/api/feature/check", { key });
      return data;
    },
    onSuccess: (data) => {
      setCheckResult(data);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to check feature");
    },
  });

  const handleCheckFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureKey.trim()) {
      toast.error("Please enter a feature key");
      return;
    }
    checkFeatureMutation.mutate(featureKey.trim());
  };

  return (
    <UserRoute>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Geometric Accent Shapes */}
        <div className="accent-shape-1" style={{ top: "10%", right: "5%" }} />
        <div className="accent-shape-2" style={{ bottom: "15%", left: "3%" }} />

        {/* Sign Out Button in top-right */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            onClick={() => logout()}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="w-full max-w-md z-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Feature Check
            </h1>
            <p className="subtitle">
              Query the status of features for your organization
            </p>
            {user && (
              <p className="text-xs text-muted-foreground mt-2">
                Logged in as <span className="font-semibold">{user.name}</span>
              </p>
            )}
          </div>

          {/* Check Form */}
          <form onSubmit={handleCheckFeature} className="card-elevated mb-8">
            <div className="form-group">
              <label className="form-label" htmlFor="featureKey">Feature Key</label>
              <input
                id="featureKey"
                type="text"
                className="form-input"
                placeholder="e.g., new_landing_page"
                value={featureKey}
                onChange={(e) => setFeatureKey(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="btn-primary w-full"
              disabled={checkFeatureMutation.isPending}
            >
              {checkFeatureMutation.isPending ? "Checking..." : "Check Status"}
            </Button>
          </form>

          {/* Result */}
          {checkResult && (
            <div
              className={`card-elevated text-center ${
                !checkResult.found
                  ? "border-amber-500/50 bg-amber-500/5"
                  : checkResult.enabled
                  ? "border-accent/50 bg-accent/5"
                  : "border-destructive/50 bg-destructive/5"
              }`}
            >
              <div className="flex justify-center mb-4">
                {!checkResult.found ? (
                  <XCircle className="h-12 w-12 text-amber-500" />
                ) : checkResult.enabled ? (
                  <CheckCircle2 className="h-12 w-12 text-accent" />
                ) : (
                  <XCircle className="h-12 w-12 text-destructive" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                {!checkResult.found
                  ? "Not Found"
                  : checkResult.enabled
                  ? "Enabled"
                  : "Disabled"}
              </h2>
              <p className="text-muted-foreground">
                {!checkResult.found ? (
                  <>
                    Feature flag <span className="font-mono font-semibold">{checkResult.key}</span> does not exist in your organization.
                  </>
                ) : (
                  <>
                    Feature <span className="font-mono font-semibold">{checkResult.key}</span> is{" "}
                    <span className="font-semibold">
                      {checkResult.enabled ? "enabled" : "disabled"}
                    </span>{" "}
                    for your organization.
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </UserRoute>
  );
}
