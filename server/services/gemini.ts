import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_ENV_VAR || "" 
});

export interface FormattedQuestion {
  question_text: string;
  correct_answer: string;
  other_options: string[];
}

export async function formatQuestionText(rawQuestionData: any): Promise<FormattedQuestion> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
    }

    const systemPrompt = `You are a question formatting expert for ALCPT (American Language Course Placement Test) listening comprehension questions.

Your task is to clean and format question data by:
1. Remove answer prefixes like "a.", "b.", "c.", "d." from answer options
2. Ensure question text is clear and properly formatted
3. Ensure the correct answer is properly formatted without prefixes
4. Maintain the educational quality and authenticity of ALCPT questions

Input format: Raw question data with potentially inconsistent formatting
Output format: Clean, structured JSON

Respond with JSON in this exact format:
{
  "question_text": "cleaned question text",
  "correct_answer": "cleaned correct answer without prefix",
  "other_options": ["option1", "option2", "option3"]
}`;

    const userPrompt = `Format this ALCPT question data:
${JSON.stringify(rawQuestionData, null, 2)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            question_text: { type: "string" },
            correct_answer: { type: "string" },
            other_options: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["question_text", "correct_answer", "other_options"]
        },
      },
      contents: userPrompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const formattedData: FormattedQuestion = JSON.parse(rawJson);
    return formattedData;

  } catch (error) {
    console.error("Error formatting question with Gemini:", error);
    throw new Error(`Failed to format question: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


