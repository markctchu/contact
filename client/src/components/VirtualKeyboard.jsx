import React, { useState } from 'react';
import { Delete, CornerDownLeft, ArrowUp } from 'lucide-react';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['SPACER_1', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'SPACER_1'],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE'],
  ['SPACER_2', ',', 'SPACE', '.', 'DONE']
];

const VirtualKeyboard = React.memo(({ onKeyPress, onEnter, onBackspace }) => {
  const [isShifted, setIsShifted] = useState(false);

  const handleKeyClick = (key) => {
    if (key.startsWith('SPACER')) return;
    
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
      // Auto-reset shift after a character is typed (Mobile style)
      if (isShifted) setIsShifted(false);
    }
  };

  return (
    <div className="w-full p-1 sm:p-2 bg-surface-low rounded-lg">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 sm:gap-1.5 w-full">
            {row.map((key, keyIndex) => {
              if (key === 'SPACER_1') {
                return <div key={`spacer-${rowIndex}-${keyIndex}`} className="col-span-1" />;
              }
              if (key === 'SPACER_2') {
                return <div key={`spacer-${rowIndex}-${keyIndex}`} className="col-span-2" />;
              }

              const isSpecial = ['SHIFT', 'DONE', 'DELETE', 'SPACE'].includes(key);
              let content = isShifted ? key : key.toLowerCase();
              let spanClass = "col-span-2";
              
              if (key === 'SHIFT') {
                content = <ArrowUp size={18} className={isShifted ? 'text-primary dark:text-[#8B5CF6]' : 'text-on-surface/40'} />;
                spanClass = "col-span-3";
              } else if (key === 'DONE') {
                content = <CornerDownLeft size={18} className="text-on-surface/60" />;
                spanClass = "col-span-4";
              } else if (key === 'DELETE') {
                content = <Delete size={18} className="text-on-surface/60" />;
                spanClass = "col-span-3";
              } else if (key === 'SPACE') {
                content = "";
                spanClass = "col-span-10";
              }

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyClick(key)}
                  className={`
                    ${spanClass}
                    h-12 sm:h-14 
                    flex items-center justify-center 
                    rounded-lg
                    text-[11px] sm:text-sm font-bold 
                    transition-all active:scale-95
                    ${isSpecial && key !== 'SPACE' 
                      ? 'bg-surface-high text-on-surface shadow-md' 
                      : 'bg-surface-lowest text-on-surface shadow-sm'}
                    ${isShifted && key === 'SHIFT' ? 'ring-2 ring-primary dark:ring-[#8B5CF6] border border-on-surface/10' : ''}
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
