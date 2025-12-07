import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/seo";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Star, 
  ShoppingCart, 
  Eye, 
  Download,
  Sparkles,
  Clock,
  DollarSign,
  MapPin,
  Globe,
  Zap,
  Shield,
  Award,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";
import { analyticsService } from "@/lib/analytics-client";
import AnimatedTemplateCard from "@/components/marketplace/animated-template-card";
import { TemplateGridContainer, StaggeredAnimation, SlideIn } from "@/components/marketplace/template-grid-animations";
import { MarketplaceFilters } from "@/components/marketplace-filters";
import TemplateDetailModal from "@/components/marketplace/template-detail-modal";
import RecommendedTemplates from "@/components/marketplace/recommended-templates";

const TEMPLATE_CATEGORIES = [
  { value: "all", label: "All Templates", icon: Globe },
  { value: "Travel Blog", label: "Travel Blogs", icon: MapPin },
  { value: "Tour Agency", label: "Tour Agencies", icon: Globe },
  { value: "Booking Platform", label: "Booking Platforms", icon: ShoppingCart },
  { value: "Travel Guide", label: "Travel Guides", icon: MapPin },
  { value: "Adventure Tours", label: "Adventure Tours", icon: Zap },
  { value: "Hotel Website", label: "Hotel Websites", icon: Shield },
  { value: "Travel Portfolio", label: "Travel Portfolios", icon: Award },
];

const PRICE_RANGES = [
  { value: "all", label: "All Prices" },
  { value: "0-50", label: "$0 - $50" },
  { value: "50-100", label: "$50 - $100" },
  { value: "100-200", label: "$100 - $200" },
  { value: "200+", label: "$200+" },
];

export default function Marketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: [0, 500] as [number, number],
    sortBy: "popular",
    minRating: 0,
    featured: false
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch marketplace templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/marketplace/templates", { category: filters.category, status: "published" }],
  });

  // Fetch trending templates
  const { data: trendingTemplates = [] } = useQuery({
    queryKey: ["/api/marketplace/trending"],
  });

  // Purchase template mutation
  const purchaseTemplate = useMutation({
    mutationFn: async (templateId: number) => {
      return apiRequest("POST", `/api/marketplace/purchase/${templateId}`);
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful!",
        description: "The template has been added to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      analyticsService.trackEvent("template_purchased", { category: filters.category });
    },
    onError: () => {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase.",
        variant: "destructive",
      });
    },
  });

  // Filter and sort templates
  const filteredTemplates = (templates as any[]).filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === "all" || template.category === filters.category;
    
    // Check price range
    const price = parseFloat(template.price);
    const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];
    
    // Check rating filter
    const rating = parseFloat(template.rating || "0");
    const matchesRating = rating >= filters.minRating;
    
    // Check featured filter
    const matchesFeatured = !filters.featured || template.featured;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesFeatured;
  });

  const sortedTemplates = [...filteredTemplates].sort((a: any, b: any) => {
    switch (filters.sortBy) {
      case "popular":
        return (b.downloads || 0) - (a.downloads || 0);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleTemplateView = (templateId: number) => {
    analyticsService.trackEvent("marketplace_template_viewed", { 
      templateId,
      category: filters.category 
    });
  };

  const handlePurchase = (template: any) => {
    // Redirect to sales page which exists in the app
    window.location.href = `/sales?template=${template.id}&name=${encodeURIComponent(template.name)}&price=${template.price}`;
  };

  const handlePreview = (template: any) => {
    handleTemplateView(template.id);
    // Keep user on marketplace page - the preview modal handles the display
    // If you want to navigate somewhere, use the templates page that exists
    // window.location.href = `/templates`;
  };
  
  const handleTemplateClick = (template: any) => {
    setSelectedTemplate(template);
    setShowDetailModal(true);
  };

  return (
    <>
      <SEO
        title="Marketplace de Templates — RunYourTrip"
        description="Descubra templates premium de sites de viagem criados por nossa IA e criadores ao redor do mundo."
        path="/marketplace"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Marketplace de Templates",
          description: "Templates de sites de viagem com IA",
          url: "https://www.runyourtrip.com.br/marketplace"
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-gray-900 mb-4"
          >
            Template Marketplace
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Discover premium travel website templates created by our AI and talented creators worldwide
          </motion.p>
        </div>

        {/* Personalized Recommendations */}
        {user && (
          <div className="mb-8">
            <RecommendedTemplates 
              onTemplateClick={handleTemplateClick}
              onPurchase={handlePurchase}
            />
          </div>
        )}
        
        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-blue-100">Templates</p>
                <p className="text-2xl font-bold">{(templates as any[]).length}</p>
              </div>
              <Sparkles className="h-8 w-8 text-blue-200" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-purple-100">Downloads</p>
                <p className="text-2xl font-bold">12.5K</p>
              </div>
              <Download className="h-8 w-8 text-purple-200" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-green-100">Avg Rating</p>
                <p className="text-2xl font-bold">4.8</p>
              </div>
              <Star className="h-8 w-8 text-green-200" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-orange-100">Creators</p>
                <p className="text-2xl font-bold">350+</p>
              </div>
              <Award className="h-8 w-8 text-orange-200" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters Component */}
        <MarketplaceFilters 
          onFilterChange={handleFilterChange}
          categories={TEMPLATE_CATEGORIES.filter(c => c.value !== "all").map(c => c.value)}
        />

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search templates by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-lg"
            />
          </div>
        </div>

        {/* Trending Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(trendingTemplates as any[]).slice(0, 3).map((template) => (
                  <div key={template.id} className="space-y-1">
                    <p className="font-medium text-sm truncate">{template.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">${template.price}</span>
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {template.trend || "Hot"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Templates Grid */}
        <div>
          {/* Controls Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing {sortedTemplates.length} templates
            </p>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

            {/* Templates */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 bg-gray-200 animate-pulse" />
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 animate-pulse mb-2" />
                      <div className="h-3 bg-gray-200 animate-pulse w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedTemplates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No templates found</p>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search to find what you're looking for
                  </p>
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              <TemplateGridContainer isLoading={isLoading}>
                <StaggeredAnimation>
                  {sortedTemplates.map((template) => (
                    <AnimatedTemplateCard
                      key={template.id}
                      template={template}
                      onPurchase={handlePurchase}
                      onPreview={handleTemplateClick}
                    />
                  ))}
                </StaggeredAnimation>
              </TemplateGridContainer>
            ) : (
              <div className="space-y-4">
                {sortedTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="w-48 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex-shrink-0">
                            {template.preview && (
                              <img 
                                src={template.preview} 
                                alt={template.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-bold text-xl mb-2">{template.name}</h3>
                                <p className="text-muted-foreground mb-3">
                                  {template.description}
                                </p>
                                <div className="flex items-center gap-4">
                                  <Badge variant="secondary">{template.category}</Badge>
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="text-sm ml-1">{template.rating > 0 ? template.rating.toFixed(1) : "No ratings"}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    <Download className="h-4 w-4 inline mr-1" />
                                    {template.downloads || 0} downloads
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 inline mr-1" />
                                    {new Date(template.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-3xl font-bold">${template.price}</p>
                                <div className="flex gap-2 mt-3">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleTemplateClick(template)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => purchaseTemplate.mutate(template.id)}
                                    disabled={purchaseTemplate.isPending}
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    Purchase
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
        </div>
      </div>
      
      <Footer />
      
      {/* Template Detail Modal */}
      <TemplateDetailModal
        template={selectedTemplate}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onPurchase={handlePurchase}
        onPreview={handlePreview}
      />
    </div>
    </>
  );
}