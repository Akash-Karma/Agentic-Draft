import * as dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { redisConnection } from "./connection";
import { graph } from "../agents/graph";

const worker = new Worker(
  "agentic-draft-queue",
  async (job) => {
    console.log(`🚀 Processing job ${job.id} for project ${job.data.projectId}`);

    const result = await graph.invoke({
      sourceContent: job.data.sourceContent,
      iteration: 0,
    });

    console.log(`✅ Job ${job.id} completed! Status: ${result.status}`);
    
    // In Step 3, we will save this result to PostgreSQL here
    return result;
  },
  { connection: redisConnection }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});