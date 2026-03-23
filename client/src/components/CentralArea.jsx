import { useMemo } from 'react';
import ActionToggleButton from './ActionToggleButton';

function CentralArea({ 
  room, 
  typingStatus, 
  socketId, 
  inputValue, 
  activeAction, 
  onToggleAction, 
  onCancel 
}) {
  const { revealedPrefix, currentGuess, status, victoryCountdown, secretWord, wordmaster } = room;
  const isWordmaster = wordmaster === socketId;

  const displayWord = useMemo(() => {
    if (status === 'game_over' && secretWord) return secretWord;
    return revealedPrefix || '';
  }, [revealedPrefix, status, secretWord]);

  const isWordInput = ['SECRET', 'GUESS', 'GUESS_CLUE', 'CONTACT', 'DENY'].includes(activeAction);
  const showPrefixInInput = ['GUESS', 'CONTACT', 'DENY'].includes(activeAction);

  // Calculate total visible tiles to ensure accurate scaling
  const totalVisibleCount = useMemo(() => {
    if (isWordInput) {
      const prefixLen = (showPrefixInInput && revealedPrefix) ? revealedPrefix.length : 0;
      const inputLen = inputValue ? inputValue.length : 0;
      return prefixLen + inputLen + 1; // +1 for the cursor tile
    }
    if (!revealedPrefix && status !== 'game_over') return 7; // 'CONTACT'
    return displayWord ? displayWord.length : 7;
  }, [isWordInput, showPrefixInInput, revealedPrefix, inputValue, status, displayWord]);

  const getBoxSize = (wordLength) => {
    const baseClasses = "flex items-center justify-center rounded-lg sm:rounded-xl font-black ambient-shadow transition-all duration-300";
    if (wordLength > 14) return `${baseClasses} w-5 h-8 text-[10px] sm:w-14 sm:h-20 sm:text-4xl`;
    if (wordLength > 12) return `${baseClasses} w-6 h-9 text-xs sm:w-14 sm:h-20 sm:text-4xl`;
    if (wordLength > 10) return `${baseClasses} w-7 h-10 text-sm sm:w-14 sm:h-20 sm:text-4xl`;
    if (wordLength > 8) return `${baseClasses} w-8 h-12 text-lg sm:w-14 sm:h-20 sm:text-4xl`;
    return `${baseClasses} w-9 h-14 text-xl sm:w-14 sm:h-20 sm:text-4xl`;
  };

  const boxClass = getBoxSize(totalVisibleCount);
  const isCountdownActive = status === 'victory_countdown' || (currentGuess && currentGuess.contactedBy);

  const modeLabel = useMemo(() => {
    if (!activeAction) return 'Chat Mode';
    switch (activeAction) {
      case 'SECRET': return 'Secret Word Mode';
      case 'GUESS': return 'Guess Word Mode';
      case 'GUESS_CLUE': return 'Clue Mode';
      case 'CONTACT': return 'Contact Mode';
      case 'DENY': return 'Intercept Mode';
      default: return `${activeAction} Mode`;
    }
  }, [activeAction]);

  return (
    <div className="flex-1 flex flex-col w-full h-full relative">
      {/* 1. Main Content Area (Tiles and Clues) */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 sm:space-y-8 w-full transition-all duration-500 min-h-0">
        {isCountdownActive ? (
          <div className="w-full animate-in fade-in zoom-in duration-500 px-2 py-4">
            {status === 'victory_countdown' ? (
              <div className="cta-gradient py-4 px-8 sm:py-8 sm:px-12 rounded-2xl ambient-shadow w-full max-w-xl mx-auto flex items-center justify-between border-2 border-primary/10">
                <div className="text-left min-w-0 mr-4">
                  <h4 className="text-lg sm:text-2xl font-extrabold text-on-primary-container uppercase leading-tight tracking-tighter">Wordmaster has Declared Victory!</h4>
                  <p className="text-on-primary-container/60 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-1">Contest to stop the countdown</p>
                </div>
                <div className="text-5xl sm:text-8xl font-black text-on-primary-container leading-none tabular-nums">{victoryCountdown}</div>
              </div>
            ) : (
              <div className="bg-tertiary py-4 px-8 sm:py-8 sm:px-12 rounded-2xl ambient-shadow w-full max-w-xl mx-auto flex items-center justify-between border-2 border-tertiary/20">
                <div className="text-left min-w-0 mr-4">
                  <h4 className="text-lg sm:text-2xl font-extrabold text-white uppercase leading-tight tracking-tighter">Contact</h4>
                  <p className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-1 truncate">
                    {currentGuess?.playerName} & {currentGuess?.contactedByName}
                  </p>
                </div>
                <div className="text-5xl sm:text-8xl font-black text-white leading-none tabular-nums">{currentGuess?.countdown}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full space-y-6 sm:space-y-10 py-4">
            <div className="space-y-2 sm:space-y-4 w-full flex flex-col items-center">
              <h3 className="text-[9px] sm:text-xs font-black tracking-[0.4em] text-on-surface/30 uppercase">
                {isWordInput ? "THEY'LL NEVER GUESS" : (revealedPrefix ? 'IT STARTS WITH' : "PREPARE TO MAKE")}
              </h3>
              
              <div className="flex flex-wrap gap-1 sm:gap-3 justify-center items-center max-w-full px-2">
                {!revealedPrefix && !isWordInput && status !== 'game_over' && 'CONTACT'.split('').map((char, i) => (
                  <div key={`init-${i}`} className={`${boxClass} flex items-center justify-center rounded-lg sm:rounded-xl font-black bg-surface-lowest text-on-surface ambient-shadow`}>
                    {char}
                  </div>
                ))}

                {showPrefixInInput && revealedPrefix && revealedPrefix.split('').map((char, i) => (
                  <div key={`prefix-${i}`} className={`${boxClass} flex items-center justify-center rounded-lg sm:rounded-xl font-black bg-surface-container text-on-surface opacity-30`}>
                    {char}
                  </div>
                ))}

                {(isWordInput ? (showPrefixInInput ? (inputValue || '') : (inputValue || '')) : (displayWord || '')).split('').map((char, i) => (
                  <div key={`input-${i}`} className={`${boxClass} flex items-center justify-center rounded-lg sm:rounded-xl font-black ambient-shadow bg-surface-lowest text-on-surface transition-all duration-300 animate-in zoom-in-90 slide-in-from-bottom-2`}>
                    {char}
                  </div>
                ))}
                
                {isWordInput && (
                  <div className={`${boxClass} flex items-center justify-center rounded-lg sm:rounded-xl font-black bg-tertiary/10 border-2 border-tertiary/20`}>
                    <span className="w-1 h-1/2 bg-tertiary rounded-full animate-[pulse_1.5s_infinite]"></span>
                  </div>
                )}

                {!isWordInput && status !== 'game_over' && revealedPrefix && (
                  <div className="flex items-center ml-1">
                    <div className="text-2xl sm:text-5xl font-black text-on-surface opacity-10 tracking-widest italic">...</div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full flex items-center justify-center px-4">
              {activeAction === 'GUESS_CLUE' ? (
                <div className="bg-tertiary/5 p-4 sm:p-10 rounded-2xl border border-tertiary/10 ambient-shadow w-full max-w-2xl text-center">
                  <p className="text-[9px] sm:text-xs font-black text-tertiary uppercase tracking-[0.3em] mb-3 sm:mb-6 opacity-60">THE PERFECT CLUE: {currentGuess?.hiddenWord}</p>
                  <h4 className="text-xl sm:text-4xl font-extrabold italic text-on-surface leading-tight break-words px-4">
                    {inputValue}
                    <span className="inline-block w-1 h-6 sm:h-10 ml-1 bg-tertiary rounded-full animate-[pulse_1.5s_infinite] align-middle"></span>
                  </h4>
                </div>
              ) : currentGuess ? (
                <div className="bg-surface-lowest p-4 sm:p-10 rounded-2xl ambient-shadow w-full max-w-2xl relative overflow-hidden group border border-outline-variant">
                  <div className="absolute top-0 left-0 w-full h-1 bg-tertiary/20"></div>
                  <p className="text-[9px] sm:text-[10px] font-black text-on-surface/30 uppercase tracking-[0.3em] mb-3 sm:mb-6 text-center">Clue from {currentGuess.playerName}</p>
                  <h4 className="text-xl sm:text-4xl font-extrabold italic text-on-surface leading-tight break-words px-4 text-center tracking-tight">
                    "{currentGuess.clue || 'Pending...'}"
                  </h4>
                </div>
              ) : status === 'setting_word' || status === 'waiting' ? (
                <div className="text-on-surface/40 flex flex-col items-center py-4">
                  <p className="text-xs sm:text-base font-bold uppercase tracking-[0.3em] animate-pulse text-center px-12 leading-loose italic">
                    {status === 'waiting' ? 'Tap Wordmaster to Begin' : (isWordmaster ? 'Define the Secret Lexicon Above' : 'Awaiting Wordmaster Submission')}
                  </p>
                </div>
              ) : (
                <div className="text-on-surface/20 text-xs sm:text-base font-black uppercase tracking-[0.4em] py-6 text-center px-12 italic">
                  AWAITING GUESS SUBMISSION
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Control Row (Sticky at the bottom of the central area) */}
      <div className="w-full flex items-center justify-between px-4 py-2 sm:py-4 border-t border-outline-variant bg-surface/50 backdrop-blur-sm shrink-0">
        <ActionToggleButton 
          room={room}
          socketId={socketId}
          isWordmaster={isWordmaster}
          activeAction={activeAction}
          onToggleAction={onToggleAction}
          onCancel={onCancel}
        />
        
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-black text-tertiary uppercase tracking-[0.2em]">
            <span className={activeAction ? 'animate-pulse' : 'opacity-40'}>
              {modeLabel}
            </span>
          </div>
          {(typingStatus?.length > 0 || room.typingStatus?.length > 0) && (
            <div className="text-[8px] font-bold text-tertiary/40 uppercase tracking-widest italic mt-0.5">
              {typingStatus?.length || room.typingStatus?.length} composing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CentralArea;
