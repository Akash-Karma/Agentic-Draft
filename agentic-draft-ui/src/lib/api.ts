export interface Draft {
  id: string;
  content: string;
  qualityScore: number | null;
  userFeedback: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  sourceContent: string;
  summary?: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  drafts: Draft[];
}

export interface UserPreferences {
  tone?: string;
  length?: string;
  hashtags?: boolean;
  emojiUse?: string;
  customInstructions?: string;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || "Request failed");
  }
  return res.json();
}

export const api = {
  async signup(email: string, password: string): Promise<{ message: string }> {
    const res = await fetch("/api/external/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async login(email: string, password: string): Promise<{ message: string }> {
    const res = await fetch("/api/external/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async resendVerification(email: string): Promise<{ message: string }> {
  const res = await fetch("/api/external/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },
  
  async logout(): Promise<void> {
    await fetch("/api/external/logout", {
      method: "POST",
      credentials: "include",
    });
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const res = await fetch(`/api/external/verify?token=${encodeURIComponent(token)}`, {
      credentials: "include",
    });
    return handleResponse(res);
  },

  async createProject(sourceContent: string): Promise<{ projectId: string }> {
    const res = await fetch("/api/external/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sourceContent }),
    });
    return handleResponse(res);
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`/api/external/project/${id}`, {
      credentials: "include",
    });
    return handleResponse(res);
  },

  async getProjects(): Promise<Project[]> {
    const res = await fetch("/api/external/projects", {
      credentials: "include",
    });
    return handleResponse(res);
  },

  async regenerateProject(id: string, feedback: string): Promise<{ message: string }> {
    const res = await fetch(`/api/external/project/${id}/regenerate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ feedback }),
    });
    return handleResponse(res);
  },

  async getPreferences(): Promise<UserPreferences | null> {
    const res = await fetch("/api/external/preferences", {
      credentials: "include",
    });
    return handleResponse(res);
  },

  async updatePreferences(prefs: UserPreferences): Promise<UserPreferences> {
    const res = await fetch("/api/external/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(prefs),
    });
    return handleResponse(res);
  },
};