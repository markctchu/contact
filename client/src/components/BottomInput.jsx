import { useState, useEffect, useRef, useMemo } from 'react';
import ChatWindow from './ChatWindow';
import VirtualKeyboard from './VirtualKeyboard';

function BottomInput({ 
  room, 
  socketId, 
  chat, 
  username,
  isWordmaster, 
  inputValue, 
  setInputValue, 
  activeAction, 
  setActiveAction, 
  toggleAction,
  showKeyboard,
  setShowKeyboard
}) {
  const [privateMessages, setPrivateMessages] = useState([]);

  useEffect(() => {
    // Note: In a real app, you'd move these listeners to useSocketEvents
    // but keeping it here for continuity with existing private message logic
  }, []);

  const allMessages = [...chat, ...privateMessages].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full relative p-2 sm:p-4">
      {/* 1. Integrated Chat Window */}
      <ChatWindow 
        messages={allMessages} 
        username={username}
        inputValue={inputValue}
        activeAction={activeAction}
      />

      {/* 2. Keyboard Section */}
      <div className="mt-2 pb-1 sm:pb-3 space-y-2">
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
            onKeyPress={(key) => setInputValue(prev => prev + key)}
            onEnter={handleEnter}
            onBackspace={() => setInputValue(prev => prev.slice(0, -1))}
          />
        )}
      </div>
    </div>
  );
}

export default BottomInput;
