import type { AuthUser } from "./auth";

// Set VITE_API_URL in a .env file at the project root if your API runs on a
// different port. Falls back to the default ASP.NET Core dev port.
const API_BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:5230";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRoleInput;
}) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle<AuthUser>(res);
}

export async function loginUser(input: { email: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle<AuthUser>(res);
}

// Matches DocuSense.Shared.UserRole's string names exactly
export type UserRoleInput = "Student" | "Educator" | "Admin";

export type LayerScoreDto = { layerType: string; score: number };
export type HighlightedSectionDto = {
  sectionText: string;
  sectionScore: number;
  position: number;
};
export type DetectionResultDto = {
  documentId: number;
  overallScore: number;
  status: string;
  layerScores: LayerScoreDto[];
  highlightedSections: HighlightedSectionDto[];
  document?: { filename: string; extractedText?: string | null };
};

export async function uploadDocument(file: File, uploaderId?: number, token?: string) {
  const form = new FormData();
  form.append("file", file);
  const url = uploaderId
    ? `${API_BASE_URL}/api/documents/upload?uploaderId=${uploaderId}`
    : `${API_BASE_URL}/api/documents/upload`;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: form,
  });
  return handle<{ documentId: number; resultId: number; overallScore: number; status: string }>(
    res,
  );
}

export async function getResult(documentId: number, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/result`, { headers });
  return handle<DetectionResultDto>(res);
}

export async function resetPassword(input: { email: string; newPassword: string }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle<{ message: string }>(res);
}
