export interface Project {
  id: string;
  sourceContent: string;
  summary?: string;
  linkedinPost?: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

// Simple in-memory store for the API key (resets on page refresh — that's fine for now)
let apiKey: string | null = null;

export function setApiKey(key: string) {
  apiKey = key;
}

export function getApiKey() {
  return apiKey;
}

function authHeaders(): Record<string, string> {
  return apiKey ? { "x-api-key": apiKey } : {};
}

export const api = {
  // Start a new AI draft
  async createProject(sourceContent: string): Promise<{ projectId: string }> {
    const res = await fetch("/api/external/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
      body: JSON.stringify({ sourceContent }),
    });
    if (!res.ok) throw new Error("Failed to start project");
    return res.json();
  },

  // Get project details/status
  async getProject(id: string): Promise<Project> {
    const res = await fetch(`/api/external/project/${id}`, {
      headers: authHeaders() as HeadersInit,
    });
    if (!res.ok) throw new Error("Project not found");
    return res.json();
  },

  // Get all of the current user's projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch("/api/external/projects", {
      headers: authHeaders() as HeadersInit,
    });
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
  },
};