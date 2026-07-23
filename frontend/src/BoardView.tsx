import { useEffect, useState } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as api from "./api";
import { useBoardSocket } from "./useBoardSocket";
import { useDroppable } from "@dnd-kit/core";

function CardItem({ card }: { card: api.Card }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing"
    >
      {card.title}
    </div>
  );
}

export default function BoardView({ token, boardId }: { token: string; boardId: number }) {
  const [lists, setLists] = useState<api.List[]>([]);
  const [newCardTitles, setNewCardTitles] = useState<Record<number, string>>({});
  const [newListTitle, setNewListTitle] = useState("");

  function loadBoard() {
    api.getLists(token, boardId).then(setLists);
  }

  useEffect(loadBoard, [boardId]);
  useBoardSocket(boardId, loadBoard);

  async function handleAddCard(listId: number) {
    const title = newCardTitles[listId];
    if (!title) return;
    await api.createCard(token, listId, title);
    setNewCardTitles({ ...newCardTitles, [listId]: "" });
    loadBoard();
  }

  function CardListDroppable({ listId, children }: { listId: number; children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({ id: `list-${listId}` });
    return (
      <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[40px]">
        {children}
      </div>
    );
  }

  async function handleAddList() {
    if (!newListTitle) return;
    await api.createList(token, boardId, newListTitle);
    setNewListTitle("");
    loadBoard();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
  
    const cardId = active.id as number;
  
    // Find which list currently contains the card we dropped ONTO (or the list itself, if dropped on empty space)
    let targetList = lists.find((l) => l.cards.some((c) => c.id === over.id));
    if (!targetList) {
      // dropped directly on a list container (e.g. an empty list)
      const listId = parseInt(String(over.id).replace("list-", ""));
      targetList = lists.find((l) => l.id === listId);
    }
    if (!targetList) return;
  
    const newPosition = targetList.cards.findIndex((c) => c.id === over.id);
  
    await api.moveCard(
      token,
      cardId,
      targetList.id,
      newPosition === -1 ? targetList.cards.length : newPosition
    );
    loadBoard();
  }

  return (
    <div className="p-6 flex gap-4 overflow-x-auto min-h-screen bg-slate-50">
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        {lists.map((list) => (
          <div key={list.id} className="bg-slate-100 rounded-xl p-3 w-72 flex-shrink-0">
            <h2 className="font-semibold text-slate-700 mb-3">{list.title}</h2>
            <SortableContext id={`list-${list.id}`} items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
  <CardListDroppable listId={list.id}>
    {list.cards.map((card) => (
      <CardItem key={card.id} card={card} />
    ))}
  </CardListDroppable>
</SortableContext>
            <div className="mt-3 flex gap-1">
              <input
                className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-400"
                placeholder="Add a card..."
                value={newCardTitles[list.id] || ""}
                onChange={(e) => setNewCardTitles({ ...newCardTitles, [list.id]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAddCard(list.id)}
              />
            </div>
          </div>
        ))}

        <div className="bg-white/50 rounded-xl p-3 w-72 flex-shrink-0 flex gap-1 h-fit">
          <input
            className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-400"
            placeholder="Add a list..."
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddList()}
          />
        </div>
      </DndContext>
    </div>
  );
}