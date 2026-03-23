import { useEffect, useRef } from 'react';
import { getLogStyle, getLogBorderColor } from '../utils/gameUtils';

function ChatWindow({ messages, username, inputValue, activeAction }) {
  const chatEndRef = useRef(null);
  const isChatInput = !activeAction;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, inputValue]);

  return (
    <div className="bg-surface-low rounded-xl p-2 sm:p-3 shrink-0 overflow-hidden border border-outline-variant flex flex-col min-h-[160px] sm:min-h-[180px]">
      <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-2">
        {Array.isArray(messages) && messages.map((msg, i) => (
          <div key={i} className="text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
            {msg.isLog ? (
              <div className={`py-1 px-3 bg-surface rounded border-l-2 ${msg.isPrivate ? 'border-dashed opacity-60' : ''} ${getLogBorderColor(msg.logType)}`}>
                <span className={`${getLogStyle(msg.logType)} font-medium`}>
                  {msg.isPrivate && <span className="text-[9px] uppercase mr-2 opacity-40 font-black">Private</span>}
                  {msg.message}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline space-x-3 px-1">
                <span className="font-black text-tertiary shrink-0 uppercase text-[9px] tracking-widest opacity-50">{msg.username}</span>
                <span className="text-on-surface/80 leading-relaxed">{msg.message}</span>
              </div>
            )}
          </div>
        ))}
        
        {/* Persistent Chat Input Line - Seamless Integration */}
        {isChatInput && (
          <div className="flex items-baseline space-x-3 px-1 py-1 mt-1 opacity-90">
            <span className="font-black text-tertiary shrink-0 uppercase text-[9px] tracking-widest">{username}</span>
            <div className="flex items-center flex-1 min-w-0">
              <span className="text-on-surface font-bold text-xs sm:text-sm uppercase tracking-widest truncate">{inputValue}</span>
              <span className="inline-block w-1 h-3.5 ml-1 bg-tertiary/40 animate-[pulse_1.5s_infinite] rounded-full"></span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

export default ChatWindow;
