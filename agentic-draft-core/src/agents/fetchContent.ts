import { YoutubeTranscript } from "youtube-transcript";
import { extract } from "@extractus/article-extractor";
import { AgentState } from "./state";

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function isUrl(text: string): boolean {
  try {
    new URL(text.trim());
    return true;
  } catch {
    return false;
  }
}

export const fetchContentNode = async (state: typeof AgentState.State) => {
  const trimmed = state.sourceContent.trim();

  // Not a URL at all — treat as plain pasted text, nothing to fetch
  if (!isUrl(trimmed)) {
    return { status: "Content Ready" };
  }

  const videoId = extractYoutubeId(trimmed);

  // Case 1: YouTube link
  if (videoId) {
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      const fullText = transcriptItems.map(item => item.text).join(" ");
      return { 
        sourceContent: fullText, 
        status: "Transcript Fetched" 
      };
    } catch (err) {
      console.error("Failed to fetch YouTube transcript:", err);
      throw new Error("Could not fetch transcript for this YouTube video. It may not have captions available.");
    }
  }

  // Case 2: Generic article/webpage link
  try {
    const article = await extract(trimmed);
    if (!article?.content) {
      throw new Error("No extractable content found on this page.");
    }
    // article.content is HTML — strip tags for a clean text summary
    const plainText = article.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const fullText = `${article.title || ""}\n\n${plainText}`;
    return { 
      sourceContent: fullText, 
      status: "Article Fetched" 
    };
  } catch (err) {
    console.error("Failed to fetch article content:", err);
    throw new Error("Could not extract readable content from this URL.");
  }
};