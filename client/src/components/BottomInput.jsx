import { useState, useEffect, useRef, useMemo } from 'react';
import { socket } from '../socket';
import { EVENTS } from '../constants';
import ChatWindow from './ChatWindow';
import ActionToggleButton from './ActionToggleButton';
import VirtualKeyboard from './VirtualKeyboard';

function BottomInput({ 
  room, 
  socketId, 
  chat, 
  username,
  isWordmaster, 
  inputValue, 
  setInputValue, 
  activeAction, 
  setActiveAction, 
  toggleAction,
  showKeyboard,
  setShowKeyboard
}) {
  const [privateMessages, setPrivateMessages] = useState([]);

  useEffect(() => {
    socket.on(EVENTS.CHAT_UPDATE_PRIVATE, (msg) => {
      setPrivateMessages(prev => [...prev, msg]);
    });
    return () => socket.off(EVENTS.CHAT_UPDATE_PRIVATE);
  }, []);

  const allMessages = [...chat, ...privateMessages].sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    const timeout = setTimeout(() => {
      socket.emit(EVENTS.TYPING_STATUS, { intent: inputValue ? (activeAction || 'chat') : null });
    }, 300);
    return () => clearTimeout(timeout);
  }, [inputValue, activeAction]);

  const handleKeyPress = (key) => {
    setInputValue(prev => prev + key);
  };

  const handleBackspace = () => {
    setInputValue(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Escape') return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handleEnter();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key.length === 1) {
        if (/^[a-zA-Z0-9 ]$/.test(e.key)) {
          e.preventDefault();
          handleKeyPress(e.key.toUpperCase());
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputValue, activeAction, room.revealedPrefix]);

  const handleEnter = () => {
    const val = inputValue.trim();
    const prefix = room.revealedPrefix || '';
    if (!val && !activeAction) return;

    if (activeAction === 'SECRET') {
      socket.emit(EVENTS.SET_SECRET_WORD, { word: val });
    } else if (activeAction === 'GUESS') {
      socket.emit(EVENTS.SUBMIT_GUESS_WORD, { word: prefix + val });
    } else if (activeAction === 'GUESS_CLUE') {
      socket.emit(EVENTS.SUBMIT_GUESS_CLUE, { clue: val });
    } else if (activeAction === 'CONTACT') {
      socket.emit(EVENTS.CALL_CONTACT, { guess: prefix + val });
    } else if (activeAction === 'DENY') {
      socket.emit(EVENTS.DENY_GUESS, { guess: prefix + val });
    } else if (val) {
      socket.emit(EVENTS.CHAT_MESSAGE, { message: val });
    }

    setInputValue('');
    if (['CONTACT', 'GUESS', 'DENY'].includes(activeAction)) {
      setActiveAction(null);
    }
  };

  const handleCancel = () => {
    setActiveAction(null);
    setInputValue('');
    if (room.status === 'setting_word' && isWordmaster) {
      socket.emit(EVENTS.CANCEL_ACTION);
    } else if (room.currentGuess && room.currentGuess.player === socketId) {
      socket.emit(EVENTS.CANCEL_ACTION);
    }
  };

  const onToggleAction = (action) => {
    toggleAction(action);
    setInputValue('');
  };

  const isWordInput = ['SECRET', 'GUESS', 'GUESS_CLUE', 'CONTACT', 'DENY'].includes(activeAction);

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
    <div className="flex flex-col max-w-2xl mx-auto w-full relative">
      {/* 1. Prompt & Mode Display Row (Lives just above chat) */}
      <div className="flex items-center justify-between px-4 py-2 sm:py-3 shrink-0">
        <ActionToggleButton 
          room={room}
          socketId={socketId}
          isWordmaster={isWordmaster}
          activeAction={activeAction}
          onToggleAction={onToggleAction}
          onCancel={handleCancel}
        />
        <div className="text-[10px] font-black text-tertiary uppercase tracking-[0.2em] transition-all">
          <span className={activeAction ? 'animate-pulse' : 'opacity-40'}>
            {modeLabel}
          </span>
        </div>
      </div>

      {/* 2. Chat Window */}
      <div className="px-4">
        <ChatWindow messages={allMessages} />
      </div>

      {/* 3. Input Row (Persistent Username + Cursor) */}
      <div className="px-6 py-2 sm:py-3 min-h-[40px] flex items-center">
        {!isWordInput ? (
          <div className="flex items-baseline w-full transition-all duration-300">
            <span className="font-black text-tertiary uppercase text-[10px] tracking-widest mr-3 opacity-60 shrink-0">
              {username}:
            </span>
            <div className="flex-1 flex items-baseline min-w-0">
              <span className="text-on-surface font-bold text-sm sm:text-base uppercase tracking-widest truncate">
                {inputValue}
              </span>
              <span className="inline-block w-1 h-4 ml-1 bg-tertiary/40 animate-[pulse_1.5s_infinite] rounded-full shrink-0"></span>
            </div>
          </div>
        ) : (
          <div className="text-[10px] font-black text-on-surface/20 uppercase tracking-[0.2em] italic">
            Input active in central area...
          </div>
        )}
      </div>

      {/* 4. Keyboard Controls */}
      <div className="px-2 pb-1 sm:pb-3 space-y-2">
        <div className="flex justify-end px-2">
          <button 
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="hidden sm:block text-[10px] font-black text-on-surface/10 hover:text-tertiary uppercase tracking-[0.2em] transition-colors"
          >
            {showKeyboard ? '[ Hide Keys ]' : '[ Show Keys ]'}
          </button>
        </div>
        {showKeyboard && (
          <VirtualKeyboard 
            onKeyPress={handleKeyPress}
            onEnter={handleEnter}
            onBackspace={handleBackspace}
          />
        )}
      </div>
    </div>
  );
}

export default BottomInput;
