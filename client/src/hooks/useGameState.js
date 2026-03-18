import { useState, useEffect } from 'react';

export function useGameState(room, socketId, isWordmaster) {
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    const { status, currentClue } = room;
    
    // 1. MANDATORY states (User is forced into these modes)
    if (status === 'setting_word' && isWordmaster) {
      setActiveAction('SECRET');
      return;
    }
    if (status === 'playing' && currentClue?.player === socketId && !currentClue.hint) {
      setActiveAction('CLUE');
      return;
    }

    // 2. AUTO-CLEAR (If user was in an optional mode that is no longer valid)
    const isValid = (
      (activeAction === 'DENY' && currentClue && isWordmaster) ||
      (activeAction === 'GUESS' && !currentClue && !isWordmaster) ||
      (activeAction === 'CONTACT' && currentClue?.hint && !currentClue.contactedBy && !isWordmaster && currentClue.player !== socketId) ||
      (activeAction === 'SECRET' && status === 'setting_word' && isWordmaster) ||
      (activeAction === 'CLUE' && currentClue?.player === socketId && !currentClue.hint)
    );

    if (activeAction && !isValid) {
      setActiveAction(null);
    }
  }, [room, socketId, isWordmaster, activeAction]);

  const toggleAction = (action) => {
    setActiveAction(prev => prev === action ? null : action);
  };

  return { activeAction, setActiveAction, toggleAction };
}
