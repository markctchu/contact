import { EVENTS } from '../constants';
import { socket } from '../socket';

function ActionToggleButton({ room, socketId, isWordmaster, activeAction, onToggleAction, onCancel }) {
  const { status, currentClue } = room;

  // 1. END OF GAME / LOBBY
  if (status === 'game_over' || status === 'waiting') {
    return (
      <button 
        type="button"
        onClick={() => socket.emit(EVENTS.BECOME_WORDMASTER)}
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
            onClick={() => socket.emit(EVENTS.DECLARE_VICTORY)}
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-black px-6 rounded-xl transition-all whitespace-nowrap"
          >
            DECLARE VICTORY
          </button>
        );
      }
      return (
        <button 
          type="button"
          onClick={() => onToggleAction('DENY')}
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
            onClick={() => onToggleAction('GUESS')}
            className={`${activeAction === 'GUESS' ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black px-6 rounded-xl transition-all whitespace-nowrap`}
          >
            {activeAction === 'GUESS' ? 'CANCEL' : 'GUESS'}
          </button>
        );
      } else if (currentClue.player === socketId) {
        if (!currentClue.hint) {
          return (
            <button 
              type="button"
              onClick={onCancel}
              className="bg-gray-700 text-white font-black px-6 rounded-xl transition-all whitespace-nowrap"
            >
              CANCEL CLUE
            </button>
          );
        } else if (!currentClue.contactedBy) {
          return (
            <button 
              type="button"
              onClick={onCancel}
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
            onClick={() => onToggleAction('CONTACT')}
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
        onClick={() => socket.emit(EVENTS.CONTEST_VICTORY)}
        className="bg-red-600 hover:bg-red-700 text-white font-black px-6 rounded-xl transition-all animate-bounce whitespace-nowrap"
      >
        CONTEST!
      </button>
    );
  }

  return <div className="bg-gray-800 text-gray-500 font-black px-6 flex items-center rounded-xl whitespace-nowrap uppercase tracking-tighter">Chat Mode</div>;
}

export default ActionToggleButton;
