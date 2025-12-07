import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TemplateCard from "./template-card";

export default function TemplateGallery() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  const featuredTemplates = (templates || []).filter((t: any) => t.status === "live").slice(0, 6);

  if (isLoading) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="w-full h-48 bg-gray-200" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-200 rounded w-1/3" />
                      <div className="h-6 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-text-dark">Template Gallery</h2>
            <p className="text-muted-foreground mt-2">Explore successful templates from the Run Your Trip ecosystem</p>
          </div>
          <Button className="bg-primary hover:bg-blue-600 text-white">
            <Plus size={16} className="mr-2" />
            Add to Gallery
          </Button>
        </div>
        
        {featuredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No templates in gallery yet</div>
            <p className="text-sm text-muted-foreground">Generate your first template to see it here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map((template: any) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
