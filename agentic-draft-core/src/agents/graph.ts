import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState } from "./state";
import { analystNode, writerNode, criticNode } from "./nodes";

// Ensure AgentState is passed directly here
const workflow = new StateGraph(AgentState)
  .addNode("analyze", analystNode)
  .addNode("write", writerNode)
  .addNode("critic", criticNode)
  .addEdge(START, "analyze")
  .addEdge("analyze", "write")
  .addEdge("write", "critic")
  .addConditionalEdges("critic", (state) => {
    // Note: accessing state values in the router
    if (state.qualityScore >= 8 || state.iteration >= 3) {
      return END;
    }
    return "write";
  });

export const graph = workflow.compile();