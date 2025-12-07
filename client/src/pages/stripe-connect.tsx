import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  CreditCard, 
  DollarSign, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Building,
  Users,
  TrendingUp,
  Settings,
  Shield,
  Wallet,
  ChevronRight
} from "lucide-react";

interface StripeAccount {
  accountId: string;
  status: 'pending' | 'active' | 'restricted' | 'disabled';
  onboardingCompleted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements?: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
  };
  capabilities?: {
    cardPayments: string;
    transfers: string;
  };
  defaultCurrency?: string;
  country?: string;
  businessProfile?: {
    name?: string;
    url?: string;
  };
}

interface BillingSettings {
  subscriptionEnabled: boolean;
  amount: number;
  interval: 'monthly' | 'yearly';
  description: string;
}

export default function StripeConnect() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [billingSettings, setBillingSettings] = useState<BillingSettings>({
    subscriptionEnabled: false,
    amount: 20,
    interval: 'monthly',
    description: 'SaaS Platform Fee'
  });

  // Fetch Stripe account status
  const { data: stripeAccount, isLoading: accountLoading } = useQuery<StripeAccount>({
    queryKey: ['/api/stripe-connect/account'],
    enabled: !!user,
    retry: false
  });

  // Create Stripe Connect account
  const createAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/stripe-connect/create-account');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/stripe-connect/account'] });
      toast({
        title: "Account Created",
        description: "Your Stripe Connect account has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Start onboarding
  const startOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/stripe-connect/onboarding');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Access Stripe Dashboard
  const accessDashboardMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/stripe-connect/dashboard');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update billing settings
  const updateBillingMutation = useMutation({
    mutationFn: async (settings: BillingSettings) => {
      return apiRequest('POST', '/api/stripe-connect/billing-settings', settings);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your billing settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  if (authLoading || accountLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getStatusBadge = () => {
    if (!stripeAccount) return null;

    switch (stripeAccount.status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'restricted':
        return <Badge className="bg-orange-500 text-white">Restricted</Badge>;
      case 'disabled':
        return <Badge className="bg-red-500 text-white">Disabled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderAccountSetup = () => {
    if (!stripeAccount) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Get Started with Stripe Connect</CardTitle>
            <CardDescription>
              Set up your Stripe Connect account to start accepting payments and charging platform fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Accept Payments</h4>
                  <p className="text-sm text-muted-foreground">
                    Process payments from your customers
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Platform Fees</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically collect SaaS fees
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Secure & Compliant</h4>
                  <p className="text-sm text-muted-foreground">
                    PCI compliant payment processing
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => createAccountMutation.mutate()}
              disabled={createAccountMutation.isPending}
              className="w-full md:w-auto"
            >
              {createAccountMutation.isPending ? "Creating..." : "Create Stripe Connect Account"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (!stripeAccount.onboardingCompleted) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Complete Account Setup</CardTitle>
            <CardDescription>
              Complete the Stripe onboarding process to activate your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                You need to complete the Stripe onboarding process to start accepting payments.
                This includes verifying your identity and business information.
              </AlertDescription>
            </Alert>
            {stripeAccount.requirements?.currentlyDue && stripeAccount.requirements.currentlyDue.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Required Information:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {stripeAccount.requirements.currentlyDue.map((req, index) => (
                    <li key={index}>{req.replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button 
              onClick={() => startOnboardingMutation.mutate()}
              disabled={startOnboardingMutation.isPending}
              className="w-full md:w-auto"
            >
              {startOnboardingMutation.isPending ? "Loading..." : "Continue Setup"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stripe Account Status</CardTitle>
              <CardDescription>
                Your Stripe Connect account details and capabilities
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${stripeAccount.chargesEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm">Charges {stripeAccount.chargesEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${stripeAccount.payoutsEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm">Payouts {stripeAccount.payoutsEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${stripeAccount.detailsSubmitted ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm">Details {stripeAccount.detailsSubmitted ? 'Submitted' : 'Pending'}</span>
              </div>
            </div>
            <div className="space-y-3">
              {stripeAccount.businessProfile?.name && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{stripeAccount.businessProfile.name}</span>
                </div>
              )}
              {stripeAccount.country && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Country: {stripeAccount.country}</span>
                </div>
              )}
              {stripeAccount.defaultCurrency && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Currency: {stripeAccount.defaultCurrency.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => accessDashboardMutation.mutate()}
              disabled={accessDashboardMutation.isPending}
              variant="outline"
            >
              {accessDashboardMutation.isPending ? "Loading..." : "Access Dashboard"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              onClick={() => startOnboardingMutation.mutate()}
              disabled={startOnboardingMutation.isPending}
              variant="outline"
            >
              {startOnboardingMutation.isPending ? "Loading..." : "Update Information"}
              <Settings className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Stripe Connect Integration</h1>
        <p className="text-muted-foreground">
          Manage your Stripe Connect account and billing settings
        </p>
      </div>

      <div className="space-y-6">
        {renderAccountSetup()}

        {stripeAccount?.onboardingCompleted && (
          <Tabs defaultValue="billing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="billing">Billing Settings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="integration">Integration Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Billing Configuration</CardTitle>
                  <CardDescription>
                    Configure how you charge SaaS fees to your connected accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subscription Type</Label>
                    <Select 
                      value={billingSettings.interval}
                      onValueChange={(value: 'monthly' | 'yearly') => 
                        setBillingSettings(prev => ({ ...prev, interval: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Platform Fee Amount</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">$</span>
                      <Input 
                        type="number" 
                        value={billingSettings.amount}
                        onChange={(e) => setBillingSettings(prev => ({ 
                          ...prev, 
                          amount: parseFloat(e.target.value) || 0 
                        }))}
                        min="0"
                        step="0.01"
                      />
                      <span className="text-muted-foreground">/ {billingSettings.interval}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      value={billingSettings.description}
                      onChange={(e) => setBillingSettings(prev => ({ 
                        ...prev, 
                        description: e.target.value 
                      }))}
                      placeholder="e.g., SaaS Platform Fee"
                    />
                  </div>

                  <Button 
                    onClick={() => updateBillingMutation.mutate(billingSettings)}
                    disabled={updateBillingMutation.isPending}
                  >
                    {updateBillingMutation.isPending ? "Saving..." : "Save Billing Settings"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Analytics</CardTitle>
                  <CardDescription>
                    Track your payment processing and platform fees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">Collected</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Connected accounts</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Guide</CardTitle>
                  <CardDescription>
                    How to integrate Stripe Connect into your application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-medium">Quick Start Steps</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Complete your Stripe Connect account setup</li>
                      <li>Configure your platform billing settings</li>
                      <li>Integrate the payment flow into your application</li>
                      <li>Test with Stripe's test mode before going live</li>
                      <li>Monitor transactions through the Stripe Dashboard</li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">API Endpoints</h3>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                      <div>POST /api/stripe-connect/create-account</div>
                      <div>POST /api/stripe-connect/onboarding</div>
                      <div>GET /api/stripe-connect/account</div>
                      <div>POST /api/stripe-connect/charge-fee</div>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Testing Mode</AlertTitle>
                    <AlertDescription>
                      Always test your integration in Stripe's test mode before processing real payments.
                      Use test card numbers provided by Stripe documentation.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}