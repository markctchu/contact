import { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import { EVENTS } from '../constants';
import { useGameState } from '../hooks/useGameState';
import ChatWindow from './ChatWindow';
import ActionToggleButton from './ActionToggleButton';
import UnifiedInput from './UnifiedInput';
import VirtualKeyboard from './VirtualKeyboard';

function BottomInput({ room, socketId, chat, isWordmaster }) {
  const [inputValue, setInputValue] = useState('');
  const [privateMessages, setPrivateMessages] = useState([]);
  const { activeAction, setActiveAction, toggleAction } = useGameState(room, socketId, isWordmaster);

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

  const handleEnter = () => {
    const val = inputValue.trim();
    if (!val && !activeAction) return;

    if (activeAction === 'SECRET') {
      socket.emit(EVENTS.SET_SECRET_WORD, { word: val });
    } else if (activeAction === 'GUESS') {
      socket.emit(EVENTS.SUBMIT_CLUE_WORD, { word: val });
    } else if (activeAction === 'CLUE') {
      socket.emit(EVENTS.SUBMIT_CLUE_HINT, { hint: val });
    } else if (activeAction === 'CONTACT') {
      socket.emit(EVENTS.CALL_CONTACT, { guess: val });
    } else if (activeAction === 'DENY') {
      socket.emit(EVENTS.DENY_CLUE, { guess: val });
    } else if (val) {
      socket.emit(EVENTS.CHAT_MESSAGE, { message: val });
    }

    setInputValue('');
    if (['CONTACT', 'GUESS', 'DENY'].includes(activeAction)) {
      setActiveAction(null);
    }
  };

  const handleCancel = () => {
    if (room.status === 'setting_word' && isWordmaster) {
      socket.emit(EVENTS.CANCEL_ACTION);
    } else if (room.currentClue && room.currentClue.player === socketId) {
      socket.emit(EVENTS.CANCEL_ACTION);
    }
    setActiveAction(null);
    setInputValue('');
  };

  const onToggleAction = (action) => {
    toggleAction(action);
    setInputValue('');
  };

  return (
    <div className="p-2 sm:p-4 flex flex-col space-y-2 sm:space-y-4 max-w-5xl mx-auto w-full">
      <ChatWindow messages={allMessages} />

      <div className="flex space-x-2 sm:space-x-3 h-12 sm:h-14">
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

      <VirtualKeyboard 
        onKeyPress={handleKeyPress}
        onEnter={handleEnter}
        onBackspace={handleBackspace}
      />
    </div>
  );
}

export default BottomInput;
