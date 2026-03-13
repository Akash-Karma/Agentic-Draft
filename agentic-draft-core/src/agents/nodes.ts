import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState } from "./state";

let model: ChatGoogleGenerativeAI;

const getModel = () => {
  if (!model) {
    model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0.7,
    });
  }
  return model;
};

export const analystNode = async (state: typeof AgentState.State) => {
  const m = getModel();
  const response = await m.invoke(
    `Analyze this content and extract key insights: ${state.sourceContent}`
  );
  return { 
    summary: response.content as string, 
    status: "Analysis Complete",
    iteration: state.iteration + 1 
  };
};

export const writerNode = async (state: typeof AgentState.State) => {
  const m = getModel();
  const response = await m.invoke(
    `Using this summary: ${state.summary}, create a LinkedIn post and a GitHub README summary.`
  );
  return { 
    drafts: { content: response.content as string }, 
    status: "Drafting Complete" 
  };
};

export const criticNode = async (state: typeof AgentState.State) => {
  const m = getModel();
  const response = await m.invoke(
    `Rate this content from 1 to 10 based on quality. Return only the number: ${state.drafts.content}`
  );
  const score = parseFloat(response.content as string);
  return { 
    qualityScore: isNaN(score) ? 0 : score, 
    status: "Review Complete" 
  };
};