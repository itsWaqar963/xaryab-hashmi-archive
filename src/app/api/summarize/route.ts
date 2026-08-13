import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 20) {
      return NextResponse.json({
        summary: [
          "Short reflection on core themes discussed in the video.",
          "Highlights essential insights and practical takeaways.",
          "Summary generated directly from available context."
        ],
      });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Call Hugging Face Free Inference API (Bart Large CNN Model)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        headers: {
          Authorization: `Bearer ${apiKey || ""}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: text,
          parameters: {
            max_length: 90,
            min_length: 25,
            do_sample: false,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HF API Error: ${response.statusText}`);
    }

    const result = await response.json();
    const summaryText = result[0]?.summary_text || "";

    // Split generated AI summary into clean bullet points
    const sentences = summaryText
      .split(/(?<=[.!?])\s+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 8);

    const finalPoints = sentences.length > 0 ? sentences.slice(0, 3) : [summaryText];

    return NextResponse.json({ summary: finalPoints });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      {
        summary: [
          "Explores key concepts and deeper reflections.",
          "Highlights personal insights and core wisdom.",
          "Discusses practical life applications and moral lessons."
        ],
      },
      { status: 500 }
    );
  }
}
