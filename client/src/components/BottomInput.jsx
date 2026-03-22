import { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import { EVENTS } from '../constants';
import ChatWindow from './ChatWindow';
import ActionToggleButton from './ActionToggleButton';
import UnifiedInput from './UnifiedInput';
import VirtualKeyboard from './VirtualKeyboard';

function BottomInput({ 
  room, 
  socketId, 
  chat, 
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

  return (
    <div className="p-2 sm:p-4 pb-0.5 sm:pb-3 flex flex-col space-y-2 sm:space-y-4 max-w-2xl mx-auto w-full relative">
      <div className="flex items-center justify-between px-1 shrink-0">
        <button 
          onClick={() => setShowKeyboard(!showKeyboard)}
          className="hidden sm:block text-[10px] font-black text-on-surface/20 hover:text-tertiary uppercase tracking-[0.2em] transition-colors"
        >
          {showKeyboard ? 'Collapse Keys' : 'Expand Keys'}
        </button>
        {activeAction && (
          <span className="text-[10px] font-black text-tertiary uppercase tracking-[0.2em] animate-pulse ml-auto">
            {activeAction === 'GUESS_CLUE' ? 'CLUE' : activeAction} Mode Active
          </span>
        )}
      </div>

      <ChatWindow messages={allMessages} />

      <div className="flex space-x-2 sm:space-x-3 h-10 sm:h-12 shrink-0">
        <ActionToggleButton 
          room={room}
          socketId={socketId}
          isWordmaster={isWordmaster}
          activeAction={activeAction}
          onToggleAction={onToggleAction}
          onCancel={handleCancel}
        />
        <UnifiedInput 
          activeAction={activeAction}
          inputValue={inputValue}
        />
      </div>

      {showKeyboard && (
        <VirtualKeyboard 
          onKeyPress={handleKeyPress}
          onEnter={handleEnter}
          onBackspace={handleBackspace}
        />
      )}
    </div>
  );
}

export default BottomInput;
