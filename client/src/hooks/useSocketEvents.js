import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { EVENTS } from '../constants';

export function useSocketEvents() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState(socket.id);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setSocketId(socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      setSocketId(null);
      setCurrentRoom(null);
    }

    function onRoomUpdate(room) {
      setCurrentRoom(room);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(EVENTS.ROOM_UPDATE, onRoomUpdate);

    // Initial check in case it's already connected
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(EVENTS.ROOM_UPDATE, onRoomUpdate);
    };
  }, []);

  return { currentRoom, isConnected, socketId };
}
