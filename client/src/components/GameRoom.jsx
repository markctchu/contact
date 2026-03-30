import { useEffect, useState, useRef } from 'react';
import CentralArea from './CentralArea';
import BottomInput from './BottomInput';
import { Users, Sun, Moon } from 'lucide-react';
import { GameProvider, useGame } from '../contexts/GameContext';
import { STRINGS } from '../constants/strings';

function GameRoomContent({ toggleTheme, theme }) {
  const { 
    room, 
    showKeyboard, 
    setShowKeyboard, 
    handleEnter, 
    setInputValue,
    socketId
  } = useGame();

  const [showPlayerList, setShowPlayerList] = useState(false);
  const playerListRef = useRef(null);

  // Close player list when clicking anywhere else
  useEffect(() => {
    if (!showPlayerList) return;

    const handleClickOutside = (event) => {
      if (playerListRef.current && !playerListRef.current.contains(event.target)) {
        setShowPlayerList(false);
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener('click', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [showPlayerList]);

  const handleKeyPress = (key) => {
    setInputValue(prev => prev + key);
  };

  const handleBackspace = () => {
    setInputValue(prev => prev.slice(0, -1));
  };

  // Global Keyboard Listener
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        setShowKeyboard(!showKeyboard);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleEnter();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key.length === 1) {
        if (/^[a-zA-Z0-9 ]$/.test(e.key)) {
          e.preventDefault();
          handleKeyPress(e.key);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showKeyboard, setShowKeyboard, handleEnter]);

  return (
    <div className="flex flex-col h-[100dvh] bg-surface text-on-surface overflow-hidden transition-colors duration-300">
      {/* Top Bar */}
      <header className="bg-surface-low border-b border-outline-variant w-full z-30 shrink-0 px-4 sm:px-8 py-2 sm:py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="bg-tertiary p-1.5 rounded-md ambient-shadow">
            <h1 className="text-sm sm:text-base font-black text-white leading-none">C</h1>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-on-surface leading-tight tracking-tight">{room.name}</h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-surface-container transition-all mr-1">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowPlayerList(!showPlayerList)}
              className={`flex items-center px-2 py-1 rounded-lg transition-all ${showPlayerList ? 'bg-surface-container' : 'hover:bg-surface-container'}`}
            >
              <Users size={16} className="text-tertiary mr-2 opacity-60" />
              <span className="text-sm sm:text-base font-black">{room.players.length}</span>
              <span className="hidden sm:inline text-sm text-on-surface-variant ml-2 font-black uppercase tracking-widest opacity-30">{STRINGS.PLAYER_COUNT_LABEL(room.players.length)}</span>
            </button>

            {showPlayerList && (
              <div 
                ref={playerListRef}
                className="absolute top-full right-0 mt-2 w-56 bg-surface-lowest border border-outline-variant rounded-xl shadow-2xl z-50 py-3 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="px-4 pb-2 mb-2 border-b border-outline-variant">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-50">Players In Room</span>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar px-2">
                  {room.players.map((p) => (
                    <div key={p.id} className="flex items-center px-3 py-2 rounded-lg hover:bg-surface-low/50">
                      <div className={`w-1.5 h-1.5 rounded-full mr-3 shrink-0 ${p.status === 'active' ? 'bg-green-500' : 'bg-on-surface/10 animate-pulse'}`} />
                      <span className={`text-xs sm:text-sm font-bold truncate ${p.id === room.wordmaster ? 'text-tertiary' : 'text-on-surface'}`}>
                        {p.username}
                        {p.id === socketId && <span className="ml-1.5 text-[9px] font-black text-on-surface-variant opacity-30">(YOU)</span>}
                      </span>
                      {p.id === room.wordmaster && (
                        <div className="ml-auto bg-tertiary/10 text-tertiary text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0 ml-2">
                          WM
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Unified Canvas */}
      <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden w-full">
        {/* Central Area: Expands to fill full screen width for tiles */}
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <CentralArea />
        </div>

        {/* Bottom Area: Centered with max-width */}
        <div className="shrink-0 w-full">
          <div className="max-w-4xl mx-auto">
            <BottomInput />
          </div>
        </div>
      </main>
    </div>
  );
}

function GameRoom(props) {
  return (
    <GameProvider initialRoom={props.room} username={props.username}>
      <GameRoomContent {...props} />
    </GameProvider>
  );
}

export default GameRoom;
