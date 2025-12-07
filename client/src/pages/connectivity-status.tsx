import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Server, Database, Key, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ConnectivityStatus() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Health check query
  const { data: health, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/admin/health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Ubuntu connection test
  const testUbuntuConnection = async () => {
    setIsTestingConnection(true);
    try {
      // Use environment variable or default to localhost for testing
      const targetIp = import.meta.env.VITE_UBUNTU_TARGET_IP || "127.0.0.1";
      const response = await fetch("/api/admin/test-ubuntu-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetIp })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Connection test failed:", error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
      case "configured":
        return <Badge className="bg-green-600"><CheckCircle className="w-4 h-4 mr-1" />Active</Badge>;
      case "warning":
        return <Badge className="bg-yellow-600"><AlertCircle className="w-4 h-4 mr-1" />Warning</Badge>;
      case "missing":
      case "not configured":
        return <Badge className="bg-red-600"><XCircle className="w-4 h-4 mr-1" />Missing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">Loading connectivity status...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Connectivity Status</h1>
        <p className="text-gray-600">Monitor platform health and connectivity to Ubuntu instance</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Platform Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              Platform Status
            </CardTitle>
            <CardDescription>Current platform health and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            {health && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Overall Status</span>
                  {getStatusBadge(health.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Environment</span>
                  <Badge variant="outline">{health.platform?.environment}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Instance</span>
                  <span className="text-sm font-mono">{health.platform?.instance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Uptime</span>
                  <span className="text-sm">{Math.floor(health.platform?.uptime / 60)} minutes</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Database Connection
            </CardTitle>
            <CardDescription>PostgreSQL database status</CardDescription>
          </CardHeader>
          <CardContent>
            {health?.database && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Connection</span>
                  {getStatusBadge(health.database.connected ? "healthy" : "missing")}
                </div>
                <div className="flex items-center justify-between">
                  <span>Configuration</span>
                  {getStatusBadge(health.database.url)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Keys Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              API Keys Status
            </CardTitle>
            <CardDescription>External service configurations</CardDescription>
          </CardHeader>
          <CardContent>
            {health?.apiKeys && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>OpenAI API</span>
                  {getStatusBadge(health.apiKeys.openai)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Gemini API</span>
                  {getStatusBadge(health.apiKeys.gemini)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Perplexity API</span>
                  {getStatusBadge(health.apiKeys.perplexity)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ubuntu Instance Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Ubuntu Instance
            </CardTitle>
            <CardDescription>Connection to accepting-tragopan (10.10.237.52)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-4">Test connectivity to your Ubuntu instance</p>
                <Button 
                  onClick={testUbuntuConnection} 
                  disabled={isTestingConnection}
                  className="w-full"
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    "Test Ubuntu Connection"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>System Resources</CardTitle>
          <CardDescription>Current resource utilization</CardDescription>
        </CardHeader>
        <CardContent>
          {health?.system && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Memory Usage</p>
                <p className="text-2xl font-bold">
                  {Math.round((health.system.memoryUsage.heapUsed / health.system.memoryUsage.heapTotal) * 100)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Free Memory</p>
                <p className="text-2xl font-bold">
                  {Math.round(health.system.freeMemory / 1024 / 1024 / 1024 * 10) / 10} GB
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Platform</p>
                <p className="text-2xl font-bold capitalize">{health.system.platform}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
      </div>
    </div>
  );
}