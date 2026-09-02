"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResendMessage("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await api.signup(email, password);
        setMessage(res.message);
        setSignupEmail(email);
      } else {
        await api.login(email, password);
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (targetEmail: string) => {
    setResendMessage("");
    try {
      const res = await api.resendVerification(targetEmail);
      setResendMessage(res.message);
    } catch (err: any) {
      setResendMessage(err.message || "Failed to resend");
    }
  };

  return (
    <main className="max-w-sm mx-auto px-8 pt-32">
      <div className="text-center mb-10">
        <p className="font-mono text-xs tracking-[0.2em] text-wire uppercase mb-2">
          Est. Editorial Desk
        </p>
        <h1 className="font-display text-4xl font-semibold text-ink">
          Agentic Draft
        </h1>
        <p className="text-slate text-sm mt-2">
          {mode === "login" ? "Log in to your desk." : "Open a new desk."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-paper-dim rounded-sm p-6 space-y-4 shadow-[0_1px_3px_rgba(22,27,34,0.06)]"
      >
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-slate mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-paper-dim rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wire focus:border-wire"
            required
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-slate mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-paper-dim rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wire focus:border-wire"
            required
            minLength={8}
          />
        </div>

        {error && (
          <div className="space-y-2">
            <p className="text-sm text-wire font-medium border-l-2 border-wire pl-2">
              {error}
            </p>
            {error === "Please verify your email before logging in" && (
              <button
                type="button"
                onClick={() => handleResend(email)}
                className="text-sm text-wire hover:underline"
              >
                Resend verification email
              </button>
            )}
          </div>
        )}

        {message && (
          <p className="text-sm text-verified font-medium border-l-2 border-verified pl-2">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper font-medium rounded-sm py-2.5 text-sm tracking-wide hover:bg-wire transition-colors disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>

      {message && mode === "signup" && (
        <button
          onClick={() => handleResend(signupEmail)}
          className="w-full text-sm text-wire mt-3 hover:underline"
        >
          Didn't get the email? Resend it
        </button>
      )}

      {resendMessage && (
        <p className="text-sm text-slate mt-2 text-center">{resendMessage}</p>
      )}

      <button
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
          setMessage("");
          setResendMessage("");
        }}
        className="w-full text-sm text-slate mt-5 hover:text-wire transition-colors"
      >
        {mode === "login" ? "Need an account? " : "Already have an account? "}
        <span className="text-wire font-medium">
          {mode === "login" ? "Sign up" : "Log in"}
        </span>
      </button>
    </main>
  );
}