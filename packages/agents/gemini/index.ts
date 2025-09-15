import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export default async function main(content: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: content,
    config: {
      thinkingConfig: {
        thinkingBudget: 0, 
      },
    }
  });
  console.log(response.text);
}