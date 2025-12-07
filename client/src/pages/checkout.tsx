import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Shield, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  templateId?: string;
  templateName?: string;
  templatePrice?: string;
}

const CheckoutForm = ({ templateId, templateName, templatePrice }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?template=${templateId}`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{templateName || "Template Purchase"}</p>
              <p className="text-sm text-muted-foreground">Digital Download</p>
            </div>
            <p className="font-bold">${templatePrice || "0"}</p>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${templatePrice || "0"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement 
              options={{
                layout: "tabs"
              }}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!stripe || !elements || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Complete Purchase - ${templatePrice}
                </>
              )}
            </Button>

            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Shield className="h-4 w-4 mr-1" />
              Secured by Stripe
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Back Link */}
      <div className="text-center">
        <Link href="/marketplace">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [templateData, setTemplateData] = useState<{
    id: string;
    name: string;
    price: string;
  } | null>(null);

  useEffect(() => {
    // Get template info from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    const templateName = urlParams.get('name');
    const templatePrice = urlParams.get('price');

    if (templateId && templateName && templatePrice) {
      setTemplateData({
        id: templateId,
        name: decodeURIComponent(templateName),
        price: templatePrice
      });

      // Create PaymentIntent
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: parseFloat(templatePrice),
        templateId: templateId,
        templateName: decodeURIComponent(templateName)
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Payment intent creation failed:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Setting up your purchase...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret || !templateData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">Unable to process payment. Please try again.</p>
          <Link href="/marketplace">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
          <p className="text-muted-foreground mt-2">
            You're just one step away from downloading your template
          </p>
        </div>

        <Elements 
          stripe={stripePromise} 
          options={{ 
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#3b82f6',
              }
            }
          }}
        >
          <CheckoutForm 
            templateId={templateData.id}
            templateName={templateData.name}
            templatePrice={templateData.price}
          />
        </Elements>
      </div>
    </div>
  );
}