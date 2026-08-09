import * as dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { redisConnection } from "./connection";
import { graph } from "../agents/graph";
import { prisma } from "../lib/prisma";

const worker = new Worker(
  "agentic-draft-queue",
  async (job) => {
    const { sourceContent, projectId, userId } = job.data;
    console.log(`🚀 Processing job ${job.id} for project ${projectId}`);

    try {
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId },
      });

      const result = await graph.invoke({
        sourceContent: sourceContent,
        iteration: 0,
        preferences: preferences,
      });

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
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "FAILED" },
      });
    }
  },
  { connection: redisConnection }
);