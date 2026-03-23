import React from 'react';
import ChatWindow from './ChatWindow';
import VirtualKeyboard from './VirtualKeyboard';
import { useGame } from '../contexts/GameContext';

function BottomInput() {
  const { 
    handleEnter, 
    handleKeyPress,
    handleBackspace,
    showKeyboard, 
    setShowKeyboard 
  } = useGame();

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full relative px-2 sm:px-4 pb-0.5 sm:pb-0.5">
      {/* 1. Integrated Chat Window */}
      <ChatWindow />

      {/* 2. Keyboard Section */}
      <div className="mt-1 pb-0.5 sm:pb-1 space-y-1">
        <div className="flex justify-end px-2">
          <button 
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="hidden sm:block text-[10px] font-black text-on-surface/10 hover:text-tertiary uppercase tracking-[0.2em] transition-colors"
          >
            {showKeyboard ? '[ Hide Keys ]' : '[ Show Keys ]'}
          </button>
        </div>
        {showKeyboard && (
          <VirtualKeyboard 
            onKeyPress={handleKeyPress}
            onEnter={handleEnter}
            onBackspace={handleBackspace}
          />
        )}
      </div>
    </div>
  );
}

export default BottomInput;
