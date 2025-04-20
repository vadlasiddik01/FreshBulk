import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import ProductCatalog from "@/pages/ProductCatalog";
import PlaceOrder from "@/pages/Cart";
import TrackOrder from "@/pages/TrackOrder";
import AdminDashboard from "@/pages/AdminDashboard";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { CartesianAxis } from "recharts";
import { useForm } from "react-hook-form";
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={ProductCatalog} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/track-order" component={TrackOrder} />
      <ProtectedRoute path="/cart" component={PlaceOrder} />
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-[#f9f9f9]">
          <Navbar />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
