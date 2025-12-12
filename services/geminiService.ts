import { GoogleGenAI, Type } from "@google/genai";
import { Term, Category } from '../types';

// Helper to safely access environment variables in various environments (Vite, Next.js, CRA)
export const getSystemApiKey = (): string => {
  try {
    // Standard Node/Webpack/CRA/Next.js environment
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }
  return '';
};

// Helper to get the best available API key
const getApiKey = (userKey?: string) => {
  if (userKey && userKey.trim().length > 0) {
    return userKey;
  }
  return getSystemApiKey();
};

const MODEL_NAME = 'gemini-2.5-flash';

// 1. Explain existing term
export const explainTermWithAI = async (term: Term, userQuestion?: string, userApiKey?: string): Promise<string> => {
  try {
    const apiKey = getApiKey(userApiKey);
    if (!apiKey) return "API 키가 설정되지 않았습니다. 우측 상단 설정 버튼을 눌러 키를 입력해주세요.";

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = userQuestion 
      ? `
        단어: "${term.word}"
        사용자 질문: "${userQuestion}"
        
        당신은 "친절한 IT 선생님"입니다. 개발 지식이 없는 초보자에게 이 단어에 대해 사용자의 질문에 맞춰 설명해주세요.
        어려운 용어는 피하고, 일상적인 비유를 들어주세요. 말투는 친절하고 격려하는 톤으로 해주세요.
      `
      : `
        단어: "${term.word}" (카테고리: ${term.category})
        
        당신은 "친절한 IT 선생님"입니다. 개발 지식이 없는 초보자가 이 단어를 이해할 수 있도록 도와주세요.
        1. 이 단어가 실제 개발 현장에서 구체적으로 어떻게 쓰이는지 예시 상황을 하나 들어주세요.
        2. 이 단어와 관련된 초보자가 자주 하는 실수나 오해를 하나 알려주세요.
        3. 이 기술/개념을 AI에게 시킬 때 쓸 수 있는 아주 구체적인 프롬프트 템플릿을 하나 더 만들어주세요.
        
        말투는 친절하고 정중하게(해요체) 해주세요. 마크다운을 사용해서 가독성 있게 꾸며주세요.
      `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "죄송합니다. 설명을 불러오는 데 실패했습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 연결에 실패했습니다. API 키를 확인하거나 잠시 후 다시 시도해주세요.";
  }
};

// 2. Generate NEW term structure
export const generateNewTerm = async (keyword: string, userApiKey?: string): Promise<Term | null> => {
  try {
     const apiKey = getApiKey(userApiKey);
    if (!apiKey) throw new Error("API Key Missing");

    const ai = new GoogleGenAI({ apiKey });

    // Schema matching the 'Term' interface
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `
        "${keyword}"라는 개발/IT 용어에 대한 설명을 초보자(Non-tech) 눈높이에서 작성해줘.
        JSON 형식으로 반환해야 해.
        
        Category는 다음 중 하나를 골라: '기획/설계', '개발/코딩', '프롬프트/주문', '배포/운영', '디자인/UI', '데이터/분석'.
        
        fields:
        - word: 용어 이름 (한글 포함)
        - category: 위 카테고리 중 1개
        - definition: 사전적 정의 (1-2문장)
        - simpleExplanation: 초등학생도 이해할 수 있는 쉬운 설명
        - analogy: 실생활 비유 (가장 중요한 부분)
        - examplePrompt: 이 개념을 AI에게 요청할 때 쓸 수 있는 구체적인 프롬프트 예시
        - tags: 관련 태그 3개 배열
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            category: { type: Type.STRING, enum: Object.values(Category) },
            definition: { type: Type.STRING },
            simpleExplanation: { type: Type.STRING },
            analogy: { type: Type.STRING },
            examplePrompt: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["word", "category", "definition", "simpleExplanation", "analogy", "examplePrompt", "tags"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    return {
      id: Date.now().toString(), // Simple ID generation
      ...data
    } as Term;

  } catch (error) {
    console.error("Generate Term Error:", error);
    return null;
  }
}