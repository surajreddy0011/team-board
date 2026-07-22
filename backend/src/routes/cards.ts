import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { userCanAccessBoard } from "../utils/checkAccess";
import { io } from "../socket";
const router = Router();

// CREATE a card in a list
router.post("/lists/:listId/cards", requireAuth, async (req, res) => {
  const listId = parseInt(req.params.listId as string);

  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list || !(await userCanAccessBoard(req.userId!, list.boardId))) {
    return res.status(403).json({ error: "No access" });
  }

  const count = await prisma.card.count({ where: { listId } });
  const card = await prisma.card.create({
    data: { title: req.body.title, listId, position: count },
  });
  res.json(card);
});

// MOVE a card: to a (possibly different) list, at a specific position
router.put("/cards/:cardId/move", requireAuth, async (req, res) => {
  const cardId = parseInt(req.params.cardId as string);
  const { listId, position } = req.body; // destination list + desired index

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!card || !list || !(await userCanAccessBoard(req.userId!, list.boardId))) {
    return res.status(403).json({ error: "No access" });
  }

  await prisma.$transaction(async (tx) => {
    // shift cards in the DESTINATION list to make room at `position`
    await tx.card.updateMany({
      where: { listId, position: { gte: position } },
      data: { position: { increment: 1 } },
    });

    // place the moved card into its new spot
    await tx.card.update({
      where: { id: cardId },
      data: { listId, position },
    });
  });

  io.to(`board-${list.boardId}`).emit("card-moved", { cardId, listId, position });
  res.json({ message: "Moved" });
});

export default router;