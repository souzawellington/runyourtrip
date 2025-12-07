import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, Globe, Zap } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants";
import heroImage from "@assets/A_high-resolution_digital_photograph_enhanced_with_1750793838655.png";

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        <img 
          src={heroImage} 
          alt="Digital innovation workspace" 
          className="w-full h-full object-cover" 
        />
      </div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Turn Ideas Into
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Profitable Websites
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {BRAND_CONFIG.tagline} - Create, deploy, and monetize professional websites 
            with our AI-powered platform. No coding required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            >
              <Sparkles className="mr-2" size={20} />
              Start Creating
              <ArrowRight className="ml-2" size={20} />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-300 px-8 py-4 text-lg"
            >
              <Globe className="mr-2" size={20} />
              View Templates
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 bg-white/60 backdrop-blur-sm border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                <Zap className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Generation</h3>
              <p className="text-gray-600 text-sm">
                Describe your vision and watch our AI create professional websites instantly.
              </p>
            </Card>
            
            <Card className="p-6 bg-white/60 backdrop-blur-sm border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
                <Globe className="text-purple-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Auto-Deploy</h3>
              <p className="text-gray-600 text-sm">
                Automatic deployment to live URLs with custom domain support.
              </p>
            </Card>
            
            <Card className="p-6 bg-white/60 backdrop-blur-sm border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
                <Sparkles className="text-green-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Monetize</h3>
              <p className="text-gray-600 text-sm">
                Sell your templates on our marketplace and earn passive income.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}