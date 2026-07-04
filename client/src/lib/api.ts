const TOKEN_KEY = "byepo_auth_token";

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    
    // Add custom JSON contentType if body is passed
    if (options.body && !(options.body instanceof FormData)) {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }

    // Add Bearer Auth header if token exists
    const token = this.getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let message = "An error occurred";
      try {
        const errorData = await response.json();
        message = errorData.error?.message || errorData.message || message;
      } catch {}
      throw new Error(message);
    }

    // Handle logout or empty response
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data.data !== undefined ? data.data : data;
  },

  async get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: "GET" });
  },

  async post<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async put<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async patch<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: "DELETE" });
  },
};
