import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { useAuth } from "@/hooks/useAuth";
import { LGPDConsent } from "@/components/lgpd-consent";
import { MobileCTA, WhatsAppButton } from "@/components/mobile-cta";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Templates from "@/pages/templates";
import Analytics from "@/pages/analytics";
import OpenAITools from "@/pages/openai-tools";
import AIImageGenerator from "@/pages/ai-image-generator";
import Marketplace from "@/pages/marketplace";
import Workspaces from "@/pages/workspaces";
import WorkspaceDetail from "@/pages/workspace-detail";
import ContentStudio from "@/pages/content-studio";
import SubscriptionSuccess from "@/pages/subscription-success";
import DNSManagement from "./pages/dns-management";

import ConnectivityStatus from "@/pages/connectivity-status";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminLogin from "@/pages/admin-login";
import HealthDashboard from "@/pages/health-dashboard";
import HealthReport from "@/pages/health-report";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import PaymentSuccess from "@/pages/payment-success";
import TestPayments from "@/pages/test-payments";
import SalesPage from "@/pages/sales";
import DemoPage from "@/pages/demo";
import PricingPage from "@/pages/pricing";
import StripeConnect from "@/pages/stripe-connect";
import BrandManagement from "@/pages/BrandManagement";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <Route path="/" component={isAuthenticated ? Home : Landing} />
          <Route path="/dashboard" component={Home} />
          <Route path="/templates" component={Templates} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/openai-tools" component={OpenAITools} />
          <Route path="/ai-image-generator" component={AIImageGenerator} />
          <Route path="/content-studio" component={ContentStudio} />
          <Route path="/workspaces" component={Workspaces} />
          <Route path="/workspaces/:id" component={WorkspaceDetail} />
          <Route path="/connectivity" component={ConnectivityStatus} />
          <Route path="/health" component={HealthDashboard} />
          <Route path="/health-report" component={HealthReport} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/subscription-success" component={SubscriptionSuccess} />
          <Route path="/dns-management" component={DNSManagement} />
          <Route path="/test-payments" component={TestPayments} />
          <Route path="/sales" component={SalesPage} />
          <Route path="/demo" component={DemoPage} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/stripe-connect" component={StripeConnect} />
          <Route path="/brand-management" component={BrandManagement} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin" component={AdminDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <LGPDConsent />
          <MobileCTA />
          <WhatsAppButton />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;