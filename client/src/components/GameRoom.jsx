import { useState, useEffect, useRef } from 'react';
import CentralArea from './CentralArea';
import BottomInput from './BottomInput';
import { socket } from '../socket';
import { Users, Sun, Moon } from 'lucide-react';
import { EVENTS } from '../constants';
import { useGameState } from '../hooks/useGameState';

function GameRoom({ room, typingStatus, username, socketId, toggleTheme, theme }) {
  const [chat, setChat] = useState(room.chat || []);
  const [inputValue, setInputValue] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(true);
  
  const isWordmaster = room.wordmaster === socketId;
  const { activeAction, setActiveAction, toggleAction } = useGameState(room, socketId, isWordmaster);

  useEffect(() => {
    socket.on(EVENTS.CHAT_UPDATE, (updatedChat) => {
      setChat(updatedChat);
    });
    return () => socket.off(EVENTS.CHAT_UPDATE);
  }, []);

  // Sync keyboard toggle with Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowKeyboard(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-surface text-on-surface overflow-hidden">
      {/* Top Bar */}
      <header className="bg-surface-low border-b border-outline-variant px-4 sm:px-8 py-3 sm:py-5 flex justify-between items-center z-10 shrink-0 transition-colors duration-300">
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
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-surface-container transition-all mr-2"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className="flex items-center bg-surface-container px-4 py-2 rounded-full border border-outline-variant ambient-shadow">
            <Users size={16} className="text-tertiary mr-2" />
            <span className="text-xs sm:text-sm font-black">{room.players.length}</span>
            <span className="hidden sm:inline text-[10px] text-on-surface-variant ml-2 font-black uppercase tracking-widest opacity-40">Entities</span>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-surface transition-colors duration-300">
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 overflow-hidden bg-gradient-to-t from-surface-low/40 to-transparent">
          <CentralArea 
            room={room} 
            typingStatus={typingStatus} 
            socketId={socketId} 
            inputValue={inputValue}
            activeAction={activeAction}
          />
        </div>

        {/* Bottom Section (Includes Chat & Keyboard) */}
        <section className="bg-surface-low border-t border-outline-variant ambient-shadow shrink-0 transition-colors duration-300">
          <BottomInput 
            room={room} 
            socketId={socketId}
            chat={chat}
            isWordmaster={isWordmaster}
            inputValue={inputValue}
            setInputValue={setInputValue}
            activeAction={activeAction}
            setActiveAction={setActiveAction}
            toggleAction={toggleAction}
            showKeyboard={showKeyboard}
            setShowKeyboard={setShowKeyboard}
          />
        </section>
      </main>
    </div>
  );
}

export default GameRoom;
