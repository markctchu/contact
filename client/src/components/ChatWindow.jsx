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
    <div className="bg-surface-low rounded-xl p-2 sm:p-3 shrink-0 overflow-hidden border border-outline-variant flex flex-col">
      <div className="h-24 sm:h-32 overflow-y-auto space-y-1.5 mb-1 custom-scrollbar pr-2 flex-1">
        {Array.isArray(messages) && messages.map((msg, i) => (
          <div key={i} className="text-xs sm:text-sm">
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
        
        {/* Persistent Chat Input Line */}
        {isChatInput && (
          <div className="flex items-baseline space-x-3 px-1 mt-2 py-1 bg-tertiary/5 rounded border border-tertiary/10">
            <span className="font-black text-tertiary shrink-0 uppercase text-[9px] tracking-widest">{username}</span>
            <div className="flex items-center flex-1 min-w-0">
              <span className="text-on-surface font-bold text-xs sm:text-sm uppercase tracking-widest truncate">{inputValue}</span>
              <span className="inline-block w-1 h-3 ml-1 bg-tertiary/40 animate-[pulse_1.5s_infinite] rounded-full"></span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

export default ChatWindow;
