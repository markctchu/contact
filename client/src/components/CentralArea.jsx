import React, { useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import ActionToggleButton from './ActionToggleButton';
import { STRINGS } from '../constants/strings';

const LetterTile = React.memo(({ char, className, style }) => (
  <div className={className} style={style}>
    {char}
  </div>
));

function CentralArea() {
  const { 
    room, 
    typingStatus, 
    socketId, 
    inputValue, 
    activeAction, 
    toggleAction, 
    handleCancel,
    isWordmaster
  } = useGame();

  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { revealedPrefix, currentGuess, status, victoryCountdown, secretWord, winner } = room;

  const displayWord = useMemo(() => {
    if (status === 'game_over' && secretWord) return secretWord;
    return revealedPrefix;
  }, [revealedPrefix, status, secretWord]);

  const isWordInput = ['SECRET', 'GUESS', 'CONTACT', 'DENY'].includes(activeAction);
  const isClueInput = activeAction === 'GUESS_CLUE';
  const showPrefixInInput = ['GUESS', 'CONTACT', 'DENY'].includes(activeAction);

  const clueHiddenWord = currentGuess.hiddenWord || '';

  // Calculate total visible tiles to ensure accurate scaling
  const totalVisibleCount = useMemo(() => {
    if (status === 'game_over') return secretWord?.length || 7;
    if (isWordInput) {
      const prefixLen = showPrefixInInput ? revealedPrefix.length : 0;
      const inputLen = inputValue.length;
      return prefixLen + inputLen + 1; // +1 for the cursor tile
    }
    if (isClueInput) {
      return clueHiddenWord.length || 7;
    }
    if (!revealedPrefix && status !== 'game_over') return 7; // 'CONTACT'
    return displayWord.length;
  }, [isWordInput, isClueInput, showPrefixInInput, revealedPrefix, inputValue, status, displayWord, clueHiddenWord, secretWord]);

  const tileStyle = useMemo(() => {
    const count = totalVisibleCount;
    const isDesktop = windowWidth >= 640;
    
    // Base dimensions
    const baseW = isDesktop ? 56 : 36;
    const baseH = isDesktop ? 80 : 56;
    const baseFontSize = isDesktop ? 2.25 : 1.25; // rem
    const gap = isDesktop ? 12 : (count > 10 ? 2 : 4);
    
    // Respect the max-w-4xl (896px) limit from GameRoom.jsx on desktop
    const maxContainerW = isDesktop ? 896 : windowWidth;
    const horizontalPadding = isDesktop ? 64 : 16;
    const availableW = Math.min(windowWidth, maxContainerW) - horizontalPadding;
    
    const totalBaseWidth = count * baseW + (count - 1) * gap;
    
    if (totalBaseWidth <= availableW) {
      return { width: baseW, height: baseH, fontSize: `${baseFontSize}rem`, gap };
    }

    // CONTINUOUS RESIZING LOGIC
    // We want total row width to stay exactly at availableW
    const targetW = (availableW - (count - 1) * gap) / count;
    
    // Threshold where we start shrinking height: 
    // When width reaches 60% of its original base width
    const heightShrinkThreshold = baseW * 0.6;
    
    let w = targetW;
    let h = baseH;
    let fontSize = baseFontSize * (w / baseW);

    if (w < heightShrinkThreshold) {
      // Once we hit the width limit, we shrink height proportionally to maintain the slim ratio
      const heightScale = w / heightShrinkThreshold;
      h = baseH * heightScale;
      // We don't shrink font as fast as width to keep it readable
      fontSize = (baseFontSize * (heightShrinkThreshold / baseW)) * heightScale;
    } else {
      // Just squishing width, keep height at baseH
      h = baseH;
      // Font shrinks with width but with a floor to prevent tiny text
      fontSize = Math.max(0.8, baseFontSize * (w / baseW) * 1.1);
    }

    return { 
      width: w, 
      height: h, 
      fontSize: `${fontSize}rem`,
      gap
    };
  }, [totalVisibleCount, windowWidth]);

  const isCountdownActive = status === 'victory_countdown' || (currentGuess.player && currentGuess.contactedBy);

  const modeLabel = useMemo(() => {
    if (!activeAction) return STRINGS.ACTION_CHAT;
    switch (activeAction) {
      case 'SECRET': return STRINGS.PLACEHOLDER_SECRET;
      case 'GUESS': return STRINGS.PLACEHOLDER_GUESS;
      case 'GUESS_CLUE': return STRINGS.PLACEHOLDER_GUESS_CLUE;
      case 'CONTACT': return STRINGS.PLACEHOLDER_CONTACT;
      case 'DENY': return STRINGS.PLACEHOLDER_DENY;
      default: return `${activeAction} ${STRINGS.MODE_ACTIVE_SUFFIX}`;
    }
  }, [activeAction]);

  return (
    <div className="flex-1 flex flex-col w-full h-full relative">
      {/* 1. Main Content Area (Tiles and Clues) */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 sm:space-y-8 w-full transition-all duration-500 min-h-0 py-2 short-screen-tighten">
        {isCountdownActive ? (
          /* Countdown Display */
          <div className="w-full animate-in fade-in zoom-in duration-500 px-2 py-4 short-screen-scale-tiles">
            {status === 'victory_countdown' ? (
              <div className="cta-gradient py-4 px-8 sm:py-8 sm:px-12 rounded-2xl ambient-shadow w-full max-w-xl mx-auto flex items-center justify-between border-2 border-primary/10">
                <div className="text-left min-w-0 mr-4">
                  <h4 className="text-lg sm:text-2xl font-extrabold text-on-primary-container uppercase leading-tight tracking-tighter">{STRINGS.VICTORY_TITLE}</h4>
                  <p className="text-on-primary-container/60 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-1">{STRINGS.VICTORY_SUBTITLE}</p>
                </div>
                <div className="text-5xl sm:text-8xl font-black text-on-primary-container leading-none tabular-nums">{victoryCountdown}</div>
              </div>
            ) : (
              <div className="bg-tertiary py-4 px-8 sm:py-8 sm:px-12 rounded-2xl ambient-shadow w-full max-w-xl mx-auto flex items-center justify-between border-2 border-tertiary/20">
                <div className="text-left min-w-0 mr-4">
                  <h4 className="text-lg sm:text-2xl font-extrabold text-white uppercase leading-tight tracking-tighter">{STRINGS.CONTACT_TITLE}</h4>
                  <p className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-1 truncate">
                    {currentGuess.playerName} & {currentGuess.contactedByName}
                  </p>
                </div>
                <div className="text-5xl sm:text-8xl font-black text-white leading-none tabular-nums">{currentGuess.countdown}</div>
              </div>
            )}
          </div>
        ) : (
          <div className={`w-full ${isClueInput ? 'space-y-4 sm:space-y-6' : 'space-y-6 sm:space-y-10'} py-4 short-screen-tighten`}>
            <div className="space-y-2 sm:space-y-4 w-full flex flex-col items-center">
              <h3 className="text-[9px] sm:text-xs font-black tracking-[0.4em] text-on-surface/30 uppercase">
                {status === 'game_over' 
                  ? STRINGS.WORD_LABEL_FINAL 
                  : (isClueInput ? STRINGS.LOG_YOUR_GUESS : (isWordInput ? STRINGS.WORD_LABEL_INPUT : (revealedPrefix ? STRINGS.WORD_LABEL_REVEALED : STRINGS.WORD_LABEL_INIT)))}
              </h3>
              
              <div 
                className="flex flex-nowrap justify-center items-center max-w-full px-2 short-screen-scale-tiles transition-all duration-300"
                style={{ gap: `${tileStyle.gap}px` }}
              >
                {!revealedPrefix && !isWordInput && !isClueInput && status !== 'game_over' && 'CONTACT'.split('').map((char, i) => (
                  <LetterTile 
                    key={`init-${i}`} 
                    char={char} 
                    style={{ width: `${tileStyle.width}px`, height: `${tileStyle.height}px`, fontSize: tileStyle.fontSize }}
                    className="flex items-center justify-center rounded-lg sm:rounded-xl font-black bg-surface-lowest text-on-surface ambient-shadow shrink-0"
                  />
                ))}

                {status !== 'game_over' && showPrefixInInput && revealedPrefix && revealedPrefix.split('').map((char, i) => (
                  <LetterTile 
                    key={`prefix-${i}`} 
                    char={char} 
                    style={{ width: `${tileStyle.width}px`, height: `${tileStyle.height}px`, fontSize: tileStyle.fontSize }}
                    className="flex items-center justify-center rounded-lg sm:rounded-xl font-black bg-surface-container text-on-surface opacity-30 shrink-0"
                  />
                ))}

                {(isClueInput ? clueHiddenWord : (isWordInput ? (showPrefixInInput ? inputValue : inputValue) : displayWord)).split('').map((char, i) => (
                  <LetterTile 
                    key={`input-${i}`} 
                    char={char} 
                    style={{ width: `${tileStyle.width}px`, height: `${tileStyle.height}px`, fontSize: tileStyle.fontSize }}
                    className="flex items-center justify-center rounded-lg sm:rounded-xl font-black ambient-shadow bg-surface-lowest text-on-surface transition-all duration-300 animate-in zoom-in-90 slide-in-from-bottom-2 shrink-0"
                  />
                ))}
                
                {isWordInput && (
                  <div 
                    style={{ width: `${tileStyle.width}px`, height: `${tileStyle.height}px` }}
                    className="flex items-center justify-center rounded-lg sm:rounded-xl font-black bg-tertiary/10 border-2 border-tertiary/20 shrink-0"
                  >
                    <span className="w-1 h-1/2 bg-tertiary rounded-full animate-[pulse_1.5s_infinite]"></span>
                  </div>
                )}

                {status === 'playing' && !isWordInput && !isClueInput && revealedPrefix && (
                  <div className="flex items-center ml-1 shrink-0">
                    <div className="text-2xl sm:text-5xl font-black text-on-surface opacity-10 tracking-widest italic">...</div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full flex items-center justify-center px-4 short-screen-scale-tiles">
              {status === 'game_over' ? (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000">
                  <div className={`px-10 py-4 rounded-full font-black text-xl sm:text-3xl uppercase tracking-[0.3em] ambient-shadow border-2
                    ${winner === 'players' ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' : 'cta-gradient border-primary/10 text-on-primary-container'}`}>
                    {winner === 'players' ? STRINGS.WINNER_PLAYERS : STRINGS.WINNER_WORDMASTER}
                  </div>
                  <p className="mt-6 text-[10px] font-black text-on-surface/20 uppercase tracking-[0.4em] animate-pulse">{STRINGS.PLAY_AGAIN_PROMPT}</p>
                </div>
              ) : isClueInput ? (
                <div className="bg-tertiary/5 p-3 sm:p-6 rounded-2xl border border-tertiary/10 ambient-shadow w-full max-w-2xl text-center">
                  <p className="text-[9px] sm:text-xs font-black text-tertiary uppercase tracking-[0.3em] mb-2 sm:mb-4 opacity-60">{STRINGS.HINT_INPUT_PROMPT(clueHiddenWord)}</p>
                  <h4 className="text-xl sm:text-4xl font-extrabold italic text-on-surface leading-tight break-words px-4">
                    {inputValue}
                    <span className="inline-block w-1 h-6 sm:h-10 ml-1 bg-tertiary rounded-full animate-[pulse_1.5s_infinite] align-middle"></span>
                  </h4>
                </div>
              ) : currentGuess.player ? (
                <div className="bg-surface-lowest p-4 sm:p-8 rounded-2xl ambient-shadow w-full max-w-2xl relative overflow-hidden group border border-outline-variant">
                  <div className="absolute top-0 left-0 w-full h-1 bg-tertiary/20"></div>
                  <p className="text-[9px] sm:text-[10px] font-black text-on-surface/30 uppercase tracking-[0.3em] mb-2 sm:mb-4 text-center">{STRINGS.LOG_CLUE_HEADER(currentGuess.playerName)}</p>
                  <h4 className="text-xl sm:text-4xl font-extrabold italic text-on-surface leading-tight break-words px-4 text-center tracking-tight">
                    "{currentGuess.clue || STRINGS.LOG_HINT_PENDING}"
                  </h4>
                </div>
              ) : status === 'setting_word' || status === 'waiting' ? (
                <div className="text-on-surface/40 flex flex-col items-center py-4">
                  <p className="text-xs sm:text-base font-bold uppercase tracking-[0.3em] animate-pulse text-center px-12 leading-loose italic">
                    {status === 'waiting' ? STRINGS.STATUS_WAITING : (isWordmaster ? STRINGS.STATUS_SETTING_WM : STRINGS.STATUS_SETTING_PL)}
                  </p>
                </div>
              ) : (
                <div className="text-on-surface/20 text-xs sm:text-base font-black uppercase tracking-[0.4em] py-6 text-center px-12 italic">
                  {STRINGS.STATUS_PLAYING_EMPTY}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Control Row */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between px-4 py-1.5 shrink-0">
        <ActionToggleButton 
          onToggleAction={toggleAction}
          onCancel={handleCancel}
        />
        
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-black text-tertiary uppercase tracking-[0.2em]">
            <span className={activeAction ? 'animate-pulse' : 'opacity-40'}>
              {modeLabel}
            </span>
          </div>
          {typingStatus.length > 0 && (
            <div className="text-[8px] font-bold text-tertiary/40 uppercase tracking-widest italic mt-0.5">
              {typingStatus.length} {STRINGS.TYPING_SUFFIX}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CentralArea;
