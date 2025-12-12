import React, { useState, useEffect } from 'react';
import { Term } from '../types';
import { X, Copy, Check, Sparkles, Send, Trash2 } from 'lucide-react';
import { explainTermWithAI } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface TermModalProps {
  term: Term | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const TermModal: React.FC<TermModalProps> = ({ term, onClose, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');

  // Reset state when term changes
  useEffect(() => {
    setAiExplanation(null);
    setIsLoadingAi(false);
    setUserQuestion('');
    setCopied(false);
  }, [term]);

  if (!term) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(term.examplePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (window.confirm(`'${term.word}' 용어를 정말 삭제하시겠습니까?`)) {
      onDelete(term.id);
    }
  };

  const handleAiAsk = async () => {
    if (isLoadingAi) return;
    setIsLoadingAi(true);
    
    // Get key from local storage
    const userApiKey = localStorage.getItem('userApiKey') || undefined;
    
    const result = await explainTermWithAI(term, userQuestion || undefined, userApiKey);
    setAiExplanation(result);
    setIsLoadingAi(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start sticky top-0 z-10">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 mb-2">
              {term.category}
            </span>
            <h2 className="text-3xl font-bold text-slate-800">{term.word}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
              title="이 용어 삭제"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow p-6 space-y-8">
          
          {/* Definition Section */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">📖</span>
              사전적 의미
            </h3>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {term.definition}
            </p>
          </section>

          {/* Analogy Section - The Core Value */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm">💡</span>
              쉽게 이해하기 (비유)
            </h3>
            <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
              <p className="text-slate-700 font-medium text-lg leading-relaxed">
                "{term.analogy}"
              </p>
              <p className="mt-2 text-slate-600 text-sm">
                ➡️ {term.simpleExplanation}
              </p>
            </div>
          </section>

          {/* Prompt Section */}
          <section>
             <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">🤖</span>
              AI에게 바로 써먹는 주문(Prompt)
            </h3>
            <div className="relative bg-slate-800 text-slate-200 p-5 rounded-xl font-mono text-sm leading-relaxed shadow-inner">
              <p className="whitespace-pre-wrap">{term.examplePrompt}</p>
              <button 
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-all flex items-center gap-2 text-xs"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "복사됨" : "복사"}
              </button>
            </div>
          </section>

          {/* AI Tutor Section */}
          <section className="pt-6 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              AI 튜터에게 물어보기
            </h3>
            
            {!aiExplanation ? (
              <div className="bg-indigo-50 rounded-2xl p-6 text-center border border-indigo-100">
                <p className="text-indigo-800 mb-4 font-medium">
                  이 용어가 아직도 헷갈리시나요? <br/>
                  혹은 내 상황에 딱 맞는 설명이 필요하신가요?
                </p>
                
                <div className="flex gap-2 max-w-lg mx-auto mb-4">
                  <input 
                    type="text" 
                    placeholder="예: '이걸로 쇼핑몰 만들 때 주의할 점은?' (선택사항)"
                    className="flex-grow px-4 py-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                  />
                  <button 
                    onClick={handleAiAsk}
                    disabled={isLoadingAi}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoadingAi ? '생각중...' : <Send className="w-4 h-4"/>}
                  </button>
                </div>
                
                <button 
                   onClick={() => handleAiAsk()}
                   className="text-xs text-indigo-500 hover:underline"
                >
                   질문 없이 그냥 더 자세한 설명 듣기
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <div className="prose prose-sm prose-slate max-w-none">
                  <ReactMarkdown>{aiExplanation}</ReactMarkdown>
                </div>
                <button 
                  onClick={() => setAiExplanation(null)}
                  className="mt-4 text-sm text-slate-400 hover:text-slate-600 underline"
                >
                  다른 질문 하기
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermModal;
