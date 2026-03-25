import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { EVENTS } from '../constants';

export function useSocketEvents() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [typingStatus, setTypingStatus] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState(socket.id);

  useEffect(() => {
    function onConnect() {
      console.log(`[Socket] Connected to server. ID: ${socket.id} [Transport: ${socket.io.engine.transport.name}]`);
      setIsConnected(true);
      setSocketId(socket.id);

      socket.io.engine.on('upgrade', (transport) => {
        console.log(`[Socket] Transport upgraded to ${transport.name}`);
      });
    }

    function onDisconnect(reason) {
      console.warn('[Socket] Disconnected from server. Reason:', reason);
      setIsConnected(false);
      setSocketId(null);
      setCurrentRoom(null);
      setTypingStatus([]);
    }

    function onConnectError(error) {
      console.error('[Socket] Connection error:', error.message);
    }

    function onReconnectAttempt(attempt) {
      console.log(`[Socket] Reconnection attempt #${attempt}`);
    }

    function onRoomUpdate(room) {
      setCurrentRoom(room);
    }

    function onTypingUpdate(typingArr) {
      setTypingStatus(typingArr);
    }

    function onPrivateChatUpdate(log) {
      setCurrentRoom(prev => {
        if (!prev) return null;
        return {
          ...prev,
          chat: [...prev.chat, log]
        };
      });
    }

    // Global listener for all incoming events
    socket.onAny((eventName, ...args) => {
      if (eventName === EVENTS.TYPING_UPDATE) return; // Silent typing updates
      console.log(`[Socket-In] ${eventName}`, args);
    });

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('reconnect_attempt', onReconnectAttempt);
    socket.on(EVENTS.ROOM_UPDATE, onRoomUpdate);
    socket.on(EVENTS.TYPING_UPDATE, onTypingUpdate);
    socket.on(EVENTS.CHAT_UPDATE_PRIVATE, onPrivateChatUpdate);

    // Initial check in case it's already connected
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('reconnect_attempt', onReconnectAttempt);
      socket.off(EVENTS.ROOM_UPDATE, onRoomUpdate);
      socket.off(EVENTS.TYPING_UPDATE, onTypingUpdate);
      socket.off(EVENTS.CHAT_UPDATE_PRIVATE, onPrivateChatUpdate);
    };
  }, []);

  return { currentRoom, typingStatus, isConnected, socketId };
}
