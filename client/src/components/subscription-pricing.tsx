import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatBRL } from "@/lib/currency";
import { 
  Check, 
  X, 
  Zap,
  Crown,
  Rocket,
  Building,
  Sparkles,
  TrendingUp,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

const tierIcons: Record<string, any> = {
  free: Sparkles,
  starter: Zap,
  professional: Crown,
  business: Building,
};

export default function SubscriptionPricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  
  const userId = (user as any)?.claims?.sub || (user as any)?.id;

  // Fetch subscription tiers
  const { data: tiers, isLoading: tiersLoading } = useQuery({
    queryKey: ["/api/subscriptions/tiers"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions/tiers");
      if (!response.ok) throw new Error("Failed to fetch tiers");
      return response.json();
    },
  });

  // Fetch user's current subscription
  const { data: currentSubscription } = useQuery({
    queryKey: ["/api/subscriptions/user", userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/subscriptions/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch subscription");
      return response.json();
    },
  });

  // Subscribe mutation
  const subscribe = useMutation({
    mutationFn: async (tierId: number) => {
      const response = await fetch("/api/subscriptions/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId,
          tierId,
        }),
      });
      if (!response.ok) throw new Error("Failed to subscribe");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Successful!",
        description: `You are now subscribed to ${data.tier.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/user"] });
    },
    onError: () => {
      toast({
        title: "Subscription Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    },
  });

  // Cancel subscription
  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to cancel");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/user"] });
    },
  });

  const getPrice = (tier: any) => {
    const basePrice = parseFloat(tier.price);
    if (billingInterval === "yearly" && basePrice > 0) {
      // 20% discount for yearly billing
      return basePrice * 12 * 0.8;
    }
    return basePrice;
  };

  const getPriceLabel = (tier: any) => {
    const price = getPrice(tier);
    if (price === 0) return "Grátis";
    
    // Convert USD to BRL (approximate rate - should be dynamic in production)
    const brlPrice = price * 5.0; // 1 USD = 5 BRL approximation
    
    if (billingInterval === "yearly") {
      return (
        <div>
          <span className="text-2xl font-bold">{formatBRL(brlPrice)}</span>
          <span className="text-sm text-muted-foreground">/ano</span>
          <div className="text-xs text-green-600 mt-1">Economize 20%</div>
        </div>
      );
    }
    return (
      <div>
        <span className="text-2xl font-bold">{formatBRL(brlPrice)}</span>
        <span className="text-sm text-muted-foreground">/mês</span>
      </div>
    );
  };

  if (tiersLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 animate-pulse mb-2 w-1/2" />
              <div className="h-3 bg-gray-200 animate-pulse w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 animate-pulse mb-4" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-3 bg-gray-200 animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Escolha Seu Plano</h2>
        <p className="text-lg text-muted-foreground">
          Desbloqueie recursos premium e leve seu negócio ao próximo nível
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <Label htmlFor="billing-toggle" className={billingInterval === "monthly" ? "font-semibold" : "text-muted-foreground"}>
            Mensal
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingInterval === "yearly"}
            onCheckedChange={(checked) => setBillingInterval(checked ? "yearly" : "monthly")}
            aria-label="Alternar entre plano mensal e anual"
          />
          <span className={billingInterval === "yearly" ? "font-semibold" : "text-muted-foreground"}>
            Anual
            <Badge variant="secondary" className="ml-2">Economize 20%</Badge>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers?.map((tier: any, index: number) => {
          const Icon = tierIcons[tier.slug] || Sparkles;
          const isCurrentPlan = currentSubscription?.tier?.id === tier.id;
          const features = tier.features || [];
          const benefits = tier.benefits || [];
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative ${tier.highlighted ? "border-primary shadow-lg scale-105" : ""}`}>
                {tier.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    Mais Popular
                  </Badge>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-8 w-8 text-primary" />
                    {isCurrentPlan && (
                      <Badge variant="secondary">Plano Atual</Badge>
                    )}
                  </div>
                  <CardTitle>{tier.name}</CardTitle>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">{getPriceLabel(tier)}</div>
                    {billingInterval === "yearly" && parseFloat(tier.price) > 0 && (
                      <p className="text-sm text-muted-foreground line-through">
                        ${(parseFloat(tier.price) * 12).toFixed(2)}/year
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    {features.slice(0, 5).map((feature: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Button */}
                  {!user ? (
                    <Button 
                      className="w-full" 
                      variant={tier.highlighted ? "default" : "outline"}
                      disabled={false}
                    >
                      Entre para Assinar
                    </Button>
                  ) : isCurrentPlan ? (
                    <Button 
                      className="w-full" 
                      variant="secondary"
                      onClick={() => cancelSubscription.mutate()}
                      disabled={cancelSubscription.isPending || parseFloat(tier.price) === 0}
                    >
                      {cancelSubscription.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : parseFloat(tier.price) === 0 ? "Plano Atual" : "Cancelar Plano"}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                      onClick={() => subscribe.mutate(tier.id)}
                      disabled={subscribe.isPending}
                    >
                      {subscribe.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : parseFloat(tier.price) === 0 ? "Começar Grátis" : "Assinar Agora"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  {tiers?.map((tier: any) => (
                    <th key={tier.id} className="text-center py-2 px-4">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">Templates per month</td>
                  {tiers?.map((tier: any) => {
                    const limits = tier.limits || {};
                    return (
                      <td key={tier.id} className="text-center py-3">
                        {limits.templates === -1 ? "Unlimited" : limits.templates || "5"}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3">AI Image Generations</td>
                  {tiers?.map((tier: any) => {
                    const limits = tier.limits || {};
                    return (
                      <td key={tier.id} className="text-center py-3">
                        {limits.ai_generations === -1 ? "Unlimited" : limits.ai_generations || "10"}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3">Priority Support</td>
                  {tiers?.map((tier: any, index: number) => (
                    <td key={tier.id} className="text-center py-3">
                      {index > 0 ? (
                        <Check className="h-4 w-4 text-green-500 inline" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 inline" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3">API Access</td>
                  {tiers?.map((tier: any, index: number) => (
                    <td key={tier.id} className="text-center py-3">
                      {index > 1 ? (
                        <Check className="h-4 w-4 text-green-500 inline" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 inline" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3">White Label</td>
                  {tiers?.map((tier: any, index: number) => (
                    <td key={tier.id} className="text-center py-3">
                      {index === 3 ? (
                        <Check className="h-4 w-4 text-green-500 inline" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 inline" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ or CTA */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardContent className="text-center py-8">
          <h3 className="text-2xl font-bold mb-4">
            Ready to scale your business?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of creators and businesses using RunYourTrip to build and sell amazing travel websites
          </p>
          <Button size="lg" className="gap-2">
            <Rocket className="h-5 w-5" />
            Start Free Trial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}