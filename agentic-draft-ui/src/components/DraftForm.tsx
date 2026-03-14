"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Send } from "lucide-react";

export default function DraftForm({ onProjectCreated }: { onProjectCreated: (id: string) => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const { projectId } = await api.createProject(content);
      onProjectCreated(projectId);
      setContent("");
    } catch (err) {
      alert("Error starting workflow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border">
      <textarea
        className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
        placeholder="Paste your article or notes here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
        {loading ? "Initializing Agent..." : "Generate AI Drafts"}
      </button>
    </form>
  );
}