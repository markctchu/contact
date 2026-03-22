import React from 'react';

function UnifiedInput({ activeAction, inputValue }) {
  
  const getPlaceholder = () => {
    switch (activeAction) {
      case 'SECRET': return "ENTER YOUR SECRET WORD...";
      case 'GUESS': return "WHAT WORD ARE YOU THINKING OF?";
      case 'CLUE': return "GIVE A PUBLIC HINT...";
      case 'CONTACT': return "WHAT WORD IS IT?";
      case 'DENY': return "IS IT...";
      default: return "SEND A CHAT MESSAGE...";
    }
  };

  return (
    <div className="flex-1 flex h-full items-center">
      <div 
        className={`flex-1 bg-gray-800 border-2 rounded-lg sm:rounded-xl px-3 sm:px-6 h-full flex items-center transition-all 
          ${activeAction === 'SECRET' || activeAction === 'GUESS' ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 
            activeAction === 'CLUE' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 
            activeAction === 'CONTACT' ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 
            activeAction === 'DENY' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 
            'border-gray-700'}`}
      >
        {inputValue ? (
          <span className="text-white font-bold text-sm sm:text-lg uppercase tracking-wider animate-in fade-in slide-in-from-left-1 duration-200">
            {inputValue}
            <span className="inline-block w-0.5 h-5 ml-1 bg-blue-500 animate-pulse align-middle"></span>
          </span>
        ) : (
          <span className="text-gray-500 font-bold text-xs sm:text-base uppercase tracking-widest opacity-50">
            {getPlaceholder()}
          </span>
        )}
      </div>
    </div>
  );
}

export default UnifiedInput;
