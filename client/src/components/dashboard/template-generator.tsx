import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wand2, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TEMPLATE_CATEGORIES, PRICE_RANGES } from "@/lib/constants";
import brandingImage from "@assets/A_digital_composite_image_showcases_a_young_Africa_1750793838654.png";

export default function TemplateGenerator() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async (data: { description: string; category: string; targetPrice: string }) => {
      const response = await apiRequest("POST", "/api/generate-template", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Template Generated Successfully!",
        description: `${data.template.name} has been created and is ready for deployment.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setDescription("");
      setCategory("");
      setPriceRange("");
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description for your template.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      description,
      category: category || "Portfolio",
      targetPrice: priceRange || "$49-$99",
    });
  };

  return (
    <Card className="border border-gray-200 shadow-sm relative overflow-hidden">
      {/* Background Branding Image */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
        <img 
          src={brandingImage} 
          alt="Run Your Trip branding" 
          className="w-full h-full object-cover" 
        />
      </div>
      
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">AI Template Generator</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <Bot size={14} className="mr-1" />
            AI Powered
          </Badge>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
              Describe Your Website Template
            </Label>
            <Textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-32 resize-none" 
              placeholder="Create a responsive personal portfolio site with a blog section, project gallery, contact form, dark mode toggle, and modern minimalist design. Use blue and orange as primary colors..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 block">
                Template Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-2 block">
                Price Range
              </Label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full bg-primary hover:bg-blue-600 text-white py-4 h-auto"
          >
            {generateMutation.isPending ? (
              <>
                <Bot className="mr-2 animate-spin" size={16} />
                Generating Template...
              </>
            ) : (
              <>
                <Wand2 className="mr-2" size={16} />
                Generate & Deploy Template
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
