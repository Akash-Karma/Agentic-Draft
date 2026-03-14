"use client";
import { useState, useEffect } from "react";
import DraftForm from "@/components/DraftForm";
import { api, Project } from "@/lib/api";
import { Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects (You might want to add a "List All" endpoint to your Express API later)
  // For now, we'll manage the state locally for the current session
  const addProjectToList = async (id: string) => {
    const newProject = await api.getProject(id);
    setProjects((prev) => [newProject, ...prev]);
  };

  // Effect to poll for updates on any "PROCESSING" projects
  useEffect(() => {
    const interval = setInterval(async () => {
      const processingProjects = projects.filter((p) => p.status === "PROCESSING");
      
      if (processingProjects.length === 0) return;

      for (const proj of processingProjects) {
        try {
          const updated = await api.getProject(proj.id);
          if (updated.status !== "PROCESSING") {
            setProjects((prev) =>
              prev.map((p) => (p.id === proj.id ? updated : p))
            );
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [projects]);

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Agentic Draft Dashboard</h1>
        <p className="text-gray-500">Transform your notes into professional content using AI agents.</p>
      </header>

      <DraftForm onProjectCreated={addProjectToList} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Projects</h2>
        {projects.length === 0 && (
          <p className="text-gray-400 italic">No projects yet. Start by pasting content above!</p>
        )}
        
        {projects.map((project) => (
          <div key={project.id} className="border rounded-xl p-6 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-mono text-gray-400">{project.id}</span>
              <StatusBadge status={project.status} />
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase">Source Content</h4>
                <p className="text-gray-700 line-clamp-2">{project.sourceContent}</p>
              </div>

              {project.status === "COMPLETED" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-blue-700 font-bold text-sm mb-2">AI Summary</h4>
                    <p className="text-gray-800 text-sm">{project.summary}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-green-700 font-bold text-sm mb-2">LinkedIn Post</h4>
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{project.linkedinPost}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: Project["status"] }) {
  const styles = {
    PROCESSING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
  };

  const icons = {
    PROCESSING: <Loader2 size={14} className="animate-spin" />,
    COMPLETED: <CheckCircle2 size={14} />,
    FAILED: <AlertCircle size={14} />,
  };

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
}