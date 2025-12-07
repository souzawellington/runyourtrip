import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Zap, Globe, Star } from "lucide-react";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { motion } from "framer-motion";
import SEO from "@/components/seo";

export default function Landing() {
  return (
    <>
      <SEO
        title="Monte sua viagem — RunYourTrip"
        description="Crie um roteiro personalizado em minutos e receba ofertas exclusivas. Planeje viagens no Brasil com IA."
        path="/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "RunYourTrip",
          url: "https://www.runyourtrip.com.br",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.runyourtrip.com.br/marketplace?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <div className="min-h-screen bg-[#030303]">
      {/* Header with absolute positioning over hero */}
      <header className="absolute top-0 left-0 right-0 z-20 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">Run Your Trip</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost"
              onClick={() => window.location.href = '/marketplace'}
              className="text-white hover:text-white/80 hover:bg-white/10"
            >
              Browse Marketplace
            </Button>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white border-0"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with HeroGeometric */}
      <HeroGeometric 
        badge="AI-Powered Travel Platform"
        title1="Create Travel Websites"
        title2="Without Coding"
      />

      {/* Main content */}
      <main className="relative z-10 bg-[#030303]">
        {/* Call to Action Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="container mx-auto px-4 -mt-20 mb-16"
        >
          <div className="text-center">
            <p className="text-lg text-white/60 mb-8 max-w-3xl mx-auto">
              Transform your travel ideas into professional websites using AI. Generate, deploy, and monetize your travel templates with zero technical skills required.
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white text-lg px-8 py-3 border-0"
            >
              Get Started Free
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="container mx-auto px-4 grid md:grid-cols-3 gap-8 mb-16"
        >
          <Card className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] transition-colors">
            <CardHeader>
              <Zap className="h-12 w-12 text-indigo-400 mb-4" />
              <CardTitle className="text-white">AI-Powered Generation</CardTitle>
              <CardDescription className="text-white/60">
                Describe your travel website idea and watch AI create a complete, professional template in minutes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] transition-colors">
            <CardHeader>
              <Globe className="h-12 w-12 text-rose-400 mb-4" />
              <CardTitle className="text-white">Instant Deployment</CardTitle>
              <CardDescription className="text-white/60">
                Your websites are automatically deployed to the web with custom domains and professional hosting.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] transition-colors">
            <CardHeader>
              <Star className="h-12 w-12 text-amber-400 mb-4" />
              <CardTitle className="text-white">Marketplace Integration</CardTitle>
              <CardDescription className="text-white/60">
                Monetize your templates by listing them on our marketplace and earn from every sale.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="container mx-auto px-4 mb-16"
        >
          <div className="text-center bg-gradient-to-br from-indigo-500/10 to-rose-500/10 rounded-2xl p-12 border border-white/[0.08] backdrop-blur-sm">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-white/80">
            Join thousands of creators building their travel empire with AI
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-3"
          >
            Sign In to Continue
          </Button>
          </div>
        </motion.div>
      </main>
      </div>
    </>
  );
}