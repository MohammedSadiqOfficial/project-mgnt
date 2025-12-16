import prisma from "../configs/prisma.js";

// Create Project
export const createProject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      workspaceId,
      description,
      name,
      status,
      start_date,
      end_date,
      team_members,
      team_lead,
      progress,
      priority,
    } = req.body;
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    if (
      !workspace.members.some(
        (member) => member.userId === userId && member.role === "ADMIN"
      )
    )
      return res.status(403).json({
        message:
          "You don't have permission to create projects in this workspace",
      });
    const teamLead = await prisma.user.findUnique({
      where: {
        email: team_lead,
      },
    });
    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        description,
        status,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        priority,
        progress,
        team_lead: teamLead?.id,
        start_date: start_date ? new Date(start_date) : null,
        end_date: start_date ? new Date(end_date) : null,
      },
    });

    // Add member to project if their workspace
    if (team_members.length > 0) {
      const memberToAdd = [];
      team_members.forEach((member) => {
        if (team_members.include(member.user.email))
          memberToAdd.push(member.user.id);
      });
      await prisma.projectMember.createMany({
        data: memberToAdd.map((memberId) => ({
          projectId: project.id,
          userId: memberId,
        })),
      });
    }
    const projectWithMember = await prisma.project.findUnique({
      where: {
        id: project.id,
      },
      include: {
        members: {
          user: true,
        },
        tasks: {
          include: {
            assignee: true,
            comments: {
              include: {
                user: true,
              },
            },
          },
        },
        owner: true,
      },
    });
    res.json({
      project: projectWithMember,
      message: "Project created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.code || error.message });
  }
};

// Update Project
export const updateProject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      workspaceId,
      description,
      name,
      status,
      start_date,
      end_date,
      team_members,
      team_lead,
      progress,
      priority,
    } = req.body;
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    if (
      !workspace.members.some(
        (member) => member.userId === userId && member.role === "ADMIN"
      )
    ) {
      const project = await prisma.project.findUnique({
        where: {
          id,
        },
      });
      if (project)
        return res.status(404).json({ message: "Workspace not found" });
      else if (project.team_lead !== userId)
        return res.status(403).json({
          message:
            "You don't have permission to update project in this workspace",
        });
    }
    const project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        workspaceId,
        name,
        description,
        status,
        progress,
        priority,
        start_date: start_date ? new Date(start_date) : null,
        end_date: start_date ? new Date(end_date) : null,
      },
    });
    return res.json({ project, message: "Project updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.code || error.message });
  }
};

// Add Members to  Project
export const addMember = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { projectId } = req.params;
    const { email } = req.body;

    //  Check if user is project lead
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (team_lead !== userId)
      return res
        .status(401)
        .json({ message: "Only project lead can add member" });
    const existingMember = project.members.find(
      (member) => member.email === email
    );

    if (existingMember)
      return res.status(400).json({ message: "User is already a member" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId,
      },
    });
    res.json({ member, message: "Member added successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.code || error.message });
  }
};
