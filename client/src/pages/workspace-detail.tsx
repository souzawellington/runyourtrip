import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  UserPlus, 
  Settings, 
  Calendar, 
  Activity,
  Mail,
  Crown,
  Shield,
  Edit,
  Eye,
  MoreHorizontal
} from "lucide-react";
import Header from "@/components/layout/header";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "editor", "viewer"], {
    required_error: "Please select a role",
  }),
});

type InviteMemberData = z.infer<typeof inviteMemberSchema>;

interface Workspace {
  id: number;
  name: string;
  description?: string;
  ownerId: string;
  status: string;
  settings: any;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceMember {
  id: number;
  workspaceId: number;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
  invitedBy?: string;
}

interface WorkspaceActivity {
  id: number;
  workspaceId: number;
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details: any;
  createdAt: string;
}

interface WorkspaceData {
  workspace: Workspace;
  members: WorkspaceMember[];
  userRole: string;
}

export default function WorkspaceDetail() {
  const [match, params] = useRoute("/workspaces/:id");
  const workspaceId = params?.id;
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InviteMemberData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "viewer",
    },
  });

  const { data: workspaceData, isLoading } = useQuery({
    queryKey: [`/api/workspaces/${workspaceId}`],
    enabled: !!workspaceId,
  });

  const { data: activity } = useQuery({
    queryKey: [`/api/workspaces/${workspaceId}/activity`],
    enabled: !!workspaceId,
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: InviteMemberData) => {
      const response = await apiRequest("POST", `/api/workspaces/${workspaceId}/invite`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "The invitation has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspaceId}`] });
      setInviteDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/workspaces/${workspaceId}/members/${userId}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Member Removed",
        description: "The member has been removed from the workspace.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspaceId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("PATCH", `/api/workspaces/${workspaceId}/members/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "The member's role has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspaceId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const onInviteSubmit = (data: InviteMemberData) => {
    inviteMutation.mutate(data);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4" />;
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "editor":
        return <Edit className="w-4 h-4" />;
      case "viewer":
        return <Eye className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-red-100 text-red-800 border-red-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "editor":
        return "bg-green-100 text-green-800 border-green-200";
      case "viewer":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const canManageMembers = (userRole: string) => {
    return userRole === "owner" || userRole === "admin";
  };

  if (!match) {
    return <div>Workspace not found</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const { workspace, members, userRole } = workspaceData as WorkspaceData;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{workspace.name}</h1>
            <p className="text-muted-foreground text-lg">
              {workspace.description || "No description provided"}
            </p>
          </div>
          
          {canManageMembers(userRole) && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join this workspace.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onInviteSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="teammate@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admin">Admin - Full access except workspace deletion</SelectItem>
                              <SelectItem value="editor">Editor - Can create and edit content</SelectItem>
                              <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInviteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={inviteMutation.isPending}
                      >
                        {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            {canManageMembers(userRole) && (
              <TabsTrigger value="settings">Settings</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{members.length}</div>
                  <p className="text-muted-foreground">Active members</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date(workspace.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-muted-foreground">Workspace creation date</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getRoleBadgeColor(workspace.status)}>
                    {workspace.status}
                  </Badge>
                  <p className="text-muted-foreground mt-2">Current status</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {getRoleIcon(member.role)}
                      </div>
                      <div>
                        <div className="font-medium">User {member.userId}</div>
                        <div className="text-sm text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                      
                      {canManageMembers(userRole) && member.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => updateRoleMutation.mutate({ userId: member.userId, role: "admin" })}
                              disabled={member.role === "admin"}
                            >
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateRoleMutation.mutate({ userId: member.userId, role: "editor" })}
                              disabled={member.role === "editor"}
                            >
                              Make Editor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateRoleMutation.mutate({ userId: member.userId, role: "viewer" })}
                              disabled={member.role === "viewer"}
                            >
                              Make Viewer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => removeUserMutation.mutate(member.userId)}
                              className="text-red-600"
                            >
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="space-y-4">
              {activity && activity.length > 0 ? (
                activity.map((item: WorkspaceActivity) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.action.replace(/_/g, ' ')}</div>
                          <div className="text-sm text-muted-foreground">
                            By User {item.userId} • {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>
                        {item.resourceType && (
                          <Badge variant="outline">
                            {item.resourceType}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
                    <p className="text-muted-foreground">
                      Activity will appear here as team members interact with the workspace.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {canManageMembers(userRole) && (
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Settings</CardTitle>
                  <CardDescription>
                    Manage your workspace configuration and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Settings panel coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}