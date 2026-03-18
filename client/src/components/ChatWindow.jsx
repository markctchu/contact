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
    <div className="bg-black/20 rounded-xl sm:rounded-2xl p-2 sm:p-4">
      <div className="h-24 sm:h-48 overflow-y-auto space-y-1.5 mb-1 sm:mb-2 custom-scrollbar pr-2">
        {messages.map((msg, i) => (
          <div key={i} className="text-xs sm:text-sm">
            {msg.isLog ? (
              <div className={`py-0.5 px-2 bg-gray-800/30 rounded border-l-2 ${msg.isPrivate ? 'border-dashed opacity-80' : ''} ${getLogBorderColor(msg.logType)}`}>
                <span className={getLogStyle(msg.logType)}>
                  {msg.isPrivate && <span className="text-[10px] uppercase mr-2 opacity-50">[Private]</span>}
                  {msg.message}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline space-x-2">
                <span className="font-black text-blue-400 shrink-0 uppercase text-[10px] sm:text-xs tracking-tighter">{msg.username}</span>
                <span className="text-gray-300 break-words">{msg.message}</span>
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
