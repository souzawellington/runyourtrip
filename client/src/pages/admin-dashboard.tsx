import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Activity, 
  Settings, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Server,
  HardDrive,
  Cpu,
  BarChart3,
  MessageSquare,
  Key,
  FileText,
  UserCog
} from "lucide-react";

import AdminProtected from "@/components/admin-protected";

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for now - will connect to real API
  const systemMetrics = {
    cpuUsage: 10,
    memoryUsage: 24,
    diskUsage: 69,
    serverHealth: "healthy",
    activeUsers: 156,
    requestsPerMinute: 342
  };

  const supportTickets = {
    open: 3,
    inProgress: 5,
    resolved: 47,
    total: 55
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your platform, users, and resources</p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              System Healthy
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">+12% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{supportTickets.open}</div>
                  <p className="text-xs text-muted-foreground">Open tickets</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Server Load</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.cpuUsage}%</div>
                  <Progress value={systemMetrics.cpuUsage} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.requestsPerMinute}</div>
                  <p className="text-xs text-muted-foreground">Per minute</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Resources</CardTitle>
                  <CardDescription>Real-time server monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-gray-600">{systemMetrics.cpuUsage}%</span>
                    </div>
                    <Progress value={systemMetrics.cpuUsage} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-gray-600">{systemMetrics.memoryUsage}%</span>
                    </div>
                    <Progress value={systemMetrics.memoryUsage} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm text-gray-600">{systemMetrics.diskUsage}%</span>
                    </div>
                    <Progress value={systemMetrics.diskUsage} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registration</p>
                        <p className="text-xs text-gray-500">demo@example.com - 2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Content generated</p>
                        <p className="text-xs text-gray-500">Docker Communication Course - 15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">API key updated</p>
                        <p className="text-xs text-gray-500">OpenAI API key - 1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Export Users
                  </Button>
                  <Button>
                    <UserCog className="w-4 h-4 mr-2" />
                    Add Admin User
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-center text-gray-500">User management interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Manage user support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{supportTickets.open}</div>
                    <p className="text-sm text-gray-600">Open</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{supportTickets.inProgress}</div>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{supportTickets.resolved}</div>
                    <p className="text-sm text-gray-600">Resolved</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{supportTickets.total}</div>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-center text-gray-500">Support ticket management will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>Review and moderate user-generated content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4">
                  <p className="text-center text-gray-500">Content moderation queue will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Manage API keys and system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Key className="w-4 h-4 mr-2" />
                      API Keys
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">OpenAI API</span>
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Gemini API</span>
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Perplexity API</span>
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure global platform settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4">
                  <p className="text-center text-gray-500">Platform settings will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminProtected>
      <AdminDashboardContent />
    </AdminProtected>
  );
}