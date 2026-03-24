import { useEffect } from 'react';
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
    setInputValue 
  } = useGame();

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
          handleKeyPress(e.key.toUpperCase());
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showKeyboard, setShowKeyboard, handleEnter]);

  return (
    <div className="flex flex-col h-[100dvh] bg-surface text-on-surface overflow-hidden transition-colors duration-300">
      {/* Top Bar */}
      <header className="bg-surface-low border-b border-outline-variant px-4 sm:px-8 py-2 sm:py-3 flex justify-between items-center z-10 shrink-0">
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
          <div className="flex items-center px-2 py-1">
            <Users size={16} className="text-tertiary mr-2 opacity-60" />
            <span className="text-sm sm:text-base font-black">{room.players.length}</span>
            <span className="hidden sm:inline text-sm text-on-surface-variant ml-2 font-black uppercase tracking-widest opacity-30">{STRINGS.PLAYER_COUNT_LABEL(room.players.length)}</span>
          </div>
        </div>
      </header>

      {/* Main Unified Canvas */}
      <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden max-w-4xl mx-auto w-full">
        {/* Central Area: Expands to fill space and centers content */}
        <div className="flex-1 flex flex-col min-h-0">
          <CentralArea />
        </div>

        {/* Bottom Area: Anchored at the bottom */}
        <div className="shrink-0 w-full">
          <BottomInput />
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
