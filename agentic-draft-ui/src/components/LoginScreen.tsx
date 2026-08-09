"use client";
import { useState } from "react";
import { setApiKey, api } from "@/lib/api";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setApiKey(key);

    try {
      // Verify the key actually works by hitting a real protected endpoint
      await api.getProjects();
      onLogin();
    } catch {
      setError("Invalid API key. Please try again.");
      setApiKey(""); // clear the bad key
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-sm mx-auto p-8 mt-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Agentic Draft</h1>
      <p className="text-gray-500 mb-6">Enter your API key to continue.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Your API key"
          className="w-full border rounded-lg px-4 py-2"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-lg py-2 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Continue"}
        </button>
      </form>
    </main>
  );
}