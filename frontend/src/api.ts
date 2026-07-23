const API = "http://localhost:4000";

export class ApiError extends Error {}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Workspace {
  id: number;
  name: string;
}

export interface Board {
  id: number;
  title: string;
  workspaceId: number;
}

export interface Card {
  id: number;
  title: string;
  position: number;
  listId: number;
}

export interface List {
  id: number;
  title: string;
  position: number;
  boardId: number;
  cards: Card[];
}

export function signup(email: string, password: string, name: string) {
  return request<{ message: string; userId: number }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export function login(email: string, password: string) {
  return request<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getWorkspaces(token: string) {
  return request<Workspace[]>("/workspaces", {}, token);
}

export function createWorkspace(token: string, name: string) {
  return request<Workspace>("/workspaces", { method: "POST", body: JSON.stringify({ name }) }, token);
}

export function getBoards(token: string, workspaceId: number) {
  return request<Board[]>(`/workspaces/${workspaceId}/boards`, {}, token);
}

export function createBoard(token: string, workspaceId: number, title: string) {
  return request<Board>(`/workspaces/${workspaceId}/boards`, { method: "POST", body: JSON.stringify({ title }) }, token);
}

export function getLists(token: string, boardId: number) {
  return request<List[]>(`/boards/${boardId}/lists`, {}, token);
}

export function createList(token: string, boardId: number, title: string) {
  return request<List>(`/boards/${boardId}/lists`, { method: "POST", body: JSON.stringify({ title }) }, token);
}

export function createCard(token: string, listId: number, title: string) {
  return request<Card>(`/lists/${listId}/cards`, { method: "POST", body: JSON.stringify({ title }) }, token);
}

export function moveCard(token: string, cardId: number, listId: number, position: number) {
  return request<{ message: string }>(
    `/cards/${cardId}/move`,
    { method: "PUT", body: JSON.stringify({ listId, position }) },
    token
  );
}