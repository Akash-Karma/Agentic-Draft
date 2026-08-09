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

function buildPreferencesInstructions(prefs: typeof AgentState.State["preferences"]): string {
  if (!prefs) return "";

  const parts: string[] = [];
  if (prefs.tone) parts.push(`Tone: ${prefs.tone}.`);
  if (prefs.length) parts.push(`Length: ${prefs.length}.`);
  if (prefs.hashtags === false) parts.push(`Do not include hashtags.`);
  if (prefs.emojiUse) parts.push(`Emoji use: ${prefs.emojiUse}.`);
  if (prefs.customInstructions) parts.push(`Additional instructions: ${prefs.customInstructions}`);

  if (parts.length === 0) return "";
  return `\n\nFollow these user preferences strictly:\n${parts.join("\n")}`;
};

export const writerNode = async (state: typeof AgentState.State) => {
  const m = getModel();
  const prefsInstructions = buildPreferencesInstructions(state.preferences);
  const response = await m.invoke(
    `Using this summary: ${state.summary}, create a LinkedIn post.${prefsInstructions}`
  );
  return { 
    drafts: { content: response.content as string }, 
    status: "Drafting Complete" 
  };
};

export const criticNode = async (state: typeof AgentState.State) => {
  const m = getModel();
  const prefsInstructions = buildPreferencesInstructions(state.preferences);
  const response = await m.invoke(
    `Rate this content from 1 to 10 based on quality${prefsInstructions ? " and how well it follows the user's stated preferences below" : ""}. Return only the number.${prefsInstructions}\n\nContent:\n${state.drafts.content}`
  );
  const score = parseFloat(response.content as string);
  return { 
    qualityScore: isNaN(score) ? 0 : score, 
    status: "Review Complete" 
  };
};