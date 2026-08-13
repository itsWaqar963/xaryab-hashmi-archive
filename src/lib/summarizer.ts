export async function generateAISummary(
  text: string,
  onProgress?: (percent: number) => void
): Promise<string[]> {
  try {
    if (onProgress) onProgress(30);

    // Calling Next.js Serverless API Route (Which talks to Hugging Face API)
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (onProgress) onProgress(80);

    if (!response.ok) {
      throw new Error("Failed to fetch AI summary");
    }

    const data = await response.json();
    if (onProgress) onProgress(100);

    return data.summary || [
      "Explores key concepts and deeper reflections.",
      "Highlights personal insights and core wisdom.",
      "Discusses practical life applications."
    ];
  } catch (error) {
    console.error("AISummary Error:", error);
    return [
      "Explores key concepts and deeper reflections.",
      "Highlights personal insights and core wisdom.",
      "Discusses practical life applications."
    ];
  }
}
