import { useState, useEffect } from 'react';
import { socket } from './socket';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import { EVENTS } from './constants';
import { useSocketEvents } from './hooks/useSocketEvents';

function App() {
  const [username, setUsername] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const { currentRoom, typingStatus, socketId, isConnected } = useSocketEvents();

  // Apply theme to document
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#121212'); // Base surface dark
    } else {
      document.documentElement.classList.remove('dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#f7f6f1'); // Base surface light
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const savedName = sessionStorage.getItem('username');
    if (savedName) {
      setUsername(savedName);
    }
  }, []);

  const handleJoin = (name) => {
    setUsername(name);
    sessionStorage.setItem('username', name);
    socket.connect();
  };

  const handleCreateRoom = (roomName) => {
    socket.emit(EVENTS.CREATE_ROOM, { name: roomName, username });
  };

  const handleJoinRoom = (roomId) => {
    socket.emit(EVENTS.JOIN_ROOM, { roomId, username });
  };

  useEffect(() => {
    if (currentRoom) {
      sessionStorage.setItem('lastRoomId', currentRoom.id);
    }
  }, [currentRoom]);

  if (!username) {
    return (
      <div className="h-[100dvh] bg-surface flex items-center justify-center p-6 overflow-hidden">
        <div className="bg-surface-lowest p-10 rounded-xl ambient-shadow w-full max-w-md">
          <h1 className="text-5xl font-extrabold mb-2 text-on-surface tracking-tighter">Contact</h1>
          <p className="text-on-surface-variant mb-10 text-sm uppercase tracking-[0.2em] font-bold opacity-60">The Human Lexicon</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (loginInput.trim()) handleJoin(loginInput.trim());
          }} autoComplete="off">
            <div className="mb-6">
              <input
                name="identity_entry_field"
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Identity"
                autoComplete="off"
                role="presentation"
                data-form-type="other"
                readOnly
                onFocus={(e) => e.target.readOnly = false}
                onBlur={(e) => e.target.readOnly = true}
                className="w-full bg-surface-container rounded-xl px-6 py-4 focus:outline-none focus:bg-surface-high border-2 border-transparent focus:border-tertiary/20 text-on-surface font-bold transition-all placeholder:text-on-surface/30"
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              className="w-full cta-gradient text-on-primary-container font-black py-4 rounded-full transition-all active:scale-[0.98] shadow-lg uppercase tracking-widest text-sm"
            >
              Enter Game
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface text-on-surface flex flex-col overflow-hidden">
      {!currentRoom ? (
        <Lobby 
          username={username} 
          onCreateRoom={handleCreateRoom} 
          onJoinRoom={handleJoinRoom} 
          toggleTheme={toggleTheme}
          theme={theme}
        />
      ) : (
        <GameRoom 
          room={currentRoom} 
          typingStatus={typingStatus}
          username={username} 
          socketId={socketId}
          toggleTheme={toggleTheme}
          theme={theme}
        />
      )}
    </div>
  );
}

export default App;
