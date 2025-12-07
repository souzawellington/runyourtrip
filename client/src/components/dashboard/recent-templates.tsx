import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function RecentTemplates() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  const recentTemplates = templates?.slice(0, 4) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-success/10 text-success border-success/20">Live</Badge>;
      case "deploying":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Deploying</Badge>;
      case "draft":
        return <Badge className="bg-gray/10 text-gray-600 border-gray/20">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-dark">Recent Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-32 bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-dark">Recent Templates</h2>
          <Link href="/templates">
            <Button variant="ghost" className="text-primary hover:text-blue-600 text-sm font-medium">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentTemplates.map((template: any) => (
            <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={template.preview || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300"} 
                alt={template.name}
                className="w-full h-32 object-cover" 
              />
              <div className="p-4">
                <h3 className="font-medium mb-2">{template.name}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{formatTimeAgo(template.createdAt)}</span>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(template.status)}
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      ${template.price}
                    </Badge>
                  </div>
                </div>
                {template.status === "live" && template.deploymentUrl && (
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => window.open(template.deploymentUrl, '_blank')}
                    >
                      <ExternalLink size={12} className="mr-1" />
                      View Live
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
