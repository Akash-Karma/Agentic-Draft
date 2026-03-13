import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { addDraftJob } from "./queue/producer";

const app = express();
app.use(express.json());

app.post("/api/draft", async (req, res) => {
  const { sourceContent, projectId } = req.body;

  if (!sourceContent) {
    return res.status(400).json({ error: "Missing sourceContent" });
  }

  try {
    await addDraftJob(sourceContent, projectId || "test-project");
    
    res.status(202).json({ 
      message: "Job submitted to background worker",
      status: "queued" 
    });
  } catch (error) {
    console.error("Queue Error:", error);
    res.status(500).json({ error: "Failed to queue job" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});