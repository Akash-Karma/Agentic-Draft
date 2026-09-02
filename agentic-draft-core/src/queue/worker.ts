import * as dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { redisConnection } from "./connection";
import { graph } from "../agents/graph";
import { prisma } from "../lib/prisma";

const worker = new Worker(
  "agentic-draft-queue",
  async (job) => {
    const { sourceContent, projectId, userId, feedback, existingSummary } = job.data;
    console.log(`🚀 Processing job ${job.id} for project ${projectId}`);

    try {
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId },
      });

      const result = await graph.invoke({
        sourceContent: sourceContent,
        summary: existingSummary || undefined, // reuse summary on regenerate, skips Analyst
        iteration: 0,
        preferences: preferences,
        userFeedback: feedback || null,
      });

      // Save this generation as a new Draft version, not an overwrite
      await prisma.draft.create({
        data: {
          projectId,
          content: result.drafts.content,
          qualityScore: result.qualityScore,
          userFeedback: feedback || null,
        },
      });

      await prisma.project.update({
        where: { id: projectId },
        data: {
          summary: result.summary,
          status: "COMPLETED",
        },
      });

      console.log(`✅ Job ${job.id} saved to Postgres as new Draft!`);
    } catch (error) {
      console.error(`❌ Worker Error:`, error);
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "FAILED" },
      });
    }
  },
  { connection: redisConnection }
);