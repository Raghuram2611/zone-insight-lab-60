import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "@/components/LoginPage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { getAuthCookie, removeAuthCookie } from "./lib/auth";
import { toast } from "sonner";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<{ role: 'user' | 'admin' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const authData = getAuthCookie();
    if (authData) {
      setUser({ role: authData.role });
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (role: 'user' | 'admin') => {
    setUser({ role });
  };

  const handleLogout = () => {
    removeAuthCookie();
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : user.role === 'admin' ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index onLogout={handleLogout} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
