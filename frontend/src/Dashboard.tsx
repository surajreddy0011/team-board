import { useEffect, useState } from "react";
import * as api from "./api";
import BoardView from "./BoardView";

const ACCENTS = ["bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];

export default function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [workspaces, setWorkspaces] = useState<api.Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<number | null>(null);
  const [boards, setBoards] = useState<api.Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<number | null>(null);

  const [wsName, setWsName] = useState("");
  const [addingWorkspace, setAddingWorkspace] = useState(false);
  const [wsMenuOpen, setWsMenuOpen] = useState(false);
  const [addingBoard, setAddingBoard] = useState(false);
  const [boardName, setBoardName] = useState("");

  useEffect(() => {
    api.getWorkspaces(token).then((ws) => {
      setWorkspaces(ws);
      if (ws.length > 0) setActiveWorkspace(ws[0].id);
    });
  }, []);

  useEffect(() => {
    if (activeWorkspace) api.getBoards(token, activeWorkspace).then(setBoards);
  }, [activeWorkspace]);

  async function handleCreateWorkspace() {
    if (!wsName) return;
    const ws = await api.createWorkspace(token, wsName);
    setWorkspaces([...workspaces, ws]);
    setActiveWorkspace(ws.id);
    setWsName("");
    setAddingWorkspace(false);
    setWsMenuOpen(false);
  }

  async function handleCreateBoard() {
    if (!boardName || !activeWorkspace) return;
    const board = await api.createBoard(token, activeWorkspace, boardName);
    setBoards([...boards, board]);
    setBoardName("");
    setAddingBoard(false);
  }

  if (activeBoard) {
    return <BoardView token={token} boardId={activeBoard} onBack={() => setActiveBoard(null)} />;
  }

  const currentWs = workspaces.find((w) => w.id === activeWorkspace);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold">
            T
          </div>
          <span className="font-semibold text-slate-800">Team Board</span>

          {workspaces.length > 0 && (
            <div className="relative ml-2">
              <button
                onClick={() => setWsMenuOpen(!wsMenuOpen)}
                className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5 transition"
              >
                {currentWs?.name}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {wsMenuOpen && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-lg w-56 py-1 z-10">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setActiveWorkspace(ws.id);
                        setWsMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition ${
                        ws.id === activeWorkspace ? "text-violet-600 font-medium" : "text-slate-700"
                      }`}
                    >
                      {ws.name}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1" />
                  {addingWorkspace ? (
                    <div className="px-3 py-2">
                      <input
                        autoFocus
                        className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-violet-400"
                        placeholder="Workspace name"
                        value={wsName}
                        onChange={(e) => setWsName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingWorkspace(true)}
                      className="w-full text-left px-3 py-2 text-sm text-violet-600 hover:bg-slate-50 transition"
                    >
                      + New workspace
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="text-sm text-slate-500 hover:text-red-500 transition"
        >
          Log out
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        {workspaces.length === 0 ? (
          <div className="max-w-sm mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              +
            </div>
            <h2 className="font-semibold text-slate-800 mb-1">Create your workspace</h2>
            <p className="text-sm text-slate-500 mb-4">A home for your team's boards.</p>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 outline-none focus:border-violet-400 text-sm"
              placeholder="e.g. Suraj's Team"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
            />
            <button
              className="w-full bg-violet-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-violet-700 transition"
              onClick={handleCreateWorkspace}
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-slate-800">Boards</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board, i) => (
                <button
                  key={board.id}
                  onClick={() => setActiveBoard(board.id)}
                  className="text-left bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  <div className={`h-20 ${ACCENTS[i % ACCENTS.length]} opacity-90 group-hover:opacity-100 transition`} />
                  <div className="p-4">
                    <p className="font-semibold text-slate-800">{board.title}</p>
                  </div>
                </button>
              ))}

              {addingBoard ? (
                <div className="bg-white rounded-xl border-2 border-violet-300 p-4 flex flex-col gap-2 justify-center">
                  <input
                    autoFocus
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400"
                    placeholder="Board title"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                  />
                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-violet-600 text-white rounded-lg py-1.5 text-sm font-semibold hover:bg-violet-700 transition"
                      onClick={handleCreateBoard}
                    >
                      Create
                    </button>
                    <button
                      className="px-3 text-sm text-slate-500 hover:text-slate-700"
                      onClick={() => setAddingBoard(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingBoard(true)}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center text-slate-400 hover:border-violet-300 hover:text-violet-500 transition min-h-[112px]"
                >
                  + New board
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}