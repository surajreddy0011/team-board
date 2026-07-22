import { prisma } from "../prisma";

// Confirms this user can access this board, by tracing board -> workspace -> membership
export async function userCanAccessBoard(userId: number, boardId: number): Promise<boolean> {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) return false;

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId: board.workspaceId } },
  });
  return !!membership;
}