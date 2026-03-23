import { useState, useEffect, useRef } from 'react';
import CentralArea from './CentralArea';
import BottomInput from './BottomInput';
import { socket } from '../socket';
import { Users, Sun, Moon } from 'lucide-react';
import { EVENTS } from '../constants';
import { useGameState } from '../hooks/useGameState';

function GameRoom({ room, typingStatus, username, socketId, toggleTheme, theme }) {
  const [chat, setChat] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(true);
  
  // Defensive check: ensure room exists before initializing hooks
  const isWordmaster = room?.wordmaster === socketId;
  const { activeAction, setActiveAction, toggleAction } = useGameState(room || { status: 'waiting' }, socketId, isWordmaster);

  useEffect(() => {
    if (room?.chat) {
      setChat(room.chat);
    }
  }, [room?.id]); // Only reset when room actually changes

  useEffect(() => {
    socket.on(EVENTS.CHAT_UPDATE, (updatedChat) => {
      setChat(updatedChat);
    });
    return () => socket.off(EVENTS.CHAT_UPDATE);
  }, []);

  const handleEnter = () => {
    if (!room) return;
    const val = inputValue.trim();
    const prefix = room.revealedPrefix || '';
    if (!val && !activeAction) return;

    if (activeAction === 'SECRET') {
      socket.emit(EVENTS.SET_SECRET_WORD, { word: val });
    } else if (activeAction === 'GUESS') {
      socket.emit(EVENTS.SUBMIT_GUESS_WORD, { word: prefix + val });
    } else if (activeAction === 'GUESS_CLUE') {
      socket.emit(EVENTS.SUBMIT_GUESS_CLUE, { clue: val });
    } else if (activeAction === 'CONTACT') {
      socket.emit(EVENTS.CALL_CONTACT, { guess: prefix + val });
    } else if (activeAction === 'DENY') {
      socket.emit(EVENTS.DENY_GUESS, { guess: prefix + val });
    } else if (val) {
      socket.emit(EVENTS.CHAT_MESSAGE, { message: val });
    }

    setInputValue('');
    if (['CONTACT', 'GUESS', 'DENY'].includes(activeAction)) {
      setActiveAction(null);
    }
  };

  const handleKeyPress = (key) => {
    setInputValue(prev => prev + key);
  };

  const handleBackspace = () => {
    setInputValue(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!room) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        setShowKeyboard(prev => !prev);
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
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputValue, activeAction, room?.revealedPrefix, room?.id]);

  if (!room) {
    return <div className="h-[100dvh] bg-surface flex items-center justify-center">
      <div className="animate-pulse text-on-surface/20 font-black uppercase tracking-widest">Initializing Session...</div>
    </div>;
  }

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
            <span className="text-xs sm:text-sm font-black">{room.players?.length || 0}</span>
            <span className="hidden sm:inline text-[10px] text-on-surface-variant ml-2 font-black uppercase tracking-widest opacity-40">Entities</span>
          </div>
        </div>
      </header>

      {/* Main Content (Tiles + Controls) */}
      <main className="flex-1 flex flex-col min-h-0 relative bg-surface">
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-gradient-to-t from-surface-low/40 to-transparent">
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-4">
            <CentralArea 
              room={room} 
              typingStatus={typingStatus} 
              socketId={socketId} 
              inputValue={inputValue}
              activeAction={activeAction}
              onToggleAction={toggleAction}
              onCancel={() => {
                setInputValue('');
                setActiveAction(null);
                if (room.status === 'setting_word' && isWordmaster) {
                  socket.emit(EVENTS.CANCEL_ACTION);
                } else if (room.currentGuess && room.currentGuess.player === socketId) {
                  socket.emit(EVENTS.CANCEL_ACTION);
                }
              }}
            />
          </div>
        </div>

        {/* Integrated Chat & Keyboard */}
        <section className="bg-surface border-t border-outline-variant shrink-0 transition-colors duration-300">
          <BottomInput 
            room={room} 
            socketId={socketId}
            chat={chat}
            username={username}
            isWordmaster={isWordmaster}
            inputValue={inputValue}
            setInputValue={setInputValue}
            activeAction={activeAction}
            handleEnter={handleEnter}
            showKeyboard={showKeyboard}
            setShowKeyboard={setShowKeyboard}
          />
        </section>
      </main>
    </div>
  );
}

export default GameRoom;
