"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DraftForm from "@/components/DraftForm";
import LoginScreen from "@/components/LoginScreen";
import { api, Project } from "@/lib/api";

export default function Dashboard() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});
  const [selectedVersion, setSelectedVersion] = useState<Record<string, number>>({});

  useEffect(() => {
    api.getProjects()
      .then((data) => {
        setProjects(data);
        setLoggedIn(true);
      })
      .catch(() => setLoggedIn(false))
      .finally(() => setLoading(false));
  }, []);

  const addProjectToList = async (id: string) => {
    try {
      const newProject = await api.getProject(id);
      setProjects((prev) => [newProject, ...prev]);
    } catch (err) {
      console.error("Failed to load newly created project", err);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;
    const interval = setInterval(async () => {
      const processingProjects = projects.filter((p) => p.status === "PROCESSING");
      if (processingProjects.length === 0) return;

      for (const proj of processingProjects) {
        try {
          const updated = await api.getProject(proj.id);
          if (updated.status !== "PROCESSING") {
            setProjects((prev) => prev.map((p) => (p.id === proj.id ? updated : p)));
          }
        } catch (err) {
          console.warn(`Project ${proj.id} no longer exists, removing from list`);
          setProjects((prev) => prev.filter((p) => p.id !== proj.id));
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [projects, loggedIn]);

  const handleRegenerate = async (projectId: string) => {
    const feedback = feedbackDrafts[projectId] || "";
    try {
      await api.regenerateProject(projectId, feedback);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: "PROCESSING" } : p))
      );
      setFeedbackDrafts((prev) => ({ ...prev, [projectId]: "" }));
    } catch (err) {
      console.error("Failed to regenerate", err);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setLoggedIn(false);
    setProjects([]);
  };

  if (loggedIn === null) {
    return (
      <main className="max-w-sm mx-auto px-8 pt-32 text-center">
        <p className="text-slate font-mono text-sm">Opening the desk…</p>
      </main>
    );
  }

  if (!loggedIn) {
    return <LoginScreen onLogin={() => window.location.reload()} />;
  }

  return (
    <main className="max-w-3xl mx-auto px-8 py-10">
      <header className="flex justify-between items-end border-b-2 border-ink pb-4 mb-8">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-wire uppercase mb-1">
            Est. Editorial Desk
          </p>
          <h1 className="font-display text-3xl font-bold text-ink">Agentic Draft</h1>
        </div>
        <div className="text-right space-y-0.5">
          <Link href="/settings" className="block font-mono text-xs text-slate hover:text-wire underline">
            preferences
          </Link>
          <button
            onClick={handleLogout}
            className="font-mono text-xs text-slate hover:text-wire underline"
          >
            log out
          </button>
        </div>
      </header>

      <DraftForm onProjectCreated={addProjectToList} />

      <div className="mt-8 space-y-5">
        {loading && (
          <p className="font-mono text-sm text-slate">Pulling the archive…</p>
        )}

        {!loading && projects.length === 0 && (
          <div className="bg-white border border-dashed border-paper-dim rounded-sm p-8 text-center">
            <p className="font-display text-lg font-semibold text-ink mb-1">
              Open your next desk
            </p>
            <p className="font-mono text-xs text-slate">
              Paste notes, a link, or a transcript to begin.
            </p>
          </div>
        )}

        {projects.map((project) => {
          const drafts = project.drafts || [];
          const versionIndex = selectedVersion[project.id] ?? 0;
          const currentDraft = drafts[versionIndex];

          return (
            <div
              key={project.id}
              className="relative bg-white border border-paper-dim rounded-sm p-6"
            >
              <Stamp status={project.status} />

              <p className="font-mono text-[10px] text-slate mb-3">
                PROJECT #{project.id.slice(0, 8)} — filed {formatDate(project.createdAt)}
              </p>

              <p className="text-ink text-sm mb-4 line-clamp-2">{project.sourceContent}</p>

              {project.status === "COMPLETED" && drafts.length > 0 && (
                <>
                  {drafts.length > 1 && (
                    <div className="flex gap-1.5 flex-wrap mb-4">
                      {drafts.map((d, i) => (
                        <button
                          key={d.id}
                          onClick={() =>
                            setSelectedVersion((prev) => ({ ...prev, [project.id]: i }))
                          }
                          className={`font-mono text-[11px] px-2.5 py-1 rounded-sm ${
                            i === versionIndex
                              ? "bg-ink text-paper"
                              : "border border-paper-dim text-slate hover:border-wire hover:text-wire"
                          }`}
                        >
                          {i === 0 ? "Edition " + drafts.length + " · latest" : `Edition ${drafts.length - i}`}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="border-l-[3px] border-wire pl-4 mb-4">
                    <p className="text-ink text-[15px] leading-relaxed whitespace-pre-wrap">
                      {currentDraft?.content}
                    </p>
                    {currentDraft?.userFeedback && (
                      <p className="font-mono text-xs text-slate mt-2 italic">
                        revised from: "{currentDraft.userFeedback}"
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center font-mono text-xs text-slate border-t border-paper-dim pt-3 mb-4">
                    <span>
                      editor's mark:{" "}
                      {currentDraft?.qualityScore != null ? (
                        <span className="text-wire font-semibold">
                          {currentDraft.qualityScore}/10
                        </span>
                      ) : (
                        "—"
                      )}
                    </span>
                    <span className="text-slate">{project.summary ? "summary on file" : ""}</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. make it punchier, remove hashtags"
                      className="flex-1 border border-paper-dim rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wire focus:border-wire"
                      value={feedbackDrafts[project.id] || ""}
                      onChange={(e) =>
                        setFeedbackDrafts({ ...feedbackDrafts, [project.id]: e.target.value })
                      }
                    />
                    <button
                      onClick={() => handleRegenerate(project.id)}
                      className="bg-ink text-paper text-sm font-medium rounded-sm px-4 py-2 whitespace-nowrap hover:bg-black transition-colors"
                    >
                      Revise
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

function Stamp({ status }: { status: Project["status"] }) {
  const styles = {
    PROCESSING: "border-amber text-amber",
    COMPLETED: "border-verified text-verified",
    FAILED: "border-wire text-wire",
  };
  const labels = {
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
  };
  return (
    <span
      className={`absolute top-4 right-4 border-2 rounded-sm font-mono text-[11px] font-bold tracking-wide px-2.5 py-1 rotate-3 ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}