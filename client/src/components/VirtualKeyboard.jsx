import React, { useState } from 'react';
import { Delete, CornerDownLeft, ArrowUp } from 'lucide-react';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'DELETE'],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DONE'],
  ['SPACE']
];

const VirtualKeyboard = React.memo(({ onKeyPress, onEnter, onBackspace }) => {
  const [isShifted, setIsShifted] = useState(true);

  const handleKeyClick = (key) => {
    if (key === 'SHIFT') {
      setIsShifted(!isShifted);
    } else if (key === 'DONE') {
      onEnter();
    } else if (key === 'DELETE') {
      onBackspace();
    } else if (key === 'SPACE') {
      onKeyPress(' ');
    } else {
      onKeyPress(isShifted ? key.toUpperCase() : key.toLowerCase());
    }
  };

  return (
    <div className="w-full p-1 sm:p-2 bg-surface-low rounded-lg">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5 w-full">
            {row.map((key) => {
              const isSpecial = ['SHIFT', 'DONE', 'DELETE', 'SPACE'].includes(key);
              let content = isShifted ? key : key.toLowerCase();
              let flexClass = "flex-1";
              
              if (key === 'SHIFT') {
                content = <ArrowUp size={18} className={isShifted ? 'text-primary' : 'text-on-surface/40'} />;
                flexClass = "flex-[1.5]";
              } else if (key === 'DONE') {
                content = <CornerDownLeft size={18} />;
                flexClass = "flex-[1.5]";
              } else if (key === 'DELETE') {
                content = <Delete size={18} />;
                flexClass = "flex-[1.5]";
              } else if (key === 'SPACE') {
                content = "";
                flexClass = "flex-[6]";
              }

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyClick(key)}
                  className={`
                    ${flexClass}
                    h-12 sm:h-14 
                    flex items-center justify-center 
                    rounded-lg
                    text-[11px] sm:text-sm font-bold 
                    transition-all active:scale-95
                    ${isShifted && key === 'SHIFT' ? 'bg-surface-high ring-1 ring-primary/20 shadow-inner' : 'bg-surface-lowest'}
                    ${isSpecial && key !== 'SPACE' ? 'text-on-surface/60' : 'text-on-surface shadow-sm'}
                    ${key === 'SPACE' ? 'bg-surface-lowest/50' : ''}
                    hover:bg-surface-high
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
