import * as dotenv from "dotenv";
dotenv.config();
import { requireUser } from "./middleware/auth";
import express from "express";
import { addDraftJob } from "./queue/producer";
import { prisma } from "./lib/prisma";
import cookieParser from "cookie-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { signToken } from "./lib/jwt";
import { sendVerificationEmail } from "./lib/mailer";

const app = express();
app.use(express.json());

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 8) {
      return res.status(400).json({ error: "Email and a password of at least 8 characters are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: { email, passwordHash, verificationToken, isVerified: false },
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: "Account created. Please check your email to verify your account." });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Verify email
app.get("/api/verify", async (req, res) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ error: "Missing token" });

    const user = await prisma.user.findUnique({ where: { verificationToken: token } });
    if (!user) return res.status(400).json({ error: "Invalid or expired verification link" });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Resend verification email
app.post("/api/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });

    // Don't reveal whether the email exists — same generic response either way
    if (!user || user.isVerified) {
      return res.json({ message: "If an account exists and is unverified, a new verification email has been sent." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    await sendVerificationEmail(email, verificationToken);

    res.json({ message: "If an account exists and is unverified, a new verification email has been sent." });
  } catch (error) {
    console.error("Resend Verification Error:", error);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: "Invalid email or password" });

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email before logging in" });
    }

    const token = signToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: "Logged in successfully" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// 1. Endpoint to initiate the AI workflow

app.post("/api/draft", requireUser, async (req, res) => {
  const { sourceContent } = req.body;
  const userId = (req as any).userId;

  if (!sourceContent) {
    return res.status(400).json({ error: "Missing sourceContent" });
  }

  try {
    const project = await prisma.project.create({
      data: {
        sourceContent,
        status: "PROCESSING",
        userId
      }
    });

    await addDraftJob(sourceContent, project.id, userId);

    console.log(`📝 Job added to queue for project: ${project.id}`);

    res.status(202).json({
      message: "Agentic workflow initiated",
      projectId: project.id
    });
  } catch (error) {
    console.error("Queue/DB Error:", error);
    res.status(500).json({ error: "Failed to initiate project" });
  }
});

// 2. Endpoint to regenerate a draft with user feedback
app.post("/api/project/:id/regenerate", requireUser, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { feedback } = req.body;
    const id = req.params.id as string;

    const project = await prisma.project.findFirst({ where: { id, userId } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    await prisma.project.update({
      where: { id: project.id },
      data: { status: "PROCESSING" },
    });

    await addDraftJob(project.sourceContent, project.id, userId, feedback, project.summary || undefined);

    res.status(202).json({ message: "Regeneration started" });
  } catch (error) {
    console.error("Regenerate Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. Endpoint to fetch a single project's details/status
app.get("/api/project/:id", requireUser, async (req, res) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { drafts: { orderBy: { createdAt: "desc" } } },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. Endpoint to fetch all of the current user's projects
app.get("/api/projects", requireUser, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { drafts: { orderBy: { createdAt: "desc" } } },
    });
    res.json(projects);
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current preferences (returns null if none set yet)
app.get("/api/preferences", requireUser, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const prefs = await prisma.userPreferences.findUnique({ where: { userId } });
    res.json(prefs);
  } catch (error) {
    console.error("Fetch Preferences Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create or update preferences
app.put("/api/preferences", requireUser, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { tone, length, hashtags, emojiUse, customInstructions } = req.body;

    const prefs = await prisma.userPreferences.upsert({
      where: { userId },
      update: { tone, length, hashtags, emojiUse, customInstructions },
      create: { userId, tone, length, hashtags, emojiUse, customInstructions },
    });

    res.json(prefs);
  } catch (error) {
    console.error("Update Preferences Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});