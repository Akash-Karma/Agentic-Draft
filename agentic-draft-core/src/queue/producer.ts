import { Queue } from "bullmq";
import { redisConnection } from "./connection";

export const draftQueue = new Queue("agentic-draft-queue", {
  connection: redisConnection,
});

export const addDraftJob = async (
  sourceContent: string,
  projectId: string,
  userId: string,
  feedback?: string,
  existingSummary?: string
) => {
  await draftQueue.add("process-content", {
    sourceContent,
    projectId,
    userId,
    feedback,
    existingSummary,
  });
  console.log(`📝 Job added to queue for project: ${projectId}`);
};