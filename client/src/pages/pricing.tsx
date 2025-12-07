import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SubscriptionPricing from "@/components/subscription-pricing";
import ReferralProgram from "@/components/referral-program";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import SEO from "@/components/seo";

export default function Pricing() {
  return (
    <>
      <SEO
        title="Planos e Preços — RunYourTrip"
        description="Escolha o plano perfeito para suas necessidades. Preços transparentes em BRL com suporte completo."
        path="/pricing"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "OfferCatalog",
          name: "Planos RunYourTrip",
          description: "Planos de assinatura para criação de templates de viagem",
          url: "https://www.runyourtrip.com.br/pricing"
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Pricing & Programs</h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your needs and earn rewards
          </p>
        </motion.div>

        <Tabs defaultValue="pricing" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="pricing">Subscription Plans</TabsTrigger>
            <TabsTrigger value="referral">Referral Program</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pricing">
            <SubscriptionPricing />
          </TabsContent>
          
          <TabsContent value="referral">
            <ReferralProgram />
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
    </>
  );
}