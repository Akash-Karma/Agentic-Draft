import * as dotenv from "dotenv";
dotenv.config();

// Important: Import the graph AFTER dotenv.config()
import { graph } from "./agents/graph";

async function testAgenticDraft() {
  console.log("🚀 Starting AgenticDraft Test...");
  console.log("Using API Key:", process.env.GOOGLE_API_KEY ? "Check Passed" : "Check Failed");

  const initialState = {
    sourceContent: "Node.js is a cross-platform, open-source JavaScript runtime environment.",
    iteration: 0
  };

  try {
    const result = await graph.invoke(initialState);
    console.log("✅ Success!");
    console.log("Final Status:", result.status);
    console.log("Draft:", result.drafts.content);
  } catch (error) {
    console.error("❌ Test Failed:", error);
  }
}

testAgenticDraft();