import * as dotenv from "dotenv";
dotenv.config(); // Ensure this is at the VERY top

import { Worker } from "bullmq";
import { redisConnection } from "./connection";
import { graph } from "../agents/graph";
import { prisma } from "../lib/prisma"; // Use the fixed singleton

const worker = new Worker(
  "agentic-draft-queue",
  async (job) => {
    const { sourceContent, projectId } = job.data;
    console.log(`🚀 Processing job ${job.id} for project ${projectId}`);

    try {
      // 1. Run the Agentic Workflow
      const result = await graph.invoke({
        sourceContent: sourceContent,
        iteration: 0,
      });

      // 2. Update the REAL database record
      await prisma.project.update({
        where: { id: projectId },
        data: {
          summary: result.summary,
          linkedinPost: result.drafts.content,
          status: "COMPLETED",
        },
      });

      console.log(`✅ Job ${job.id} saved to Postgres!`);
    } catch (error) {
      console.error(`❌ Worker Error:`, error);
      // Update status to FAILED so the UI knows
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "FAILED" },
      });
    }
  },
  { connection: redisConnection }
);