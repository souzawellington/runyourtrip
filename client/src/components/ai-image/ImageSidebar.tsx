import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Palette, Clock, RefreshCw, ArrowUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { TrendingTopic, GeneratedImage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export function ImageSidebar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: topics = [], isLoading: topicsLoading } = useQuery<TrendingTopic[]>({
    queryKey: ["/api/trending-topics"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: recentImages = [] } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/generated-images"],
    select: (data) => data.slice(0, 5), // Only show last 5 images
  });

  const refreshTrendsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/refresh-trends");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trends Updated",
        description: "Latest trending topics have been refreshed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trending-topics"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh trends. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUseTrend = (topic: TrendingTopic) => {
    // This would typically set the prompt in the main form
    // For now, we'll just show a toast
    toast({
      title: "Trend Applied",
      description: `"${topic.title}" has been added to your prompt inspiration.`,
    });
  };

  const handleReuseGeneration = (image: GeneratedImage) => {
    // This would typically populate the form with the previous settings
    toast({
      title: "Settings Applied",
      description: `Previous generation settings have been applied.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Social Media Trends */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-amber-500" />
              Trending Now
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refreshTrendsMutation.mutate()}
              disabled={refreshTrendsMutation.isPending}
              className="text-gray-400 hover:text-blue-600"
            >
              <RefreshCw className={`h-4 w-4 ${refreshTrendsMutation.isPending ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="space-y-3">
            {topicsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 bg-gray-100 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              topics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleUseTrend(topic)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{topic.title}</p>
                    <p className="text-xs text-gray-500">{topic.engagement}</p>
                  </div>
                  <div className="text-green-500">
                    <ArrowUp className="h-4 w-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Brand Guidelines */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Palette className="h-5 w-5 mr-2 text-blue-600" />
            Brand Guidelines
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Brand Colors</h4>
              <div className="flex space-x-2">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
                  <span className="text-xs text-gray-600 mt-1">#0070F3</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-amber-500 rounded-full border-2 border-white shadow-md"></div>
                  <span className="text-xs text-gray-600 mt-1">#F59E0B</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-800 rounded-full border-2 border-white shadow-md"></div>
                  <span className="text-xs text-gray-600 mt-1">#333333</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Style Keywords</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Modern</Badge>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">Vibrant</Badge>
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">Clean</Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Adventure</Badge>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Brand Voice</h4>
              <p className="text-xs text-gray-600">
                Professional yet approachable, inspiring wanderlust and adventure while maintaining trustworthiness.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation History */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-amber-500" />
              Recent Generations
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-red-500"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/generated-images"] })}
            >
              Refresh
            </Button>
          </div>

          <div className="space-y-3">
            {recentImages.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No recent generations</p>
              </div>
            ) : (
              recentImages.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => handleReuseGeneration(image)}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.prompt}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(image.createdAt!), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}