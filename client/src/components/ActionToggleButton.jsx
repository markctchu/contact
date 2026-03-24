import { EVENTS } from '../constants';
import { socket } from '../socket';
import { useGame } from '../contexts/GameContext';
import { STRINGS } from '../constants/strings';

function ActionToggleButton({ onToggleAction, onCancel }) {
  const { room, socketId, isWordmaster, activeAction } = useGame();
  const { status, currentGuess } = room;

  // 1. END OF GAME / LOBBY
  if (status === 'game_over' || status === 'waiting') {
    return (
      <button 
        type="button"
        onClick={() => socket.emit(EVENTS.BECOME_WORDMASTER)}
        className="text-primary font-black transition-all active:scale-95 whitespace-nowrap uppercase tracking-widest text-xs sm:text-sm focus:outline-none"
      >
        👑 {STRINGS.ACTION_WM}
      </button>
    );
  }

  // 2. SETTING WORD (Wordmaster) - Optional/Cancellable
  if (status === 'setting_word' && isWordmaster) {
    return (
      <button 
        type="button"
        onClick={onCancel}
        className="text-primary font-black transition-all whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest focus:outline-none"
      >
        {STRINGS.ACTION_CANCEL}
      </button>
    );
  }

  // 3. PLAYING
  if (status === 'playing') {
    if (isWordmaster) {
      if (!currentGuess.player) {
        return (
          <button 
            type="button"
            onClick={() => socket.emit(EVENTS.DECLARE_VICTORY)}
            className="text-primary font-black transition-all active:scale-95 whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest focus:outline-none"
          >
            🏆 {STRINGS.ACTION_DECLARE}
          </button>
        );
      }
      return (
        <button 
          type="button"
          onClick={() => onToggleAction('DENY')}
          className="text-primary font-black transition-all whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest focus:outline-none"
        >
          {activeAction === 'DENY' ? STRINGS.ACTION_CANCEL : `✋ ${STRINGS.ACTION_DENY}`}
        </button>
      );
    } else {
      // Player
      if (!currentGuess.player) {
        return (
          <button 
            type="button"
            onClick={() => onToggleAction('GUESS')}
            className="text-primary font-black transition-all whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest focus:outline-none"
          >
            {activeAction === 'GUESS' ? STRINGS.ACTION_CANCEL : `🎯 ${STRINGS.ACTION_GUESS}`}
          </button>
        );
      } else if (currentGuess.player === socketId) {
        if (!currentGuess.clue) {
          return (
            <button 
              type="button"
              onClick={onCancel}
              className="text-primary font-black transition-all whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest focus:outline-none"
            >
              {STRINGS.ACTION_CANCEL}
            </button>
          );
        } else if (!currentGuess.contactedBy) {
          return (
            <button 
              type="button"
              onClick={onCancel}
              className="text-primary font-black transition-all whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest focus:outline-none"
            >
              {STRINGS.ACTION_RETRACT}
            </button>
          );
        }
      } else if (currentGuess.clue && !currentGuess.contactedBy) {
        return (
          <button 
            type="button"
            onClick={() => onToggleAction('CONTACT')}
            className="text-primary font-black transition-all whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest focus:outline-none"
          >
            {activeAction === 'CONTACT' ? STRINGS.ACTION_CANCEL : `💡 ${STRINGS.ACTION_CONTACT}`}
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
        className="text-primary font-black transition-all animate-bounce whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest focus:outline-none"
      >
        ☝️ {STRINGS.ACTION_CONTEST}
      </button>
    );
  }

  return <div className="text-primary opacity-30 font-black flex items-center whitespace-nowrap uppercase tracking-widest text-[10px] sm:text-xs">{STRINGS.ACTION_CHAT}</div>;
}

export default ActionToggleButton;
