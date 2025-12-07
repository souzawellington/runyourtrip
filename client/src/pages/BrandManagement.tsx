import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Palette, Type, Image, Settings, History, Eye, Upload, Check, X, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface BrandAsset {
  id: number;
  name: string;
  type: string;
  category: string;
  value: string;
  metadata?: any;
  filePath?: string;
  isActive: boolean;
}

interface BrandConfiguration {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  config: any;
  createdAt: string;
}

export default function BrandManagement() {
  const [selectedConfig, setSelectedConfig] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);

  // Fetch brand assets
  const { data: assets, isLoading: assetsLoading } = useQuery<BrandAsset[]>({
    queryKey: ['/api/brand/assets'],
  });

  // Fetch brand configurations
  const { data: configurations, isLoading: configsLoading } = useQuery<BrandConfiguration[]>({
    queryKey: ['/api/brand/configurations'],
  });

  // Fetch active configuration
  const { data: activeConfig } = useQuery<BrandConfiguration>({
    queryKey: ['/api/brand/configurations/active'],
  });

  // Initialize brand assets mutation
  const initializeBrand = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/brand/initialize', 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/brand/configurations'] });
      toast({
        title: "Brand assets initialized",
        description: "New brand identity has been loaded successfully",
      });
    },
  });

  // Apply configuration mutation
  const applyConfiguration = useMutation({
    mutationFn: async (configurationId: number) => {
      return await apiRequest('/api/brand/configurations/apply', 'POST', { configurationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand/configurations/active'] });
      toast({
        title: "Configuration applied",
        description: "Brand configuration has been applied successfully",
      });
      setPreviewMode(false);
    },
  });

  // Group assets by type
  const groupedAssets = assets?.reduce((acc, asset) => {
    if (!acc[asset.type]) acc[asset.type] = [];
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<string, BrandAsset[]>) || {};

  const ColorSwatch = ({ color }: { color: BrandAsset }) => (
    <div className="group cursor-pointer">
      <div 
        className="w-full h-20 rounded-lg shadow-sm border border-border transition-all group-hover:scale-105"
        style={{ backgroundColor: color.value }}
      />
      <div className="mt-2">
        <p className="text-sm font-medium">{color.name}</p>
        <p className="text-xs text-muted-foreground">{color.value}</p>
        {color.metadata?.rgb && (
          <p className="text-xs text-muted-foreground">RGB: {color.metadata.rgb}</p>
        )}
      </div>
    </div>
  );

  const FontDisplay = ({ font }: { font: BrandAsset }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div style={{ fontFamily: font.value }}>
          <h3 className="text-lg font-semibold mb-2">{font.name}</h3>
          <p className="text-sm mb-2">The quick brown fox jumps over the lazy dog</p>
          <p className="text-xs text-muted-foreground">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
          <p className="text-xs text-muted-foreground">abcdefghijklmnopqrstuvwxyz</p>
          <p className="text-xs text-muted-foreground">0123456789</p>
        </div>
        <Badge variant="outline" className="mt-3">{font.category}</Badge>
      </CardContent>
    </Card>
  );

  const LogoDisplay = ({ logo }: { logo: BrandAsset }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg flex items-center justify-center mb-3">
          {logo.filePath ? (
            <img 
              src={logo.filePath} 
              alt={logo.name}
              className="max-w-full max-h-full object-contain p-4"
            />
          ) : (
            <Image className="w-12 h-12 text-muted-foreground" />
          )}
        </div>
        <h4 className="font-medium text-sm">{logo.name}</h4>
        <Badge variant="outline" className="mt-2">{logo.category}</Badge>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Brand Redesign Platform</h1>
          <p className="text-muted-foreground mt-1">Manage and apply brand identity across the platform</p>
        </div>
        <div className="flex gap-2">
          {!assets?.length && (
            <Button onClick={() => initializeBrand.mutate()} variant="default">
              <Upload className="mr-2 h-4 w-4" />
              Initialize Brand Assets
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {comparisonMode ? 'Hide' : 'Show'} Comparison
          </Button>
          <Button 
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? 'Exit' : 'Enter'} Preview
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Assets */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Brand Assets</CardTitle>
              <CardDescription>Current brand elements and design resources</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="colors" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="colors">
                    <Palette className="mr-2 h-4 w-4" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="typography">
                    <Type className="mr-2 h-4 w-4" />
                    Typography
                  </TabsTrigger>
                  <TabsTrigger value="logos">
                    <Image className="mr-2 h-4 w-4" />
                    Logos
                  </TabsTrigger>
                  <TabsTrigger value="all">
                    <Settings className="mr-2 h-4 w-4" />
                    All Assets
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Primary Colors</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {groupedAssets.color?.filter(c => c.category === 'primary').map(color => (
                        <ColorSwatch key={color.id} color={color} />
                      ))}
                    </div>
                    
                    <h3 className="text-sm font-semibold text-muted-foreground mt-6">Accent Colors</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {groupedAssets.color?.filter(c => c.category === 'accent').map(color => (
                        <ColorSwatch key={color.id} color={color} />
                      ))}
                    </div>
                    
                    <h3 className="text-sm font-semibold text-muted-foreground mt-6">Supporting Colors</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {groupedAssets.color?.filter(c => c.category === 'supporting').map(color => (
                        <ColorSwatch key={color.id} color={color} />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="typography" className="mt-6">
                  <div className="space-y-4">
                    {groupedAssets.font?.map(font => (
                      <FontDisplay key={font.id} font={font} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="logos" className="mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {groupedAssets.logo?.map(logo => (
                      <LogoDisplay key={logo.id} logo={logo} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="all" className="mt-6">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {assets?.map(asset => (
                        <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {asset.type === 'color' && (
                              <div 
                                className="w-8 h-8 rounded border"
                                style={{ backgroundColor: asset.value }}
                              />
                            )}
                            <div>
                              <p className="font-medium">{asset.name}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                <span>{asset.type}</span>
                                <span>•</span>
                                <span>{asset.category}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={asset.isActive ? "default" : "secondary"}>
                            {asset.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-4">
          {/* Active Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Active Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeConfig ? (
                <div className="space-y-2">
                  <p className="font-medium">{activeConfig.name}</p>
                  <p className="text-sm text-muted-foreground">{activeConfig.description}</p>
                  <Badge variant="default">Active</Badge>
                </div>
              ) : (
                <p className="text-muted-foreground">No active configuration</p>
              )}
            </CardContent>
          </Card>

          {/* Configuration List */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Configurations</CardTitle>
              <CardDescription>Apply different brand versions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {configurations?.map(config => (
                    <div 
                      key={config.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedConfig === config.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedConfig(config.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{config.name}</p>
                        {config.isActive && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {new Date(config.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {selectedConfig && (
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => applyConfiguration.mutate(selectedConfig)}
                  >
                    Apply Configuration
                  </Button>
                  <Button size="sm" variant="outline">
                    Preview
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comparison Mode */}
          {comparisonMode && (
            <Card>
              <CardHeader>
                <CardTitle>Before & After</CardTitle>
                <CardDescription>Compare current vs new branding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Current</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="h-8 rounded" style={{ backgroundColor: '#0e7df7' }} />
                      <div className="h-8 rounded" style={{ backgroundColor: '#9c5cd4' }} />
                      <div className="h-8 rounded" style={{ backgroundColor: '#f5b800' }} />
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">New</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="h-8 rounded" style={{ backgroundColor: '#082567' }} />
                      <div className="h-8 rounded" style={{ backgroundColor: '#00D1CF' }} />
                      <div className="h-8 rounded" style={{ backgroundColor: '#B76E79' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}