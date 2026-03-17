import { useState, useEffect } from 'react';
import { socket } from './socket';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';

function App() {
  const [username, setUsername] = useState('');
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
    socket.on('room_update', onRoomUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room_update', onRoomUpdate);
    };
  }, []);

  const handleJoin = (name) => {
    setUsername(name);
    socket.connect();
  };

  const handleCreateRoom = (roomName) => {
    socket.emit('create_room', { name: roomName, username });
  };

  const handleJoinRoom = (roomId) => {
    socket.emit('join_room', { roomId, username });
  };

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Contact</h1>
          <p className="text-gray-400 mb-8 text-center">Enter a username to start playing.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const val = e.target.username.value.trim();
            if (val) handleJoin(val);
          }}>
            <input
              name="username"
              type="text"
              placeholder="Username"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              autoFocus
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {!currentRoom ? (
        <Lobby 
          username={username} 
          onCreateRoom={handleCreateRoom} 
          onJoinRoom={handleJoinRoom} 
        />
      ) : (
        <GameRoom 
          room={currentRoom} 
          username={username} 
          socketId={socketId}
        />
      )}
    </div>
  );
}

export default App;
