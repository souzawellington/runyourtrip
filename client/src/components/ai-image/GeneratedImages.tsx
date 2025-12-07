import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { GeneratedImage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function GeneratedImages() {
  const { toast } = useToast();
  
  const { data: images = [], isLoading } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/generated-images"],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `run-your-trip-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded Successfully",
        description: "Image has been downloaded to your device.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (imageUrl: string, prompt: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Run Your Trip - ${prompt}`,
          text: `Check out this AI-generated travel image: ${prompt}`,
          url: imageUrl,
        });
      } catch (error) {
        // User cancelled the share
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(imageUrl);
        toast({
          title: "Link Copied",
          description: "Image URL has been copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Failed to copy image URL. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownloadAll = async () => {
    for (const image of images) {
      await handleDownload(image.imageUrl, image.prompt);
      // Add a small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Generated Images</h3>
          {images.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAll}
              className="text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading images...</p>
            </div>
          </div>
        )}

        {!isLoading && images.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg mb-2">No images generated yet</p>
            <p className="text-sm">Create your first AI-generated image above</p>
          </div>
        )}

        {!isLoading && images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.map((image) => (
              <div key={image.id} className="bg-gray-50 rounded-lg overflow-hidden group hover:shadow-lg transition-shadow">
                <img
                  src={image.imageUrl}
                  alt={image.prompt}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 truncate pr-2">
                      {image.prompt}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(image.createdAt!), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {image.size}
                      </Badge>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {image.style}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(image.imageUrl, image.prompt)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare(image.imageUrl, image.prompt)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}