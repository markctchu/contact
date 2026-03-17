import { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';

function BottomInput({ room, username, socketId, chat, isWordmaster }) {
  const [inputValue, setInputValue] = useState('');
  const [activeAction, setActiveAction] = useState(null); // 'GUESS', 'CLUE', 'CONTACT', 'DENY', 'SECRET'
  const [privateMessages, setPrivateMessages] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, privateMessages]);

  useEffect(() => {
    socket.on('chat_update_private', (msg) => {
      setPrivateMessages(prev => [...prev, msg]);
    });
    return () => socket.off('chat_update_private');
  }, []);

  // Combined chat for rendering
  const allMessages = [...chat, ...privateMessages].sort((a, b) => a.timestamp - b.timestamp);

  // Sync activeAction with room state
  useEffect(() => {
    const { status, currentClue } = room;
    
    // MANDATORY: Wordmaster picking secret word
    if (status === 'setting_word' && isWordmaster) {
      setActiveAction('SECRET');
      return;
    }

    // MANDATORY: Player setting hint after submitting clue word
    if (status === 'playing' && currentClue && currentClue.player === socketId && !currentClue.hint) {
      setActiveAction('CLUE');
      return;
    }

    // AUTO-CLEAR: If current mandatory conditions are no longer met
    if (activeAction === 'SECRET' && (status !== 'setting_word' || !isWordmaster)) setActiveAction(null);
    if (activeAction === 'CLUE' && (!currentClue || currentClue.player !== socketId || currentClue.hint || status !== 'playing')) setActiveAction(null);
    
    // AUTO-CLEAR: If optional conditions are no longer met
    if (activeAction === 'DENY' && (!currentClue || status !== 'playing' || !isWordmaster)) setActiveAction(null);
    if (activeAction === 'GUESS' && (currentClue || status !== 'playing' || isWordmaster)) setActiveAction(null);
    if (activeAction === 'CONTACT' && (!currentClue || !currentClue.hint || currentClue.contactedBy || status !== 'playing' || isWordmaster || currentClue.player === socketId)) setActiveAction(null);
  }, [room, isWordmaster, socketId, activeAction]);

  // Handle typing status
  useEffect(() => {
    if (inputValue) {
      socket.emit('typing_status', { roomId: room.id, intent: activeAction || 'chat' });
    } else {
      socket.emit('typing_status', { roomId: room.id, intent: null });
    }
  }, [inputValue, activeAction, room.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val && !activeAction) return;

    if (activeAction === 'SECRET') {
      socket.emit('set_secret_word', { roomId: room.id, word: val });
    } else if (activeAction === 'GUESS') {
      socket.emit('submit_clue_word', { roomId: room.id, word: val });
    } else if (activeAction === 'CLUE') {
      socket.emit('submit_clue_hint', { roomId: room.id, hint: val });
    } else if (activeAction === 'CONTACT') {
      socket.emit('call_contact', { roomId: room.id, guess: val });
    } else if (activeAction === 'DENY') {
      socket.emit('deny_clue', { roomId: room.id, guess: val });
    } else if (val) {
      socket.emit('chat_message', { roomId: room.id, message: val });
    }

    setInputValue('');
    // Transient actions clear after submission
    if (['CONTACT', 'GUESS', 'DENY'].includes(activeAction)) {
      setActiveAction(null);
    }
  };

  const handleCancel = () => {
    // If the player is the one who gave the clue, always notify the server to retract it
    if (room.currentClue && room.currentClue.player === socketId) {
      socket.emit('cancel_action', { roomId: room.id });
    }
    setActiveAction(null);
    setInputValue('');
  };

  const getPlaceholder = () => {
    switch (activeAction) {
      case 'SECRET': return "Enter your secret word...";
      case 'GUESS': return "What word are you thinking of?";
      case 'CLUE': return "Give a public hint for your word...";
      case 'CONTACT': return "What word is it?";
      case 'DENY': return "Is it...";
      default: return "Type a message...";
    }
  };

  const renderActionButton = () => {
    const { status, currentClue } = room;

    // 1. END OF GAME / LOBBY
    if (status === 'game_over' || status === 'waiting') {
      return (
        <button 
          type="button"
          onClick={() => socket.emit('become_wordmaster', { roomId: room.id })}
          className="bg-purple-600 hover:bg-purple-700 text-white font-black px-6 rounded-xl transition-all whitespace-nowrap"
        >
          BECOME WORDMASTER
        </button>
      );
    }

    // 2. SETTING WORD (Wordmaster) - Mandatory
    if (status === 'setting_word' && isWordmaster) {
      return <div className="bg-purple-600 text-white font-black px-6 flex items-center rounded-xl whitespace-nowrap">SET WORD</div>;
    }

    // 3. PLAYING
    if (status === 'playing') {
      if (isWordmaster) {
        if (!currentClue) {
          return (
            <button 
              type="button"
              onClick={() => socket.emit('declare_victory', { roomId: room.id })}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-black px-6 rounded-xl transition-all whitespace-nowrap"
            >
              DECLARE VICTORY
            </button>
          );
        }
        return (
          <button 
            type="button"
            onClick={() => setActiveAction(activeAction === 'DENY' ? null : 'DENY')}
            className={`${activeAction === 'DENY' ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-700'} text-white font-black px-6 rounded-xl transition-all whitespace-nowrap`}
          >
            {activeAction === 'DENY' ? 'CANCEL' : 'DENY'}
          </button>
        );
      } else {
        // Player
        if (!currentClue) {
          return (
            <button 
              type="button"
              onClick={() => setActiveAction(activeAction === 'GUESS' ? null : 'GUESS')}
              className={`${activeAction === 'GUESS' ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black px-6 rounded-xl transition-all whitespace-nowrap`}
            >
              {activeAction === 'GUESS' ? 'CANCEL' : 'GUESS'}
            </button>
          );
        } else if (currentClue.player === socketId) {
          // Mandatory Hint phase OR active clue with hint
          if (!currentClue.hint) {
            return (
              <button 
                type="button"
                onClick={handleCancel}
                className="bg-gray-700 text-white font-black px-6 rounded-xl transition-all whitespace-nowrap"
              >
                CANCEL CLUE
              </button>
            );
          } else if (!currentClue.contactedBy) {
            return (
              <button 
                type="button"
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-6 rounded-xl transition-all whitespace-nowrap"
              >
                RETRACT CLUE
              </button>
            );
          }
        } else if (currentClue.hint && !currentClue.contactedBy) {
          return (
            <button 
              type="button"
              onClick={() => setActiveAction(activeAction === 'CONTACT' ? null : 'CONTACT')}
              className={`${activeAction === 'CONTACT' ? 'bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white font-black px-6 rounded-xl transition-all whitespace-nowrap animate-pulse`}
            >
              {activeAction === 'CONTACT' ? 'CANCEL' : 'CONTACT!'}
            </button>
          );
        }
      }
    }

    // 4. VICTORY COUNTDOWN
    if (status === 'victory_countdown' && !isWordmaster) {
      return (
        <button 
          type="button"
          onClick={() => socket.emit('contest_victory', { roomId: room.id })}
          className="bg-red-600 hover:bg-red-700 text-white font-black px-6 rounded-xl transition-all animate-bounce whitespace-nowrap"
        >
          CONTEST!
        </button>
      );
    }

    return <div className="bg-gray-800 text-gray-500 font-black px-6 flex items-center rounded-xl whitespace-nowrap uppercase tracking-tighter">Chat Mode</div>;
  };

  const getLogStyle = (type) => {
    switch (type) {
      case 'Contact': return 'text-blue-400 font-bold';
      case 'Deny': return 'text-red-400 font-bold';
      case 'Success': return 'text-green-400 font-bold';
      case 'Victory': return 'text-yellow-400 font-black uppercase tracking-wider';
      case 'Failure': return 'text-orange-400 italic';
      default: return 'text-purple-400 italic';
    }
  };

  return (
    <div className="p-2 sm:p-4 flex flex-col space-y-2 sm:space-y-4 max-w-5xl mx-auto w-full">
      {/* Chat History */}
      <div className="bg-black/20 rounded-xl sm:rounded-2xl p-2 sm:p-4">
        <div className="h-32 sm:h-48 overflow-y-auto space-y-1.5 mb-1 sm:mb-2 custom-scrollbar pr-2">
          {allMessages.map((msg, i) => (
            <div key={i} className="text-xs sm:text-sm">
              {msg.isLog ? (
                <div className={`py-0.5 px-2 bg-gray-800/30 rounded border-l-2 ${msg.isPrivate ? 'border-dashed opacity-80' : ''} ${getLogStyle(msg.logType).includes('blue') ? 'border-blue-500' : getLogStyle(msg.logType).includes('red') ? 'border-red-500' : 'border-purple-500'}`}>
                  <span className={getLogStyle(msg.logType)}>
                    {msg.isPrivate && <span className="text-[10px] uppercase mr-2 opacity-50">[Private]</span>}
                    {msg.message}
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline space-x-2">
                  <span className="font-black text-blue-400 shrink-0 uppercase text-[10px] sm:text-xs tracking-tighter">{msg.username}</span>
                  <span className="text-gray-300 break-words">{msg.message}</span>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Unified Input Bar */}
      <form onSubmit={handleSubmit} className="flex space-x-2 sm:space-x-3 h-12 sm:h-14">
        {renderActionButton()}
        <input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={getPlaceholder()}
          className={`flex-1 bg-gray-800 border-2 rounded-lg sm:rounded-xl px-3 sm:px-6 py-1 sm:py-2 text-sm sm:text-base text-white focus:outline-none focus:ring-2 sm:focus:ring-4 transition-all font-bold 
            ${activeAction === 'SECRET' || activeAction === 'GUESS' ? 'border-purple-500 focus:ring-purple-900/30' : 
              activeAction === 'CLUE' ? 'border-blue-500 focus:ring-blue-900/30' : 
              activeAction === 'CONTACT' ? 'border-green-500 focus:ring-green-900/30' : 
              activeAction === 'DENY' ? 'border-red-500 focus:ring-red-900/30' : 
              'border-gray-700 focus:ring-blue-500/30'}`}
          autoFocus
        />
      </form>
    </div>
  );
}

export default BottomInput;
