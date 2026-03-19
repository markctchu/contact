import { useState, useEffect, useRef } from 'react';
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
  const maxHeightRef = useRef(0);
  const { activeAction, setActiveAction, toggleAction } = useGameState(room, socketId, isWordmaster);

  useEffect(() => {
    socket.on(EVENTS.CHAT_UPDATE_PRIVATE, (msg) => {
      setPrivateMessages(prev => [...prev, msg]);
    });
    return () => socket.off(EVENTS.CHAT_UPDATE_PRIVATE);
  }, []);

  // Detect keyboard by monitoring viewport height changes relative to max seen height
  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      
      // Update max height if we see a larger one (keyboard definitely down)
      if (currentHeight > maxHeightRef.current) {
        maxHeightRef.current = currentHeight;
      }

      // If current height is significantly less than max seen height, keyboard is up
      // 15% threshold to account for browser UI shifting
      const isUp = maxHeightRef.current > 0 && currentHeight < maxHeightRef.current * 0.85;
      setIsKeyboardUp(isUp);
    };

    if (window.visualViewport) {
      maxHeightRef.current = window.visualViewport.height;
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      maxHeightRef.current = window.innerHeight;
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
