import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management" });

//Inngest functions to store user data
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  {
    event: "clerk/user.created",
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.create({
      data: {
        id: data?.id,
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      },
    });
  }
);

//Inngest functions to delete user data
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
  },
  {
    event: "clerk/user.deleted",
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.delete({
      where: {
        id: data?.id,
      },
      data: {
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      },
    });
  }
);

//Inngest functions to update user data
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-with-clerk",
  },
  {
    event: "clerk/user.updated",
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.update({
      where: {
        id: data?.id,
      },
    });
  }
);

//Inngest functions to store workspace data
const syncWorkspaceCreation = inngest.createFunction(
  {
    id: "sync-workspace-from-clerk",
  },
  {
    event: "clerk/organization.created",
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image_url,
        ownerId: data.created_by,
      },
    });
    // Assign the workspace creator as an admin member
    await prisma.workspaceMember.create({
      data: {
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN",
      },
    });
  }
);

//Inngest functions to update workspace data
const syncWorkspaceUpdation = inngest.createFunction(
  {
    id: "update-workspace-from-clerk",
  },
  { event: "clerk/organization.updated" },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.update({
      where: {
        id: data?.id,
      },
      data: {
        name: data?.name,
        slug: data?.slug,
        description: data?.description,
        image: data?.image_url,
      },
    });
  }
);

//Inngest functions to delete workspace data
const syncWorkspaceDeletion = inngest.createFunction(
  {
    id: "delete-workspace-with-clerk",
  },
  {
    event: "clerk/organization.deleted",
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.delete({
      where: {
        id: data?.id,
      },
    });
  }
);

//Inngest function to update workspace members
const syncWorkspaceMemberCreation = inngest.createFunction(
  {
    id: "update-workspace-member-with-clerk",
  },
  {
    event: "clerk/organizationInvitation.accepted",
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspaceMember.create({
      data: {
        userId: data?.user_id,
        workspaceId: data?.organization_id,
        message: data?.message,
        role: String(data?.role_name).toUpperCase(),
      },
    });
  }
);
// Create an empty array where we'll export future Inngest functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
];
