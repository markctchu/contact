import React from 'react';

function UnifiedInput({ activeAction, inputValue }) {
  
  const getPlaceholder = () => {
    switch (activeAction) {
      case 'SECRET': return "Compose Secret Word";
      case 'GUESS': return "Coordinate Clue";
      case 'CLUE': return "Public Description";
      case 'CONTACT': return "Confirm Match";
      case 'DENY': return "Intercept Clue";
      default: return "Message Room";
    }
  };

  return (
    <div className="flex-1 flex h-full items-center">
      <div 
        className={`flex-1 bg-surface-lowest border border-outline-variant rounded-full px-6 h-full flex items-center transition-all ambient-shadow
          ${activeAction ? 'border-tertiary/20 ring-4 ring-tertiary/5' : ''}`}
      >
        {inputValue ? (
          <span className="text-on-surface font-bold text-sm sm:text-base uppercase tracking-widest animate-in fade-in slide-in-from-left-1 duration-200">
            {inputValue}
            <span className="inline-block w-1 h-4 ml-1 bg-tertiary/40 animate-pulse align-middle rounded-full"></span>
          </span>
        ) : (
          <span className="text-on-surface/20 font-black text-[10px] sm:text-xs uppercase tracking-[0.3em]">
            {getPlaceholder()}
          </span>
        )}
      </div>
    </div>
  );
}

export default UnifiedInput;
