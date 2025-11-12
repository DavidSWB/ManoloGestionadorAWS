import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Servicios from "./pages/Servicios";
import Cobros from "./pages/Cobros";
import Recordatorios from "./pages/Recordatorios";
import Reportes from "./pages/Reportes";
import Config from "./pages/Config";
import Placeholder from "./pages/Placeholder";
import { AppDataProvider } from "./context/app-data";
import { AuthProvider, useAuth } from "./context/auth";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <RequireAuth>
          <Layout />
        </RequireAuth>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="clientes" element={<Clientes />} />
      <Route path="servicios" element={<Servicios />} />
      <Route path="cobros" element={<Cobros />} />
      <Route path="recordatorios" element={<Recordatorios />} />
      <Route path="reportes" element={<Reportes />} />
      <Route path="config" element={<Config />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppDataProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppDataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

(function() {
  const container = document.getElementById("root");
  if (!container) throw new Error("Root container not found");
  // Reuse an existing root during HMR/dev to avoid React warning about multiple createRoot calls
  const win = window as any;
  if (!win.__MANOLO_ROOT__) {
    win.__MANOLO_ROOT__ = createRoot(container);
  }
  win.__MANOLO_ROOT__.render(<App />);
})();

// HMR: clean up root between module replacements to avoid duplicate createRoot warnings
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    const win = window as any;
    try {
      if (win.__MANOLO_ROOT__) {
        win.__MANOLO_ROOT__.unmount();
        delete win.__MANOLO_ROOT__;
      }
    } catch (e) {
      // ignore
    }
  });
}
