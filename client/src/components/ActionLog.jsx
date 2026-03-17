import { useEffect, useRef } from 'react';

function ActionLog({ logs }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogStyle = (type) => {
    switch (type) {
      case 'Contact': return 'text-blue-400 border-l-2 border-blue-500 pl-3';
      case 'Deny': return 'text-red-400 border-l-2 border-red-500 pl-3';
      case 'Retract': return 'text-orange-400 border-l-2 border-orange-500 pl-3';
      case 'Success': return 'text-green-400 border-l-2 border-green-500 pl-3';
      case 'Victory': return 'text-yellow-400 border-l-2 border-yellow-500 pl-3 font-bold';
      case 'System': return 'text-purple-400 italic';
      default: return 'text-gray-400';
    }
  };

  return (
    <div ref={scrollRef} className="p-4 space-y-4 font-mono text-sm">
      {logs.map((log, i) => (
        <div key={i} className={`py-1 ${getLogStyle(log.type)}`}>
          <span className="text-gray-600 block text-[10px] mb-1">
            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          {log.message}
        </div>
      ))}
    </div>
  );
}

export default ActionLog;
