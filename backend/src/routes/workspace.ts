import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

// CREATE a workspace (creator becomes owner)
router.post("/", requireAuth, async (req, res) => {
  const { name } = req.body;

  const workspace = await prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.create({ data: { name } });
    await tx.membership.create({
      data: { userId: req.userId!, workspaceId: ws.id, role: "owner" },
    });
    return ws;
  });

  res.json(workspace);
});

// LIST workspaces the logged-in user belongs to
router.get("/", requireAuth, async (req, res) => {
  const memberships = await prisma.membership.findMany({
    where: { userId: req.userId },
    include: { workspace: true },
  });
  res.json(memberships.map((m) => m.workspace));
});

export default router;