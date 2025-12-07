import { useState } from "react";
import { Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface FilterOptions {
  category: string;
  priceRange: [number, number];
  sortBy: string;
}

interface MarketplaceFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
}

export function MarketplaceFilters({ onFilterChange, categories }: MarketplaceFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    category: "all",
    priceRange: [0, 500],
    sortBy: "relevance"
  });

  const handleCategoryChange = (value: string) => {
    const newFilters = { ...filters, category: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: value as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    const newFilters = { ...filters, sortBy: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      category: "all",
      priceRange: [0, 500] as [number, number],
      sortBy: "relevance"
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between mb-6 p-4 bg-card rounded-lg border">
      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap gap-4 items-center flex-1">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Label htmlFor="category">Category:</Label>
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category" className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-2">
          <Label>Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Label>
          <div className="w-[200px]">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              max={500}
              step={10}
              className="w-full"
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <Label htmlFor="sort">Sort by:</Label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger id="sort" className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={resetFilters} size="sm">
          Reset Filters
        </Button>
      </div>

      {/* Mobile Filter Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Templates</SheetTitle>
              <SheetDescription>
                Adjust filters to find the perfect template
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="mobile-category">Category</Label>
                <Select value={filters.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="mobile-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label>
                  Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </Label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={handlePriceChange}
                  max={500}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label htmlFor="mobile-sort">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger id="mobile-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={resetFilters} variant="outline" className="w-full">
                Reset Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        <SortAsc className="h-4 w-4 inline mr-1" />
        Sorted by {filters.sortBy}
      </div>
    </div>
  );
}