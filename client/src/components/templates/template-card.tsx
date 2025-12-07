import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Rocket, Store, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TemplateCardProps {
  template: {
    id: number;
    name: string;
    description: string;
    category: string;
    price: string;
    preview?: string | null;
    previewUrl?: string | null;
    imageThumbnailUrl?: string | null;
    gridViewImageUrl?: string | null;
    status: string;
    deploymentUrl: string | null;
    marketplaceUrl: string | null;
    sales: number;
    rating: string;
    tags: string[];
    trendingScore?: number;
    featured?: boolean;
  };
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deployMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await apiRequest("POST", `/api/deploy/${templateId}`, {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Deployment Successful!",
        description: `Template deployed to ${data.deploymentUrl}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/templates"] });
      setIsDeploying(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsDeploying(false);
    },
  });

  const listMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await apiRequest("POST", `/api/list-marketplace/${templateId}`, {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Listed on Marketplace!",
        description: `Template is now available at ${data.marketplaceUrl}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/templates"] });
      setIsListing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Listing Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsListing(false);
    },
  });

  const handleDeploy = () => {
    setIsDeploying(true);
    deployMutation.mutate(template.id);
  };

  const handleList = () => {
    setIsListing(true);
    listMutation.mutate(template.id);
  };

  const getStatusBadge = () => {
    switch (template.status) {
      case "published":
        return <Badge className="bg-success/10 text-success border-success/20">Published</Badge>;
      case "live":
        return <Badge className="bg-success/10 text-success border-success/20">Live</Badge>;
      case "deploying":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Deploying</Badge>;
      case "draft":
        return <Badge className="bg-gray/10 text-gray-600 border-gray/20">Draft</Badge>;
      default:
        return <Badge variant="outline">{template.status}</Badge>;
    }
  };

  return (
    <Card className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <img 
        src={template.imageThumbnailUrl || template.preview || `https://images.unsplash.com/photo-${template.id % 2 === 0 ? '1556742049-0cfed4f6a45d' : '1506905925346-21bda4d32df4'}?w=600&h=400`}
        alt={template.name}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">{template.name}</h3>
          {parseFloat(template.rating) > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="text-accent fill-current" size={14} />
              <span className="text-sm font-medium">{parseFloat(template.rating).toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {template.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <Badge className="bg-success/10 text-success border-success/20">
              {template.sales} Sales
            </Badge>
            {template.tags.length > 0 && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {template.tags[0]}
              </Badge>
            )}
          </div>
          <span className="font-bold text-lg text-accent">${template.price}</span>
        </div>
        
        <div className="flex items-center space-x-2 w-full">
          {template.previewUrl && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(template.previewUrl!, '_blank')}
              className="flex-1"
            >
              <ExternalLink size={12} className="mr-1" />
              Preview
            </Button>
          )}
          
          {template.status === "published" && (
            <Button 
              size="sm" 
              className="flex-1 bg-primary hover:bg-blue-600 text-white"
              onClick={() => {
                toast({
                  title: "Purchase Template",
                  description: "This would open the purchase flow for the template.",
                });
              }}
            >
              <Store size={12} className="mr-1" />
              Purchase
            </Button>
          )}
          
          {template.status === "draft" && (
            <Button 
              size="sm" 
              onClick={handleDeploy}
              disabled={isDeploying}
              className="flex-1 bg-primary hover:bg-blue-600 text-white"
            >
              {isDeploying ? (
                <>
                  <Rocket size={12} className="mr-1 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket size={12} className="mr-1" />
                  Deploy
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
