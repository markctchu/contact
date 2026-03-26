import React, { useMemo, useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import ActionToggleButton from './ActionToggleButton';
import { STRINGS } from '../constants/strings';

const LetterTile = React.memo(({ char, className, style }) => (
  <div className={className} style={style}>
    {char}
  </div>
));

const CountdownProgressBar = ({ isActive, currentCountdown, totalDuration }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    const startProgress = ((totalDuration - currentCountdown) / totalDuration) * 100;
    setProgress(startProgress);

    const remainingTime = currentCountdown * 1000;
    if (remainingTime <= 0) {
      setProgress(100);
      return;
    }

    const interval = 16;
    const totalSteps = remainingTime / interval;
    const increment = (100 - startProgress) / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        return next >= 100 ? 100 : next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isActive, currentCountdown === totalDuration]);

  if (!isActive) return null;

  return (
    <div className="w-full px-6 py-2">
      <div className="w-full h-1 bg-surface-container/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-on-secondary-container transition-none rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

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
  const isVictoryActive = status === 'victory_countdown';

  const guessWord = currentGuess.hiddenWord || '';

  const totalVisibleCount = useMemo(() => {
    if (status === 'game_over') return secretWord?.length || 7;
    if (isWordInput) {
      const prefixLen = showPrefixInInput ? revealedPrefix.length : 0;
      const inputLen = inputValue.length;
      return prefixLen + inputLen + 1;
    }
    if (isClueInput) return guessWord.length || 7;
    if (!revealedPrefix && status !== 'game_over') return 7;
    return displayWord.length;
  }, [isWordInput, isClueInput, showPrefixInInput, revealedPrefix, inputValue, status, displayWord, guessWord, secretWord]);

  const tileStyle = useMemo(() => {
    const count = totalVisibleCount;
    const isDesktop = windowWidth >= 640;
    const baseW = isDesktop ? 56 : 36;
    const baseH = isDesktop ? 80 : 56;
    const baseFontSize = isDesktop ? 2.25 : 1.25;
    const baseGap = isDesktop ? 12 : (count > 10 ? 2 : 4);
    const horizontalPadding = isDesktop ? 64 : 16;
    const availableW = windowWidth - horizontalPadding;
    const totalBaseWidth = count * baseW + (count - 1) * baseGap;
    
    if (totalBaseWidth <= availableW) {
      return { width: baseW, height: baseH, fontSize: `${baseFontSize}rem`, gap: baseGap };
    }

    let gap = baseGap;
    let targetW;
    if (isDesktop) {
      const scaleFactor = availableW / totalBaseWidth;
      targetW = baseW * scaleFactor;
      gap = baseGap * scaleFactor;
    } else {
      targetW = (availableW - (count - 1) * baseGap) / count;
    }
    
    const heightShrinkThreshold = baseW * 0.6;
    let w = targetW;
    let h = baseH;
    let fontSize = baseFontSize * (w / baseW);

    if (w < heightShrinkThreshold) {
      const heightScale = w / heightShrinkThreshold;
      h = baseH * heightScale;
      fontSize = (baseFontSize * (heightShrinkThreshold / baseW)) * heightScale;
    } else {
      h = baseH;
      fontSize = Math.max(0.8, baseFontSize * (w / baseW) * 1.1);
    }

    return { width: w, height: h, fontSize: `${fontSize}rem`, gap };
  }, [totalVisibleCount, windowWidth]);

  const isContactAttempt = currentGuess.player && currentGuess.contactedBy;

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
      <div className="flex-1 flex flex-col items-center justify-center space-y-2 sm:space-y-4 w-full transition-all duration-500 min-h-0 py-2 short-screen-tighten">
        {/* Top Section: Word Display / Labels */}
        <div className="w-full space-y-4 sm:space-y-3 py-2 short-screen-tighten">
          <div className="space-y-1.5 sm:space-y-2 w-full flex flex-col items-center relative">
            <h3 className={`text-[9px] sm:text-xs font-black tracking-[0.4em] uppercase transition-colors duration-500 ${isVictoryActive ? 'text-on-secondary-container' : 'text-on-surface/30'}`}>
              {status === 'game_over' 
                ? STRINGS.WORD_LABEL_FINAL 
                : (isVictoryActive ? STRINGS.WORD_LABEL_VICTORY : (isClueInput ? STRINGS.LOG_YOUR_GUESS : (activeAction === 'SECRET' ? STRINGS.WORD_LABEL_SECRET : (isWordInput ? STRINGS.WORD_LABEL_INPUT : (revealedPrefix ? STRINGS.WORD_LABEL_REVEALED : STRINGS.WORD_LABEL_INIT)))))}
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
                  className="flex items-center justify-center rounded-lg sm:rounded-xl font-black bg-surface-lowest text-on-surface border border-outline-variant shrink-0"
                />
              ))}

              {status !== 'game_over' && showPrefixInInput && revealedPrefix && revealedPrefix.split('').map((char, i) => (
                <LetterTile 
                  key={`prefix-${i}`} 
                  char={char.toUpperCase()} 
                  style={{ width: `${tileStyle.width}px`, height: `${tileStyle.height}px`, fontSize: tileStyle.fontSize }}
                  className="flex items-center justify-center rounded-lg sm:rounded-xl font-black bg-surface-container text-on-surface opacity-30 shrink-0"
                />
              ))}

              {(isClueInput ? guessWord : (isWordInput ? (showPrefixInInput ? inputValue : inputValue) : displayWord)).split('').map((char, i) => (
                <LetterTile 
                  key={`input-${i}`} 
                  char={isClueInput ? char : char.toUpperCase()} 
                  style={{ width: `${tileStyle.width}px`, height: `${tileStyle.height}px`, fontSize: tileStyle.fontSize }}
                  className="flex items-center justify-center rounded-lg sm:rounded-xl font-black bg-surface-lowest text-on-surface border border-outline-variant transition-all duration-300 animate-in zoom-in-90 slide-in-from-bottom-2 shrink-0"
                />
              ))}              
              
              {isWordInput && (
                <div 
                  style={{ width: `${tileStyle.width}px`, height: `${tileStyle.height}px` }}
                  className="flex items-center justify-center rounded-lg sm:rounded-xl font-black bg-tertiary/10 border border-tertiary/20 shrink-0"
                >
                  <span className="w-1 h-1/2 bg-tertiary rounded-full animate-[pulse_1.5s_infinite]"></span>
                </div>
              )}

              {revealedPrefix && !isClueInput && (
                <div className="flex items-center ml-1 shrink-0">
                  <div className="text-2xl sm:text-5xl font-black text-on-surface opacity-10 tracking-widest italic">...</div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Dynamic State Messages / Clue Boxes */}
          <div className="w-full flex items-center justify-center short-screen-scale-tiles">
            {status === 'game_over' ? (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className={`font-black text-2xl sm:text-4xl uppercase tracking-[0.3em]
                  ${winner === 'players' ? 'text-on-secondary-container' : 'text-primary'}`}>
                  {winner === 'players' ? STRINGS.WINNER_PLAYERS : STRINGS.WINNER_WORDMASTER}
                </div>
                <p className="mt-4 text-[10px] font-black text-on-surface/20 uppercase tracking-[0.4em] animate-pulse">{STRINGS.PLAY_AGAIN_PROMPT}</p>
              </div>
            ) : isClueInput ? (
              <div className="w-full max-w-2xl mx-auto px-2 sm:px-4">
                <div className="bg-tertiary/5 p-2 sm:p-4 rounded-2xl w-full text-center relative overflow-hidden">
                  <p className={`text-[9px] sm:text-xs font-black uppercase tracking-[0.3em] mb-1 sm:mb-2 transition-colors duration-500 ${isVictoryActive ? 'text-on-secondary-container' : 'text-tertiary opacity-60'}`}>
                    {isVictoryActive ? STRINGS.WORD_LABEL_VICTORY : STRINGS.CLUE_INPUT_PROMPT(guessWord)}
                  </p>
                  <h4 className="text-xl sm:text-4xl font-extrabold italic text-on-surface leading-tight break-words px-4">
                    {inputValue}
                    <span className="inline-block w-1 h-6 sm:h-10 ml-1 bg-tertiary rounded-full animate-[pulse_1.5s_infinite] align-middle"></span>
                  </h4>
                  {isVictoryActive && (
                    <p className="text-[10px] font-black text-on-secondary-container uppercase tracking-widest mt-2">{STRINGS.STATUS_CONTEST_GUESS}</p>
                  )}
                  <div className="mt-2">
                    <CountdownProgressBar isActive={isVictoryActive} currentCountdown={victoryCountdown} totalDuration={10} />
                  </div>
                </div>
              </div>
            ) : currentGuess.player ? (
              <div className="w-full max-w-2xl mx-auto px-2 sm:px-4">
                <div className="bg-surface-lowest p-3 sm:p-6 rounded-2xl w-full relative overflow-hidden group">
                  <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1.5 sm:mb-3 text-center transition-all duration-500 ${isContactAttempt ? 'text-on-secondary-container' : 'text-on-surface/30'}`}>
                    {isContactAttempt 
                      ? STRINGS.LOG_CONTACT_ATTEMPT(currentGuess.contactedByName)
                      : STRINGS.LOG_CLUE_HEADER(currentGuess.playerName)}
                  </p>
                  <h4 className="text-xl sm:text-4xl font-extrabold italic text-on-surface leading-tight break-words px-4 text-center tracking-tight">
                    "{currentGuess.clue || STRINGS.LOG_CLUE_PENDING}"
                  </h4>
                  <div className="mt-2">
                    <CountdownProgressBar isActive={isContactAttempt} currentCountdown={currentGuess.countdown} totalDuration={4} />
                  </div>
                </div>
              </div>
            ) : status === 'setting_word' || status === 'waiting' ? (
              <div className="text-on-surface/40 flex flex-col items-center py-2 px-12">
                <p className="text-xs sm:text-base font-bold uppercase tracking-[0.3em] animate-pulse text-center leading-loose italic">
                  {status === 'waiting' ? STRINGS.STATUS_WAITING : (isWordmaster ? STRINGS.STATUS_SETTING_WM : STRINGS.STATUS_SETTING_PL)}
                </p>
              </div>
            ) : isVictoryActive ? (
              <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 flex flex-col items-center">
                <div className="bg-surface-low/30 rounded-2xl w-full py-2 px-4 relative overflow-hidden flex flex-col items-center">
                  <div className={`text-xs sm:text-base font-black uppercase tracking-[0.4em] text-center italic transition-colors duration-500 text-on-secondary-container`}>
                    {STRINGS.STATUS_CONTEST_GAME}
                  </div>
                  <div className="w-full mt-4">
                    <CountdownProgressBar isActive={isVictoryActive} currentCountdown={victoryCountdown} totalDuration={10} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-on-surface/20 text-xs sm:text-base font-black uppercase tracking-[0.4em] py-2 text-center px-12 italic">
                {STRINGS.STATUS_PLAYING_EMPTY}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Row */}
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
