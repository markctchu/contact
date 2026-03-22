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

  // Combined chat for rendering
  const allMessages = [...chat, ...privateMessages].sort((a, b) => a.timestamp - b.timestamp);

  // Handle debounced typing status
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

  // Physical Keyboard Support
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
  }, [inputValue, activeAction, room.revealedPrefix]); // Re-bind when room or input changes

  const handleEnter = () => {
    const val = inputValue.trim();
    const prefix = room.revealedPrefix || '';
    
    if (!val && !activeAction) return;

    if (activeAction === 'SECRET') {
      socket.emit(EVENTS.SET_SECRET_WORD, { word: val });
    } else if (activeAction === 'GUESS') {
      // PREPEND PREFIX: User only typed the suffix
      socket.emit(EVENTS.SUBMIT_CLUE_WORD, { word: prefix + val });
    } else if (activeAction === 'CLUE') {
      socket.emit(EVENTS.SUBMIT_CLUE_HINT, { hint: val });
    } else if (activeAction === 'CONTACT') {
      // PREPEND PREFIX: User only typed the suffix
      socket.emit(EVENTS.CALL_CONTACT, { guess: prefix + val });
    } else if (activeAction === 'DENY') {
      // PREPEND PREFIX: User only typed the suffix
      socket.emit(EVENTS.DENY_CLUE, { guess: prefix + val });
    } else if (val) {
      socket.emit(EVENTS.CHAT_MESSAGE, { message: val });
    }

    setInputValue('');
    if (['CONTACT', 'GUESS', 'DENY'].includes(activeAction)) {
      setActiveAction(null);
    }
  };

  const handleCancel = () => {
    // Optimistically clear local state to prevent flicker
    const prevAction = activeAction;
    setActiveAction(null);
    setInputValue('');

    if (room.status === 'setting_word' && isWordmaster) {
      socket.emit(EVENTS.CANCEL_ACTION);
    } else if (room.currentClue && room.currentClue.player === socketId) {
      socket.emit(EVENTS.CANCEL_ACTION);
    }
  };

  const onToggleAction = (action) => {
    toggleAction(action);
    setInputValue('');
  };

  return (
    <div className="p-2 sm:p-3 flex flex-col space-y-2 sm:space-y-3 max-w-2xl mx-auto w-full relative">
      <button 
        onClick={() => setShowKeyboard(!showKeyboard)}
        className="hidden sm:block absolute -top-8 right-2 text-[10px] font-black text-gray-500 hover:text-blue-400 uppercase tracking-tighter transition-colors"
      >
        {showKeyboard ? '[ Hide Keyboard ]' : '[ Show Keyboard ]'}
      </button>

      <ChatWindow messages={allMessages} />

      <div className="flex space-x-2 sm:space-x-3 h-10 sm:h-12">
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
