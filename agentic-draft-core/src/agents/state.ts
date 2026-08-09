import { Annotation } from "@langchain/langgraph";

export interface UserPreferences {
  tone?: string | null;
  length?: string | null;
  hashtags?: boolean;
  emojiUse?: string | null;
  customInstructions?: string | null;
}

export const AgentState = Annotation.Root({
  sourceContent: Annotation<string>(),
  summary: Annotation<string>(),
  drafts: Annotation<Record<string, any>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  qualityScore: Annotation<number>(),
  iteration: Annotation<number>({
    reducer: (x, y) => y,
    default: () => 0,
  }),
  status: Annotation<string>(),
  preferences: Annotation<UserPreferences | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
});