import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import TemplateReviews from "./template-reviews";
import { 
  ShoppingCart, 
  Eye, 
  Download,
  Star,
  Clock,
  User,
  Code,
  Globe,
  Shield,
  Zap
} from "lucide-react";
import { format } from "date-fns";

interface TemplateDetailModalProps {
  template: any;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (templateId: number) => void;
  onPreview: (template: any) => void;
}

export default function TemplateDetailModal({
  template,
  isOpen,
  onClose,
  onPurchase,
  onPreview,
}: TemplateDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!template) return null;

  const features = [
    { icon: Code, label: "Clean Code", description: "Well-structured and documented" },
    { icon: Globe, label: "Responsive", description: "Works on all devices" },
    { icon: Shield, label: "Secure", description: "Best security practices" },
    { icon: Zap, label: "Fast", description: "Optimized performance" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left side - Template Preview */}
          <div className="w-1/2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
            {template.imageThumbnailUrl ? (
              <img
                src={template.imageThumbnailUrl}
                alt={template.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                <Globe className="h-16 w-16 text-gray-400" />
              </div>
            )}
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-3">{template.name}</h3>
                <p className="text-muted-foreground mb-4">{template.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{template.category}</Badge>
                    {template.featured && (
                      <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold">${template.price}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="ml-1 font-semibold">
                        {template.rating > 0 ? parseFloat(template.rating).toFixed(1) : "N/A"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <div className="font-semibold">{template.downloads || 0}</div>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                  </div>
                  <div>
                    <div className="font-semibold">{template.sales || 0}</div>
                    <p className="text-xs text-muted-foreground">Sales</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => onPurchase(template.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase Now
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onPreview(template)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Live Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Details and Reviews */}
          <div className="w-1/2 flex flex-col">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle>Template Details</DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="mx-6 mt-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-6 pb-6">
                <TabsContent value="overview" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">About This Template</h3>
                      <p className="text-muted-foreground">
                        {template.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Template Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Created by User #{template.userId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Added {format(new Date(template.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Last updated {format(new Date(template.updatedAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {template.tags && template.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="features" className="mt-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Key Features</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{feature.label}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {feature.description}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-4">
                  <TemplateReviews
                    templateId={template.id}
                    templateName={template.name}
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}