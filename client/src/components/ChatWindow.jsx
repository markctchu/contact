import { useEffect, useRef } from 'react';
import { getLogStyle, getLogBorderColor } from '../utils/gameUtils';
import { useGame } from '../contexts/GameContext';

function ChatWindow() {
  const { chat: messages, username, inputValue, activeAction } = useGame();
  const chatEndRef = useRef(null);
  const isChatInput = !activeAction;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, inputValue, activeAction]);

  return (
    <div className="bg-surface-low rounded-lg p-2 sm:p-3 shrink-0 overflow-hidden border border-outline-variant flex flex-col h-32 sm:h-40 relative">
      {/* 1. Message History (Scrollable) */}
      <div 
        className={`flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-2 min-h-0 ${isChatInput ? 'pb-6' : 'pb-0'}`}
      >
        {Array.isArray(messages) && messages.map((msg, i) => (
          <div key={i} className="text-xs sm:text-[13px] animate-in fade-in slide-in-from-bottom-1 duration-300">
            {msg.isLog ? (
              <div className={`py-0.5 px-3 bg-surface rounded border-l-2 ${msg.isPrivate ? 'border-dashed opacity-60' : ''} ${getLogBorderColor(msg.logType)}`}>
                <span className={`${getLogStyle(msg.logType)} font-medium text-[10px] sm:text-xs`}>
                  {msg.isPrivate && <span className="text-[9px] uppercase mr-2 opacity-40 font-black">Private</span>}
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
      <div className={`absolute bottom-0 left-0 w-full px-3 py-1 bg-surface-low border-t border-on-surface/5 overflow-hidden transition-opacity duration-300 ${isChatInput ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
        <div className="flex items-center space-x-3 px-1 py-1">
          <span className="font-black text-tertiary shrink-0 uppercase text-[9px] tracking-widest translate-y-[1px]">{username}</span>
          <div className="flex items-center flex-1 min-w-0">
            <span className="text-on-surface font-bold text-xs sm:text-sm uppercase tracking-widest truncate">{inputValue}</span>
            <span className="inline-block w-1 h-3.5 ml-1 bg-tertiary animate-[pulse_1.5s_infinite] rounded-full"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
