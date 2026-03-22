import { useMemo } from 'react';

function CentralArea({ room, typingStatus, socketId }) {
  const { revealedPrefix, currentClue, status, victoryCountdown, secretWord } = room;

  const displayWord = useMemo(() => {
    if (status === 'game_over' && secretWord) return secretWord;
    if (!revealedPrefix) return 'CONTACT';
    return revealedPrefix;
  }, [revealedPrefix, status, secretWord]);

  // Dynamic sizing based on word length to ensure it fits the screen
  const getBoxSize = (wordLength) => {
    if (wordLength > 12) return 'w-6 h-9 sm:w-12 sm:h-16 text-base sm:text-3xl';
    if (wordLength > 8) return 'w-8 h-12 sm:w-12 sm:h-16 text-xl sm:text-3xl';
    return 'w-10 h-14 sm:w-12 sm:h-16 text-2xl sm:text-3xl';
  };

  const boxClass = getBoxSize(displayWord.length);
  const isCountdownActive = status === 'victory_countdown' || (currentClue && currentClue.contactedBy);

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full p-0 sm:p-2 overflow-hidden relative">
      <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-4 w-full transition-all duration-300 max-h-full py-0 sm:py-1">
        
        {isCountdownActive ? (
          /* Squat Horizontal Countdown Display */
          <div className="flex-1 flex flex-col items-center justify-center w-full animate-in fade-in zoom-in duration-300 px-2">
            {status === 'victory_countdown' ? (
              <div className="bg-yellow-600 py-3 px-6 sm:py-6 sm:px-12 rounded-2xl shadow-xl animate-pulse w-full max-w-md flex items-center justify-between border-2 border-yellow-400">
                <div className="text-left min-w-0 mr-4">
                  <h4 className="text-xs sm:text-lg font-black text-black uppercase leading-tight tracking-tighter">Wordmaster is Declaring Victory!</h4>
                  <p className="text-black/80 text-[9px] sm:text-xs font-bold uppercase tracking-widest mt-1">Contest to stop the countdown</p>
                </div>
                <div className="text-5xl sm:text-7xl font-black text-black leading-none">{victoryCountdown}</div>
              </div>
            ) : (
              <div className="bg-blue-600 py-3 px-6 sm:py-6 sm:px-12 rounded-2xl shadow-xl animate-bounce w-full max-w-md flex items-center justify-between border-2 border-blue-400">
                <div className="text-left min-w-0">
                  <h4 className="text-sm sm:text-xl font-black text-white uppercase leading-tight tracking-tighter">Contact!</h4>
                  <p className="text-white/80 text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate">
                    {currentClue.playerName} & {currentClue.contactedByName}
                  </p>
                </div>
                <div className="text-5xl sm:text-7xl font-black text-white leading-none ml-4">{currentClue.countdown}</div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Revealed Word Prefix / Intro */}
            <div className="space-y-1 sm:space-y-2 w-full flex flex-col items-center shrink-0">
              <h3 className="text-[8px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] text-gray-500 uppercase">
                {revealedPrefix ? 'Current Prefix' : "Let's Play"}
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-2 justify-center items-center max-w-full px-0.5">
                {displayWord.split('').map((char, i) => (
                  <div 
                    key={i} 
                    className={`${boxClass} flex items-center justify-center rounded-md sm:rounded-xl font-black shadow-inner border-t border-white/5 bg-blue-600 text-white shadow-blue-900 transition-all duration-300`}
                  >
                    {char}
                  </div>
                ))}
                
                {status !== 'game_over' && revealedPrefix && (
                  <div className="flex items-center">
                    <div className={`${boxClass} flex items-center justify-center rounded-md sm:rounded-xl font-black shadow-inner border-t border-white/5 bg-gray-800 text-gray-700`}>
                      _
                    </div>
                    <div className="text-xl sm:text-4xl font-black text-gray-700 ml-1 leading-none self-end pb-1 sm:pb-2">
                      ...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Current Clue or Status Overlay */}
            <div className="flex items-center justify-center w-full px-2 min-h-0 overflow-hidden shrink">
              {currentClue ? (
                <div className="bg-gray-800/80 p-3 sm:p-8 rounded-xl sm:rounded-3xl border border-gray-700 shadow-2xl backdrop-blur-sm w-full max-w-lg relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/30 group-hover:bg-blue-500 transition-colors"></div>
                  <p className="text-[9px] sm:text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-1 sm:mb-4 truncate px-2 text-center">Clue from {currentClue.playerName}</p>
                  <h4 className="text-sm sm:text-3xl font-extrabold italic text-white leading-tight break-words px-2 text-center">
                    "{currentClue.hint || 'Waiting for hint...'}"
                  </h4>
                </div>
              ) : status === 'setting_word' || status === 'waiting' ? (
                <div className="text-gray-500 italic flex flex-col items-center py-2">
                  <p className="text-sm sm:text-base font-bold text-blue-400/60 uppercase tracking-widest animate-pulse text-center px-6 leading-relaxed">
                    {status === 'waiting' 
                      ? 'Tap Wordmaster to submit a secret word...' 
                      : 'Waiting for Wordmaster to pick a secret word...'}
                  </p>
                </div>
              ) : (
                <div className="text-gray-500 text-sm sm:text-base font-bold italic opacity-40 py-4 text-center px-8 leading-relaxed">
                  Waiting for players to submit a clue...
                </div>
              )}
            </div>
          </>
        )}

        {/* Typing Indicators */}
        <div className="h-4 sm:h-6 overflow-hidden w-full px-2 shrink-0">
          {typingStatus.length > 0 && (
            <div className="flex items-center justify-center space-x-2 text-blue-400/80 text-[9px] sm:text-xs animate-pulse truncate font-bold uppercase tracking-wider">
              <div className="flex space-x-1 shrink-0">
                <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-current rounded-full animate-bounce"></span>
                <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <p className="truncate max-w-[200px] sm:max-w-none">
                {typingStatus.map(t => t.username).join(', ')} typing...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CentralArea;
