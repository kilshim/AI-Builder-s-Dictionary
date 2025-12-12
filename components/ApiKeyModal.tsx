import React, { useState, useEffect } from 'react';
import { X, Key, Save, Trash2, ExternalLink, RefreshCw } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSave: (key: string) => void;
  onResetData: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, currentKey, onSave, onResetData }) => {
  const [inputValue, setInputValue] = useState(currentKey);

  useEffect(() => {
    setInputValue(currentKey);
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-600" />
            설정
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* API Key Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Gemini API 키 설정</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Gemini API 키를 입력하면 나만의 용어 사전 만들기 기능을 사용할 수 있습니다. 키는 브라우저에만 저장됩니다.
            </p>

            <div>
              <input 
                type="password"
                placeholder="AIza..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => onSave(inputValue)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Save className="w-4 h-4" />
                저장하기
              </button>
              {currentKey && (
                <button 
                  onClick={() => {
                    setInputValue('');
                    onSave('');
                  }}
                  className="px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-100"
                  title="키 삭제"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

             <div className="pt-2">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-indigo-500 hover:text-indigo-700 hover:underline justify-center"
              >
                <span>Google AI Studio에서 무료 키 발급받기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Data Reset Section */}
          <div className="space-y-3">
             <h4 className="text-sm font-bold text-slate-900">데이터 관리</h4>
             <button 
                onClick={onResetData}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                모든 용어 데이터 초기화 (복구)
              </button>
              <p className="text-xs text-slate-400 text-center">
                실수로 삭제한 기본 용어들을 다시 불러옵니다.
              </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
