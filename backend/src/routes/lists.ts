import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { userCanAccessBoard } from "../utils/checkAccess";

const router = Router();

// CREATE a list in a board
router.post("/boards/:boardId/lists", requireAuth, async (req, res) => {
  const boardId = parseInt(req.params.boardId as string);

  if (!(await userCanAccessBoard(req.userId!, boardId))) {
    return res.status(403).json({ error: "No access to this board" });
  }

  const count = await prisma.list.count({ where: { boardId } });
  const list = await prisma.list.create({
    data: { title: req.body.title, boardId, position: count },
  });
  res.json(list);
});

// GET a board with its lists AND cards, all properly ordered
router.get("/boards/:boardId/lists", requireAuth, async (req, res) => {
  const boardId = parseInt(req.params.boardId as string);

  if (!(await userCanAccessBoard(req.userId!, boardId))) {
    return res.status(403).json({ error: "No access to this board" });
  }

  const lists = await prisma.list.findMany({
    where: { boardId },
    orderBy: { position: "asc" },
    include: {
      cards: { orderBy: { position: "asc" } },
    },
  });
  res.json(lists);
});

export default router;