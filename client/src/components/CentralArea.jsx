import { useMemo } from 'react';

function CentralArea({ room, typingStatus, socketId, inputValue, activeAction }) {
  const { revealedPrefix, currentClue, status, victoryCountdown, secretWord, wordmaster } = room;
  const isWordmaster = wordmaster === socketId;

  const displayWord = useMemo(() => {
    if (status === 'game_over' && secretWord) return secretWord;
    return revealedPrefix || '';
  }, [revealedPrefix, status, secretWord]);

  // Updated scaling logic to fit up to 14 letters in a row on mobile
  const getBoxSize = (wordLength) => {
    if (wordLength > 12) return 'w-5 h-8 sm:w-12 sm:h-16 text-sm sm:text-3xl';
    if (wordLength > 10) return 'w-6 h-10 sm:w-12 sm:h-16 text-base sm:text-3xl';
    if (wordLength > 8) return 'w-7 h-11 sm:w-12 sm:h-16 text-lg sm:text-3xl';
    return 'w-8 h-12 sm:w-14 sm:h-20 text-xl sm:text-4xl';
  };

  const boxClass = getBoxSize(displayWord.length || 7);
  const isCountdownActive = status === 'victory_countdown' || (currentClue && currentClue.contactedBy);

  const isWordInput = ['SECRET', 'GUESS', 'CONTACT', 'DENY'].includes(activeAction);
  const showPrefixInInput = ['GUESS', 'CONTACT', 'DENY'].includes(activeAction);

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full p-4 overflow-hidden relative">
      <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-12 w-full transition-all duration-500 max-h-full">
        
        {isCountdownActive ? (
          <div className="flex-1 flex flex-col items-center justify-center w-full animate-in fade-in zoom-in duration-500 px-2">
            {status === 'victory_countdown' ? (
              <div className="cta-gradient py-8 px-10 sm:py-12 sm:px-16 rounded-3xl ambient-shadow w-full max-w-xl flex items-center justify-between">
                <div className="text-left min-w-0 mr-8">
                  <h4 className="text-xl sm:text-3xl font-extrabold text-on-primary-container uppercase leading-tight tracking-tighter">Victory Pending</h4>
                  <p className="text-on-primary-container/60 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mt-2">Contest to Intercept</p>
                </div>
                <div className="text-7xl sm:text-9xl font-black text-on-primary-container leading-none tabular-nums">{victoryCountdown}</div>
              </div>
            ) : (
              <div className="bg-tertiary py-8 px-10 sm:py-12 sm:px-16 rounded-3xl ambient-shadow w-full max-w-xl flex items-center justify-between">
                <div className="text-left min-w-0 mr-8">
                  <h4 className="text-xl sm:text-3xl font-extrabold text-white uppercase leading-tight tracking-tighter">Contact</h4>
                  <p className="text-white/60 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mt-2 truncate">
                    {currentClue.playerName} & {currentClue.contactedByName}
                  </p>
                </div>
                <div className="text-7xl sm:text-9xl font-black text-white leading-none tabular-nums">{currentClue.countdown}</div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4 sm:space-y-6 w-full flex flex-col items-center shrink-0">
              <h3 className="text-[10px] sm:text-xs font-black tracking-[0.4em] text-on-surface/30 uppercase">
                {isWordInput ? 'Composition' : (revealedPrefix ? 'Lexicon' : "Genesis")}
              </h3>
              
              {/* Reduced gap from gap-2 to gap-1.5 on mobile */}
              <div className="flex flex-wrap gap-1 sm:gap-4 justify-center items-center max-w-full px-1">
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
                    <div className="text-3xl sm:text-6xl font-black text-on-surface opacity-10 tracking-widest italic">
                      ...
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center w-full px-4 min-h-0 overflow-hidden shrink">
              {activeAction === 'CLUE' ? (
                <div className="bg-tertiary/5 p-8 sm:p-12 rounded-3xl border border-tertiary/10 ambient-shadow w-full max-w-2xl text-center">
                  <p className="text-[10px] sm:text-xs font-black text-tertiary uppercase tracking-[0.3em] mb-6 opacity-60">Providing Hint for {room.currentClue?.hiddenWord}</p>
                  <h4 className="text-2xl sm:text-5xl font-extrabold italic text-on-surface leading-tight break-words px-4">
                    {inputValue || 'Awaiting Input...'}
                  </h4>
                </div>
              ) : currentClue ? (
                <div className="bg-surface-lowest p-8 sm:p-12 rounded-3xl ambient-shadow w-full max-w-2xl relative overflow-hidden group border border-outline-variant">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-tertiary/20"></div>
                  <p className="text-[10px] sm:text-xs font-black text-on-surface/30 uppercase tracking-[0.3em] mb-6 text-center">Clue from {currentClue.playerName}</p>
                  <h4 className="text-2xl sm:text-5xl font-extrabold italic text-on-surface leading-tight break-words px-4 text-center tracking-tight">
                    "{currentClue.hint || 'Pending...'}"
                  </h4>
                </div>
              ) : status === 'setting_word' || status === 'waiting' ? (
                <div className="text-on-surface/40 flex flex-col items-center py-6">
                  <p className="text-sm sm:text-base font-bold uppercase tracking-[0.3em] animate-pulse text-center px-12 leading-loose italic">
                    {status === 'waiting' 
                      ? 'Tap Wordmaster to Begin' 
                      : (isWordmaster ? 'Define the Secret Lexicon Above' : 'Awaiting Wordmaster Submission')}
                  </p>
                </div>
              ) : (
                <div className="text-on-surface/20 text-sm sm:text-base font-black uppercase tracking-[0.4em] py-8 text-center px-12 italic">
                  Awaiting Player Coordination
                </div>
              )}
            </div>
          </>
        )}

        <div className="h-6 overflow-hidden w-full px-4 shrink-0">
          {typingStatus.length > 0 && (
            <div className="flex items-center justify-center space-x-3 text-tertiary/60 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] animate-in fade-in duration-500">
              <p className="truncate max-w-[300px] sm:max-w-none italic">
                {typingStatus.map(t => t.username).join(', ')} composing...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CentralArea;
