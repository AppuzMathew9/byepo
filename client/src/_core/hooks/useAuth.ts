import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "wouter";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export interface User {
  id: number;
  name: string | null;
  email: string;
  role: "super_admin" | "org_admin" | "user";
  organizationId: number | null;
  createdAt: string;
  updatedAt: string;
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } = options ?? {};
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const token = api.getToken();

  // Query to fetch current authenticated user profile
  const meQuery = useQuery<User | null>({
    queryKey: ["auth_me", token],
    queryFn: async () => {
      if (!token) return null;
      try {
        const res = await api.get<{ user: User }>("/api/auth/me");
        return res.user;
      } catch (err) {
        api.clearToken();
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/auth/logout");
    },
    onSuccess: () => {
      api.clearToken();
      queryClient.setQueryData(["auth_me", token], null);
      queryClient.invalidateQueries({ queryKey: ["auth_me"] });
      setLocation("/login");
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      api.clearToken();
      setLocation("/login");
    }
  }, [logoutMutation, setLocation]);

  const state = useMemo(() => {
    const user = meQuery.data ?? null;
    localStorage.setItem("manus-runtime-user-info", JSON.stringify(user));
    return {
      user,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(user),
    };
  }, [meQuery.data, meQuery.error, meQuery.isLoading, logoutMutation.error, logoutMutation.isPending]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    setLocation(redirectPath);
  }, [redirectOnUnauthenticated, redirectPath, logoutMutation.isPending, meQuery.isLoading, state.user, setLocation]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
