"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api, UserPreferences } from "@/lib/api";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getPreferences()
      .then((data) => setPrefs(data || {}))
      .catch((err) => console.error("Failed to load preferences", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.updatePreferences(prefs);
      setSaved(true);
    } catch (err) {
      console.error("Failed to save preferences", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-lg mx-auto p-8">
        <p className="text-gray-400 italic">Loading preferences...</p>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto p-8 space-y-6">
      <div>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      <header>
        <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
        <p className="text-gray-500 text-sm">
          These settings shape how the AI writes your LinkedIn posts.
        </p>
      </header>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
          <select
            value={prefs.tone || ""}
            onChange={(e) => setPrefs({ ...prefs, tone: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Default</option>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="witty">Witty</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
          <select
            value={prefs.length || ""}
            onChange={(e) => setPrefs({ ...prefs, length: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Default</option>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long-form">Long-form</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emoji use</label>
          <select
            value={prefs.emojiUse || ""}
            onChange={(e) => setPrefs({ ...prefs, emojiUse: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Default</option>
            <option value="none">None</option>
            <option value="minimal">Minimal</option>
            <option value="frequent">Frequent</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="hashtags"
            type="checkbox"
            checked={prefs.hashtags ?? true}
            onChange={(e) => setPrefs({ ...prefs, hashtags: e.target.checked })}
          />
          <label htmlFor="hashtags" className="text-sm text-gray-700">
            Include hashtags
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom instructions
          </label>
          <textarea
            value={prefs.customInstructions || ""}
            onChange={(e) => setPrefs({ ...prefs, customInstructions: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            rows={4}
            placeholder="e.g. always end with a question, avoid buzzwords like 'synergy'"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 text-white rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
        {saved && <span className="text-green-600 text-sm">Saved!</span>}
      </div>
    </main>
  );
}