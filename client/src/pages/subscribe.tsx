import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Crown, Check, ArrowLeft, Zap } from "lucide-react";
import { Link } from "wouter";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    interval: 'month',
    description: 'Perfect for getting started',
    features: [
      '5 template downloads per month',
      'Basic customer support',
      'Standard templates access',
      'Email notifications'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    interval: 'month', 
    description: 'Most popular for professionals',
    features: [
      'Unlimited template downloads',
      'Priority customer support',
      'Access to premium templates',
      'Early access to new releases',
      'Custom template requests',
      'Commercial license included'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$199',
    interval: 'month',
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      'Team collaboration tools',
      'White-label templates',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee'
    ],
    popular: false
  }
];

interface SubscribeFormProps {
  selectedPlan: typeof SUBSCRIPTION_PLANS[0];
}

const SubscribeForm = ({ selectedPlan }: SubscribeFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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
          return_url: `${window.location.origin}/subscription-success`,
        },
      });

      if (error) {
        toast({
          title: "Subscription Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Subscription Error", 
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Subscribe to {selectedPlan.name}
          </CardTitle>
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {selectedPlan.price}
              <span className="text-base font-normal text-muted-foreground">
                /{selectedPlan.interval}
              </span>
            </div>
            <p className="text-muted-foreground">{selectedPlan.description}</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Features */}
            <div className="space-y-3">
              <h4 className="font-medium">What's included:</h4>
              {selectedPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

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
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Subscribe for {selectedPlan.price}/month
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              You can cancel your subscription at any time. No long-term commitments.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[1]); // Default to Pro

  const { toast } = useToast();

  useEffect(() => {
    // Get plan from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    
    if (planId) {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
      }
    }

    // Create subscription
    apiRequest("POST", "/api/create-subscription", { 
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      amount: parseFloat(selectedPlan.price.replace('$', ''))
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Subscription creation failed:", error);
        toast({
          title: "Subscription Error",
          description: "Failed to create subscription. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedPlan.id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Setting up your subscription...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground">
              Unlock unlimited access to premium templates
            </p>
          </div>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    <Zap className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {plan.price}
                      <span className="text-base font-normal text-muted-foreground">
                        /{plan.interval}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={`/subscribe?plan=${plan.id}`}>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.popular ? (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Get Started
                        </>
                      ) : (
                        "Choose Plan"
                      )}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/marketplace">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Complete Your Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Join thousands of professionals using our templates
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
          <SubscribeForm selectedPlan={selectedPlan} />
        </Elements>
      </div>
    </div>
  );
}