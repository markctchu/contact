import { useEffect } from 'react';
import CentralArea from './CentralArea';
import BottomInput from './BottomInput';
import { Users, Sun, Moon } from 'lucide-react';
import { GameProvider, useGame } from '../contexts/GameContext';

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
      <header className="bg-surface-low border-b border-outline-variant px-4 sm:px-8 py-3 sm:py-5 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="bg-tertiary p-2 rounded-lg ambient-shadow">
            <h1 className="text-xl sm:text-2xl font-black text-white leading-none">C</h1>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-on-surface leading-tight tracking-tight">{room.name}</h2>
            <p className="text-[9px] sm:text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-black opacity-40">Active Session</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-surface-container transition-all mr-2">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className="flex items-center bg-surface-container px-4 py-2 rounded-full border border-outline-variant ambient-shadow">
            <Users size={16} className="text-tertiary mr-2" />
            <span className="text-xs sm:text-sm font-black">{room.players.length}</span>
            <span className="hidden sm:inline text-[10px] text-on-surface-variant ml-2 font-black uppercase tracking-widest opacity-40">Entities</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 relative bg-surface overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-t from-surface-low/40 to-transparent">
          <div className="w-full max-w-4xl mx-auto h-full min-h-0">
            <CentralArea />
          </div>
        </div>

        {/* Keyboard Footer */}
        <section className="bg-surface shrink-0 transition-colors duration-300">
          <BottomInput />
        </section>
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
