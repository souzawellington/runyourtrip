import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Eye, Download, DollarSign, Users, Clock, Activity } from "lucide-react";
import { useState } from "react";

interface AdvancedChartsProps {
  data: {
    overview: any;
    templatePerformance: any[];
    dailyMetrics: any[];
    sessionAnalytics: any;
  };
  realTimeData: any;
  comparisonData: any;
}

export function AdvancedCharts({ data, realTimeData, comparisonData }: AdvancedChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedChart, setSelectedChart] = useState("revenue");

  // Prepare chart data
  const revenueChartData = data.dailyMetrics.map((metric, index) => ({
    name: `Day ${index + 1}`,
    revenue: parseFloat(metric.revenue || "0"),
    views: metric.views || 0,
    downloads: metric.downloads || 0,
    date: new Date(metric.date).toLocaleDateString(),
  }));

  const templatePerformanceData = data.templatePerformance.slice(0, 10).map(template => ({
    name: template.templateName?.substring(0, 15) + "..." || "Unnamed",
    revenue: parseFloat(template.totalRevenue || "0"),
    views: template.totalViews || 0,
    downloads: template.totalDownloads || 0,
    conversionRate: parseFloat(template.avgConversionRate || "0"),
  }));

  const pieChartData = [
    { name: 'Views', value: data.overview.totalViews, color: '#0070F3' },
    { name: 'Downloads', value: data.overview.totalDownloads, color: '#7C3AED' },
    { name: 'Conversions', value: Math.round(data.overview.totalViews * (parseFloat(data.overview.conversionRate) / 100)), color: '#10B981' },
  ];

  const growthData = [
    { 
      name: 'Current Period', 
      revenue: parseFloat(comparisonData?.current?.revenue || "0"),
      views: comparisonData?.current?.views || 0,
      downloads: comparisonData?.current?.downloads || 0
    },
    { 
      name: 'Previous Period', 
      revenue: parseFloat(comparisonData?.previous?.revenue || "0"),
      views: comparisonData?.previous?.views || 0,
      downloads: comparisonData?.previous?.downloads || 0
    },
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Today's Views</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{realTimeData?.todayViews || 0}</p>
              </div>
              <Eye className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-200 bg-purple-50 dark:bg-purple-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Today's Downloads</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{realTimeData?.todayDownloads || 0}</p>
              </div>
              <Download className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">AI Generations</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{realTimeData?.todayGenerations || 0}</p>
              </div>
              <Activity className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Active Sessions</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{realTimeData?.activeSessions || 0}</p>
              </div>
              <Users className="text-orange-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <div className="flex gap-2">
          <Select value={selectedChart} onValueChange={setSelectedChart}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue Trends</SelectItem>
              <SelectItem value="performance">Template Performance</SelectItem>
              <SelectItem value="conversion">Conversion Analysis</SelectItem>
              <SelectItem value="growth">Period Comparison</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Growth Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className="text-lg font-semibold">${comparisonData?.current?.revenue || "0"}</p>
              </div>
              <div className="flex items-center">
                {parseFloat(comparisonData?.growth?.revenue || "0") >= 0 ? (
                  <TrendingUp className="text-green-500 mr-1" size={16} />
                ) : (
                  <TrendingDown className="text-red-500 mr-1" size={16} />
                )}
                <Badge 
                  variant={parseFloat(comparisonData?.growth?.revenue || "0") >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {comparisonData?.growth?.revenue || "0"}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Views Growth</p>
                <p className="text-lg font-semibold">{comparisonData?.current?.views || 0}</p>
              </div>
              <div className="flex items-center">
                {parseFloat(comparisonData?.growth?.views || "0") >= 0 ? (
                  <TrendingUp className="text-green-500 mr-1" size={16} />
                ) : (
                  <TrendingDown className="text-red-500 mr-1" size={16} />
                )}
                <Badge 
                  variant={parseFloat(comparisonData?.growth?.views || "0") >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {comparisonData?.growth?.views || "0"}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-lg font-semibold">{data.overview.conversionRate}%</p>
              </div>
              <div className="flex items-center">
                <Activity className="text-blue-500 mr-1" size={16} />
                <Badge variant="outline" className="text-xs">
                  {data.overview.activeTemplates} active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends Chart */}
        {selectedChart === "revenue" && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue & Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1" 
                    stroke="#0070F3" 
                    fill="#0070F3" 
                    fillOpacity={0.3}
                    name="Revenue ($)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="views" 
                    stroke="#7C3AED" 
                    strokeWidth={2}
                    name="Views"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="downloads" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Downloads"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Template Performance Chart */}
        {selectedChart === "performance" && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Template Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={templatePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0070F3" name="Revenue ($)" />
                  <Bar dataKey="views" fill="#7C3AED" name="Views" />
                  <Bar dataKey="downloads" fill="#10B981" name="Downloads" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Conversion Analysis */}
        {selectedChart === "conversion" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Engagement Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Views</span>
                  <span className="font-semibold">{data.overview.totalViews}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "100%" }} />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Downloads</span>
                  <span className="font-semibold">{data.overview.totalDownloads}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ 
                      width: `${data.overview.totalViews > 0 ? (data.overview.totalDownloads / data.overview.totalViews) * 100 : 0}%` 
                    }} 
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Revenue</span>
                  <span className="font-semibold">${data.overview.totalRevenue}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${data.overview.conversionRate}%` }} 
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Growth Comparison */}
        {selectedChart === "growth" && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Period-over-Period Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0070F3" name="Revenue ($)" />
                  <Bar dataKey="views" fill="#7C3AED" name="Views" />
                  <Bar dataKey="downloads" fill="#10B981" name="Downloads" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}