import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_ENV_VAR || "" 
});

export interface FormattedQuestion {
  question_text: string;
  correct_answer: string;
  other_options: string[];
}

export async function parseBulkQuestionText(bulkText: string): Promise<FormattedQuestion[]> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
    }

    const systemPrompt = `You are an expert at parsing bulk ALCPT question text with mixed formatting into individual structured questions.

Your task is to:
1. **Split the text** into individual questions (ignore headers like "ALCPT Practice Questions", "Reading Comprehension", etc.)
2. **Parse each question** following the same formatting rules as individual questions
3. **Identify question types** based on content (listening vs reading/grammar)
4. **Handle all format variations** in the bulk text

Return a JSON array of questions in this exact format:
[
  {
    "question_index": 1,
    "question_text": "cleaned question text",
    "correct_answer": "correct answer without prefixes",
    "other_options": ["option1", "option2", "option3"],
    "question_type": "listening" | "reading"
  }
]

Question type detection:
- "listening" for questions with dialogue (W:/M:), audio scenarios, or conversational context
- "reading" for grammar, vocabulary, fill-in-blank, or comprehension questions`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question_index: { type: "number" },
              question_text: { type: "string" },
              correct_answer: { type: "string" },
              other_options: {
                type: "array",
                items: { type: "string" }
              },
              question_type: { type: "string" }
            },
            required: ["question_index", "question_text", "correct_answer", "other_options", "question_type"]
          }
        },
      },
      contents: `Parse this bulk ALCPT question text:\n\n${bulkText}`,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(rawJson);

  } catch (error) {
    console.error("Error parsing bulk question text:", error);
    throw new Error(`Failed to parse bulk questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function formatQuestionText(rawQuestionData: any): Promise<FormattedQuestion> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
    }

    const systemPrompt = `You are a question formatting expert for ALCPT (American Language Course Placement Test) questions.

Your task is to clean and format question data from various inconsistent formats by:

1. **Extract the main question text** - Remove numbering (Question 1:, 2., 3., etc.) and clean up the core question
2. **Identify the correct answer** - Look for markers like: *, ✓, [correct], - CORRECT, (correct), or any indication of the right answer
3. **Clean all answer options** - Remove prefixes like a), a., (a), etc. and extract just the content
4. **Handle dialogue format** - For questions with W:/M:/Q: format, extract the actual question after Q:
5. **Maintain question meaning** - Preserve the educational content while standardizing format

Common input patterns you'll see:
- Mixed numbering: "Question 1:", "2.", "3.", etc.
- Various correct answer markers: *, ✓, [correct], - CORRECT
- Different option formats: a), a., (a), a), etc.
- Dialogue questions with W:/M:/Q: format
- Fill-in-the-blank questions
- Reading comprehension with multiple formats

Always extract the core question and answers regardless of formatting inconsistencies.

Respond with JSON in this exact format:
{
  "question_text": "cleaned question text without numbering or formatting",
  "correct_answer": "the correct answer option text only, no prefixes",
  "other_options": ["incorrect option 1", "incorrect option 2", "incorrect option 3"]
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


