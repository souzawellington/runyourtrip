import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Database, 
  Shield, 
  Zap, 
  Server,
  Activity,
  Download,
  Clock,
  Users,
  FileText,
  TrendingUp
} from 'lucide-react';

interface SystemHealthReport {
  timestamp: string;
  overallStatus: 'healthy' | 'warning' | 'critical';
  summary: {
    score: number;
    status: string;
    uptime: string;
    lastUpdated: string;
  };
  database: {
    status: 'healthy' | 'warning' | 'critical';
    connectionTime: number;
    tables: {
      name: string;
      recordCount: number;
      status: string;
    }[];
    performance: {
      avgQueryTime: number;
      slowQueries: number;
    };
  };
  system: {
    status: 'healthy' | 'warning' | 'critical';
    memory: {
      used: string;
      total: string;
      percentage: number;
    };
    cpu: {
      usage: number;
      loadAverage: number[];
    };
    disk: {
      usage: string;
      available: string;
    };
  };
  api: {
    status: 'healthy' | 'warning' | 'critical';
    integrations: {
      name: string;
      configured: boolean;
      status: string;
    }[];
    endpoints: {
      path: string;
      method: string;
      status: string;
      avgResponseTime: number;
    }[];
  };
  security: {
    status: 'healthy' | 'warning' | 'critical';
    features: {
      name: string;
      enabled: boolean;
      description: string;
    }[];
    recommendations: string[];
  };
  performance: {
    status: 'healthy' | 'warning' | 'critical';
    metrics: {
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      avgResponseTime: number;
      requestsPerMinute: number;
    };
    trends: {
      period: string;
      requests: number;
      errors: number;
      avgTime: number;
    }[];
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    action: string;
  }[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'critical':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Activity className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'bg-green-500';
    case 'warning':  
      return 'bg-yellow-500';
    case 'critical':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Badge variant="destructive">High</Badge>;
    case 'medium':
      return <Badge variant="secondary">Medium</Badge>;
    case 'low':
      return <Badge variant="outline">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

export default function HealthReport() {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: report, isLoading, refetch } = useQuery<SystemHealthReport>({
    queryKey: ['/api/health/report'],
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await refetch();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `health-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Health Report</h1>
            <p className="text-muted-foreground">Comprehensive system diagnostics and monitoring</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health Report</h1>
          <p className="text-muted-foreground">Comprehensive system diagnostics and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleDownloadReport}
            variant="outline"
            disabled={!report}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Refresh Report'}
          </Button>
        </div>
      </div>

      {report && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(report.overallStatus)}
                Overall System Health
              </CardTitle>
              <CardDescription>
                Last updated: {report.summary.lastUpdated}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{report.summary.score}</div>
                  <div className="text-sm text-muted-foreground">Health Score</div>
                  <Progress value={report.summary.score} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">{report.summary.status}</div>
                  <div className="text-sm text-muted-foreground">Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">{report.summary.uptime}</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">
                    {report.database.tables.reduce((sum, table) => sum + table.recordCount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Records</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Database Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database
                  {getStatusIcon(report.database.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Connection Time:</span>
                  <span className="font-medium">{report.database.connectionTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Query Time:</span>
                  <span className="font-medium">{report.database.performance.avgQueryTime.toFixed(1)}ms</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Tables:</h4>
                  {report.database.tables.map((table) => (
                    <div key={table.name} className="flex justify-between text-sm">
                      <span className="capitalize">{table.name}:</span>
                      <span className="font-medium">{table.recordCount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Resources
                  {getStatusIcon(report.system.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Memory Usage:</span>
                    <span className="font-medium">{report.system.memory.percentage}%</span>
                  </div>
                  <Progress value={report.system.memory.percentage} />
                  <div className="text-xs text-muted-foreground mt-1">
                    {report.system.memory.used} / {report.system.memory.total}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>CPU Usage:</span>
                  <span className="font-medium">{report.system.cpu.usage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Load Average:</span>
                  <span className="font-medium">{report.system.cpu.loadAverage[0].toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* API Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  API Integrations
                  {getStatusIcon(report.api.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.api.integrations.map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between">
                    <span className="text-sm">{integration.name}:</span>
                    <Badge variant={integration.configured ? "default" : "secondary"}>
                      {integration.configured ? 'Configured' : 'Not Set'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                  {getStatusIcon(report.security.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.security.features.slice(0, 4).map((feature) => (
                  <div key={feature.name} className="flex items-center justify-between">
                    <span className="text-sm">{feature.name}:</span>
                    <Badge variant={feature.enabled ? "default" : "destructive"}>
                      {feature.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance
                  {getStatusIcon(report.performance.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Requests:</span>
                  <span className="font-medium">{report.performance.metrics.totalRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success Rate:</span>
                  <span className="font-medium">
                    {report.performance.metrics.totalRequests > 0 
                      ? ((report.performance.metrics.successfulRequests / report.performance.metrics.totalRequests) * 100).toFixed(1)
                      : 100}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Response:</span>
                  <span className="font-medium">{report.performance.metrics.avgResponseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Requests/Min:</span>
                  <span className="font-medium">{report.performance.metrics.requestsPerMinute}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Users:</span>
                  </div>
                  <span className="font-medium">
                    {report.database.tables.find(t => t.name === 'users')?.recordCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Templates:</span>
                  </div>
                  <span className="font-medium">
                    {report.database.tables.find(t => t.name === 'templates')?.recordCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Sessions:</span>
                  </div>
                  <span className="font-medium">
                    {report.database.tables.find(t => t.name === 'sessions')?.recordCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Uptime:</span>
                  </div>
                  <span className="font-medium">{report.summary.uptime}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Sections */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* API Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.api.endpoints.map((endpoint) => (
                    <div key={endpoint.path} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium text-sm">{endpoint.method} {endpoint.path}</div>
                        <div className="text-xs text-muted-foreground">
                          Avg response: {endpoint.avgResponseTime}ms
                        </div>
                      </div>
                      <Badge variant={endpoint.status === 'active' ? 'default' : 'secondary'}>
                        {endpoint.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle>Security Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.security.features.map((feature) => (
                    <div key={feature.name} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{feature.name}</span>
                        <Badge variant={feature.enabled ? 'default' : 'destructive'}>
                          {feature.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Suggested improvements to optimize system performance and security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{rec.title}</h4>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(rec.priority)}
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                      <p className="text-sm font-medium">Action: {rec.action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}