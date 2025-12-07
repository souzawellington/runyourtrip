import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { 
  Sparkles, 
  TrendingUp, 
  Star, 
  ShoppingCart,
  Eye,
  Clock,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";

interface RecommendedTemplatesProps {
  onTemplateClick?: (template: any) => void;
  onPurchase?: (template: any) => void;
}

export default function RecommendedTemplates({ 
  onTemplateClick, 
  onPurchase 
}: RecommendedTemplatesProps) {
  const { user } = useAuth();

  const userId = (user as any)?.claims?.sub || (user as any)?.id;
  
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["/api/recommendations/user", userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/recommendations/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      return response.json();
    },
  });

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sign in to get personalized template recommendations based on your preferences.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-bold">Recommended for You</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="h-48 w-full bg-gray-200 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 w-3/4 mb-2 bg-gray-200 animate-pulse" />
                <div className="h-3 w-full bg-gray-200 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations?.recommendations?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-bold">Recommended for You</h2>
        </div>
        {recommendations.basedOn && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {recommendations.basedOn.categories?.length > 0 && (
              <Badge variant="outline">
                Based on {recommendations.basedOn.categories.join(", ")}
              </Badge>
            )}
            {recommendations.basedOn.hasHistory && (
              <Badge variant="outline">Your History</Badge>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendations.recommendations.slice(0, 8).map((template: any, index: number) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => onTemplateClick?.(template)}
            >
              <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                {template.imageThumbnailUrl ? (
                  <img
                    src={template.imageThumbnailUrl}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TrendingUp className="h-12 w-12 text-purple-400" />
                  </div>
                )}
                
                {template.featured && (
                  <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                    Featured
                  </Badge>
                )}
                
                {template.trendingScore > 80 && (
                  <Badge className="absolute top-2 right-2" variant="secondary">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to wishlist logic
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                  {template.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary">{template.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">
                      {parseFloat(template.rating || "0").toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${template.price}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplateClick?.(template);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPurchase?.(template);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}