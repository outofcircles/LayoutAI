import { GoogleGenAI } from "@google/genai";
import { FloorPlan, AIAnalysisResult } from "../types";

export const analyzeLayout = async (floorPlan: FloorPlan): Promise<AIAnalysisResult> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please configure your API key to use AI features.");
  }

  // Initialize the client only when the function is called
  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      Analyze the following floor plan JSON data for an apartment. 
      The unit scale is 10 units = 1 foot.
      
      Floor Plan Data:
      ${JSON.stringify({
        rooms: floorPlan.rooms.map(r => ({
          type: r.type,
          label: r.label,
          dimensions: `${r.width / 10}ft x ${r.height / 10}ft`,
          area: `${(r.width/10) * (r.height/10)} sqft`,
          position: `x:${r.x}, y:${r.y}`
        })),
        totalArea: floorPlan.rooms.reduce((acc, r) => acc + ((r.width/10)*(r.height/10)), 0)
      })}

      Provide a JSON response with the following structure:
      {
        "score": number (0-100),
        "critique": "A brief paragraph summarizing the pros and cons.",
        "suggestions": ["List of 3-5 specific actionable improvements"]
      }
      Focus on plumbing grouping, circulation paths, and room aspect ratios.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);

    return {
      score: result.score || 0,
      critique: result.critique || "Could not analyze.",
      suggestions: result.suggestions || []
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze layout.");
  }
};