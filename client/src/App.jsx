import { useState, useEffect } from 'react';
import { socket } from './socket';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import { EVENTS } from './constants';
import { useSocketEvents } from './hooks/useSocketEvents';

function App() {
  const [username, setUsername] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const { currentRoom, typingStatus, socketId, isConnected } = useSocketEvents();

  // Debug logging
  useEffect(() => {
    console.log('[App] State Update:', { username, hasRoom: !!currentRoom, socketId, isConnected });
  }, [username, currentRoom, socketId, isConnected]);

  const handleJoin = (name) => {
    console.log('[App] Joining as:', name);
    setUsername(name);
    sessionStorage.setItem('username', name);
    socket.connect();
  };

  const handleCreateRoom = (roomName) => {
    console.log('[App] Creating room:', roomName);
    socket.emit(EVENTS.CREATE_ROOM, { name: roomName, username });
  };

  const handleJoinRoom = (roomId) => {
    console.log('[App] Joining room:', roomId);
    socket.emit(EVENTS.JOIN_ROOM, { roomId, username });
  };

  useEffect(() => {
    if (currentRoom) {
      sessionStorage.setItem('lastRoomId', currentRoom.id);
    }
  }, [currentRoom]);

  // Initial check for existing session
  useEffect(() => {
    const savedName = sessionStorage.getItem('username');
    if (savedName) {
      console.log('[App] Restoring session for:', savedName);
      setUsername(savedName);
      socket.connect();
    }
  }, []);

  if (!username) {
    return (
      <div className="h-[100dvh] bg-gray-900 text-white flex items-center justify-center p-4 overflow-hidden">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Contact</h1>
          <p className="text-gray-400 mb-8 text-center text-sm uppercase tracking-widest">Enter a username to start</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (loginInput.trim()) handleJoin(loginInput.trim());
          }} autoComplete="off">
            <input
              name={`f_${Math.random().toString(36).substring(7)}`}
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Your Name"
              autoComplete="off"
              role="presentation"
              data-form-type="other"
              readOnly
              onFocus={(e) => e.target.readOnly = false}
              onBlur={(e) => e.target.readOnly = true}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold"
              autoFocus
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-lg transition-all shadow-lg active:scale-95"
            >
              CONTINUE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-900 text-white flex flex-col overflow-hidden">
      {!currentRoom ? (
        <Lobby 
          username={username} 
          onCreateRoom={handleCreateRoom} 
          onJoinRoom={handleJoinRoom} 
        />
      ) : (
        <GameRoom 
          room={currentRoom} 
          typingStatus={typingStatus}
          username={username} 
          socketId={socketId}
        />
      )}
    </div>
  );
}

export default App;
