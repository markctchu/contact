import { useEffect, useRef } from 'react';
import { getLogStyle, getLogBorderColor } from '../utils/gameUtils';

function ChatWindow({ messages }) {
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="bg-surface-low rounded-xl p-2 sm:p-3 shrink-0 overflow-hidden border border-outline-variant">
      <div className="h-24 sm:h-32 overflow-y-auto space-y-1.5 mb-0.5 custom-scrollbar pr-2">
        {messages.map((msg, i) => (
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
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

export default ChatWindow;
