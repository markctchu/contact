import React from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ['SPACE']
];

function VirtualKeyboard({ onKeyPress, onEnter, onBackspace }) {
  return (
    <div className="w-full p-1 sm:p-2 bg-gray-900/50 rounded-xl">
      <div className="flex flex-col gap-1 sm:gap-1.5">
        {ROWS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1 w-full">
            {row.map((key) => {
              const isSpecial = ['ENTER', 'BACKSPACE', 'SPACE'].includes(key);
              
              let content = key;
              if (key === 'BACKSPACE') content = <Delete size={18} />;
              if (key === 'ENTER') content = <CornerDownLeft size={18} />;
              if (key === 'SPACE') content = 'SPACE';

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'ENTER') onEnter();
                    else if (key === 'BACKSPACE') onBackspace();
                    else if (key === 'SPACE') onKeyPress(' ');
                    else onKeyPress(key);
                  }}
                  className={`
                    ${key === 'SPACE' ? 'flex-[4] h-10 sm:h-12' : 
                      key === 'ENTER' || key === 'BACKSPACE' ? 'flex-[1.5] h-10 sm:h-12' : 
                      'flex-1 h-10 sm:h-12 max-w-[40px] sm:max-w-none'}
                    flex items-center justify-center rounded-md sm:rounded-lg font-bold text-xs sm:text-base transition-all active:scale-95 shadow-lg
                    ${isSpecial ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-100 hover:bg-gray-600'}
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
}

export default VirtualKeyboard;
