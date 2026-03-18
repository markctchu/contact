import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { EVENTS } from '../constants';
import { useGameState } from '../hooks/useGameState';
import ChatWindow from './ChatWindow';
import ActionToggleButton from './ActionToggleButton';
import UnifiedInput from './UnifiedInput';

function BottomInput({ room, socketId, chat, isWordmaster }) {
  const [inputValue, setInputValue] = useState('');
  const [privateMessages, setPrivateMessages] = useState([]);
  const [isKeyboardUp, setIsKeyboardUp] = useState(false);
  const { activeAction, setActiveAction, toggleAction } = useGameState(room, socketId, isWordmaster);

  useEffect(() => {
    socket.on(EVENTS.CHAT_UPDATE_PRIVATE, (msg) => {
      setPrivateMessages(prev => [...prev, msg]);
    });
    return () => socket.off(EVENTS.CHAT_UPDATE_PRIVATE);
  }, []);

  // Detect keyboard by monitoring viewport height changes
  useEffect(() => {
    const handleResize = () => {
      // If the viewport height is significantly less than the screen height, keyboard is likely up
      const isUp = window.visualViewport ? 
        window.visualViewport.height < window.innerHeight * 0.75 : 
        window.innerHeight < 500;
      setIsKeyboardUp(isUp);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
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

  const handleCancel = () => {
    if (room.currentClue && room.currentClue.player === socketId) {
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
      {!isKeyboardUp && <ChatWindow messages={allMessages} />}

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
          setInputValue={setInputValue}
          onClearAction={() => setActiveAction(null)}
        />
      </div>
    </div>
  );
}

export default BottomInput;
