import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getTacticalBriefing(userStatus: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the Strategic AI for the #42 Alliance. Provide a short, atmospheric tactical briefing for a high-ranking commander. 
      The current status is: ${userStatus}. 
      Keep it brief, sci-fi themed, and use technical terminology. Mention "The 42 Protocols" where appropriate.
      Format the response with a [HEADING] and [INTEL] section.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "SYSTEM ERROR: FAILED TO RETRIEVE INTEL.";
  } catch (error) {
    console.error("AI Briefing Error:", error);
    return "COMMUNICATIONS DOWN: CHECK SECURE LINK.";
  }
}
