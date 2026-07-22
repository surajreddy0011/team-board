import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

// CREATE a board inside a workspace
router.post("/:workspaceId/boards", requireAuth, async (req, res) => {
  const workspaceId = parseInt(req.params.workspaceId as string);
  const { title } = req.body;

  // security check: is this user actually a member of this workspace?
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: req.userId!, workspaceId } },
  });
  if (!membership) {
    return res.status(403).json({ error: "Not a member of this workspace" });
  }

  const board = await prisma.board.create({ data: { title, workspaceId } });
  res.json(board);
});

// LIST boards in a workspace
router.get("/:workspaceId/boards", requireAuth, async (req, res) => {
  const workspaceId = parseInt(req.params.workspaceId as string);

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: req.userId!, workspaceId } },
  });
  if (!membership) {
    return res.status(403).json({ error: "Not a member of this workspace" });
  }

  const boards = await prisma.board.findMany({ where: { workspaceId } });
  res.json(boards);
});

export default router;