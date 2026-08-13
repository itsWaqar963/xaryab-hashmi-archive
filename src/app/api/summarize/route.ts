import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 20) {
      return NextResponse.json({
        summary: [
          "Short reflection on core themes discussed in the video.",
          "Highlights essential insights and practical takeaways.",
          "Summary generated directly from available context.",
        ],
      });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      console.error("HUGGINGFACE_API_KEY is missing in environment variables!");
    }

    // Updated Hugging Face Router Endpoint with OpenAI Chat Format
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${apiKey || ""}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          model: "facebook/bart-large-cnn",
          messages: [
            {
              role: "user",
              content: `Summarize the following text into 3 concise bullet points:\n\n${text}`,
            },
          ],
          max_tokens: 120,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF Router API Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const summaryText = result.choices?.[0]?.message?.content || "";

    // Split generated AI summary into clean bullet points
    const sentences = summaryText
      .split(/(?<=[.!?\n])\s+/)
      .map((s: string) => s.replace(/^[-*•\d.\s]+/, "").trim())
      .filter((s: string) => s.length > 8);

    const finalPoints =
      sentences.length > 0 ? sentences.slice(0, 3) : [summaryText];

    return NextResponse.json({ summary: finalPoints });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      {
        summary: [
          "Explores key concepts and deeper reflections.",
          "Highlights personal insights and core wisdom.",
          "Discusses practical life applications and moral lessons.",
        ],
      },
      { status: 500 }
    );
  }
}
