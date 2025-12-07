import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedCharts } from "@/components/analytics/AdvancedCharts";
import { RealTimeMetrics } from "@/components/analytics/RealTimeMetrics";
import { Eye, Download, DollarSign, TrendingUp, Users, Star, Activity, BarChart3, Zap } from "lucide-react";
import SEO from "@/components/seo";

export default function Analytics() {
  const { data: dailyStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/daily"],
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
  });

  const { data: weeklyRevenueData } = useQuery({
    queryKey: ["/api/analytics/weekly-revenue"],
  });

  const { data: advancedAnalytics, isLoading: advancedLoading } = useQuery({
    queryKey: ["/api/analytics/advanced"],
  });

  const { data: realTimeData } = useQuery({
    queryKey: ["/api/analytics/realtime"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: comparisonData } = useQuery({
    queryKey: ["/api/analytics/comparison/week"],
  });

  const templatesArray = Array.isArray(templates) ? templates : [];
  const totalTemplates = templatesArray.length;
  const liveTemplates = templatesArray.filter((t: any) => t.status === "live").length;
  const totalSales = templatesArray.reduce((sum: number, t: any) => sum + (t.sales || 0), 0);
  const totalRevenue = templatesArray.reduce((sum: number, t: any) => sum + parseFloat(t.revenue || "0"), 0);
  const avgRating = templatesArray.length > 0 
    ? (templatesArray.reduce((sum: number, t: any) => sum + parseFloat(t.rating || "0"), 0) / templatesArray.length).toFixed(1)
    : "0.0";
  const conversionRate = totalTemplates > 0 ? ((totalSales / totalTemplates) * 100).toFixed(1) : "0";

  // Mock chart data
  const revenueData = [
    { name: 'Jan', revenue: 1200 },
    { name: 'Feb', revenue: 1900 },
    { name: 'Mar', revenue: 3000 },
    { name: 'Apr', revenue: 2500 },
    { name: 'May', revenue: 4200 },
    { name: 'Jun', revenue: 3800 },
  ];

  const topTemplates = templatesArray.slice(0, 5).sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0));

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Template Views",
      value: (dailyStats as any)?.views?.toLocaleString() || "0",
      change: "+8%",
      trend: "up", 
      icon: Eye,
      color: "text-primary"
    },
    {
      title: "Total Downloads",
      value: (dailyStats as any)?.downloads?.toLocaleString() || "0",
      change: "+15%",
      trend: "up",
      icon: Download,
      color: "text-accent"
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      change: "+3%",
      trend: "up",
      icon: TrendingUp,
      color: "text-secondary"
    },
    {
      title: "Active Templates",
      value: liveTemplates.toString(),
      change: "+2",
      trend: "up",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Average Rating",
      value: avgRating,
      change: "+0.2",
      trend: "up",
      icon: Star,
      color: "text-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-dark mb-4">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Track your template performance and revenue insights with real-time data
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 size={16} />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center space-x-2">
              <TrendingUp size={16} />
              <span>Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center space-x-2">
              <Zap size={16} />
              <span>Real-time</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <Activity size={16} />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <Badge variant="outline" className={`${stat.color} border-current`}>
                        {stat.change}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-opacity-10 flex items-center justify-center ${stat.color.replace('text-', 'bg-')}/10`}>
                    <stat.icon className={stat.color} size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end justify-between h-32">
                  {revenueData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-primary/60 rounded-t hover:bg-primary transition-colors cursor-pointer mb-2" 
                        style={{ height: `${(item.revenue / 5000) * 100}%` }}
                        title={`${item.name}: $${item.revenue}`}
                      />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">This month</span>
                    <span className="font-semibold text-success">+12% increase</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Templates */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Top Performing Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTemplates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates yet
                  </div>
                ) : (
                  topTemplates.map((template: any, index: number) => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-muted-foreground">{template.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{template.sales} sales</p>
                        <p className="text-xs text-muted-foreground">${template.revenue}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="border border-gray-200 shadow-sm mt-8">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{totalTemplates}</div>
                <div className="text-sm text-muted-foreground">Total Templates</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(liveTemplates / Math.max(totalTemplates, 1)) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {liveTemplates} live templates
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">{totalSales}</div>
                <div className="text-sm text-muted-foreground">Total Sales</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-success h-2 rounded-full" 
                    style={{ width: `${Math.min((totalSales / 100) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ${totalRevenue.toFixed(2)} revenue
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">{avgRating}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
                <div className="flex justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      size={16}
                      className={`${parseFloat(avgRating) >= star ? 'text-accent fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Based on all templates
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {advancedAnalytics && realTimeData && comparisonData ? (
              <AdvancedCharts 
                data={advancedAnalytics}
                realTimeData={realTimeData}
                comparisonData={comparisonData}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Loading advanced analytics...</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <RealTimeMetrics />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Template Performance Report</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Comprehensive analysis of all your templates
                    </p>
                    <Badge variant="outline">Coming Soon</Badge>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Revenue Analytics Report</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Detailed breakdown of revenue streams
                    </p>
                    <Badge variant="outline">Coming Soon</Badge>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">User Engagement Report</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      User behavior and engagement metrics
                    </p>
                    <Badge variant="outline">Coming Soon</Badge>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
