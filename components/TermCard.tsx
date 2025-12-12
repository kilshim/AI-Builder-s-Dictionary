import React from 'react';
import { Term } from '../types';
import { BookOpen, Copy, ArrowRight, Lightbulb } from 'lucide-react';

interface TermCardProps {
  term: Term;
  onClick: (term: Term) => void;
}

const TermCard: React.FC<TermCardProps> = ({ term, onClick }) => {
  return (
    <div 
      onClick={() => onClick(term)}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
    >
      <div className={`h-2 w-full ${getCategoryColor(term.category)}`}></div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
            {term.category}
          </span>
          <Lightbulb className="w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
          {term.word}
        </h3>
        
        <p className="text-slate-600 text-sm mb-4 flex-grow line-clamp-3">
          {term.simpleExplanation}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-indigo-600 text-sm font-medium">
          <span className="flex items-center gap-1 group-hover:underline">
            자세히 보기
          </span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case '기획/설계': return 'bg-blue-500';
    case '개발/코딩': return 'bg-emerald-500';
    case '프롬프트/주문': return 'bg-purple-500';
    case '배포/운영': return 'bg-orange-500';
    case '디자인/UI': return 'bg-pink-500';
    case '데이터/분석': return 'bg-cyan-500';
    default: return 'bg-slate-500';
  }
};

export default TermCard;