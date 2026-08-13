export async function generateAISummary(
  text: string,
  onProgress?: (percent: number) => void
): Promise<string[]> {
  try {
    // Only run on browser client side
    if (typeof window === "undefined") {
      return fallbackSummary(text);
    }

    // Dynamic import to prevent SSR build crashes
    const { pipeline, env } = await import("@xenova/transformers");

    env.allowLocalModels = false;
    env.useBrowserCache = true;

    const generator = await pipeline("summarization", "Xenova/distilbart-cnn-6-6", {
      progress_callback: (data: any) => {
        if (data.status === "progress" && onProgress) {
          onProgress(Math.round(data.progress));
        }
      },
    });

    const result = await generator(text, {
      max_new_tokens: 60,
      min_new_tokens: 20,
      chunk_length: 1024,
    });

    const summaryText = result[0]?.summary_text || "";

    const sentences = summaryText
      .split(/(?<=[.!?])\s+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 10);

    return sentences.length > 0 ? sentences.slice(0, 3) : [summaryText];
  } catch (error) {
    console.error("Transformers.js AI Error:", error);
    return fallbackSummary(text);
  }
}

function fallbackSummary(text: string): string[] {
  const points = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 20 && !line.startsWith("http"))
    .slice(0, 3);

  return points.length > 0
    ? points
    : [
        "Explores key concepts and deeper philosophical reflections.",
        "Highlights personal insights and spiritual wisdom.",
        "Discusses practical life applications and moral lessons.",
      ];
}
