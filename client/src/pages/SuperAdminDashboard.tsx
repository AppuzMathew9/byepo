import { AppLayout } from "@/components/AppLayout";
import { SuperAdminRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Building2, Plus, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/_core/hooks/useAuth";

interface Organization {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function SuperAdminDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [orgName, setOrgName] = useState("");
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // Queries
  const { data: organizations, isLoading: orgsLoading } = useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: () => api.get<Organization[]>("/api/organizations"),
  });

  // Mutations
  const createOrgMutation = useMutation({
    mutationFn: (name: string) => api.post("/api/organizations", { name }),
    onSuccess: () => {
      toast.success("Organization created successfully");
      setOrgName("");
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create organization");
    },
  });

  // Handlers
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast.error("Organization name is required");
      return;
    }
    createOrgMutation.mutate(orgName);
  };

  const navigation = [
    { label: "Organizations", href: "/super-admin", icon: <Building2 className="h-5 w-5" /> },
  ];

  return (
    <SuperAdminRoute>
      <AppLayout title="Super Admin Dashboard" navigation={navigation}>
        <div className="space-y-6">
          <div className="card-elevated">
            {/* Header section with Create Button */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold">Organizations</h2>
                <p className="subtitle mt-1">Manage and provision multi-tenant organizations</p>
              </div>
              {!showCreateForm && organizations && organizations.length > 0 && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary inline-flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  New Organization
                </Button>
              )}
            </div>

            {/* Inline Creation Form */}
            {showCreateForm && (
              <div className="mb-8 p-4 border border-border/80 bg-muted/10 rounded-lg">
                <h3 className="text-sm font-semibold text-foreground mb-3">Create New Organization</h3>
                <form onSubmit={handleCreateOrg} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Organization Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Acme Corp"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="btn-primary flex items-center gap-2"
                      disabled={createOrgMutation.isPending}
                    >
                      {createOrgMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create"
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setOrgName("");
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Content Section: Table / Loading / Empty State */}
            {orgsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent mb-2" />
                <p className="text-muted-foreground text-sm">Loading organizations...</p>
              </div>
            ) : organizations && organizations.length > 0 ? (
              <div className="overflow-x-auto border border-border/60 rounded-md">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-16">ID</th>
                      <th>Name</th>
                      <th className="w-48 text-right">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-muted/10">
                        <td className="text-muted-foreground">{org.id}</td>
                        <td className="font-semibold text-foreground">{org.name}</td>
                        <td className="text-right text-muted-foreground">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-lg bg-muted/5">
                <p className="font-semibold text-foreground">No organizations yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first organization to get started.</p>
                {!showCreateForm && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="btn-primary inline-flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    New Organization
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </SuperAdminRoute>
  );
}
