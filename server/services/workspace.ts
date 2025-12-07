import crypto from "crypto";
import { storage } from "../storage";
import type {
  Workspace,
  InsertWorkspace,
  WorkspaceMember,
  InsertWorkspaceMember,
  WorkspaceInvitation,
  InsertWorkspaceInvitation,
  WorkspaceActivity,
  InsertWorkspaceActivity,
} from "@shared/schema";

export class WorkspaceService {
  // Core workspace management
  async createWorkspace(ownerId: string, data: Omit<InsertWorkspace, 'ownerId'>): Promise<Workspace> {
    const workspace = await storage.createWorkspace({
      ...data,
      ownerId,
    });

    // Add the owner as a workspace member with owner role
    await storage.addWorkspaceMember({
      workspaceId: workspace.id,
      userId: ownerId,
      role: "owner",
      status: "active",
      joinedAt: new Date(),
    });

    // Log the creation activity
    await this.logActivity(workspace.id, ownerId, "workspace_created", "workspace", workspace.id.toString(), {
      workspaceName: workspace.name,
    });

    return workspace;
  }

  async getWorkspaceWithMembers(workspaceId: number, userId: string): Promise<{
    workspace: Workspace;
    members: WorkspaceMember[];
    userRole: string | null;
  } | null> {
    const workspace = await storage.getWorkspace(workspaceId);
    if (!workspace) return null;

    const members = await storage.getWorkspaceMembers(workspaceId);
    const userRole = await storage.getUserWorkspaceRole(userId, workspaceId);

    // Check if user has access to this workspace
    if (!userRole) return null;

    return {
      workspace,
      members,
      userRole,
    };
  }

  // Member management
  async inviteUserToWorkspace(
    workspaceId: number,
    invitedBy: string,
    email: string,
    role: string
  ): Promise<WorkspaceInvitation> {
    // Check if inviter has permission
    const inviterRole = await storage.getUserWorkspaceRole(invitedBy, workspaceId);
    if (!inviterRole || !this.canManageMembers(inviterRole)) {
      throw new Error("Insufficient permissions to invite users");
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = await storage.createWorkspaceInvitation({
      workspaceId,
      email,
      role,
      invitedBy,
      token,
      expiresAt,
    });

    await this.logActivity(workspaceId, invitedBy, "user_invited", "user", email, {
      role,
      invitationToken: token,
    });

    return invitation;
  }

  async acceptInvitation(token: string, userId: string): Promise<WorkspaceMember> {
    const invitation = await storage.getWorkspaceInvitation(token);
    if (!invitation) {
      throw new Error("Invalid invitation token");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid");
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error("Invitation has expired");
    }

    // Check if user is already a member
    const existingMember = await storage.getWorkspaceMember(invitation.workspaceId, userId);
    if (existingMember) {
      throw new Error("User is already a member of this workspace");
    }

    // Add user to workspace
    const member = await storage.addWorkspaceMember({
      workspaceId: invitation.workspaceId,
      userId,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      status: "active",
      joinedAt: new Date(),
    });

    // Update invitation status
    await storage.updateInvitationStatus(token, "accepted");

    await this.logActivity(invitation.workspaceId, userId, "user_joined", "user", userId, {
      role: invitation.role,
      invitedBy: invitation.invitedBy,
    });

    return member;
  }

  async removeUserFromWorkspace(
    workspaceId: number,
    userId: string,
    removedBy: string
  ): Promise<boolean> {
    const removerRole = await storage.getUserWorkspaceRole(removedBy, workspaceId);
    const targetRole = await storage.getUserWorkspaceRole(userId, workspaceId);

    if (!removerRole || !targetRole) {
      throw new Error("User not found in workspace");
    }

    // Owners cannot be removed, and only owners/admins can remove others
    if (targetRole === "owner") {
      throw new Error("Cannot remove workspace owner");
    }

    if (!this.canManageMembers(removerRole)) {
      throw new Error("Insufficient permissions to remove users");
    }

    const success = await storage.removeWorkspaceMember(workspaceId, userId);
    
    if (success) {
      await this.logActivity(workspaceId, removedBy, "user_removed", "user", userId, {
        removedUserRole: targetRole,
      });
    }

    return success;
  }

  // Permission checking
  async checkUserAccess(userId: string, workspaceId: number, requiredPermission?: string): Promise<boolean> {
    const role = await storage.getUserWorkspaceRole(userId, workspaceId);
    if (!role) return false;

    if (!requiredPermission) return true;

    return await storage.checkWorkspacePermission(userId, workspaceId, requiredPermission);
  }

  // Activity logging
  async logActivity(
    workspaceId: number,
    userId: string,
    action: string,
    resourceType?: string,
    resourceId?: string,
    details?: any,
    req?: any
  ): Promise<WorkspaceActivity> {
    return await storage.logWorkspaceActivity({
      workspaceId,
      userId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
    });
  }

  // Helper methods
  private canManageMembers(role: string): boolean {
    return role === "owner" || role === "admin";
  }

  private canEditContent(role: string): boolean {
    return role === "owner" || role === "admin" || role === "editor";
  }

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    return await storage.getWorkspacesByUserId(userId);
  }

  async getWorkspaceActivity(workspaceId: number, limit = 50): Promise<WorkspaceActivity[]> {
    return await storage.getWorkspaceActivity(workspaceId, limit);
  }

  // Role and permission management
  async updateMemberRole(
    workspaceId: number,
    targetUserId: string,
    newRole: string,
    updatedBy: string
  ): Promise<WorkspaceMember | null> {
    const updaterRole = await storage.getUserWorkspaceRole(updatedBy, workspaceId);
    const targetMember = await storage.getWorkspaceMember(workspaceId, targetUserId);

    if (!updaterRole || !targetMember) {
      throw new Error("User not found in workspace");
    }

    // Only owners can change roles, and can't change other owners
    if (updaterRole !== "owner" || targetMember.role === "owner") {
      throw new Error("Insufficient permissions to change roles");
    }

    const updatedMember = await storage.updateWorkspaceMember(targetMember.id, {
      role: newRole,
    });

    if (updatedMember) {
      await this.logActivity(workspaceId, updatedBy, "role_updated", "user", targetUserId, {
        oldRole: targetMember.role,
        newRole,
      });
    }

    return updatedMember;
  }
}

export const workspaceService = new WorkspaceService();