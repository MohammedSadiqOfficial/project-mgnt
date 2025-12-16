import prisma from "../configs/prisma.js";

//Get all Workspace
export const getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = req.auth();
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        projects: {
          include: {
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
            members: {
              include:{
                user: true,
              }
            },
          },
        },
        owner: true,
      },
    });
    res.status(200).json({ workspaces });
  } catch (error) {
    res.status(500).json({ message: error.code || error.message });
  }
};

//Add member to workspace

export const addMember = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { email, workspaceId, role, message } = req.body;
    //check user exist
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!workspaceId || !role)
      return res.status(400).json({ message: "Missing required parameters" });

    if (!["ADMIN", "MEMBER"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    //Fetch workspace
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        members: true,
      },
    });
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    if (
      !workspace.members.find(
        (member) => member.userId === userId && member.role === "ADMIN"
      )
    )
      return res
        .status(401)
        .json({ message: "You don't have admin previleges" });
    const existingMember = await prisma.workspace.member.find(
      (member) => member.userId === userId
    );
    if (existingMember)
      return res.status(400).json({ message: "User is already a member" });
    await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        message,
      },
    });
    res.status(200).json({ member, message: "Member added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.code || error.message });
  }
};
