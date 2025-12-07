import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import TemplateCard from "@/components/templates/template-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/marketplace/templates"],
  });

  const templatesArray = Array.isArray(templates) ? templates : [];
  const filteredTemplates = templatesArray.filter((template: any) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const sortedTemplates = [...filteredTemplates].sort((a: any, b: any) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "popular":
        return b.sales - a.sales;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-dark mb-4">Template Library</h1>
          <p className="text-muted-foreground text-lg">
            Browse and manage your AI-generated website templates
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse" />
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3 mb-4" />
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : sortedTemplates.length === 0 ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground mb-4">No templates found</div>
              <p className="text-sm text-muted-foreground">
                {searchTerm || selectedCategory 
                  ? "Try adjusting your filters or search terms"
                  : "Generate your first template to get started!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTemplates.map((template: any) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
