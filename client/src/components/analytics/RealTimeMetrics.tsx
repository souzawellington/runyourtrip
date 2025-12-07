import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Clock, Eye, Download, Users, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface RealTimeEvent {
  id: number;
  eventType: string;
  eventData: any;
  createdAt: string;
  templateId?: number;
}

export function RealTimeMetrics() {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { data: realTimeData, refetch } = useQuery({
    queryKey: ["/api/analytics/realtime"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentEvents } = useQuery({
    queryKey: ["/api/analytics/events"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'view': return <Eye size={16} className="text-blue-500" />;
      case 'download': return <Download size={16} className="text-green-500" />;
      case 'generate': return <Zap size={16} className="text-purple-500" />;
      case 'share': return <Users size={16} className="text-orange-500" />;
      default: return <Activity size={16} className="text-gray-500" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'view': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'download': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'generate': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'share': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Status */}
      <Card className="border border-green-200 bg-green-50 dark:bg-green-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-800 dark:text-green-200 font-medium">Live Analytics</span>
            </div>
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <Clock size={16} />
              <span className="text-sm">Updated {formatTime(lastUpdate.toISOString())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Views</p>
                <p className="text-2xl font-bold">{realTimeData?.todayViews || 0}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  <TrendingUp size={12} className="mr-1" />
                  Real-time
                </Badge>
              </div>
              <Eye className="text-blue-500" size={32} />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-300" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Downloads</p>
                <p className="text-2xl font-bold">{realTimeData?.todayDownloads || 0}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  <TrendingUp size={12} className="mr-1" />
                  Real-time
                </Badge>
              </div>
              <Download className="text-green-500" size={32} />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-300" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">AI Generations</p>
                <p className="text-2xl font-bold">{realTimeData?.todayGenerations || 0}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  <Zap size={12} className="mr-1" />
                  Real-time
                </Badge>
              </div>
              <Zap className="text-purple-500" size={32} />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-300" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                <p className="text-2xl font-bold">{realTimeData?.activeSessions || 0}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  <Users size={12} className="mr-1" />
                  Real-time
                </Badge>
              </div>
              <Users className="text-orange-500" size={32} />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-300" />
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity size={20} />
            <span>Live Activity Feed</span>
            <Badge variant="secondary" className="ml-auto">
              Auto-refresh
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentEvents && recentEvents.length > 0 ? (
              recentEvents.slice(0, 10).map((event: RealTimeEvent) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getEventIcon(event.eventType)}
                    <div>
                      <p className="text-sm font-medium">
                        {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} Event
                      </p>
                      {event.eventData && (
                        <p className="text-xs text-muted-foreground">
                          {event.eventData.type || event.eventData.prompt?.substring(0, 30) + "..." || "User activity"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-xs ${getEventColor(event.eventType)}`}>
                      {event.eventType}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(event.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity size={48} className="mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-xs">Events will appear here in real-time</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {realTimeData?.todayViews && realTimeData?.activeSessions 
                  ? Math.round(realTimeData.todayViews / Math.max(realTimeData.activeSessions, 1)) 
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg Views per Session</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {realTimeData?.todayViews && realTimeData?.todayDownloads 
                  ? ((realTimeData.todayDownloads / Math.max(realTimeData.todayViews, 1)) * 100).toFixed(1)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Today's Conversion Rate</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {realTimeData?.todayGenerations || 0}
              </div>
              <div className="text-sm text-muted-foreground">AI Generations Today</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}