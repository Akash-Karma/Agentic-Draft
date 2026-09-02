import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState } from "./state";
import { analystNode, writerNode, criticNode } from "./nodes";
import { fetchContentNode } from "./fetchContent";

// Ensure AgentState is passed directly here
const workflow = new StateGraph(AgentState)
  .addNode("fetchContent", fetchContentNode)
  .addNode("analyze", analystNode)
  .addNode("write", writerNode)
  .addNode("critic", criticNode)
  .addConditionalEdges(START, (state) => {
    return state.summary ? "write" : "fetchContent";
  })
  .addEdge("fetchContent", "analyze")
  .addEdge("analyze", "write")
  .addEdge("write", "critic")
  .addConditionalEdges("critic", (state) => {
    if (state.qualityScore >= 8 || state.iteration >= 3) return END;
    return "write";
  });

export const graph = workflow.compile();