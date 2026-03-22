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
        className="cta-gradient text-on-primary-container font-black px-6 rounded-full transition-all active:scale-95 whitespace-nowrap uppercase tracking-widest text-xs sm:text-sm shadow-md"
      >
        Wordmaster
      </button>
    );
  }

  // 2. SETTING WORD (Wordmaster) - Optional/Cancellable
  if (status === 'setting_word' && isWordmaster) {
    return (
      <button 
        type="button"
        onClick={onCancel}
        className="bg-on-surface/5 hover:bg-on-surface/10 text-on-surface font-black px-6 rounded-full transition-all whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest"
      >
        Relinquish
      </button>
    );
  }

  // 3. PLAYING
  if (status === 'playing') {
    if (isWordmaster) {
      if (!currentClue) {
        return (
          <button 
            type="button"
            onClick={() => socket.emit(EVENTS.DECLARE_VICTORY)}
            className="cta-gradient text-on-primary-container font-black px-6 rounded-full transition-all active:scale-95 whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest shadow-md"
          >
            Declare Victory
          </button>
        );
      }
      return (
        <button 
          type="button"
          onClick={() => onToggleAction('DENY')}
          className={`${activeAction === 'DENY' ? 'bg-tertiary text-white shadow-lg' : 'bg-on-surface/5 text-on-surface'} font-black px-6 rounded-full transition-all whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest`}
        >
          {activeAction === 'DENY' ? 'Cancel' : 'Deny'}
        </button>
      );
    } else {
      // Player
      if (!currentClue) {
        return (
          <button 
            type="button"
            onClick={() => onToggleAction('GUESS')}
            className={`${activeAction === 'GUESS' ? 'bg-tertiary text-white shadow-lg' : 'bg-on-surface/5 text-on-surface'} font-black px-6 rounded-full transition-all whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest`}
          >
            {activeAction === 'GUESS' ? 'Cancel' : 'Guess'}
          </button>
        );
      } else if (currentClue.player === socketId) {
        if (!currentClue.hint) {
          return (
            <button 
              type="button"
              onClick={onCancel}
              className="bg-on-surface/5 text-on-surface font-black px-6 rounded-full transition-all whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
          );
        } else if (!currentClue.contactedBy) {
          return (
            <button 
              type="button"
              onClick={onCancel}
              className="bg-tertiary/10 text-tertiary font-black px-6 rounded-full transition-all whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest"
            >
              Retract
            </button>
          );
        }
      } else if (currentClue.hint && !currentClue.contactedBy) {
        return (
          <button 
            type="button"
            onClick={() => onToggleAction('CONTACT')}
            className={`${activeAction === 'CONTACT' ? 'bg-tertiary text-white shadow-lg' : 'bg-on-surface/5 text-on-surface'} font-black px-6 rounded-full transition-all whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest`}
          >
            {activeAction === 'CONTACT' ? 'Cancel' : 'Contact!'}
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
        className="bg-tertiary text-white font-black px-6 rounded-full transition-all animate-bounce whitespace-nowrap text-xs sm:text-sm uppercase tracking-widest shadow-xl"
      >
        Contest
      </button>
    );
  }

  return <div className="bg-on-surface/5 text-on-surface/20 font-black px-6 flex items-center rounded-full whitespace-nowrap uppercase tracking-widest text-[10px] sm:text-xs">Dialogue</div>;
}

export default ActionToggleButton;
