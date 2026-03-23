import { useState, useEffect } from 'react';
import { socket } from './socket';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import { EVENTS } from './constants';
import { STRINGS } from './constants/strings';
import { useSocketEvents } from './hooks/useSocketEvents';

function App() {
  const [username, setUsername] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const { currentRoom, typingStatus, socketId, isConnected } = useSocketEvents();

  // Screen Wake Lock
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('[App] Screen Wake Lock acquired');
        }
      } catch (err) {
        console.warn(`[App] Wake Lock error: ${err.name}, ${err.message}`);
      }
    };

    // Only request if user has a name (active session)
    if (username) {
      requestWakeLock();
    }

    // Re-acquire when tab becomes visible again
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) wakeLock.release().then(() => {
        wakeLock = null;
        console.log('[App] Screen Wake Lock released');
      });
    };
  }, [username]);

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
    const savedRoomId = sessionStorage.getItem('lastRoomId');
    if (savedName) {
      console.log('[App] Restoring session for:', savedName);
      setUsername(savedName);
      socket.connect();
      
      // If we have a saved room, proactively join it immediately on mount/restore
      if (savedRoomId) {
        console.log('[App] Proactive re-join for room:', savedRoomId);
        socket.emit(EVENTS.JOIN_ROOM, { roomId: savedRoomId, username: savedName });
      }
    }
  }, []);

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
    } else {
      // If we are back in the lobby, clear the last room so we don't loop back in
      sessionStorage.removeItem('lastRoomId');
    }
  }, [currentRoom]);

  if (!username) {
    return (
      <div className="h-[100dvh] bg-surface flex items-center justify-center p-6 overflow-hidden">
        <div className="bg-surface-lowest p-10 rounded-xl ambient-shadow w-full max-w-md">
          <h1 className="text-5xl font-extrabold mb-2 text-on-surface tracking-tighter">{STRINGS.APP_TITLE}</h1>
          <p className="text-on-surface-variant mb-10 text-sm uppercase tracking-[0.2em] font-bold opacity-60">{STRINGS.TAGLINE}</p>
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
                placeholder={STRINGS.LOGIN_LABEL}
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
              {STRINGS.LOGIN_CTA}
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
          isConnected={isConnected}
        />
      )}
    </div>
  );
}

export default App;
