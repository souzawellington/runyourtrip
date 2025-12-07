import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Zap, 
  Shield, 
  TrendingUp,
  Users,
  Clock,
  Code,
  Sparkles,
  Mail,
  Gift
} from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function SalesPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

  // Email subscription mutation
  const subscribeNewsletter = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }
      return response.json();
    },
    onSuccess: () => {
      setShowThankYou(true);
      setEmail("");
      toast({
        title: "Welcome aboard!",
        description: "Check your email for your exclusive discount code.",
      });
    },
    onError: () => {
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Generation",
      description: "Turn your ideas into professional websites in minutes with our advanced AI technology",
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Zero Coding Required",
      description: "No technical skills needed - our platform handles all the complex coding for you",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Monetize Your Templates",
      description: "Sell your creations in our marketplace and earn passive income",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Bank-level security with encrypted data and secure payment processing",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Instant Deployment",
      description: "Deploy to production with one click - no complex configurations needed",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Work together with your team in real-time workspaces",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Startup Founder",
      content: "Run Your Trip helped me launch my business website in just 2 hours. The AI understood exactly what I needed!",
      rating: 5,
      revenue: "$3,200/month",
    },
    {
      name: "Michael Rodriguez",
      role: "Freelance Designer",
      content: "I've sold over 50 templates and make consistent passive income. This platform changed my life!",
      rating: 5,
      revenue: "$8,500/month",
    },
    {
      name: "Emma Thompson",
      role: "Agency Owner",
      content: "We use Run Your Trip for all our client projects. It's 10x faster than traditional development.",
      rating: 5,
      revenue: "Saved 200+ hours",
    },
  ];

  const pricingPlans = [
    {
      name: "Free Trial",
      price: "$0",
      description: "Perfect for testing the waters",
      features: [
        "Generate 1 template",
        "Basic customization",
        "Preview only",
        "Community support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "Everything you need to build and sell",
      features: [
        "Unlimited templates",
        "Full customization",
        "Deploy to production",
        "Marketplace access",
        "Priority support",
        "Analytics dashboard",
      ],
      cta: "Start Building",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For teams and agencies",
      features: [
        "Everything in Pro",
        "Team workspaces",
        "White-label options",
        "API access",
        "Dedicated support",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-20 pb-32">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" />
              Limited Time: 30% OFF First Month
            </Badge>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Turn Ideas Into
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Profitable Websites
              </span>
            </h1>
            
            <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
              Create, deploy, and monetize professional websites without writing a single line of code. 
              Join 10,000+ creators earning passive income from their templates.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/demo">
                <Button size="lg" className="w-full sm:w-auto">
                  Try Free Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/templates">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Templates
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Cancel anytime
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                24/7 support
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-y bg-secondary/50 py-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-sm text-muted-foreground">Active Creators</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50,000+</div>
              <div className="text-sm text-muted-foreground">Templates Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold">$2M+</div>
              <div className="text-sm text-muted-foreground">Creator Earnings</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.9/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Powerful features that make website creation and monetization effortless
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-secondary/30 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Success Stories from Our Community
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Real creators, real results. See how Run Your Trip transforms businesses.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="mb-2 flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <CardDescription className="text-base">
                      "{testimonial.content}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                      <Badge variant="secondary">{testimonial.revenue}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Choose the perfect plan for your needs. Upgrade or downgrade anytime.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={plan.popular ? "relative" : ""}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full ${plan.popular ? "border-primary" : ""}`}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.name === "Free Trial" ? "/demo" : "/register"}>
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Capture Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 px-4 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          {!showThankYou ? (
            <>
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <Gift className="h-8 w-8" />
              </div>
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Get 30% Off Your First Month
              </h2>
              <p className="mb-8 text-xl opacity-90">
                Plus our exclusive guide: "10 Ways to Monetize Your Templates"
              </p>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email) {
                    subscribeNewsletter.mutate(email);
                  }
                }}
                className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/20 text-white placeholder:text-white/70"
                />
                <Button 
                  type="submit" 
                  size="lg"
                  variant="secondary"
                  disabled={subscribeNewsletter.isPending}
                >
                  {subscribeNewsletter.isPending ? (
                    "Subscribing..."
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Get Discount
                    </>
                  )}
                </Button>
              </form>
              
              <p className="mt-4 text-sm opacity-70">
                No spam, unsubscribe anytime. Join 5,000+ subscribers.
              </p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle2 className="mx-auto mb-4 h-16 w-16" />
              <h2 className="mb-4 text-3xl font-bold">Thank You!</h2>
              <p className="mb-8 text-xl">
                Check your email for your exclusive discount code and free guide.
              </p>
              <Link href="/demo">
                <Button size="lg" variant="secondary">
                  Start Your Free Trial
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Ready to Transform Your Ideas?
          </h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Join thousands of creators who are building and monetizing their dream websites.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/demo">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}