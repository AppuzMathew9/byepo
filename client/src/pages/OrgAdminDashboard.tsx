import { AppLayout } from "@/components/AppLayout";
import { OrgAdminRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus, Flag, Users, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeatureFlag {
  id: number;
  organizationId: number;
  key: string;
  description: string | null;
  enabled: "true" | "false";
  createdAt: string;
  updatedAt: string;
}

interface Member {
  id: number;
  name: string | null;
  email: string;
  role: "super_admin" | "org_admin" | "user";
  createdAt: string;
}

export default function OrgAdminDashboard() {
  const { user } = useAuth();
  const orgId = user?.organizationId;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"flags" | "users">("flags");

  // Create flag state
  const [showCreateFlagForm, setShowCreateFlagForm] = useState(false);
  const [flagKey, setFlagKey] = useState("");
  const [flagDescription, setFlagDescription] = useState("");

  // Edit/Configure flag state
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [editKey, setEditKey] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Add member state
  const [showCreateMemberForm, setShowCreateMemberForm] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPassword, setMemberPassword] = useState("");

  // Queries
  const { data: flags, isLoading: flagsLoading } = useQuery<FeatureFlag[]>({
    queryKey: ["feature_flags", orgId],
    queryFn: () => api.get<FeatureFlag[]>(`/api/orgs/${orgId}/flags`),
    enabled: !!orgId,
  });

  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["members", orgId],
    queryFn: () => api.get<Member[]>(`/api/orgs/${orgId}/users`),
    enabled: !!orgId && activeTab === "users",
  });

  // Flag Mutations
  const createFlagMutation = useMutation({
    mutationFn: (payload: { key: string; description: string }) =>
      api.post(`/api/orgs/${orgId}/flags`, payload),
    onSuccess: () => {
      toast.success("Feature flag created successfully");
      setFlagKey("");
      setFlagDescription("");
      setShowCreateFlagForm(false);
      queryClient.invalidateQueries({ queryKey: ["feature_flags", orgId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create feature flag");
    },
  });

  const updateFlagMutation = useMutation({
    mutationFn: (payload: { id: number; key: string; description: string; enabled: "true" | "false" }) =>
      api.put(`/api/orgs/${orgId}/flags/${payload.id}`, {
        key: payload.key,
        description: payload.description,
        enabled: payload.enabled,
      }),
    onSuccess: () => {
      toast.success("Feature flag updated successfully");
      setEditingFlag(null);
      queryClient.invalidateQueries({ queryKey: ["feature_flags", orgId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update feature flag");
    },
  });

  const deleteFlagMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/orgs/${orgId}/flags/${id}`),
    onSuccess: () => {
      toast.success("Feature flag deleted successfully");
      setEditingFlag(null);
      queryClient.invalidateQueries({ queryKey: ["feature_flags", orgId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete feature flag");
    },
  });

  const toggleFlagMutation = useMutation({
    mutationFn: (payload: { id: number; key: string; description: string | null; enabled: "true" | "false" }) =>
      api.put(`/api/orgs/${orgId}/flags/${payload.id}`, {
        key: payload.key,
        description: payload.description,
        enabled: payload.enabled,
      }),
    onSuccess: () => {
      toast.success("Feature flag status updated");
      queryClient.invalidateQueries({ queryKey: ["feature_flags", orgId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update feature flag");
    },
  });

  // Member Mutations
  const createMemberMutation = useMutation({
    mutationFn: (payload: any) =>
      api.post(`/api/orgs/${orgId}/users`, payload),
    onSuccess: () => {
      toast.success("Team member added successfully");
      setMemberName("");
      setMemberEmail("");
      setMemberPassword("");
      setShowCreateMemberForm(false);
      queryClient.invalidateQueries({ queryKey: ["members", orgId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add team member");
    },
  });

  // Handlers
  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagKey.trim()) {
      toast.error("Flag key is required");
      return;
    }
    createFlagMutation.mutate({ key: flagKey.trim(), description: flagDescription });
  };

  const handleUpdateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlag) return;
    updateFlagMutation.mutate({
      id: editingFlag.id,
      key: editKey.trim(),
      description: editDescription,
      enabled: editingFlag.enabled,
    });
  };

  const handleDeleteFlag = async (id: number) => {
    if (confirm("Are you sure you want to delete this feature flag? This action cannot be undone.")) {
      deleteFlagMutation.mutate(id);
    }
  };

  const handleToggleFlag = (flag: FeatureFlag) => {
    const newEnabled = flag.enabled === "true" ? "false" : "true";
    toggleFlagMutation.mutate({
      id: flag.id,
      key: flag.key,
      description: flag.description,
      enabled: newEnabled,
    });
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim() || !memberPassword.trim()) {
      toast.error("Email and Password are required");
      return;
    }
    createMemberMutation.mutate({
      name: memberName.trim() || null,
      email: memberEmail.trim(),
      password: memberPassword,
    });
  };

  const navigation = [
    { label: "Feature Flags", href: "/org-admin", icon: <Flag /> },
  ];

  return (
    <OrgAdminRoute>
      <AppLayout title="Organization Admin Dashboard" navigation={navigation}>
        <div className="space-y-8">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab("flags")}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === "flags"
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Feature Flags
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === "users"
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Members
            </button>
          </div>

          {/* Feature Flags Tab */}
          {activeTab === "flags" && (
            <div className="space-y-6">
              {/* Create Flag Section */}
              <div className="card-elevated">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Create Feature Flag</h2>
                    <p className="subtitle mt-1">Add a new feature flag for your organization</p>
                  </div>
                  {!showCreateFlagForm && (
                    <Button
                      onClick={() => setShowCreateFlagForm(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Flag
                    </Button>
                  )}
                </div>

                {showCreateFlagForm && (
                  <form onSubmit={handleCreateFlag} className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">Flag Key (Identifiers)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., new_landing_page"
                        value={flagKey}
                        onChange={(e) => setFlagKey(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description (optional)</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Describe what this flag controls..."
                        value={flagDescription}
                        onChange={(e) => setFlagDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="btn-primary"
                        disabled={createFlagMutation.isPending}
                      >
                        {createFlagMutation.isPending ? "Creating..." : "Create"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setShowCreateFlagForm(false);
                          setFlagKey("");
                          setFlagDescription("");
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Flags List */}
              <div className="card-elevated">
                <h2 className="mb-6 text-2xl font-bold">Feature Flags</h2>

                {flagsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading feature flags...</p>
                  </div>
                ) : flags && flags.length > 0 ? (
                  <div className="space-y-3">
                    {flags.map((flag) => (
                      <div
                        key={flag.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/30 transition-all duration-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground font-mono">{flag.key}</h3>
                          </div>
                          {flag.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {flag.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {flag.enabled === "true" ? "Enabled" : "Disabled"}
                            </span>
                            <Switch
                              checked={flag.enabled === "true"}
                              onCheckedChange={() => handleToggleFlag(flag)}
                              disabled={toggleFlagMutation.isPending}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingFlag(flag);
                              setEditKey(flag.key);
                              setEditDescription(flag.description || "");
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No feature flags yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Add Member Section */}
              <div className="card-elevated">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Add Team Member</h2>
                    <p className="subtitle mt-1">Register a new End User in your organization</p>
                  </div>
                  {!showCreateMemberForm && (
                    <Button
                      onClick={() => setShowCreateMemberForm(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  )}
                </div>

                {showCreateMemberForm && (
                  <form onSubmit={handleCreateMember} className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">Member Name (optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="John Doe"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="john@organization.com"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="•••••••• (Min 6 chars)"
                        value={memberPassword}
                        onChange={(e) => setMemberPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="btn-primary"
                        disabled={createMemberMutation.isPending}
                      >
                        {createMemberMutation.isPending ? "Adding..." : "Add Member"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setShowCreateMemberForm(false);
                          setMemberName("");
                          setMemberEmail("");
                          setMemberPassword("");
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Members List */}
              <div className="card-elevated">
                <h2 className="mb-6 text-2xl font-bold">Organization Members</h2>

                {membersLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading members...</p>
                  </div>
                ) : members && members.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr key={member.id}>
                            <td className="font-medium">{member.name || "—"}</td>
                            <td>{member.email}</td>
                            <td>
                              <span className={`status-badge ${
                                member.role === "org_admin" ? "status-badge-enabled" : "status-badge-disabled bg-accent/10 text-accent"
                              }`}>
                                {member.role === "org_admin" ? "Org Admin" : "End User"}
                              </span>
                            </td>
                            <td className="text-muted-foreground">
                              {new Date(member.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No members yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal: Edit Flag */}
        <Dialog open={editingFlag !== null} onOpenChange={(open) => !open && setEditingFlag(null)}>
          <DialogContent className="max-w-md">
            {editingFlag && (
              <form onSubmit={handleUpdateFlag} className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    Edit Flag Details
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Flag Key</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editKey}
                      onChange={(e) => setEditKey(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="btn-primary"
                      disabled={updateFlagMutation.isPending}
                    >
                      {updateFlagMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setEditingFlag(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDeleteFlag(editingFlag.id)}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    disabled={deleteFlagMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Flag
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </AppLayout>
    </OrgAdminRoute>
  );
}
