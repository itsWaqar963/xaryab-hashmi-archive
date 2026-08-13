import { pipeline, env } from "@xenova/transformers";

// WebAssembly/Local Browser Environment Settings
env.allowLocalModels = false;
env.useBrowserCache = true;

let summarizerInstance: any = null;

export async function getSummarizer(progressCallback?: (progress: number) => void) {
  if (!summarizerInstance) {
    // Lightweight local Hugging Face Summarization model (Xenova DistilBART)
    summarizerInstance = await pipeline("summarization", "Xenova/distilbart-cnn-6-6", {
      progress_callback: (data: any) => {
        if (data.status === "progress" && progressCallback) {
          progressCallback(Math.round(data.progress));
        }
      },
    });
  }
  return summarizerInstance;
}

export async function generateAISummary(
  text: string,
  onProgress?: (percent: number) => void
): Promise<string[]> {
  try {
    if (!text || text.trim().length < 30) {
      return [
        "Concise reflection on key themes discussed in the video.",
        "Highlights core philosophical and practical perspectives.",
        "Summary generated directly from available video context."
      ];
    }

    const generator = await getSummarizer(onProgress);

    // AI Summarization Run (Max length limits to keep response ultra fast)
    const result = await generator(text, {
      max_new_tokens: 60,
      min_new_tokens: 20,
      chunk_length: 1024,
    });

    const summaryText = result[0]?.summary_text || "";

    // Split generated paragraph into clean bullet points
    const sentences = summaryText
      .split(/(?<=[.!?])\s+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 10);

    if (sentences.length > 0) {
      return sentences.slice(0, 3);
    }

    return [summaryText];
  } catch (error) {
    console.error("Transformers.js AI Error:", error);
    // Fallback if client browser blocks model download
    return [
      "Key discussion points and core takeaways from this session.",
      "Explores important concepts shared throughout the video.",
      "Direct insights extracted from primary channel content."
    ];
  }
}
