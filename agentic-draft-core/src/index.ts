import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { addDraftJob } from "./queue/producer";
import { prisma } from "./lib/prisma";

const app = express();
app.use(express.json());

// 1. Endpoint to initiate the AI workflow
app.post("/api/draft", async (req, res) => {
  const { sourceContent } = req.body;

  if (!sourceContent) {
    return res.status(400).json({ error: "Missing sourceContent" });
  }

  try {
    // Save to PostgreSQL first to generate a unique Project ID
    const project = await prisma.project.create({
      data: {
        sourceContent,
        status: "PROCESSING"
      }
    });

    // Add the task to BullMQ using the real database ID
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

// 2. Endpoint to fetch results or check status
app.get("/api/project/:id", async (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});