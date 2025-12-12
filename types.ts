export enum Category {
  PLANNING = '기획/설계',
  CODING = '개발/코딩',
  PROMPTING = '프롬프트/주문',
  INFRA = '배포/운영',
  DESIGN = '디자인/UI',
  DATA_ANALYSIS = '데이터/분석',
}

export interface Term {
  id: string;
  word: string;
  category: Category;
  definition: string; // Official-ish definition
  simpleExplanation: string; // "Explain like I'm 5"
  analogy: string; // Real world analogy
  examplePrompt: string; // A prompt the user can copy
  tags: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}