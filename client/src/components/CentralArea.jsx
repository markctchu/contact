import { useMemo } from 'react';

function CentralArea({ room, typingStatus, socketId, inputValue, activeAction }) {
  const { revealedPrefix, currentGuess, status, victoryCountdown, secretWord, wordmaster } = room;
  const isWordmaster = wordmaster === socketId;

  const displayWord = useMemo(() => {
    if (status === 'game_over' && secretWord) return secretWord;
    return revealedPrefix || '';
  }, [revealedPrefix, status, secretWord]);

  const getBoxSize = (wordLength) => {
    if (wordLength > 12) return 'w-5 h-8 sm:w-12 sm:h-16 text-sm sm:text-3xl';
    if (wordLength > 10) return 'w-6 h-10 sm:w-12 sm:h-16 text-base sm:text-3xl';
    if (wordLength > 8) return 'w-7 h-11 sm:w-12 sm:h-16 text-lg sm:text-3xl';
    return 'w-8 h-12 sm:w-14 sm:h-20 text-xl sm:text-4xl';
  };

  const boxClass = getBoxSize(displayWord.length || 7);
  const isCountdownActive = status === 'victory_countdown' || (currentGuess && currentGuess.contactedBy);

  const isWordInput = ['SECRET', 'GUESS', 'CONTACT', 'DENY'].includes(activeAction);
  const showPrefixInInput = ['GUESS', 'CONTACT', 'DENY'].includes(activeAction);

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full p-2 sm:p-4 overflow-hidden relative">
      <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-8 w-full transition-all duration-500 max-h-full">
        
        {isCountdownActive ? (
          /* Countdown Display */
          <div className="flex-1 flex flex-col items-center justify-center w-full animate-in fade-in zoom-in duration-500 px-2 min-h-0">
            {status === 'victory_countdown' ? (
              <div className="cta-gradient py-4 px-8 sm:py-8 sm:px-12 rounded-2xl ambient-shadow w-full max-w-xl flex items-center justify-between border-2 border-primary/10">
                <div className="text-left min-w-0 mr-4">
                  <h4 className="text-lg sm:text-2xl font-extrabold text-on-primary-container uppercase leading-tight tracking-tighter">Victory Pending</h4>
                  <p className="text-on-primary-container/60 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-1">Contest to Intercept</p>
                </div>
                <div className="text-5xl sm:text-8xl font-black text-on-primary-container leading-none tabular-nums">{victoryCountdown}</div>
              </div>
            ) : (
              <div className="bg-tertiary py-4 px-8 sm:py-8 sm:px-12 rounded-2xl ambient-shadow w-full max-w-xl flex items-center justify-between border-2 border-tertiary/20">
                <div className="text-left min-w-0 mr-4">
                  <h4 className="text-lg sm:text-2xl font-extrabold text-white uppercase leading-tight tracking-tighter">Contact</h4>
                  <p className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-1 truncate">
                    {currentGuess.playerName} & {currentGuess.contactedByName}
                  </p>
                </div>
                <div className="text-5xl sm:text-8xl font-black text-white leading-none tabular-nums">{currentGuess.countdown}</div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Word Display */}
            <div className="space-y-2 sm:space-y-4 w-full flex flex-col items-center shrink-0">
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

                {(isWordInput ? (showPrefixInInput ? inputValue : inputValue || '') : displayWord).split('').map((char, i) => (
                  <div 
                    key={`input-${i}`} 
                    className={`${boxClass} flex items-center justify-center rounded-lg sm:rounded-xl font-black ambient-shadow bg-surface-lowest text-on-surface transition-all duration-300 animate-in zoom-in-90 slide-in-from-bottom-2`}
                  >
                    {char}
                  </div>
                ))}
                
                {isWordInput && (
                  <div className={`${boxClass} flex items-center justify-center rounded-lg sm:rounded-xl font-black bg-tertiary/10 border-2 border-tertiary/20 animate-pulse`}>
                    <span className="w-1 h-1/2 bg-tertiary rounded-full"></span>
                  </div>
                )}

                {!isWordInput && status !== 'game_over' && revealedPrefix && (
                  <div className="flex items-center ml-1">
                    <div className="text-2xl sm:text-5xl font-black text-on-surface opacity-10 tracking-widest italic">
                      ...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hint/Clue Block */}
            <div className="flex items-center justify-center w-full px-4 min-h-0 overflow-hidden shrink-1">
              {activeAction === 'GUESS_CLUE' ? (
                <div className="bg-tertiary/5 p-4 sm:p-10 rounded-2xl border border-tertiary/10 ambient-shadow w-full max-w-2xl text-center">
                  <p className="text-[9px] sm:text-xs font-black text-tertiary uppercase tracking-[0.3em] mb-3 sm:mb-6 opacity-60">THE PERFECT CLUE: {currentGuess?.hiddenWord}</p>
                  <h4 className="text-xl sm:text-4xl font-extrabold italic text-on-surface leading-tight break-words px-4">
                    {inputValue || 'Enter Clue here...'}
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
                    {status === 'waiting' 
                      ? 'Tap Wordmaster to Begin' 
                      : (isWordmaster ? 'Define the Secret Lexicon Above' : 'Awaiting Wordmaster Submission')}
                  </p>
                </div>
              ) : (
                <div className="text-on-surface/20 text-xs sm:text-base font-black uppercase tracking-[0.4em] py-6 text-center px-12 italic">
                  AWAITING GUESS SUBMISSION
                </div>
              )}
            </div>
          </>
        )}

        {/* Typing Indicators */}
        <div className="h-6 overflow-hidden w-full px-4 shrink-0">
          {typingStatus.length > 0 && (
            <div className="flex items-center justify-center space-x-3 text-tertiary/60 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] animate-in fade-in duration-500">
              <p className="truncate max-w-[300px] sm:max-w-none italic">
                {typingStatus.map(t => t.username).join(', ')} is typing...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CentralArea;
