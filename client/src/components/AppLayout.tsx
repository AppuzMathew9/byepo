import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  navigation: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
}

export function AppLayout({ children, title, navigation }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } border-r border-border bg-card transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          {sidebarOpen && (
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-foreground">Byepo</h1>
              <p className="text-xs text-muted-foreground">Feature Flags</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md p-1 hover:bg-muted"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <button
                key={item.href}
                onClick={() => setLocation(item.href)}
                className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {item.icon && <span className="h-5 w-5">{item.icon}</span>}
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-border p-4">
          {sidebarOpen && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground">
                {user?.role?.replace("_", " ").toUpperCase()}
              </p>
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name || user?.email}
              </p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-border bg-card px-8 py-4">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>

      {/* Geometric Accent Shapes */}
      <div className="accent-shape-1" style={{ top: "10%", right: "5%" }} />
      <div className="accent-shape-2" style={{ bottom: "15%", left: "3%" }} />
    </div>
  );
}
