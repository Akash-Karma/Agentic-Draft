export interface Project {
  id: string;
  sourceContent: string;
  summary?: string;
  linkedinPost?: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export const api = {
  // Start a new AI draft
  async createProject(sourceContent: string): Promise<{ projectId: string }> {
    const res = await fetch("/api/external/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceContent }),
    });
    if (!res.ok) throw new Error("Failed to start project");
    return res.json();
  },

  // Get project details/status
  async getProject(id: string): Promise<Project> {
    const res = await fetch(`/api/external/project/${id}`);
    if (!res.ok) throw new Error("Project not found");
    return res.json();
  }
};