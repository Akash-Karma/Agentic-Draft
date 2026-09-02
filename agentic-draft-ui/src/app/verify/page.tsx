"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    api.verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Verification failed");
      });
  }, [token]);

  return (
    <main className="max-w-sm mx-auto px-8 pt-32 text-center">
      {status === "loading" && (
        <p className="text-slate font-mono text-sm">Verifying your email…</p>
      )}
      {status === "success" && (
        <>
          <p className="text-verified font-medium mb-4">{message}</p>
          <Link href="/" className="text-wire hover:underline text-sm">
            Go to login
          </Link>
        </>
      )}
      {status === "error" && (
        <p className="text-wire font-medium">{message}</p>
      )}
    </main>
  );
}