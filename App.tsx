import React, { useState, useMemo, useEffect } from 'react';
import { TERMS_DATA } from './constants';
import { Category, Term } from './types';
import TermCard from './components/TermCard';
import TermModal from './components/TermModal';
import ApiKeyModal from './components/ApiKeyModal';
import { Search, Bot, Settings, Sparkles, Loader2, X, Info } from 'lucide-react';
import { generateNewTerm, getSystemApiKey } from './services/geminiService';

const App: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Terms State (with LocalStorage persistence)
  const [customTerms, setCustomTerms] = useState<Term[]>(() => {
    try {
      const saved = localStorage.getItem('customTerms');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse customTerms", e);
      return [];
    }
  });

  // Deleted Default Terms IDs (to hide them)
  const [deletedDefaultIds, setDeletedDefaultIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('deletedDefaultIds');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse deletedDefaultIds", e);
      return [];
    }
  });

  // API Key State
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('userApiKey') || '';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);

  // Combine default (excluding deleted ones) and custom terms
  const allTerms = useMemo(() => {
    const visibleDefaultTerms = TERMS_DATA.filter(term => !deletedDefaultIds.includes(term.id));
    // Custom terms take priority/come first
    return [...customTerms, ...visibleDefaultTerms];
  }, [customTerms, deletedDefaultIds]);

  // Save changes automatically
  useEffect(() => {
    localStorage.setItem('customTerms', JSON.stringify(customTerms));
  }, [customTerms]);

  useEffect(() => {
    localStorage.setItem('deletedDefaultIds', JSON.stringify(deletedDefaultIds));
  }, [deletedDefaultIds]);

  // Handle API Key Save
  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    localStorage.setItem('userApiKey', key);
    setIsSettingsOpen(false);
  };

  // Handle Term Deletion
  const handleDeleteTerm = (id: string) => {
    // 1. Check if it's a Custom Term
    const isCustomTerm = customTerms.some(term => term.id === id);
    
    if (isCustomTerm) {
      setCustomTerms(prev => prev.filter(t => t.id !== id));
    } else {
      // 2. Otherwise, treat it as a Default Term and hide it
      setDeletedDefaultIds(prev => {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      });
    }
    
    // Close modal after deletion
    setSelectedTerm(null);
  };

  // Handle Reset Data
  const handleResetData = () => {
    if (window.confirm('삭제된 기본 용어들이 복구되고, 내가 만든 용어들은 모두 삭제됩니다. 초기화 하시겠습니까?')) {
      setDeletedDefaultIds([]);
      setCustomTerms([]);
      alert('초기화되었습니다.');
    }
  };

  const filteredTerms = useMemo(() => {
    return allTerms.filter((term) => {
      const matchesCategory = activeCategory === 'ALL' || term.category === activeCategory;
      const matchesSearch = term.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            term.simpleExplanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            term.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, allTerms]);

  const handleCreateTerm = async () => {
    if (!searchQuery) return;
    const systemKey = getSystemApiKey();
    
    if (!apiKey && !systemKey) {
      alert("새로운 용어를 생성하려면 설정에서 API 키를 입력해주세요!");
      setIsSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      const newTerm = await generateNewTerm(searchQuery, apiKey);
      if (newTerm) {
        setCustomTerms(prev => [newTerm, ...prev]);
        setSelectedTerm(newTerm);
        setSearchQuery('');
        setActiveCategory('ALL');
      } else {
        alert("용어 생성에 실패했습니다. 올바른 단어인지 확인해보세요.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      <ApiKeyModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentKey={apiKey}
        onSave={handleApiKeySave}
        onResetData={handleResetData}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI 빌더 사전</h1>
                <p className="text-sm text-slate-500">초보자를 위한 AI 개발 용어 가이드</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-80 lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                  placeholder="궁금한 용어를 검색하거나 새로 만들어보세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredTerms.length === 0 && searchQuery) {
                      handleCreateTerm();
                    }
                  }}
                />
                {searchQuery && (
                  <button 
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="검색어 삭제"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors relative"
                title="설정 및 API 키"
              >
                <Settings className="w-5 h-5" />
                {!apiKey && !getSystemApiKey() && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === 'ALL'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              전체 보기
            </button>
            {Object.values(Category).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {activeCategory === 'ALL' && !searchQuery && (
          <div className="mb-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 text-white shadow-2xl p-6 md:p-10">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            
            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 text-xs font-semibold mb-3 backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>AI Builder's Guide</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3">
                    AI에게 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-100">주문을 잘하고</span> 싶나요?
                  </h2>
                  <p className="text-lg text-indigo-100/90 leading-relaxed">
                    어려운 개발 용어, 초등학생도 이해할 수 있게<br className="hidden md:block"/>
                    <span className="font-semibold text-white">쉬운 비유</span>와 함께 설명해드릴게요.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-indigo-200 bg-white/5 w-fit px-4 py-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <Info className="w-4 h-4 shrink-0 text-indigo-300" />
                  <span>카드를 클릭하면 상세 설명과 <b className="text-white">AI 주문 프롬프트</b>를 볼 수 있어요.</span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20 shadow-lg">
                  <div 
                    className="bg-gradient-to-br from-white/10 to-transparent rounded-xl p-5 border border-white/5 hover:bg-white/15 transition-colors cursor-pointer"
                    onClick={() => document.querySelector('input')?.focus()}
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0 text-white">
                        <Search className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-white flex items-center gap-2">
                          찾는 용어가 없나요?
                        </h3>
                        <p className="text-sm text-indigo-100 leading-snug">
                          검색창에 단어를 입력하면<br/>
                          <span className="text-yellow-300 font-bold">AI가 3초 만에</span> 설명을 만들어드려요!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTerms.map((term) => (
            <TermCard 
              key={term.id} 
              term={term} 
              onClick={setSelectedTerm} 
            />
          ))}

          {searchQuery && filteredTerms.length === 0 && (
            <div 
              onClick={isGenerating ? undefined : handleCreateTerm}
              className={`
                group relative bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-300 
                flex flex-col items-center justify-center text-center p-8 cursor-pointer 
                hover:bg-indigo-100 hover:border-indigo-400 transition-all duration-300 min-h-[250px]
                ${isGenerating ? 'opacity-80 cursor-wait' : ''}
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                  <h3 className="text-lg font-bold text-indigo-900">AI가 설명서를 만드는 중...</h3>
                  <p className="text-indigo-600 text-sm mt-2">잠시만 기다려주세요</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-bold text-indigo-900">"{searchQuery}" 설명 생성하기</h3>
                  <p className="text-indigo-600 text-sm mt-2 mb-4">
                    사전에 없는 단어예요.<br/>AI에게 설명을 부탁할까요?
                  </p>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md group-hover:bg-indigo-700 transition-colors">
                    AI로 카드 만들기
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {!searchQuery && filteredTerms.length === 0 && (
           <div className="text-center py-20">
            <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">해당하는 용어가 없어요</h3>
            <p className="text-slate-500">다른 카테고리를 선택해보세요.</p>
          </div>
        )}
      </main>

      {/* Footer Updated */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <a 
            href="https://xn--design-hl6wo12cquiba7767a.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-indigo-600 transition-colors font-medium"
          >
            떨림과울림Design.com
          </a>
        </div>
      </footer>

      {selectedTerm && (
        <TermModal 
          term={selectedTerm} 
          onClose={() => setSelectedTerm(null)} 
          onDelete={handleDeleteTerm}
        />
      )}
    </div>
  );
};

export default App;