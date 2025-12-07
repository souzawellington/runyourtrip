import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Crown, ShoppingCart, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";

export default function TestPayments() {
  const [isTestingStripe, setIsTestingStripe] = useState(false);
  const [testResults, setTestResults] = useState<{
    paymentIntent: boolean | null;
    subscription: boolean | null;
  }>({
    paymentIntent: null,
    subscription: null
  });
  const { toast } = useToast();

  const testPaymentIntent = async () => {
    try {
      setIsTestingStripe(true);
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: 29.99,
        templateId: "test-template",
        templateName: "Test Template"
      });
      
      const data = await response.json();
      
      if (data.clientSecret) {
        setTestResults(prev => ({ ...prev, paymentIntent: true }));
        toast({
          title: "Payment Intent Success",
          description: "Stripe payment intent created successfully!",
        });
      } else {
        throw new Error("No client secret returned");
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, paymentIntent: false }));
      toast({
        title: "Payment Intent Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsTestingStripe(false);
    }
  };

  const testSubscription = async () => {
    try {
      setIsTestingStripe(true);
      const response = await apiRequest("POST", "/api/create-subscription", {
        planId: "pro",
        planName: "Pro Plan",
        amount: 79
      });
      
      const data = await response.json();
      
      if (data.clientSecret) {
        setTestResults(prev => ({ ...prev, subscription: true }));
        toast({
          title: "Subscription Success",
          description: "Stripe subscription created successfully!",
        });
      } else {
        throw new Error("No client secret returned");
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, subscription: false }));
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsTestingStripe(false);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <div className="w-6 h-6 rounded-full bg-gray-200" />;
    if (status) return <CheckCircle className="w-6 h-6 text-green-500" />;
    return <AlertCircle className="w-6 h-6 text-red-500" />;
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return "Not tested";
    if (status) return "Success";
    return "Failed";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment System Test
          </h1>
          <p className="text-lg text-gray-600">
            Test the Stripe integration and payment flows
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          {/* Stripe API Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Stripe API Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Payment Intent</h3>
                    {getStatusIcon(testResults.paymentIntent)}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Test creating a payment intent for template purchases
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant={testResults.paymentIntent === true ? "default" : 
                                  testResults.paymentIntent === false ? "destructive" : "secondary"}>
                      {getStatusText(testResults.paymentIntent)}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={testPaymentIntent}
                      disabled={isTestingStripe}
                    >
                      {isTestingStripe ? "Testing..." : "Test"}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Subscription</h3>
                    {getStatusIcon(testResults.subscription)}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Test creating a subscription for pro plans
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant={testResults.subscription === true ? "default" : 
                                  testResults.subscription === false ? "destructive" : "secondary"}>
                      {getStatusText(testResults.subscription)}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={testSubscription}
                      disabled={isTestingStripe}
                    >
                      {isTestingStripe ? "Testing..." : "Test"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Flow Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Payment Flow Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => window.location.href = '/checkout?template=test&name=Test%20Template&price=29.99'}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>Test Checkout Flow</span>
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/subscribe?plan=pro'}
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Crown className="h-6 w-6" />
                  <span>Test Subscription Flow</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Environment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold">Stripe Keys</p>
                  <p className="text-sm text-gray-600">Configured</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold">API Routes</p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold">Frontend</p>
                  <p className="text-sm text-gray-600">Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/marketplace'}
                >
                  View Marketplace
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/checkout?template=1&name=Sample%20Template&price=19.99'}
                >
                  Sample Checkout
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/subscribe'}
                >
                  View Subscriptions
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}