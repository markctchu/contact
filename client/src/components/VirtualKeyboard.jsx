import React from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['DONE', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
  ['SPACE']
];

const VirtualKeyboard = React.memo(({ onKeyPress, onEnter, onBackspace }) => {
  return (
    <div className="w-full p-1 sm:p-2 bg-surface-low rounded-2xl">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {ROWS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5 w-full">
            {row.map((key) => {
              const isSpecial = ['DONE', 'DEL', 'SPACE'].includes(key);
              
              let content = key;
              if (key === 'DEL') content = <Delete size={16} strokeWidth={2.5} />;
              if (key === 'DONE') content = <CornerDownLeft size={16} strokeWidth={2.5} />;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'DONE') onEnter();
                    else if (key === 'DEL') onBackspace();
                    else if (key === 'SPACE') onKeyPress(' ');
                    else onKeyPress(key);
                  }}
                  className={`
                    ${key === 'SPACE' ? 'flex-[4] h-10 sm:h-12' : 
                      key === 'DONE' || key === 'DEL' ? 'flex-[1.5] h-10 sm:h-12' : 
                      'flex-1 h-10 sm:h-12 max-w-[44px] sm:max-w-none'}
                    flex items-center justify-center rounded-lg font-bold text-[10px] sm:text-sm transition-all active:scale-[0.92] ambient-shadow
                    ${isSpecial ? 'bg-surface-high text-on-surface' : 'bg-surface-lowest text-on-surface hover:bg-surface-low'}
                  `}
                >
                  {content}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

export default VirtualKeyboard;
