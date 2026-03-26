import { useEffect, useRef, useState } from 'react';
import { getLogStyle, getLogBorderColor } from '../utils/gameUtils';
import { useGame } from '../contexts/GameContext';
import { STRINGS } from '../constants/strings';

function ChatWindow() {
  const { chat: messages, username, inputValue, activeAction } = useGame();
  const chatEndRef = useRef(null);
  const isChatInput = !activeAction;
  const [shouldRenderInput, setShouldRenderInput] = useState(isChatInput);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sync rendering with action state but with a slight delay to prevent flicker
  useEffect(() => {
    if (isChatInput) {
      const timer = setTimeout(() => setShouldRenderInput(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShouldRenderInput(false);
    }
  }, [isChatInput]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, inputValue, activeAction]);

  return (
    <div className="bg-surface-low rounded-lg p-2 sm:p-3 shrink-0 overflow-hidden flex flex-col h-24 sm:h-40 max-h-[20vh] relative transition-colors duration-300 border border-outline-variant">
      {/* 1. Message History (Scrollable) */}
      <div 
        className={`flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-2 min-h-0 ${isChatInput ? 'pb-6' : 'pb-0'}`}
      >
        {Array.isArray(messages) && messages.map((msg, i) => (
          <div key={i} className="text-xs sm:text-[13px] animate-in fade-in slide-in-from-bottom-1 duration-300">
            {msg.isLog ? (
              <div className={`py-0.5 px-3 bg-surface rounded border-l-2 ${msg.isPrivate ? 'border-dashed opacity-60' : ''} ${getLogBorderColor(msg.logType)}`}>
                <span className={`${getLogStyle(msg.logType)} font-medium text-[10px] sm:text-xs`}>
                  {msg.isPrivate && <span className="text-[9px] uppercase mr-2 opacity-40 font-black">{STRINGS.LOG_PRIVATE_PREFIX}</span>}
                  {msg.message}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline space-x-3 px-1">
                <span className="font-black text-tertiary shrink-0 uppercase text-[9px] tracking-widest opacity-50">{msg.username}</span>
                <span className="text-on-surface/80 leading-snug">{msg.message}</span>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      
      {/* 2. Persistent Chat Input Line - Absolutely positioned at bottom */}
      <div className={`absolute bottom-0 left-0 w-full px-3 h-8 sm:h-10 border-t border-outline-variant overflow-hidden transition-all duration-300 bg-surface-low ${isChatInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        {shouldRenderInput && (
          <div className="h-full flex flex-col justify-end">
            <div className="flex items-end space-x-2 px-1 pb-1.5 sm:pb-2">
              <span className="font-black text-tertiary shrink-0 uppercase text-[10px] sm:text-xs tracking-widest leading-tight">{username}</span>
              <div className="flex-1 min-w-0 leading-tight">
                <span className="text-on-surface font-bold text-xs sm:text-sm tracking-widest break-words whitespace-pre-wrap">
                  {inputValue}
                  <span className="inline-block w-1 h-3 sm:h-3.5 ml-1 bg-tertiary animate-[pulse_1.5s_infinite] rounded-full translate-y-[2px]"></span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatWindow;
