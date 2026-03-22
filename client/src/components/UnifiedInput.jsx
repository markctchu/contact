import { EVENTS } from '../constants';
import { socket } from '../socket';

function UnifiedInput({ activeAction, inputValue, setInputValue, onClearAction }) {
  
  const getPlaceholder = () => {
    switch (activeAction) {
      case 'SECRET': return "Enter your secret word...";
      case 'GUESS': return "What word are you thinking of?";
      case 'CLUE': return "Give a public hint for your word...";
      case 'CONTACT': return "What word is it?";
      case 'DENY': return "Is it...";
      default: return "Send a chat message...";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val && !activeAction) return;

    if (activeAction === 'SECRET') {
      socket.emit(EVENTS.SET_SECRET_WORD, { word: val });
    } else if (activeAction === 'GUESS') {
      socket.emit(EVENTS.SUBMIT_CLUE_WORD, { word: val });
    } else if (activeAction === 'CLUE') {
      socket.emit(EVENTS.SUBMIT_CLUE_HINT, { hint: val });
    } else if (activeAction === 'CONTACT') {
      socket.emit(EVENTS.CALL_CONTACT, { guess: val });
    } else if (activeAction === 'DENY') {
      socket.emit(EVENTS.DENY_CLUE, { guess: val });
    } else if (val) {
      socket.emit(EVENTS.CHAT_MESSAGE, { message: val });
    }

    setInputValue('');
    if (['CONTACT', 'GUESS', 'DENY'].includes(activeAction)) {
      onClearAction();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex h-full" autoComplete="off">
      <input 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={getPlaceholder()}
        name={`game_input_${Math.random().toString(36).substring(7)}`}
        id="game_input_field"
        autoComplete="off"
        data-form-type="other"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        inputMode="text"
        enterKeyHint="send"
        className={`flex-1 bg-gray-800 border-2 rounded-lg sm:rounded-xl px-3 sm:px-6 py-1 sm:py-2 text-sm sm:text-base text-white focus:outline-none focus:ring-2 sm:focus:ring-4 transition-all font-bold 
          ${activeAction === 'SECRET' || activeAction === 'GUESS' ? 'border-purple-500 focus:ring-purple-900/30' : 
            activeAction === 'CLUE' ? 'border-blue-500 focus:ring-blue-900/30' : 
            activeAction === 'CONTACT' ? 'border-green-500 focus:ring-green-900/30' : 
            activeAction === 'DENY' ? 'border-red-500 focus:ring-red-900/30' : 
            'border-gray-700 focus:ring-blue-500/30'}`}
        autoFocus
      />
    </form>
  );
}

export default UnifiedInput;
