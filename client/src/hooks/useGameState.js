import { useState, useEffect } from 'react';

export function useGameState(room, socketId, isWordmaster) {
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    const { status, currentGuess } = room;

    // 1. MANDATORY states (User is forced into these modes)
    if (status === 'setting_word' && isWordmaster) {
      if (activeAction !== 'SECRET') setActiveAction('SECRET');
      return;
    }
    if (status === 'playing' && currentGuess?.player === socketId && !currentGuess.clue) {
      if (activeAction !== 'GUESS_CLUE') setActiveAction('GUESS_CLUE');
      return;
    }

    // 2. AUTO-CLEAR (If user was in an optional mode that is no longer valid)
    // Also clear if status shifted away from mandatory modes
    const isValid = (
      (activeAction === 'DENY' && currentGuess.player && isWordmaster) ||
      (activeAction === 'GUESS' && !currentGuess.player && !isWordmaster) ||
      (activeAction === 'CONTACT' && currentGuess.clue && !currentGuess.contactedBy && !isWordmaster && currentGuess.player !== socketId) ||
      (activeAction === 'SECRET' && status === 'setting_word' && isWordmaster) ||
      (activeAction === 'GUESS_CLUE' && currentGuess.player === socketId && !currentGuess.clue)
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
