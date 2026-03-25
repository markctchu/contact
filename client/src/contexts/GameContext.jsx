import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socket } from '../socket';
import { EVENTS } from '../constants';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useGameState as useInternalGameState } from '../hooks/useGameState';

const GameContext = createContext();

export function GameProvider({ children, initialRoom, username }) {
  const { currentRoom: roomFromSocket, typingStatus, socketId, isConnected } = useSocketEvents();
  const [room, setRoom] = useState(initialRoom);
  const [inputValue, setInputValue] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [chat, setChat] = useState(initialRoom?.chat || []);

  const isWordmaster = room?.wordmaster === socketId;
  const { activeAction, setActiveAction, toggleAction: internalToggleAction } = useInternalGameState(room || { status: 'waiting' }, socketId, isWordmaster);

  const toggleAction = useCallback((action) => {
    setInputValue(''); // Clear input BEFORE mode change to prevent tiles glitch
    internalToggleAction(action);
  }, [internalToggleAction]);

  // Sync room state from socket hook
  useEffect(() => {
    if (roomFromSocket) {
      setRoom(roomFromSocket);
      if (roomFromSocket.chat) {
        setChat(roomFromSocket.chat);
      }
    }
  }, [roomFromSocket]);

  // Socket Listeners
  useEffect(() => {
    const onChatUpdate = (updatedChat) => setChat(updatedChat);
    const onPrivateChatUpdate = (log) => setChat(prev => [...prev, log]);
    
    socket.on(EVENTS.CHAT_UPDATE, onChatUpdate);
    socket.on(EVENTS.CHAT_UPDATE_PRIVATE, onPrivateChatUpdate);
    
    return () => {
      socket.off(EVENTS.CHAT_UPDATE, onChatUpdate);
      socket.off(EVENTS.CHAT_UPDATE_PRIVATE, onPrivateChatUpdate);
    };
  }, []);

  const handleEnter = useCallback(() => {
    if (!room) return;
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
  }, [inputValue, activeAction, room]);

  const handleKeyPress = useCallback((key) => {
    setInputValue(prev => prev + key);
  }, []);

  const handleBackspace = useCallback(() => {
    setInputValue(prev => prev.slice(0, -1));
  }, []);

  const handleCancel = useCallback(() => {
    setInputValue('');
    
    // Only clear optimistically if it's NOT a mandatory state.
    // Mandatory states are managed by useGameState's internal effect.
    const isMandatory = (room.status === 'setting_word' && isWordmaster) || 
                       (room.status === 'playing' && room.currentGuess?.player === socketId && !room.currentGuess.clue);
    
    if (!isMandatory) {
      setActiveAction(null);
    }

    if (room.status === 'setting_word' && isWordmaster) {
      socket.emit(EVENTS.CANCEL_ACTION);
    } else if (room.currentGuess?.player === socketId) {
      socket.emit(EVENTS.CANCEL_ACTION);
    }
  }, [room, isWordmaster, socketId, setActiveAction]);

  const value = {
    room,
    chat,
    username,
    socketId,
    isConnected,
    typingStatus,
    inputValue,
    setInputValue,
    handleKeyPress,
    handleBackspace,
    activeAction,
    setActiveAction,
    toggleAction,
    showKeyboard,
    setShowKeyboard,
    handleEnter,
    handleCancel,
    isWordmaster
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
