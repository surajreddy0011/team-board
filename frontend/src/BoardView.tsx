import { useEffect, useState } from "react";
import { DndContext, closestCorners, useDroppable } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as api from "./api";
import { useBoardSocket } from "./useBoardSocket";

function CardItem({ card }: { card: api.Card }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg p-3 shadow-sm border text-sm text-slate-700 cursor-grab active:cursor-grabbing hover:border-violet-300 hover:shadow-md transition ${
        isDragging ? "opacity-40 border-violet-300" : "border-slate-100"
      }`}
    >
      {card.title}
    </div>
  );
}

function CardListDroppable({ listId, children }: { listId: number; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: `list-${listId}` });
  return (
    <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[8px]">
      {children}
    </div>
  );
}

function AddCard({ listId, onAdd }: { listId: number; onAdd: (listId: number, title: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  function submit() {
    if (!title) return setAdding(false);
    onAdd(listId, title);
    setTitle("");
    setAdding(false);
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="text-left text-sm text-slate-400 hover:text-violet-600 hover:bg-white rounded-lg px-2 py-1.5 transition"
      >
        + Add a card
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        autoFocus
        className="text-sm border border-violet-300 rounded-lg px-2 py-1.5 outline-none"
        placeholder="Card title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        onBlur={submit}
      />
    </div>
  );
}

export default function BoardView({
  token,
  boardId,
  onBack,
}: {
  token: string;
  boardId: number;
  onBack: () => void;
}) {
  const [lists, setLists] = useState<api.List[]>([]);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  function loadBoard() {
    api.getLists(token, boardId).then(setLists);
  }

  useEffect(loadBoard, [boardId]);
  useBoardSocket(boardId, loadBoard);

  async function handleAddCard(listId: number, title: string) {
    await api.createCard(token, listId, title);
    loadBoard();
  }

  async function handleAddList() {
    if (!newListTitle) return setAddingList(false);
    await api.createList(token, boardId, newListTitle);
    setNewListTitle("");
    setAddingList(false);
    loadBoard();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as number;
    let targetList = lists.find((l) => l.cards.some((c) => c.id === over.id));
    if (!targetList) {
      const listId = parseInt(String(over.id).replace("list-", ""));
      targetList = lists.find((l) => l.id === listId);
    }
    if (!targetList) return;

    const newPosition = targetList.cards.findIndex((c) => c.id === over.id);
    await api.moveCard(token, cardId, targetList.id, newPosition === -1 ? targetList.cards.length : newPosition);
    loadBoard();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Boards
        </button>
      </header>

      <div className="p-6 flex gap-4 overflow-x-auto">
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          {lists.map((list) => (
            <div key={list.id} className="bg-slate-100 rounded-xl p-3 w-72 flex-shrink-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-semibold text-slate-700 text-sm">{list.title}</h2>
                <span className="text-xs bg-slate-200 text-slate-500 rounded-full px-2 py-0.5">
                  {list.cards.length}
                </span>
              </div>

              <SortableContext id={`list-${list.id}`} items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <CardListDroppable listId={list.id}>
                  {list.cards.map((card) => (
                    <CardItem key={card.id} card={card} />
                  ))}
                </CardListDroppable>
              </SortableContext>

              <div className="mt-2">
                <AddCard listId={list.id} onAdd={handleAddCard} />
              </div>
            </div>
          ))}

          <div className="w-72 flex-shrink-0">
            {addingList ? (
              <div className="bg-white rounded-xl p-3 border-2 border-violet-300">
                <input
                  autoFocus
                  className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-violet-400"
                  placeholder="List title..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddList()}
                  onBlur={handleAddList}
                />
              </div>
            ) : (
              <button
                onClick={() => setAddingList(true)}
                className="w-full text-left text-sm text-slate-400 hover:text-violet-600 bg-white/60 hover:bg-white rounded-xl px-3 py-2.5 transition border border-dashed border-slate-200 hover:border-violet-300"
              >
                + Add a list
              </button>
            )}
          </div>
        </DndContext>
      </div>
    </div>
  );
}