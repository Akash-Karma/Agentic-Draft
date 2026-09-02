"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Send } from "lucide-react";

export default function DraftForm({ onProjectCreated }: { onProjectCreated: (id: string) => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError("");
    setLoading(true);
    try {
      const { projectId } = await api.createProject(content);
      onProjectCreated(projectId);
      setContent("");
    } catch (err: any) {
      setError(err.message || "Couldn't start the workflow. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-sm border border-paper-dim">
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wide text-slate mb-2">
          Source material
        </label>
        <textarea
          className="w-full h-32 p-4 border border-paper-dim rounded-sm focus:outline-none focus:ring-1 focus:ring-wire focus:border-wire text-ink text-sm placeholder:text-slate"
          placeholder="Paste notes, a YouTube link, or an article URL..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-wire font-medium border-l-2 border-wire pl-2">
          {error}
        </p>
      )}

      <button
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-ink hover:bg-black text-paper py-3 rounded-sm font-medium text-sm tracking-wide transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
        {loading ? "Sending to the desk…" : "Draft this"}
      </button>
    </form>
  );
}