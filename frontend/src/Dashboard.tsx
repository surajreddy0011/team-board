import { useEffect, useState } from "react";
import * as api from "./api";
import BoardView from "./BoardView";

export default function Dashboard({ token }: { token: string }) {
  const [workspaces, setWorkspaces] = useState<api.Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<number | null>(null);
  const [boards, setBoards] = useState<api.Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<number | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    api.getWorkspaces(token).then((ws) => {
      setWorkspaces(ws);
      if (ws.length > 0) setActiveWorkspace(ws[0].id);
    });
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      api.getBoards(token, activeWorkspace).then(setBoards);
    }
  }, [activeWorkspace]);

  async function handleCreateWorkspace() {
    if (!name) return;
    const ws = await api.createWorkspace(token, name);
    setWorkspaces([...workspaces, ws]);
    setActiveWorkspace(ws.id);
    setName("");
  }

  async function handleCreateBoard() {
    if (!name || !activeWorkspace) return;
    const board = await api.createBoard(token, activeWorkspace, name);
    setBoards([...boards, board]);
    setName("");
  }

  if (activeBoard) {
    return (
      <div>
        <button className="m-4 text-sm text-indigo-600 underline" onClick={() => setActiveBoard(null)}>
          ← Back to boards
        </button>
        <BoardView token={token} boardId={activeBoard} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Team Board</h1>

      {workspaces.length === 0 ? (
        <div className="flex gap-2">
          <input
            className="border border-slate-200 rounded-lg px-3 py-2 flex-1"
            placeholder="Workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="bg-indigo-600 text-white rounded-lg px-4" onClick={handleCreateWorkspace}>
            Create Workspace
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            <input
              className="border border-slate-200 rounded-lg px-3 py-2 flex-1"
              placeholder="New board title"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="bg-indigo-600 text-white rounded-lg px-4" onClick={handleCreateBoard}>
              Create Board
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {boards.map((board) => (
              <button
                key={board.id}
                className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-indigo-400 transition"
                onClick={() => setActiveBoard(board.id)}
              >
                {board.title}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}