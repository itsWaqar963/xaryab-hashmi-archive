import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json({
        summary: [
          "Key reflections shared in this session.",
          "Core themes and concepts explored in detail.",
          "Practical insights and spiritual wisdom."
        ]
      });
    }

    // Pure Rule-based NLP Extractor (No External APIs)
    const summary = extractSmartPoints(text);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summarize Route Error:", error);
    return NextResponse.json({
      summary: [
        "Key reflections shared in this session.",
        "Core themes and concepts explored in detail.",
        "Practical insights and spiritual wisdom."
      ]
    });
  }
}

function extractSmartPoints(fullText: string): string[] {
  // 1. Clean links, timestamps, social handles, and hashtags
  const cleanText = fullText
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, "")
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, "")
    .replace(/#\w+/g, "")
    .replace(/[#*_~`]/g, "");

  // 2. Split into clean sentences/lines
  const rawSentences = cleanText
    .split(/(?<=[.!?\n])\s+/)
    .map((s) => s.replace(/^[-*•\d.\s]+/, "").trim())
    .filter((s) => s.length > 20 && s.length < 180);

  // 3. Extract unique, meaningful lines
  const uniquePoints: string[] = [];
  for (const sentence of rawSentences) {
    // Avoid redundant or filler sentences
    const lower = sentence.toLowerCase();
    if (
      !lower.includes("subscribe") &&
      !lower.includes("follow us") &&
      !lower.includes("like, share") &&
      !lower.includes("comment below")
    ) {
      if (!uniquePoints.includes(sentence)) {
        uniquePoints.push(sentence);
      }
    }
    if (uniquePoints.length === 3) break;
  }

  // 4. Fallback in case description is too short
  if (uniquePoints.length === 0) {
    return [
      `Overview: ${cleanText.slice(0, 80)}...`,
      "Explores essential themes and core discussions.",
      "Key reflections and practical life takeaways."
    ];
  }

  if (uniquePoints.length === 1) {
    uniquePoints.push("Explores core concepts and deeper reflections.");
    uniquePoints.push("Discusses practical insights and moral lessons.");
  } else if (uniquePoints.length === 2) {
    uniquePoints.push("Highlights practical takeaways and key reflections.");
  }

  return uniquePoints;
}
