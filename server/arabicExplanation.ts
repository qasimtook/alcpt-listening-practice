import { GoogleGenAI } from "@google/genai";
import type { Question } from "@shared/schema";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface ArabicExplanation {
  الإجابة_الصحيحة: string;
  التحليل_اللغوي: {
    الكلمات_المفتاحية: Array<{
      الكلمة_في_السؤال: string;
      الكلمة_في_الإجابة: string;
      العلاقة: string;
    }>;
    التركيب_النحوي: string;
  };
  شرح_الإجابة_الصحيحة: {
    السبب_الرئيسي: string;
    الدليل_من_السؤال: string;
    المعنى_الكامل: string;
  };
  تحليل_الخيارات_الخاطئة: {
    الخيار_الأول: {
      الخيار: string;
      سبب_الخطأ: string;
    };
    الخيار_الثاني: {
      الخيار: string;
      سبب_الخطأ: string;
    };
    الخيار_الثالث: {
      الخيار: string;
      سبب_الخطأ: string;
    };
  };
  القاعدة_اللغوية: string;
  نصيحة_للطالب: string;
}

export async function generateArabicExplanation(question: Question): Promise<ArabicExplanation> {
  const prompt = `You are an ALCPT English test explanation system. Generate explanations in Arabic following this EXACT structure. DO NOT vary the format.

INPUT:
- Question: ${question.questionText}
- Correct Answer: ${question.correctAnswer}
- Wrong Options: ${JSON.stringify(question.otherOptions)}
- Question Type: ${question.questionType}

REQUIRED OUTPUT STRUCTURE IN ARABIC:

{
  "الإجابة_الصحيحة": "[CORRECT_ANSWER]",
  
  "التحليل_اللغوي": {
    "الكلمات_المفتاحية": [
      {
        "الكلمة_في_السؤال": "",
        "الكلمة_في_الإجابة": "",
        "العلاقة": ""
      }
    ],
    "التركيب_النحوي": ""
  },
  
  "شرح_الإجابة_الصحيحة": {
    "السبب_الرئيسي": "",
    "الدليل_من_السؤال": "",
    "المعنى_الكامل": ""
  },
  
  "تحليل_الخيارات_الخاطئة": {
    "الخيار_الأول": {
      "الخيار": "",
      "سبب_الخطأ": ""
    },
    "الخيار_الثاني": {
      "الخيار": "",
      "سبب_الخطأ": ""
    },
    "الخيار_الثالث": {
      "الخيار": "",
      "سبب_الخطأ": ""
    }
  },
  
  "القاعدة_اللغوية": "",
  
  "نصيحة_للطالب": ""
}

RULES:
1. Use ONLY the structure above - no additions or modifications
2. Write all explanations in clear, simple Arabic
3. Focus on the direct relationship between question keywords and answer
4. Each field must be filled - no empty fields
5. Keep explanations concise but complete
6. Use formal Arabic (الفصحى) not dialect

EXAMPLE:

Question: "The woman made toast for breakfast. What did she use?"
Correct Answer: "bread"
Wrong Options: ["oranges", "eggs", "milk"]

{
  "الإجابة_الصحيحة": "bread",
  
  "التحليل_اللغوي": {
    "الكلمات_المفتاحية": [
      {
        "الكلمة_في_السؤال": "toast",
        "الكلمة_في_الإجابة": "bread",
        "العلاقة": "التوست يُصنع من الخبز المحمص"
      },
      {
        "الكلمة_في_السؤال": "made",
        "الكلمة_في_الإجابة": "use",
        "العلاقة": "صنع الشيء يتطلب استخدام مواد أولية"
      }
    ],
    "التركيب_النحوي": "السؤال يستفسر عن الأداة أو المادة المستخدمة (What)"
  },
  
  "شرح_الإجابة_الصحيحة": {
    "السبب_الرئيسي": "التوست هو خبز محمص، لذا يحتاج إلى خبز لصنعه",
    "الدليل_من_السؤال": "كلمة 'toast' تشير مباشرة إلى الخبز المحمص",
    "المعنى_الكامل": "المرأة صنعت خبزاً محمصاً للإفطار باستخدام الخبز"
  },
  
  "تحليل_الخيارات_الخاطئة": {
    "الخيار_الأول": {
      "الخيار": "oranges",
      "سبب_الخطأ": "البرتقال فاكهة تؤكل طازجة وليست مادة لصنع التوست"
    },
    "الخيار_الثاني": {
      "الخيار": "eggs",
      "سبب_الخطأ": "البيض يُطهى بطرق مختلفة لكن لا يُصنع منه التوست"
    },
    "الخيار_الثالث": {
      "الخيار": "milk",
      "سبب_الخطأ": "الحليب سائل يُشرب أو يُضاف للأطعمة وليس أساساً للتوست"
    }
  },
  
  "القاعدة_اللغوية": "أسئلة What تستخدم للسؤال عن الأشياء أو المواد",
  
  "نصيحة_للطالب": "ابحث عن العلاقة المنطقية المباشرة بين الفعل (made) والناتج (toast)"
}

Now generate the explanation for the provided question.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            الإجابة_الصحيحة: { type: "string" },
            التحليل_اللغوي: {
              type: "object",
              properties: {
                الكلمات_المفتاحية: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      الكلمة_في_السؤال: { type: "string" },
                      الكلمة_في_الإجابة: { type: "string" },
                      العلاقة: { type: "string" }
                    },
                    required: ["الكلمة_في_السؤال", "الكلمة_في_الإجابة", "العلاقة"]
                  }
                },
                التركيب_النحوي: { type: "string" }
              },
              required: ["الكلمات_المفتاحية", "التركيب_النحوي"]
            },
            شرح_الإجابة_الصحيحة: {
              type: "object",
              properties: {
                السبب_الرئيسي: { type: "string" },
                الدليل_من_السؤال: { type: "string" },
                المعنى_الكامل: { type: "string" }
              },
              required: ["السبب_الرئيسي", "الدليل_من_السؤال", "المعنى_الكامل"]
            },
            تحليل_الخيارات_الخاطئة: {
              type: "object",
              properties: {
                الخيار_الأول: {
                  type: "object",
                  properties: {
                    الخيار: { type: "string" },
                    سبب_الخطأ: { type: "string" }
                  },
                  required: ["الخيار", "سبب_الخطأ"]
                },
                الخيار_الثاني: {
                  type: "object",
                  properties: {
                    الخيار: { type: "string" },
                    سبب_الخطأ: { type: "string" }
                  },
                  required: ["الخيار", "سبب_الخطأ"]
                },
                الخيار_الثالث: {
                  type: "object",
                  properties: {
                    الخيار: { type: "string" },
                    سبب_الخطأ: { type: "string" }
                  },
                  required: ["الخيار", "سبب_الخطأ"]
                }
              },
              required: ["الخيار_الأول", "الخيار_الثاني", "الخيار_الثالث"]
            },
            القاعدة_اللغوية: { type: "string" },
            نصيحة_للطالب: { type: "string" }
          },
          required: [
            "الإجابة_الصحيحة",
            "التحليل_اللغوي", 
            "شرح_الإجابة_الصحيحة",
            "تحليل_الخيارات_الخاطئة",
            "القاعدة_اللغوية",
            "نصيحة_للطالب"
          ]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from model");
    }

    const explanation: ArabicExplanation = JSON.parse(rawJson);
    
    // Validate the structure
    if (!validateExplanation(explanation)) {
      throw new Error("Invalid explanation structure returned");
    }

    return explanation;
  } catch (error) {
    console.error("Failed to generate Arabic explanation:", error);
    throw new Error(`Failed to generate Arabic explanation: ${error}`);
  }
}

// Validate the AI output structure
function validateExplanation(explanation: any): boolean {
  const requiredFields = [
    'الإجابة_الصحيحة',
    'التحليل_اللغوي',
    'شرح_الإجابة_الصحيحة',
    'تحليل_الخيارات_الخاطئة',
    'القاعدة_اللغوية',
    'نصيحة_للطالب'
  ];
  
  return requiredFields.every(field => explanation[field] !== undefined);
}

export type { ArabicExplanation };