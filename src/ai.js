// src/ai.js

/**
 * AI Engine for CodeSage (Gemini-powered)
 * Requires Node.js 18+ (native fetch)
 */
import dotenv from 'dotenv';
import { GEMINI_API_KEY } from "./config/geminiKey.js";

dotenv.config();

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY not found. Falling back to basic suggestions.");
}

/**
 * Generate AI suggestions using Gemini
 */
export async function generateSuggestions(issues, code) {
  if (!issues || issues.length === 0) return [];

  // Fallback if no API key
  if (!GEMINI_API_KEY) {
    return issues.map(issue => `⚠️ ${issue.message || "Check this code."}`);
  }

  const prompt = `
You are CodeSage, a real-time AI code mentor.

Your job:
- Give short, actionable suggestions
- Focus on best practices and error handling
- Be clear and developer-friendly

Code:
${code}

Issues:
${issues.map((i, idx) =>
  `${idx + 1}. ${i.type} ${i.name ? "(" + i.name + ")" : ""} at line ${i.loc?.start?.line || "?"}`
).join("\n")}

Return each suggestion on a new line.
`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await res.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

  } catch (err) {
    console.error("❌ Gemini API error:", err.message);

    // Fallback
    return issues.map(issue => `⚠️ ${issue.message || "Check this code."}`);
  }
}

// export default generateSuggestions;