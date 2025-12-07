import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Download,
  FileText,
  Globe,
  HardDrive,
  RefreshCw,
  Server,
  Shield,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/layout/header";

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  message: string;
  details?: any;
  timestamp: Date;
}

interface SystemHealthReport {
  generatedAt: Date;
  overallStatus: "healthy" | "degraded" | "unhealthy";
  checks: {
    database: HealthCheckResult;
    apiEndpoints: HealthCheckResult;
    externalServices: HealthCheckResult;
    serverResources: HealthCheckResult;
    security: HealthCheckResult;
    storage: HealthCheckResult;
    templates: HealthCheckResult;
  };
  metrics: {
    uptime: number;
    totalUsers: number;
    activeSessions: number;
    totalTemplates: number;
    recentErrors: number;
    successRate: number;
  };
}

export default function HealthDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const { data: healthReport, isLoading, error, refetch } = useQuery<SystemHealthReport>({
    queryKey: ["/api/health"],
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if enabled
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "unhealthy":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "healthy" ? "default" : status === "degraded" ? "secondary" : "destructive";
    return <Badge variant={variant} className="capitalize">{status}</Badge>;
  };

  const formatUptime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  const downloadReport = () => {
    if (!healthReport) return;
    
    const reportData = JSON.stringify(healthReport, null, 2);
    const blob = new Blob([reportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health-report-${format(new Date(), "yyyy-MM-dd-HH-mm-ss")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load health report. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">System Health Dashboard</h1>
              <p className="text-gray-600">
                Comprehensive overview of your platform's health and performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => window.location.href = '/health-report'}
                variant="default"
              >
                <FileText className="h-4 w-4 mr-2" />
                Full System Report
              </Button>
              <Button
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-blue-50" : ""}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                {autoRefresh ? "Auto-refreshing" : "Auto-refresh"}
              </Button>
              <Button onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Now
              </Button>
              <Button variant="outline" onClick={downloadReport} disabled={!healthReport}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : healthReport ? (
          <>
            {/* Overall Status Card */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(healthReport.overallStatus)}
                    <div>
                      <CardTitle>Overall System Status</CardTitle>
                      <CardDescription>
                        Last updated: {format(new Date(healthReport.generatedAt), "PPpp")}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(healthReport.overallStatus)}
                </div>
              </CardHeader>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Uptime</p>
                      <p className="text-2xl font-bold">{formatUptime(healthReport.metrics.uptime)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold">{healthReport.metrics.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Sessions</p>
                      <p className="text-2xl font-bold">{healthReport.metrics.activeSessions}</p>
                    </div>
                    <Activity className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Templates</p>
                      <p className="text-2xl font-bold">{healthReport.metrics.totalTemplates}</p>
                    </div>
                    <Zap className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Success Rate</p>
                      <p className="text-2xl font-bold">{healthReport.metrics.successRate}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Recent Errors</p>
                      <p className="text-2xl font-bold">{healthReport.metrics.recentErrors}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Health Checks */}
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Checks</TabsTrigger>
                <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Database Check */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Database className="h-5 w-5 text-gray-600" />
                          <CardTitle className="text-lg">Database</CardTitle>
                        </div>
                        {getStatusBadge(healthReport.checks.database.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{healthReport.checks.database.message}</p>
                      {healthReport.checks.database.details && (
                        <div className="text-xs text-gray-500">
                          <p>Response Time: {healthReport.checks.database.details.responseTime}ms</p>
                          <p>Total Connections: {healthReport.checks.database.details.poolStats?.totalConnections || 0}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* API Endpoints Check */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-5 w-5 text-gray-600" />
                          <CardTitle className="text-lg">API Endpoints</CardTitle>
                        </div>
                        {getStatusBadge(healthReport.checks.apiEndpoints.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{healthReport.checks.apiEndpoints.message}</p>
                    </CardContent>
                  </Card>

                  {/* External Services Check */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-gray-600" />
                          <CardTitle className="text-lg">External Services</CardTitle>
                        </div>
                        {getStatusBadge(healthReport.checks.externalServices.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{healthReport.checks.externalServices.message}</p>
                      {healthReport.checks.externalServices.details && (
                        <div className="text-xs text-gray-500">
                          {healthReport.checks.externalServices.details.map((service: any) => (
                            <p key={service.service}>{service.service}: {service.configured ? "✓" : "✗"}</p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Server Resources Check */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Server className="h-5 w-5 text-gray-600" />
                          <CardTitle className="text-lg">Server Resources</CardTitle>
                        </div>
                        {getStatusBadge(healthReport.checks.serverResources.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{healthReport.checks.serverResources.message}</p>
                      {healthReport.checks.serverResources.details && (
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Memory Usage</span>
                              <span>{healthReport.checks.serverResources.details.memory.usagePercent}</span>
                            </div>
                            <Progress 
                              value={parseInt(healthReport.checks.serverResources.details.memory.usagePercent)} 
                              className="h-2"
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            <p>CPU: {healthReport.checks.serverResources.details.cpu.cores} cores</p>
                            <p>Load Average: {healthReport.checks.serverResources.details.cpu.loadAverage}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Security Check */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5 text-gray-600" />
                          <CardTitle className="text-lg">Security</CardTitle>
                        </div>
                        {getStatusBadge(healthReport.checks.security.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{healthReport.checks.security.message}</p>
                      {healthReport.checks.security.details && (
                        <div className="text-xs text-gray-500">
                          <p>Active Sessions: {healthReport.checks.security.details.activeSessions}</p>
                          <p>Failed Logins: {healthReport.checks.security.details.failedLoginAttempts}</p>
                          <p>Rate Limiting: {healthReport.checks.security.details.rateLimitingEnabled ? "✓" : "✗"}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Storage Check */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <HardDrive className="h-5 w-5 text-gray-600" />
                          <CardTitle className="text-lg">Storage</CardTitle>
                        </div>
                        {getStatusBadge(healthReport.checks.storage.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{healthReport.checks.storage.message}</p>
                      {healthReport.checks.storage.details && (
                        <div className="text-xs text-gray-500">
                          <p>Database Size: {healthReport.checks.storage.details.database.size}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="infrastructure" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Database className="h-5 w-5 text-gray-600" />
                          <CardTitle className="text-lg">Database</CardTitle>
                        </div>
                        {getStatusBadge(healthReport.checks.database.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{healthReport.checks.database.message}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Server className="h-5 w-5 text-gray-600" />
                          <CardTitle className="text-lg">Server Resources</CardTitle>
                        </div>
                        {getStatusBadge(healthReport.checks.serverResources.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{healthReport.checks.serverResources.message}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-5 w-5 text-gray-600" />
                          <CardTitle className="text-lg">API Endpoints</CardTitle>
                        </div>
                        {getStatusBadge(healthReport.checks.apiEndpoints.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{healthReport.checks.apiEndpoints.message}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-gray-600" />
                          <CardTitle className="text-lg">External Services</CardTitle>
                        </div>
                        {getStatusBadge(healthReport.checks.externalServices.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{healthReport.checks.externalServices.message}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-lg">Security Status</CardTitle>
                      </div>
                      {getStatusBadge(healthReport.checks.security.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{healthReport.checks.security.message}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </main>
    </div>
  );
}