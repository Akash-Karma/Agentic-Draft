import * as dotenv from "dotenv";
dotenv.config();
import { requireUser } from "./middleware/auth";
import express from "express";
import { addDraftJob } from "./queue/producer";
import { prisma } from "./lib/prisma";

const app = express();
app.use(express.json());

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

    await addDraftJob(sourceContent, project.id);
    
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

// 2. Endpoint to fetch a single project's details/status
app.get("/api/project/:id", requireUser, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }
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

// 3. Endpoint to fetch all of the current user's projects
app.get("/api/projects", requireUser, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    res.json(projects);
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});